# Meguriai

Next.js + Hono + Prisma を使用したモノレポ構成のWebアプリケーション

## アーキテクチャ

- **packages/web**: Next.js (React 19) フロントエンド
- **packages/api**: Hono + Prisma バックエンドAPIサーバー
- **pnpm workspaces**: モノレポ管理
- **PostgreSQL**: データベース

## 起動方法

### 1. 環境変数の設定
```bash
# API用の環境変数
cp packages/api/.env.example packages/api/.env

# フロントエンド用の環境変数  
cp packages/web/.env.example packages/web/.env
```

### 2. PostgreSQLの起動
```bash
docker compose up -d
```

### 3. 依存関係のインストール
```bash
pnpm install
```

### 4. データベースのセットアップ
```bash
# マイグレーション実行 + Prisma Client生成
pnpm run prisma:migrate && pnpm run prisma:generate
```

### 5. アプリケーションの起動

#### 両方同時に起動
```bash
# フロントエンド (http://localhost:3000)
pnpm run dev:web

# APIサーバー (http://localhost:8000)  
pnpm run dev:api
```

#### 個別に起動
```bash
# フロントエンドのみ
pnpm --filter web dev

# APIサーバーのみ
pnpm --filter api dev
```

## 利用可能なコマンド

### 開発・ビルド
```bash
# 開発環境
pnpm run dev:web      # フロントエンド
pnpm run dev:api      # APIサーバー

# ビルド
pnpm run build:web    # フロントエンド
pnpm run build:api    # APIサーバー

# 本番起動
pnpm run start:web    # フロントエンド
pnpm run start:api    # APIサーバー
```

### コード品質チェック
```bash
# 型チェック + Lintチェック
pnpm run check

# コードフォーマット
pnpm run fix
```

### データベース管理
```bash
# マイグレーション作成・実行
pnpm run prisma:migrate

# Prisma Client再生成
pnpm run prisma:generate

# データベース管理画面
pnpm run prisma:studio

# データベースリセット
pnpm run prisma:reset
```
