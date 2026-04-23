<script setup lang="ts">
import { Page } from '@vben/common-ui';

interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: '中' | '低' | '高';
}

interface Module {
  name: string;
  icon: string;
  summary: string;
  items: Requirement[];
}

const modules: Module[] = [
  {
    name: '人員管理',
    icon: '👤',
    summary: '管理聯絡人基本資料、業務歸屬與狀態切換',
    items: [
      {
        id: 'FR-MEM-01',
        title: '人員列表查詢',
        description: '支援姓名模糊搜尋與啟用/停用狀態篩選',
        priority: '高',
      },
      {
        id: 'FR-MEM-02',
        title: '人員 Excel 匯入',
        description: '提供範例檔下載，允許一次匯入多筆並指定或預選綁定群組',
        priority: '高',
      },
      {
        id: 'FR-MEM-03',
        title: '聯絡資訊即時修改',
        description: '電話與電子郵件支援行內編輯並即時呼叫 API 同步',
        priority: '中',
      },
      {
        id: 'FR-MEM-04',
        title: '業務工號編輯',
        description: '彈窗輸入業務工號，送出後強制重新整理頁面保證資料一致',
        priority: '中',
      },
      {
        id: 'FR-MEM-05',
        title: '關聯群組跳轉',
        description: '於人員詳細頁面點擊群組可直接跳轉對應群組頁',
        priority: '低',
      },
    ],
  },
  {
    name: '群組管理',
    icon: '📁',
    summary: '分類與組織人員資料，搭配活動邀請使用',
    items: [
      {
        id: 'FR-GRP-01',
        title: '群組列表與篩選',
        description: '支援名稱搜尋及啟用狀態篩選',
        priority: '高',
      },
      {
        id: 'FR-GRP-02',
        title: '群組新增',
        description: '名稱必填，備註選填，送出後建立新群組',
        priority: '高',
      },
      {
        id: 'FR-GRP-03',
        title: '啟用狀態即時切換',
        description: '詳細頁透過 Switch 即時呼叫 API 更新',
        priority: '中',
      },
      {
        id: 'FR-GRP-04',
        title: '群組內人員匯入',
        description: '匯入人員時自動綁定至當前群組',
        priority: '高',
      },
    ],
  },
  {
    name: '活動管理',
    icon: '📅',
    summary: '建立、維護活動內容並預覽寄送畫面',
    items: [
      {
        id: 'FR-EVT-01',
        title: '活動列表查詢',
        description: '以活動名稱搜尋並分頁呈現',
        priority: '高',
      },
      {
        id: 'FR-EVT-02',
        title: '建立活動',
        description:
          '依序輸入編號、類型、名稱，搭配 CKEditor 編輯內容與橫幅上傳',
        priority: '高',
      },
      {
        id: 'FR-EVT-03',
        title: 'Gmail 雙模式預覽',
        description: '建立/編輯頁可切換桌機與手機樣式模擬寄送後效果',
        priority: '中',
      },
      {
        id: 'FR-EVT-04',
        title: '活動詳細頁唯讀鎖定',
        description: '進入活動詳細預設唯讀，活動編號永久鎖定',
        priority: '中',
      },
      {
        id: 'FR-EVT-05',
        title: '邀請名單管理',
        description: '從既有群組匯入人員作為該活動邀請對象',
        priority: '高',
      },
    ],
  },
  {
    name: '報名 / 問卷 / 感謝函',
    icon: '📝',
    summary: '自動化產生 Google 表單並持續追蹤回覆',
    items: [
      {
        id: 'FR-FRM-01',
        title: '產製 Google 報名表',
        description: '依系統內題目配置呼叫 Google API 建立表單並回傳公開連結',
        priority: '高',
      },
      {
        id: 'FR-FRM-02',
        title: '讀取雲端配置回填',
        description: '重新編輯時從 Google 拉回最新題目並自動辨識題型',
        priority: '高',
      },
      {
        id: 'FR-FRM-03',
        title: '報名審核',
        description: '需審核活動提供「通過 / 不通過」操作並同步至雲端回覆狀態',
        priority: '中',
      },
      {
        id: 'FR-FRM-04',
        title: '問卷產製',
        description: '以活動為單位產出滿意度問卷，不要求登入即可填寫',
        priority: '中',
      },
      {
        id: 'FR-FRM-05',
        title: '感謝函配置與發送',
        description: '編輯主旨與內文後啟用感謝函機制，系統追蹤寄送與開信狀態',
        priority: '中',
      },
    ],
  },
  {
    name: '系統整合',
    icon: '🔑',
    summary: '與 HWS 中臺 SSO 串接並整合 Google Forms',
    items: [
      {
        id: 'FR-SYS-01',
        title: 'SSO 單一登入',
        description: '透過 HWS 取得 Token，由 EDM API 驗證並建立 Session',
        priority: '高',
      },
      {
        id: 'FR-SYS-02',
        title: '閒置登出',
        description: '偵測到 30 分鐘無活動自動登出，避免憑證長時間暴露',
        priority: '中',
      },
      {
        id: 'FR-SYS-03',
        title: 'Google Forms 串接',
        description: '由後端持 Google Service Account 代為產製/讀取/刪除表單',
        priority: '高',
      },
    ],
  },
  {
    name: '數據分析',
    icon: '📊',
    summary: '追蹤活動信件與報名表現',
    items: [
      {
        id: 'FR-ANA-01',
        title: '活動信件開信率',
        description: '呈現已讀 / 未開啟 / 已刪除三項狀態之圓環圖',
        priority: '低',
      },
      {
        id: 'FR-ANA-02',
        title: '報名轉換率',
        description: '對比寄發數與實際報名數計算轉換比率',
        priority: '低',
      },
      {
        id: 'FR-ANA-03',
        title: '問卷回收率',
        description: '以圓環圖呈現已填寫 / 未填寫分布',
        priority: '低',
      },
    ],
  },
];

