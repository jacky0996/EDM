#!/bin/sh
# Cloud Run 啟動腳本:
#   1. 從 EDM_BACKEND_URL / SSO_URL 推出 Host header(proxy_pass 用)
#   2. envsubst 把模板裡的 ${PORT} / ${EDM_BACKEND_URL} 等替換成實際值
#   3. exec nginx
#
# 必填 Cloud Run env vars(若沒設,nginx 會 listen 但 proxy_pass 會壞):
#   EDM_BACKEND_URL  例如 https://edm-backend-xxxxx.asia-east1.run.app
#   SSO_URL          例如 https://middleplatform-935001510934.asia-east1.run.app

set -e

PORT="${PORT:-8080}"

if [ -z "$EDM_BACKEND_URL" ]; then
  echo "[entrypoint] WARN: EDM_BACKEND_URL not set, /api/ will fail"
  EDM_BACKEND_URL="http://localhost:0"
fi
if [ -z "$SSO_URL" ]; then
  echo "[entrypoint] WARN: SSO_URL not set, /api-sso/ will fail"
  SSO_URL="http://localhost:0"
fi

# 從 URL 取 host(scheme://host[/path] → host)
EDM_BACKEND_HOST=$(echo "$EDM_BACKEND_URL" | sed -E 's|https?://||; s|/.*$||')
SSO_HOST=$(echo "$SSO_URL" | sed -E 's|https?://||; s|/.*$||')

export PORT EDM_BACKEND_URL EDM_BACKEND_HOST SSO_URL SSO_HOST

echo "[entrypoint] PORT=$PORT"
echo "[entrypoint] EDM_BACKEND_URL=$EDM_BACKEND_URL (host=$EDM_BACKEND_HOST)"
echo "[entrypoint] SSO_URL=$SSO_URL (host=$SSO_HOST)"

envsubst '${PORT} ${EDM_BACKEND_URL} ${EDM_BACKEND_HOST} ${SSO_URL} ${SSO_HOST}' \
  < /etc/nginx/templates/nginx.cloudrun.conf.template \
  > /etc/nginx/nginx.conf

echo "[entrypoint] Starting nginx..."
exec nginx -g 'daemon off;'
