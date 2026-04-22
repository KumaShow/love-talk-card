import { onBeforeUnmount, ref } from 'vue'

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void
}

/**
 * useOrientation：以 window.matchMedia('(orientation: landscape)') 追蹤橫/直屏狀態。
 *
 * 設計決策（參見 research.md R-009）：
 * - 使用 matchMedia 而非 screen.orientation，iOS Safari 14 以下相容性較佳。
 * - 元件 unmount 時必定移除事件監聽器，避免記憶體洩漏與殭屍事件。
 * - isLandscape 為 reactive ref，可直接在模板中使用 v-if / 條件 class。
 *
 * 使用者切回直屏時不主動清理 Guard overlay 以外的遊戲狀態；
 * 遊戲狀態固化於 gameStore / sessionStorage，與方向無關。
 */
export function useOrientation() {
  const isLandscape = ref(false)

  /** SSR 或非瀏覽器環境無 matchMedia，直接回傳初值。 */
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { isLandscape }
  }

  const mql = window.matchMedia('(orientation: landscape)') as LegacyMediaQueryList
  isLandscape.value = mql.matches

  const handleChange = (event: MediaQueryListEvent | { matches: boolean }) => {
    isLandscape.value = event.matches
  }

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handleChange as (event: MediaQueryListEvent) => void)
  } else {
    mql.addListener?.(handleChange as (event: MediaQueryListEvent) => void)
  }

  onBeforeUnmount(() => {
    if (typeof mql.removeEventListener === 'function') {
      mql.removeEventListener('change', handleChange as (event: MediaQueryListEvent) => void)
    } else {
      mql.removeListener?.(handleChange as (event: MediaQueryListEvent) => void)
    }
  })

  return { isLandscape }
}
