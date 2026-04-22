import { ref, watch } from 'vue'

import { useSettingsStore } from '@/stores/settingsStore'

/**
 * useAudio：翻牌音效與背景音樂管理。
 *
 * 設計決策（參見 research.md R-008）：
 * - 翻牌音效以 Web Audio API（AudioContext）播放，延遲 < 10ms，高頻觸發無 reset 開銷。
 * - 背景音樂以 App.vue 掛載的 <audio loop> 元素承載；mute 狀態與 settingsStore.musicEnabled 連動。
 * - AudioContext 與 flip buffer 皆「懶載入」：直到 playFlipSound() 第一次被呼叫才建立，
 *   避免對未互動的使用者觸發 Autoplay Policy 警告。
 * - 音效完全受 settingsStore.audioEnabled 控制；disabled 時 playFlipSound() 立即 no-op。
 */

/**
 * 翻牌音效檔名：依優先順序嘗試（實際 URL 會以 Vite BASE_URL 組合，
 * 以正確支援 `base: './'` 與 GitHub Pages sub-path 部署）。
 *
 * - ogg 首選（Firefox/Chrome 較佳壓縮與解碼表現）
 * - mp3 為 Safari/iOS 後備
 * - wav 為 Phase 7 交付時的 silent placeholder（詳見 public/sounds/README.md）；
 *   正式 ogg/mp3 加入後 fetch 會命中前面的項目，wav 自動降為最後 fallback。
 */
const FLIP_SOUND_FILENAMES = ['flip.ogg', 'flip.mp3', 'flip.wav'] as const
const BGM_SOUND_FILENAMES = ['bgm.ogg', 'bgm.mp3', 'bgm.wav'] as const

function resolveSoundUrl(filename: string): string {
  // Vite 保證 import.meta.env.BASE_URL 存在且以 '/' 結尾（含 base:'./' 會解析為相對路徑基底）。
  const base = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL
  return `${base}sounds/${filename}`
}

/** 模組級單例：多處呼叫 useAudio() 應共用同一個 AudioContext 與 buffer，避免重複 fetch。 */
let sharedContext: AudioContext | null = null
let flipBuffer: AudioBuffer | null = null
let flipBufferLoading: Promise<AudioBuffer | null> | null = null
const sharedBgmMuted = ref(true)

/** 取得或建立 AudioContext；環境不支援時回傳 null。 */
function getAudioContext(): AudioContext | null {
  if (sharedContext) return sharedContext
  const Ctor =
    (globalThis as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  sharedContext = new Ctor()
  return sharedContext
}

/** 依 FLIP_SOUND_FILENAMES 順序載入（目前為 flip.ogg → flip.mp3 → flip.wav）；任一成功即 decode 並快取 buffer。 */
async function loadFlipBuffer(context: AudioContext): Promise<AudioBuffer | null> {
  if (flipBuffer) return flipBuffer
  if (flipBufferLoading) return flipBufferLoading

  flipBufferLoading = (async () => {
    for (const filename of FLIP_SOUND_FILENAMES) {
      try {
        const response = await fetch(resolveSoundUrl(filename))
        if (!response.ok) continue
        const arrayBuffer = await response.arrayBuffer()
        const decoded = await context.decodeAudioData(arrayBuffer)
        flipBuffer = decoded
        return decoded
      } catch {
        // 單一來源失敗則嘗試下一個；全部失敗回傳 null（swallow 錯誤）。
      }
    }
    return null
  })()

  try {
    return await flipBufferLoading
  } finally {
    flipBufferLoading = null
  }
}

export function useAudio() {
  const settings = useSettingsStore()
  const bgmSourceUrls = BGM_SOUND_FILENAMES.map(resolveSoundUrl)

  /** 背景音樂 mute 狀態（預設 true，避免自動播放被瀏覽器阻擋）。 */
  const bgmMuted = sharedBgmMuted

  watch(
    () => settings.musicEnabled,
    (musicEnabled) => {
      bgmMuted.value = !musicEnabled
    },
    { immediate: true },
  )

  /**
   * 播放翻牌音效。
   *
   * - audioEnabled=false：立即 no-op，不建立 AudioContext。
   * - 第一次呼叫會 lazy-init AudioContext 並載入 flip buffer。
   * - 任何載入或播放錯誤皆被吞下，確保 UI 翻面流程不受干擾。
   */
  async function playFlipSound(): Promise<void> {
    if (!settings.audioEnabled) return

    try {
      const context = getAudioContext()
      if (!context) return

      const buffer = await loadFlipBuffer(context)
      if (!buffer) return

      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      source.start()
    } catch {
      // 任何例外都不影響 UI，翻面體驗優先。
    }
  }

  /** 切換背景音樂 mute；需由使用者互動觸發才能解除瀏覽器限制。 */
  function toggleBgmMute(): void {
    const nextMuted = !bgmMuted.value
    bgmMuted.value = nextMuted
    settings.musicEnabled = !nextMuted
  }

  return {
    bgmMuted,
    bgmSourceUrls,
    playFlipSound,
    toggleBgmMute,
  }
}
