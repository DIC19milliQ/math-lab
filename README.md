# 算数ラボ

小学2年生向けの、さわって試せる算数学習Webアプリです。現在は「かさ」の9ステージを収録しています。

## ローカル開発

```bash
npm install
npm run dev
```

## 確認

```bash
npm run lint
npm run build
npm run preview
```

`main` ブランチへのpushをGitHub Actionsが静的ビルドし、GitHub Pagesへ自動公開します。学習履歴はブラウザのlocalStorageに保存され、外部へ送信されません。
