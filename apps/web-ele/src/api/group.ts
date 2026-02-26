import { requestClient } from '#/api/request';

/**
 * 獲取群組列表
 */
export async function getGroupListApi(params: any) {
  return requestClient.post('/edm/group/list', params);
}

/**
 * 獲取群組詳情
 */
export async function getGroupDetailApi(id: string | number) {
  return requestClient.post('/edm/group/view', { id });
}
/**
 * 更新群組狀態
 */
export async function updateGroupStatusApi(groupId: string | number, status: number) {
  return requestClient.post('/edm/group/editStatus', { group_id: groupId, status });
}
/**
 * 建立群組
 */
export async function createGroupApi(data: { group_name: string; note?: string }) {
  return requestClient.post('/edm/group/create', data);
}
