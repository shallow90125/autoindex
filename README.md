# autoindex

nginx の autoindex をカスタムテーマで美しく表示するファイルブラウザ。

## 機能

- ダークテーマ UI
- ファイル種別ごとのアイコン表示
- 名前 / 更新日時 / サイズによるソート
- パンくずリストによるナビゲーション
- ファイルをクリックするとダウンロード

## 起動

```bash
docker compose up -d
```

`http://localhost` でアクセスできます。

## ディレクトリ構成

```
.
├── compose.yaml      # Docker Compose 設定
├── nginx.conf        # nginx 設定
├── public/           # 公開するファイルをここに置く
└── theme/
    ├── style.css     # カスタムスタイル
    └── main.js       # autoindex HTML をパースして UI を再描画
```

## 仕組み

nginx の `sub_filter` を使って autoindex が生成した HTML に `style.css` と `main.js` を注入します。
`main.js` は autoindex の `<pre>` タグをパースし、ソート・アイコン・パンくずリストを備えたテーブル UI として再レンダリングします。
