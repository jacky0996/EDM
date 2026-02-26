<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { ElMessage } from 'element-plus';
import { createGroupApi } from '#/api/group';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'group_name',
      label: '群組名稱',
      rules: 'required',
      componentProps: {
        placeholder: '請輸入群組名稱',
      },
    },
    {
      component: 'Input',
      fieldName: 'note',
      label: '備註',
      componentProps: {
        type: 'textarea',
        placeholder: '請輸入備註 (選填)',
        rows: 3,
      },
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  title: '新增群組',
  onConfirm: async () => {
    try {
      modalApi.setState({ confirmLoading: true });
      const { valid } = await formApi.validate();
      if (!valid) return;

      const values = await formApi.getValues();
      await createGroupApi(values as any);
      
      ElMessage.success('群組建立成功');
      emit('success');
      modalApi.close();
    } catch (error) {
      console.error('建立群組失敗:', error);
      ElMessage.error('建立群組失敗');
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange: (isOpen) => {
    if (isOpen) {
      formApi.resetForm();
    }
  },
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
