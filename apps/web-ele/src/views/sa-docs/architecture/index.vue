<script setup lang="ts">
import { Page } from '@vben/common-ui';

import MermaidView from '#/components/common/mermaid-view.vue';

// 整體系統架構
const overview = `
graph TB
    subgraph 用戶端
      Browser[瀏覽器]
    end

    subgraph 靜態托管
      Nginx[Nginx 靜態資源]
      SPA[EDM 前端 SPA<br/>Vue 3 + Element Plus]
    end

    subgraph 中臺
      HWS[HWS 後端<br/>Laravel]
      SSO[(SSO 驗證服務)]
    end

    subgraph EDM 後端
      API[EDM API<br/>業務邏輯]
      DB[(MySQL 資料庫)]
    end

    subgraph 第三方
      Google[Google Forms API]
      Mail[SMTP 郵件服務]
    end

    Browser --> Nginx
    Nginx --> SPA
    SPA -- /api-sso/* --> SSO
    SPA -- /api/edm/* --> API
    HWS --- SSO
    API --- DB
    API <-.-> Google
    API --> Mail
`;

// 前端技術棧
const frontendStack = `
graph TD
    Entry[main.ts 進入點] --> Bootstrap[bootstrap.ts 初始化]
    Bootstrap --> Prefs[@vben/preferences<br/>主題 / 語系]
    Bootstrap --> Access[@vben/access<br/>路由守衛]
    Bootstrap --> Stores[Pinia Stores<br/>auth / user / access]

    Stores --> Router[vue-router 動態路由]
    Router --> Layout[BasicLayout]
    Layout --> Pages{Pages}

    Pages --> Event[活動管理<br/>create / detail / list]
    Pages --> Member[人員管理]
    Pages --> Group[群組管理]
    Pages --> SA[SA 文件]

    Pages --> UI[Element Plus]
    Pages --> Editor[CKEditor 5]
    Pages --> Charts[ECharts]

    Pages --> API[requestClient<br/>Axios 封裝]
    API --> Interceptor[攔截器:<br/>Token / 錯誤訊息 / 逾時]
`;

// 資料流：從使用者操作到 API 回傳
const dataFlow = `
sequenceDiagram
    participant U as 使用者
    participant V as Vue Component
    participant S as Pinia Store
    participant R as requestClient
    participant I as Axios Interceptor
    participant B as EDM API

    U->>V: 操作元件 (送出表單)
    V->>S: 讀取狀態 / 派發 action
    V->>R: 呼叫 requestClient.post
    R->>I: request 攔截
    I->>I: 附加 Authorization Header
    I->>B: 送出請求
    B-->>I: 回應 { code, data, msg }
    I->>I: response 攔截:<br/>成功 / 逾時 / 401
    I-->>R: 回傳 data
    R-->>V: 更新 UI
    V-->>U: 顯示結果或 ElMessage
`;

// SSO 登入序列
const ssoFlow = `
sequenceDiagram
    participant HWS as HWS Laravel
    participant SPA as EDM 前端
    participant API as EDM API

    Note over HWS: 使用者於中臺點選 EDM
    HWS->>SPA: 302 導向 EDM + Token
    SPA->>API: /edm/sso/verify-token
    API->>HWS: 反向驗證 Token
    HWS-->>API: 回傳使用者資訊
    API-->>SPA: 建立 Session + UserInfo
    SPA->>SPA: 寫入 Pinia 與 LocalStorage
    SPA-->>HWS: 若逾時則導回 HWS 登入
`;

// 部署架構
const deployment = `
graph LR
    Dev[開發者] -- git push --> GH[GitHub]
    GH -- pull_request --> CI[GitHub Actions<br/>Lint & Format Check]

    Dev -- docker compose up --build --> Build[多階段 Docker Build]
    Build --> Stage1[node:22-slim<br/>pnpm install<br/>pnpm build:ele]
    Stage1 --> Stage2[nginx:stable-alpine<br/>拷入 dist]
    Stage2 --> Image[edm-image]
    Image --> Container[容器: edm-web-ele<br/>埠號 82 → 80]

    Container --> User[內部使用者]
`;
</script>

<template>
  <Page title="系統架構圖">
    <div class="space-y-6 p-4">
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-indigo-500">🏗️</span> 系統架構圖 (Architecture)
          </div>
        </template>

        <el-tabs type="border-card" class="doc-tabs">
          <el-tab-pane label="🌐 整體架構">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                高層次架構：使用者端 → Nginx 靜態托管 → SPA → EDM / HWS / 第三方
                服務。
              </div>
              <MermaidView :content="overview" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="⚡ 前端技術棧">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                Vue 3 + Vite + Element Plus + Pinia + vue-router
                組合；CKEditor、ECharts 為重要第三方元件。
              </div>
              <MermaidView :content="frontendStack" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🔄 資料流程">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                從元件發出請求到 Axios 攔截、後端回應、狀態更新之完整流程。
              </div>
              <MermaidView :content="dataFlow" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🔑 SSO 登入時序">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                HWS Laravel 與 EDM 之間的 Token 交換與 Session 建立序列。
              </div>
              <MermaidView :content="ssoFlow" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🐳 部署架構">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                本地以 docker compose 執行多階段建置，產出 nginx
                靜態映像對外服務。
              </div>
              <MermaidView :content="deployment" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 技術棧表格 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-emerald-500">📦</span> 技術棧一覽
          </div>
        </template>
        <div class="grid gap-3 py-2 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in [
              { k: '框架', v: 'Vue 3 (Composition API + <script setup>)' },
              { k: '建置工具', v: 'Vite 5 + Turborepo' },
              { k: 'UI', v: 'Element Plus' },
              { k: 'CSS', v: 'Tailwind CSS + Element SCSS 客製' },
              { k: '狀態管理', v: 'Pinia' },
              { k: '路由', v: 'vue-router 4' },
              { k: 'HTTP', v: 'Axios (封裝為 requestClient)' },
              { k: '富文字', v: 'CKEditor 5' },
              { k: '圖表', v: 'ECharts' },
              { k: '圖表 (文件)', v: 'Mermaid' },
              { k: 'Lint', v: 'ESLint 9 + Prettier + Stylelint' },
              { k: '容器', v: 'Docker 多階段建置 + Nginx' },
            ]"
            :key="item.k"
            class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/40 p-3"
          >
            <span class="text-xs font-bold text-gray-500">{{ item.k }}</span>
            <span class="text-sm font-medium text-gray-700">{{ item.v }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
.doc-card {
  overflow: hidden;
  border-radius: 12px;
}

.doc-card :deep(.el-card__header) {
  background: linear-gradient(90deg, #f9fafb 0%, #fff 100%);
}

.doc-tabs :deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

.doc-tabs :deep(.el-tabs__content) {
  padding: 0 16px 16px;
}
</style>
