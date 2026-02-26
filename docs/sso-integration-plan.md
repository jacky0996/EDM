# Laravel (HWS) 與 Vue (EDM) 跨系統身份驗證同步計畫 (SSO)

為了達成「一套系統登入後，其他子系統同步登入」的目標（Single Sign-On, SSO），我們需要根據兩套系統的部署環境（是否同網域）來選擇對應的策略。

## 方案一：共享 Domain Cookie 模式 (最簡單、效能最高)
**適用場景**：兩套系統部署在同一個頂級網域下（例如：`hws.example.com` 與 `edm.example.com`）。

### 實作原理
1. **共享 Cookie**：Laravel (HWS) 登入成功後，將 Token 或 Session ID 寫入 Domain 為 `.example.com` 的 Cookie。
2. **自動攜帶**：當瀏覽器請求 EDM 的 API 時，會自動帶上該 Cookie。
3. **後端驗證**：EDM 的後端直接校驗該 Cookie 的合法性（通常是解析 JWT 或讀取共享的 Redis Session）。

### 優點
- 開發成本低。
- 使用者體驗最無感，切換頁面不需要重新導向。

---

## 方案二：OAuth2 / OIDC 模式 (標準做法、最安全、具擴充性)
**適用場景**：跨網域，或者未來打算發展成「平台化」，接入更多第三方系統。

### 實作流程 (Authorization Code Flow with PKCE)
1. **登入請求**：使用者訪問 EDM，點擊登入後，EDM 重導向至 HWS 的登入頁。
2. **身份辨認**：使用者在 HWS 登入。
3. **授權回傳**：HWS 驗證成功後，帶一個 `code` 重導向回 EDM 的 Callback 頁面。
4. **交換 Token**：EDM 的前端（或後端）拿到 `code` 後，向 HWS 換取 `access_token` 與 `user_info`。
5. **建立狀態**：EDM 將 token 存入 `localStorage`，完成登入。

### HWS (Laravel) 需要準備
- 安裝 **Laravel Passport** (OAuth2 Server) 或輕量級的 **Laravel Sanctum** 改裝版。
- 提供 `/oauth/authorize` 與 `/oauth/token` 接口。

---

## 方案三：前端 Token 傳遞模式 (手動同步)
**適用場景**：HWS 與 EDM 有父子視窗關係（如 Iframe）或從 HWS 跳轉至 EDM。

### 實作原理
1. HWS 在跳轉至 EDM 的 URL 中攜帶一個短期有效的 `one_time_token`。
2. EDM 接收到 URL 參數後，拿這個 token 向 HWS 驗證身份。
3. 驗證成功後，HWS 回傳真正的 `access_token` 給 EDM。

---

## 💡 推薦步規劃 (對應本週進度)
考慮到您下週要與 HWS 合併，我建議採取的計畫為：

1. **確定 IDP (身分提供者)**：統一以 **Laravel (HWS)** 為帳號密碼與權限的唯一來源。
2. **後端連動**：
   - EDM 的 API 後端增加一個 Middleware。
   - 該 Middleware 接收到請求後，會透過去遠端呼叫 HWS 的「Token 檢核 API」來確認使用者身份。
3. **前端攔截**：
   - 優化 `src/api/request.ts`。
   - 當 EDM 發現 token 過期或 401 時，統一跳轉到 HWS 的登入中心。

## 🔒 資訊安全考量
- **統一登出**：當 HWS 登出時，需有機制通知所有子系統（EDM）清除本地 Token（通常透過 Backchannel Logout 或縮短 Token 效期）。
- **CORS 設定**：需調整 Laravel 的 CORS 配置，允許 EDM 網域的帶認證請求。

您希望針對哪一個具體方案（同網域共享或跨網域 OIDC）深入細節嗎？
