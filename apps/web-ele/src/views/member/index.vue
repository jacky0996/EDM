<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { formOptions, gridOptions } from './member.data.ts';
import ExcelImportModal from '#/components/common/excel-import-modal.vue';
import { importMemberApi } from '#/api/member';
import { readExcel } from '#/utils/excel';

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [ImportVbenModal, importModalApi] = useVbenModal({
  connectedComponent: ExcelImportModal,
  class: 'w-[1000px]',
});

function handleImport() {
  importModalApi.open();
}

/**
 * 處理匯入流程
 */
async function handleImportProcess(formData: FormData) {
  const file = formData.get('file') as File;
  const groupId = formData.get('groupId');
  if (!file) return;

  try {
    // 解析 Excel
    const rawData = await readExcel(file, { skipRows: 0 });
    
    // 整理成要求格式並發送 API
    await importMemberApi({
      group_id: groupId,
      data: rawData
    });
    
    return true; 
  } catch (error) {
    console.error('人員匯入失敗:', error);
    throw error;
  }
}

function handleImportSuccess() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleImport"> 匯入人員名單 </ElButton>
      </template>
    </Grid>
    <ImportVbenModal
      title="匯入人員名單"
      sample-url="/example/範例-人員名單.xlsx"
      :upload-api="handleImportProcess"
      :extra-params="{ type: 'member' }"
      @success="handleImportSuccess"
    />
  </Page>
</template>
