# Architecture Decision Records (ADR)

本目錄收錄 EDM Frontend 的關鍵架構決策。每份 ADR 回答一個「**為什麼選 A 不選 B**」的問題,讓未來維護者(包括未來的自己)在改動前能先理解當初的取捨。

## 索引

| # | 標題 | 狀態 | 影響範圍 |
|---|---|---|---|
| [0001](./0001-vben-admin.md) | 採用 Vben Admin 5.0 取代自建 Vue 後台 | Accepted | 整個 frontend 架構 / 開發速度 |
| [0002](./0002-token-storage.md) | JWT 儲存採 Pinia + localStorage 雙層 | Accepted | SSO 機制 / 安全模型 |
| [0003](./0003-nginx-proxy.md) | Nginx 反向代理隱藏中台真實位址 | Accepted | 資安 / 部署架構 |

> 模板與寫作公約見 [Middle Platform docs/adr/README.md](../../../Middle_Platform/docs/adr/README.md) — 三個 repo 共用同一個 ADR 模板,讓 reviewer 跨 repo 閱讀體驗一致。
