import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus';

export function useForm(formRef: any) {
  const router = useRouter();
  
  const form = reactive({
    title: '',
    description: '',
    start_time: '' as null | string,
    end_time: '' as null | string,
    landmark: '',
    address: '',
    banner_url: '',
    content: '',
  });

  const bannerPreviewUrl = ref<string>('');
  const uploading = ref(false);

  /** 表單驗證規則 */
  const rules: FormRules = {
    title: [{ required: true, message: '請輸入活動名稱', trigger: 'blur' }],
    description: [{ required: true, message: '請輸入活動簡介', trigger: 'blur' }],
    start_time: [{ required: true, message: '請選擇開始時間', trigger: 'change' }],
    end_time: [{ required: true, message: '請選擇結束時間', trigger: 'change' }],
    landmark: [{ required: true, message: '請輸入活動地標', trigger: 'blur' }],
    address: [{ required: true, message: '請輸入活動地址', trigger: 'blur' }],
    banner_url: [{ required: true, message: '請上傳活動橫幅', trigger: 'change' }],
    content: [{ required: true, message: '請輸入活動內容', trigger: 'blur' }],
  };

  /** 上傳前確認格式 */
  const beforeBannerUpload: UploadProps['beforeUpload'] = (rawFile) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(rawFile.type)) {
      ElMessage.error('僅支援 JPG、PNG、GIF、WebP 格式');
      return false;
    }
    if (rawFile.size / 1024 / 1024 > 5) {
      ElMessage.error('圖片大小不得超過 5MB');
      return false;
    }
    return true;
  };

  /** 選擇檔案後即時預覽 */
  function handleBannerChange(file: UploadFile) {
    if (file.raw) {
      bannerPreviewUrl.value = URL.createObjectURL(file.raw);
      form.banner_url = bannerPreviewUrl.value;
      formRef.value?.validateField('banner_url');
    }
  }

  /** 送出表單 */
  async function handleSubmit() {
    try {
      await formRef.value?.validate();
      ElMessage.success('建立成功');
      router.push('/event/list');
    } catch (error) {
      console.error(error);
      ElMessage.error('請確認表單位填寫正確');
    }
  }

  function handleCancel() {
    router.push('/event/list');
  }

  /** 預覽相關數據生成 */
  const previewVisible = ref(false);
  const previewDevice = ref<'web' | 'mobile'>('web');

  function generatePreviewHtml() {
    const banner = form.banner_url || 'https://via.placeholder.com/1200x300?text=Event+Banner';
    return `
      <!DOCTYPE html>
      <html style="overflow: hidden;">
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; overflow: hidden; }
            .container { width: 100%; max-width: ${previewDevice.value === 'web' ? '100%' : '375px'}; margin: 0 auto; background: #fff; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .banner { width: 100%; height: auto; display: block; }
            .body { padding: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1a73e8; }
            .info { background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px; margin: 20px 0; font-size: 14px; }
            .content { line-height: 1.6; font-size: 15px; margin-top: 25px; }
            .content img { max-width: 100%; height: auto; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #fafafa; border-top: 1px solid #efefef; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${banner}" class="banner" alt="Banner" />
            <div class="body">
              <div class="title">${form.title || '（未輸入名稱）'}</div>
              <div class="info">
                <div><strong>📍 地標：</strong>${form.landmark || '-'}</div>
                <div><strong>📅 時間：</strong>${form.start_time || '-'} ~ ${form.end_time || '-'}</div>
              </div>
              <div class="content">${form.content || '請輸入活動內容...'}</div>
            </div>
            <div class="footer">本郵件由 華電聯網 系統自動發送</div>
          </div>
        </body>
      </html>
    `;
  }

  function handlePreview() {
    previewVisible.value = true;
  }

  return {
    form,
    rules,
    bannerPreviewUrl,
    uploading,
    previewVisible,
    previewDevice,
    beforeBannerUpload,
    handleBannerChange,
    handleSubmit,
    handleCancel,
    generatePreviewHtml,
    handlePreview,
  };
}
