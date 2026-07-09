/**
 * values 主題「禁用措辭」共用字集（F8）。
 *
 * 由 T024（內容真實性掃描）與 T035（US4 語氣掃描）共同引用，
 * 避免兩處各自維護清單而產生分歧。
 *
 * 設計原則：
 * - values 的對話任務是「邀請分享與想像」，不是測驗、審判或相容性評分。
 * - 中文詞直接以字面比對（CJK 無 word boundary 概念）。
 * - 英文詞加 `\b` 邊界並使用 `i` flag，避免誤傷 improve / approve / compromise 等合法字。
 * - 僅收語氣明確越界者，寧可漏收也不誤傷真實文案。
 */
export interface ForbiddenPhrase {
  /** 觸發禁用的比對樣式 */
  pattern: RegExp
  /** 違反的語氣類別（繁中，供測試失敗訊息閱讀） */
  reason: string
}

export const VALUES_FORBIDDEN_PHRASES: ForbiddenPhrase[] = [
  // 相容性 / 契合度評分：不可把價值觀變成相容性測驗
  { pattern: /相容性/, reason: '相容性評分' },
  { pattern: /契合度/, reason: '相容性評分' },
  { pattern: /\bcompatibilit(?:y|ies)\b/i, reason: '相容性評分' },
  { pattern: /\bcompatible\b/i, reason: '相容性評分' },

  // 分數 / 評分 / 及格：不可為伴侶或關係打分
  { pattern: /分數/, reason: '對錯評分' },
  { pattern: /評分/, reason: '對錯評分' },
  { pattern: /打分/, reason: '對錯評分' },
  { pattern: /及格/, reason: '對錯評分' },
  { pattern: /\bscores?\b/i, reason: '對錯評分' },
  { pattern: /\bgrade[sd]?\b/i, reason: '對錯評分' },

  // 對錯 / 正確答案 / 測驗：價值選擇沒有標準答案
  { pattern: /正確答案/, reason: '測驗式對錯' },
  { pattern: /標準答案/, reason: '測驗式對錯' },
  { pattern: /對錯/, reason: '測驗式對錯' },
  { pattern: /誰對誰錯/, reason: '測驗式對錯' },
  { pattern: /測驗/, reason: '測驗式對錯' },
  { pattern: /\b(?:right|correct|wrong)\s+answer\b/i, reason: '測驗式對錯' },
  { pattern: /\bquiz\b/i, reason: '測驗式對錯' },

  // 命令伴侶改變 / 逼迫表態：不可要求對方應當如何或必須接受
  { pattern: /你應該/, reason: '審判或逼迫' },
  { pattern: /你必須/, reason: '審判或逼迫' },
  { pattern: /必須接受/, reason: '審判或逼迫' },
  { pattern: /一定要接受/, reason: '審判或逼迫' },
  { pattern: /\byou\s+should\b/i, reason: '審判或逼迫' },
  { pattern: /\byou\s+must\b/i, reason: '審判或逼迫' },
  { pattern: /\bmust\s+accept\b/i, reason: '審判或逼迫' },
  { pattern: /\bprove\s+(?:yourself|it|that|you)\b/i, reason: '審判或逼迫' },
]
