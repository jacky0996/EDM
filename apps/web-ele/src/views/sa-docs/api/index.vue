<script setup lang="ts">
import { Page } from '@vben/common-ui';

interface Endpoint {
  method: 'DELETE' | 'GET' | 'POST' | 'PUT';
  path: string;
  title: string;
  desc: string;
  params?: string;
  response?: string;
}

interface Module {
  name: string;
  icon: string;
  summary: string;
  endpoints: Endpoint[];
}

const modules: Module[] = [
  {
    name: '認證 / SSO',
    icon: '🔑',
    summary: 'SSO Token 交換、Session 建立、使用者資訊',
    endpoints: [
      {
        method: 'POST',
        path: '/auth/login',
        title: '一般登入 (備援)',
        desc: '帳號密碼方式登入，主要流程走 SSO，此端點作為備援測試',
        params: '{ username: string, password: string }',
        response: '{ accessToken: string, realName: string, username: string }',
      },
      {
        method: 'POST',
        path: '/edm/sso/verify-token',
        title: 'SSO Token 驗證',
        desc: '由 HWS 導入後，呼叫此端點驗證 Token 並建立 Session',
        params: '{ token: string }',
        response: '{ code: 0, data: { userInfo: UserInfo } }',
      },
      {
        method: 'GET',
        path: '/user/info',
        title: '取得當前使用者資訊',
        desc: '讀取目前登入者之個人資料與角色',
        response: '{ username, realName, roles: string[] }',
      },
      {
        method: 'GET',
        path: '/auth/codes',
        title: '取得授權碼',
        desc: '回傳當前使用者之按鈕層級權限碼',
        response: 'string[]',
      },
      {
        method: 'GET',
        path: '/menu/all',
        title: '取得動態選單',
        desc: '依使用者角色回傳可訪問之路由選單結構',
        response: 'MenuRecord[]',
      },
    ],
  },
  {
    name: '人員 (member)',
    icon: '👤',
    summary: '人員名單 CRUD、聯絡資訊編輯、業務 Email 綁定',
    endpoints: [
      {
        method: 'POST',
        path: '/edm/member/list',
        title: '人員列表',
        desc: '支援姓名模糊搜尋與狀態篩選，分頁回傳',
        params: '{ page, pageSize, name?, status? }',
        response: '{ total, items: Member[] }',
      },
      {
        method: 'POST',
        path: '/edm/member/add',
        title: '新增人員 (Excel 批次)',
        desc: '傳入 Excel 解析後陣列，可同時綁定群組',
        params: '{ members: Member[], group_id?: number }',
      },
      {
        method: 'POST',
        path: '/edm/member/editEmail',
        title: '修改電子郵件',
        desc: '行內即時修改，送出後同步 DB',
        params: '{ id: number, email: string }',
      },
      {
        method: 'POST',
        path: '/edm/member/editMobile',
        title: '修改行動電話',
        desc: '行內即時修改',
        params: '{ id: number, mobile: string }',
      },
      {
        method: 'POST',
        path: '/edm/member/editSales',
        title: '綁定業務 Email',
        desc: '彈窗提交；前端於回傳後強制重新整理以保證狀態一致',
        params: '{ member_id: number, email: string }',
      },
      {
        method: 'POST',
        path: '/edm/member/editStatus',
        title: '切換啟用狀態',
        desc: 'Switch 即時切換',
        params: '{ id: number, status: 0 | 1 }',
      },
    ],
  },
  {
    name: '群組 (group)',
    icon: '📁',
    summary: '群組 CRUD 與相關查詢',
    endpoints: [
      {
        method: 'POST',
        path: '/edm/group/list',
        title: '群組列表',
        desc: '依名稱、狀態篩選並分頁',
        params: '{ page, pageSize, name?, status? }',
      },
      {
        method: 'POST',
        path: '/edm/group/create',
        title: '新增群組',
        desc: '名稱必填、備註選填',
        params: '{ name: string, remark?: string }',
      },
      {
        method: 'POST',
        path: '/edm/group/view',
        title: '群組詳細',
        desc: '回傳群組基本資訊與已綁定人員',
        params: '{ id: number }',
      },
      {
        method: 'POST',
        path: '/edm/group/editStatus',
        title: '切換群組狀態',
        desc: '由詳細頁 Switch 即時切換',
        params: '{ id: number, status: 0 | 1 }',
      },
      {
        method: 'POST',
        path: '/edm/group/getEventList',
        title: '群組相關活動',
        desc: '查詢此群組曾經被匯入過邀請名單的活動紀錄',
        params: '{ group_id: number }',
      },
    ],
  },
  {
    name: '活動 (event)',
    icon: '📅',
    summary: '活動 CRUD、邀請名單、圖片上傳',
    endpoints: [
      {
        method: 'POST',
        path: '/edm/event/list',
        title: '活動列表',
        desc: '支援活動名稱搜尋與分頁',
      },
      {
        method: 'POST',
        path: '/edm/event/create',
        title: '建立活動',
        desc: '含橫幅 URL、CKEditor HTML 內容、時間地點、報名 / 審核旗標',
      },
      {
        method: 'POST',
        path: '/edm/event/view',
        title: '活動詳細',
        desc: '讀取單一活動所有欄位，含圖片 URL',
        params: '{ id: number }',
      },
      {
        method: 'POST',
        path: '/edm/event/update',
        title: '更新活動',
        desc: '詳細頁切換至編輯模式後送出，活動編號不可改',
      },
      {
        method: 'POST',
        path: '/edm/event/getInviteList',
        title: '邀請名單',
        desc: '分頁回傳已邀請人員與寄送狀態',
        params: '{ event_id, page, pageSize }',
      },
      {
        method: 'POST',
        path: '/edm/event/importGroup',
        title: '從群組匯入邀請對象',
        desc: '將指定群組內人員加入至活動邀請名單',
        params: '{ event_id, group_ids: number[] }',
      },
      {
        method: 'POST',
        path: '/edm/event/imageUpload',
        title: '上傳編輯器圖片',
        desc: 'CKEditor 自訂 Upload Adapter 所呼叫',
        params: 'FormData (file)',
        response: '{ previewPath: string }',
      },
      {
        method: 'POST',
        path: '/edm/event/getImage',
        title: '取得圖片庫',
        desc: '列出先前上傳過的活動圖片供編輯器快速插入',
      },
    ],
  },
  {
    name: 'Google 表單整合',
    icon: '📝',
    summary: '代為建立 Google 報名表與問卷、審核報名',
    endpoints: [
      {
        method: 'POST',
        path: '/edm/event/createGoogleForm',
        title: '產製表單',
        desc: '以 type = registration / survey 區分，依 config 建立',
        params: '{ event_id, type, config }',
        response: '{ view_url, edit_url, form_id }',
      },
      {
        method: 'POST',
        path: '/edm/event/getGoogleForm',
        title: '讀取現有表單配置',
        desc: '回傳 Google 最新題目供前端解析與回填',
        params: '{ id: number }',
      },
      {
        method: 'POST',
        path: '/edm/event/getDisplayList',
        title: '報名 / 回覆列表',
        desc: '包含表單綁定狀態、回覆清單、是否需審核等資訊',
        params: '{ event_id: number }',
      },
      {
        method: 'POST',
        path: '/edm/event/updateResponseStatus',
        title: '更新報名審核狀態',
        desc: '審核通過 (1) / 拒絕 (2)',
        params: '{ response_id, status: 1 | 2 }',
      },
      {
        method: 'POST',
        path: '/edm/event/delGoogleForm',
        title: '解除表單綁定',
        desc: '同步移除雲端表單與系統紀錄',
        params: '{ id: number }',
      },
    ],
  },
  {
    name: '郵件 (mail)',
    icon: '📧',
    summary: '寄送活動邀請信',
    endpoints: [
      {
        method: 'POST',
        path: '/edm/mail/inviteMail',
        title: '寄送活動邀請信',
        desc: '依活動 ID 對邀請名單內所有人寄發邀請信',
        params: '{ event_id: number, member_ids?: number[] }',
      },
    ],
  },
];

