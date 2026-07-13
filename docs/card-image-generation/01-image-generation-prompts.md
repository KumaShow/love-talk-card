# 戀愛卡牌圖片生成提示詞

本文件用於後續以 `gpt-image-2.0` 產生卡牌視覺素材。目標是把六個主題的視覺氛圍圖片化，但保留卡牌文字、題號、主題名稱與互動狀態由前端 UI 呈現，避免圖片內文字影響繁中與英文在地化。

## 生成策略

- 建議先生成「卡牌背景圖」與「透明裝飾框」兩類素材，不直接生成含文字的完整卡牌。
- 背景圖用於建立主題氛圍；裝飾框用於角落、邊線、細節層次。
- 所有 prompt 都要求保留中央可讀區，方便前端疊加題目文字。
- 圖片內不得出現文字、數字、標誌或浮水印。
- 避免真人臉孔與過度寫實親密場景，保持成熟、溫暖、安全、可公開展示的戀愛對話卡牌質感。
- 建議輸出背景圖為 `webp`，透明裝飾框為 `png`。

## 建議參數

```json
{
  "model": "gpt-image-2.0",
  "size": "1024x1536",
  "quality": "high",
  "output_format": "webp"
}
```

透明裝飾框可改用：

```json
{
  "model": "gpt-image-2.0",
  "size": "1024x1536",
  "quality": "high",
  "output_format": "png",
  "background": "transparent"
}
```

## 檔案命名建議

```text
docs/card-image-generation/output/
  attraction/
    attraction-bg-v1.webp
    attraction-frame-v1.png
  self/
    self-bg-v1.webp
    self-frame-v1.png
  interaction/
    interaction-bg-v1.webp
    interaction-frame-v1.png
  trust/
    trust-bg-v1.webp
    trust-frame-v1.png
  desire/
    desire-bg-v1.webp
    desire-frame-v1.png
  values/
    values-bg-v1.webp
    values-frame-v1.png
```

## 共用負面限制

可附加在每個 prompt 最後：

```text
No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no explicit sexual content, no harsh contrast, no clutter in the center.
```

## `attraction`｜心動瞬間

現有色票：

- primary: `#E8A0BF`
- secondary: `#FFD6E0`
- background: `#FFF0F5`
- cardBack: `#C76D8E`

視覺核心：火花、曖昧、被吸引、第一眼的注意、溫柔期待。避免把畫面做成承諾、修復或深層安全感。

### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: attraction and romantic sparks. The feeling should be subtle, warm, playful, and emotionally mature, like the moment when someone becomes hard to look away from.

Visual style: elegant editorial illustration, soft cinematic lighting, tactile matte paper texture, delicate grain, dreamy but clean composition. Use warm blush pink, rose, coral, champagne light, and a small amount of muted deep berry for depth. The palette should harmonize with #E8A0BF, #FFD6E0, #FFF0F5, and #C76D8E.

Composition: vertical card ratio, richer decorative details near the border and corners, calm readable center area for overlaid card text. Include abstract glimmers, soft reflections, subtle curved lines, and tiny spark-like light details. Keep the center gentle and low contrast.

Mood: intimate, charming, curious, tender, not childish, not overly sweet.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no explicit sexual content, no harsh contrast, no clutter in the center.
```

### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: attraction, romantic sparks, gentle magnetism, first-heartbeat energy.

Visual style: refined fine-line ornament, soft blush pink and champagne accents, tiny spark details, subtle curved strokes, elegant editorial card design. The frame should feel romantic but mature.

Composition: border and corner decoration only, transparent center area for readable overlaid text, no filled background. The decoration should be light enough to layer above a soft card background.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no explicit sexual content.
```

## `self`｜自我探索

現有色票：

- primary: `#A8D8EA`
- secondary: `#D4EEF7`
- background: `#F0F8FF`
- cardBack: `#5BA4C0`

視覺核心：在關係裡看見自己、內在狀態、邊界、脆弱、個人成長。避免變成伴侶溝通指南或心動調情。

### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: self exploration inside a loving relationship. The image should feel calm, reflective, honest, and gently spacious, like opening a private journal and noticing your own inner weather.

