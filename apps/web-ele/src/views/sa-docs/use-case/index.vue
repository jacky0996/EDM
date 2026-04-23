<script setup lang="ts">
import { Page } from '@vben/common-ui';

import MermaidView from '#/components/common/mermaid-view.vue';

// 管理員主用例圖：以 actor-usecase 關係呈現
const adminUseCase = `
graph LR
    Admin((🛠️ 活動管理員))

    subgraph 人員與群組
      UC1([管理人員名單])
      UC2([匯入 Excel 名單])
      UC3([維護群組])
    end

    subgraph 活動
      UC4([建立活動])
      UC5([編輯活動內容])
      UC6([維護邀請名單])
      UC7([寄發活動邀請信])
    end

    subgraph 報名 / 問卷 / 感謝函
      UC8([產製 Google 報名表])
      UC9([審核報名])
      UC10([產製活動問卷])
      UC11([配置感謝函])
    end

    subgraph 數據
      UC12([查看開信率])
      UC13([查看報名轉換率])
    end

    Admin --- UC1
    Admin --- UC2
    Admin --- UC3
    Admin --- UC4
    Admin --- UC5
    Admin --- UC6
    Admin --- UC7
    Admin --- UC8
    Admin --- UC9
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12
    Admin --- UC13
`;

// 業務用例
const salesUseCase = `
graph LR
    Sales((💼 業務人員))

    UC1([查看名下客戶])
    UC2([編輯客戶聯絡資訊])
    UC3([為客戶綁定業務工號])
    UC4([查看客戶所屬群組])

    Sales --- UC1
    Sales --- UC2
    Sales --- UC3
    Sales --- UC4
`;

// 外部受邀者用例
const guestUseCase = `
graph LR
    Guest((👥 受邀者))

    UC1([填寫 Google 報名表])
    UC2([填寫活動問卷])
    UC3([開啟活動邀請信])
    UC4([開啟感謝函])

    Guest --- UC1
    Guest --- UC2
    Guest --- UC3
    Guest --- UC4
`;

// 系統 Actor：Google / HWS SSO
const systemActor = `
graph LR
    subgraph EDM 系統
      Core([EDM 前端])
      API([EDM API])
    end

    HWS((🔑 HWS SSO))
    Google((☁️ Google Forms))
    SMTP((📧 SMTP 郵件服務))

    Core -.Token 驗證.-> HWS
    API -.建立/讀取表單.-> Google
    API -.寄送邀請信 / 感謝函.-> SMTP
`;

// 典型使用情境：管理員建立活動 → 邀請 → 報名 → 統計
const scenario = `
sequenceDiagram
    participant A as 活動管理員
    participant S as EDM 系統
    participant G as Google Forms
    participant M as 受邀者

    A->>S: 1. 建立活動並撰寫內容
    A->>S: 2. 從群組匯入邀請名單
    A->>S: 3. 產製 Google 報名表
    S->>G: 代為建立表單
    G-->>S: 回傳表單連結
    S-->>A: 顯示成功
    A->>S: 4. 寄發活動邀請信
    S-->>M: 信件送達，內含報名連結
    M->>G: 填寫報名
    G-->>S: 後端輪詢或回呼取得回覆
    A->>S: 5. 活動結束後配置感謝函
    S-->>M: 寄送感謝信
    A->>S: 6. 查看開信率與報名轉換率
`;
</script>

<template>
  <Page title="使用案例圖">
    <div class="space-y-6 p-4">
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-indigo-500">🎯</span> 使用案例圖 (Use Case
            Diagram)
          </div>
        </template>

        <el-tabs type="border-card" class="doc-tabs">
          <el-tab-pane label="🛠️ 活動管理員">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                活動管理員為主要
                Actor，負責從人員名單到活動結束追蹤的整個閉環流程。
              </div>
              <MermaidView :content="adminUseCase" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="💼 業務人員">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                業務人員對名下客戶進行聯絡資訊維護與業務工號綁定。
              </div>
              <MermaidView :content="salesUseCase" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="👥 受邀者 (外部)">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                受邀者不進入 EDM 系統，透過 Google 表單與電子郵件互動。
              </div>
              <MermaidView :content="guestUseCase" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🤖 系統外部介面">
            <div class="py-3">
              <div class="mb-3 text-xs italic text-gray-500">
                EDM 系統與外部服務的互動關係：SSO 驗證、Google Forms 代理、SMTP
                信件。
              </div>
              <MermaidView :content="systemActor" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 典型情境 -->
      <el-card shadow="never" class="doc-card">
        <template #header>
          <div class="flex items-center gap-2 text-lg font-bold">
            <span class="text-emerald-500">📖</span> 典型情境：建立活動 → 邀請 →
            報名 → 回收
          </div>
        </template>
        <div class="py-3">
          <div
            class="mb-3 border-l-4 border-emerald-500 pl-4 text-sm text-gray-600"
          >
            完整呈現管理員從建立活動、產製表單、寄發邀請、收集回覆到分析數據的端到端流程。
          </div>
          <MermaidView :content="scenario" />
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
