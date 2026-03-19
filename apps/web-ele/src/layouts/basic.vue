```
<script lang="ts" setup>

import { computed, watch } from 'vue';
import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { useAuthStore } from '#/store';
const userStore = useUserStore();
const authStore = useAuthStore();
const { destroyWatermark, updateWatermark } = useWatermark();

const menus = computed(() => [
  // 依要求隱藏個人中心與使用說明
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}


// 診斷：監聽人員資訊變動，確保資料載入後能立即看到內容
watch(
  () => userStore.userInfo,
  (info) => {
  },
  { immediate: true, deep: true }
);

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        :description="String(userStore.userInfo?.email || 'N/A')"
        @logout="handleLogout"
      />
      <!-- 測試用：在選單下面直接印出一段字確認 -->
      <div v-if="userStore.userInfo" style="display:none">
        Debug Info: {{ userStore.userInfo?.email }}
      </div>
    </template>
    <!-- 已隱藏右上角小鈴鐺與通知面板，未來依需求逐步開啟 -->
    <template #extra>
      <!-- 移除原生的 AuthenticationLoginExpiredModal，改於 API 攔截器直接導向 SSO -->
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
