import { beforeEach, describe, expect, it } from 'vitest'

/** 路由守衛測試：先確認無效主題會被導回首頁。 */
describe('router theme guard', () => {
  beforeEach(() => {
    window.location.hash = '#/'
  })

  it('將無效的 themeId 導回首頁', async () => {
    const { default: router } = await import('@/router')

    await router.push('/game/not-a-theme')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('允許有效的 themeId 路由', async () => {
    const { default: router } = await import('@/router')

    await router.push('/game/attraction')
    await router.isReady()

    expect(router.currentRoute.value.params.themeId).toBe('attraction')
  })
})
