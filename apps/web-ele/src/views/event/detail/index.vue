<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
  ElTabPane,
  ElTabs,
  ElUpload,
} from 'element-plus';

// 注意：若 useCkeditor 在 create 內，建議移出共用，此處暫以相對路徑或重寫處理。
// 為了避免路徑混淆，臨時引入原本的 (假設能正確解析，若報錯後續再修正)
import { useCkeditor } from '../create/hooks/useCkeditor';
import ApprovalList from './components/ApprovalList.vue';
import EventAnalytics from './components/EventAnalytics.vue';
// 子元件
import InvitationList from './components/InvitationList.vue';
import RegistrationForm from './components/RegistrationForm.vue';
import SurveyForm from './components/SurveyForm.vue';
import ThankyouForm from './components/ThankyouForm.vue';
// Hooks (重用列表元件或新寫的 hook)
import { useDetailForm } from './hooks/useDetailForm';

import 'ckeditor5/ckeditor5.css';

const formRef = ref<any>(null);

const {
  form,
  rules,
  bannerPreviewUrl,
  loading,
  isReadonly,
  previewVisible,
  previewDevice,
  beforeBannerUpload,
  handleBannerChange,
  toggleEdit,
  cancelEdit,
  handleSubmit,
  handleBack,
  generatePreviewHtml,
  handlePreview,
} = useDetailForm(formRef);

const { editorConfig, ClassicEditor, onEditorReady } = useCkeditor();