Visual style: elegant editorial illustration, soft watercolor wash, tactile matte paper texture, subtle hand-drawn abstract shapes, delicate grain. Use airy sky blue, pale aqua, misty white, and muted blue-green accents. The palette should harmonize with #A8D8EA, #D4EEF7, #F0F8FF, and #5BA4C0.

Composition: vertical card ratio, quiet readable center area for overlaid card text, more texture and symbolic detail near the edges. Include abstract journal-paper layers, soft ripples, gentle window light, and small organic marks suggesting reflection and self-knowledge. Keep the center clean and emotionally safe.

Mood: introspective, tender, accepting, grounded, not lonely, not clinical.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no therapy-office imagery, no harsh contrast, no clutter in the center.
```

### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: self exploration, inner clarity, boundaries, gentle growth.

Visual style: refined fine-line ornament, soft aqua and muted blue-green accents, subtle paper texture, calm organic curves, small ripple and leaf-like abstract marks. The frame should feel quiet, mature, and emotionally safe.

Composition: border and corner decoration only, transparent center area for readable overlaid text, no filled background. Keep the frame delicate and spacious.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces.
```

## `interaction`｜互動理解

現有色票：

- primary: `#B8E0B8`
- secondary: `#D4F0D4`
- background: `#F0FFF0`
- cardBack: `#5BA05B`

視覺核心：溝通、傾聽、回應、默契、修復、彼此理解。避免過度導向長期承諾與深層安全感，那會偏向 `trust`。

### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: interaction and mutual understanding. The image should feel like two people finding a shared rhythm through listening, timing, small repairs, and everyday communication.

Visual style: elegant editorial illustration, soft natural light, tactile matte paper texture, gentle grain, refined abstract composition. Use fresh sage green, pale mint, warm ivory, and a little muted olive for depth. The palette should harmonize with #B8E0B8, #D4F0D4, #F0FFF0, and #5BA05B.

Composition: vertical card ratio, calm readable center area for overlaid card text, richer details near edges and corners. Include abstract conversation signals such as interweaving lines, paired circles, soft bridge-like curves, and small rhythm marks. Keep it symbolic, not literal chat bubbles.

Mood: warm, collaborative, patient, attentive, lightly playful, not corporate, not instructional.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no office-meeting imagery, no harsh contrast, no clutter in the center.
```

### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: interaction, listening, shared rhythm, mutual understanding.

Visual style: refined fine-line ornament, soft sage green and warm ivory accents, interweaving curves, paired dots, subtle bridge-like corner details. The frame should feel warm, conversational, and balanced.

Composition: border and corner decoration only, transparent center area for readable overlaid text, no filled background. Avoid literal speech bubbles and UI icons.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces.
```

## `trust`｜信任成長

現有色票：

- primary: `#D4A8E8`
- secondary: `#E8D4F7`
- background: `#F8F0FF`
- cardBack: `#8B5BB5`

視覺核心：安全感、誠實、承諾、依靠、未來、脆弱被穩穩接住。避免調情火花、互動技巧或壓迫式忠誠測試感。

### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: trust and shared growth. The image should feel emotionally safe, steady, honest, and gently courageous, like a promise built slowly through care and vulnerability.

Visual style: elegant editorial illustration, soft twilight lighting, tactile matte paper texture, delicate grain, refined abstract composition. Use lavender, soft violet, pale lilac, warm pearl, and a small amount of deep plum for grounding. The palette should harmonize with #D4A8E8, #E8D4F7, #F8F0FF, and #8B5BB5.

Composition: vertical card ratio, calm readable center area for overlaid card text, more detail near the borders and corners. Include abstract protective arcs, nested shapes, quiet stars, soft horizon light, and subtle growth lines. The center should feel open, stable, and reassuring.

Mood: secure, intimate, brave, grounded, hopeful, not dramatic, not mystical, not possessive.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no wedding imagery, no explicit sexual content, no harsh contrast, no clutter in the center.
```

### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: trust, emotional safety, shared future, steady commitment.

Visual style: refined fine-line ornament, soft lavender and warm pearl accents, protective arcs, nested shapes, tiny quiet stars, grounded symmetrical corner details. The frame should feel stable, tender, and mature.

Composition: border and corner decoration only, transparent center area for readable overlaid text, no filled background. Keep it elegant and calm, with enough negative space for long bilingual card text.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no wedding imagery.
```

