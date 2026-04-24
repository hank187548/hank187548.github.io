# Hank Yu CV & Portfolio Website

這是一個可直接部署到 GitHub Pages 的靜態個人網站。首頁已連結資料夾內的 `CV1_Hank_quant.pdf`，適合作為 CV、作品集與公開聯絡資訊入口。

## 檔案

- `index.html`: 首頁內容與 CV 連結
- `styles.css`: 網站樣式
- `script.js`: 捲動顯示動畫
- `CV1_Hank_quant.pdf`: PDF CV
- `.nojekyll`: 讓 GitHub Pages 直接發布靜態檔案

## 本地查看

直接用瀏覽器開啟 `index.html` 即可。

也可以在這個資料夾啟動簡單伺服器：

```bash
python3 -m http.server 8000
```

然後開啟：

```text
http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 建立 repository。
2. 在本機初始化 git 並提交：

```bash
git init
git branch -M main
git add .
git commit -m "Build CV portfolio website"
```

3. 連到你的 GitHub repository：

```bash
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
git push -u origin main
```

4. 到 GitHub repository 的 `Settings > Pages`。
5. Source 選 `Deploy from a branch`。
6. Branch 選 `main`，資料夾選 `/root`，儲存後等待網站生成。

## 上線前建議補齊

- 把 `index.html` 裡的 `Email 待補` 換成公開 email。
- 把 GitHub / LinkedIn 連結換成真實網址。
- 將 Projects 區塊改成真實專案、repo、報告或 demo。
