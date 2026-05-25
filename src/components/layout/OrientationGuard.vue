<template>
  <Transition name="orientation-guard">
    <div
      v-if="isLandscape"
      class="orientation-guard fixed inset-0 z-[9999] flex items-center justify-center bg-[rgb(8_4_10/0.88)] p-6 text-white backdrop-blur-[6px]"
      data-test="orientation-guard"
      role="alert"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
    >
      <div class="flex max-w-[22rem] flex-col items-center gap-3 text-center">
        <svg
          class="orientation-guard__icon h-20 w-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <!-- 手機外框：以 rotate 呈現「請轉回直向」的語意 -->
          <rect x="22" y="8" width="20" height="36" rx="3" />
          <line x1="28" y1="14" x2="36" y2="14" />
          <circle cx="32" cy="40" r="1.2" />
          <!-- 旋轉提示弧線 -->
          <path d="M10 52 Q32 62 54 52" stroke-dasharray="3 3" />
          <path d="M52 48 L54 52 L50 52" />
        </svg>

        <h2 :id="titleId" class="m-0 text-xl font-bold tracking-[0.02em]">
          {{ zhTitle }}
        </h2>
        <p :id="descId" class="m-0 text-[0.95rem] leading-[1.5] opacity-[0.88]">
          {{ zhDesc }}
        </p>

        <p class="m-0 mt-2 text-[0.85rem] italic opacity-[0.65]" lang="en">
          {{ enTitle }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

import zhStrings from '@/i18n/zh-TW.json'
import enStrings from '@/i18n/en.json'
import { useOrientation } from '@/composables/useOrientation'

/**
 * OrientationGuard：偵測 landscape 時顯示全螢幕覆蓋層提示使用者轉回直向。
 *
 * - 不中斷底層 RouterView：僅以 fixed overlay 遮蓋畫面，遊戲狀態（gameStore / sessionStorage）不受影響。
 * - 回直向後 useOrientation 會將 isLandscape 設回 false，Transition 自動移除 overlay。
 * - 採雙語提示（ZH-TW 主、EN 輔），符合 research.md R-009。
 * - 使用 role="alert" 宣告方向提示，避免誤用需焦點管理的 alertdialog。
 */
const { isLandscape } = useOrientation()

const titleId = `orientation-guard-title-${useId()}`
const descId = `orientation-guard-desc-${useId()}`

const zhTitle = computed(() => zhStrings.orientation.title)
const zhDesc = computed(() => zhStrings.orientation.description)
const enTitle = computed(() => enStrings.orientation.title)
</script>

<style scoped>
.orientation-guard {
  -webkit-backdrop-filter: blur(6px);
}

.orientation-guard__icon {
  color: var(--color-brand, #e8a0bf);
}

.orientation-guard-enter-active,
.orientation-guard-leave-active {
  transition: opacity 240ms ease;
}

.orientation-guard-enter-from,
.orientation-guard-leave-to {
  opacity: 0;
}
</style>
