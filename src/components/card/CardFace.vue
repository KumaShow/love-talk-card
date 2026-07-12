<template>
  <article
    :class="[cardFaceClass, { 'values-card-face': card.theme === 'values' }]"
    :data-density="textDensity"
    data-test="card-face"
  >
    <img
      class="pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
      :src="cardVisual.background"
      alt=""
      data-test="card-background"
      aria-hidden="true"
    />
    <img
      class="pointer-events-none absolute inset-0 z-[2] h-full w-full object-fill"
      :src="cardVisual.frame"
      alt=""
      data-test="card-frame"
      aria-hidden="true"
    />
    <!-- T047：私密牌裝飾浮水印，opacity 0.15，不影響可讀性（pointer-events:none、z-index:0） -->
    <div
      v-if="card.isIntimate"
      class="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-brand opacity-15"
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
    <div class="card-meta relative z-[3] flex items-center justify-between text-xs uppercase tracking-normal max-[23rem]:text-[0.68rem]">
      <span>Lv.{{ card.level }}</span>
      <span v-if="card.isIntimate" class="text-xl text-brand" data-test="intimate-indicator">
        <slot name="intimate-indicator">♥</slot>
      </span>
    </div>
    <p
      :class="['card-primary', primaryTextClass]"
      data-test="card-primary-text"
      lang="zh-TW"
    >
      {{ card.text.zh }}
    </p>
    <p
      v-if="secondaryText"
      :class="secondaryTextClass"
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

import { CARD_VISUALS } from '@/assets/card-images'
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
const cardVisual = computed(() => CARD_VISUALS[props.card.theme])

type TextDensity = 'comfortable' | 'compact' | 'dense'

const textDensity = computed<TextDensity>(() => {
  const secondaryWeight = secondaryLang.value === 'th' ? 1.18 : 1
  const load = props.card.text.zh.length * 1.8 + secondaryText.value.length * secondaryWeight

  if (load >= 185) {
    return 'dense'
  }
  if (load >= 145) {
    return 'compact'
  }
  return 'comfortable'
})

const cardFaceClass = computed(() => [
  'card-face absolute inset-0 flex flex-col justify-center overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-card-surface)] text-ink shadow-[var(--shadow-card)]',
  {
    comfortable:
      'gap-4 p-7 max-[26rem]:gap-[0.7rem] max-[26rem]:p-5 max-[20rem]:gap-[0.58rem] max-[20rem]:p-[1.1rem]',
    compact:
      'gap-3 p-6 max-[26rem]:gap-[0.55rem] max-[26rem]:p-4 max-[20rem]:gap-[0.45rem] max-[20rem]:p-[0.95rem]',
    dense:
      'gap-2 p-5 max-[26rem]:gap-[0.45rem] max-[26rem]:p-4 max-[20rem]:gap-[0.36rem] max-[20rem]:p-[0.85rem]',
  }[textDensity.value],
])

const primaryTextClass = computed(() => [
  'relative z-[3] m-0 font-serif font-semibold',
  {
    comfortable:
      'text-2xl leading-[1.5] max-[26rem]:text-[1.15rem] max-[26rem]:leading-[1.38] max-[20rem]:text-[1.05rem] max-[20rem]:leading-[1.34]',
    compact:
      'text-[1.55rem] leading-[1.38] max-[26rem]:text-[1rem] max-[26rem]:leading-[1.24] max-[20rem]:text-[0.92rem] max-[20rem]:leading-[1.2]',
    dense:
      'text-[1.35rem] leading-[1.28] max-[26rem]:text-[1.05rem] max-[26rem]:leading-[1.18] max-[20rem]:text-[0.88rem] max-[20rem]:leading-[1.16]',
  }[textDensity.value],
])

const secondaryTextClass = computed(() => [
  'card-secondary relative z-[3] m-0',
  {
    comfortable:
      'text-base leading-[1.55] max-[26rem]:text-[0.82rem] max-[26rem]:leading-[1.42] max-[20rem]:text-[0.76rem] max-[20rem]:leading-[1.36]',
    compact:
      'text-[0.92rem] leading-[1.42] max-[26rem]:text-[0.72rem] max-[26rem]:leading-[1.25] max-[20rem]:text-[0.66rem] max-[20rem]:leading-[1.2]',
    dense:
      'text-[0.82rem] leading-[1.32] max-[26rem]:text-[0.68rem] max-[26rem]:leading-[1.18] max-[20rem]:text-[0.6rem] max-[20rem]:leading-[1.14]',
  }[textDensity.value],
])

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

/* values 暫用 trust 卡面圖片；圖片中央為淺色，卡面文字需同步使用 trust 的深色文字。 */
.values-card-face {
  --color-ink: #2a1a3a;
}

/* meta 與次要文字：color-mix 半透明墨色，保留 scoped */
.card-meta {
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
}

.card-primary,
.card-secondary {
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
}

</style>
