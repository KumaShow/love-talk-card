import { z } from 'zod'

/** 卡牌文字（四語言皆必填且非空） */
const CardTextSchema = z.object({
  zh: z.string().min(1),
  en: z.string().min(1),
  th: z.string().min(1),
  ja: z.string().min(1),
})

/** 單張卡牌（無 theme 欄位，由 index.ts 聚合時注入） */
export const ThemeCardSchema = z.object({
  id: z.string().regex(/^(des-\d{3}|val-\d{3}|(?!des-|val-)[a-z]+-\d{3}-(base|intimate))$/),
  isIntimate: z.boolean().optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: CardTextSchema,
})

/** 主題色彩（6 個 CSS hex） */
const ThemeColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundEnd: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  cardBack: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

/** 每個主題 JSON 檔的根結構 */
export const ThemeFileSchema = z.object({
  id: z.string().min(1),
  name: z.object({ zh: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ zh: z.string().min(1), en: z.string().min(1) }),
  colors: ThemeColorsSchema,
  endMessage: z.object({ zh: z.string().min(1), en: z.string().min(1) }),
  cards: z.array(ThemeCardSchema).min(1),
}).superRefine((themeFile, ctx) => {
  if (themeFile.id === 'desire' || themeFile.id === 'values') {
    themeFile.cards.forEach((card, index) => {
      if (card.isIntimate === true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'desire / values 主題的卡牌不得標記為 intimate。',
          path: ['cards', index, 'isIntimate'],
        })
      }
    })
    return
  }

  themeFile.cards.forEach((card, index) => {
    if (card.isIntimate !== undefined) {
      return
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '非 desire / values 主題的卡牌必須明確提供 isIntimate。',
      path: ['cards', index, 'isIntimate'],
    })
  })
})

export type ThemeFile = z.infer<typeof ThemeFileSchema>
