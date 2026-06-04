<script setup lang="ts">
/**
 * T055：LanguageSelector — 卡牌副語言三按鈕切換器（EN / ไทย / 日）。
 *
 * 設計重點：
 * - WAI-ARIA toggle button group：每顆按鈕以 aria-pressed 表達啟用狀態。
 * - 觸控區 ≥2.75rem × 2.75rem（憲章可存取性要求）。
 * - 啟用按鈕採白色玻璃感，刻意不搶走主題 CTA 的視覺焦點。
 * - emit 'select' 攜帶 SecondaryLang，讓父層接到 settingsStore.setSecondaryLang。
 *   採用 emit 而非 v-model 是為了保留語意（這是「動作」而非雙向綁定）—
 *   故 prop 命名為 `selectedLang` 而非 `modelValue`，以免與本 repo 其他
 *   v-model 元件（例如 ToggleSwitch）的契約混淆。
 */
import { useI18n } from '@/composables/useI18n'
import type { SecondaryLang } from '@/types'

defineOptions({ name: 'LanguageSelector' })

defineProps<{
  /** 目前啟用的副語言；對齊 settingsStore.secondaryLang */
  selectedLang: SecondaryLang
}>()

const emit = defineEmits<{
  (e: 'select', lang: SecondaryLang): void
}>()

const { t } = useI18n()

interface LangOption {
  value: SecondaryLang
  label: string
  testId: string
  ariaLabel: string
}

const options: LangOption[] = [
  { value: 'en', label: 'EN', testId: 'lang-en', ariaLabel: 'English' },
  { value: 'th', label: 'ไทย', testId: 'lang-th', ariaLabel: 'ภาษาไทย' },
  { value: 'ja', label: '日', testId: 'lang-ja', ariaLabel: '日本語' },
]

function handleClick(lang: SecondaryLang): void {
  emit('select', lang)
}
</script>

<template>
  <!--
    玻璃感 segmented control（A 方案）：半透明白底 + backdrop blur 容器，
    按鈕基底半亮（白 70%），啟用中的選項才填淡白 pill + 全白文字，
    讓深色 picked-backdrop 下 CTA「下一張」維持視覺主焦點。
  -->
  <div
    class="inline-flex items-center gap-[0.15rem] rounded-[var(--radius-pill)] bg-white/[0.18] p-[0.2rem] backdrop-blur-[8px] max-[23rem]:gap-[0.08rem] max-[23rem]:p-[0.12rem]"
    role="group"
    :aria-label="t('labels.secondaryLanguage')"
    data-test="language-selector"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="inline-flex min-h-[3.25rem] min-w-[3.25rem] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 px-[0.7rem] text-[0.75rem] tracking-normal transition duration-[160ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 max-[23rem]:min-h-10 max-[23rem]:min-w-10 max-[23rem]:px-2 max-[23rem]:text-[0.68rem]"
      :class="
        selectedLang === option.value
          ? 'bg-white/[0.28] font-semibold text-white'
          : 'bg-transparent font-medium text-white/70 hover:text-white/90'
      "
      :aria-pressed="selectedLang === option.value ? 'true' : 'false'"
      :aria-label="option.ariaLabel"
      :data-test="option.testId"
      @click="handleClick(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
