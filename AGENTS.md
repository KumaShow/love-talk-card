# AGENTS.md

- We're going to be using slash command from `.github\prompts\`
- Replies must use the ZH-TW format.

- Developed code must be user-friendly, externalizable, and translatable; support at  ​​(Traditional Chinese, English) and have correct localization formatting; the default time zone is Taiwan.

- When modifying the constitution.md file, you must force it to be translated into Traditional Chinese and synchronized with the .specify/memory/constitution_zh-tw.md file to ensure high consistency between the two files. If there are differences between the two files, you must use constitution_zh-tw.md as the standard, translate this file into English, and then write it back to constitution.md.

- Test-Driven Development (TDD) is strongly recommended for all program development.
- Styling MUST use Tailwind v4 utility-first. Do NOT use BEM (`block__element--modifier`). Write static styles (layout, spacing, color, typography, radius, responsive) as utility classes (including arbitrary variants like `max-[23rem]:`). Only keep hard-to-express styles in `<style scoped>` — `color-mix()`/gradients, 3D flip (`preserve-3d`/`rotateY`/`backface-visibility`/`perspective`), dynamic CSS-variable transforms, and Vue `<Transition>` enter/leave classes — using a single semantic class name (no BEM). Drive component state with `data-*` attribute selectors or conditional utility classes instead of BEM modifiers. Global design tokens live in `src/assets/main.css` (`@theme`).
- Code comments must be in Traditional Chinese.
- Commit log MUST BE use ZH-TW.
- Newline characters are all in LF format.

- 文件治理規則：
  - `docs/` 只放目前仍可直接指引開發的文件。
  - `docs/archive/` 主要放已完成任務、已過時審查、歷程記錄等封存用的**單檔 Markdown**。
  - `specs/` 放 Speckit 產出的規格、研究、任務歷史。
  - 專案真正的現況以程式碼與測試為準，文件若與實作不一致，需優先更新或封存文件。
  - 非 Speckit 產生的 Markdown 文件，檔名前方加排序編號，例如 `01-...md`、`02-...md`，並在同一層目錄內維持可排序性。
  - 非 Speckit 產生且放入 `docs/archive/` 的**單檔 Markdown**，檔案最上方必須補上狀態註記，至少包含 `status: archived`、`reason`、`superseded_by`。
