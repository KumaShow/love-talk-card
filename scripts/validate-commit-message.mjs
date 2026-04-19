import { readFileSync } from 'node:fs'

/**
 * 驗證 commit 訊息本文是否包含繁體中文內容，並避免常見簡體字。
 */
function validateCommitMessage(filePath) {
  const message = readFileSync(filePath, 'utf8')
  const sections = message.split(/\r?\n\r?\n/)
  const body = sections.slice(1).join('\n').trim()

  if (!body) {
    console.error('Commit 訊息必須包含本文，且本文需使用繁體中文。')
    process.exit(1)
  }

  if (!/[\u3400-\u9fff]/u.test(body)) {
    console.error('Commit 訊息本文必須包含繁體中文內容。')
    process.exit(1)
  }

  if (/[体为这来后发开关计测网见点击码骤]/u.test(body)) {
    console.error('偵測到常見簡體字，請改用繁體中文撰寫 commit 訊息本文。')
    process.exit(1)
  }
}

const filePath = process.argv[2]

if (!filePath) {
  console.error('缺少 commit 訊息檔案路徑。')
  process.exit(1)
}

validateCommitMessage(filePath)
