import { beforeEach, describe, expect, it } from 'vitest'

import router from '@/router'

describe('應用程式路由', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it('應註冊首頁、遊戲頁與結束頁三條路由', () => {
    const paths = router.getRoutes().map((route) => route.path)

    expect(paths).toEqual(expect.arrayContaining(['/', '/game/:themeId', '/end/:themeId']))
  })

  it('會允許有效主題進入遊戲頁', async () => {
    await router.push('/game/trust')

    expect(router.currentRoute.value.name).toBe('game')
    expect(router.currentRoute.value.params.themeId).toBe('trust')
  })

  it('會將無效主題重新導向首頁', async () => {
    await router.push('/end/invalid-theme')

    expect(router.currentRoute.value.name).toBe('home')
  })
})
