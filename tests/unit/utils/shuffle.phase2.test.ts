import { describe, expect, it, vi } from 'vitest'

/** 洗牌測試：先寫失敗案例，再補上 Fisher-Yates 實作。 */
describe('shuffleArray', () => {
  it('回傳新的陣列且不修改原始資料', async () => {
    const { shuffleArray } = await import('@/utils/shuffle')
    const source = [1, 2, 3, 4]
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const shuffled = shuffleArray(source)

    expect(shuffled).not.toBe(source)
    expect(source).toEqual([1, 2, 3, 4])

    randomSpy.mockRestore()
  })

  it('保留所有元素且只出現一次', async () => {
    const { shuffleArray } = await import('@/utils/shuffle')
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