const nonFunctional = [
  {
    id: 'NFR-01',
    category: '效能',
    content: 'API 回應時間目標 < 1.5 秒；Google 表單產製容忍 60 秒',
  },
  {
    id: 'NFR-02',
    category: '安全',
    content: '憑證透過 SSO Token 交換，不於前端保存帳號/密碼',
  },
  {
    id: 'NFR-03',
    category: '可維護性',
    content: '採 Monorepo + Turborepo，lint/format 由 Prettier + ESLint 強制',
  },
  {
    id: 'NFR-04',
    category: '可用性',
    content: '以 Element Plus 元件為基底統一互動樣式與錯誤提示',
  },
  {
    id: 'NFR-05',
    category: '相容性',
    content: '支援近兩年主流桌機瀏覽器 (Chrome / Edge / Safari / Firefox)',
  },
  {
    id: 'NFR-06',
    category: '部署',
    content: '以 Docker 多階段建置產出 nginx 靜態映像，方便 CI/CD 佈署',
  },
];

const roles = [
  {
    name: '活動管理員',
    icon: '🛠️',
    description: '負責建立活動、維護邀請名單與寄發郵件',
    permissions: ['人員', '群組', '活動', '報名表', '問卷', '感謝函', '分析'],
  },
  {
    name: '業務人員',
    icon: '💼',
    description: '負責個人負責的客戶名單與關聯業務工號',
    permissions: ['人員（受限）', '群組（受限）'],
  },
  {
    name: '受邀者（外部）',
    icon: '👥',
    description: '未登入系統，僅透過 Google 表單連結填寫報名 / 問卷 / 感謝回饋',
    permissions: ['外部表單填寫'],
  },
];

function priorityTag(p: Requirement['priority']) {
  if (p === '高') return 'danger';
  if (p === '中') return 'warning';
  return 'info';
}
</script>

<template>
  <Page title="需求規格書">
    <div class="space-y-6 p-4">
      <!-- 專案背景 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-indigo-500">📘</span> 專案背景
          </div>
        </template>
        <div class="space-y-3 py-2 text-sm leading-relaxed text-gray-700">
          <p>
            EDM
            活動管理系統為配合既有中臺（HWS）所建立之前端作業平台，主要協助活動管理員完成人員名單維護、活動建立、邀請信寄發、報名表與問卷產製、以及感謝函追蹤等閉環流程。
          </p>
          <p>
            系統整合 Google Forms API 代為建立雲端表單，讓管理員無需進出 Google
            後台；搭配 SSO 單一登入，降低使用者多系統切換之成本。
          </p>
        </div>
      </el-card>

      <!-- 使用者角色 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-blue-500">🎭</span> 使用者角色 (Actor)
          </div>
        </template>
        <div class="grid gap-4 py-2 md:grid-cols-3">
          <div
            v-for="r in roles"
            :key="r.name"
            class="rounded-xl border border-gray-100 bg-gray-50/40 p-4 transition-shadow hover:shadow-sm"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="text-2xl">{{ r.icon }}</span>
              <span class="font-bold text-gray-800">{{ r.name }}</span>
            </div>
            <p class="mb-3 text-xs text-gray-500">{{ r.description }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="p in r.permissions"
                :key="p"
                class="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600"
              >
                {{ p }}
              </span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 功能需求 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-emerald-500">📋</span> 功能需求 (Functional
            Requirements)
          </div>
        </template>
        <el-tabs type="border-card" class="doc-tabs">
          <el-tab-pane
            v-for="mod in modules"
            :key="mod.name"
            :label="`${mod.icon} ${mod.name}`"
          >
            <div class="py-3">
              <div class="mb-4 text-xs italic text-gray-500">
                {{ mod.summary }}
              </div>
              <el-table :data="mod.items" stripe border>
                <el-table-column
                  prop="id"
                  label="編號"
                  width="110"
                  align="center"
                />
                <el-table-column prop="title" label="功能" width="180" />
                <el-table-column prop="description" label="說明" />
                <el-table-column label="優先" width="90" align="center">
                  <template #default="scope">
                    <el-tag
                      v-if="scope?.row"
                      :type="priorityTag(scope.row.priority)"
                      size="small"
                    >
                      {{ scope.row.priority }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 非功能需求 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-orange-500">⚙️</span> 非功能需求 (NFR)
          </div>
        </template>
        <el-table :data="nonFunctional" stripe border class="mt-2">
          <el-table-column prop="id" label="編號" width="110" align="center" />
          <el-table-column prop="category" label="類別" width="140" />
          <el-table-column prop="content" label="內容" />
        </el-table>
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
