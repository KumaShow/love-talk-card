import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'

const traditionalCommentPlugin = {
  rules: {
    'zh-tw-comment': {
      meta: {
        type: 'suggestion',
        docs: {
          description: '要求程式碼註解優先使用繁體中文',
        },
        schema: [],
        messages: {
          useTraditionalChinese: '程式碼註解請使用繁體中文，避免使用英文為主的行內註解。',
        },
      },
      create(context) {
        const sourceCode = context.sourceCode

        return {
          Program(node) {
            for (const comment of sourceCode.getAllComments()) {
              const value = comment.value.trim()

              if (!value) {
                continue
              }

              if (/^https?:\/\//u.test(value) || /^eslint/u.test(value) || /<reference/u.test(value)) {
                continue
              }

              if (/[A-Za-z]/u.test(value) && !/[\u3400-\u9fff]/u.test(value)) {
                context.report({
                  node,
                  loc: comment.loc,
                  messageId: 'useTraditionalChinese',
                })
              }
            }
          },
        }
      },
    },
  },
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts}'],
  },
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/test-results/**',
    'env.d.ts',
  ]),
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    plugins: {
      'zh-tw': traditionalCommentPlugin,
    },
    rules: {
      'zh-tw/zh-tw-comment': 'error',
    },
  },
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['tests/e2e/**/*.{test,spec}.ts'],
  },
)
