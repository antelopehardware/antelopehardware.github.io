# 品牌商品資料

大有與 TOTAL 商品分別維護在 `devon-products.json`、`total-products.json`。新增或修改商品時，只需編輯對應檔案的 `products` 陣列：

- `category`：分類 ID，必須對應同一檔案 `categories` 中的 `id`。
- `name`：商品名稱。
- `description`：商品描述。
- `image`：圖片路徑或網址；本地圖片路徑以網站根目錄為準，例如 `pic/tool.jpg`。
- `imageAlt`：圖片替代文字。

新增分類時，在 `categories` 中加入唯一的 `id` 和顯示用 `name`，頁面會自動產生分類篩選。共用程式會提供關鍵字搜尋及每頁 24 項的分頁功能。
