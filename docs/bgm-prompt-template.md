# Love Talk Card BGM 提示詞 Template

> 提供給 Google Gemini（Lyria）、ElevenLabs Music、Stable Audio、Udio
> 等 AI 音樂生成工具的可重用 BGM 提示詞模板。
> 目標是快速為四個主題（`attraction` / `self` / `interaction` / `trust`）
> 產出風格一致、可循環的純樂器背景音樂。

---

## 使用目標

這份模板用來協助你為遊戲生成主題 BGM，重點是：

- **變數化**：把可調整的部分抽成 `{{變數}}`，避免每次重寫
- **可組合**：「基底結構」+「主題 mood」+「風格軸」三段拼裝
- **可循環**：所有產出皆要求 seamless loop，方便在遊戲中無縫播放
- **無人聲**：嚴格 instrumental，避免歌詞干擾玩家對話

建議流程：

1. 從「主 Template」複製一份
2. 對照「變數對照表」與「主題對照表」填入對應值
3. 視需要套用「風格軸變體」（如日系、lo-fi、city pop）
4. 貼到 Gemini / Lyria 對話視窗生成
5. 用 Audacity 後製成 loop 並轉 `.ogg`

---

## 使用流程

### Step 1：選擇主題

從 `attraction` / `self` / `interaction` / `trust` 中挑一個，
查表填入對應的 `{{mood}}` / `{{instruments}}` / `{{tempo}}` / `{{key}}`。

### Step 2：選擇風格軸（可選）

預設為「通用浪漫輕快」。若想要特定風格，在 prompt 結尾加上對應的
`{{style_reference}}` 句子，例如：

- 日系戀愛：`Studio Ghibli + Key Visual Arts + shoujo manga`
- Lo-Fi 浪漫：`lofi hip hop + romantic chillhop`
- 昭和 City Pop：`Mariya Takeuchi + Tatsuro Yamashita + 70s city pop`

### Step 3：套用 negative prompt

固定加入「禁止人聲、歌詞、口白」這段，命中率最高。

---

## 主 Template（英文版）

> 這是給 Gemini / Lyria 的主提示詞。`{{...}}` 為待替換變數。

```
Generate a {{duration}} instrumental background music loop for a
romantic conversation card game.

Mood: {{mood}}.
Tempo: {{tempo}}.
Key: {{key}}.
Instruments: {{instruments}}. No drums, no heavy bass beats.

Style references: {{style_reference}}.

Structure: seamless loop with no abrupt transitions, gentle build every
{{phrase_length}} bars, no sudden dynamic changes, designed to play in
the background without distracting players during conversation.

Strictly instrumental — no vocals, no lyrics, no spoken word, no human
voice samples, no vocaloid.

Output format: stereo, high quality, loop-friendly with matching start
and end.
```

## 主 Template（中文版）

> Gemini 中文模式可用此版本。

```
請生成一段 {{duration_zh}} 的純樂器背景音樂循環，用於戀愛對話卡牌遊戲。

氛圍：{{mood_zh}}。
速度：{{tempo_zh}}。
調性：{{key_zh}}。
樂器：{{instruments_zh}}。不使用鼓組、不使用重低音 beat。

參考風格：{{style_reference_zh}}。

結構：無縫循環、不可有突兀轉折，每 {{phrase_length}} 小節微微推進，
不要突然的動態變化，要能在玩家對話時當作背景而不搶戲。

嚴格純樂器，禁止人聲、歌詞、口白、人聲取樣、Vocaloid。

輸出立體聲、高品質、循環友善（首尾能對接）。
```

---

## 變數對照表

