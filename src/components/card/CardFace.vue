<template>
  <article
    class="card-face absolute inset-0 flex flex-col justify-center gap-4 rounded-[var(--radius-card)] bg-white p-7 text-ink shadow-[var(--shadow-card)]"
    data-test="card-face"
  >
    <!-- T047：私密牌裝飾浮水印，opacity 0.15，不影響可讀性（pointer-events:none、z-index:0） -->
    <div
      v-if="card.isIntimate"
      class="card-face__watermark"
      data-test="intimate-watermark"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        role="presentation"
        focusable="false"
      >
        <!-- 自刻 heart-solid path，與 Heroicons 風格相近 -->
        <path
          d="M12 21s-7.5-4.5-9.5-10.2C1.2 6.7 4.1 3 8 3c2 0 3.3 1 4 2.2C12.7 4 14 3 16 3c3.9 0 6.8 3.7 5.5 7.8C19.5 16.5 12 21 12 21z"
        />
      </svg>
    </div>
    <div
      class="card-face__meta relative z-[1] flex items-center justify-between text-xs uppercase tracking-[0.2em]"
    >
      <span class="card-face__level">Lv.{{ card.level }}</span>
      <span v-if="card.isIntimate" class="card-face__intimate" data-test="intimate-indicator">
        <slot name="intimate-indicator">♥</slot>
      </span>
    </div>
    <p
      class="relative z-[1] font-serif text-2xl font-semibold leading-[1.5]"
      data-test="card-primary-text"
      lang="zh-TW"
    >
      {{ card.text.zh }}
    </p>
    <p
      v-if="secondaryText"
      class="card-face__secondary relative z-[1] text-base leading-[1.5]"
      data-test="card-secondary-text"
      :lang="secondaryHtmlLang"
    >
      {{ secondaryText }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useSettingsStore } from '@/stores/settingsStore'
import type { Card, SecondaryLang } from '@/types'
import { getCardText } from '@/utils/card-text'

const props = defineProps<{
  card: Card
}>()

/**
 * T057：次要語言文字改由 getCardText() 計算，依 settingsStore.secondaryLang 反應式更新。
 * 切換 LanguageSelector 後，正在顯示的卡片次要文字會立即同步變更。
 *
 * 採用 storeToRefs 取出 secondaryLang ref 確保 computed 對 store 變更的依賴追蹤穩定。
 */
const { secondaryLang } = storeToRefs(useSettingsStore())
const secondaryText = computed(() => getCardText(props.card, secondaryLang.value))

/** SecondaryLang ('en' | 'th' | 'ja') 對應 BCP 47 lang code，作為次要 <p> 的 HTML lang 屬性。 */
const HTML_LANG_MAP: Record<SecondaryLang, string> = {
  en: 'en',
  th: 'th',
  ja: 'ja',
}
const secondaryHtmlLang = computed(() => HTML_LANG_MAP[secondaryLang.value])
</script>

<style scoped>
.card-face {
  transform: rotateY(180deg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-face__meta {
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
}

.card-face__intimate {
  font-size: 1.25rem;
  color: var(--color-brand);
}

.card-face__secondary {
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
}

/* T047：私密牌裝飾浮水印覆蓋層，填滿卡面、置中、半透明，且不可點擊 */
.card-face__watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;
  pointer-events: none;
  color: var(--color-brand);
  z-index: 0;
}

.card-face__watermark svg {
  width: min(60%, 240px);
  height: auto;
}
</style>
