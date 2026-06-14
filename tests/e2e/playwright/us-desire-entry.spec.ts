import { expect, test } from '@playwright/test'

test.describe('US Desire — 成人親密主題進入流程', () => {
  test('首頁預覽、攔截確認、返回與深連結守衛都應一致運作', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('挑選一副牌堆')).toBeVisible()
    await expect(page.locator('[data-test="theme-deck-grid"] > li')).toHaveCount(5)
    await expect(page.getByTestId('theme-deck-desire')).toBeVisible()

    await page.getByTestId('theme-deck-desire').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    await expect(page.getByTestId('preview-adult-hint')).toBeVisible()

    await page.getByTestId('preview-cta').click()
    await expect(page.getByTestId('adult-notice')).toBeVisible()
    await expect(page.getByTestId('adult-notice-continue')).toBeDisabled()

    await page.getByTestId('adult-notice-age').check()
    await page.getByTestId('adult-notice-continue').click()
    await expect(page).toHaveURL(/#\/game\/desire$/)
    await expect(page.getByTestId('fan-deck')).toBeVisible()
    await expect(page.getByTestId('app-header-remaining')).toContainText('20')

    await page.getByTestId('app-header-back').click()
    await expect(page).toHaveURL(/#\/?$/)
    await expect(page.getByText('挑選一副牌堆')).toBeVisible()

    await page.goto('/#/game/desire')
    await expect(page).toHaveURL(/#\/\?notice=desire$/)
    await expect(page.getByTestId('adult-notice')).toBeVisible()
  })

  test('先開啟 intimate 模式再進 desire，牌數仍維持 20 張', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('intimate-toggle').click()
    await expect(page.getByTestId('intimate-toggle')).toHaveAttribute('aria-checked', 'true')

    await page.getByTestId('theme-deck-desire').click()
    await page.getByTestId('preview-cta').click()
    await page.getByTestId('adult-notice-age').check()
    await page.getByTestId('adult-notice-continue').click()

    await expect(page).toHaveURL(/#\/game\/desire$/)
    await expect(page.getByTestId('app-header-remaining')).toContainText('20')
    await expect(page.getByTestId('fan-deck')).toBeVisible()
  })
})
