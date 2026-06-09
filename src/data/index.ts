import type { CardsData, ThemeId } from '@/types'
import attraction from './themes/attraction.json' with { type: 'json' }
import self_ from './themes/self.json' with { type: 'json' }
import interaction from './themes/interaction.json' with { type: 'json' }
import trust from './themes/trust.json' with { type: 'json' }
import desire from './themes/desire.json' with { type: 'json' }

/** 所有主題檔案清單（新增主題只需在此加入） */
const themeFiles = [attraction, self_, interaction, trust, desire]

/** 對外的卡牌資料集，供全域使用 */
export const cardsData: CardsData = {
  version: '1.0.0',
  themes: themeFiles.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    colors: t.colors,
    endMessage: t.endMessage,
  })),
  cards: themeFiles.flatMap((theme) =>
    (theme.cards as Array<Omit<CardsData['cards'][number], 'theme'>>).map((card) => ({
      ...card,
      theme: theme.id as ThemeId,
    })),
  ),
}
