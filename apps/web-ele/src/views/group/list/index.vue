<script setup lang="ts">
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import CreateGroupModal from './create-group-modal.vue';
import { formOptions, gridOptions } from './group.data';

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
