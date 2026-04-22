import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:file-text',
      order: 2,
      title: 'SA 文件',
    },
    name: 'SADocsGroup',
    path: '/sa-docs',
    redirect: '/sa-docs/uml',
    children: [
      {
        name: 'SADocsUML',
        path: 'uml',
        component: () => import('#/views/system/uml/index.vue'),
        meta: {
          icon: 'lucide:file-json-2',
          title: 'UML 展示',
        },
      },
      {
        name: 'SADocsRequirement',
        path: 'requirement',
        component: () => import('#/views/sa-docs/placeholder.vue'),
        meta: {
          icon: 'lucide:clipboard-list',
          title: '需求規格書',
        },
      },
      {
        name: 'SADocsUseCase',
        path: 'use-case',
        component: () => import('#/views/sa-docs/placeholder.vue'),
        meta: {
          icon: 'lucide:user-check',
          title: '使用案例圖',
        },
      },
      {
        name: 'SADocsArchitecture',
        path: 'architecture',
        component: () => import('#/views/sa-docs/placeholder.vue'),
        meta: {
          icon: 'lucide:network',
          title: '系統架構圖',
        },
      },
      {
        name: 'SADocsERDiagram',
        path: 'er-diagram',
        component: () => import('#/views/sa-docs/placeholder.vue'),
        meta: {
          icon: 'lucide:database',
          title: 'ER 圖',
        },
      },
      {
        name: 'SADocsApi',
        path: 'api',
        component: () => import('#/views/sa-docs/placeholder.vue'),
        meta: {
          icon: 'lucide:plug',
          title: 'API 文件',
        },
      },
    ],
  },
];

export default routes;
