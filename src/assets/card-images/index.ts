import attractionBackground from './attraction-bg-v1.webp'
import attractionFrame from './attraction-frame-v1.png'
import desireBackground from './desire-bg-v3.webp'
import desireFrame from './desire-frame-v3.png'
import interactionBackground from './interaction-bg-v1.webp'
import interactionFrame from './interaction-frame-v1.png'
import selfBackground from './self-bg-v1.webp'
import selfFrame from './self-frame-v1.png'
import trustBackground from './trust-bg-v1.webp'
import trustFrame from './trust-frame-v1.png'

import type { ThemeId } from '@/types'

interface CardVisual {
  background: string
  frame: string
}

/** 各主題卡面圖片的單一映射入口，方便日後替換版本而不必修改元件。 */
export const CARD_VISUALS: Record<ThemeId, CardVisual> = {
  attraction: {
    background: attractionBackground,
    frame: attractionFrame,
  },
  self: {
    background: selfBackground,
    frame: selfFrame,
  },
  interaction: {
    background: interactionBackground,
    frame: interactionFrame,
  },
  trust: {
    background: trustBackground,
    frame: trustFrame,
  },
  desire: {
    background: desireBackground,
    frame: desireFrame,
  },
}
