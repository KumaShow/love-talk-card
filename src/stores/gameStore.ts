import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Card, ThemeId } from '@/types'

/** 遊戲狀態骨架，後續任務再補入商業邏輯。 */
export const useGameStore = defineStore('game', () => {
  const themeId = ref<ThemeId | null>(null)
  const deck = ref<Card[]>([])
  const drawnCardIds = ref<string[]>([])
  const intimateModeAtStart = ref(false)
  const isAnimating = ref(false)

  return {
    themeId,
    deck,
    drawnCardIds,
    intimateModeAtStart,
    isAnimating,
  }
})