const activeTab = ref('detail');

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
  <!-- 外層 Loading 遮罩 -->
  <Page
    :title="isReadonly ? '活動資料檢視' : '編輯活動資料'"
    v-loading="loading"
  >
    <div class="p-4">
      <el-card shadow="never" class="border-0 bg-transparent">
        <ElTabs v-model="activeTab" type="border-card">
          <!-- ===== 1. 活動預覽 (詳細頁) ===== -->
          <ElTabPane label="活動預覽(詳細頁)" name="detail">
            <div class="p-6">
              <ElForm
                ref="formRef"
                :model="form"
                :rules="rules"
                label-position="top"
                class="space-y-6"
                :disabled="isReadonly"
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
                    :disabled="isReadonly"
                  >
                    <div
                      class="group relative w-full overflow-hidden rounded-lg"
                    >
                      <img
                        v-if="bannerPreviewUrl"
                        :src="bannerPreviewUrl"
                        class="h-72 w-full object-cover transition-opacity"
                        :class="{ 'group-hover:opacity-80': !isReadonly }"
                        alt="Banner 預覽"
                      />
                      <div
                        v-else
                        class="flex h-72 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400"
                      >
                        <ElIcon class="mb-2 text-4xl text-gray-400">
                          <svg
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="currentColor"
                              d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 1 1 0-64h352z"
                            />
                          </svg>
                        </ElIcon>
                        <span class="text-sm text-gray-500"
                          >點擊上傳活動橫幅</span
                        >
                      </div>

                      <!-- 遮罩提示 -->
                      <div
                        v-if="!isReadonly && bannerPreviewUrl"
                        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <span class="font-medium text-white">點擊更換圖片</span>
                      </div>
                    </div>
                  </ElUpload>
                </ElFormItem>

                <!-- 1. 活動編號 -->
                <ElFormItem label="活動編號" prop="event_number">
                  <ElInput
                    v-model="form.event_number"
                    placeholder="請輸入活動編號"
                    :disabled="true"
                    class="custom-height"
                  />
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

                <!-- 報名表與審核設定 -->
                <div
                  class="mb-6 grid grid-cols-2 gap-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 font-bold"
                >
                  <ElFormItem
                    label="是否需要報名表"
                    prop="is_registration"
                    class="mb-0 text-primary"
                  >
                    <template #label>
                      <span class="flex items-center gap-2">
                        <ElIcon
                          ><svg
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="currentColor"
                              d="M128 832V128h640v192h192v512H128zm640-512H512V128H192v640h704V320H768z"
                            /></svg
                        ></ElIcon>
                        是否需要報名表
                      </span>
                    </template>
                    <ElSwitch
                      v-model="form.is_registration"
                      :active-value="1"
                      :inactive-value="0"
                      active-text="需報名"
                      inactive-text="不需報名"
                      inline-prompt
                      :disabled="isReadonly"
                    />
                  </ElFormItem>

                  <ElFormItem
                    v-if="form.is_registration === 1"
                    label="報名人員需審核"
                    prop="is_approve"
                    class="mb-0 text-orange-600"
                  >
                    <template #label>
                      <span class="flex items-center gap-2 text-orange-600">
                        <ElIcon
                          ><svg
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="currentColor"
                              d="M512 512a160 160 0 1 0 0-320 160 160 0 0 0 0 320zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-32a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v32a32 32 0 1 1-64 0v-32a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v32a32 32 0 1 1-64 0z"
                            /></svg
                        ></ElIcon>
                        報名人員需審核
                      </span>
                    </template>
                    <ElSwitch
                      v-model="form.is_approve"
                      :active-value="1"
                      :inactive-value="0"
                      active-text="需審核"
                      inactive-text="免審核"
                      inline-prompt
                      active-color="#ea580c"
                      :disabled="isReadonly"
                    />
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
                          form.start_time
                            ? time < new Date(form.start_time)
                            : false
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
                  <div
                    class="w-full"
                    :class="{ 'pointer-events-none opacity-80': isReadonly }"
                  >
                    <Ckeditor
                      v-model="form.content"
                      :editor="ClassicEditor"
                      :config="editorConfig"
                      @ready="onEditorReady"
                      :disabled="isReadonly"
                    />
                  </div>
                </ElFormItem>
              </ElForm>

              <!-- 按鈕區 -->
              <div class="mt-8 flex items-center justify-between border-t py-4">
                <ElButton size="large" @click="handleBack">返回列表</ElButton>

                <div class="flex gap-4">
                  <ElButton
                    size="large"
                    @click="handlePreview"
                    :disabled="false"
                  >
                    測試預覽
                  </ElButton>

                  <template v-if="isReadonly">
                    <ElButton type="primary" size="large" @click="toggleEdit">
                      編輯
                    </ElButton>
                  </template>

                  <template v-else>
                    <ElButton
                      type="danger"
                      size="large"
                      @click="cancelEdit"
                      plain
                    >
                      取消
                    </ElButton>
                    <ElButton type="success" size="large" @click="handleSubmit">
                      儲存更新
                    </ElButton>
                  </template>
                </div>
              </div>
            </div>
          </ElTabPane>

          <!-- ===== 2. 報名表 ===== -->
          <ElTabPane label="報名表" name="registration">
            <div class="py-6">
              <RegistrationForm
                v-if="activeTab === 'registration' && form.id"
                :event-data="form"
              />
            </div>
          </ElTabPane>

          <!-- ===== 3. 邀請名單 ===== -->
          <ElTabPane label="邀請名單" name="invitation">
            <div class="py-6">
              <InvitationList
                v-if="activeTab === 'invitation' && form.id"
                :event-id="form.id"
              />
            </div>
          </ElTabPane>

          <!-- ===== 4. 審核名單 ===== -->
          <ElTabPane label="審核名單" name="approval">
            <div class="py-6">
              <ApprovalList
                v-if="activeTab === 'approval' && form.id"
                :event-data="form"
              />
            </div>
          </ElTabPane>

          <!-- ===== 5. 問券 ===== -->
          <ElTabPane label="問券" name="survey">
            <div class="py-6">
              <SurveyForm
                v-if="activeTab === 'survey' && form.id"
                :event-data="form"
              />
            </div>
          </ElTabPane>

          <!-- ===== 6. 活動分析 ===== -->
          <ElTabPane label="活動分析" name="analytics">
            <div class="py-6">
              <EventAnalytics
                v-if="activeTab === 'analytics' && form.id"
                :event-id="form.id"
              />
            </div>
          </ElTabPane>

          <!-- ===== 7. 感謝函 ===== -->
          <ElTabPane label="感謝函" name="thankyou">
            <div class="py-6">
              <ThankyouForm
                v-if="activeTab === 'thankyou' && form.id"
                :event-data="form"
              />
            </div>
          </ElTabPane>

          <!-- ===== 9. 設定 ===== -->
          <ElTabPane label="設定" name="settings">
            <div class="py-10">
              <ElEmpty description="設定功能建置中" />
            </div>
          </ElTabPane>
        </ElTabs>
      </el-card>

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
    </div>
  </Page>
</template>

<style scoped src="../create/create.css"></style>
<style scoped>
.custom-height :deep(.el-input__wrapper) {
  height: 48px;
}

/* stylelint-disable-next-line selector-class-pattern */
:deep(.ck-editor__editable_inline) {
  min-height: 400px;
}

:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: transparent;
  border-bottom: 1px solid #e4e7ed;
}

/* 隱藏手機預覽的預設原生滾動條，改用較細的自訂樣式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175 / 50%);
  border-radius: 4px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175 / 80%);
}
</style>
