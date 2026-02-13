import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 獲取使用者資訊
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}