| 變數 | 說明 | 建議值範例 |
|------|------|-----------|
| `{{duration}}` | 音樂長度（預設 30 秒） | `30-second` / `60-second` / `90-second` |
| `{{duration_zh}}` | 中文長度（預設 30 秒） | `30 秒` / `60 秒` / `90 秒` |
| `{{mood}}` | 情緒氛圍（英） | 見下方主題對照表 |
| `{{mood_zh}}` | 情緒氛圍（中） | 見下方主題對照表 |
| `{{tempo}}` | 速度（英） | `90–100 BPM, gentle and relaxed` |
| `{{tempo_zh}}` | 速度（中） | `90–100 BPM，舒緩放鬆` |
| `{{key}}` | 調性（英） | `C major` / `G major` / `F major` |
| `{{key_zh}}` | 調性（中） | `C 大調` / `G 大調` / `F 大調` |
| `{{instruments}}` | 樂器組合（英） | 見下方主題對照表 |
| `{{instruments_zh}}` | 樂器組合（中） | 見下方主題對照表 |
| `{{style_reference}}` | 參考風格（英） | 見下方風格軸變體 |
| `{{style_reference_zh}}` | 參考風格（中） | 見下方風格軸變體 |
| `{{phrase_length}}` | 樂句推進的小節數 | `4`（30 秒）／ `8`（60 秒）／ `16`（90 秒以上） |

---

## 主題對照表

下表提供 4 個主題的 `{{mood}}` / `{{instruments}}` / `{{tempo}}` / `{{key}}`
建議填法。直接複製到 Template 即可。

### `attraction`｜心動瞬間

- **{{mood}}**：`butterflies-in-stomach, sparkling and dreamy, blushing first-love feeling, light and floating`
- **{{mood_zh}}**：`怦然心動、晶瑩閃爍、害羞的初戀感、輕盈飄浮`
- **{{tempo}}** / **{{tempo_zh}}**：`90–95 BPM, light and bouncy` / `90–95 BPM，輕盈跳躍`
- **{{key}}** / **{{key_zh}}**：`G major or C major (bright)` / `G 大調或 C 大調，明亮`
- **{{instruments}}**：`harp arpeggios, music box, celesta, airy string pad, soft glockenspiel, light pizzicato strings`
- **{{instruments_zh}}**：`豎琴琶音、音樂盒、鋼片琴、空靈弦樂 pad、柔和鐘琴、輕盈撥弦`

### `self`｜自我探索

- **{{mood}}**：`tender, introspective, gentle warmth, slow heartbeat, quiet vulnerability`
- **{{mood_zh}}**：`溫柔、內省、緩慢心跳般的暖意、寧靜的脆弱感`
- **{{tempo}}** / **{{tempo_zh}}**：`75–85 BPM, slow and breathing` / `75–85 BPM，緩慢呼吸感`
- **{{key}}** / **{{key_zh}}**：`F major with A minor passing chords` / `F 大調搭配 A 小調過渡`
- **{{instruments}}**：`solo felt piano lead, sustained warm strings, distant celesta, subtle vinyl warmth, soft cello`
- **{{instruments_zh}}**：`毛氈鋼琴 solo 主旋律、溫暖延音弦樂、遠方鋼片琴、細微黑膠暖度、柔和大提琴`

### `interaction`｜互動理解

- **{{mood}}**：`cozy, sunny afternoon café, conversational, warm and unhurried`
- **{{mood_zh}}**：`愜意、午後陽光的咖啡廳、適合對話、溫暖不急促`
- **{{tempo}}** / **{{tempo_zh}}**：`95–105 BPM, relaxed walking pace` / `95–105 BPM，放鬆步調`
- **{{key}}** / **{{key_zh}}**：`C major or D major (bright)` / `C 大調或 D 大調，明亮`
- **{{instruments}}**：`fingerpicked acoustic guitar, ukulele, brushed light percussion, warm Rhodes piano, light whistle melody`
- **{{instruments_zh}}**：`指彈木吉他、烏克麗麗、輕刷打擊、溫暖 Rhodes 鋼琴、輕盈口哨旋律`

### `trust`｜信任成長

- **{{mood}}**：`candle-lit, intimate, warm and tender, slow and breathy, deep but safe`
- **{{mood_zh}}**：`燭光般、親密、溫暖深情、緩慢氣息感、深沉但安全`
- **{{tempo}}** / **{{tempo_zh}}**：`70–80 BPM, slow and intimate` / `70–80 BPM，緩慢親密`
- **{{key}}** / **{{key_zh}}**：`F major or D major (warm)` / `F 大調或 D 大調，溫暖`
- **{{instruments}}**：`nylon guitar fingerpicking, felt piano, warm cello, very soft upright bass, ambient pad, subtle music box`
- **{{instruments_zh}}**：`尼龍弦吉他指彈、毛氈鋼琴、溫暖大提琴、極輕直立貝斯、環境 pad、細微音樂盒`

