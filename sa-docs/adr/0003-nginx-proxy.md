# ADR-0003: Nginx 反向代理隱藏中台真實位址

- **狀態**: Accepted
- **日期**: 2026-04-19
- **決策者**: Shane (SA / 開發者)

## Context — 我們在解決什麼問題?

中台 (Middle Platform / 內部稱 HWS) 部署在公司內網,真實位址可能是:

- 內網 IP `192.168.3.5`
- 不對外的 internal domain
- VPN-only 的 hostname

EDM Frontend 的 SSO 流程需要呼叫中台的 `/api/edm/sso/verify-token`,**如果直接 cross-origin 呼叫**,會遇到:

1. **資安問題**:瀏覽器 F12 → Network 可看到中台真實位址,**內網拓樸完全外洩**
2. **CORS 問題**:中台不會幫每個業務系統開 CORS,容易踩 preflight 牆
3. **網路問題**:UAT 環境的 EDM 容器若沒有外網 / VPN 權限,但內網能通,直接打外網位址會失敗

業界三個典型解法:

- 中台 CORS 開放 + 直接 cross-origin
- 同 domain 部署(把中台跟 EDM 放同 host)
- 反向代理(EDM 自己的 nginx 把流量轉到中台)

## Decision — 我們選了什麼?

**Nginx 反向代理 — EDM 內 nginx 把 `/api-sso/*` 流量轉到中台**:

- 前端永遠只呼叫 EDM 自己的 `/api-sso/edm/sso/verify-token`
- nginx 在伺服器內部 `proxy_pass http://192.168.3.5/`(中台真實位址)
- 瀏覽器 F12 看到的永遠是 EDM 的網域

```nginx
location /api-sso/ {
    proxy_pass http://192.168.3.5/;     # ← 中台真實位址,只有伺服器知道
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Considered Options — 還評估過哪些?

### 選項 1 — 直接 cross-origin 呼叫中台

- ✅ 最簡單,前端直接打中台 URL
- ❌ 中台真實位址 / 內網結構完全曝光
- ❌ 需要中台幫每個業務 frontend 開 CORS 白名單
- ❌ UAT 內網場景無法跨網段

### 選項 2 — 同 domain 部署(把中台跟 EDM 放同 host)

- ✅ 同 origin,沒有 CORS / 隱身問題
- ❌ 部署綁死 — 中台跟 EDM 必須一起部署、一起升級
- ❌ 違反「中台是獨立基礎建設」的設計原則

### 選項 3 — Nginx 反向代理 【選中】

- ✅ 對外完全隱藏中台真實位址
- ✅ 不需要中台配合(不必開 CORS)
- ✅ 內網位址支援(EDM 容器只要能訪問內網即可)
- ✅ 可加 rate limit / cache / log 在代理層
- ⚠ 多一層,debug 流程要多看一份 log
- ⚠ 中台位址 hardcode 在 nginx.conf 裡,換環境要改 conf 重 build

## Consequences — 這個決定帶來什麼?

### ✅ 正面

- **資安**:瀏覽器 F12 看不到中台真實位址,內網拓樸不外洩
- **解耦**:中台跟 EDM 可以獨立部署 / 升級
- **跨網段**:UAT / Prod 內網場景都能用
- **集中控制**:rate limit、TLS、log 可以統一在 nginx 處理

### ⚠ 負面 / Trade-off

- **多一跳網路**:Browser → EDM nginx → 中台。實際上 nginx 在同一台 host,延遲幾乎可忽略
- **中台位址 hardcode**:換環境要改 nginx.conf 重 build image。緩解:
  - 用 `envsubst` 在 container 啟動時注入 env var
  - 或用 Docker Compose 的 `image` + 環境變數
- **Debug 麻煩**:錯誤可能在 EDM nginx、proxy 環節、或中台,要看三份 log

### 🔁 後續追蹤

- nginx.conf 改成從環境變數讀中台位址,讓同個 image 跨環境複用
- 評估在 nginx 加上 `/api-sso/*` 的 rate limit(防誤觸發大量驗證)
- 監控 nginx 的 504 / 502,通常是中台不可達

## References

- Code:
  - [`scripts/deploy/nginx.conf`](../../scripts/deploy/nginx.conf) — nginx 設定(EDM repo 內)
  - [`docker-compose.yml`](../../docker-compose.yml) — `extra_hosts: host.docker.internal:host-gateway`
- 文件:
  - [`sa-docs/api-integration.md` 第 4 節](../api-integration.md#4-sso-隱身代理)
  - [`sa-docs/architecture.md` 第 7 節](../architecture.md#7-sso-隱身代理細節)
  - [`sa-docs/deployment.md` 第 7 節](../deployment.md#7-nginx-設定要點)
- 外部:
  - [Nginx Reverse Proxy 文件](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
  - [OWASP: Reverse Proxy security benefits](https://owasp.org/) (一般概念)
