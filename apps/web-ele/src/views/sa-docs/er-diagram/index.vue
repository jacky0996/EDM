<script setup lang="ts">
import { Page } from '@vben/common-ui';

import MermaidView from '#/components/common/mermaid-view.vue';

// 核心 ER 圖
const coreER = `
erDiagram
    USER ||--o{ MEMBER : "建立 / 維護"
    USER {
      int id PK
      string account
      string name
      string role "admin / sales"
      datetime last_login
    }

    MEMBER ||--o{ MEMBER_GROUP : "綁定"
    MEMBER {
      int id PK
      string name
      string mobile
      string email
      string sales_no "業務工號"
      tinyint status "啟用 / 停用"
      int owner_user_id FK
    }

    GROUP ||--o{ MEMBER_GROUP : "包含"
    GROUP {
      int id PK
      string name
      string remark
      tinyint status
    }

    MEMBER_GROUP {
      int id PK
      int member_id FK
      int group_id FK
    }

    EVENT ||--o{ EVENT_INVITE : "寄送對象"
    EVENT ||--o| GOOGLE_FORM : "對應表單 (可選)"
    EVENT {
      int id PK
      string event_number "活動編號 UK"
      int activity_type "類型代碼"
      string title
      text summary
      text content "CKEditor HTML"
      string img_url
      datetime start_time
      datetime end_time
      string landmark
      string address
      tinyint is_registration
      tinyint is_approval
    }

    EVENT_INVITE }o--|| MEMBER : "邀請"
    EVENT_INVITE {
      int id PK
      int event_id FK
      int member_id FK
      tinyint mail_status "0 未寄 / 1 成功 / 2 失敗"
      tinyint mail_opened
      datetime sent_at
    }

    GOOGLE_FORM ||--o{ FORM_RESPONSE : "收到"
    GOOGLE_FORM {
      int id PK
      int event_id FK
      string type "registration / survey"
      string form_id "Google 表單 ID"
      string form_url
      string edit_url
      json config "題目配置快照"
    }

    FORM_RESPONSE {
      int id PK
      int google_form_id FK
      string google_response_id
      json answers
      tinyint status "0 待審 / 1 通過 / 2 拒絕"
      datetime submitted_at
    }
`;

// 活動分析資料模型
const analyticsER = `
erDiagram
    EVENT ||--|| EVENT_STAT : "彙總"
    EVENT_STAT {
      int id PK
      int event_id FK
      int mail_total
      int mail_read
      int mail_unopened
      int mail_deleted
      int registration_total
      int survey_fill
      int thankyou_read
      datetime updated_at
    }

    EVENT ||--o| THANKYOU_CONFIG : "感謝函配置"
    THANKYOU_CONFIG {
      int id PK
      int event_id FK
      string subject
      text content
      tinyint enabled
    }

    EVENT ||--o{ MAIL_LOG : "寄送紀錄"
    MAIL_LOG {
      int id PK
      int event_id FK
      int member_id FK
      string type "invite / thankyou"
      tinyint success
      string error_msg
      datetime sent_at
    }
`;

// 資料表對應功能模組
const tableMap = [
  { module: '人員管理', tables: ['member', 'member_group'] },
  { module: '群組管理', tables: ['group', 'member_group'] },
  {
    module: '活動管理',
    tables: ['event', 'event_invite', 'event_stat'],
  },
  {
    module: '報名 / 問卷',
    tables: ['google_form', 'form_response'],
  },
  { module: '感謝函', tables: ['thankyou_config', 'mail_log'] },
  { module: '使用者 / SSO', tables: ['user'] },
];
</script>

<template>
  <Page title="ER 圖">
    <div class="space-y-6 p-4">
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-indigo-500">🗂️</span> ER 圖 (Entity Relationship)
          </div>
        </template>

        <el-tabs type="border-card" class="doc-tabs">
          <el-tab-pane label="🎯 核心資料模型">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                人員、群組、活動、Google 表單四大主體間的關聯。
              </div>
              <MermaidView :content="coreER" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="📊 分析 / 寄送紀錄">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                支援活動數據分析的彙總表與郵件寄送紀錄。
              </div>
              <MermaidView :content="analyticsER" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 模組對應表 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-emerald-500">🧩</span> 模組對應資料表
          </div>
        </template>
        <el-table :data="tableMap" stripe border class="mt-2">
          <el-table-column prop="module" label="功能模組" width="220" />
          <el-table-column label="資料表">
            <template #default="scope">
              <div v-if="scope?.row" class="flex flex-wrap gap-2">
                <el-tag
                  v-for="t in scope.row.tables"
                  :key="t"
                  type="info"
                  effect="plain"
                  class="!font-mono"
                >
                  {{ t }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 命名約定 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-orange-500">📐</span> 命名與資料型態約定
          </div>
        </template>
        <ul class="list-disc space-y-2 py-2 pl-6 text-sm text-gray-700">
          <li>
            主鍵一律命名為 <code class="mono">id</code>，型態為 INT
            AUTO_INCREMENT。
          </li>
          <li>外鍵以 <code class="mono">{表名}_id</code> 命名 (單數)。</li>
          <li>
            時間欄位使用 <code class="mono">datetime</code>，統一
            UTC+8；記錄類欄位提供
            <code class="mono">created_at / updated_at</code>。
          </li>
          <li>
            布林旗標以 <code class="mono">tinyint</code> 表示，<code
              class="mono"
              >0</code
            >
            代表停用 / 否。
          </li>
          <li>狀態類欄位以整數 + 註解呈現多狀態 (審核、寄送結果等)。</li>
          <li>JSON 欄位存放彈性結構 (表單題目快照、作答內容)。</li>
        </ul>
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

.mono {
  padding: 1px 6px;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 12px;
  color: #334155;
  background: #f3f4f6;
  border-radius: 4px;
}
</style>
