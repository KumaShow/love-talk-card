import type { ThemeId } from '@/types'
import { VALID_THEME_IDS } from '@/types'

/** 全部有效的主題識別碼（與 VALID_THEME_IDS 保持一致） */
export const validThemeIds: readonly string[] = VALID_THEME_IDS

/** 型別守衛：檢查輸入是否為合法 ThemeId */
export function isValidThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (validThemeIds as string[]).includes(value)
}
