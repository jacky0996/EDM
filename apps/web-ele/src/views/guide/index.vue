<script setup lang="ts">
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page title="系統使用說明">
    <div class="p-4">
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="font-bold text-lg">💡 歡迎使用 EDM 行銷管理工具</div>
        </template>
        <div class="text-sm text-gray-600 leading-relaxed">
          <p class="mb-2">
            本系統主要用於協助您管理行銷活動、人員名單與群組資料。
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li><strong>群組管理：</strong>可以建立群組並將人員分類。</li>
            <li><strong>人員管理：</strong>管理人員詳細資料、聯絡方式，並提供批次匯入功能。</li>
          </ul>
        </div>
      </el-card>
      
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="font-bold text-lg">⚠️ 常見問題</div>
        </template>
        <div class="text-sm text-gray-600 leading-relaxed space-y-4">
          <div>
            <div class="font-bold text-gray-800">Q: 我發現右上角的介面設定（如隱藏通知、時區）沒有生效？</div>
            <div class="mt-1">
              A: 這是因為系統會將介面偏好設定 <span class="bg-gray-100 px-1 rounded text-red-500 font-mono">快取在瀏覽器中</span>。如需套用最新設定，請開啟瀏覽器的開發者工具 (F12) -> Application -> Local Storage，將所有項目清除並重新整理頁面。
            </div>
          </div>
          <div>
            <div class="font-bold text-gray-800">Q: 如果遇到登入狀態異常怎麼辦？</div>
            <div class="mt-1">
              A: 系統已支援靜默續傳機制與防呆驗證，正常情況下不會輕易失效。若仍遇到異常，請嘗試完全關閉瀏覽器分頁後重新從入口進入。
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="font-bold text-lg">📝 專案開發日誌 (Development Log)</div>
        </template>
        <div class="text-sm text-gray-700 leading-relaxed space-y-3">
          <h3 class="font-bold text-base text-blue-600 border-b pb-1">當週交付價值 (Week 1)</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>群組詳情頁重構：</strong>實作 Tab 標籤頁功能（人員列表、活動列表、群組分析）。</li>
            <li><strong>人員匯入整合：</strong>針對群組詳情頁的匯入進行優化，自動預選當前群組且鎖定為唯讀。</li>
            <li><strong>狀態管理優化：</strong>群組與人員的「狀態」切換由標籤改為 Switch (開關) 樣式，並對接 editStatus API 實現即時同步。</li>
            <li><strong>全動態載入感官：</strong>所有涉及 API 呼叫的頁面實作 Loading 提示，確保明確回饋。</li>
            <li><strong>群組新增功能：</strong>支援群組名稱與備註輸入，對接建立 API。</li>
            <li><strong>人員通訊資料編輯：</strong>完成「行動電話」與「電子郵件」的編輯功能與即時同步。</li>
          </ul>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1 mt-4">下週提案 (Next Week's Proposal)</h3>
          <ol class="list-decimal pl-5 space-y-1">
            <li>晚上管理功能，並建立活動管理系統 (Event Management)。</li>
            <li>實作互動式關聯：活動與人員、群組的關聯邏輯。</li>
            <li>系統整合與合併 (HWS Merge)。</li>
          </ol>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg">💬 開發議題庫 (Issue Backlog)</div>
        </template>
        <div class="text-sm text-gray-600 leading-relaxed">
          <ul class="list-disc pl-5 space-y-1">
            <li>補上使用說明書及測試說明書</li>
            <li>補上流程說明圖</li>
            <li>商機相關需求應等到 EDM 系統完成後再接續執行</li>
            <li>行業別要智能提供 (預計 4 月後執行)</li>
            <li>Dashboard 功能設計 (預計 EDM 系統完成後執行)</li>
            <li>發信給 d3802, Amber</li>
          </ul>
        </div>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
/* 簡單的美化樣式 */
</style>
