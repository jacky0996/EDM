import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { requestClient } from '#/api/request';
import {
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  Plugin,
  Table,
  TableToolbar,
  TableColumnResize,
  TableCaption,
  Undo,
  ButtonView
} from 'ckeditor5';

/** 自定義上傳適配器 */
class MyUploadAdapter {
  loader: any;
  constructor(loader: any) {
    this.loader = loader;
    console.log('Adapter created');
  }

  upload() {
    console.log('Upload method triggered');
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          console.log('Preparing upload...', file);
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'ckeditor');

          requestClient
            .post('/edm/event/imageUpload', formData)
            .then((res: any) => {
              if (res.previewPath) {
                console.log('Upload success:', res.previewPath);
                resolve({ default: res.previewPath });
              } else {
                reject('上傳失敗：伺服器未返回 previewPath');
              }
            })
            .catch((err: any) => {
              console.error('Upload failed:', err);
              reject(err.message || '上傳發生錯誤');
            });
        }),
    );
  }

  abort() {}
}

export function useCkeditor() {
  const libraryVisible = ref(false);
  const libraryImages = ref<string[]>([]);
  const libraryLoading = ref(false);
  const editorInstance = ref<any>(null);

  /** 註冊適配器插件 */
  function MyCustomUploadAdapterPlugin(editor: any) {
    console.log('Registering UploadAdapter');
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new MyUploadAdapter(loader);
    };
  }

  /** 獲取圖片庫列表 */
  async function fetchLibraryImages() {
    try {
      libraryLoading.value = true;
      console.log('Fetching library images from /edm/event/getImage...');
      
      // 設定 responseReturn: 'body' 以避開全域攔截器對 code: 0 的強制檢查
      const res: any = await requestClient.post('/edm/event/getImage', {}, {
        responseReturn: 'body',
      });

      console.log('API Response received:', res);

      const baseUrl = 'http://172.19.199.25/home/hwacommis/edm/uat/ckeditor/';

      // 支援 { code: 200, data: [...] } 或直接是陣列
      let rawData = [];
      if (res && res.code === 200 && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (Array.isArray(res)) {
        rawData = res;
      }

      console.log('Extracted raw image data:', rawData);

      if (rawData.length > 0) {
        libraryImages.value = rawData.map((item: any) => {
          // 如果項目的屬性是字串（純 URL），直接回傳
          if (typeof item === 'string') return item;
          // 如果是物件（如您提供的結構），則拼接 baseUrl + name
          const name = item.name || item.url || '';
          return name.startsWith('http') ? name : `${baseUrl}${name}`;
        });
      } else {
        libraryImages.value = [];
      }

      console.log('Final libraryImages state:', libraryImages.value);
    } catch (error: any) {
      console.error('Fetch library images error:', error);
      ElMessage.error(error.message || '無法讀取圖片庫清單');
    } finally {
      libraryLoading.value = false;
    }
  }

  /** 圖片庫按鈕插件 */
  class ImageLibraryPlugin extends Plugin {
    init() {
      const editor = this.editor;
      editor.ui.componentFactory.add('imageLibrary', (locale) => {
        const view = new ButtonView(locale);
        view.set({
          label: '圖片庫',
          withText: true,
          tooltip: true,
        });
        view.on('execute', () => {
          fetchLibraryImages();
          libraryVisible.value = true;
        });
        return view;
      });
    }
  }

  const editorConfig = {
    licenseKey: 'GPL',
    placeholder: '請輸入活動內容...',
    extraPlugins: [MyCustomUploadAdapterPlugin, ImageLibraryPlugin],
    plugins: [
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Link,
      List,
      Undo,
      FontSize,
      FontColor,
      FontBackgroundColor,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageUpload,
      ImageResize,
      Table,
      TableToolbar,
      TableColumnResize,
      TableCaption,
    ],
    toolbar: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      '|',
      'link',
      'imageLibrary',
      'insertTable',
      '|',
      'bulletedList',
      'numberedList',
    ],
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
      ],
    },
  };

  const onEditorReady = (editor: any) => {
    editorInstance.value = editor;
  };

  /** 圖片庫上傳 */
  async function handleLibraryUpload(option: any) {
    console.log('Library upload triggered:', option.file);
    const formData = new FormData();
    formData.append('file', option.file);
    formData.append('type', 'ckeditor');

    try {
      libraryLoading.value = true;
      console.log('Sending Library request to /edm/event/imageUpload...');
      const res: any = await requestClient.post(
        '/edm/event/imageUpload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Library response:', res);
      if (res.previewPath || res.url || res.data?.url) {
        ElMessage.success('上傳成功');
        await fetchLibraryImages(); // 上傳成功後重新獲取清單
      }
    } catch (error) {
      console.error('Library upload error:', error);
      ElMessage.error('上傳失敗');
    } finally {
      libraryLoading.value = false;
    }
  }

  /** 點選圖片庫中的圖片 */
  function insertLibraryImage(url: string) {
    if (editorInstance.value) {
      editorInstance.value.model.change((writer: any) => {
        const imageElement = writer.createElement('imageBlock', {
          src: url,
        });
        editorInstance.value.model.insertContent(imageElement);
      });
      libraryVisible.value = false;
    }
  }

  return {
    libraryVisible,
    libraryImages,
    libraryLoading,
    editorConfig,
    ClassicEditor,
    onEditorReady,
    handleLibraryUpload,
    insertLibraryImage,
  };
}
