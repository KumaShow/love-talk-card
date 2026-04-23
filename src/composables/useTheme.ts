import type { Theme, ThemeId } from '@/types'

/**
 * useTheme：將主題色票注入到 document.documentElement 的 CSS 變數。
 *
 * 設計取捨：
 * - 為什麼寫到 documentElement 而非元件 root？因為 `#app` 的漸層背景、全域
 *   transition 都綁在 :root / body 變數上，若改寫元件 root 會讓未承載背景的
 *   View（例如 EndView 內層）失去氛圍色；統一寫到 documentElement 可讓所有
 *   `var(--color-*)` 使用者自然吃到最新值。
 * - 為什麼用 inline style 覆寫而非 class？cards.json 定義了 16 個色碼，若改走
 *   class 需預先生成 4 組主題 CSS，重複度高；以 CSS 變數注入能讓色票成為單一
 *   資料來源（data-model §3 ThemeColors）。
 */
const CSS_VAR_MAP = {
  background: '--color-bg',
  backgroundEnd: '--color-bg-end',
  primary: '--color-primary',
  secondary: '--color-secondary',
  text: '--color-text',
  cardBack: '--color-card-back',
} as const

type ColorKey = keyof typeof CSS_VAR_MAP

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
  }

  /**
   * 清除 inline 寫入的 6 個 CSS 變數，讓 :root 中的預設色（main.css）重新生效。
   * HomeView 會在 onMounted 呼叫此方法以恢復中性預設氛圍。
   */
  function resetTheme(): void {
    const root = document.documentElement
    for (const key of Object.keys(CSS_VAR_MAP) as ColorKey[]) {
      root.style.removeProperty(CSS_VAR_MAP[key])
    }
  }

  return { applyTheme, resetTheme }
}
