import { beforeEach, describe, expect, it } from 'vitest'

import router from '@/router'

/**
 * 路由守衛測試：先確認無效主題會被導回首頁。
 *
 * router 以檔案頂層靜態 import 載入：整棵相依樹（Views → components → stores）
 * 的轉譯與載入發生在檔案 import 階段，不計入單一 test 的預設 5000ms timeout。
 * 先前在 test body 內以 await import('@/router') 動態載入，全量並行負載下
 * 會偶發超時（flaky）；改為靜態 import 後與 index.spec.ts 一致、消除此不穩定。
 */
describe('router theme guard', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it('將無效的 themeId 導回首頁', async () => {
    await router.push('/game/not-a-theme')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('允許有效的 themeId 路由', async () => {
    await router.push('/game/attraction')
    await router.isReady()

    expect(router.currentRoute.value.params.themeId).toBe('attraction')
  })

  it.each(['/game/values', '/end/values'])('允許 values 路由：%s', async (path) => {
    await router.push(path)
    await router.isReady()

    expect(router.currentRoute.value.path).toBe(path)
  })
})
