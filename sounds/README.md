# 音效資源（Love Talk Card）

此目錄為 PWA precache 的音效來源，供 `src/composables/useAudio.ts` 讀取。

## 檔案清單

| 檔名 | 用途 | 狀態 | 建議規格 |
|------|------|------|---------|
| `flip.ogg` | 翻牌音效（首選格式，Firefox/Chrome） | **尚未提供** | OGG Vorbis，單聲道，≤ 0.5 秒，-12 ~ -6 dBFS |
| `flip.mp3` | 翻牌音效（fallback，Safari/iOS） | **尚未提供** | MP3 CBR 128 kbps，單聲道，≤ 0.5 秒 |
| `flip.wav` | **佔位**：silent WAV，自動產生（`npm run` 無對應腳本，請執行 `node scripts/generate-sound-placeholders.mjs`） | 已提供 | PCM 8-bit 8 kHz mono，0.4 秒靜音 |
| `bgm.ogg` | 背景音樂（首選格式） | **尚未提供** | OGG Vorbis loop seamless，-24 ~ -18 dBFS |
| `bgm.mp3` | 背景音樂（fallback） | **尚未提供** | MP3 CBR 128 kbps |
| `bgm.wav` | **佔位**：silent WAV，自動產生 | 已提供 | PCM 8-bit 8 kHz mono，3 秒靜音 |

## 運作順序

`useAudio.playFlipSound()` 會依序嘗試 `/sounds/flip.ogg` → `/sounds/flip.mp3` → `/sounds/flip.wav`。
只要正式 OGG/MP3 放進此目錄即可無縫升級，不需修改程式碼。

## 佔位策略說明

Phase 7（US5 PWA / 離線）交付時尚未取得免版稅音效素材，因此以 `silent WAV` 作為可 decode
的 placeholder（確保 `decodeAudioData()` 不會拋錯、useAudio 仍走完完整流程）。

`useAudio` 本身對 fetch 失敗具備 swallow 行為；但保留 WAV 仍有價值：

1. 讓 vite-plugin-pwa precache 真實存在檔案，避免 SW 安裝期警告。
2. 確保未來替換為正式音效時不必同時調整 composable 與建構設定。

## 建議來源（正式音效替換時）

- [freesound.org](https://freesound.org/)（選擇 CC0 / CC-BY 授權，歸屬見 LICENSE）
- [Zapsplat](https://www.zapsplat.com/)（需免費註冊；注意商業使用條款）
- 自行錄製後以 `ffmpeg` 編碼：
  ```bash
  ffmpeg -i source.wav -c:a libvorbis -b:a 96k -ac 1 flip.ogg
  ffmpeg -i source.wav -c:a libmp3lame -b:a 128k -ac 1 flip.mp3
  ```

替換完畢後請在儲存庫 `LICENSE` / `README` 記載素材授權資訊。
