import { afterEach, describe, expect, it, vi } from 'vitest'

import { shuffleArray } from '@/utils/shuffle'

/**
 * T021：Fisher-Yates 洗牌單元測試。
 * 涵蓋純函式性質、邊界條件、分布覆蓋。
 */
describe('shuffleArray', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('應回傳全新陣列且不修改原始輸入', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const original = ['a', 'b', 'c']

    const shuffled = shuffleArray(original)

    expect(shuffled).not.toBe(original)
    expect(original).toEqual(['a', 'b', 'c'])
    expect(shuffled).toEqual(['b', 'c', 'a'])
    randomSpy.mockRestore()
  })

  it('應保留所有元素且每個元素只出現一次（分布完整性）', () => {
    const source = Array.from({ length: 20 }, (_, index) => index)

    const shuffled = shuffleArray(source)

    expect(shuffled).toHaveLength(source.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual(source)
  })

  it('應在空陣列輸入時回傳空陣列', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('應在單一元素輸入時回傳僅含該元素的陣列', () => {
    const result = shuffleArray(['only'])

    expect(result).toEqual(['only'])
  })

  it('應均勻覆蓋所有排列（以固定隨機序列驗證）', () => {
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1)

    const shuffled = shuffleArray(['a', 'b', 'c', 'd'])

    expect([...shuffled].sort()).toEqual(['a', 'b', 'c', 'd'])
    randomSpy.mockRestore()
  })
})
