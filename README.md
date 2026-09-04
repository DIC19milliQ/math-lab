# 算数ラボ

小学2年生向けの、さわって試せる算数学習Webアプリです。現在は「かさ」の10ステージ・48体験を収録しています。

「見る → 予想する → 操作する → 結果を見る → 気づく → 式と結ぶ → 使う」の順で、比較、任意単位、共通単位、L・dL・mL、単位関係、量感、換算・計算へ進みます。

## ローカル開発

```bash
npm install
npm run dev
```

## 確認

```bash
npm run lint
npm run validate:content
npm run build
npm run preview
```

`validate:content` は、問題ID・ステージ・技能の対応、未習単位、選択肢の正解、比較量、容器容量、基準コップ、杯数、単位関係、構成可能性、量感問題の推奨単位を検査します。

`main` ブランチへのpushをGitHub Actionsが静的ビルドし、GitHub Pagesへ自動公開します。学習履歴はブラウザのlocalStorageに保存され、外部へ送信されません。教材構成バージョン2への初回移行時は、旧「かさ」進捗だけをリセットします。
