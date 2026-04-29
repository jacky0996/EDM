# ADR-0002: JWT 儲存採 Pinia + localStorage 雙層

- **狀態**: Accepted
- **日期**: 2026-04-19
- **決策者**: Shane (SA / 開發者)

## Context — 我們在解決什麼問題?

中台簽出 JWT 後,EDM Frontend 需要把它**存起來**並**塞進每個 API request**。儲存位置決定:

1. **Refresh / 重開 tab 後是否還在?**(影響 UX)
2. **XSS 攻擊時會不會被偷?**(影響資安)
3. **第三方 script 能不能讀?**(影響資安)

業界選項通常是這幾個:

- 純 memory(Pinia / 變數)
- localStorage / sessionStorage
- httpOnly cookie
- 上述組合

每個選項都有**經典的安全 vs UX trade-off**,沒有絕對對錯。

## Decision — 我們選了什麼?

**Pinia(memory)+ localStorage(持久層)雙層儲存**:

- **Pinia**:當前 session 的 reactive state,所有 composable / view 從這裡讀
- **localStorage**:啟動時讀取一次寫進 Pinia;有寫入時同步 update,確保 refresh / 重開 tab 後 state 不掉
- **`Authorization: Bearer <token>`** 由 axios interceptor 自動注入

## Considered Options — 還評估過哪些?

### 選項 1 — 純 Pinia(memory only)

- ✅ Refresh 即清,XSS 偷不到太久
- ❌ Refresh / 重開 tab → 立即跳回中台重登,**UX 很差**
- ❌ 多 tab 之間 state 不同步

### 選項 2 — Pinia + localStorage 【選中】

- ✅ Refresh / 重開 tab 後仍在登入狀態
- ✅ 多 tab 自動共用(都讀同一個 localStorage)
- ✅ 程式簡單,Pinia 有 `pinia-plugin-persistedstate` 插件,幾行設定搞定
- ⚠ **XSS 攻擊可以讀 localStorage**(這是主要風險)

### 選項 3 — sessionStorage

- ✅ 只在當前 tab 有效,其他 tab / 重開 = 重登
- ⚠ XSS 一樣可讀
- ❌ 多 tab 體驗差(每個 tab 都要重登)

### 選項 4 — httpOnly Cookie

- ✅ JS 完全讀不到,XSS 偷不走
- ✅ Browser 自動帶到每個 request
- ❌ **CSRF 風險**(攻擊者誘使你的 browser 帶 cookie 去打)
- ❌ 跨域 cookie 設定麻煩(SameSite、Secure、Domain)
- ❌ 需要後端配合(中台簽 cookie 而非回 JSON token)
- ❌ **無法跨 origin**(中台跟 EDM 不同 domain 時很難)

### 選項 5 — Cookie + CSRF Token

業界比較完整的安全方案,但需要:

- 後端發 CSRF token
- 前端在 header 帶 CSRF token
- 中台改成發 cookie

對作品集場景過重,Roadmap 等業務量大再評估。

## Consequences — 這個決定帶來什麼?

### ✅ 正面

- **UX 簡單**:登入一次,只要 token 沒過期,refresh / 重開 tab 都還在
- **多 tab 一致**:你開五個分頁都不會被踢
- **實作成本低**:Pinia + persisted plugin,後端不用配合任何改變
- **跨 origin 友好**:走 `Authorization` header,不受 SameSite cookie 限制

### ⚠ 負面 / Trade-off

- **XSS 漏洞會直接洩 token**:這是這個方案最大的風險。緩解措施:
  - 嚴格的 CSP (Content Security Policy):限制可執行的 script source
  - **不渲染未消毒的 HTML**(尤其是 user content),用 v-text / `{{ }}` 而非 v-html
  - 第三方 SDK / script 嚴格 review
  - CKEditor 寫入的 HTML 要進後端消毒(後端配合)
  - 短的 access token TTL(目前中台設 30 分鐘),即使被偷,影響時間有限

- **無法立即 invalidate**:登出時清 localStorage,但若有人複製 token 還能用到 TTL 過期。同樣靠短 TTL 緩解。

- **CSRF 不適用**:因為不走 cookie,所以不會有 CSRF。但這也是 trade-off:cookie 的「自動帶」便利性沒了,要靠 axios 自己注入。

### 🔁 後續追蹤

- 監控是否有 XSS 漏洞 report
- CKEditor / 富文字輸出統一走後端 sanitize
- Roadmap:評估 httpOnly cookie + CSRF token 升級(等中台支援)
- 如果改 SameSite=strict cookie 方案,需要中台與 EDM 同 domain(用 reverse proxy 拼成同 origin)

## References

- Code:
  - `apps/web-ele/src/store/auth.ts`(待確認檔名,Pinia store)
  - `apps/web-ele/src/api/request.ts` — Axios interceptor 注入 token
- 文件:
  - [`sa-docs/api-integration.md` 第 3 節](../api-integration.md#3-攔截器設計)
  - [`sa-docs/user-flow.md` 第 1 節](../user-flow.md#1-sso-進站流程activity-diagram)
- 外部:
  - [OWASP: HTML5 LocalStorage Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
  - [Auth0: JWT vs Cookie](https://auth0.com/blog/cookies-vs-tokens-definitive-guide/)
  - [Pinia Persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
