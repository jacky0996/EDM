<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
  ElUpload,
} from 'element-plus';

import { useCkeditor } from './hooks/useCkeditor';
// Hooks
import { useForm } from './hooks/useForm';

import 'ckeditor5/ckeditor5.css';

const formRef = ref<any>(null);

const {
  form,
  rules,
  bannerPreviewUrl,
  previewVisible,
  previewDevice,
  beforeBannerUpload,
  handleBannerChange,
  handleSubmit,
  handleCancel,
  generatePreviewHtml,
  handlePreview,
} = useForm(formRef);

const {
  libraryVisible,
  libraryImages,
  libraryLoading,
  editorConfig,
  ClassicEditor,
  onEditorReady,
  handleLibraryUpload,
  insertLibraryImage,
} = useCkeditor();

/** 更新 Iframe 高度以消除內部捲軸 */
function updateIframeHeight(e: any) {
  const iframe = e.target;
  if (iframe && iframe.contentWindow) {
    iframe.style.height = 'px';
    const height = iframe.contentWindow.document.body.scrollHeight;
    iframe.style.height = `${height}px`;
  }
}
</script>

<template>
  <Page title="建立活動">
    <div class="p-6">
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <!-- Banner 上傳 -->
        <ElFormItem
          label="活動橫幅(預設夾帶華電標誌，點選後可以替換圖片)"
          prop="img_url"
          required
        >
          <ElUpload
            class="banner-uploader w-full"
            :show-file-list="false"
            :before-upload="beforeBannerUpload"
            action="#"
            :auto-upload="false"
            accept="image/*"
            :on-change="handleBannerChange"
          >
            <img
              v-if="bannerPreviewUrl"
              :src="bannerPreviewUrl"
              class="h-72 w-full rounded-lg border object-cover"
              alt="Banner 預覽"
            />
            <div
              v-else
              class="flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400"
            >
              <ElIcon class="mb-2 text-4xl text-gray-400">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 1 1 0-64h352z"
                  />
                </svg>
              </ElIcon>
              <span class="text-sm text-gray-500">點擊上傳活動橫幅</span>
              <span class="mt-5 text-4xl text-gray-400"
                >JPG / PNG / GIF / WebP，最大 5MB</span
              >
            </div>
          </ElUpload>
        </ElFormItem>

        <!-- 2. 活動類型 -->
        <ElFormItem label="活動類型" prop="activity_type" required>
          <ElSelect
            v-model="form.activity_type"
            placeholder="請選擇活動類型"
            class="custom-height w-full"
            clearable
          >
            <ElOption label="會議" :value="0" />
            <ElOption label="工作坊" :value="1" />
            <ElOption label="記者會" :value="2" />
            <ElOption label="標準制定會議" :value="3" />
            <ElOption label="創意競賽" :value="4" />
            <ElOption label="其他活動" :value="5" />
          </ElSelect>
        </ElFormItem>

        <!-- 3. 活動名稱 -->
        <ElFormItem label="活動名稱" prop="title" required>
          <ElInput
            v-model="form.title"
            placeholder="請輸入活動名稱"
            clearable
            maxlength="100"
            show-word-limit
            class="custom-height"
          />
        </ElFormItem>

        <!-- 4. 報名表與審核設定 -->
        <div
          class="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 font-bold"
        >
          <ElFormItem
            label="是否需要報名表"
            prop="is_registration"
            class="mb-0 text-primary"
          >
            <ElSwitch v-model="form.is_registration" />
          </ElFormItem>

          <ElFormItem
            v-if="form.is_registration"
            label="報名表是否需要審核"
            prop="is_approval"
            class="mb-0 text-primary"
          >
            <ElSwitch v-model="form.is_approval" />
          </ElFormItem>
        </div>

        <!-- 活動簡介 -->
        <ElFormItem label="活動簡介" prop="summary" required>
          <ElInput
            v-model="form.summary"
            type="textarea"
            :rows="4"
            placeholder="請輸入活動簡介"
            maxlength="1000"
            show-word-limit
          />
        </ElFormItem>

        <!-- 活動時間 -->
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="開始時間" prop="start_time" required>
            <ElDatePicker
              v-model="form.start_time"
              type="datetime"
              placeholder="請選擇開始時間"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="custom-height w-full"
            />
          </ElFormItem>

          <ElFormItem label="結束時間" prop="end_time" required>
            <ElDatePicker
              v-model="form.end_time"
              type="datetime"
              placeholder="請選擇結束時間"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="
                (time: Date) =>
                  form.start_time ? time < new Date(form.start_time) : false
              "
              class="custom-height w-full"
            />
          </ElFormItem>
        </div>

        <!-- 活動地標 -->
        <ElFormItem label="活動地標" prop="landmark" required>
          <ElInput
            v-model="form.landmark"
            placeholder="請輸入活動地標"
            clearable
            class="custom-height"
          />
        </ElFormItem>

        <!-- 活動地址 -->
        <ElFormItem label="活動地址" prop="address" required>
          <ElInput
            v-model="form.address"
            placeholder="請輸入活動地址"
            clearable
            class="custom-height"
          />
        </ElFormItem>

        <!-- CKEditor 活動內容 -->
        <ElFormItem label="活動內容" prop="content" required>
          <Ckeditor
            v-model="form.content"
            :editor="ClassicEditor"
            :config="editorConfig"
            @ready="onEditorReady"
          />
        </ElFormItem>

        <!-- 按鈕區：調整為與詳細頁一致的一左一右佈局 -->
        <div class="mt-8 flex items-center justify-between border-t py-6">
          <ElButton size="large" @click="handleCancel"> 返回列表 </ElButton>

          <div class="flex gap-4">
            <ElButton size="large" @click="handlePreview"> 測試預覽 </ElButton>
            <ElButton type="primary" size="large" @click="handleSubmit">
              建立活動
            </ElButton>
          </div>
        </div>
      </ElForm>

      <!-- 預覽 Dialog -->
      <ElDialog
        v-model="previewVisible"
        title="郵件預覽"
        width="95%"
        top="2vh"
        destroy-on-close
        class="gmail-preview-dialog"
      >
        <div
          class="flex min-h-[85vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-inner"
        >
          <!-- 裝置切換列 -->
          <div
            class="device-switcher sticky top-0 z-10 flex items-center justify-center gap-4 border-b bg-white py-4"
          >
            <ElRadioGroup v-model="previewDevice">
              <ElRadioButton label="web">電腦瀏覽器</ElRadioButton>
              <ElRadioButton label="mobile">移動端手機</ElRadioButton>
            </ElRadioGroup>
          </div>

          <!-- Web 模式 -->
          <div
            v-if="previewDevice === 'web'"
            class="gmail-web-shell flex flex-1 flex-col"
          >
            <!-- Gmail 頂部搜尋欄模擬 -->
            <div
              class="flex h-16 shrink-0 items-center justify-between border-b bg-white px-8"
            >
              <div class="flex items-center gap-6">
                <span
                  class="rounded bg-gray-100 px-3 py-1 text-2xl font-bold text-gray-700"
                  >Gmail</span
                >
                <div
                  class="flex h-11 w-[600px] items-center rounded-xl border border-transparent bg-blue-50 px-4 text-gray-500 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
                >
                  搜尋郵件
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div
                  class="h-10 w-10 rounded-full border-2 border-white bg-blue-500 shadow-sm"
                ></div>
              </div>
            </div>

            <div class="flex flex-1 overflow-hidden">
              <!-- 左側選單 -->
              <div class="flex w-64 flex-col gap-1 p-4">
                <div
                  class="mb-4 w-32 rounded-2xl bg-[#c2e7ff] px-6 py-4 text-center font-medium text-[#001d35] shadow-sm"
                >
                  撰寫
                </div>
                <div
                  class="rounded-full bg-[#d3e3fd] px-6 py-1.5 font-bold text-[#041e49]"
                >
                  收件匣
                </div>
                <div
                  class="cursor-pointer rounded-full px-6 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  星號郵件
                </div>
                <div
                  class="cursor-pointer rounded-full px-6 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  已傳送
                </div>
                <div
                  class="cursor-pointer rounded-full px-6 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  草稿
                </div>
              </div>

              <!-- 右側郵件內容區 -->
              <div
                class="relative m-4 flex-1 overflow-auto rounded-2xl bg-white p-8 shadow-sm"
              >
                <div class="mb-6 text-2xl font-normal text-gray-800">
                  {{ form.title || '（無主旨）' }}
                </div>

                <div class="mb-8 flex items-center gap-3 border-b pb-8">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white"
                  >
                    H
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-bold">
                      華電管理員
                      <span class="text-xs font-normal text-secondary"
                        >&lt;admin@hwacom.com&gt;</span
                      >
                    </div>
                    <div class="text-xs text-secondary">寄給「我」</div>
                  </div>
                </div>

                <div class="iframe-wrapper flex w-full justify-center">
                  <iframe
                    title="Gmail Web Preview"
                    :srcdoc="generatePreviewHtml()"
                    scrolling="no"
                    @load="updateIframeHeight"
                    style="
                      width: 100%;
                      background-color: transparent;
                      border: none;
                    "
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile 模式 -->
          <div
            v-else
            class="gmail-mobile-shell flex h-[85vh] flex-col items-center overflow-y-auto py-8"
          >
            <div
              class="mobile-device-frame relative h-[820px] w-[412px] rounded-[60px] border-[8px] border-gray-800 bg-black p-4 shadow-2xl"
            >
              <div
                class="absolute left-1/2 top-0 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-black"
              ></div>
              <div
                class="flex h-full w-full flex-col overflow-hidden rounded-[40px] bg-white"
              >
                <div
                  class="mt-4 flex h-12 items-center justify-between border-b px-4"
                >
                  <span class="font-bold">Gmail</span>
                  <div class="h-8 w-8 rounded-full bg-blue-500"></div>
                </div>
                <div class="flex-1 overflow-auto p-4">
                  <div class="mb-4 text-xl font-medium">
                    {{ form.title || '（無主旨）' }}
                  </div>
                  <div class="mb-4 flex items-center gap-2">
                    <div class="h-8 w-8 rounded-full bg-blue-500"></div>
                    <div>
                      <div class="text-sm font-bold">
                        管理員 <span class="text-xs font-normal">12:30</span>
                      </div>
                      <div class="text-xs font-normal text-secondary">
                        寄給 我
                      </div>
                    </div>
                  </div>
                  <div class="iframe-wrapper">
                    <iframe
                      title="Gmail Mobile Preview"
                      :srcdoc="generatePreviewHtml()"
                      scrolling="no"
                      @load="updateIframeHeight"
                      class="w-full border-none"
                      style="min-height: 400px"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElDialog>

      <!-- 圖片庫 Dialog -->
      <ElDialog
        v-model="libraryVisible"
        title="圖片庫與上傳管理"
        width="800"
        destroy-on-close
      >
        <div class="library-container p-4">
          <div class="mb-4">
            <ElUpload
              drag
              action=""
              :http-request="handleLibraryUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <div class="el-upload__text">
                將檔案拖到此處，或<em>點擊上傳</em>
              </div>
            </ElUpload>
          </div>

          <div
            v-loading="libraryLoading"
            class="image-grid mt-8 grid max-h-[400px] grid-cols-4 gap-4 overflow-auto p-2"
          >
            <div
              v-for="(url, index) in libraryImages"
              :key="index"
              class="group relative h-32 cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-all hover:border-blue-500"
              @click="insertLibraryImage(url)"
            >
              <img :src="url" class="h-full w-full object-cover" />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span class="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                  >插入圖片</span
                >
              </div>
            </div>
            <div
              v-if="libraryImages.length === 0"
              class="col-span-4 py-8 text-center text-gray-400"
            >
              尚無圖片，請先上傳
            </div>
          </div>
        </div>
      </ElDialog>
    </div>
  </Page>
</template>

<style scoped src="./create.css"></style>
<style>
/* stylelint-disable-next-line selector-class-pattern */
.ck-editor__editable_inline {
  min-height: 400px;
}
</style>
