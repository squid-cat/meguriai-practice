# API接続実装指示書

フロントエンドとバックエンドAPI間の繋ぎ込み実装を行うための指示書です。

## 事前準備

### 1. OpenAPIスキーマとAPIクライアントの生成
```bash
# OpenAPIスキーマとTypeScript型を生成
pnpm run generate:api-client
```

### 2. 生成されるファイルの確認
- `packages/web/utils/api-types.ts` - OpenAPI型定義（自動生成、編集禁止）
- `packages/web/utils/api-client.ts` - APIクライアントインスタンス

## API接続実装フロー

### 1. 設計書の確認
- kairo-design で作成された設計書を確認
- 各機能でAPI呼び出しが必要な箇所を特定
- 実装されている画面をベースとして、作成されたAPIの繋ぎ込み

### 2. APIクライアント利用パターン

#### GET リクエスト例
```typescript
import { apiClient } from "@/utils/api-client";

const { data, error } = await apiClient.GET("/api/users/{id}", {
  params: { path: { id: "123" } }
});

if (error) {
  console.error("API Error:", error);
  return;
}

// data は型安全
console.log(data.name);
```

#### POST リクエスト例
```typescript
import { apiClient } from "@/utils/api-client";

const { data, error } = await apiClient.POST("/api/users", {
  body: {
    name: "山田太郎",
    email: "yamada@example.com"
  }
});
```

#### エラーハンドリング
```typescript
if (error) {
  // HTTPステータスコードに応じた処理
  switch (error.status) {
    case 400:
      // バリデーションエラー
      break;
    case 401:
      // 認証エラー
      break;
    case 500:
      // サーバーエラー
      break;
  }
}
```

### 3. 実装対象の特定

以下の観点で実装箇所を特定してください：

#### フォーム送信
- ユーザー登録・更新
- 設定変更
- データ作成・編集

#### データ取得
- 一覧表示
- 詳細表示
- 検索機能

#### 認証関連
- ログイン・ログアウト
- トークン更新
- 権限チェック

#### リアルタイム更新
- データの自動更新
- 通知機能

### 4. 実装時の注意点

#### 型安全性の確保
```typescript
// 型推論を活用
const { data } = await apiClient.GET("/api/users");
// data は自動的に User[] 型として推論される
```

#### ローディング状態の管理
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    const { error } = await apiClient.POST("/api/data", { body: formData });
    if (error) throw error;
  } finally {
    setLoading(false);
  }
};
```

#### React Server ComponentsでのAPI呼び出し
```typescript
// app/users/page.tsx
export default async function UsersPage() {
  const { data: users } = await apiClient.GET("/api/users");
  
  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 5. 実装チェックリスト

- [ ] 各ページ・コンポーネントでのAPI呼び出し実装
- [ ] エラーハンドリングの実装
- [ ] ローディング状態の管理
- [ ] 型安全性の確認（TypeScriptエラーなし）
- [ ] フォームバリデーションとAPIバリデーションの連携
- [ ] 認証状態に応じたAPI呼び出し制御

## 実装後の確認

### 型検査とlint
```bash
pnpm run check
```

### 開発サーバーでの動作確認
```bash
# フロントエンド
pnpm run dev:web

# API サーバー
pnpm run dev:api
```

### API仕様の確認
- http://localhost:8000/swagger でSwagger UIを確認
- http://localhost:8000/doc でOpenAPI JSONを確認

## 注意事項

- `packages/web/utils/api-types.ts` は自動生成されるため手動編集禁止
- API仕様変更時は必ず `pnpm run generate:api-client` を実行
- 全てのユーザー向けメッセージは日本語で記述
- OpenAPI First設計に従ってAPI実装を行う
- 実装前に必ず設計書を確認し、要件との整合性を保つ