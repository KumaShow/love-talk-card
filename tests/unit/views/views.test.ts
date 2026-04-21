import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import router from '@/router'
import EndView from '@/views/EndView.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'
import { useGameStore } from '@/stores/gameStore'

/** 驗證三個頁面骨架（Phase 3 整合後仍能渲染預期字串）。 */
describe('phase 3 views', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    await router.push('/')
  })

  it('首頁顯示主題卡堆與標題', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('挑選一副牌堆')
    expect(wrapper.text()).toContain('心動瞬間')
    expect(wrapper.find('[data-test="theme-deck-grid"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="theme-deck-attraction"]').exists()).toBe(true)
  })

  it('遊戲頁顯示目前主題與扇形牌堆提示', async () => {
    await router.push('/game/attraction')

    const gameStore = useGameStore()
    gameStore.startSession('attraction', false)

    const wrapper = mount(GameView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('心動瞬間')
    expect(wrapper.text()).toContain('點擊中央牌翻開內容')
    expect(wrapper.find('[data-test="fan-deck"]').exists()).toBe(true)
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
