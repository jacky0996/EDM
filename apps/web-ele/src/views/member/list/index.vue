<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { formOptions, gridOptions } from './member.data.ts';

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

function handleImport() {
  alert('匯入人員名單功能開發中...');
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleImport"> 匯入人員名單 </ElButton>
      </template>
    </Grid>
  </Page>
</template>
