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
                userInfo?.homePath || preferences.app.defaultHomePath,
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
   * 處理 SSO 登入 (Token 交換) - 安全重試 10 次版
   * @param token 來自 URL 的 SSO Token
   */
  async function ssoLogin(token: string) {
    const maxRetries = 10;
    const retryInterval = 1000;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        loginLoading.value = true;
        const res: any = await verifySsoTokenApi(token);
        console.log('[SSO Debug] 原始回傳內容：', res);

        // --- 多層級相容性處理 ---
        // 1. 判斷是否為 Axios Response 物件 (如果是，取其 .data)
        const jsonRoot = res?.status !== undefined ? res.data : res;
        
        // 2. 判斷 payload 位址 (有些結構會把 Token 放在 jsonRoot.data 裡面)
        const payload = (jsonRoot?.data?.accessToken) ? jsonRoot.data : jsonRoot;

        // 成功判定：檢查 code 是否為 0 且 payload 裡擁有 accessToken
        if (jsonRoot && jsonRoot.code === 0 && payload?.accessToken) {
          accessStore.setAccessToken(payload.accessToken);
          
          // 💡 取得使用者資訊 (相容各種回傳巢狀結構)
          const userInfo = payload.userInfo || payload.data?.userInfo || jsonRoot.data;
          
          if (userInfo) {
            // 🌟 2. 存入 Pinia (用於 UI)
            userStore.setUserInfo({
              ...userInfo,
              realName: userInfo.realName || userInfo.name || 'SSO User',
            });

            // 🌟 3. 持久化存入 localStorage (用於 request Header 抓取，防止 Store 循環引用)
            localStorage.setItem('ACCESS_TOKEN_USER_INFO', JSON.stringify({
              ...userInfo,
              realName: userInfo.realName || userInfo.name || 'SSO User',
            }));

            console.log(`[SSO] 登錄成功:`, userStore.userInfo?.realName);
            return true;
          }
          throw new Error('回傳中找不到使用者資訊');
        }
        
        throw new Error(`驗證未通過 (Code: ${jsonRoot?.code}, Message: ${jsonRoot?.message})`);
      } catch (error: any) {
        retryCount++;
        console.warn(`[SSO] 驗證失敗 (嘗試 ${retryCount}/${maxRetries}):`, error.message || error);

        if (retryCount >= maxRetries) {
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } finally {
        loginLoading.value = false;
      }
    }
    return false;
  }

  /**
   * 登出並導回 SSO 登入頁 (依環境變數跳轉)
   */
  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 靜默處理
    }
    
    // 1. 各項 Store 與緩存清空
    resetAllStores();
    accessStore.setAccessToken(null);
    localStorage.removeItem('ACCESS_TOKEN_USER_INFO');
    
    // 2. 🌟 SSO 全環境動態跳轉
    if (redirect) {
      // 優先讀取環境變數 (例如: http://127.0.0.1:8000, https://uathws.hwacom.com, https://hws.hwacom.com)
      const hwsBaseUrl = (import.meta.env.VITE_HWS_URL || 'http://127.0.0.1:8000/').replace(/\/+$/, '/');
      const redirectParam = encodeURIComponent(window.location.href);

      console.log(`[SSO] 正在導回 SSO 認證中心: ${hwsBaseUrl}`);

      // 執行全頁面跳轉 (強制結束當前應用狀態)
      window.location.href = `${hwsBaseUrl}login?redirect=${redirectParam}`;
    }
  }

  async function fetchUserInfo() {
    // 優化：如果 store 中已經有使用者資訊，則不再重複呼叫 API
    if (userStore.userInfo && (userStore.userInfo as any).userId) {
      console.log('[Auth] 使用快取中的使用者資訊，略過 API 請求。');
      return userStore.userInfo as UserInfo;
    }

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
