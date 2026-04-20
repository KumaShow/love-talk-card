import type { ThemeId } from '@/types'

/** 全部有效的主題識別碼（與 data-model §2 ThemeId 枚舉一致）。 */
export const validThemeIds: ThemeId[] = ['attraction', 'self', 'interaction', 'trust']

/** 型別守衛：檢查輸入是否為合法 ThemeId。 */
export function isValidThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (validThemeIds as string[]).includes(value)
}
