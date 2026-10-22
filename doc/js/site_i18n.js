(() => {
    "use strict";

    const translations = {
        "zh-hk": {
            "Language Development Lab, HKU Linguistics": "香港大學語言學系語言發展實驗室",
            "HKSL Sign browser": "香港手語詞庫瀏覽器",
            "Explore signs by meaning, language, handshape, iconic strategy, and more.": "按詞義、語言、手形、像似策略等搜尋手語詞條。",
            "Interface language": "介面語言",
            "HKU-HKSLLEX home": "HKU-HKSLLEX 首頁",
            "Hong Kong Sign Language Database": "香港手語資料庫",
            "HKSLLEX is a collection of Hong Kong Sign Language data created as part of the documentation effort for the Knowledge Exchange project,": "HKSLLEX 收錄香港手語資料，為知識交流計劃的語言記錄工作之一：",
            "This database organizes HKSL signs, English translations, videos, and associated research data for linguists, researchers, educators, and people interested in learning the language.": "本資料庫整理香港手語詞條、英文翻譯、影片及相關研究資料，供語言學家、研究人員、教育工作者及有意學習香港手語的人士使用。",
            "For the downloaded browser, include the video/webp folder. Videos in MP4 format are also available in the video folder. The reduced MP4 and WebP videos are available on OSF; full high-definition videos are available on request.": "使用下載版瀏覽器時，請一併下載 video/webp 資料夾。video 資料夾亦提供 MP4 影片。精簡版 MP4 與 WebP 影片可於 OSF 取得；如需高清影片，請另行聯絡。",
            "You can also download the complete database and work directly with its data files.": "亦可下載完整資料庫，直接使用其中的資料檔案。",
            "The database structure is defined in data.schema.json.": "資料庫結構定義於 data.schema.json。",
            "The database structure is defined in": "資料庫結構定義於",
            "describes its fields.": "並說明各項欄位。",
            "Data is stored in JSON format. A flattened CSV file with UTF-8 BOM is also provided for easy access.": "資料以 JSON 格式儲存，亦提供含 UTF-8 BOM 的扁平化 CSV 檔，方便取用。",
            "English (UK)": "English (UK)",
            "繁體中文（香港）": "繁體中文（香港）",
            "Data schema": "資料結構",
            "Browse the local database": "瀏覽本機資料庫",
            "Find a sign": "搜尋手語詞條",
            "Local database": "本機資料庫",
            "Report an issue": "回報問題",
            "Search across all sign data": "搜尋所有手語資料",
            "Try an English word, Chinese term, ID, or notation…": "試輸入英文、中文、詞條編號或記譜法…",
            "Search": "搜尋",
            "Results view": "結果檢視方式",
            "Advanced filters": "進階篩選",
            "Combine fields with nested AND / OR logic": "以複合 AND / OR 條件組合欄位",
            "Match": "符合",
            "Top-level filter logic": "頂層篩選邏輯",
            "ALL groups (AND)": "所有群組（AND）",
            "ANY group (OR)": "任何群組（OR）",
            "Add filter": "新增篩選條件",
            "Add nested group": "新增複合群組",
            "Clear filters": "清除篩選條件",
            "Reset": "重設",
            "Reset filters and sorting": "重設篩選條件與排序",
            "Reset sorting": "重設排序",
            "Handshape notation guide": "手形記譜說明",
            "ARTO notation guide": "ARTO 記譜說明",
            "Opened as a local file? Choose both data.json and data.schema.json.": "以本機檔案開啟？請選取 data.json 與 data.schema.json。",
            "Sign results": "搜尋結果",
            "View": "檢視方式",
            "Details (table)": "詳細資料（表格）",
            "Cards": "卡片",
            "Very small thumbnail": "極小縮圖",
            "Small thumbnail": "小縮圖",
            "Medium thumbnail": "中縮圖",
            "Large thumbnail": "大縮圖",
            "Sort": "排序",
            "Sort results": "排序結果",
            "Toggle sort direction": "切換排序方向",
            "Sort ascending": "升冪排序",
            "Sort descending": "降冪排序",
            "Per page": "每頁筆數",
            "Results per page": "每頁結果數",
            "Result pages": "結果頁面",
            "Previous page": "上一頁",
            "Next page": "下一頁",
            "First page": "第一頁",
            "Last page": "最後一頁",
            "Jump to page": "跳至頁",
            "Page number": "頁碼",
            "Go to page": "前往頁面",
            "Close": "關閉",
            "Choose a property…": "選擇屬性…",
            "Choose value…": "選擇值…",
            "Enter value…": "輸入值…",
            "Use * or ? wildcards": "可用 * 或 ? 萬用字元",
            "Choose property first": "請先選擇屬性",
            "Match clauses": "條件組合",
            "Nested group": "複合群組",
            "ALL (AND)": "全部符合（AND）",
            "ANY (OR)": "任一符合（OR）",
            "Remove group": "移除群組",
            "Remove filter": "移除篩選條件",
            "Show property description": "顯示屬性說明",
            "Choose a property to read its description": "選擇屬性以查看說明",
            "No description is defined for this property.": "此屬性沒有說明。",
            "deprecated": "已棄用",
            "Sorted by": "排序依據",
            "Search preferences could not be saved: {error}": "無法儲存搜尋偏好設定：{error}",
            "does not equal": "不等於",
            "equals": "等於",
            "greater than": "大於",
            "at least": "大於或等於",
            "less than": "小於",
            "at most": "小於或等於",
            "is": "是",
            "is not": "不是",
            "is empty": "為空",
            "is not empty": "不為空",
            "contains": "包含",
            "does not contain": "不包含",
            "wildcard match": "萬用字元匹配",
            "starts with": "開頭為",
            "Filter value": "篩選值",
            "Searchable property": "可搜尋屬性",
            "Filter operator": "篩選運算子",
            "Combine filters in this group": "組合此群組中的條件",
            "Select handshape codepoints": "選取手形碼位",
            "Select ARTO codes": "選取 ARTO 代碼",
            "Select glyphs or type decimal codepoints directly.": "可選取字形，或直接輸入十進位碼位。",
            "Type a notation or combine code buttons; * wildcard supported.": "可輸入記譜法或選取代碼；支援 * 萬用字元。",
            "Handshape codepoints": "手形碼位",
            "Search glyphs by decimal codepoint, alias, or description…": "依十進位碼位、別名或描述搜尋字形…",
            "Search handshape glyphs": "搜尋手形字形",
            "Handshape glyph choices": "手形字形選項",
            "No handshapes match this search.": "找不到符合的手形。",
            "Each glyph represents a decimal codepoint. Select one to add it to the filter, or type the notation directly (for example, 63;0,126;126).": "每個字形代表一個十進位碼位。選取字形可加入篩選條件，亦可直接輸入記譜法（例如 63;0,126;126）。",
            "Encoding description": "編碼說明",
            "Open complete handshape list (PDF)": "開啟完整手形清單（PDF）",
            "ARTO iconic strategy notation": "ARTO 像似策略記譜法",
            "ARTO codes are case-sensitive: uppercase letters code the dominant hand; lowercase letters code the other hand. Commas separate morphemes. Use a wildcard (*) in the filter field to match any sequence.": "ARTO 代碼區分大小寫：大寫代表主手，小寫代表副手。逗號分隔語素。可在篩選欄使用萬用字元（*）匹配任意序列。",
            "Acting": "動作",
            "Representing": "表徵",
            "Tracing": "描繪",
            "Orthography": "字形",
            "None": "無",
            "The hand depicts human motion or handling.": "手形呈現人的動作或操作物件。",
            "The hand embodies an object as a whole.": "手形代表完整物件。",
            "The hand traces the referent's outline.": "手形描繪所指物的輪廓。",
            "The hand embodies or traces a writing symbol.": "手形呈現或描繪書寫符號。",
            "No iconic strategy applies.": "不適用像似策略。",
            "Other hand": "副手",
            "Dominant hand": "主手",
            "Left-handed layout": "左手慣用排列",
            "Add selected code": "加入所選代碼",
            "Next morpheme": "下一個語素",
            "Clear selection": "清除選取",
            "Insert empty morpheme (0)": "插入空語素（0）",
            "Read full ARTO notation description": "閱讀完整 ARTO 記譜說明",
            "The dominant and other-hand selections combine into one morpheme.": "主手與副手的選項會組成一個語素。",
            "Select at least one hand code.": "至少選取一隻手的代碼。",
            "Select ARTO category {name} for {hand}": "為{hand}選取 ARTO 類別：{name}",
            "Select decimal codepoint {codepoint}": "選取十進位碼位 {codepoint}",
            "e.g. 63;0,126;126 or wildcard": "例如 63;0,126;126 或萬用字元",
            "e.g. Ar,T or wildcard": "例如 Ar,T 或萬用字元",
            "This database uses a modified version of the Handshape font, developed by the ": "本資料庫採用經改編的手形字型，由",
            "Centre for Sign Linguistics and Deaf Studies, CUHK": "香港中文大學手語及聾人研究中心",
            ", to encode handshapes.": "製作，用以編碼手形。",
            "Handshape font and codepoints": "手形字型與碼位",
            "Originally designed as a typesetting tool, the font's encoding scheme has been adapted into a comprehensive handshape library. Each distinct handshape is represented by a unique integer: its base-10 codepoint in the font.": "該字型原為排版工具，其編碼方式後改編為完整手形庫。每種手形以唯一整數表示，即其在字型中的十進位碼位。",
            "For example, the handshape for the number zero uses codepoint 65 (0x41), which maps to the character A in the font.": "例如，數字零的手形使用碼位 65（0x41），對應字型中的字元 A。",
            "The database initially used the font's symbols or codepoint aliases, but switched to codepoints to avoid filename and coding-compatibility issues.": "資料庫初期使用字型符號或碼位別名，後改用碼位，以免檔名及編碼相容問題。",
            "The library adds 17 handshapes to the original font, including 3 control codepoints for this notation. The handshape folder contains the complete codepoint set, glyph images, and CSV data.": "此手形庫在原字型上增添 17 種手形，其中 3 個控制碼位專供本記法使用。手形資料夾內含完整碼位、字形圖片及 CSV 資料。",
            "A single codepoint represents one handshape; multiple codepoints are therefore needed to describe a sign.": "每個碼位代表一種手形，故須以多個碼位描述一個手語詞條。",
            "Handshape codepoint notation": "手形碼位記法",
            "The notation describes the handshapes used in each syllable and morpheme.": "此記法描述各音節及語素所用的手形。",
            "Codepoints in pairs of two": "兩碼位成對",
            "An entry consists of codepoint pairs separated by a semicolon (;). The first codepoint represents the dominant hand; the second represents the non-dominant hand.": "每條記法由碼位對組成，各對以分號 (;) 分隔。首碼代表主手，次碼代表非主手。",
            "Handshape codepoints for SKIN.": "「皮膚」的手形碼位。",
            "Control handshape codepoints": "手形控制碼位",
            "These special codepoints represent a property rather than a handshape.": "這些特殊碼位代表某項特性，而非手形。",
            "The nil codepoint (0)": "空值碼位 (0)",
            "The nil codepoint marks the absence of a handshape, usually because that hand is not used in the sign.": "空值碼位表示沒有手形，通常代表該手不參與此手語。",
            "Handshape codepoints for EIGHT, a single-handed sign.": "「八」這個單手手語的手形碼位。",
            "The imitative codepoint (1)": "模仿碼位 (1)",
            "This codepoint abbreviates emblematic verb signs whose handshape imitates the referent's movement, so an exact handshape is not required. It is unused and deprecated.": "此碼位簡寫具代表性的動詞手語：手形模仿所指動作，故無須精確呈現手形。此碼位已棄用，現未使用。",
            "The symmetry codepoint (2)": "對稱碼位 (2)",
            "A symmetric sign has left and right hands that are exact mirror images in all phonological aspects, including handshape and movement.": "對稱手語之左右手在所有音韻層面皆互為鏡像，包括手形與動作。",
            "Read codepoint notation together with ARTO notation. When both are available, a symmetric sign uses the same handshape codepoint for both hands, while ARTO codes only the dominant hand.": "碼位記法須與 ARTO 記法合讀。兩者皆有資料時，對稱手語之雙手使用相同手形碼位，而 ARTO 僅標註主手。",
            "Handshape codepoints and ARTO coding for CITY.": "「城市」的手形碼位及 ARTO 編碼。",
            "Asymmetric signs": "非對稱手語",
            "For an asymmetric sign, ARTO codes both hands even when both hands share the same ARTO category.": "非對稱手語中，即使雙手屬相同 ARTO 類別，仍須分別標註兩手。",
            "Handshape codepoints and ARTO coding for SURGERY.": "「手術」的手形碼位及 ARTO 編碼。",
            "Symmetry when ARTO data is unavailable": "缺少 ARTO 資料時之對稱標註",
            "If ARTO iconic-strategy data is unavailable, codepoint notation identifies a symmetric sign by marking the non-dominant hand with 2.": "若無 ARTO 像似策略資料，則於非主手標註 2，以表示手語對稱。",
            "Handshape codepoints for CROWN.": "「皇冠」的手形碼位。",
            "Transitions across morphemes": "語素間之手形變化",
            "A sign may contain multiple morphemes. Separate codepoint pairs across morphemes with a full stop (.).": "一個手語可含多個語素。語素之間以句點 (.) 分隔碼位對。",
            "Handshape codepoints for FILM.": "「電影」的手形碼位。",
            "Transitions across syllables": "音節間之手形變化",
            "A syllable may be a single path movement, an internal movement such as opening or closing the hand, or both at once (Sandier, 2008). Mark a syllable boundary with a comma (,).": "音節可由單一路徑動作、手部內部動作（如張手或握手），或兩者同時構成（Sandier，2008）。音節界線以逗號 (,) 標示。",
            "In the example, one internal movement and one path movement combine to convey the sign's meaning; they are analysed as syllables, not morphemes.": "例中，一個內部動作與一個路徑動作共同表達手語意思，故分析為兩個音節，而非兩個語素。",
            "Handshape codepoints for EGG BEATER.": "「打蛋器」的手形碼位。",
            "Transitions within a syllable": "音節內之手形變化",
            "An internal movement may also change handshape. Append each additional handshape after the preceding handshape.": "內部動作亦可改變手形。新增手形碼位接於前一手形之後。",
            "Handshape codepoints for GREEDY.": "「貪心」的手形碼位。",
            "Validation pattern": "驗證格式",
            "Use this regular expression to validate a codepoint-notation entry:": "可用以下正規表示式驗證碼位記法：",
            "Reference": "參考資料",
            "Sandier, W. (2008). The syllable in sign language: Considering the other natural language modality.": "Sandier, W. (2008). The syllable in sign language: Considering the other natural language modality.",
            "CUHK CSLDS handshape notation": "中大手語語言及聾人研究中心手形記譜法",
            "ARTO is submorphemic: each morpheme may use one code per hand. Uppercase letters represent the dominant hand; lowercase letters represent the other hand. Morphemes are separated by commas; use 0 for an empty placeholder.": "ARTO 屬語素內層次：每個語素可為每隻手標註一個代碼。大寫代表主手，小寫代表副手。語素以逗號分隔；0 代表空位。",
            "ARTO code selector": "ARTO 代碼選擇器",
            "Sign video for {title}": "{title} 手語影片",
            "Entry": "詞條",
            "Recording": "錄影",
            "Video": "影片",
            "ASL-LEX-2 mapping": "ASL-LEX-2 對應",
            "Source": "來源",
            "Variant": "變體",
            "Lexical category": "詞類",
            "Handshape": "手形",
            "Morpheme count": "語素數量",
            "Demonstrator": "示範者",
            "Etymology": "詞源",
            "Iconicity ratings": "像似性評分",
            "Other data": "其他資料",
            "Empty": "空",
            "Loading sign data…": "正在載入手語資料…",
            "Could not load data.json ({status}).": "無法載入 data.json（{status}）。",
            "Could not load doc/data.schema.json ({status}).": "無法載入 doc/data.schema.json（{status}）。",
            "The data or schema file has an unexpected structure.": "資料或結構描述檔格式不符預期。",
            "The selected JSON files have an unexpected structure.": "所選 JSON 檔案格式不符預期。",
            "{file} is not valid JSON: {error}": "{file} 不是有效 JSON：{error}",
            "Could not read {file}.": "無法讀取 {file}。",
            "The glyph index could not be loaded: {error} Enter decimal codepoints in the filter field instead.": "無法載入字形索引：{error} 請改在篩選欄輸入十進位碼位。",
            "Language & translation": "語言與翻譯",
            "Written Chinese": "書面中文",
            "Cantonese": "粵語",
            "English": "英文",
            "Properties & downloads": "屬性與下載",
            "Sign": "手語詞條",
            "Active filters": "篩選條件",
            "Download:": "下載：",
            "Sign properties": "手語詞目屬性",
            "WebP video is unavailable for this entry.": "此詞條的 WebP 影片無法使用。",
            "No WebP video is listed for this entry.": "此詞條沒有 WebP 影片。",
            "No signs match these search criteria. Try changing a filter or broadening the search.": "沒有符合條件的詞條。請修改篩選條件或擴大搜尋範圍。",
            "Loaded {count} entries. Filter fields are generated from the data schema.": "已載入 {count} 條詞目。篩選欄位依資料結構產生。",
            "{count} signs found": "找到 {count} 條詞目",
            "{count} sign found": "找到 {count} 條詞目",
            "Select both data.json and data.schema.json.": "請同時選取 data.json 與 data.schema.json。",
            "Could not load the selected files: {error}": "無法載入所選檔案：{error}",
            "Sign data could not be loaded.": "無法載入手語資料。",
            "{error} Use a local web server, or select both JSON files below.": "{error} 請使用本機網頁伺服器，或選取下方兩個 JSON 檔案。",
            "Sign data could not be loaded: {error} Open this page through GitHub Pages or a local web server.": "無法載入手語資料：{error} 請透過 GitHub Pages 或本機網頁伺服器開啟此頁。",
            "Page {page} of {pages}": "第 {page} 頁，共 {pages} 頁",
            "Supplementary {index}": "補充影片 {index}",
            "Browse signs": "瀏覽手語詞條",
            "About the lexicon": "關於詞庫",
            "A resource for Hong Kong Sign Language": "香港手語研究資源",
            "Get started": "開始使用",
            "Access the data": "取得資料",
            "Reference": "參考資料",
            "Documentation & data format": "文件與資料格式",
            "Browse signs online": "線上瀏覽詞條",
            "Search the lexicon without downloading the database.": "無需下載資料庫，即可搜尋詞庫。",
            "Download the database": "下載資料庫",
            "Open sign_browser.html after extracting the archive.": "解壓縮後開啟 sign_browser.html。",
            "Human-readable schema": "易讀版資料結構",
            "Data is stored in JSON format.": "資料以 JSON 格式儲存。",
            "Language switcher": "語言切換"
        }
    };

    const schemaTranslations = {
        "HKU_HKSLLEX_ID.status": {
            title: "詞條狀態",
            description: "詞條狀態，可為 'live'、'under_review' 或 'removed'。'Live' 詞條可完整使用；'under_review' 詞條僅於資料中提供，不含影片；'removed' 詞條已由編輯移除，不供使用。必填。"
        },
        "HKU_HKSLLEX_ID.id": {
            title: "詞條編號",
            description: "資料庫中詞條的唯一識別碼。須符合 'HKSLLEX-[year]-[sequence]' 格式；[year] 為年份，[sequence] 為八位數且前置零不可省略。必填。"
        },
        "HKU_HKSLLEX_ID.entryType": {
            title: "詞條類型",
            description: "指定詞條類型。'vocabulary' 代表詞語詞條，'sentence' 代表句子詞條。預設為 'vocabulary'。必填。"
        },
        "HKU_HKSLLEX_ID.categories": {
            title: "語義分類",
            description: "描述手語語義範疇的字串陣列，例如教育、法律、醫學。"
        },
        "recording.date": {
            title: "錄影日期",
            description: "詞條錄影日期，須採用 ISO 8601 日曆日期格式，即 YYYY-MM-DD。"
        },
        "recording.remarks": {
            title: "錄影備註",
            description: "研究人員錄影期間所作的備註。"
        },
        "videoFile.name": {
            title: "影片檔名",
            description: "影片檔名，包含副檔名。"
        },
        "videoFile.nameOSF": {
            title: "OSF 檔名",
            description: "OSF 上影片的檔名，包含副檔名。"
        },
        "videoFile.nameGIF": {
            title: "WebP 檔名",
            description: "動畫 WebP 影片檔名，包含副檔名；此檔原為動畫 GIF 格式。"
        },
        "videoFile.duration": {
            title: "影片長度",
            description: "影片檔案長度，單位為毫秒。"
        },
        "videoFile.fileExtension": {
            title: "影片副檔名",
            description: "影片檔案的副檔名，預設為 mp4。"
        },
        "videoFile.supplementary[].fileName": {
            title: "補充影片 / 檔名",
            description: "補充錄影片段的檔名。"
        },
        "videoFile.supplementary[].type": {
            title: "補充影片 / 類型",
            description: "補充影片類型。'definition' 顯示 HKSL 詞條釋義；'example' 顯示詞條用例。"
        },
        "videoFile.supplementary[].content.text": {
            title: "補充影片 / 內容 / 文字",
            description: "補充影片所含的文字內容。"
        },
        "videoFile.supplementary[].content.language": {
            title: "補充影片 / 內容 / 語言",
            description: "文字內容所用語言，由兩部分組成並以連字號分隔：語言的 ISO 639-1 兩字母代碼，及地區的 ISO 3166-1 代碼或語言的 ISO 639-3 三字母代碼。"
        },
        "ASLLEX2.id": {
            title: "ASL-LEX-2 / 編號",
            description: "ASL-LEX-2.0 中對應詞條的 EntryID。"
        },
        "ASLLEX2.legacyIdMapping": {
            title: "ASL-LEX-2 / 舊編號對照",
            description: "ASL-LEX-2.0 中已棄用的 EntryID 參照，僅供舊有項目使用。"
        },
        "ASLLEX2.correspondance": {
            title: "ASL-LEX-2 / 對應關係",
            description: "說明 HKSLLEX 與 ASL-LEX-2.0 詞條的對應關係。'1to1' 為一對一；'Mto1' 為多個 HKSLLEX 詞條對應一個 ASLLEX 詞條；'Mto1_other' 為 HKSLLEX 詞條對應一個 ASLLEX 詞條，且另有其他來源；'1toM' 為一個 HKSLLEX 詞條對應多個 ASLLEX 詞條；'noASLLEX2' 表示無對應詞條；'MtoN' 為多對多；'Mto1_primary' 為多個 HKSLLEX 詞條對應一個 ASLLEX 詞條，並指定其中一項為主要對應詞條。"
        },
        "translation.EN-GB.primary": {
            title: "英式英文 / 主要譯詞",
            description: "手語的主要英式英文譯詞，作為詞典詞條使用。"
        },
        "translation.EN-GB.disambiguation": {
            title: "英式英文 / 消歧說明",
            description: "協助區分此手語英式英文意思的備註。"
        },
        "translation.EN-GB.secondary": {
            title: "英式英文 / 次要譯詞",
            description: "手語的其他英式英文譯詞。"
        },
        "translation.ZH-HK.primary": {
            title: "香港書面中文 / 主要譯詞",
            description: "手語的主要香港標準書面中文譯詞，作為詞典詞條使用。"
        },
        "translation.ZH-HK.disambiguation": {
            title: "香港書面中文 / 消歧說明",
            description: "協助區分此手語香港標準書面中文意思的備註。"
        },
        "translation.ZH-HK.secondary": {
            title: "香港書面中文 / 次要譯詞",
            description: "手語的其他香港標準書面中文譯詞。"
        },
        "translation.ZH-Yue.primary": {
            title: "香港粵語 / 主要譯詞",
            description: "手語的主要香港粵語譯詞，作為詞典詞條使用。"
        },
        "translation.ZH-Yue.secondary": {
            title: "香港粵語 / 次要譯詞",
            description: "手語的其他香港粵語譯詞。"
        },
        "translation.unichar": {
            title: "Unicode 字元",
            description: "手語的 Unicode 字元，僅供相容用途。"
        },
        "translation.unprocessed.en-GB": {
            title: "未整理譯文 / 英式英文",
            description: "手語未整理的英式英文譯文。"
        },
        "translation.unprocessed.zh-HK": {
            title: "未整理譯文 / 香港書面中文",
            description: "手語未整理的香港標準書面中文譯文。"
        },
        "translation.unprocessed.zh-YUE": {
            title: "未整理譯文 / 香港粵語",
            description: "手語未整理的香港粵語譯文。"
        },
        "translation.literal.en-GB": {
            title: "字面譯文 / 英式英文",
            description: "手語的英式英文直譯。"
        },
        "translation.literal.zh-HK": {
            title: "字面譯文 / 香港書面中文",
            description: "手語的香港標準書面中文直譯。"
        },
        "translation.literal.zh-YUE": {
            title: "字面譯文 / 香港粵語",
            description: "手語的香港粵語直譯。"
        },
        "translation.figurative.en-GB": {
            title: "比喻譯文 / 英式英文",
            description: "手語的英式英文比喻譯文。"
        },
        "translation.figurative.zh-HK": {
            title: "比喻譯文 / 香港書面中文",
            description: "手語的香港標準書面中文比喻譯文。"
        },
        "translation.figurative.zh-YUE": {
            title: "比喻譯文 / 香港粵語",
            description: "手語的香港粵語比喻譯文。"
        },
        "source": {
            title: "來源",
            description: "詞條來源。'ASLLEX2' 表示譯自 ASL-LEX-2.0 詞語；'HKSL-PSLC' 表示見於專業手語培訓中心教材的詞語；'HKU-HKSLLEX' 表示自行採集的詞條。"
        },
        "variant.number": {
            title: "異體 / 編號",
            description: "相對於主要詞條的異體序號。未使用。"
        },
        "variant.notes": {
            title: "異體 / 備註",
            description: "描述此詞條所示手語異體形式的文字。"
        },
        "lexicalCategory": {
            title: "詞類",
            description: "詞條主要香港粵語譯詞的詞類，採用標準書面中文，並對應 words.hk 詞典詞條。"
        },
        "cuhkcslds_HandshapeFont.CodepointNotation": {
            title: "手形 / 碼位記法",
            description: "以十進位碼位表示手語手形。每對碼位中，左值代表慣用手，右值代表非慣用手，兩者以分號 (;) 分隔。詞語以句點 (.) 分隔，語素以逗號 (,) 分隔。多音節語素可含多對以分號 (;) 分隔的碼位。"
        },
        "arto.stringNotation": {
            title: "ARTO / 字串記法",
            description: "以 ARTO 字串記法表示手語的像似策略。詳情請參閱相關文件。"
        },
        "arto.syllableBoundaries": {
            title: "ARTO / 音節界線",
            description: "每個 ARTO 符號所表示的音節數。"
        },
        "morphemeCount": {
            title: "語素數目",
            description: "手語中的語素數目。"
        },
        "demonstrator": {
            title: "示範者",
            description: "示範此手語的人士姓名。"
        },
        "etymology.unprocessed.en-GB": {
            title: "未整理詞源 / 英式英文",
            description: "手語未整理的英式英文詞源資料。"
        },
        "etymology.unprocessed.zh-YUE": {
            title: "未整理詞源 / 香港粵語",
            description: "手語未整理的香港粵語詞源資料。"
        },
        "etymology.formal.en-GB": {
            title: "結構化詞源 / 英式英文",
            description: "手語的英式英文結構化詞源資料；其格式日後訂定。"
        },
        "etymology.formal.zh-HK": {
            title: "結構化詞源 / 香港書面中文",
            description: "手語的香港標準書面中文結構化詞源資料；其格式日後訂定。"
        },
        "etymology.formal.zh-YUE": {
            title: "結構化詞源 / 香港粵語",
            description: "手語的香港粵語結構化詞源資料；其格式日後訂定。"
        },
        "etymology.category": {
            title: "詞源 / 類別",
            description: "手語詞源類別。'PURE_SIGN' 表示純手語；'VERBAL_SIGN' 表示源自口語；'ORTHOGRAPHIC_SIGN' 表示源自書寫語言。"
        },
        "iconicity.rating.deaf.average": {
            title: "像似度評分 / 聾人 / 平均",
            description: "聾人手語者給予的平均像似度評分。"
        },
        "iconicity.rating.deaf.count": {
            title: "像似度評分 / 聾人 / 人數",
            description: "參與評分的聾人手語者人數。"
        },
        "iconicity.rating.hearing.average": {
            title: "像似度評分 / 健聽人 / 平均",
            description: "健聽人給予的平均像似度評分。"
        },
        "iconicity.rating.hearing.count": {
            title: "像似度評分 / 健聽人 / 人數",
            description: "參與評分的健聽人人數。"
        }
    };

    const preferenceStorageKey = "hksl-sign-browser-preferences";
    let locale = "en-gb";

    try {
        const savedPreferences = JSON.parse(localStorage.getItem(preferenceStorageKey) || "{}");
        if (savedPreferences.locale === "en-gb" || savedPreferences.locale === "zh-hk") {
            locale = savedPreferences.locale;
        }
    } catch (error) {
        console.error("Could not restore the saved interface language.", error);
    }

    function translate(text, values = {}) {
        const translated = translations[locale]?.[text] || text;
        return translated.replace(/\{([a-zA-Z]+)\}/g, (match, name) => values[name] ?? match);
    }

    function translateSchemaField(path, title, description) {
        const localized = locale === "zh-hk" ? schemaTranslations[path] : null;
        return {
            title: localized ? `${localized.title} [${title}]` : title,
            description: localized?.description || description
        };
    }

    function applyStaticTranslations() {
        document.documentElement.lang = locale === "zh-hk" ? "zh-HK" : "en-GB";
        document.querySelectorAll("[data-i18n]").forEach(element => {
            element.textContent = translate(element.dataset.i18n);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            element.placeholder = translate(element.dataset.i18nPlaceholder);
        });
        document.querySelectorAll("[data-i18n-aria]").forEach(element => {
            element.setAttribute("aria-label", translate(element.dataset.i18nAria));
        });
        document.querySelectorAll("[data-i18n-title]").forEach(element => {
            element.title = translate(element.dataset.i18nTitle);
        });
    }

    function setLocale(nextLocale) {
        if (!translations[nextLocale] && nextLocale !== "en-gb") return;
        locale = nextLocale;
        const languageSelect = document.querySelector("#uiLanguage");
        if (languageSelect) languageSelect.value = locale;
        applyStaticTranslations();
        document.dispatchEvent(new CustomEvent("hksl-locale-change", { detail: { locale } }));
        try {
            const savedPreferences = JSON.parse(localStorage.getItem(preferenceStorageKey) || "{}");
            localStorage.setItem(preferenceStorageKey, JSON.stringify({ ...savedPreferences, locale }));
        } catch (error) {
            console.error("Could not save the selected interface language.", error);
        }
    }

    const languageSelect = document.querySelector("#uiLanguage");
    if (languageSelect) {
        languageSelect.value = locale;
        languageSelect.addEventListener("change", () => setLocale(languageSelect.value));
    }
    window.HKSLI18n = Object.freeze({
        translate,
        translateSchemaField,
        getLocale: () => locale,
        setLocale
    });
    applyStaticTranslations();
})();