## `desire`｜慾望與身體親密

現有色票：

- primary: `#7A2E4A`
- secondary: `#B5546F`
- background: `#2A1620`
- backgroundEnd: `#3E1E2E`
- text: `#F7E9EF`
- cardBack: `#5C2238`

視覺核心：被尊重地靠近、坦率表達身體渴望、依照彼此節奏回應，並保留隨時放慢、拒絕或停下的空間。建議採「低光絲絨 × 呼吸曲線 × 留白邊界」的成熟抽象風格，以質地、距離、節奏與光線傳達身體親密，不直接描繪身體或性愛場景。

與 `attraction` 的差異：`attraction` 是火花向外散開的輕盈心動；`desire` 是兩股形體靠近、停留、退讓所形成的安靜張力。避免只把粉紅色加深，也避免火焰、愛心、嘴唇、床、蠟燭、玫瑰、蕾絲或夜店霓虹等直白符號。

### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: adult desire, physical intimacy, mutual consent, body boundaries, and emotionally safe closeness. The image should feel sensual but respectful, direct but never explicit, like two people moving closer while remaining attentive to each other's pace and boundaries.

Visual style: sophisticated abstract editorial illustration, low-light velvet atmosphere, tactile matte paper texture, subtle embossed details, translucent flowing layers, soft cinematic diffusion, and delicate grain. Use deep wine, dark plum, muted berry, dusty rose, and restrained pearl highlights. The palette should harmonize with #7A2E4A, #B5546F, #2A1620, #3E1E2E, #F7E9EF, and #5C2238.

Composition: vertical card ratio. Keep the center calm, dark, spacious, and low contrast for long overlaid card text. Place richer tactile details near the borders and corners. Include two soft flowing forms or contour lines that approach and partially overlap while preserving visible breathing space between them. Use subtle pauses, openings, and changing line rhythms to suggest invitation, response, consent, and the freedom to slow down or stop.

Mood: intimate, warm, grounded, mature, quietly charged, mutually attentive, emotionally safe. Sensual through texture, proximity, rhythm, and light rather than bodies or literal sexual imagery.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no nudity, no body silhouettes, no explicit sexual content, no bedroom objects, no lips, no roses, no candles, no lace, no flames, no neon nightlife aesthetic, no harsh contrast, no clutter in the center.
```

### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: adult desire, mutual invitation, consent, body boundaries, changing pace, and safe physical intimacy.

Visual style: refined abstract fine-line ornament with deep wine, muted berry, and restrained pearl accents. Use soft tactile curves, paired contour lines, translucent ribbon-like details, subtle embossed texture, and small intentional openings that suggest breathing room and respected boundaries.

Composition: decoration only along the borders and corners, with a completely transparent and spacious center for long bilingual card text. Let some lines approach, overlap, pause, and separate without forming literal bodies, hearts, locks, or flames. The frame should feel intimate and quietly charged, but never explicit or decorative in a bridal or luxury-brand way.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no nudity, no body silhouettes, no explicit sexual content, no lips, no roses, no candles, no lace, no flames.
```

## `values`｜價值觀與未來（配色提案）

主題核心：價值排序、生活方式、金錢與安全感、家庭與未來、承諾選擇，以及社交界線。畫面應該讓人感覺「一起看見人生要往哪裡走」，而不是把重點放在戀愛火花、衝突修復或單純的安全感。

目前程式中的基準色票如下；以下三個方向都可以先用同一組構圖提示詞各生成 3 張背景圖與 2 張透明框，再比較主題辨識度與文字可讀性：

```text
primary: #574A9E
secondary: #8F84C9
background: #221C3F
backgroundEnd: #2E2857
text: #F2F1FA
cardBack: #3B3170
```

所有提案均可在 prompt 最後接上本文件的「共用負面限制」。

### 選項 A：深靛藍 × 暖金｜共同方向與人生藍圖

