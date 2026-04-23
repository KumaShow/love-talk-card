import { expect, test, type Page } from '@playwright/test'

/**
 * T081：觸控目標最小尺寸無障礙驗證（憲章：≥44×44 CSS px）。
 *
 * 走訪主要頁面狀態（首頁、預覽浮層、遊戲中、抽牌 overlay），對所有可視
 * 互動元素（`button`、`[role="button"]`、`a`）檢查其 bounding box，
 * 確保 iPhone 14 直向 viewport 下觸控區域不小於 44×44 px。
 */
const MIN_SIZE = 44

type Offender = {
  page: string
  selector: string
  text: string
  width: number
  height: number
}

async function collectOffenders(page: Page, context: string): Promise<Offender[]> {
  // 先確認目前 DOM 穩定再評估觸控尺寸，避免 Vue transition / route 切換過程中
  // 讀到正在淡出的 overlay 造成假偽陽性
  await page.waitForLoadState('domcontentloaded')
  await page.waitForFunction(() => document.readyState === 'complete')

  const rects = await page.$$eval('button, [role="button"], a', (nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect()
      const style = window.getComputedStyle(node)
      const visible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none'
      const dataTest = node.getAttribute('data-test')
      const label =
        dataTest ??
        node.getAttribute('aria-label') ??
        node.textContent?.trim() ??
        ''
      return {
        selector: `${node.tagName.toLowerCase()}${dataTest ? `[data-test="${dataTest}"]` : ''}`,
        text: label.slice(0, 60),
        w: rect.width,
        h: rect.height,
        visible,
      }
    }),
  )

  const visibleRects = rects.filter((entry) => entry.visible)
  expect(
    visibleRects.length,
    `${context} 應至少包含 1 個可互動元素`,
  ).toBeGreaterThan(0)

  return visibleRects
    .filter((entry) => entry.w < MIN_SIZE || entry.h < MIN_SIZE)
    .map((entry) => ({
      page: context,
      selector: entry.selector,
      text: entry.text,
      width: Math.round(entry.w * 10) / 10,
      height: Math.round(entry.h * 10) / 10,
    }))
}

test.describe('a11y — 觸控目標 ≥44×44 px', () => {
  test('首頁 / 預覽浮層 / 遊戲中 / overlay 互動元素皆滿足最小尺寸', async ({ page }) => {
    test.setTimeout(60_000)

    const allOffenders: Offender[] = []

    // 1) 首頁初始狀態
    await page.goto('/')
    await expect(page.getByTestId('theme-deck-grid')).toBeVisible()
    allOffenders.push(...(await collectOffenders(page, 'home / idle')))

    // 2) 點主題卡堆 → 預覽浮層
    await page.getByTestId('theme-deck-attraction').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    allOffenders.push(...(await collectOffenders(page, 'home / preview')))

    // 3) CTA 進入遊戲畫面
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/attraction$/)
    await expect(page.getByTestId('fan-deck')).toBeVisible()
    allOffenders.push(...(await collectOffenders(page, 'game / idle')))

    // 4) 翻開第一張卡 → overlay 出現
    await page.locator('[data-test="fan-deck"] .is-active').click()
    await expect(page.getByTestId('picked-view')).toBeVisible()
    await expect(page.getByTestId('picked-next')).toBeVisible()
    allOffenders.push(...(await collectOffenders(page, 'game / picked overlay')))

    // 斷言裡的 JSON.stringify 已足以定位哪個元素未達標，不必額外 console.error
    expect(
      allOffenders,
      `以下互動元素觸控區未達 ${MIN_SIZE}x${MIN_SIZE} px：${JSON.stringify(allOffenders, null, 2)}`,
    ).toEqual([])
  })
})
