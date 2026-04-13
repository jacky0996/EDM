<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElMessageBox,
  ElMessage,
  ElInput,
  ElEmpty,
} from 'element-plus';
import { requestClient } from '#/api/request';

const props = defineProps<{
  eventData: any;
}>();

const list = ref<any[]>([]);
const filteredList = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const googleFormId = ref<number | null>(null);
const notApproveMode = ref(false);

function applyFilter() {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) {
    filteredList.value = list.value;
  } else {
    filteredList.value = list.value.filter((row) =>
      [row.name, row.company, row.email, row.mobile]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q))
    );
  }
}

onMounted(async () => {
  await init();
});

async function init() {
  if (!props.eventData?.id) return;

  loading.value = true;
  try {
    // Step 1: 取得表單綁定資訊以獲得 google_form_id
    const displayRes: any = await requestClient.post('/edm/event/getDisplayList', {
      event_id: props.eventData.id
    }, { responseReturn: 'raw', timeout: 60000 } as any);

    const body = displayRes?.data || displayRes || {};
    const resData = body.data || {};

    if (!resData.google_form_bound) {
      list.value = [];
      filteredList.value = [];
      return;
    }

    googleFormId.value = resData.form_details?.id || null;
    if (!googleFormId.value) return;

    // Step 2: 呼叫 getApproveList
    await fetchApproveList();
  } catch (err) {
    console.error('ApprovalList init failed:', err);
    ElMessage.error('資料載入失敗，請稍後再試');
  } finally {
    loading.value = false;
  }
}

async function fetchApproveList() {
  if (!googleFormId.value) return;

  loading.value = true;
  try {
    const res: any = await requestClient.post('/edm/event/getApproveList', {
      google_form_id: googleFormId.value
    });

    // API 呼叫失敗
    if (res.code !== 0) {
      ElMessage.error(res.message || '取得審核名單失敗');
      return;
    }

    // 活動未開啟審核機制 (status: false)
    if (!res.status) {
      notApproveMode.value = true;
      list.value = [];
      filteredList.value = [];
      return;
    }

    // data 有值代表已有人填寫，空陣列代表尚無人填寫，都正常顯示
    list.value = (res.data || []).map((item: any) => {
      const row: any = {
        _id: item.id,
        _responseId: item.google_response_id,
        _createTime: item.submitted_at,
        status: item.status ?? 0,
        _rawAnswers: item.answers || []
      };

      if (Array.isArray(item.answers)) {
        item.answers.forEach((ans: any) => {
          const title = (ans.title || '').trim();
          const answer = ans.answer || '';
          if (title.includes('姓名')) row.name = answer;
          else if (title.includes('電話') || title.includes('手機')) row.mobile = answer;
          else if (title.includes('公司')) row.company = answer;
          else if (title.includes('郵件') || title.toLowerCase().includes('email')) row.email = answer;
        });
      }

      return row;
    });

    applyFilter();
  } catch (err: any) {
    ElMessage.error(err.message || '取得審核名單失敗');
  } finally {
    loading.value = false;
  }
}

function getStatusTag(status: number) {
  const map: any = {
    0: { label: '待審核', type: 'info' },
    1: { label: '已通過', type: 'success' },
    2: { label: '不通過', type: 'danger' },
  };
  return map[status] ?? { label: '未知', type: 'info' };
}

async function handleApprove(row: any) {
  try {
    const action = await ElMessageBox.confirm(
      `確認核准「${row.name || '此人員'}」的報名？`,
      '審核通過確認',
      { confirmButtonText: '確定通過', cancelButtonText: '取消', type: 'success' }
    ).catch((a) => a);

    if (action !== 'confirm') return;
    await updateStatus(row, 1);
  } catch (_) {}
}

async function handleReject(row: any) {
  try {
    const action = await ElMessageBox.confirm(
      `確認拒絕「${row.name || '此人員'}」的報名？`,
      '審核拒絕確認',
      { confirmButtonText: '確定拒絕', cancelButtonText: '取消', type: 'warning' }
    ).catch((a) => a);

    if (action !== 'confirm') return;
    await updateStatus(row, 2);
  } catch (_) {}
}

async function updateStatus(row: any, status: number) {
  try {
    loading.value = true;
    const res: any = await requestClient.post('/edm/event/updateResponseStatus', {
      response_id: row._responseId,
      status
    });

    if (res.code === 0 || res.status === true) {
      ElMessage.success(status === 1 ? '已通過審核' : '已退件');
      row.status = status;
      applyFilter();
    } else {
      ElMessage.error(res.message || '更新失敗');
    }
  } catch (err: any) {
    ElMessage.error(err.message || '連線異常');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="approval-list bg-white rounded-2xl">

    <!-- 未開啟審核模式 -->
    <div v-if="notApproveMode" class="py-20">
      <ElEmpty description="此活動未開啟審核機制，或尚未建立 Google 報名表" />
    </div>

    <template v-else>
      <!-- 工具列 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-bold text-gray-800">活動報名審核名單</h3>
          <ElInput
            v-model="searchQuery"
            placeholder="搜尋姓名、公司或 Email..."
            style="width: 280px;"
            clearable
            @input="applyFilter"
            @clear="applyFilter"
          />
        </div>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>待審核：{{ filteredList.filter(r => r.status === 0).length }} 筆</span>
          <span class="text-green-600">已通過：{{ filteredList.filter(r => r.status === 1).length }} 筆</span>
          <span class="text-red-500">不通過：{{ filteredList.filter(r => r.status === 2).length }} 筆</span>
          <ElButton size="small" @click="fetchApproveList">重新整理</ElButton>
        </div>
      </div>

      <!-- 表格 -->
      <ElTable
        v-loading="loading"
        :data="filteredList"
        style="width: 100%"
        stripe
        border
        empty-text="目前尚無審核資料"
        :header-cell-style="{ backgroundColor: '#F9FAFB', fontWeight: 'bold' }"
      >
        <ElTableColumn prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <span class="font-bold text-blue-600">{{ row.name || '-' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="company" label="公司單位" min-width="160" />
        <ElTableColumn prop="mobile" label="電話號碼" width="130" />
        <ElTableColumn prop="email" label="Email" min-width="200" />

        <ElTableColumn label="提交時間" width="165">
          <template #default="{ row }">
            <span class="text-gray-500 text-xs">
              {{ row._createTime ? String(row._createTime).replace('T', ' ').substring(0, 19) : '-' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="審核狀態" width="110" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusTag(row.status).type" size="small" effect="dark" disable-transitions>
              {{ getStatusTag(row.status).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="審核操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row.status === 0" class="flex gap-2 justify-center">
              <ElButton type="success" size="small" @click="handleApprove(row)">通過</ElButton>
              <ElButton type="danger" size="small" @click="handleReject(row)">拒絕</ElButton>
            </div>
            <span v-else class="text-xs text-gray-400 italic">已完成處理</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </template>
  </div>
</template>

<style scoped>
.approval-list :deep(.el-table__row) {
  transition: all 0.2s ease;
}
.approval-list :deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}
</style>