這是最接近目前實作色票的方向。深靛藍帶出思考、遠景與原則，少量暖金象徵共同決策中被照亮的重點；和 `trust` 的薰衣草紫相比更理性、更有方向感。

建議色票：`#574A9E`、`#8F84C9`、`#221C3F`、`#2E2857`、`#F2F1FA`、`#D8B66A`

#### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: values and future direction in a relationship. The image should feel thoughtful, grounded, and quietly expansive, like two people placing different life priorities on the same table and discovering how they might build a life together.

Visual style: sophisticated editorial illustration, deep indigo atmosphere, tactile matte paper texture, subtle grain, restrained metallic-gold light, layered translucent planes, and elegant abstract geometry. Use deep indigo, muted periwinkle, midnight blue, warm ivory, and very small touches of antique gold. The palette should harmonize with #574A9E, #8F84C9, #221C3F, #2E2857, #F2F1FA, and #D8B66A.

Composition: vertical card ratio, a calm low-contrast center for overlaid card text, with richer symbolic details near the borders and corners. Include abstract paths, constellation-like points, balanced scales without literal scale objects, intersecting horizon lines, and small illuminated markers suggesting priorities, choices, and a shared direction. Keep the symbolism open-ended and avoid literal maps or business graphics.

Mood: intentional, mature, hopeful, clear-minded, quietly intimate, not corporate, not mystical, not ceremonial.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no wedding imagery, no money or banknote imagery, no harsh contrast, no clutter in the center.
```

#### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: shared values, life direction, meaningful choices, and a future built through everyday decisions.

Visual style: refined fine-line ornament in deep indigo, muted periwinkle, warm ivory, and restrained antique-gold accents. Use abstract paths, small constellation-like points, balanced geometric segments, horizon lines, and subtle illuminated markers. The frame should feel thoughtful and mature, with a sense of direction but no literal map or business symbolism.

Composition: border and corner decoration only, completely transparent center area for long bilingual card text, with generous negative space and low visual noise.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no wedding imagery, no money symbols, no literal scales.
```

### 選項 B：墨綠 × 陶土｜日常選擇與生活根基

這個方向最貼近「價值觀如何落在日常生活」。墨綠與陶土比 `interaction` 的清新薄荷綠更厚實、更有生活感；適合金錢、家庭、家務、生活節奏與社交界線等題目。

建議色票：`#34483F`、`#788C73`、`#17241F`、`#263A31`、`#F3EBDD`、`#B86F52`

#### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: values and future choices expressed through everyday life. The image should feel grounded and warm, like two people considering home, time, family, money, community, and personal freedom while making room for each other's priorities.

Visual style: elevated editorial illustration, earthy low-saturation palette, tactile handmade paper texture, soft diffused daylight, subtle grain, layered organic shapes, and quiet architectural rhythms. Use deep forest green, sage-grey, warm clay, muted terracotta, parchment ivory, and soft shadow. The palette should harmonize with #34483F, #788C73, #17241F, #263A31, #F3EBDD, and #B86F52.

Composition: vertical card ratio, spacious readable center with gentle contrast, richer detail near the edges. Include abstract floor-plan-like lines without becoming an actual floor plan, overlapping circles, rooted forms, small doorway shapes, and repeated paths suggesting habits, boundaries, home, and different ways of moving forward. Keep the image symbolic and emotionally inviting.

Mood: grounded, warm, practical, reflective, quietly optimistic, not rustic branding, not domestic advertising, not instructional.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no literal house interior, no banknotes, no wedding imagery, no harsh contrast, no clutter in the center.
```

#### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: everyday values, life foundations, personal boundaries, and the many small choices that shape a shared future.

Visual style: refined fine-line ornament in deep forest green, sage-grey, warm parchment, and muted terracotta accents. Use rooted organic lines, doorway-like openings, overlapping circles, gentle path motifs, and small architectural marks without forming literal houses or floor plans. The frame should feel tactile, grounded, and mature.

Composition: border and corner decoration only, completely transparent center area for long bilingual card text. Keep the decoration asymmetrical but balanced, with generous breathing room.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no literal house, no banknotes, no wedding imagery.
```

### 選項 C：午夜藍 × 米白｜開放視野與共同未來

