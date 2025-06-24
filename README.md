# WireGuard Config Generator (Bootstrap Edition)

## 使い方

```bash
# 依存インストール
npm install

# 起動
npm start
```

- ブラウザで `http://localhost:4000` を開く
- フォームにパラメータを入力し **Generate** を押す
- サーバー `server.conf` と各クライアント `peer-x.conf` が生成され
  - コピー / ダウンロード
  - QR 表示
  - ZIP まとめてダウンロード
  が利用できます
