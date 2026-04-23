<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElMessage,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElTag,
} from 'element-plus';

import {
  getGroupDetailApi,
  getGroupEventListApi,
  updateGroupStatusApi,
} from '#/api/group';
import { importMemberApi } from '#/api/member';
import ExcelImportModal from '#/components/common/excel-import-modal.vue';
import { formatDateTime } from '#/utils/date';
import { readExcel } from '#/utils/excel';

const route = useRoute();
const router = useRouter();
const groupId = route.params.id as string;

const [ImportVbenModal, importModalApi] = useVbenModal({
  connectedComponent: ExcelImportModal,
  class: 'w-[1000px]',
});

const activeTab = ref('members');

// 群組數據
const groupData = ref<any>({
  name: '',
  status: 1,
  note: '',
  members: [],
  creator: null,
  created_at: '',
  updated_at: '',
});

const loading = ref(false);

async function fetchGroupData() {
  if (!groupId) return;
  loading.value = true;
  try {
    const res = await getGroupDetailApi(groupId);
    groupData.value = res;
  } catch (error) {
    console.error('Failed to fetch group detail:', error);
    ElMessage.error('獲取群組詳情失敗');
  } finally {
    loading.value = false;
  }
}

// 活動列表
const eventList = ref<any[]>([]);
const eventLoading = ref(false);

async function fetchGroupEvents() {
  if (!groupId) return;
  eventLoading.value = true;
  try {
    const res: any = await getGroupEventListApi({ group_id: groupId });
    // 預期回傳陣列或在 data.items 內
    eventList.value = res?.data?.items || res?.items || res || [];
  } catch (error) {
    console.error('Failed to fetch group events:', error);
    ElMessage.error('獲取活動列表失敗');
  } finally {
    eventLoading.value = false;
  }
}

onMounted(() => {
  fetchGroupData();
});

// 當切換到活動列表時才載入
watch(activeTab, (newTab) => {
  if (newTab === 'activities' && eventList.value.length === 0) {
    fetchGroupEvents();
  }
});

function handleBack() {
  router.back();
}

function handleImport() {
  importModalApi.open();
}

/**
 * 處理匯入流程
 */
async function handleImportProcess(formData: FormData) {
  const file = formData.get('file') as File;
  const targetGroupId = formData.get('groupId');
  if (!file) return;

  try {
    // 解析 Excel
    const rawData = await readExcel(file, { skipRows: 0 });

    // 整理成要求格式並發送 API
    await importMemberApi({
      group_id: targetGroupId || groupId,
      data: rawData,
    });

    return true;
  } catch (error) {
    console.error('人員匯入失敗:', error);
    throw error;
  }
}

function handleImportSuccess() {
  fetchGroupData();
}

async function handleStatusChange(val: any) {
  loading.value = true;
  try {
    await updateGroupStatusApi(groupId, Number(val));
    ElMessage.success('狀態更新成功');
  } catch (error) {
    console.error('Failed to update status:', error);
    ElMessage.error('狀態更新失敗');
    // 如果失敗，則刷回原始資料以恢復狀態
    fetchGroupData();
  } finally {
    loading.value = false;
  }
}

function formatValue(val: any) {
  return val && val !== '' ? val : '尚無資料';
}
</script>

