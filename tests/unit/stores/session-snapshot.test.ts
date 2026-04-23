import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Ajv from 'ajv'

import { useGameStore } from '@/stores/gameStore'
import type { GameSessionSnapshot } from '@/types'

/**
 * T078：sessionStorage round-trip 契約測試。
 * 啟動 session → 抽 3 張 → 讀 sessionStorage → 以 ajv 驗證序列化結果
 * 是否符合 contracts/game-session.schema.json。
 */
const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(
  __dirname,
  '../../../specs/001-love-talk-card-game/contracts/game-session.schema.json',
)
const sessionSchema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as Record<string, unknown>

const SESSION_KEY = 'love-talk-game-session'

describe('GameSessionSnapshot 契約驗證', () => {
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(sessionSchema)

  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('抽 3 張基礎牌後 sessionStorage 內容符合 schema', () => {
    const store = useGameStore()
    store.startSession('attraction', false)
    store.drawCard()
    store.drawCard()
    store.drawCard()

    const raw = sessionStorage.getItem(SESSION_KEY)
    expect(raw).not.toBeNull()

    const snapshot = JSON.parse(raw ?? '{}') as GameSessionSnapshot
    const ok = validate(snapshot)
    if (!ok) {
      console.error(validate.errors)
    }
    expect(ok).toBe(true)

    expect(snapshot.themeId).toBe('attraction')
    expect(snapshot.deckOrder).toHaveLength(15)
    expect(new Set(snapshot.deckOrder).size).toBe(15)
    expect(snapshot.drawnCardIds).toHaveLength(3)
    expect(snapshot.drawnCardIds.every((id) => snapshot.deckOrder.includes(id))).toBe(true)
    expect(snapshot.intimateModeAtStart).toBe(false)
  })

  it('私密模式下 deckOrder 為 20 張且仍通過 schema', () => {
    const store = useGameStore()
    store.startSession('trust', true)
    store.drawCard()

    const raw = sessionStorage.getItem(SESSION_KEY)
    const snapshot = JSON.parse(raw ?? '{}') as GameSessionSnapshot
    expect(validate(snapshot)).toBe(true)
    expect(snapshot.deckOrder).toHaveLength(20)
    expect(snapshot.intimateModeAtStart).toBe(true)
  })

  it('drawnCardIds 為 deckOrder 的前綴子集（不重複、順序一致）', () => {
    const store = useGameStore()
    store.startSession('self', false)
    store.drawCard()
    store.drawCard()
    store.drawCard()

    const raw = sessionStorage.getItem(SESSION_KEY)
    const snapshot = JSON.parse(raw ?? '{}') as GameSessionSnapshot
    expect(snapshot.drawnCardIds).toEqual(snapshot.deckOrder.slice(0, 3))
    expect(new Set(snapshot.drawnCardIds).size).toBe(snapshot.drawnCardIds.length)
  })
})
