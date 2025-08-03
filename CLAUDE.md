# CLAUDE.md

## プロジェクト基本情報

**Meguriai** - pnpm workspacesによるモノレポ構成のWebアプリケーション

- **アーキテクチャ**: モノレポ（pnpm workspaces）
- **フロントエンド**: Next.js (React 19) - packages/web
- **バックエンド**: Hono + Prisma - packages/api
- **データベース**: PostgreSQL (Docker)
- **言語**: TypeScript
- **パッケージマネージャー**: pnpm
- **コードフォーマッター**: Biome
- **API**: OpenAPI 3.0 + Zod validation

## 共通コマンド

### 開発・ビルド
```bash
# フロントエンド開発サーバー起動 (http://localhost:3000)
pnpm run dev:web

# APIサーバー開発起動 (http://localhost:8000)
pnpm run dev:api

# フロントエンドビルド
pnpm run build:web

# APIサーバービルド
pnpm run build:api

# 本番環境起動
pnpm run start:web
pnpm run start:api
```

### コード品質
```bash
# 型検査とlint（全体）
pnpm run check

# コード自動修正
pnpm run fix
```

### データベース
```bash
# Prisma Studio（DB管理画面）
pnpm run prisma:studio

# DBマイグレーション実行
pnpm run prisma:migrate

# Prisma Client再生成
pnpm run prisma:generate

# DBリセット
pnpm run prisma:reset
```

### API開発
```bash
# OpenAPIスキーマ生成（サーバー起動不要）
pnpm run generate:openapi

# APIクライアント生成（スキーマ→クライアント）
pnpm run generate:api-client

# 個別実行
pnpm --filter api generate:openapi    # OpenAPIスキーマのみ
pnpm --filter web generate:api        # TypeScript型のみ

# OpenAPI文書確認（サーバー起動時）
# http://localhost:8000/doc - OpenAPI JSON
# http://localhost:8000/swagger - Swagger UI
```

## プロジェクト構成

```
packages/
├── web/          # Next.js フロントエンド
│   ├── app/      # Next.js App Router
│   ├── utils/    # ユーティリティ
│   │   ├── api-client.ts  # openapi-fetch APIクライアント
│   │   └── api-types.ts   # 自動生成OpenAPI型定義
│   └── package.json
├── api/          # Hono APIサーバー
│   ├── src/
│   │   ├── routes/        # APIルート定義
│   │   └── index.ts       # メインサーバー
│   ├── prisma/            # データベーススキーマ
│   └── package.json
└── package.json  # ワークスペース設定
```

## API開発フロー

1. **スキーマ定義**: packages/api/src/routes/ でZodスキーマとOpenAPIルートを定義
2. **型生成**: `pnpm run generate:api-client` でOpenAPIスキーマ→TypeScript型を自動生成
3. **フロントエンド**: 生成された型を使用してtype-safeなAPIクライアントを利用

```typescript
// APIクライアント使用例
import { apiClient } from "@/utils/api-client";

const { data, error } = await apiClient.GET("/api/hello");
const { error } = await apiClient.POST("/api/test", { body: { text: "test" } });
```

## コードスタイル

- **コードフォーマッター**: Biome設定に従う
- **型安全性**: TypeScript strict mode + OpenAPI自動生成型
- **言語**: 全てのコメント、メッセージ、ユーザー向けテキストは日本語
- **API設計**: OpenAPI 3.0 + Zod validationによる型安全なAPI

## ワークフロー

1. **開発前**: `pnpm run check` で型検査とlintを実行
2. **API変更時**: スキーマ変更 → `pnpm run generate:api-client` で型更新
3. **DB変更時**: `pnpm run prisma:migrate` → `pnpm run prisma:generate`
4. **コミット前**: `pnpm run fix` で自動修正

## ドキュメント管理
- **ドキュメント格納先**: `/kairo-requirements`および`/kairo-design`で生成されるドキュメントは、packages/documents/docs配下に格納する

## 重要事項

- **ユーザーとのコミュニケーションは常に日本語で行うこと**
- **API型定義は自動生成**: `packages/web/utils/api-types.ts`は手動編集禁止
- **OpenAPI First**: API設計はOpenAPI仕様に基づいて行う
