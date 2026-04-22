/**
 * 產生 PWA placeholder icons（pure Node，無外部依賴）。
 *
 * 輸出：public/icons/icon-{size}x{size}.png（size = 72/96/128/144/152/192/384/512）。
 *
 * 設計：以主題主色 #E8A0BF 為底，中央疊一個簡化愛心形狀（純色填色，無反鋸齒）。
 * 僅作為 PWA 安裝之用；最終版 icon 應由設計師提供向量原稿後再重新匯出。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

/** CRC32 查表（PNG chunk 驗證用）。 */
function buildCrcTable() {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
}

const CRC_TABLE = buildCrcTable()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcValue = crc32(Buffer.concat([typeBuf, data]))
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crcValue, 0)
  return Buffer.concat([length, typeBuf, data, crcBuf])
}

/** 以像素矩陣（寬 × 高 × RGBA）產生 8-bit colour PNG。 */
function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // 位元深度（bit depth）
  ihdr[9] = 6 // 色彩型別（color type）：RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc((1 + width * 4) * height)
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 4)
    raw[rowStart] = 0 // 濾波器型別：None
    for (let x = 0; x < width; x += 1) {
      const src = (y * width + x) * 4
      const dst = rowStart + 1 + x * 4
      raw[dst] = pixels[src]
      raw[dst + 1] = pixels[src + 1]
      raw[dst + 2] = pixels[src + 2]
      raw[dst + 3] = pixels[src + 3]
    }
  }
  const idat = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * 依 (x, y) 座標回傳是否落在愛心形狀內。
 * 採用經典 implicit curve：(x^2 + y^2 - 1)^3 - x^2 y^3 ≤ 0
 * 其中 x, y 為正規化至 [-1, 1] 的浮點座標。
 */
function isInsideHeart(nx, ny) {
  const x = nx
  const y = -ny // PNG y 軸向下，翻轉以讓愛心尖端朝下
  const lhs = Math.pow(x * x + y * y - 1, 3)
  const rhs = x * x * y * y * y
  return lhs - rhs <= 0
}

function buildIconPixels(size) {
  const pixels = Buffer.alloc(size * size * 4)
  // 背景：主色 #E8A0BF
  const bg = [0xe8, 0xa0, 0xbf, 0xff]
  // 愛心：淡粉 #FFF0F5
  const heart = [0xff, 0xf0, 0xf5, 0xff]

  // 愛心佔 image 約 56% 寬度、居中
  const scale = size * 0.28
  const cx = size / 2
  const cy = size * 0.5

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      const nx = (x - cx) / scale
      const ny = (y - cy) / scale
      const inside = isInsideHeart(nx, ny)
      const rgba = inside ? heart : bg
      pixels[i] = rgba[0]
      pixels[i + 1] = rgba[1]
      pixels[i + 2] = rgba[2]
      pixels[i + 3] = rgba[3]
    }
  }
  return pixels
}

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT_DIR = resolve(ROOT, 'public/icons')
mkdirSync(OUT_DIR, { recursive: true })

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
for (const size of SIZES) {
  const pixels = buildIconPixels(size)
  const png = encodePng(size, size, pixels)
  const filePath = resolve(OUT_DIR, `icon-${size}x${size}.png`)
  writeFileSync(filePath, png)
  console.log(`wrote ${filePath} (${png.length} bytes)`)
}