---

## 風格軸變體（{{style_reference}} 填法）

可依需求選擇一條風格軸，填入 `{{style_reference}}` / `{{style_reference_zh}}`。

### A. 通用浪漫輕快（預設）

- **英**：`lo-fi romance, indie game menu music (Stardew Valley, A Short Hike), Studio Ghibli café scene`
- **中**：`lo-fi 浪漫、獨立遊戲選單音樂（Stardew Valley、A Short Hike）、吉卜力咖啡廳場景`

### B. 日系戀愛（少女漫畫／純愛 ADV）

- **英**：`Studio Ghibli (Joe Hisaishi), Makoto Shinkai instrumental, Key Visual Arts (Clannad / Kanon / Air), Tokimeki Memorial OST, kirakira shoujo manga aesthetic`
- **中**：`吉卜力（久石讓）、新海誠電影器樂部分、Key 社（Clannad / Kanon / Air）、心跳回憶配樂、kirakira 少女漫畫美學`

### C. Lo-Fi 浪漫（chillhop）

- **英**：`lofi hip hop romance, chillhop café, vinyl crackle, soft jazz piano, late-night study beats but romantic`
- **中**：`lofi hip hop 浪漫、chillhop 咖啡廳、黑膠雜訊、柔和爵士鋼琴、深夜讀書節拍但偏浪漫`

### D. 昭和 City Pop Romance

- **英**：`70s–80s Japanese city pop, Mariya Takeuchi, Tatsuro Yamashita, Rhodes piano, fretless bass, vintage drum machine, sunset romance`
- **中**：`70–80 年代日系 city pop、竹內瑪利亞、山下達郎、Rhodes 鋼琴、無格貝斯、復古鼓機、黃昏浪漫`

### E. 古典浪漫（鋼琴小品）

- **英**：`Yiruma piano style, Ludovico Einaudi minimalism, classical romance, solo piano with light strings`
- **中**：`Yiruma 風格鋼琴、Ludovico Einaudi 極簡主義、古典浪漫、鋼琴 solo 搭配輕弦樂`

### F. 和風日系（傳統樂器）

- **英**：`Japanese traditional instruments, koto, shakuhachi, light taiko, romantic wabi-sabi aesthetic`
- **中**：`日本傳統樂器、箏、尺八、輕太鼓、浪漫的侘寂美學`

---

## Negative Prompt（建議固定附加）

不論主題，都建議在 prompt 結尾加上以下避雷清單：

```
Negative: no vocals, no lyrics, no human voice samples, no vocaloid,
no rap, no EDM drop, no rock band, no electric guitar distortion,
no heavy drum kit, no abrupt transitions, no sudden silence.
```

---

## 完整範例：`attraction` × 日系戀愛

把所有變數套用後的成品如下，可直接複製貼到 Gemini：

```
Generate a 30-second instrumental background music loop for a
romantic conversation card game.

Mood: butterflies-in-stomach, sparkling and dreamy, blushing first-love
feeling, light and floating.
Tempo: 90–95 BPM, light and bouncy.
Key: G major or C major (bright).
Instruments: harp arpeggios, music box, celesta, airy string pad, soft
glockenspiel, light pizzicato strings. No drums, no heavy bass beats.

Style references: Studio Ghibli (Joe Hisaishi), Makoto Shinkai
instrumental, Key Visual Arts (Clannad / Kanon / Air), Tokimeki
Memorial OST, kirakira shoujo manga aesthetic.

Structure: seamless loop with no abrupt transitions, gentle build every
4 bars, no sudden dynamic changes, designed to play in the background
without distracting players during conversation.

Strictly instrumental — no vocals, no lyrics, no spoken word, no human
voice samples, no vocaloid.

Output format: stereo, high quality, loop-friendly with matching start
and end.

Negative: no vocals, no lyrics, no human voice samples, no vocaloid,
no rap, no EDM drop, no rock band, no electric guitar distortion,
no heavy drum kit, no abrupt transitions, no sudden silence.
```

---

## 一行版 Template

懶人快速試水溫用，依 `{{...}}` 替換即可：

