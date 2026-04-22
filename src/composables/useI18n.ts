import { computed, ref } from 'vue'

import en from '@/i18n/en.json'
import zhTw from '@/i18n/zh-TW.json'

/** 介面語言（不含卡牌副語言；卡牌副語言請見 SecondaryLang）。 */
export type UiLocale = 'zh-TW' | 'en'

/**
 * 模組層 singleton state：所有 useI18n() 呼叫共用同一個 currentLocale，
 * 才能讓 LanguageSelector 切換後全 app 範圍模板同步重新渲染。
 */
const dictionaries: Record<UiLocale, unknown> = {
  'zh-TW': zhTw,
  en,
}
const currentLocale = ref<UiLocale>('zh-TW')

/** 以 dot-notation key 走訪巢狀字典；找不到時回傳 undefined。 */
function readByPath(source: unknown, key: string): string | undefined {
  const segments = key.split('.')
  let cursor: unknown = source
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== 'object') {
      return undefined
    }
    cursor = (cursor as Record<string, unknown>)[segment]
  }
  return typeof cursor === 'string' ? cursor : undefined
}

export function useI18n() {
  const t = (key: string): string => {
    const value = readByPath(dictionaries[currentLocale.value], key)
    return value ?? key
  }
  const switchLocale = (locale: UiLocale): void => {
    currentLocale.value = locale
  }
  return {
    currentLocale: computed(() => currentLocale.value),
    t,
    switchLocale,
  }
}
