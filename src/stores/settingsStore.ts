import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { SecondaryLang } from '@/types'

/** 設定狀態骨架，後續任務再補入互動邏輯。 */
export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<'zh-TW' | 'en'>('zh-TW')
  const secondaryLang = ref<SecondaryLang>('en')
  const isIntimateModeEnabled = ref(false)
  const isSoundEnabled = ref(true)
  const showRemainingCount = ref(true)

  return {
    locale,
    secondaryLang,
    isIntimateModeEnabled,
    isSoundEnabled,
    showRemainingCount,
  }
})
