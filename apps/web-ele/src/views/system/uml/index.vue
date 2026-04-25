<script setup lang="ts">
import { Page } from '@vben/common-ui';

import MermaidView from '#/components/common/mermaid-view.vue';

const memberUml = `
graph TD
    Start[人員管理入口] --> List[人員列表頁面]
    List --> Search[查詢: 輸入姓名或選擇狀態]
    
    List --> ImportStart[匯入人員名單]
    ImportStart --> DirectImport[Excel 匯入至指定或預選群組]
    
    List --> ClickName[點選人名]
    ClickName --> Detail[人員詳細頁面]
    
    Detail --> EditBase[修改聯絡資訊: 電話/電子郵件]
    EditBase --> SubmitBase[行內即時同步更新]

    Detail --> EditSales[點選業務編輯按鈕]
    EditSales --> SalesPop[出現彈窗輸入業務 Email]
    SalesPop --> SubmitSales[送出並強制重新整理頁面]
    
    Detail --> JumpGroup[點選關聯群組名稱]
    JumpGroup --> GroupDetail[跳轉至群組詳細頁面]
`;

const groupUml = `
graph TD
    Start[群組管理入口] --> List[群組列表頁面]
    List --> Search[查詢: 輸入群組名稱或選擇狀態]
    
    List --> CreateStart[新增群組功能]
    CreateStart --> CreatePage[出現新增頁面]
    CreatePage --> Input{輸入資料}
    Input --> Name[群組名稱: 必填]
    Input --> Note[備註: 選填]
    Name & Note --> Submit[送出並新建群組]
    
    List --> ClickGroupName[點選群組名稱]
    ClickGroupName --> Detail[群組詳細頁面]
    
    Detail --> Switch[狀態: 使用 Switch 即時調整]
    
    Detail --> ImportStart[匯入人員名單]
    ImportStart --> AutoBind[自動綁定匯入人員至該群組]
    ImportStart --> Sample[提供範例下載]
    
    Detail --> ClickMember[點選人名]
    ClickMember --> MemberDetail[跳轉至該人員詳細頁面]
`;

const loginUml = `
sequenceDiagram
    participant HWS as 後端 (HWS) 
    participant Front as 前端 (EDM)
    participant Back as  API
    Front->>HWS: 自動跳轉至 SSO Token 交換
    HWS-->>Front: 回傳加密憑證 (Auth Token)
    Front->>Back: 使用 Token 建立 Session
    Back-->>Front: 回傳登入成功與 UserInfo
    Front->>Front: 儲存至 PINIA 與 LocalStorage
`;

const eventUml = `
graph TD
    Start[活動管理入口] --> List[活動列表頁面]
    List --> SearchEvent[查詢: 活動名稱搜尋]
    
    List --> CreateStart[建立活動項目]
    CreateStart --> CreateInput[輸入順序: 編號 > 類型 > 名稱]
    CreateInput --> CKEditor[橫幅上傳與內容編輯]
    CKEditor --> Preview[Gmail 雙模式預覽]
    Preview --> SubmitCreate[儲存建立]

    List --> ClickEventName[點選活動名稱]
    ClickEventName --> Detail[活動詳細頁面]
    
    Detail -- 活動預覽(詳細頁) --> ReadOnly{預設唯讀模式}
    ReadOnly -- 活動編號 --> Locked[鎖定狀態: 不可修改]
    ReadOnly -- 點選編輯 --> EditMode[編輯模式: 名稱/類型/內容/時間]
    EditMode -- 儲存更新 --> Success[更新後回傳並同步]
    
    Detail -- 邀請名單 --> InviteList[邀請名單分頁列表]
    InviteList --> ImportGroup[從現有群組列表匯入人員]
`;

const formUsageUml = `
sequenceDiagram
    participant User as EDM 系統(前端)
    participant System as EDM 系統(後端)
    participant Cloud as Google 雲端表單
    
    Note over User: 情境一：第一次建立表單
    User->>System: 1. 在系統中設定題目與選項
    System->>Cloud: 2. 自動在 Google 雲端建立表單
    Cloud-->>System: 3. 完成建立並回傳專屬網址
    System-->>User: 4. 畫面顯示成功連結
    
    Note over User: 情境二：之後點選「編輯配置」
    User->>System: 1. 想要修改已建立的表單
    System->>Cloud: 2. 從 Google 獲取最新題目資訊
    System->>System: 3. 自動辨識題目類型 (如單選、複選)
    System-->>User: 4. 畫面自動呈現已填好的內容，可直接修改
`;

