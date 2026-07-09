import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import { useI18n } from '@/composables/useI18n'
import en from '@/i18n/en.json'
import zhTw from '@/i18n/zh-TW.json'

/**
 * T050：useI18n composable 單元測試。
 *
 * 驗證項目：
 * 1. 預設 locale 為 'zh-TW'，t() 從 zh-TW.json 讀取字串。
 * 2. switchLocale('en') 後 t() 改回傳 en.json 字串。
 * 3. 缺少 key 時回傳 key 本身（不丟例外、不 undefined）。
 * 4. composable 具備反應性：模板 t() 在 locale 變更時會自動更新。
 */
describe('useI18n', () => {
  beforeEach(() => {
    // 每個測試開始前重設 locale，避免前一個 test 改動殘留影響本測試
    useI18n().switchLocale('zh-TW')
  })

  afterEach(() => {
    useI18n().switchLocale('zh-TW')
  })

  it('預設 locale 為 zh-TW，且 t() 會從 zh-TW.json 讀取字串', () => {
    const { currentLocale, t } = useI18n()

    expect(currentLocale.value).toBe('zh-TW')
    expect(t('home.title')).toBe('挑選一副牌堆')
  })

  it('呼叫 switchLocale("en") 後 t() 改回傳英文字串', () => {
    const { switchLocale, t } = useI18n()

    switchLocale('en')

    expect(t('home.title')).toBe('Choose the theme for tonight')
    expect(t('actions.draw')).toBe('Draw')
  })

  it('當 key 不存在時回傳 key 字串本身（不崩潰、不回傳 undefined）', () => {
    const { t } = useI18n()

    expect(t('this.key.does.not.exist')).toBe('this.key.does.not.exist')
    expect(t('home.nonexistent')).toBe('home.nonexistent')
  })

  /**
   * T015：theme.values 鍵於 zh-TW 與 en 皆存在且非空。
   * 來源界定（F2）：預覽實際渲染的是 zh-TW.json 的 theme.values.englishShortName（必備）；
   * name / description 於 i18n 僅為與其他主題的結構對齊，
   * values 名稱／描述／記憶點的單一真實來源為 src/data/themes/values.json。
   */
  it.each([
    ['zh-TW', zhTw],
    ['en', en],
  ] as const)('%s 的 theme.values 鍵應存在且 name / englishShortName / description 非空', (_locale, messages) => {
    const valuesEntry = (messages.theme as Record<string, Record<string, string> | undefined>)
      .values

    expect(valuesEntry).toBeDefined()
    for (const key of ['name', 'englishShortName', 'description'] as const) {
      const value = valuesEntry?.[key]
      expect(typeof value, `theme.values.${key} 應為字串`).toBe('string')
      expect((value ?? '').trim().length, `theme.values.${key} 應非空`).toBeGreaterThan(0)
    }
  })

  it('在模板中使用 t() 時，locale 變更會觸發重新渲染', async () => {
    const Probe = defineComponent({
      setup() {
        const { t } = useI18n()
        return () => h('span', { 'data-test': 'probe' }, t('actions.draw'))
      },
    })

    const wrapper = mount(Probe)
    const probe = wrapper.find('[data-test="probe"]')

    expect(probe.text()).toBe('抽牌')

    useI18n().switchLocale('en')
    await nextTick()

    expect(wrapper.find('[data-test="probe"]').text()).toBe('Draw')
  })
})
