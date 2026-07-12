import { expect, test } from '@playwright/test'

test.describe('US Values — 首頁、預覽與進入遊戲', () => {
  test('首頁顯示 values、可開啟預覽並進入遊戲', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('theme-deck-values')).toBeVisible()
    await page.getByTestId('theme-deck-values').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    await expect(page.getByTestId('preview-title')).toContainText('價值觀與未來')
    await expect(page.getByTestId('preview-adult-hint')).toHaveCount(0)
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/values$/)
    await expect(page.getByTestId('fan-deck')).toBeVisible()
    await expect(page.getByTestId('app-header-remaining')).toContainText('25')
  })
})
