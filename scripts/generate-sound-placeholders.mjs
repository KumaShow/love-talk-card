/**
 * 產生音效 placeholder（silent WAV，PCM 8-bit 8kHz mono）。
 *
 * 輸出：
 * - public/sounds/flip.wav （0.5 秒靜音）
 * - public/sounds/bgm.wav  （3 秒靜音循環用佔位）
 *
 * 背景：
 *   T073 規格要求 flip.ogg/mp3 與 bgm.ogg/mp3，但 OGG Vorbis / MP3 需要專屬編碼器，
 *   pure Node 無法在合理工作量內產生。改以 silent WAV 作為可 decode 的佔位，
 *   useAudio 的 FLIP_SOUND_SOURCES 會依 ogg → mp3 → wav 順序嘗試，
 *   正式 ogg/mp3 放入後即無縫升級，不需修改程式碼。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function buildSilentWav({ durationSeconds, sampleRate = 8000, bitsPerSample = 8 }) {
  const numChannels = 1
  const numSamples = Math.round(durationSeconds * sampleRate)
  const bytesPerSample = bitsPerSample / 8
  const dataSize = numSamples * numChannels * bytesPerSample

  const buffer = Buffer.alloc(44 + dataSize)
  // RIFF 主 header
  buffer.write('RIFF', 0, 'ascii')
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8, 'ascii')
  // fmt chunk（格式描述）
  buffer.write('fmt ', 12, 'ascii')
  buffer.writeUInt32LE(16, 16) // 子區塊大小：PCM 格式固定 16
  buffer.writeUInt16LE(1, 20) // AudioFormat：1 代表 PCM 無壓縮
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28) // ByteRate：每秒位元組數
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32) // BlockAlign：單一 sample frame 位元組數
  buffer.writeUInt16LE(bitsPerSample, 34)
  // data chunk（實際 sample 資料）
  buffer.write('data', 36, 'ascii')
  buffer.writeUInt32LE(dataSize, 40)
  // 靜音：8-bit unsigned PCM 的零點為 128，16-bit signed PCM 為 0
  const silenceValue = bitsPerSample === 8 ? 128 : 0
  buffer.fill(silenceValue, 44)
  return buffer
}

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT_DIR = resolve(ROOT, 'public/sounds')
mkdirSync(OUT_DIR, { recursive: true })

const flipWav = buildSilentWav({ durationSeconds: 0.4 })
writeFileSync(resolve(OUT_DIR, 'flip.wav'), flipWav)
console.log(`wrote flip.wav (${flipWav.length} bytes)`)

const bgmWav = buildSilentWav({ durationSeconds: 3 })
writeFileSync(resolve(OUT_DIR, 'bgm.wav'), bgmWav)
console.log(`wrote bgm.wav (${bgmWav.length} bytes)`)