這個方向最輕、最現代，也最容易讓「未來」感覺開闊。午夜藍保留深度，米白與少量霧藍讓畫面不會像 `desire` 的低光親密，也不會像 `trust` 的紫色承諾。

建議色票：`#24344A`、`#6E8EAA`、`#111B29`、`#1B293B`、`#F4F0E8`、`#C59A62`

#### 背景圖 Prompt

```text
Create a premium vertical card background for a relationship conversation card game.

Theme: values, possibilities, and the future a couple may choose together. The image should feel open, spacious, and thoughtful, like looking toward a wide horizon while remaining present with the person beside you.

Visual style: modern editorial abstraction, midnight blue field, soft misty layers, tactile matte paper texture, delicate grain, pale ivory light, and restrained brushed-brass accents. Use midnight blue, slate blue, mist blue, warm ivory, and a small amount of muted brass. The palette should harmonize with #24344A, #6E8EAA, #111B29, #1B293B, #F4F0E8, and #C59A62.

Composition: vertical card ratio, a very calm center with soft tonal transitions for overlaid card text, and more movement near the borders. Include abstract horizon bands, branching but converging lines, open circular forms, subtle windows of light, and distant points suggesting possibility, choice, and a future that remains co-created. Avoid literal landscapes and navigation interfaces.

Mood: spacious, contemporary, curious, intentional, hopeful, emotionally mature, not cold, not futuristic technology, not celestial fantasy.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no literal landscape, no compass, no map, no wedding imagery, no harsh contrast, no clutter in the center.
```

#### 透明裝飾框 Prompt

```text
Create a transparent PNG decorative frame overlay for a premium vertical relationship conversation card.

Theme: shared possibilities, personal freedom, values in motion, and a future shaped by mutual choices.

Visual style: refined fine-line ornament in midnight blue, slate blue, warm ivory, and restrained brushed-brass accents. Use open circular forms, branching lines that gently converge, horizon bands, window-like openings, and tiny points of light. The frame should feel spacious, contemporary, and quietly hopeful rather than celestial or technological.

Composition: border and corner decoration only, completely transparent center area for long bilingual card text. Keep the lines light, with generous negative space and no heavy symmetrical crest.

No text, no letters, no numbers, no logo, no watermark, no readable typography, no UI mockup, no human faces, no literal landscape, no compass, no map, no wedding imagery.
```

#### 選擇建議

| 選項 | 最強的主題印象 | 適合的題目感受 | 主要風險 |
|---|---|---|---|
| A 深靛藍 × 暖金 | 原則、方向、共同藍圖 | 價值排序、未來規劃、承諾選擇 | 可能略偏理性或像高級品牌視覺 |
| B 墨綠 × 陶土 | 生活根基、日常實踐 | 金錢、家庭、生活方式、社交界線 | 可能與 `interaction` 的綠色系相近 |
| C 午夜藍 × 米白 | 開放可能、共同探索 | 未來想像、自由與界線、人生選擇 | 可能與 `self` 的冷色反思感接近 |

若優先考慮和現有六個主題一起陳列時的辨識度，建議先測試選項 A；若希望 values 更貼近日常生活與具體選擇，則測試選項 B。

## 批次生成建議

1. 每個主題先生成 3 張背景圖與 2 張透明裝飾框。
2. 先挑出「主題辨識度最高」與「中央文字可讀性最好」的版本。
3. 確認六個主題放在一起時，不要只像同一套設計換色；每個主題要有自己的構圖語彙，尤其需確認 `desire` 不會被誤認為深色版 `attraction`，`values` 也不要被誤認為 `trust` 的變體。
4. 選定風格後，再用同一組 prompt 產生 `v2`、`v3` 作為替代款。
5. 實作進前端前，先用繁中長句與英文長句各測一次疊字效果。

## 前端套用備註

- 圖片素材只負責氛圍，不承載任何可翻譯文字。
- 卡牌標題、題目、難度、主題名稱、按鈕文案仍應走 i18n。
- 若未來支援更多語言，圖片不需要重新產生。
- 若圖片過亮或過複雜，可在 CSS 疊一層半透明霧面遮罩提升可讀性。
