import { requestClient } from '#/api/request';

/**
 * 獲取人員列表
 */
export async function getMemberListApi(params: any) {
  return requestClient.get('http://127.0.0.1:8000/api/ehr/member/list');
}
