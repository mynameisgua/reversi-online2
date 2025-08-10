# Reversi / 黑白棋 — Online 版（Supabase Realtime）

功能：本地 PvP / vs AI、線上房間對戰、提示、悔棋、SEO 檔。

## 一鍵上線（Vercel）
1. 把專案上傳到 Vercel（Upload Project），或先推到 GitHub 再 Import。
2. Framework: Vite、Build: `npm run build`、Output: `dist`。
3. 在 Vercel **Environment Variables** 加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redeploy 後線上房間可用。

## 本機啟動
```bash
npm install
npm run dev
```

## 提示
- `index.html` 與 `public/robots.txt`、`public/sitemap.xml` 內有 `YOUR-DOMAIN-HERE`，可換成你的主網址。
