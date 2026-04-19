/** 主題識別碼 */
export type ThemeId = 'attraction' | 'self' | 'interaction' | 'trust'

/** 副語言選項（不含主語言 zh） */
export type SecondaryLang = 'en' | 'th' | 'ja'

/** 卡牌難度等級 */
export type CardLevel = 1 | 2 | 3

/** 卡牌多語言文字 */
export interface CardText {
  zh: string
  en: string
  th: string
  ja: string
}

/** 單張卡牌資料 */
export interface Card {
  id: string
  theme: ThemeId
  isIntimate: boolean
  level: CardLevel
  text: CardText
}

/** 雙語文字（ZH-TW + EN） */
export interface LocalizedText {
  zh: string
  en: string
}

/** 主題色彩設定 */
export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  backgroundEnd: string
  text: string
  cardBack: string
}

/** 主題專屬結束訊息 */
export interface EndMessage {
  zh: string
  en: string
}

/** 主題資料 */
export interface Theme {
  id: ThemeId
  name: LocalizedText
  description: LocalizedText
  colors: ThemeColors
  endMessage: EndMessage
}

/** cards.json 根物件 */
export interface CardsData {
  version: string
  themes: Theme[]
  cards: Card[]
}

/** sessionStorage 快照格式 */
export interface GameSessionSnapshot {
  themeId: ThemeId
  deckOrder: string[]
  drawnCardIds: string[]
  intimateModeAtStart: boolean
}
