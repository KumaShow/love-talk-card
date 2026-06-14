import type { Theme, ThemeId } from '@/types'

/**
 * useTheme：將主題色票注入到 document.documentElement 的 CSS 變數。
 *
 * 設計取捨：
 * - 為什麼寫到 documentElement 而非元件 root？因為 `#app` 的漸層背景、全域
 *   transition 都綁在 :root / body 變數上，若改寫元件 root 會讓未承載背景的
 *   View（例如 EndView 內層）失去氛圍色；統一寫到 documentElement 可讓所有
 *   `var(--color-*)` 使用者自然吃到最新值。
 * - 為什麼用 inline style 覆寫而非 class？主題資料 JSON 定義了多組色碼，若改走
 *   class 需預先生成各主題 CSS，重複度高；以 CSS 變數注入能讓色票成為單一
 *   資料來源（data-model §3 ThemeColors）。
 */
const CSS_VAR_MAP = {
  background: '--color-surface',
  backgroundEnd: '--color-surface-end',
  primary: '--color-brand',
  secondary: '--color-accent',
  text: '--color-ink',
  cardBack: '--color-card',
} as const

type ColorKey = keyof typeof CSS_VAR_MAP

/**
 * 卡面（CardFace）襯底 CSS 變數。
 *
 * 卡面文字固定吃 --color-ink，而 ink 已是「主題正確」的（淺底主題為深色字、
 * 深底主題為淺色字）。問題只出在卡面襯底：原本固定白色，深底主題（desire）的
 * 淺色 ink 會在白卡上看不見。故依主題明暗推導襯底——
 * 淺底主題維持白卡；深底主題改用主題自身的 cardBack 深色襯底
 * （wcag-contrast 測試已驗 ink 對 cardBack ≥ 4.5:1，可讀性有保障）。
 */
const CARD_SURFACE_VAR = '--color-card-surface'
const LIGHT_CARD_SURFACE = '#ffffff'

/** YIQ 感知亮度（0–255）；非法 hex 回傳 0，讓卡面安全退回白卡。 */
function perceivedBrightness(hex: string): number {
  const match = /^#([\da-f]{6})$/i.exec(hex)
  if (match === null) {
    return 0
  }
  const value = match[1]
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

/** ink 偏亮（>140）代表深底主題，卡面需用 cardBack 當深色襯底；否則維持白卡。 */
function resolveCardSurface(theme: Theme): string {
  return perceivedBrightness(theme.colors.text) > 140 ? theme.colors.cardBack : LIGHT_CARD_SURFACE
}

export function useTheme() {
  /**
   * 將指定 themeId 的 6 個色票寫入 documentElement。
   * 若 themeId 不存在於 themes 清單則不動作（交由路由守衛處理無效 id）。
   */
  function applyTheme(themeId: ThemeId, themes: Theme[]): void {
    const theme = themes.find((entry) => entry.id === themeId)
    if (!theme) {
      return
    }
    const root = document.documentElement
    for (const key of Object.keys(CSS_VAR_MAP) as ColorKey[]) {
      root.style.setProperty(CSS_VAR_MAP[key], theme.colors[key])
    }
    // 卡面襯底依主題明暗推導；每次都覆寫，避免由深底主題切回淺底時殘留深色襯底
    root.style.setProperty(CARD_SURFACE_VAR, resolveCardSurface(theme))
  }

  /**
   * 清除 inline 寫入的 6 個 CSS 變數，讓 @theme 中的預設色（main.css）重新生效。
   * HomeView 會在 onMounted 呼叫此方法以恢復中性預設氛圍。
   */
  function resetTheme(): void {
    const root = document.documentElement
    for (const key of Object.keys(CSS_VAR_MAP) as ColorKey[]) {
      root.style.removeProperty(CSS_VAR_MAP[key])
    }
    root.style.removeProperty(CARD_SURFACE_VAR)
  }

  return { applyTheme, resetTheme }
}
