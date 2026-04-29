# ADR-0001: 採用 Vben Admin 5.0 取代自建 Vue 後台

- **狀態**: Accepted
- **日期**: 2026-04-19
- **決策者**: Shane (SA / 開發者)

## Context — 我們在解決什麼問題?

EDM 是內部行銷活動管理工具,典型的 **B2B Admin 後台**:左側選單 / 右側內容 / 大量表單 / 大量表格 / 多角色權限 / SSO 整合。從零自建會踩到一連串「每個 admin 都會踩」的工程坑:

- 一致的 layout (側邊欄折疊、breadcrumb、tab 切換)
- 路由守衛、權限路由動態載入
- 主題、暗黑模式、語系
- 表單驗證 / Modal / Notification 框架
- 與後端的請求封裝(攔截、錯誤處理)
- 國際化、i18n 工具鏈
- Mock server / proxy 設定
- Lint / Format / Build 工具鏈
- Monorepo 多 app 結構(若要支援多 UI 框架)

這些都是「不做不行,但做了沒商業價值」的工作。

## Decision — 我們選了什麼?

**採用 [Vben Admin 5.0](https://github.com/vbenjs/vue-vben-admin) 作為 Frontend 基礎模板**:

- 使用 `apps/web-ele`(Element Plus 版本)作為主要 app
- 共用 Vben 的 monorepo packages (`@vben/access`、`@vben/common-ui`、`@vben/hooks`、`@vben/layouts` 等)
- 不大幅修改 Vben 框架本身,只加我們的 `views/` 與 `api/`

> Vben 本身是 MIT,可商用;有持續維護(每月 release);中文社群活躍。

## Considered Options — 還評估過哪些?

### 選項 1 — 從零自建 Vue 後台

- ✅ 完全控制,沒有用不到的依賴
- ❌ 上述每一項基建都要自己做,**估算多 2-3 個月開發時間**
- ❌ Onboarding 新人要先教「我們的 layout」、「我們的 store 結構」
- ❌ 通用功能要自己維護(權限路由、i18n)

### 選項 2 — Vben Admin 5.0 【選中】

- ✅ Layout / Access / Locale 開箱可用,專注業務開發
- ✅ Monorepo 結構,未來可擴 `web-antd` / `web-naive` 等其他 UI
- ✅ TypeScript 完整支援,有 `@vben/types` 共用型別
- ✅ Vite + Turborepo,build 速度快
- ⚠ 有一定學習曲線,要懂 Vben 的目錄結構與慣例
- ⚠ 大版本升級(5.x → 6.x)可能 breaking,要關注 changelog

### 選項 3 — Element Plus Admin / Naive Admin / Soybean Admin

- ✅ 同樣是現成模板
- ⚠ 各有專屬 UI 綁定,擴展性不如 Vben monorepo
- ⚠ 中文社群活躍度與 Vben 相近,但 monorepo 結構是 Vben 獨有

### 選項 4 — Nuxt 3 Admin

- ✅ SSR / SEO 友好
- ❌ Admin 不需要 SEO,SSR 反而增加部署複雜度
- ❌ 內部系統流量不大,不需要 SSR 效能優勢

## Consequences — 這個決定帶來什麼?

### ✅ 正面

- **開發速度**:Layout / 路由 / 權限 / Loading 全套現成,直接寫業務
- **一致性**:側邊欄 / breadcrumb / dialog 全部用 Vben 元件,UX 一致
- **可擴展**:Monorepo 結構讓未來加 `web-antd`(同樣業務、不同 UI)幾乎零成本
- **TypeScript first**:Vben 自己就用 TS 寫,我們繼承同樣的型別文化
- **社群資源**:遇到問題搜「vben + 關鍵字」基本都有人問過

### ⚠ 負面 / Trade-off

- **學習曲線**:新人要先學 Vben 結構 (`@vben/*` packages 怎麼用)
- **依賴重**:即使只用一個 app,monorepo 還是會 install 全部 packages(磁碟用量大)
- **升級風險**:跟 Vben 主線版本走,大版本升級要追

### 🔁 後續追蹤

- 監控 Vben 社群活躍度,若停止維護需要評估 fork 還是換框架
- 升 Vben 大版本時要先在 staging 測整套流程
- 如果業務量起來、需要更高度客製,評估 fork Vben 自己維護的成本

## References

- Code:
  - [`apps/web-ele/`](../../apps/web-ele/) — 我們的主要 app
  - [`packages/`](../../packages/) — Vben 提供的共用 packages
- 文件:
  - [`sa-docs/architecture.md`](../architecture.md) — 內部分層
  - [`sa-docs/deployment.md`](../deployment.md) — Build 與部署
- 外部:
  - [Vben Admin GitHub](https://github.com/vbenjs/vue-vben-admin)
  - [Vben Pro 商業版](https://vben.pro/) — 進階商用版本(若需要)
