<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, reactive, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { ElCol, ElProgress, ElRow } from 'element-plus';

import { requestClient } from '#/api/request';

/**
 * 定義分析數據的強型別介面
 */
interface MailStats {
  total: number;
  read: number;
  unopened: number;
  deleted: number;
}

interface SurveyStats {
  total_invited: number;
  filled_invited: number;
  unfilled_invited: number;
  non_invited_responses: number;
  total_responses: number;
  has_google_form: boolean;
}

const props = defineProps<{
  eventId: number | string;
}>();

const stats = reactive({
  invitation: { total: 120, read: 80, unopened: 30, deleted: 10 } as MailStats,
  ticket: { total: 50, read: 42, unopened: 7, deleted: 1 } as MailStats,
  thankyou: { total: 40, read: 35, unopened: 5, deleted: 0 } as MailStats,
});

const survey = reactive<SurveyStats>({
  total_invited: 0,
  filled_invited: 0,
  unfilled_invited: 0,
  non_invited_responses: 0,
  total_responses: 0,
  has_google_form: false,
});

const invitationReadRate = computed<number>(() =>
  Math.round((stats.invitation.read / stats.invitation.total) * 100),
);
const invitationUnopenedRate = computed<number>(() =>
  Math.round((stats.invitation.unopened / stats.invitation.total) * 100),
);
const invitationDeletedRate = computed<number>(() =>
  Math.round((stats.invitation.deleted / stats.invitation.total) * 100),
);

const ticketReadRate = computed<number>(() =>
  Math.round((stats.ticket.read / stats.ticket.total) * 100),
);
const ticketUnopenedRate = computed<number>(() =>
  Math.round((stats.ticket.unopened / stats.ticket.total) * 100),
);
const ticketDeletedRate = computed<number>(() =>
  Math.round((stats.ticket.deleted / stats.ticket.total) * 100),
);

const surveyFillRate = computed<number>(() =>
  survey.total_invited > 0
    ? Math.round((survey.filled_invited / survey.total_invited) * 100)
    : 0,
);
const surveyUnopenedRate = computed<number>(() =>
  survey.total_invited > 0
    ? Math.round((survey.unfilled_invited / survey.total_invited) * 100)
    : 0,
);

const thankyouReadRate = computed<number>(() =>
  Math.round((stats.thankyou.read / stats.thankyou.total) * 100),
);

const invitationChartRef = ref<EchartsUIType>();
const ticketChartRef = ref<EchartsUIType>();
const surveyChartRef = ref<EchartsUIType>();

const { renderEcharts: renderInvitation } = useEcharts(invitationChartRef);
const { renderEcharts: renderTicket } = useEcharts(ticketChartRef);
const { renderEcharts: renderSurvey } = useEcharts(surveyChartRef);

async function loadSurveyStats() {
  if (!props.eventId) return;
  try {
    const res: any = await requestClient.post(
      '/edm/event/getSurveyStats',
      { event_id: props.eventId },
      { responseReturn: 'raw', timeout: 30_000 } as any,
    );
    const data = res?.data?.data || res?.data;
    if (data) {
      survey.total_invited = data.total_invited ?? 0;
      survey.filled_invited = data.filled_invited ?? 0;
      survey.unfilled_invited = data.unfilled_invited ?? 0;
      survey.non_invited_responses = data.non_invited_responses ?? 0;
      survey.total_responses = data.total_responses ?? 0;
      survey.has_google_form = data.has_google_form ?? false;
    }
  } catch (error) {
    console.error('getSurveyStats failed:', error);
  }
}

function renderSurveyChart() {
  renderSurvey({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#334155',
      textStyle: { color: '#f8fafc' },
      borderWidth: 0,
    },
    legend: { show: false },
    title: {
      text: `${survey.total_responses}`,
      subtext: '總填寫數',
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 32, fontWeight: 'bold', color: '#334155' },
      subtextStyle: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' },
    },
    series: [
      {
        name: '問卷狀態',
        type: 'pie',
        radius: ['65%', '80%'],
        center: ['50%', '50%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          {
            value: survey.filled_invited,
            name: '已填寫',
            itemStyle: { color: '#14b8a6' },
          },
          {
            value: survey.unfilled_invited,
            name: '未填寫',
            itemStyle: { color: '#e2e8f0' },
          },
        ],
      },
    ],
  });
}