<template>
  <Page :loading="loading" :title="`群組詳情 - ${groupData.name}`">
    <template #extra>
      <ElButton @click="handleBack"> 返回列表 </ElButton>
    </template>

    <!-- 基本資訊 -->
    <ElCard shadow="never" class="mb-5">
      <ElDescriptions title="基本資訊" :column="2" border>
        <ElDescriptionsItem label="群組名稱">
          {{ groupData.name }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="狀態">
          <ElSwitch
            v-model="groupData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="啟動"
            inactive-text="停用"
            inline-prompt
            @change="handleStatusChange"
          />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="備註">
          {{ formatValue(groupData.note) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="建立者">
          {{ formatValue(groupData.creator?.name) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="建立時間">
          {{ formatDateTime(groupData.created_at) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="更新時間">
          {{ formatDateTime(groupData.updated_at) }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <!-- 標籤頁資料呈現 -->
    <ElCard shadow="never">
      <ElTabs v-model="activeTab">
        <!-- 人員列表標籤 -->
        <ElTabPane label="人員列表" name="members">
          <div class="mb-4 flex items-center justify-between">
            <span class="font-bold"
              >成員列表 ({{ groupData.members?.length ?? 0 }} 人)</span
            >
            <ElButton type="primary" @click="handleImport">
              匯入人員名單
            </ElButton>
          </div>

          <div
            v-if="groupData.members && groupData.members.length > 0"
            class="border-lighter overflow-x-auto rounded border"
          >
            <table
              class="w-full min-w-max border-collapse bg-background text-sm"
            >
              <thead>
                <tr
                  class="border-light border-b-2 bg-slate-600 text-left font-semibold text-white"
                >
                  <th class="p-3">姓名</th>
                  <th class="p-3">狀態</th>
                  <th class="p-3">建立時間</th>
                  <th class="p-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="member in groupData.members"
                  :key="member.id"
                  class="border-lighter hover:bg-fill-hover border-b"
                >
                  <td class="p-3">
                    <span
                      class="cursor-pointer text-primary hover:underline"
                      @click="router.push(`/member/detail/${member.id}`)"
                    >
                      {{ member.name }}
                    </span>
                  </td>
                  <td class="p-3">
                    <ElTag
                      :type="member.status === 1 ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ member.status === 1 ? '啟動' : '禁用' }}
                    </ElTag>
                  </td>
                  <td class="p-3">
                    {{ formatDateTime(member.created_at) }}
                  </td>
                  <td class="p-3">
                    <ElButton
                      size="small"
                      type="primary"
                      link
                      @click="router.push(`/member/detail/${member.id}`)"
                    >
                      查看詳情
                    </ElButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-10 text-center text-secondary">
            尚無成員資料
          </div>
        </ElTabPane>

        <!-- 活動列表標籤 -->
        <ElTabPane label="活動列表" name="activities">
          <div class="mb-4">
            <span class="text-lg font-bold"
              >相關活動 ({{ eventList.length }} 個)</span
            >
          </div>

          <ElTable
            v-loading="eventLoading"
            :data="eventList"
            border
            stripe
            style="width: 100%"
            class="rounded-md"
          >
            <ElTableColumn label="活動名稱" min-width="200">
              <template #default="{ row }">
                <span
                  class="cursor-pointer font-medium text-primary hover:underline"
                  @click="router.push(`/event/detail/${row.id}`)"
                >
                  {{ row.title || row.name || '-' }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="start_time" label="開始時間" width="180">
              <template #default="{ row }">
                {{ row.start_time ? formatDateTime(row.start_time) : '-' }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="end_time" label="結束時間" width="180">
              <template #default="{ row }">
                {{ row.end_time ? formatDateTime(row.end_time) : '-' }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="100" align="center">
              <template #default="{ row }">
                <ElButton
                  size="small"
                  type="primary"
                  link
                  @click="router.push(`/event/detail/${row.id}`)"
                >
                  查看
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <!-- 群組分析標籤 -->
        <ElTabPane label="群組分析" name="analysis">
          <div class="py-10 text-center text-secondary">
            群組分析功能開發中...
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <ImportVbenModal
      title="匯入人員名單"
      sample-url="/example/範例-人員名單.xlsx"
      :upload-api="handleImportProcess"
      :extra-params="{ type: 'member', groupId }"
      :default-group-id="groupId"
      group-disabled
      @success="handleImportSuccess"
    />
  </Page>
</template>

<style scoped>
.border-lighter {
  border-color: var(--el-border-color-lighter);
}

.border-light {
  border-color: var(--el-border-color-light);
}

.bg-fill-light {
  background-color: var(--el-fill-color-light);
}

.bg-fill-hover:hover {
  background-color: var(--el-fill-color-hover);
}
</style>