```
{{duration}} seamless instrumental BGM loop, {{mood}}, {{tempo}},
{{instruments}}, {{style_reference}}, no vocals no lyrics, romantic
conversation card game.
```

範例（`trust` × Lo-Fi）：

```
30-second seamless instrumental BGM loop, candle-lit intimate warm and
tender slow and breathy, 75 BPM, nylon guitar fingerpicking + felt
piano + warm cello + ambient pad, lofi chillhop romantic vinyl
crackle, no vocals no lyrics, romantic conversation card game.
```

---

## 後製建議

Gemini / Lyria 產出後建議用 Audacity（免費）後製：

1. **音量正規化**：`Effect → Normalize`，目標 `-3 dB` peak
2. **首尾淡入淡出**：各 0.3–0.5 秒，避免循環點爆音
3. **循環點檢查**：在 Audacity 內把音檔頭尾相接複製貼上播放，確認無接縫破綻
4. **匯出格式**：
   - `.ogg` Vorbis Q5（約 64–96 kbps，~250KB / 30s）— 推薦給 Web
   - `.opus` 64 kbps（更小，~240KB / 30s）— 更新瀏覽器支援
   - 避免 `.mp3`（檔案大且需注意 LAME 授權）
5. **檔案放置**：`public/audio/bgm/{themeId}.ogg`，配合 `settingsStore.music`
   做 lazy load

---

## 命名建議

對應四主題：

```
public/audio/bgm/
  attraction.ogg
  self.ogg
  interaction.ogg
  trust.ogg
```

若有多個版本（如日系版、lo-fi 版）：

```
public/audio/bgm/
  attraction.jpop.ogg
  attraction.lofi.ogg
  self.jpop.ogg
  ...
```

---

## 替換流程速查

當你要為某主題生成新 BGM 時，照下列順序填入 Template：

1. 決定 `{{duration}}` → 預設 `30-second`，需要更長再用 `60-second` / `90-second`
2. 查「主題對照表」填入 `{{mood}}` / `{{instruments}}` / `{{tempo}}` / `{{key}}`
3. 查「風格軸變體」填入 `{{style_reference}}`
4. 設定 `{{phrase_length}}` → 30 秒填 `4`，60 秒填 `8`，90 秒以上填 `16`
5. 結尾附上 Negative Prompt
6. 貼到 Gemini，產生後做後製

---

## 現成 Prompt 速查（日系戀愛 × 4 主題）

> 預設搭配「風格軸 B. 日系戀愛」。直接複製對應主題的 code block 貼到
> Gemini / Lyria 即可。Lyria 對英文反應較精準，故統一以英文版提供；
> 若需中文模式，請對照「主 Template 中文版」自行套用。

### 1. `attraction`｜心動瞬間 × 日系戀愛

```
Generate a 30-second instrumental background music loop for a
romantic conversation card game.

Mood: butterflies-in-stomach, sparkling and dreamy, blushing first-love
feeling, light and floating.
Tempo: 90–95 BPM, light and bouncy.
Key: G major or C major (bright).
Instruments: harp arpeggios, music box, celesta, airy string pad, soft
glockenspiel, light pizzicato strings. No drums, no heavy bass beats.

Style references: Studio Ghibli (Joe Hisaishi), Makoto Shinkai
instrumental, Key Visual Arts (Clannad / Kanon / Air), Tokimeki
Memorial OST, kirakira shoujo manga aesthetic.

Structure: seamless loop with no abrupt transitions, gentle build every
4 bars, no sudden dynamic changes, designed to play in the background
without distracting players during conversation.

Strictly instrumental — no vocals, no lyrics, no spoken word, no human
voice samples, no vocaloid.

Output format: stereo, high quality, loop-friendly with matching start
and end.

Negative: no vocals, no lyrics, no human voice samples, no vocaloid,
no rap, no EDM drop, no rock band, no electric guitar distortion,
no heavy drum kit, no abrupt transitions, no sudden silence.
```

### 2. `self`｜自我探索 × 日系戀愛

