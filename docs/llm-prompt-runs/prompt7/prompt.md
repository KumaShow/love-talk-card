目前已完成文案更新、英文翻譯，接下來需要進行 JSON 格式的整理
各主題文案與 level 結果如下：
docs\llm-prompt-runs\prompt2-4\draft

英文翻譯結果如下：
docs\llm-prompt-runs\prompt6
將英文翻譯結果填入 text.en 中

請建立 Agent Team 將我確認過的卡片文案整理成 JSON 陣列，每個物件格式如下：

{
  "id": "att-001-base",
  "theme": "attraction",
  "isIntimate": false,
  "level": 1,
  "text": {
    "zh": "繁體中文文案",
    "en": "英文翻譯",
    "th": "泰文翻譯(留空)",
  }
}

範例：

{
  "id": "att-001-base",
  "theme": "attraction",
  "isIntimate": false,
  "level": 1,
  "text": {
    "zh": "第一次見到我時，你最先注意到我「哪裡」？",
    "en": "When you first saw me, what was the first thing you noticed about me?",
    "th": "",
  }
}

規則：
- theme 只能是 attraction / self / interaction / trust
- isIntimate 為 true 時，id 結尾要用 intimate；否則用 base
- base 與 intimate 的數量要正確
- level 要保留原本設定
- zh 必須是繁體中文
- en 要自然，不要直譯得很生硬
- th 留空字串
- 只輸出合法 JSON
- 不要多加說明文字
- 不要使用 markdown code block

最後將整理好的 JSON 格式，依主題分別放在 docs\llm-prompt-runs\prompt7 的各主題 md 檔案中，檔名為 cards-{主題名稱}.json