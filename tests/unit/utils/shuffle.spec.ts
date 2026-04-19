import { describe, expect, it, vi, afterEach } from 'vitest'

import { shuffleArray } from '@/utils/shuffle'

describe('shuffleArray', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('會回傳新的陣列且不修改原始資料', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const original = ['a', 'b', 'c']
    const shuffled = shuffleArray(original)

    expect(shuffled).not.toBe(original)
    expect(original).toEqual(['a', 'b', 'c'])
    expect(shuffled).toEqual(['b', 'c', 'a'])
  })

  it('在空陣列與單一元素時仍可正常運作', () => {
    expect(shuffleArray([])).toEqual([])
    expect(shuffleArray(['only'])).toEqual(['only'])
  })
})
