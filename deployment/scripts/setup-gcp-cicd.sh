#!/usr/bin/env bash
#
# One-time GCP setup for keyless GitHub Actions CI/CD.
# Run LOCALLY with an owner/editor account:  gcloud auth login
#
#   bash deployment/scripts/setup-gcp-cicd.sh
#
# Creates: deployer service account, Workload Identity Federation pool+provider
# (so GitHub authenticates with no JSON key), and all IAM grants needed to push
# images, SSH the VM (OS Login), and let the VM pull from Artifact Registry.
# At the end it prints the two GitHub secret values to set.
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
PROJECT_ID="resume-builder-500417"
REGION="asia-southeast1"
GITHUB_REPO="DangTinh040203/resume-builder"   # owner/repo
VM_NAME="resume-builder-vm"
VM_ZONE="asia-southeast1-c"

SA_NAME="github-deployer"
POOL_ID="github-pool"
PROVIDER_ID="github-provider"
# ──────────────────────────────────────────────────────────────────────────────

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "▶ Using project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID" >/dev/null

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
echo "  project number: $PROJECT_NUMBER"

echo "▶ Enabling required APIs…"
gcloud services enable \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com

# ─── 1. Deployer service account ──────────────────────────────────────────────
if ! gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  echo "▶ Creating service account $SA_EMAIL…"
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions deployer"
else
  echo "▶ Service account $SA_EMAIL already exists."
fi

# IAM is eventually consistent — a freshly created SA may not be visible to
# add-iam-policy-binding for a few seconds. Poll until it resolves.
echo "▶ Waiting for the SA to propagate…"
for i in $(seq 1 30); do
  if gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "▶ Granting roles to deployer SA…"
for ROLE in \
  roles/artifactregistry.writer \
  roles/compute.instanceAdmin.v1 \
  roles/compute.osAdminLogin \
  roles/iap.tunnelResourceAccessor; do
  # Retry to ride out residual IAM propagation lag.
  for attempt in 1 2 3 4 5; do
    if gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SA_EMAIL}" \
        --role="$ROLE" --condition=None >/dev/null 2>&1; then
      break
    fi
    echo "  retry $ROLE ($attempt)…"; sleep 5
  done
done

# gcloud compute ssh impersonates the VM's own service account → needs actAs.
VM_SA="$(gcloud compute instances describe "$VM_NAME" --zone "$VM_ZONE" \
  --format='value(serviceAccounts[0].email)')"
if [[ -n "${VM_SA:-}" ]]; then
  echo "  VM service account: $VM_SA"
  gcloud iam service-accounts add-iam-policy-binding "$VM_SA" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser" >/dev/null

  echo "▶ Granting the VM SA read access to Artifact Registry (keyless pull)…"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${VM_SA}" \
    --role="roles/artifactregistry.reader" --condition=None >/dev/null
else
  echo "⚠ VM has no attached service account — give it one so it can pull images."
fi

echo "▶ Enabling OS Login on the VM…"
gcloud compute instances add-metadata "$VM_NAME" --zone "$VM_ZONE" \
  --metadata enable-oslogin=TRUE >/dev/null

# ─── 2. Workload Identity Federation ──────────────────────────────────────────
if ! gcloud iam workload-identity-pools describe "$POOL_ID" \
      --location=global >/dev/null 2>&1; then
  echo "▶ Creating Workload Identity Pool $POOL_ID…"
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --location=global --display-name="GitHub Actions pool"
else
  echo "▶ Pool $POOL_ID already exists."
fi

if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
      --location=global --workload-identity-pool="$POOL_ID" >/dev/null 2>&1; then
  echo "▶ Creating OIDC provider $PROVIDER_ID…"
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --location=global \
    --workload-identity-pool="$POOL_ID" \
    --display-name="GitHub provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="assertion.repository=='${GITHUB_REPO}'"
else
  echo "▶ Provider $PROVIDER_ID already exists."
fi

# Allow only this repo to impersonate the deployer SA.
echo "▶ Binding repo ${GITHUB_REPO} → deployer SA…"
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_REPO}" >/dev/null

PROVIDER_RESOURCE="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

cat <<EOF

────────────────────────────────────────────────────────────────────────────
✅ Done. Add these GitHub repository secrets
   (Settings → Secrets and variables → Actions):

  GCP_WORKLOAD_IDENTITY_PROVIDER
    ${PROVIDER_RESOURCE}

  GCP_SERVICE_ACCOUNT
    ${SA_EMAIL}

Quick set via gh CLI:
  gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER -b "${PROVIDER_RESOURCE}"
  gh secret set GCP_SERVICE_ACCOUNT            -b "${SA_EMAIL}"
────────────────────────────────────────────────────────────────────────────
EOF
