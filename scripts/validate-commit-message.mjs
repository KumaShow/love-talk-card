import { readFileSync } from 'node:fs'

/**
 * 驗證 commit 訊息是否符合 Conventional Commits 格式。
 */
function validateCommitMessage(filePath) {
  const message = readFileSync(filePath, 'utf8')
  const header = message.split(/\r?\n/, 1)[0].trim()

  if (!header) {
    console.error('Commit 訊息不可為空。')
    process.exit(1)
  }

  if (!/^(?:revert:\s.+|[a-z][a-z0-9-]*(?:\([^)]+\))?!?:\s.+)$/iu.test(header)) {
    console.error('請使用 Conventional Commits 格式，例如：feat: 新增功能 或 fix(card): 修正問題。')
    process.exit(1)
  }
}

const filePath = process.argv[2]

if (!filePath) {
  console.error('缺少 commit 訊息檔案路徑。')
  process.exit(1)
}

validateCommitMessage(filePath)
