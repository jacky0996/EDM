<script setup lang="ts">
import { ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElTable,
  ElTableColumn,
} from 'element-plus';

const props = defineProps<{
  eventData: any;
}>();

const loading = ref(false);
const isConfigured = ref(false);

const config = ref({
  subject: `${props.eventData?.title} - 感謝您的參與！`,
  content:
    '親愛的貴賓您好：\n\n感謝您撥冗參加本次活動，希望活動內容對您有所幫助。\n隨信附上本次活動的相關資料與花絮。\n\n期待未來能再次與您相見！\n\n敬祝，順心',
});

// 模擬發送名單
const displayList = ref<any[]>([
  { name: '王大明', email: 'ming@example.com', status: 1, open: 1 },
  { name: '李小美', email: 'mei@example.com', status: 1, open: 0 },
  { name: '陳建國', email: 'chen@example.com', status: 0, open: 0 },
]);

async function handleSaveConfig() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    isConfigured.value = true;
    ElMessage.success('感謝函內容已儲存！開始進行發送追蹤。');
  }, 600);
}

function handleSendTest() {
  ElMessage.success('測試感謝函已送出！');
}
</script>

<template>
  <div v-loading="loading" class="thankyou-form-config p-2">
    <!-- A. 頂部狀態列 (啟用後顯示) -->
    <div v-if="isConfigured" class="animate-fade-in group">
      <ElCard
        shadow="never"
        class="relative overflow-hidden !rounded-2xl border border-emerald-100 bg-white p-1 shadow-sm transition-shadow hover:shadow-md"
      >
        <!-- 裝飾微光 -->
        <div
          class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-50/50 blur-3xl"
        ></div>

        <div
          class="relative z-10 flex flex-wrap items-center justify-between gap-6 p-3"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-500 shadow-sm transition-transform group-hover:scale-105"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"
                />
              </svg>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold tracking-tight text-gray-800"
                  >感謝函機制已啟動</span
                >
                <span
                  class="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm"
                  >Success</span
                >
              </div>
              <span class="mt-0.5 text-xs font-medium text-gray-400"
                >系統正持續監測發送狀態，您也可以手動發送測試。</span
              >
            </div>
          </div>

          <div class="flex items-center gap-3">
            <ElButton
              type="primary"
              class="!h-10 !rounded-xl px-6 font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
              @click="handleSendTest"
            >
              發送測試信件
            </ElButton>
            <div class="mx-1 h-6 w-[1px] bg-gray-200"></div>
            <ElButton
              type="success"
              class="!h-10 !rounded-xl px-4 font-bold shadow-sm"
              @click="isConfigured = false"
            >
              重新編輯內容
            </ElButton>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 配置器區塊 -->
    <div v-if="!isConfigured" class="animate-fade-in mt-4 space-y-6">
      <div class="flex items-center justify-between px-2">
        <div class="flex flex-col">
          <h3 class="text-xl font-bold text-gray-800">編輯活動感謝函</h3>
          <p class="text-sm text-gray-500">
            活動結束後，系統將依據此處設定的內容自動或手動寄發給與會名單
          </p>
        </div>
      </div>

      <ElCard shadow="never" class="!rounded-2xl border-gray-200">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-bold">感謝函內容配置</span>
          </div>
        </template>

        <ElForm label-position="top">
          <ElFormItem label="信件主旨 (Subject)">
            <ElInput
              v-model="config.subject"
              placeholder="請輸入感謝函信件主旨"
            />
          </ElFormItem>

          <ElFormItem label="信件內文 (Content)">
            <ElInput
              v-model="config.content"
              type="textarea"
              :rows="10"
              placeholder="請輸入感謝函內文..."
            />
          </ElFormItem>
        </ElForm>

        <div class="gap-return mt-6 flex justify-end">
          <ElButton
            type="primary"
            class="!h-12 !rounded-xl !border-emerald-600 !bg-emerald-600 !px-10 font-bold shadow-md hover:!bg-emerald-700"
            :loading="loading"
            @click="handleSaveConfig"
          >
            儲存並啟用感謝函
          </ElButton>
        </div>
      </ElCard>
    </div>

    <!-- 下層部分: 感謝函發送清單 (啟用後顯示) -->
    <div v-if="isConfigured" class="animate-fade-in pt-6">
      <ElCard shadow="never" class="!rounded-2xl border-gray-200">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-6 w-1.5 rounded-full bg-emerald-500"></div>
              <span class="text-lg font-bold text-gray-800"
                >感謝函發送清單</span
              >
            </div>
            <div class="flex items-center gap-4 text-sm">
              <span class="font-medium text-gray-500"
                >目前共 {{ displayList.length }} 筆寄送對象</span
              >
            </div>
          </div>
        </template>
        <ElTable
          :data="displayList"
          stripe
          border
          class="w-full"
          empty-text="目前尚無發送目標資料"
        >
          <ElTableColumn prop="name" label="姓名" width="150">
            <template #default="{ row }">
              <span class="font-bold text-emerald-600">{{ row.name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="email" label="電子郵件" min-width="200" />
          <ElTableColumn label="發送狀態" width="150" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-1">
                <div
                  class="h-2 w-2 rounded-full"
                  :class="row.status === 1 ? 'bg-green-500' : 'bg-gray-300'"
                ></div>
                <span
                  :class="
                    row.status === 1
                      ? 'font-bold text-green-600'
                      : 'text-gray-400'
                  "
                  >{{ row.status === 1 ? '已成功送達' : '待發送' }}</span
                >
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="開信狀態" width="150" align="center">
            <template #default="{ row }">
              <span
                v-if="row.open === 1"
                class="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
                >已開啟</span
              >
              <span v-else class="text-gray-400">尚未開啟</span>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
