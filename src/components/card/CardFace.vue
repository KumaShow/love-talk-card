<template>
  <article
    class="card-face absolute inset-0 flex flex-col justify-center gap-4 rounded-[var(--radius-card)] bg-[var(--color-card-surface)] p-7 text-ink shadow-[var(--shadow-card)] max-[23rem]:gap-[0.85rem] max-[23rem]:p-6"
    data-test="card-face"
  >
    <!-- T047：私密牌裝飾浮水印，opacity 0.15，不影響可讀性（pointer-events:none、z-index:0） -->
    <div
      v-if="card.isIntimate"
      class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center text-brand opacity-15"
      data-test="intimate-watermark"
      aria-hidden="true"
    >
      <svg
        class="h-auto w-[min(60%,15rem)]"
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
    <div class="card-meta relative z-[1] flex items-center justify-between text-xs uppercase tracking-normal max-[23rem]:text-[0.68rem]">
      <span>Lv.{{ card.level }}</span>
      <span v-if="card.isIntimate" class="text-xl text-brand" data-test="intimate-indicator">
        <slot name="intimate-indicator">♥</slot>
      </span>
    </div>
    <p
      class="relative z-[1] m-0 font-serif text-2xl font-semibold leading-[1.5] max-[23rem]:text-[1.35rem] max-[23rem]:leading-[1.45]"
      data-test="card-primary-text"
      lang="zh-TW"
    >
      {{ card.text.zh }}
    </p>
    <p
      v-if="secondaryText"
      class="card-secondary relative z-[1] m-0 text-base leading-[1.55] max-[23rem]:text-[0.92rem] max-[23rem]:leading-[1.5]"
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
/* 卡面 3D 翻面：rotateY 與 backface-visibility 不易用 utility 表達，保留 scoped */
.card-face {
  transform: rotateY(180deg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* meta 與次要文字：color-mix 半透明墨色，保留 scoped */
.card-meta {
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
}

.card-secondary {
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
}
</style>
