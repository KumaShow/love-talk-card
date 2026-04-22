import { setActivePinia, createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * T066：useAudio composable 單元測試。
 *
 * 涵蓋：
 * - playFlipSound() 在 audioEnabled=true 時透過 AudioContext 播放音效
 * - playFlipSound() 在 audioEnabled=false 時 no-op（不建立 AudioContext）
 * - 背景音樂 <audio> 元素預設為 muted
 * - fetch 失敗 swallow 不拋例外
 * - AudioContext 不存在時 playFlipSound() swallow 不拋例外
 * - 第一個來源 decode 失敗時會 fallback 到下一個來源
 * - toggleBgmMute() 會翻轉 bgmMuted
 *
 * 模組級 singleton（sharedContext、flipBuffer）在每個測試前透過 vi.resetModules()
 * 重新載入，避免跨測試洩漏。
 */

/** 模擬 AudioBufferSourceNode，只記錄 start 是否被呼叫。 */
type SourceMock = {
  buffer: AudioBuffer | null
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

const makeSourceMock = (): SourceMock => ({
  buffer: null,
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

let sourceInstances: SourceMock[] = []
let audioContextInstances = 0
let decodeAudioDataMock: ReturnType<typeof vi.fn>
let originalAudioContext: unknown
let originalWebkitAudioContext: unknown
let originalFetch: typeof globalThis.fetch | undefined

function installMockAudioContext() {
  class MockAudioContext {
    destination = {}
    constructor() {
      audioContextInstances += 1
    }
    createBufferSource() {
      const instance = makeSourceMock()
      sourceInstances.push(instance)
      return instance
    }
    decodeAudioData(...args: unknown[]) {
      return decodeAudioDataMock(...args)
    }
  }
  ;(globalThis as unknown as { AudioContext: typeof AudioContext }).AudioContext =
    MockAudioContext as unknown as typeof AudioContext
}

describe('useAudio', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sourceInstances = []
    audioContextInstances = 0
    decodeAudioDataMock = vi.fn().mockResolvedValue({} as AudioBuffer)

    originalAudioContext = (globalThis as unknown as { AudioContext?: unknown }).AudioContext
    originalWebkitAudioContext = (
      globalThis as unknown as { webkitAudioContext?: unknown }
    ).webkitAudioContext
    originalFetch = globalThis.fetch

    installMockAudioContext()

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    }) as unknown as typeof fetch

    // 每個 test 前重置 useAudio 模組以清空 sharedContext / flipBuffer singleton
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalAudioContext !== undefined) {
      ;(globalThis as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext
    } else {
      delete (globalThis as unknown as { AudioContext?: unknown }).AudioContext
    }
    if (originalWebkitAudioContext !== undefined) {
      ;(globalThis as unknown as { webkitAudioContext: unknown }).webkitAudioContext =
        originalWebkitAudioContext
    } else {
      delete (globalThis as unknown as { webkitAudioContext?: unknown }).webkitAudioContext
    }
    if (originalFetch) {
      globalThis.fetch = originalFetch
    }
  })

  it('playFlipSound() 在 audioEnabled=true 時應建立 AudioContext 並播放 buffer source', async () => {
    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await audio.playFlipSound()

    expect(audioContextInstances).toBeGreaterThanOrEqual(1)
    expect(sourceInstances.length).toBeGreaterThanOrEqual(1)
    expect(sourceInstances[sourceInstances.length - 1]!.start).toHaveBeenCalled()
  })

  it('playFlipSound() 在 audioEnabled=false 時應 no-op（不建立 AudioContext）', async () => {
    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = false

    const audio = useAudio()
    await audio.playFlipSound()

    expect(audioContextInstances).toBe(0)
    expect(sourceInstances).toHaveLength(0)
  })

  it('背景音樂 bgmMuted 預設應為 true（符合 Autoplay Policy）', async () => {
    const { useAudio } = await import('@/composables/useAudio')
    const audio = useAudio()

    expect(audio.bgmMuted.value).toBe(true)
  })

  it('toggleBgmMute() 應翻轉 bgmMuted', async () => {
    const { useAudio } = await import('@/composables/useAudio')
    const audio = useAudio()

    audio.toggleBgmMute()
    expect(audio.bgmMuted.value).toBe(false)

    audio.toggleBgmMute()
    expect(audio.bgmMuted.value).toBe(true)
  })

  it('playFlipSound() 在 fetch 失敗時應 swallow 錯誤不拋例外', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch
    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await expect(audio.playFlipSound()).resolves.toBeUndefined()
    expect(sourceInstances).toHaveLength(0)
  })

  it('playFlipSound() 在 AudioContext 不存在時應 swallow 且不拋例外', async () => {
    delete (globalThis as unknown as { AudioContext?: unknown }).AudioContext
    delete (globalThis as unknown as { webkitAudioContext?: unknown }).webkitAudioContext

    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await expect(audio.playFlipSound()).resolves.toBeUndefined()
    expect(sourceInstances).toHaveLength(0)
  })

  it('第一個來源 decode 失敗時應 fallback 至後續來源', async () => {
    // 第一次 decode throws（模擬 ogg 檔壞掉），第二次回傳有效 buffer
    decodeAudioDataMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('bad ogg'))
      .mockResolvedValue({} as AudioBuffer)

    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await audio.playFlipSound()

    expect(decodeAudioDataMock).toHaveBeenCalledTimes(2)
    expect(sourceInstances.length).toBeGreaterThanOrEqual(1)
    expect(sourceInstances[sourceInstances.length - 1]!.start).toHaveBeenCalled()
  })

  it('第二次 playFlipSound() 應重用 sharedContext 與 flipBuffer 快取', async () => {
    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await audio.playFlipSound()
    const firstContextCount = audioContextInstances
    const firstFetchCount = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls
      .length

    await audio.playFlipSound()

    // 第二次不應建立新的 AudioContext，也不應再 fetch 音效（flipBuffer 已快取）
    expect(audioContextInstances).toBe(firstContextCount)
    expect(
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(firstFetchCount)
    // 兩次 start 各自對應獨立的 BufferSource
    expect(sourceInstances.length).toBeGreaterThanOrEqual(2)
  })

  it('webkitAudioContext fallback：僅提供 webkit 版本時仍可建立 context', async () => {
    delete (globalThis as unknown as { AudioContext?: unknown }).AudioContext
    let webkitInstances = 0
    class WebkitAudioContext {
      destination = {}
      constructor() {
        webkitInstances += 1
        audioContextInstances += 1
      }
      createBufferSource() {
        const instance = makeSourceMock()
        sourceInstances.push(instance)
        return instance
      }
      decodeAudioData(...args: unknown[]) {
        return decodeAudioDataMock(...args)
      }
    }
    ;(globalThis as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext =
      WebkitAudioContext as unknown as typeof AudioContext

    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await audio.playFlipSound()

    expect(webkitInstances).toBe(1)
    expect(sourceInstances[sourceInstances.length - 1]!.start).toHaveBeenCalled()
  })

  it('所有來源皆 fetch 不 ok 時應 swallow 不拋例外', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }) as unknown as typeof fetch

    const { useAudio } = await import('@/composables/useAudio')
    const { useSettingsStore } = await import('@/stores/settingsStore')

    const settings = useSettingsStore()
    settings.audioEnabled = true

    const audio = useAudio()
    await expect(audio.playFlipSound()).resolves.toBeUndefined()
    expect(sourceInstances).toHaveLength(0)
  })
})
