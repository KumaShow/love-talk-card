import { beforeEach, describe, expect, it } from 'vitest'

import router, {
  acknowledgeDesireOnce,
  consumeDesireAcknowledgement,
} from '@/router'

describe('desire router guard', () => {
  beforeEach(async () => {
    consumeDesireAcknowledgement()
    await router.push('/')
  })

  it('未設定暫態確認旗標時，導向 /game/desire 應重導首頁並帶 notice query', async () => {
    await router.push('/game/desire')

    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.query.notice).toBe('desire')
  })

  it('query.notice=desire 本身不應被視為已確認', async () => {
    await router.push({ name: 'home', query: { notice: 'desire' } })
    await router.push('/game/desire')

    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.query.notice).toBe('desire')
  })

  it('acknowledgeDesireOnce 設定後允許進入一次，且旗標會被消費', async () => {
    acknowledgeDesireOnce()
    await router.push('/game/desire')

    expect(router.currentRoute.value.name).toBe('game')
    expect(router.currentRoute.value.params.themeId).toBe('desire')

    await router.push('/')
    await router.push('/game/desire')

    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.query.notice).toBe('desire')
  })

  it('既有四主題與其他路由不受 desire 守衛影響', async () => {
    await router.push('/game/attraction')
    expect(router.currentRoute.value.name).toBe('game')
    expect(router.currentRoute.value.params.themeId).toBe('attraction')

    await router.push('/end/desire')
    expect(router.currentRoute.value.name).toBe('end')
    expect(router.currentRoute.value.params.themeId).toBe('desire')
  })
})
