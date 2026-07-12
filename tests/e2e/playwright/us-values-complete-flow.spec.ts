import { expect, Page, test } from '@playwright/test'

const DECK_SIZE = 25

async function waitForPickedNextReady(page: Page): Promise<void> {
  await page.locator('[data-test="picked-next"]:not([class*="picked-cta-enter"])').waitFor({ state: 'visible' })
}

async function drawCenterCardAndReadText(page: Page): Promise<string> {
  await page.locator('[data-test="fan-deck"] [data-test="fan-card-active"]').click()
  await page.getByTestId('picked-view').waitFor({ state: 'visible' })
  await waitForPickedNextReady(page)
  return ((await page.locator('[data-test="picked-view"] [data-test="card-primary-text"]').textContent()) ?? '').trim()
}

test.describe('US Values — 完整 25 張遊玩流程', () => {
  test('抽完 25 張後進入 values 結束畫面', async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto('/')
    await page.getByTestId('theme-deck-values').click()
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/values$/)

    const seenTexts = new Set<string>()
    for (let index = 0; index < DECK_SIZE; index += 1) {
      const text = await drawCenterCardAndReadText(page)
      expect(text.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)
      expect(seenTexts.has(text), `第 ${index + 1} 張卡牌文字重複`).toBe(false)
      seenTexts.add(text)
      await page.getByTestId('picked-next').click()
      await expect(page.getByTestId('picked-view')).toHaveCount(0, { timeout: 3000 })
    }

    await expect(page).toHaveURL(/#\/end\/values$/)
    await expect(page.getByTestId('end-message')).toBeVisible()
  })
})
