<script setup lang="ts">
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page title="測試項目與驗證指南">
    <div class="p-4 space-y-4">
      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg text-blue-600">🎯 第一階段測試：群組與人員管理</div>
        </template>
        <div class="text-sm text-gray-700 leading-relaxed">
          <p class="mb-4">此階段測試目標為確認「人員管理」與「群組管理」核心操作流程的穩定性，以及兩者之間的關聯是否正確。</p>

          <div class="mb-6">
            <h3 class="font-bold text-base mb-2 border-l-4 border-blue-500 pl-2">1. 群組管理 (Group Management)</h3>
            <ul class="list-decimal pl-5 space-y-2">
              <li><strong>建立群組：</strong>點擊「新增群組」，確認必填欄位（群組名稱）未填寫時會阻擋送出。填寫並送出後，確認新群組出現在列表中。</li>
              <li><strong>狀態切換：</strong>在列表中或群組詳情中切換「啟用/禁用」狀態，重新整理頁面，確認狀態有被正確保存。</li>
              <li><strong>群組詳情檢視：</strong>點擊列表中的群組名稱，應成功進入詳情頁。</li>
              <li><strong>人員匯入：</strong>在群組詳情頁中，點擊「匯入人員名單」按鈕，應成功進入匯入頁面，且匯入功能正確。</li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-base mb-2 border-l-4 border-green-500 pl-2">2. 人員管理 (Member Management)</h3>
            <ul class="list-decimal pl-5 space-y-2">
              <li><strong>列表與搜尋：</strong>在人員列表中，測試使用「姓名」和「狀態」進行搜尋，並測試點擊右側的「x」清除搜尋條件是否能恢復顯示所有名單。</li>
              <li><strong>人員匯入：</strong>
                <ul class="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>自「人員管理」列表點擊匯入，應可自由選擇欲匯入的群組。</li>
                  <li>下載範例檔後，填寫測試資料上傳，確認資料正確進入對應群組。</li>
                </ul>
              </li>
              <li><strong>人員詳情編輯：</strong>點擊任一人員進入詳情，嘗試編輯「行動電話」與「電子郵件」。確認編輯成功後會有提示框，且重新載入後資料正確。</li>
              <li><strong>狀態切換：</strong>在列表中切換人員的「啟用/禁用」狀態，確認狀態變更成功。</li>
            </ul>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg text-orange-600">📝 測試回報格式</div>
        </template>
        <div class="text-sm text-gray-600">
          <p>若在測試過程中發現異常，懇請提供以下資訊以幫助工程團隊快速定位問題：</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>發生異常的具體面頁與操作步驟。</li>
            <li>預期看到的結果 vs 實際發生的結果。</li>
            <li>盡量提供全螢幕截圖（包含網址列與右下角時間）。</li>
          </ul>
        </div>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
</style>
