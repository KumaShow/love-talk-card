import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import router from '@/router'
import EndView from '@/views/EndView.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'

/** 驗證三個基礎頁面骨架已成功建立。 */
describe('phase 2 views', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it('首頁顯示主題入口', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('選擇今晚想聊的主題')
    expect(wrapper.text()).toContain('心動瞬間')
  })

  it('遊戲頁顯示目前主題與預覽卡牌', async () => {
    await router.push('/game/attraction')

    const wrapper = mount(GameView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('心動瞬間')
    expect(wrapper.text()).toContain('抽牌')
  })

  it('結束頁顯示主題結語', async () => {
    await router.push('/end/trust')

    const wrapper = mount(EndView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('這回合聊完了')
    expect(wrapper.text()).toContain('信任成長')
  })
})