```
Generate a 30-second instrumental background music loop for a
romantic conversation card game.

Mood: tender, introspective, gentle warmth, slow heartbeat, quiet
vulnerability, soft inner reflection.
Tempo: 75–85 BPM, slow and breathing.
Key: F major with occasional A minor passing chords (warm with a hint
of bittersweetness).
Instruments: solo felt piano as the lead, sustained warm strings,
distant celesta, subtle vinyl warmth texture, soft cello underline.
No drums, no heavy bass beats.

Style references: Joe Hisaishi solo piano works, Key Visual Arts solo
piano moments (Clannad "Dango Daikazoku" instrumental softness),
introspective shoujo anime BGM, Yuki Kajiura ambient piano.

Structure: seamless loop with no abrupt transitions, gentle build every
4 bars, no sudden dynamic changes, designed to play in the background
without distracting players during conversation.

Strictly instrumental — no vocals, no lyrics, no spoken word, no human
voice samples, no vocaloid.

Output format: stereo, high quality, loop-friendly with matching start
and end.

Negative: no vocals, no lyrics, no human voice samples, no vocaloid,
no rap, no EDM drop, no rock band, no electric guitar distortion,
no heavy drum kit, no abrupt transitions, no sudden silence.
```

### 3. `interaction`｜互動理解 × 日系戀愛

```
Generate a 30-second instrumental background music loop for a
romantic conversation card game.

Mood: cozy sunny afternoon café, conversational, warm and unhurried,
youthful and gentle, slice-of-life feeling.
Tempo: 95–105 BPM, relaxed walking pace.
Key: C major or D major (bright).
Instruments: fingerpicked acoustic guitar, ukulele, brushed light
percussion, warm Rhodes piano, light whistle melody, soft pizzicato
strings. No drum kit, no heavy bass beats.

Style references: K-On! ED instrumental tracks, Studio Ghibli café
scenes, slice-of-life shoujo anime daily BGM, "Hibike! Euphonium"
calm afternoon moments.

Structure: seamless loop with no abrupt transitions, gentle build every
4 bars, no sudden dynamic changes, designed to play in the background
without distracting players during conversation.

Strictly instrumental — no vocals, no lyrics, no spoken word, no human
voice samples, no vocaloid.

Output format: stereo, high quality, loop-friendly with matching start
and end.

Negative: no vocals, no lyrics, no human voice samples, no vocaloid,
no rap, no EDM drop, no rock band, no electric guitar distortion,
no heavy drum kit, no abrupt transitions, no sudden silence.
```

### 4. `trust`｜信任成長 × 日系戀愛

```
Generate a 30-second instrumental background music loop for a
romantic conversation card game.

Mood: candle-lit night, intimate and tender, warm and breathy, deep
but safe, gentle longing, nocturnal pure-love feeling.
Tempo: 70–80 BPM, slow and intimate.
Key: F major or D major (warm).
Instruments: nylon guitar fingerpicking, felt piano, warm cello, very
soft upright bass, ambient pad, subtle music box accents. No drum kit,
no heavy bass beats.

Style references: Air "Tori no Uta" instrumental, Kanon winter night
scenes, nocturnal shoujo BGM, Yuki Kajiura ambient nighttime, Joe
Hisaishi tender night themes.

Structure: seamless loop with no abrupt transitions, gentle build every
4 bars, no sudden dynamic changes, designed to play in the background
without distracting players during conversation.

Strictly instrumental — no vocals, no lyrics, no spoken word, no human
voice samples, no vocaloid.

Output format: stereo, high quality, loop-friendly with matching start
and end.

Negative: no vocals, no lyrics, no human voice samples, no vocaloid,
no rap, no EDM drop, no rock band, no electric guitar distortion,
no heavy drum kit, no abrupt transitions, no sudden silence.
```

---

## 速查總表

| 主題 | 速度 | 調性 | 樂句長度 | 核心氛圍 |
|------|------|------|---------|---------|
| `attraction` | 90–95 BPM | G / C 大調 | 4 bars | kirakira 怦然心動 |
| `self` | 75–85 BPM | F 大調 + A 小調 | 4 bars | 內省溫柔 |
| `interaction` | 95–105 BPM | C / D 大調 | 4 bars | 午後咖啡廳 |
| `trust` | 70–80 BPM | F / D 大調 | 4 bars | 燭光夜晚 |

完成。
