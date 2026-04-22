<template>
  <article class="card-face" data-test="card-face">
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
    <div class="card-face__meta">
      <span class="card-face__level">Lv.{{ card.level }}</span>
      <span v-if="card.isIntimate" class="card-face__intimate" data-test="intimate-indicator">
        <slot name="intimate-indicator">♥</slot>
      </span>
    </div>
    <p class="card-face__primary" data-test="card-primary-text" lang="zh-TW">
      {{ card.text.zh }}
    </p>
    <p
      v-if="secondaryText"
      class="card-face__secondary"
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
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  padding: 1.75rem;
  border-radius: 1.75rem;
  background: #ffffff;
  color: var(--color-text);
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.3);
  transform: rotateY(180deg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-face__meta {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}

.card-face__intimate {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.card-face__primary {
  position: relative;
  z-index: 1;
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
}

.card-face__secondary {
  position: relative;
  z-index: 1;
  font-size: 1rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 75%, transparent);
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
  color: var(--color-primary);
  z-index: 0;
}

.card-face__watermark svg {
  width: min(60%, 240px);
  height: auto;
}
</style>
