<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ElButton,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElSelect,
  ElOption,
  ElMessage,
  ElLink,
  ElPagination,
  ElInput,
} from 'element-plus';
import { getInviteListApi, importEventGroupApi } from '#/api/event';

const props = defineProps<{
  eventId: string | number;
}>();

const router = useRouter();

const loading = ref(false);
const listData = ref<any[]>([]);
const groupOptions = ref<any[]>([]); // 儲存可供匯入的群組清單

// 分頁與搜尋狀態
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchName = ref('');

// 取回活動邀請名單
async function fetchList() {
  if (!props.eventId) return;
  try {
    loading.value = true;
    const res: any = await getInviteListApi({ 
      event_id: props.eventId,
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchName.value || undefined,
    });
    const dataObj = res?.data || res || {};
    listData.value = dataObj.member || dataObj.items || dataObj.list || [];
    groupOptions.value = dataObj.group || [];
    total.value = (dataObj.total !== undefined) ? dataObj.total : listData.value.length;
  } catch (error: any) {
    console.error('Fetch invite list error:', error);
    ElMessage.error(error.message || '無法取得邀請名單');
  } finally {
    loading.value = false;
  }
}

// 換頁處理
function handlePageChange(val: number) {
  currentPage.value = val;
  fetchList();
}

// 每頁筆數切換
function handleSizeChange(val: number) {
  pageSize.value = val;
  currentPage.value = 1; // 回到第一頁
  fetchList();
}

// 搜尋處理
function handleSearch() {
  currentPage.value = 1;
  fetchList();
}

// ================= 匯入群組相關 =================
const importDialogVisible = ref(false);
const importLoading = ref(false);
const selectedGroup = ref<string | number>('');

// 開啟彈窗
function openImportDialog() {
  selectedGroup.value = '';
  importDialogVisible.value = true;
}

// 送出匯入請求
async function handleImportSubmit() {
  if (!selectedGroup.value) {
    ElMessage.warning('請先選擇一個群組');
    return;
  }
  
  try {
    importLoading.value = true;
    const res: any = await importEventGroupApi({
      event_id: props.eventId,
      group_id: selectedGroup.value,
    });
    
    // 只要 code 為 0 或 status 為 true 並非 undefined，都視為成功
    console.log('[Import Result]', res);
    
    // 優先檢查後端提供的 status，其次檢查 code 是否為 0 (含字串或數字)
    const isSuccess = res && (res.status === true || String(res.code) === '0' || String(res.code) === '200');
    
    if (isSuccess) {
      ElMessage.success('群組人員已成功匯入');
      importDialogVisible.value = false;
      await fetchList(); // 重新拉取最新的邀請名單
    } else {
      // 輸出更明確的報錯資訊，避免 0 || falsy 導致顯示預設文字
      const errorMsg = res?.msg || res?.message || (res?.code !== undefined ? `Error Code: ${res.code}` : '匯入失敗');
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('Import group error:', error);
    ElMessage.error(error.message || '匯入群組發生異常');
  } finally {
    importLoading.value = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="invitation-container bg-white rounded-lg p-6">
    <!-- 頂部區塊 -->
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div class="flex items-center gap-2 flex-nowrap">
        <h3 class="text-sm font-bold text-gray-500 whitespace-nowrap shrink-0">姓名：</h3>
        <ElInput
          v-model="searchName"
          placeholder="搜尋人員姓名..."
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <span class="i-lucide-search text-gray-400"></span>
          </template>
          <template #append>
            <ElButton @click="handleSearch">搜尋</ElButton>
          </template>
        </ElInput>
      </div>
      <div class="shrink-0">
        <ElButton type="primary" @click="openImportDialog">匯入群組人員</ElButton>
      </div>
    </div>

    <!-- 列表表格 -->
    <ElTable
      v-loading="loading"
      :data="listData"
      border
      stripe
      style="width: 100%"
      class="rounded-md"
    >
      <ElTableColumn type="index" label="序號" width="60" align="center" />
      <ElTableColumn prop="name" label="姓名" min-width="120">
        <template #default="{ row }">
          <ElLink
            v-if="row.member?.name"
            type="primary"
            @click="router.push(`/member/detail/${row.member_id || row.member?.id}`)"
          >
            {{ row.member?.name }}
          </ElLink>
          <span v-else>-</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="email" label="電子郵件" min-width="200">
        <template #default="{ row }">
          {{ row.email?.email || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="phone" label="聯絡電話" min-width="150">
        <template #default="{ row }">
          {{ row.mobile?.mobile || '-' }}
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 分頁器：一左一右設計 -->
    <div class="mt-6 flex justify-between items-center">
      <!-- 左：呈現筆數與總條數 -->
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50, 100, 200]"
        layout="total, sizes"
        @size-change="handleSizeChange"
      />
      <!-- 右：導航頁數 -->
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 匯入群組彈窗 -->
    <ElDialog
      v-model="importDialogVisible"
      title="匯入群組人員"
      width="400px"
      destroy-on-close
    >
      <div class="py-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">請選擇來源群組：</label>
        <ElSelect
          v-model="selectedGroup"
          placeholder="請選擇群組"
          class="w-full"
          clearable
          filterable
        >
          <ElOption
            v-for="group in groupOptions"
            :key="group.id"
            :label="group.group_name || group.name"
            :value="group.id"
          />
        </ElSelect>
        <p class="text-xs text-gray-500 mt-2">提示：匯入後，該群組內的所有人員都會被加入此活動的邀請名單中。</p>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="importDialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="importLoading" @click="handleImportSubmit">
            確認匯入
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
/* 將原本外框陰影或是表格樣式調整清爽 */
.invitation-container {
  min-height: 400px;
}
</style>
