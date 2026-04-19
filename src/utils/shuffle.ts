/**
 * Fisher-Yates 洗牌演算法。
 * 會先建立陣列副本，再以 O(n) 的方式重新排列元素。
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}
