<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

const route = useRoute();
const title = computed(() => (route.meta?.title as string) ?? 'SA 文件');
</script>

<template>
  <Page :title="title">
    <div class="p-6">
      <el-card shadow="never">
        <div class="flex flex-col items-center gap-3 py-12 text-center">
          <div class="text-5xl">📄</div>
          <div class="text-lg font-semibold">{{ title }}</div>
          <div class="text-sm text-gray-500">此文件尚未撰寫，施工中…</div>
        </div>
      </el-card>
    </div>
  </Page>
</template>