const formLogicUml = `
graph TD
    Start[解析原始資料] --> Loop[遍歷 items 陣列]
    Loop --> MatchStandard{符合標準欄位?}
    
    MatchStandard -- title 匹配 --> AssignStandard[推入 standardFields 陣列]
    MatchStandard -- 不匹配 --> CheckType{問卷類型判斷}
    
    subgraph 映射邏輯
    CheckType -- textQuestion --> IsParagraph{paragraph?}
    IsParagraph -- 是 --> Textarea[類型: textarea]
    IsParagraph -- 否 --> Text[類型: text]
    
    CheckType -- choiceQuestion --> ChoiceType{型態判斷}
    ChoiceType -- RADIO --> Radio[類型: radio]
    ChoiceType -- CHECKBOX --> Checkbox[類型: checkbox]
    ChoiceType -- DROP_DOWN --> Dropdown[類型: dropdown]
    ChoiceType --> ExtractOptions[提取 Options 陣列]
    
    CheckType -- date/time --> DateTime[類型: date/time]
    end
    
    AssignStandard & Textarea & Text & Radio & Checkbox & Dropdown & DateTime --> Next[下一個項目]
    Next --> Loop
    Next -- 完成 --> End[產出 UI Config 結構]
`;

const formTestUml = `
graph LR
    A[進入活動詳情] --> B{開啟報名表開關?}
    B -- 是 --> C[出現活動邀請表頁籤]
    C --> D[勾選欄位 / 新增題目]
    D --> E[點擊 匯出 Google 問卷]
    E --> F{API 建立成功?}
    F -- 成功 --> G[顯示 Form ID 與 連結]
    F -- 失敗 --> H[顯示錯誤訊息]
    G --> I[點擊連結 進行試填]
    I --> J[確認 Google 表單題目正確]
`;
</script>

<template>
  <Page title="UML 系統架構圖">
    <div class="space-y-6 p-4">
      <el-card shadow="never" class="uml-card">
        <el-tabs type="border-card">
          <el-tab-pane label="👤 人員管理">
            <div class="py-4">
              <div class="mb-4 text-sm italic text-gray-500">
                人員管理－描述：包含人員搜尋、Excel 匯入流程、業務 Email
                綁定（彈窗）及詳細資料更新邏輯。
              </div>
              <MermaidView :content="memberUml" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="📁 群組管理">
            <div class="py-4">
              <div class="mb-4 text-sm italic text-gray-500">
                群組管理－描述：呈現群組列表、狀態即時同步開關以及新增群組之作業流程。
              </div>
              <MermaidView :content="groupUml" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="📅 活動管理">
            <div class="py-4">
              <div class="mb-4 text-sm italic text-gray-500">
                活動管理－描述：呈現編號/類型/名稱之建立順序、詳細頁編號鎖定規則以及邀請名單匯入邏輯。
              </div>
              <MermaidView :content="eventUml" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="📝 活動邀請表">
            <div class="py-4">
              <div
                class="mb-4 text-sm font-bold italic text-blue-600 text-gray-500"
              >
                Google 表單使用流程 (User Flow)
              </div>
              <div class="mb-4 text-xs text-gray-400">
                管理員如何透過系統自動化管理 Google 表單，無需手動去 Google
                後端操作。
              </div>
              <MermaidView :content="formUsageUml" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🔑 系統串接">
            <div class="py-4">
              <div class="mb-4 text-sm italic text-gray-500">
                登入與 SSO 串接－描述：呈現 EDM 系統與 Laravel HWS 之間的 SSO
                Token 交換與 Session 建立流程。
              </div>
              <MermaidView :content="loginUml" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🧪 測試驗證流">
            <div class="py-4">
              <div class="mb-4 text-sm italic text-gray-500">
                Google
                問卷測試驗證－描述：管理員從開啟功能到完成表單建立的端到端驗證路徑。
              </div>
              <MermaidView :content="formTestUml" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 新增：系統測試驗證區 -->
      <!-- 解析映射邏輯 (移動至最下方) -->
      <el-card shadow="never" class="mb-4 !border-gray-100 bg-gray-50/30">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="font-bold text-emerald-500">⚙️</span> Google
            表單解析映射邏輯 (Logic Deep-Dive)
          </div>
        </template>
        <div class="py-4">
          <div class="mb-6 border-l-4 border-emerald-500 pl-4">
            <div class="text-sm font-bold text-gray-700">自動化解析原理</div>
            <div class="mt-1 text-xs text-gray-500">
              系統如何將 Google 雲端的原始資料轉換成 EDM 介面可讀取的格式
            </div>
          </div>
          <MermaidView :content="formLogicUml" />
        </div>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
.uml-card {
  overflow: hidden;
  border-radius: 12px;
}

:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

:deep(.el-tabs__content) {
  padding: 0 20px 20px;
}
</style>

<style scoped>
.el-card {
  border-radius: 12px;
}
</style>
