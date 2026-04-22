import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:calendar-days',
      order: 10,
      title: '活動管理',
    },
    name: 'EventManagementGroup',
    path: '/event',
    children: [
      {
        name: 'EventList',
        path: 'list',
        component: () => import('#/views/event/list/index.vue'),
        meta: {
          title: '活動列表',
        },
      },
      {
        name: 'EventCreate',
        path: 'create',
        component: () => import('#/views/event/create/index.vue'),
        meta: {
          title: '建立活動',
          hideInMenu: true,
        },
      },
      {
        name: 'EventDetail',
        path: 'detail/:id',
        component: () => import('#/views/event/detail/index.vue'),
        meta: {
          title: '活動詳細與編輯',
          hideInMenu: true,
          currentActiveMenu: '/event/list',
        },
      },
      {
        name: 'EventPrivacy',
        path: 'privacy',
        component: () => import('#/views/event/privacy/index.vue'),
        meta: {
          title: '個資聲明',
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