const responseFormat = `{
  code: 0,            // 0 成功; 非 0 失敗
  status: true,       // 與 code 對應的布林別名
  message: 'OK',      // 錯誤訊息
  data: { ... }       // 業務資料
}`;

function methodColor(m: Endpoint['method']) {
  if (m === 'GET') return 'success';
  if (m === 'POST') return 'primary';
  if (m === 'PUT') return 'warning';
  return 'danger';
}
</script>

<template>
  <Page title="API 文件">
    <div class="space-y-6 p-4">
      <!-- 總覽 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-indigo-500">🔌</span> API 總覽
          </div>
        </template>
        <div class="grid gap-4 py-2 md:grid-cols-2">
          <div class="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
            <div class="mb-2 text-xs font-bold text-gray-500">Base URL</div>
            <div class="font-mono text-sm text-gray-800">
              /api/edm (開發 Proxy)
            </div>
            <div class="mt-1 text-xs text-gray-400">
              由 vite proxy 導向 VITE_PROXY_API_TARGET
            </div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
            <div class="mb-2 text-xs font-bold text-gray-500">預設方法</div>
            <div class="font-mono text-sm text-gray-800">POST</div>
            <div class="mt-1 text-xs text-gray-400">
              全站 API 多以 POST + JSON body 形式呼叫
            </div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
            <div class="mb-2 text-xs font-bold text-gray-500">驗證方式</div>
            <div class="font-mono text-sm text-gray-800">
              Authorization: Bearer &lt;SSO Token&gt;
            </div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
            <div class="mb-2 text-xs font-bold text-gray-500">Timeout</div>
            <div class="font-mono text-sm text-gray-800">
              一般 10s；Google 表單相關 60s
            </div>
          </div>
        </div>
      </el-card>

      <!-- 統一回應格式 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-emerald-500">📦</span> 統一回應格式
          </div>
        </template>
        <pre class="api-code">{{ responseFormat }}</pre>
      </el-card>

      <!-- 端點分頁 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-orange-500">📘</span> 端點列表
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
              <div class="space-y-3">
                <div
                  v-for="ep in mod.endpoints"
                  :key="ep.path + ep.method"
                  class="rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div class="mb-2 flex items-center gap-3">
                    <el-tag :type="methodColor(ep.method)" effect="dark">
                      {{ ep.method }}
                    </el-tag>
                    <span class="font-mono text-sm font-bold text-gray-800">
                      {{ ep.path }}
                    </span>
                  </div>
                  <div class="mb-2 text-sm font-semibold text-gray-700">
                    {{ ep.title }}
                  </div>
                  <div class="mb-3 text-xs text-gray-500">{{ ep.desc }}</div>
                  <div
                    v-if="ep.params"
                    class="mb-2 flex flex-col gap-1 md:flex-row md:items-start"
                  >
                    <span
                      class="shrink-0 text-[11px] font-bold uppercase text-indigo-500 md:w-20"
                      >Params</span
                    >
                    <code class="api-inline">{{ ep.params }}</code>
                  </div>
                  <div
                    v-if="ep.response"
                    class="flex flex-col gap-1 md:flex-row md:items-start"
                  >
                    <span
                      class="shrink-0 text-[11px] font-bold uppercase text-emerald-500 md:w-20"
                      >Response</span
                    >
                    <code class="api-inline">{{ ep.response }}</code>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
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

.api-code {
  padding: 12px 16px;
  margin: 0;
  overflow-x: auto;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 12px;
  color: #e2e8f0;
  background: #0f172a;
  border-radius: 8px;
}

.api-inline {
  display: inline-block;
  padding: 2px 8px;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 12px;
  color: #334155;
  word-break: break-all;
  background: #f3f4f6;
  border-radius: 4px;
}
</style>