onMounted(async () => {
  await loadSurveyStats();
  // 1. 活動信件圖表 - 靛藍色系
  renderInvitation({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#334155',
      textStyle: { color: '#f8fafc' },
      borderWidth: 0,
    },
    legend: { show: false },
    title: {
      text: `${stats.invitation.total}`,
      subtext: '總寄出',
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 32, fontWeight: 'bold', color: '#334155' },
      subtextStyle: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' },
    },
    series: [
      {
        name: '活動信狀態',
        type: 'pie',
        radius: ['65%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          {
            value: stats.invitation.read,
            name: '已讀',
            itemStyle: { color: '#6366f1' },
          },
          {
            value: stats.invitation.unopened,
            name: '未開啟',
            itemStyle: { color: '#e2e8f0' },
          },
          {
            value: stats.invitation.deleted,
            name: '已刪除',
            itemStyle: { color: '#cbd5e1' },
          },
        ],
      },
    ],
  });

  // 2. 報名表圖表 - 護眼微紫色系
  renderTicket({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#334155',
      textStyle: { color: '#f8fafc' },
      borderWidth: 0,
    },
    legend: { show: false },
    title: {
      text: `${stats.ticket.total}`,
      subtext: '總計出',
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 32, fontWeight: 'bold', color: '#334155' },
      subtextStyle: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' },
    },
    series: [
      {
        name: '報名表狀態',
        type: 'pie',
        radius: ['65%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          {
            value: stats.ticket.read,
            name: '已讀',
            itemStyle: { color: '#8b5cf6' },
          },
          {
            value: stats.ticket.unopened,
            name: '未開啟',
            itemStyle: { color: '#e2e8f0' },
          },
          {
            value: stats.ticket.deleted,
            name: '已刪除',
            itemStyle: { color: '#cbd5e1' },
          },
        ],
      },
    ],
  });

  // 3. 問卷回收圖表 - 薄荷綠色系（使用真實統計）
  renderSurveyChart();
});
</script>

