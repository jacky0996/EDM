import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-check',
      order: 10,
      title: '測試項目',
      hideChildrenInMenu: true, // 隱藏子選單，使根節點成為單一可點擊項目
    },
    name: 'TestGuide',
    path: '/testing',
    redirect: '/testing/index',
    children: [
      {
        name: 'TestingIndex',
        path: 'index',
        component: () => import('#/views/guide/test-guide.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:clipboard-check',
          title: '測試項目',
        },
      },
    ],
  },
];

export default routes;
