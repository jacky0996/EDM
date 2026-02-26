<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page, useVbenModal } from '@vben/common-ui';
import { ElCard, ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElMessage, ElTabs, ElTabPane, ElSwitch } from 'element-plus';
import { getGroupDetailApi, updateGroupStatusApi } from '#/api/group';
import { importMemberApi } from '#/api/member';
import { formatDateTime } from '#/utils/date';
import { readExcel } from '#/utils/excel';
import ExcelImportModal from '#/components/common/excel-import-modal.vue';

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
  updated_at: ''
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

onMounted(() => {
  fetchGroupData();
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
      data: rawData
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
            <span class="font-bold">成員列表 ({{ groupData.members?.length ?? 0 }} 人)</span>
            <ElButton type="primary" @click="handleImport"> 匯入人員名單 </ElButton>
          </div>
          
          <div v-if="groupData.members && groupData.members.length > 0" class="overflow-x-auto border rounded border-lighter">
            <table class="w-full border-collapse text-sm bg-background min-w-max">
              <thead>
                <tr class="bg-slate-600 text-white font-semibold text-left border-b-2 border-light">
                  <th class="p-3">姓名</th>
                  <th class="p-3">狀態</th>
                  <th class="p-3">建立時間</th>
                  <th class="p-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in groupData.members" :key="member.id" class="border-b border-lighter hover:bg-fill-hover">
                  <td class="p-3">
                    <span 
                      class="text-primary cursor-pointer hover:underline" 
                      @click="router.push(`/member/detail/${member.id}`)"
                    >
                      {{ member.name }}
                    </span>
                  </td>
                  <td class="p-3">
                    <ElTag :type="member.status === 1 ? 'success' : 'danger'" size="small">
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
          <div v-else class="text-secondary text-center py-10">尚無成員資料</div>
        </ElTabPane>

        <!-- 活動列表標籤 -->
        <ElTabPane label="活動列表" name="activities">
          <div class="text-secondary text-center py-10">活動列表功能開發中...</div>
        </ElTabPane>

        <!-- 群組分析標籤 -->
        <ElTabPane label="群組分析" name="analysis">
          <div class="text-secondary text-center py-10">群組分析功能開發中...</div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <ImportVbenModal
      title="匯入人員名單"
      sample-url="/example/範例-人員名單.xlsx"
      :upload-api="handleImportProcess"
      :extra-params="{ type: 'member', groupId: groupId }"
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