<template>
  <div class="event-analytics animate-fade-in space-y-12 p-2 font-sans">
    <!-- Section 1: 廣告信/活動信件分析 -->
    <section>
      <div class="mb-6 flex items-center gap-3">
        <div class="h-6 w-1.5 rounded-full bg-indigo-400"></div>
        <h3 class="text-xl font-bold tracking-wide text-slate-700">
          活動宣傳信件追蹤分析
        </h3>
      </div>

      <div class="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <ElRow :gutter="48" class="items-center">
          <!-- 左圖：圓環圖 -->
          <ElCol :span="8">
            <div class="relative h-64 w-full">
              <EchartsUI ref="invitationChartRef" class="h-full w-full" />
            </div>
          </ElCol>

          <!-- 右文：對齊排版進度條 -->
          <ElCol :span="16">
            <div class="flex flex-col justify-center space-y-8 pr-4">
              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
                    已讀開啟 (Read)
                  </span>
                  <span class="text-2xl font-black text-indigo-500"
                    >{{ invitationReadRate
                    }}<span class="ml-1 text-sm text-indigo-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="invitationReadRate"
                    color="#6366f1"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    stats.invitation.read
                  }}</span>
                </div>
              </div>

              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-slate-200"></div>
                    尚未回應 (Unopened)
                  </span>
                  <span class="text-xl font-black text-slate-400"
                    >{{ invitationUnopenedRate
                    }}<span class="ml-1 text-sm text-slate-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="invitationUnopenedRate"
                    color="#e2e8f0"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    stats.invitation.unopened
                  }}</span>
                </div>
              </div>

              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                    拒絕或刪除 (Deleted)
                  </span>
                  <span class="text-xl font-black text-slate-400"
                    >{{ invitationDeletedRate
                    }}<span class="ml-1 text-sm text-slate-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="invitationDeletedRate"
                    color="#cbd5e1"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    stats.invitation.deleted
                  }}</span>
                </div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </section>

    <!-- Section 2: 報名表分析 -->
    <section>
      <div class="mb-6 flex items-center gap-3">
        <div class="h-6 w-1.5 rounded-full bg-violet-400"></div>
        <h3 class="text-xl font-bold tracking-wide text-slate-700">
          報名表開啟率與反應分析
        </h3>
      </div>

      <div class="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <ElRow :gutter="48" class="items-center">
          <!-- 左圖：圓環圖 -->
          <ElCol :span="8">
            <div class="relative h-64 w-full">
              <EchartsUI ref="ticketChartRef" class="h-full w-full" />
            </div>
          </ElCol>

          <!-- 右文：對齊排版進度條 -->
          <ElCol :span="16">
            <div class="flex flex-col justify-center space-y-8 pr-4">
              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-violet-500"></div>
                    已讀開啟 (Read)
                  </span>
                  <span class="text-2xl font-black text-violet-600"
                    >{{ ticketReadRate
                    }}<span class="ml-1 text-sm text-violet-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="ticketReadRate"
                    color="#8b5cf6"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    stats.ticket.read
                  }}</span>
                </div>
              </div>

              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-slate-200"></div>
                    尚未回應 (Unopened)
                  </span>
                  <span class="text-xl font-black text-slate-400"
                    >{{ ticketUnopenedRate
                    }}<span class="ml-1 text-sm text-slate-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="ticketUnopenedRate"
                    color="#e2e8f0"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    stats.ticket.unopened
                  }}</span>
                </div>
              </div>

              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                    拒絕或刪除 (Deleted)
                  </span>
                  <span class="text-xl font-black text-slate-400"
                    >{{ ticketDeletedRate
                    }}<span class="ml-1 text-sm text-slate-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="ticketDeletedRate"
                    color="#cbd5e1"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    stats.ticket.deleted
                  }}</span>
                </div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </section>

    <!-- Section 3: 問卷分析 -->
    <section>
      <div class="mb-6 flex items-center gap-3">
        <div class="h-6 w-1.5 rounded-full bg-teal-400"></div>
        <h3 class="text-xl font-bold tracking-wide text-slate-700">
          問卷分發與回收統計
        </h3>
      </div>

      <div class="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <ElRow :gutter="48" class="items-center">
          <!-- 左圖：圓環圖 -->
          <ElCol :span="8">
            <div class="relative h-64 w-full">
              <EchartsUI ref="surveyChartRef" class="h-full w-full" />
            </div>
          </ElCol>

          <!-- 右文：對齊排版進度條 -->
          <ElCol :span="16">
            <div class="flex flex-col justify-center space-y-8 pr-4">
              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-teal-500"></div>
                    已填寫完成 (Completed)
                  </span>
                  <span class="text-2xl font-black text-teal-600"
                    >{{ surveyFillRate
                    }}<span class="ml-1 text-sm text-teal-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="surveyFillRate"
                    color="#14b8a6"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    survey.filled_invited
                  }}</span>
                </div>
              </div>

              <div class="group">
                <div class="mb-2 flex items-end justify-between">
                  <span
                    class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-slate-200"></div>
                    尚待回覆 (Pending)
                  </span>
                  <span class="text-xl font-black text-slate-400"
                    >{{ surveyUnopenedRate
                    }}<span class="ml-1 text-sm text-slate-300">%</span></span
                  >
                </div>
                <div class="flex items-center gap-4">
                  <ElProgress
                    :percentage="surveyUnopenedRate"
                    color="#e2e8f0"
                    :show-text="false"
                    :stroke-width="10"
                    class="progress-bar flex-1 transition-opacity group-hover:opacity-80"
                  />
                  <span class="w-12 text-right font-bold text-slate-400">{{
                    survey.unfilled_invited
                  }}</span>
                </div>
              </div>

              <div
                v-if="survey.non_invited_responses > 0"
                class="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm"
              >
                <span class="font-bold text-amber-700">提醒：</span>
                <span class="text-amber-600">
                  另有
                  <span class="font-black">{{
                    survey.non_invited_responses
                  }}</span>
                  位 <strong>邀請名單外</strong> 的人員填寫此問卷
                </span>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </section>

    <!-- 高對比深色模式 Data Bar (感謝函) 降低亮度減少刺眼感 -->
    <section class="pt-4">
      <div
        class="group relative overflow-hidden rounded-[32px] bg-slate-800 px-12 py-10 text-white shadow-sm"
      >
        <!-- 柔和的微光背景 -->
        <div
          class="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-indigo-500/5 blur-[80px]"
        ></div>
        <div
          class="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/3 rounded-full bg-teal-500/5 blur-[60px]"
        ></div>

        <div class="relative z-10">
          <h4
            class="mb-8 border-b border-slate-700 pb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
          >
            感謝函統計
          </h4>
          <div class="flex items-center justify-between">
            <div>
              <p class="mb-2 text-sm font-bold text-slate-400">發行次數</p>
              <div class="flex items-baseline gap-2">
                <p class="text-5xl font-black tracking-tighter text-slate-100">
                  {{ stats.thankyou.total }}
                </p>
                <span class="font-bold text-slate-500">封</span>
              </div>
            </div>
            <div class="h-12 w-px bg-slate-700"></div>
            <div>
              <p class="mb-2 text-sm font-bold text-slate-400">總讀取率</p>
              <div class="flex items-baseline gap-2">
                <p class="text-5xl font-black tracking-tighter text-indigo-400">
                  {{ thankyouReadRate }}
                </p>
                <span class="text-xl font-bold text-indigo-500/50">%</span>
              </div>
            </div>
            <div class="h-12 w-px bg-slate-700"></div>
            <div>
              <p class="mb-2 text-sm font-bold text-slate-400">零點擊忽略率</p>
              <div class="flex items-baseline gap-2">
                <p class="text-5xl font-black tracking-tighter text-slate-400">
                  12.5
                </p>
                <span class="text-xl font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

/* 讓進度條兩端極度圓滑，維持護眼無銳角設計 */
:deep(.el-progress-bar__outer) {
  background-color: #f8fafc;
  border-radius: 12px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 12px;
}

.progress-bar :deep(.el-progress-bar__outer) {
  overflow: visible;
}
</style>
