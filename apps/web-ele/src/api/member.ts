import { requestClient } from '#/api/request';

/**
 * 獲取人員列表
 */
export async function getMemberListApi(params: any) {
  return requestClient.post('/edm/member/list', params);
}
  
/**
 * 匯入人員名單
 */
export async function importMemberApi(data: any) {
  return requestClient.post('/edm/member/add', data);
}
/**
 * 獲取人員詳情
 */
export async function getMemberDetailApi(id: string | number) {
  return requestClient.post(`/edm/member/view`, { id });
}
/**
 * 更新人員狀態
 */
export async function updateMemberStatusApi(memberId: string | number, status: number) {
  return requestClient.post('/edm/member/editStatus', { member_id: memberId, status });
}
/**
 * 更新人員行動電話
 */
export async function updateMemberMobileApi(id: string | number, mobile: string) {
  return requestClient.post('/edm/member/editMobile', { id, mobile });
}

/**
 * 更新人員電子郵件
 */
export async function updateMemberEmailApi(id: string | number, email: string) {
  return requestClient.post('/edm/member/editEmail', { id, email });
}
