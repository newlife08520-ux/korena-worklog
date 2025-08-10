# KORENA Worklog（雲端部署版：Vercel + Supabase + Prisma）

## 一、準備
- 帳號：Vercel、Supabase（免費方案即可）
- 來源碼：此專案可直接上傳到 GitHub / GitLab 後由 Vercel 匯入

## 二、Supabase（建立 Postgres 並取得連線字串）
1. 建立專案（選擇近期地區）
2. 在專案頁面點 **Connect** → **ORM** → 選擇 **Prisma**
3. 複製兩組字串：
   - `DATABASE_URL`（Session Pooler）
   - `DIRECT_URL`（Direct Connection）
4. 在 Vercel 專案 Settings → **Environment Variables** 新增以上兩個變數

## 三、Vercel（部署 Next.js + Prisma）
1. 到 Vercel Dashboard → **Add New Project** → Import 你剛剛的 Git 儲存庫
2. Build 設定保持預設（Framework: Next.js）
3. 在「Environment Variables」區塊加入：
   - `DATABASE_URL` = 從 Supabase Copy
   - `DIRECT_URL` = 從 Supabase Copy
4. 首次部署完成後，執行資料庫遷移（兩種作法擇一）：
   - **方式A（Vercel CLI）**：本機安裝 Node.js，跑：
     ```bash
     npm i -g vercel
     vercel link      # 依指示連到你的 Vercel 專案
     npx prisma migrate deploy
     ```
   - **方式B（Prisma DB Push）**：
     ```bash
     npx prisma db push
     ```
     （對於 schema 尚未定稿的情境較快，但正式環境建議使用 migrate）

5. 打開部署網址（Production URL），在首頁點「匯入示例資料」即可看到範例

## 四、開發與修改
- 本地開發：
  ```bash
  npm install
  # 將 .env.example 另存為 .env，填入 Supabase 兩組連線字串
  npx prisma db push  # 或 npx prisma migrate dev
  npm run dev
  ```

---

### 備註
- Prisma `schema.prisma` 已設定 `provider = "postgresql"`。
- 若將來切換至自有 PostgreSQL，只要把 `DATABASE_URL` / `DIRECT_URL` 換掉即可。
