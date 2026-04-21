import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import router from '@/router'
import EndView from '@/views/EndView.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

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

/** Phase 9：HomeView 預覽浮層流程整合測試。 */
describe('HomeView — 預覽浮層流程', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    await router.push('/')
  })

  it('點主題卡堆後出現預覽浮層，再點 CTA 會啟動 session 並導向 game view', async () => {
    const gameStore = useGameStore()
    const settingsStore = useSettingsStore()
    const wrapper = mount(HomeView, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('[data-test="home-preview"]').exists()).toBe(false)

    await wrapper.find('[data-test="theme-deck-attraction"]').trigger('click')
    expect(wrapper.find('[data-test="home-preview"]').exists()).toBe(true)

    const startSessionSpy = vi.spyOn(gameStore, 'startSession')
    await wrapper.find('[data-test="preview-cta"]').trigger('click')
    await flushPromises()

    expect(startSessionSpy).toHaveBeenCalledWith('attraction', settingsStore.intimateMode)
    expect(router.currentRoute.value.name).toBe('game')
    expect(router.currentRoute.value.params.themeId).toBe('attraction')
  })

  it('點 preview dismiss 按鈕應收起浮層且不啟動 session', async () => {
    const gameStore = useGameStore()
    const startSessionSpy = vi.spyOn(gameStore, 'startSession')

    const wrapper = mount(HomeView, {
      global: { plugins: [router] },
    })

    await wrapper.find('[data-test="theme-deck-self"]').trigger('click')
    expect(wrapper.find('[data-test="home-preview"]').exists()).toBe(true)

    await wrapper.find('[data-test="preview-dismiss"]').trigger('click')
    expect(wrapper.find('[data-test="home-preview"]').exists()).toBe(false)
    expect(startSessionSpy).not.toHaveBeenCalled()
  })

  it('開啟 ToggleSwitch 後 session 會以 intimateMode=true 啟動', async () => {
    const gameStore = useGameStore()
    const settingsStore = useSettingsStore()
    const startSessionSpy = vi.spyOn(gameStore, 'startSession')

    const wrapper = mount(HomeView, {
      global: { plugins: [router] },
    })

    await wrapper.find('[data-test="intimate-toggle"]').trigger('click')
    expect(settingsStore.intimateMode).toBe(true)

    await wrapper.find('[data-test="theme-deck-attraction"]').trigger('click')
    await wrapper.find('[data-test="preview-cta"]').trigger('click')

    expect(startSessionSpy).toHaveBeenCalledWith('attraction', true)
  })
})

/** Phase 9：GameView 扇形抽牌 + overlay 翻面 phase state machine 整合測試。 */
describe('GameView — phase state machine', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    vi.useFakeTimers()
    await router.push('/game/attraction')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('無效 themeId 會 replace 回首頁', async () => {
    vi.useRealTimers()
    await router.push('/game/invalid')

    mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('未啟動 session 時 onMounted 會建立新 session', async () => {
    const gameStore = useGameStore()
    const settingsStore = useSettingsStore()
    const startSessionSpy = vi.spyOn(gameStore, 'startSession')

    mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(startSessionSpy).toHaveBeenCalledWith('attraction', settingsStore.intimateMode)
    expect(gameStore.themeId).toBe('attraction')
  })

  it('session 已建立時不重複 startSession（reactivity 穩定）', async () => {
    const gameStore = useGameStore()
    gameStore.startSession('attraction', false)
    const startSessionSpy = vi.spyOn(gameStore, 'startSession')

    mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(startSessionSpy).not.toHaveBeenCalled()
  })

  it('點中央卡 → phase 進入 flipping 並立即推進 drawnCount；650ms 後進入 reading', async () => {
    const gameStore = useGameStore()
    gameStore.startSession('attraction', false)

    const wrapper = mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(gameStore.drawnCardIds.length).toBe(0)

    await wrapper.find('[data-test="fan-deck"] .is-active').trigger('click')
    await flushPromises()

    expect(gameStore.drawnCardIds.length).toBe(1)
    expect(wrapper.find('[data-test="picked-view"]').exists()).toBe(true)
    // flipping 階段：picked-next 尚未渲染
    expect(wrapper.find('[data-test="picked-next"]').exists()).toBe(false)

    // 等 flip 動畫 650ms，phase 由 flipping 切換至 reading，picked-next 出現
    vi.advanceTimersByTime(650)
    await flushPromises()

    expect(wrapper.find('[data-test="picked-next"]').exists()).toBe(true)
  })

  it('reading 階段點 picked-next → dismissing → 460ms 後 overlay 卸載，drawnCount 不再增加', async () => {
    const gameStore = useGameStore()
    gameStore.startSession('attraction', false)

    const wrapper = mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-test="fan-deck"] .is-active').trigger('click')
    vi.advanceTimersByTime(650)
    await flushPromises()

    const drawnBeforeDismiss = gameStore.drawnCardIds.length
    await wrapper.find('[data-test="picked-next"]').trigger('click')
    // dismissing 階段：picked-view 仍存在但帶 is-dismissing
    expect(wrapper.find('[data-test="picked-view"]').classes()).toContain('is-dismissing')

    vi.advanceTimersByTime(460)
    await flushPromises()

    expect(wrapper.find('[data-test="picked-view"]').exists()).toBe(false)
    expect(gameStore.drawnCardIds.length).toBe(drawnBeforeDismiss)
  })

  it('抽完所有牌後 dismiss 自動導向 end view', async () => {
    const gameStore = useGameStore()
    gameStore.startSession('attraction', false)
    // 先抽 14 張，只剩最後一張
    for (let i = 0; i < 14; i += 1) {
      gameStore.drawCard()
    }

    const wrapper = mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-test="fan-deck"] .is-active').trigger('click')
    vi.advanceTimersByTime(650)
    await flushPromises()

    await wrapper.find('[data-test="picked-next"]').trigger('click')
    vi.advanceTimersByTime(460)
    await flushPromises()

    expect(gameStore.isComplete).toBe(true)
    expect(router.currentRoute.value.name).toBe('end')
    expect(router.currentRoute.value.params.themeId).toBe('attraction')
  })

  it('phase 非 idle 時再次點中央卡應為 no-op', async () => {
    const gameStore = useGameStore()
    gameStore.startSession('attraction', false)

    const wrapper = mount(GameView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('[data-test="fan-deck"] .is-active').trigger('click')
    await flushPromises()

    expect(gameStore.drawnCardIds.length).toBe(1)

    // phase=flipping 時，fan-deck canInteract=false，.is-active 應不存在
    expect(wrapper.find('[data-test="fan-deck"] .is-active').exists()).toBe(false)
  })
})
