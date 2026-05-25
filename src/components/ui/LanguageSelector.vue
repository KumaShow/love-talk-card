<script setup lang="ts">
/**
 * T055：LanguageSelector — 卡牌副語言三按鈕切換器（EN / ไทย / 日）。
 *
 * 設計重點：
 * - WAI-ARIA toggle button group：每顆按鈕以 aria-pressed 表達啟用狀態。
 * - 觸控區 ≥44×44px（憲章可存取性要求）。
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
  <div
    class="language-selector inline-flex items-center gap-[0.15rem] rounded-[var(--radius-pill)] p-[0.2rem]"
    role="group"
    :aria-label="t('labels.secondaryLanguage')"
    data-test="language-selector"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="language-selector__btn inline-flex min-h-[52px] min-w-[52px] cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border-0 bg-transparent px-[0.7rem] py-0 text-xs font-medium tracking-[0.04em]"
      :class="{ 'language-selector__btn--active': selectedLang === option.value }"
      :aria-pressed="selectedLang === option.value ? 'true' : 'false'"
      :aria-label="option.ariaLabel"
      :data-test="option.testId"
      @click="handleClick(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
/*
 * 玻璃感 segmented control（A 方案）：
 * 為了搭配深色 picked-backdrop 並讓 CTA「下一張」維持視覺主焦點，
 * 容器使用半透明白 + backdrop blur，按鈕基底半亮（opacity 0.65），
 * 啟用中的選項才填淡白 pill + 完整 opacity。
 */
.language-selector {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.language-selector__btn {
  color: rgba(255, 255, 255, 0.7);
  transition:
    background-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.language-selector__btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.language-selector__btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.language-selector__btn--active {
  background: rgba(255, 255, 255, 0.28);
  color: #ffffff;
  font-weight: 600;
}
</style>
