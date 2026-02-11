import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';

import { ElTag } from 'element-plus';

interface RowType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  email: string;
  createTime: string;
}

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
      componentProps: {
        placeholder: '請輸入姓名',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '狀態',
      componentProps: {
        options: [
          { label: '已啟用', value: 'active' },
          { label: '已禁用', value: 'inactive' },
        ],
        placeholder: '請選擇狀態',
      },
    },
  ],
  // 是否在字段值改變時提交表單
  submitOnChange: true,
  // 按下回車時是否提交表單
  submitOnEnter: true,
};

import { getMemberListApi } from '#/api/member';

const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序號', type: 'seq', width: 60 },
    { field: 'name', title: '姓名' },
    {
      field: 'status',
      title: '狀態',
      slots: {
        default: ({ row }) => {
          const type = row.status === 'active' ? 'success' : 'danger';
          const text = row.status === 'active' ? '已啟用' : '已禁用';
          return h(ElTag, { type }, { default: () => text });
        },
      },
    },
    { field: 'email', title: '信箱' },
    { field: 'createTime', title: '註冊時間' },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getMemberListApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

export { formOptions, gridOptions };
export type { RowType };
