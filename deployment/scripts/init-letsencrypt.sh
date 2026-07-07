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

echo "▶ Writing recommended TLS options (once)…"
# Inlined (certbot's raw GitHub path 404s now). Mozilla intermediate profile.
[[ -f "${LE_DIR}/options-ssl-nginx.conf" ]] || sudo tee "${LE_DIR}/options-ssl-nginx.conf" >/dev/null <<'SSLOPTS'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;

ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
SSLOPTS
[[ -f "${LE_DIR}/ssl-dhparams.pem" ]] || sudo openssl dhparam -out "${LE_DIR}/ssl-dhparams.pem" 2048

echo "▶ Creating a dummy certificate for ${PRIMARY} so nginx can boot…"
LIVE="${LE_DIR}/live/${PRIMARY}"
sudo mkdir -p "$LIVE"
sudo openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout "${LIVE}/privkey.pem" \
  -out "${LIVE}/fullchain.pem" \
  -subj "/CN=${PRIMARY}" >/dev/null 2>&1

echo "▶ Starting nginx with the dummy cert…"
# --no-deps: be/fe are already running; without it compose tries to (re)create
# them and needs IMAGE_TAG (only set by the deploy workflow).
$COMPOSE up -d --no-deps nginx

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
