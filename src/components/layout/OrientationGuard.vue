<template>
  <Transition name="orientation-guard">
    <div
      v-if="isLandscape"
      class="orientation-guard"
      data-test="orientation-guard"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
    >
      <div class="orientation-guard__panel">
        <svg
          class="orientation-guard__icon"
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

        <h2 :id="titleId" class="orientation-guard__title">
          {{ zhTitle }}
        </h2>
        <p :id="descId" class="orientation-guard__desc">
          {{ zhDesc }}
        </p>

        <p class="orientation-guard__alt" lang="en">
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
 * - 使用 role="alertdialog" + aria-modal 以讓 a11y tree 理解此為阻擋性提示。
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
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(8, 4, 10, 0.88);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: white;
}

.orientation-guard__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 22rem;
  text-align: center;
}

.orientation-guard__icon {
  width: 5rem;
  height: 5rem;
  color: var(--color-primary, #e8a0bf);
}

.orientation-guard__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.orientation-guard__desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.88;
}

.orientation-guard__alt {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  opacity: 0.65;
  font-style: italic;
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
