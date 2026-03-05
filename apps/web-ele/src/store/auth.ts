import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
  verifySsoTokenApi,
} from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 非同步處理登入操作
   * Asynchronously handle the login process
   * @param params 登入表單資料
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 非同步處理使用者登入操作並獲取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);

      // 如果成功獲取到 accessToken
      if (accessToken) {
        // 將 accessToken 儲存到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // 獲取使用者資訊並儲存到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  /**
   * 處理 SSO 登入 (Token 交換)
   * @param token 來自 URL 的 SSO Token
   */
  async function ssoLogin(token: string) {
    const maxRetries = 10;
    const retryInterval = 5 * 60 * 1000; // 5 分鐘 (依照使用者排障需求設定)
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        loginLoading.value = true;
        console.log(`[SSO] 正在執行第 ${retryCount + 1} 次驗證嘗試...`);

        const { accessToken, userInfo } = await verifySsoTokenApi(token);

        if (accessToken) {
          // 儲存 Token
          accessStore.setAccessToken(accessToken);
          // 儲存使用者資訊
          userStore.setUserInfo(userInfo);

          // 紀錄最後活動時間 (Session 續期用)
          localStorage.setItem('edm_last_activity', Date.now().toString());

          // 獲取權限碼
          const accessCodes = await getAccessCodesApi();
          accessStore.setAccessCodes(accessCodes);

          console.log('[SSO] 驗證成功，進入系統。');
          return true;
        }
      } catch (error: any) {
        retryCount++;
        console.error(`[SSO] 第 ${retryCount} 次驗證失敗:`, error);

        if (retryCount < maxRetries) {
          const nextRetryMin = retryInterval / 60000;
          console.warn(
            `[SSO] 為了方便您排障，系統將在 ${nextRetryMin} 分鐘後進行下次重試。請在此期間檢查 F12 Network 與 API 格式。`,
          );
          // 使用簡單的 Promise 進行等待
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
      } finally {
        loginLoading.value = false;
      }
    }

    console.error('[SSO] 已達到最大重試次數，驗證失敗。');
    return false;
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何處理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登入頁帶上當前路由位址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    ssoLogin,
  };
});
