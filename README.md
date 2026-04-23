# EDM 營銷與成員管理系統 (EDM & Member Management System)

這是一個基於 **Vue 3** 與 **Vben Admin** 框架構建的現代化營銷與成員管理系統。旨在提供高效的群組管理、精確的人員數據維護以及靈活的營銷活動分析。

---

## 🚀 系統概述 (System Overview)

EDM 系統作為核心數據中心，負責管理大量的人員資料並將其分類至不同群組。系統支持大規模的 Excel 數據匯入、即時的狀態同步以及細粒度的通訊資料維護。目前專案正處於功能擴充期，未來將與 **中台系統** 進行深度整合，達成統一身份驗證 (SSO) 與測試環境同步。

---

## 🛠️ 技術架構 (Technical Stack)

- **前端框架**：Vue 3 (Composition API)
- **基礎架構**：[Vben Admin 5.0](https://github.com/vbenjs/vue-vben-admin) (高性能企業級管理後台，Monorepo 架構)
- **UI 組件庫**：Element Plus
- **程式語言**：TypeScript
- **開發工具**：pnpm, Vite, Turbo (Monorepo 管理)
- **整合功能**：
  - **VXE Table**：高效能的表格組件，用於處理大量成員數據。
  - **ExcelJS / xlsx**：強大的 Excel 讀寫能力，支持人員名單匯入。
  - **Vben Modal / Form**：統一的彈窗與表單開發範式。

---

## 📋 功能清單 (Feature Roadmap)

### ✅ 已開發功能 (Developed)

- **群組管理 (Group Management)**
  - 群組列表展示、分頁與檢索。
  - **即時狀態切換**：使用 `ElSwitch` 即時同步群組啟用/禁用狀態。
  - **詳情頁標籤化**：整合「人員列表」、「活動列表」與「分析報告」入口。
  - **快速新增**：彈窗式新增群組，包含名稱必填驗證與備註說明。
- **人員管理 (Member Management)**
  - **Excel 批次匯入**：專屬人員匯入模組，支持預選群組鎖定，防止歸類錯誤。
  - **通訊資料維護**：支援行動電話與電子郵件的非同步編輯（傳遞唯一 ID 進行精準更新）。
  - **狀態控制**：與群組一致的開關式狀態管理。
- **基礎建設**
  - 全系統 API 呼叫 Loading 狀態回饋。
  - 模組化目錄重構：遵循 `Feature-based` 結構 (`list/detail` 分離)，提升擴充性。

### 🗓️ 未開發 / 規劃中 (Upcoming)

- **活動系統 (Activity System)**：建立活動流程、活動與群組/成員的雙向關聯。
- **中台系統整合**：
  - 專案合併與測試環境建置部署。
  - **SSO 整合**：與 Laravel (HWS) 共享登入狀態與權限控控。
- **數據可視化**：群組與活動的成效分析圖表。

---

## 🏃 快速啟動 (Quick Start)

專案採用 **pnpm monorepo** 管理，請確保已安裝 [pnpm](https://pnpm.io/)。

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 啟動開發環境

本專案目前主要的開發模組為 `web-ele` (Element Plus 版本)：

```bash
pnpm dev:ele
```

### 3. 編譯與建置

```bash
# 編譯 Element Plus 版本
pnpm build:ele
```

---

## 🐳 Docker 部署 (Docker Deployment)

系統支持使用 Docker 進行容器化部署，配置已針對 `web-ele` 模組進行優化。

### 1. 多環境建置映像檔

系統支援透過 `--build-arg APP_ENV` 參數來決定編譯目標環境（會自動讀取對應的 `.env.[env]` 檔案）：

- **建置 UAT 測試環境**：
  ```bash
  docker build --build-arg APP_ENV=uat -t edm-image .
  ```
- **建置正式生產環境 (預設)**：
  ```bash
  docker build -t edm-image .
  ```

### 2. 使用 Docker Compose 啟動

啟動對應環境的容器：

```bash
# 啟動 UAT 容器 (需確保 docker-compose.yml 中的 image 名稱正確)
docker-compose up -d
```

啟動後，系統將運行在 `http://localhost` (80 Port)。

---

## 🔐 SSO 認證與資安架構 (SSO & Security)

專案已完成與 **HWS (Identity Provider)** 的深度整合，實現了「資安隱身型」的單一登入流程。

### 1. 認證流程 (Authentication Flow)

1.  **引導登入**：前端偵測無 Token 時，自動導向至 `VITE_HWS_URL` (HWS 登入頁)。
2.  **帶回 Token**：HWS 驗證成功後，將使用者導回 `VITE_EDM_URL` 並在網址列攜帶 `?token=...`。
3.  **背景驗證**：前端攔截 URL Token，透過系統內建的「隱身代理」呼叫 `verify-token` 介面換取實體 AccessToken。

### 2. 隱身代理機制 (Nginx Reverse Proxy)

為了保護核心系統 (HWS) 不被外部直接窺探，系統採用了 Nginx 反向代理技術：

- **前端呼叫**：`/api-sso/edm/sso/verify-token` (對外隱藏真實域名)。
- **Nginx 轉發**：伺服器內部將 `/api-sso/` 流量導向 **內網實體 IP** `192.168.3.5` (Port 80/443)。
- **優點**：即使 UAT 伺服器沒有外網連線權限，也能透過內網存取認證系統，且瀏覽器 F12 只能看見 EDM 系統自身的網域。

### 3. JWT 標頭強化 (Header Injection)

在 `api/request.ts` 中，所有業務 API 請求都會自動注入以下標頭：

- **`Authorization`**: `Bearer <token>` (標準 JWT)。
- **`X-User-Info`**: **Base64 編碼** 的使用者資料 JSON。
  - _原因_：防止標頭包含中文字元發生的 HTTP Header 解析錯誤，並提供後端即時的使用者 Metadata。

### 4. 環境變數對應表 (.env.uat)

| 變數名稱                | 說明                      |
| :---------------------- | :------------------------ |
| `VITE_HWS_URL`          | HWS 登入頁面網址          |
| `VITE_EDM_URL`          | 本系統 UAT 接收回傳網址   |
| `VITE_SSO_VERIFY_URL`   | 觸發 Nginx 代理的虛擬路徑 |
| `VITE_PROXY_API_TARGET` | Vite 開發用 API 目標      |
| `VITE_PROXY_SSO_TARGET` | Vite 開發用 SSO 目標      |
