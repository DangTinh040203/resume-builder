#!/usr/bin/env bash
#
# One-time HTTPS bootstrap — run ON the VM, inside the deploy dir:
#
#   cd /opt/resume-builder && sudo bash nginx/../scripts/init-letsencrypt.sh
#   (or copy this script over and: sudo bash init-letsencrypt.sh)
#
# Solves the chicken-and-egg: nginx won't start without a cert, certbot can't
# issue one without nginx serving the HTTP-01 challenge. We drop a dummy cert so
# nginx boots, let certbot replace it with the real Let's Encrypt SAN cert, then
# reload nginx and install an auto-renew cron.
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
DEPLOY_DIR="/opt/resume-builder"
EMAIL="it@thebinaryholdings.com"
# First domain becomes the cert lineage name (live/<first-domain>/…) — must match
# the ssl_certificate paths in nginx/conf.d/*.conf.
DOMAINS=(cv-builder.site www.cv-builder.site api.cv-builder.site)
LE_DIR="/etc/letsencrypt"
WEBROOT_VOL="resume-builder_certbot_www"   # docker-compose project-prefixed named volume
                                           # (compose `name: resume-builder` + volume `certbot_www`)
STAGING=0                          # set to 1 to test against LE staging first
# ──────────────────────────────────────────────────────────────────────────────

cd "$DEPLOY_DIR"
PRIMARY="${DOMAINS[0]}"
COMPOSE="docker compose -f ${DEPLOY_DIR}/docker-compose.yml"

echo "▶ Fetching recommended TLS options (once)…"
[[ -f "${LE_DIR}/options-ssl-nginx.conf" ]] || curl -fsSL \
  https://raw.githubusercontent.com/certbot/certbot/main/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
  | sudo tee "${LE_DIR}/options-ssl-nginx.conf" >/dev/null
[[ -f "${LE_DIR}/ssl-dhparams.pem" ]] || sudo openssl dhparam -out "${LE_DIR}/ssl-dhparams.pem" 2048

echo "▶ Creating a dummy certificate for ${PRIMARY} so nginx can boot…"
LIVE="${LE_DIR}/live/${PRIMARY}"
sudo mkdir -p "$LIVE"
sudo openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout "${LIVE}/privkey.pem" \
  -out "${LIVE}/fullchain.pem" \
  -subj "/CN=${PRIMARY}" >/dev/null 2>&1

echo "▶ Starting nginx with the dummy cert…"
$COMPOSE up -d nginx

echo "▶ Deleting the dummy cert…"
sudo rm -rf "${LE_DIR}/live/${PRIMARY}" \
            "${LE_DIR}/archive/${PRIMARY}" \
            "${LE_DIR}/renewal/${PRIMARY}.conf"

# Build -d flags.
D_ARGS=(); for d in "${DOMAINS[@]}"; do D_ARGS+=(-d "$d"); done
STAGING_ARG=(); [[ "$STAGING" == "1" ]] && STAGING_ARG=(--staging)

echo "▶ Requesting the real Let's Encrypt certificate…"
sudo docker run --rm \
  -v "${LE_DIR}:/etc/letsencrypt" \
  -v "${WEBROOT_VOL}:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  "${STAGING_ARG[@]}" "${D_ARGS[@]}" \
  --email "$EMAIL" --agree-tos --no-eff-email --non-interactive

echo "▶ Reloading nginx with the real cert…"
$COMPOSE exec nginx nginx -s reload || $COMPOSE restart nginx

echo "▶ Installing twice-daily auto-renew cron…"
sudo tee /etc/cron.d/certbot-renew >/dev/null <<EOF
0 0,12 * * * root docker run --rm -v ${LE_DIR}:/etc/letsencrypt -v ${WEBROOT_VOL}:/var/www/certbot certbot/certbot renew --quiet && ${COMPOSE} exec nginx nginx -s reload
EOF

echo "✅ HTTPS ready for: ${DOMAINS[*]}"
