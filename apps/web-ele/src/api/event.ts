import { requestClient } from '#/api/request';

/**
 * 取得活動列表
 */
export async function getEventListApi(params: any) {
  return requestClient.post('/edm/event/list', params);
}

/**
 * 取得活動詳細資料
 */
export async function getEventDetailApi(params: { id: number | string }) {
  return requestClient.post('/edm/event/view', params);
}

/**
 * 更新活動詳細資料
 */
export async function updateEventApi(data: any) {
  return requestClient.post('/edm/event/update', data, {
    responseReturn: 'body',
  });
}

/**
 * 取得活動邀請名單
 */
export async function getInviteListApi(params: any) {
  return requestClient.post('/edm/event/getInviteList', params, {
    responseReturn: 'body',
  });
}

/**
 * 匯入群組至活動的邀請名單
 */
export async function importEventGroupApi(data: { event_id: string | number; group_id: string | number }) {
  return requestClient.post('/edm/event/importGroup', data, {
    responseReturn: 'body',
  });
}

/**
 * 寄送活動邀請信
 */
export async function sendInviteMailApi(data: { event_id: string | number; emails: string[] }) {
  return requestClient.post('/edm/mail/inviteMail', data, {
    responseReturn: 'body',
  });
}
