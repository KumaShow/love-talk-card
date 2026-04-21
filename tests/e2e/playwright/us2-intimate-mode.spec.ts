import { expect, Page, test } from '@playwright/test'

/**
 * T096：US2 私密模式整合流程 E2E 測試（Phase 9 UX 重塑後）。
 *
 * iPhone 14 直向 viewport 下驗證：
 *   1. 開啟 ToggleSwitch（intimate-toggle）後進入「心動瞬間」主題，
 *      連續抽滿牌堆；過程中依每次 picked-view overlay 內
 *      `[data-test="intimate-watermark"]` 出現次數，統計私密卡與一般卡比例。
 *   2. 關閉 ToggleSwitch 後進入「自我探索」主題抽完 15 張；
 *      驗證浮水印在整個流程中皆不出現（count === 0）。
 *
 * 浮水印計數採「簡化 19 張」策略：
 *   前 19 張於抽完後仍停留 GameView，picked-view overlay 可穩定觀察浮水印。
 *   第 20 張點「下一張」後立即導向結束頁，不列入計數。
 */
const ATTRACTION_DECK_SIZE = 20
const SELF_DECK_SIZE = 15

async function waitForPickedNextReady(page: Page): Promise<void> {
  // 等 picked-next 進場動畫結束（enter class 已被 Vue Transition 移除）
  await page
    .locator('[data-test="picked-next"]:not([class*="picked-cta-enter"])')
    .waitFor({ state: 'visible' })
}

async function openPickedView(page: Page): Promise<void> {
  await page.locator('[data-test="fan-deck"] .is-active').click()
  await page.getByTestId('picked-view').waitFor({ state: 'visible' })
  await waitForPickedNextReady(page)
}

async function dismissPickedView(page: Page): Promise<void> {
  await page.getByTestId('picked-next').click()
  // dismissing 動畫 460ms 後 phase=idle、pickedCard=null → picked-view v-if 失效 DOM 卸載
  await expect(page.getByTestId('picked-view')).toHaveCount(0, { timeout: 3000 })
}

test.describe('US2 — 私密模式', () => {
  test('開啟私密模式後抽滿牌堆，應觀察到浮水印按比例出現', async ({ page }) => {
    // attraction 20 張每輪 ~2s，加 routing 約需 60s；安全拉至 150s
    test.setTimeout(150_000)

    await page.goto('/')

    await expect(page.getByText('挑選一副牌堆')).toBeVisible()

    const toggle = page.getByTestId('intimate-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 2000 })

    await page.getByTestId('theme-deck-attraction').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/attraction$/)

    await expect(page.getByTestId('fan-deck')).toBeVisible()

    let intimateCount = 0
    let baseCount = 0

    // 前 19 張：picked-view overlay 可穩定觀察浮水印。
    for (let index = 0; index < ATTRACTION_DECK_SIZE - 1; index += 1) {
      await openPickedView(page)

      const primaryText = (
        (await page
          .locator('[data-test="picked-view"] [data-test="card-primary-text"]')
          .textContent()) ?? ''
      ).trim()
      expect(primaryText.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)

      // 浮水印若為私密牌會出現於 picked-view 子樹；以 count 計數
      const watermarkCount = await page
        .locator('[data-test="picked-view"] [data-test="intimate-watermark"]')
        .count()
      const hasIntimate = Math.min(watermarkCount, 1)
      intimateCount += hasIntimate
      baseCount += 1 - hasIntimate

      await dismissPickedView(page)
    }

    // 第 20 張：點下一張後立即導向結束頁。
    await openPickedView(page)
    await page.getByTestId('picked-next').click()
    await expect(page).toHaveURL(/#\/end\/attraction$/)
    await expect(page.getByTestId('end-message')).toBeVisible()

    expect(
      intimateCount + baseCount,
      '前 19 張計數總和必須等於 19',
    ).toBe(ATTRACTION_DECK_SIZE - 1)
    expect(
      intimateCount,
      `前 19 張應包含 4~5 張私密卡，實際為 ${intimateCount}`,
    ).toBeGreaterThanOrEqual(4)
    expect(
      intimateCount,
      `前 19 張私密卡不應超過 5 張，實際為 ${intimateCount}`,
    ).toBeLessThanOrEqual(5)
    expect(
      baseCount,
      `前 19 張應包含 14~15 張一般卡，實際為 ${baseCount}`,
    ).toBeGreaterThanOrEqual(14)
    expect(
      baseCount,
      `前 19 張一般卡不應超過 15 張，實際為 ${baseCount}`,
    ).toBeLessThanOrEqual(15)
  })

  test('關閉私密模式後重新開始，整段流程不應出現浮水印', async ({ page }) => {
    // self 15 張每輪 ~2s，約需 45s；安全拉至 120s
    test.setTimeout(120_000)

    await page.goto('/')

    const toggle = page.getByTestId('intimate-toggle')
    await expect(toggle).toBeVisible()

    // 每個 Playwright test 均獲得乾淨 browser context，settingsStore 重設為初始值，
    // 因此直接斷言初始為關閉；不再動態判斷點擊以避免觸發 playwright/no-conditional-in-test。
    await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 2000 })

    await page.getByTestId('theme-deck-self').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/self$/)

    await expect(page.getByTestId('fan-deck')).toBeVisible()

    let watermarkSightings = 0

    // 前 14 張：picked-view overlay 可觀察浮水印
    for (let index = 0; index < SELF_DECK_SIZE - 1; index += 1) {
      await openPickedView(page)

      const primaryText = (
        (await page
          .locator('[data-test="picked-view"] [data-test="card-primary-text"]')
          .textContent()) ?? ''
      ).trim()
      expect(primaryText.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)

      const watermarkCount = await page
        .locator('[data-test="picked-view"] [data-test="intimate-watermark"]')
        .count()
      watermarkSightings += watermarkCount

      await dismissPickedView(page)
    }

    // 第 15 張：點下一張後導向結束頁
    await openPickedView(page)
    await page.getByTestId('picked-next').click()
    await expect(page).toHaveURL(/#\/end\/self$/)
    await expect(page.getByTestId('end-message')).toBeVisible()

    expect(
      watermarkSightings,
      `關閉私密模式時浮水印不應出現，但累計觀察到 ${watermarkSightings} 次`,
    ).toBe(0)
  })
})
