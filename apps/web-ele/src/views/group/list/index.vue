<script setup lang="ts">
import { ref } from 'vue';
import { Page } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useVbenModal } from '@vben/common-ui';

import { formOptions, gridOptions } from './group.data';
import CreateGroupModal from './create-group-modal.vue';

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const loading = ref(false);

const [GroupCreateModal, groupCreateModalApi] = useVbenModal({
  connectedComponent: CreateGroupModal,
});

function handleCreate() {
  groupCreateModalApi.open();
}

function handleCreateSuccess() {
  gridApi.query();
}

function handleEdit(row: any) {
  // TODO: 實作編輯群組功能
  console.debug('編輯群組:', row);
}

function handleDelete(row: any) {
  // TODO: 實作刪除群組功能
  console.debug('刪除群組:', row);
}
</script>

<template>
  <Page :loading="loading" auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleCreate"> 新增群組 </ElButton>
      </template>
    </Grid>
    <GroupCreateModal @success="handleCreateSuccess" />
  </Page>
</template>
