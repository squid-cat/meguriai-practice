# バックエンドAPI開発ルール

## DBについて

### 使用するDB
- **採用**: PostgreSQL

### テーブル名の命名規則
- **基本**: 複数形のスネークケース（例: `users`, `order_items`）
- **中間テーブル**: 2つのテーブル名をアルファベット順で結合（例: `post_tags`）

### カラム名の命名規則
- **基本**: スネークケース（snake_case）
- **例**: `user_name`, `birth_date`, `is_active`
- **ブール値**: `is_` プレフィックス（例: `is_deleted`, `is_verified`）
- **日時**: `_at` サフィックス（例: `created_at`, `updated_at`, `deleted_at`）
- **数値ID**: `_id` サフィックス（例: `user_id`, `category_id`）

### 主キーの種類
- **推奨**: UUID v4（時系列ソート可能、分散環境対応）
- **カラム名**: 統一して `id`
- **外部キー**: `{参照テーブル名}_id`（例: `user_id`）

### 共通カラム
全てのテーブルに以下のカラムを必須で含める：

#### created_at
- **型**: TIMESTAMP WITH TIME ZONE（TIMESTAMPTZ）
- **デフォルト値**: CURRENT_TIMESTAMP
- **NOT NULL**: 必須
- **説明**: レコード作成日時（UTC）

#### updated_at
- **型**: TIMESTAMP WITH TIME ZONE（TIMESTAMPTZ）
- **デフォルト値**: CURRENT_TIMESTAMP
- **自動更新**: レコード更新時に自動で現在時刻に更新
- **NOT NULL**: 必須
- **説明**: レコード最終更新日時（UTC）

#### 実装例（PostgreSQL）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- updated_at自動更新のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## アプリケーションについて

### 使用するライブラリ

#### フレームワーク
- **Node.js**: Hono + TypeScript

#### バリデーションライブラリ
- **採用**: Zod
- **方針**: スキーマファーストでの開発

#### 実装例
```typescript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// ユーザー作成用スキーマ
const createUserSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
  age: z.number().int().min(0, '年齢は0以上で入力してください').optional(),
  scheduledAt: z.string().datetime('ISO 8601形式の日時を入力してください').optional(), // ISO 8601拡張形式を受け入れ
});

// Honoでの使用例
app.post('/api/v1/users', zValidator('json', createUserSchema), async (c) => {
  const validData = c.req.valid('json'); // 型安全なデータ取得
  // validDataは自動的に型推論される
  return c.json({ message: 'User created', data: validData });
});
```

#### ORMライブラリ
- **採用**: Prisma

#### Prismaスキーマ命名規則
- **モデル名**: PascalCase（TypeScriptの慣習に従う）
- **フィールド名**: camelCase（TypeScriptの慣習に従う）
- **DB実際のテーブル・カラム名**: snake_caseを@map、@@mapで指定

#### 実装例
```prisma
model User {
  id          String   @id @default(cuid()) @map("id")
  firebaseUid String   @unique @map("firebase_uid")
  userName    String   @map("user_name")
  birthDate   DateTime? @map("birth_date")
  isActive    Boolean  @default(true) @map("is_active")
  isDeleted   Boolean  @default(false) @map("is_deleted")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // リレーション
  posts       Post[]
  
  @@map("users") // テーブル名をsnake_caseに
}

model Post {
  id        String   @id @default(cuid()) @map("id")
  title     String   @map("title")
  content   String?  @map("content")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // リレーション
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("posts") // テーブル名をsnake_caseに
}
```

#### 使用時の利点
```typescript
// TypeScriptコードではcamelCaseで記述
const user = await prisma.user.create({
  data: {
    firebaseUid: "firebase_user_uid_123",
    userName: "John Doe", // camelCase
    birthDate: new Date(),
    isActive: true // camelCase
  }
});

// 実際のSQLではsnake_caseに変換される
// INSERT INTO users (firebase_uid, user_name, birth_date, is_active, created_at, updated_at) ...
```

#### テーブル定義の作成・変更手順

##### 1. 初期セットアップ
```bash
# Prismaの初期化
npx prisma init

# .envファイルでDATABASE_URLを設定
# DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
```

##### 2. スキーマ定義（新規テーブル作成）
```bash
# schema.prismaファイルを編集してモデルを定義

# マイグレーション生成・適用（開発環境）
npx prisma migrate dev --name init

# Prismaクライアント生成
npx prisma generate
```

##### 3. スキーマ変更手順
```bash
# 1. schema.prismaファイルを編集（フィールド追加・変更等）

# 2. マイグレーション生成・適用
npx prisma migrate dev --name add_user_profile

# 3. Prismaクライアント再生成
npx prisma generate
```

##### 4. 便利なコマンド
```bash
# データベースの現在の状態を確認
npx prisma db pull

# スキーマをデータベースに強制適用（開発時のみ）
npx prisma db push

# Prisma Studioでデータ確認・編集
npx prisma studio

# マイグレーション履歴確認
npx prisma migrate status

# マイグレーションリセット（開発時のみ）
npx prisma migrate reset
```

##### 5. 実際の変更例
```prisma
// Before: ユーザーテーブルに年齢フィールドを追加
model User {
  id          String   @id @default(cuid()) @map("id")
  firebaseUid String   @unique @map("firebase_uid")
  userName    String   @map("user_name")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}

// After: 年齢フィールドとプロフィールテーブルのリレーション追加
model User {
  id          String   @id @default(cuid()) @map("id")
  firebaseUid String   @unique @map("firebase_uid")
  userName    String   @map("user_name")
  age         Int?     @map("age") // 新規追加
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  profile     UserProfile? // 新規リレーション
  
  @@map("users")
}

// 新規テーブル追加
model UserProfile {
  id       String @id @default(cuid()) @map("id")
  bio      String? @map("bio")
  avatar   String? @map("avatar")
  userId   String @unique @map("user_id")
  
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}
```

##### 6. マイグレーション実行コマンド
```bash
# 上記の変更後に実行
npx prisma migrate dev --name add_user_age_and_profile
```

##### 7. マスタデータの挿入
マスタデータ（カテゴリ、権限、システム設定等）はマイグレーションファイルで管理する

```bash
# 空のマイグレーションファイルを作成
npx prisma migrate dev --create-only --name seed_master_data
```

##### 作成されたマイグレーションファイルの編集例
```sql
-- prisma/migrations/YYYYMMDDHHMMSS_seed_master_data/migration.sql

-- カテゴリマスタの挿入
INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES
('cat_general', '一般', '一般カテゴリ', true, NOW(), NOW()),
('cat_business', 'ビジネス', 'ビジネスカテゴリ', true, NOW(), NOW()),
('cat_technology', 'テクノロジー', 'テクノロジーカテゴリ', true, NOW(), NOW());

-- 権限マスタの挿入
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
('role_admin', '管理者', 'システム管理者権限', NOW(), NOW()),
('role_user', '一般ユーザー', '一般ユーザー権限', NOW(), NOW()),
('role_guest', 'ゲスト', 'ゲストユーザー権限', NOW(), NOW());

-- システム設定の挿入
INSERT INTO system_settings (key, value, description, created_at, updated_at) VALUES
('maintenance_mode', 'false', 'メンテナンスモードの有効/無効', NOW(), NOW()),
('max_upload_size', '10485760', '最大アップロードサイズ（bytes）', NOW(), NOW());
```

##### マイグレーション適用
```bash
# 編集後、マイグレーションを適用
npx prisma migrate dev
```

##### マスタデータ更新の手順
```bash
# マスタデータの更新も新しいマイグレーションで管理
npx prisma migrate dev --create-only --name update_categories_master

# 更新用SQLを記述
-- UPDATE categories SET description = '更新された説明' WHERE id = 'cat_general';
-- INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES
-- ('cat_new', '新カテゴリ', '新しく追加されたカテゴリ', true, NOW(), NOW());
```

##### マスタデータ管理のベストプラクティス
- **ID固定**: マスタデータのIDは予測可能な文字列を使用
- **冪等性**: 同じマイグレーションを複数回実行しても安全になるよう設計
- **環境依存**: 環境固有のデータは環境変数で制御
- **削除禁止**: 既存マスタデータの削除は新しいマイグレーションで管理

##### 8. 注意事項
- **開発環境**: `prisma migrate dev`を使用（データ損失の可能性あり）
- **スキーマ変更**: 必ずマイグレーションを経由してデータベースを更新
- **チーム開発**: マイグレーションファイルは必ずGitにコミット
- **マスタデータ**: 初期データや固定データもマイグレーションで管理

## フロントエンドとのIFについて

### 通信プロトコル
- **基本**: REST API over HTTPS
- **リアルタイム**: Firestore（WebSocketは使用しない）
- **ファイルアップロード**: multipart/form-data

### リアルタイム通信（Firestore使用時）

#### Firebase設定
```typescript
// フロントエンドとバックエンドの両方からアクセス可能
// バックエンドではFirebase Admin SDK、フロントエンドではFirebase Web SDKを使用

// バックエンド例（Hono）
import { getFirestore } from 'firebase-admin/firestore';

export const db = getFirestore();

// リアルタイムデータの作成
app.post('/api/v1/messages', authMiddleware, async (c) => {
  const user = c.get('user');
  const data = await c.req.json();
  
  const docRef = await db.collection('messages').add({
    ...data,
    userId: user.id,
    createdAt: new Date()
  });
  
  return c.json({ id: docRef.id });
});
```

#### セキュリティルール例
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### データ形式
- **レスポンス**: JSON
- **日時**: ISO 8601形式（UTC）
- **文字エンコーディング**: UTF-8

## 日時の取り扱い

### 基本原則
**すべての日時データはUTC（協定世界時）で統一する**

### DB保存時
- **保存形式**: UTC（TIMESTAMPTZ型）
- **例**: `2024-01-01 12:00:00+00`
- **禁止**: ローカルタイムでの保存

### バックエンド処理時
- **内部処理**: 常にUTCで処理
- **ライブラリ設定**: タイムゾーンをUTCに固定
- **リクエスト処理**: タイムゾーン付き日時を受信した場合は即座にUTCに変換
- **例**（Node.js）:
  ```javascript
  // 推奨：UTCで処理
  const now = new Date().toISOString(); // UTC
  
  // リクエスト受信時の変換例
  const receivedDateTime = "2024-01-01T21:00:00+09:00";
  const utcDateTime = new Date(receivedDateTime).toISOString(); // "2024-01-01T12:00:00.000Z"
  
  // 禁止
  const now = new Date().toString(); // ローカルタイム
  ```

### API通信時

#### レスポンス時（送信）
- **形式**: ISO 8601形式のUTC（`2024-01-01T12:00:00Z`）
- **Zサフィックス**: 必須（UTCを明示）
- **統一原則**: すべての日時データはUTCで送信

#### リクエスト時（受信）
- **受け入れ形式**: ISO 8601拡張形式
    - UTC形式: `2024-01-01T12:00:00Z`（推奨）
    - タイムゾーン付き: `2024-01-01T21:00:00+09:00`（許可）
- **処理**: 受信時に必ずUTCに変換してから内部処理

### タイムゾーン変換
- **責任範囲**: フロントエンド側で実行
- **ユーザー設定**: ユーザーのタイムゾーン情報を別途管理
- **表示時変換**: ブラウザのタイムゾーンまたはユーザー設定に基づく

### 例外的なケース
- **ログファイル**: サーバーローカルタイムも併記可能
- **外部API連携**: 相手方の仕様に合わせる（変換処理を明記）
- **レガシーシステム**: 変換処理を介してUTCに統一

### 実装例

#### データベース設定
```sql
-- PostgreSQLでタイムゾーンをUTCに設定
SET timezone = 'UTC';

-- 現在時刻をUTCで取得
SELECT NOW() AT TIME ZONE 'UTC';
```

#### アプリケーション設定
```javascript
// Node.js環境変数
process.env.TZ = 'UTC';

// 日時操作ライブラリの設定例（dayjs）
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// レスポンス用：常にUTC形式
const now = dayjs.utc().format(); // UTC形式

// リクエスト受信時の変換例
const receivedDateTime = "2024-01-01T21:00:00+09:00";
const utcDateTime = dayjs(receivedDateTime).utc().format(); // UTC変換
```

## 環境変数

### 必須環境変数
```bash
# データベース
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Firebase Admin SDK（認証を使用する場合）
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxx\n-----END PRIVATE KEY-----\n"

# CORS設定
CORS_ORIGIN=http://localhost:3000

# アプリケーション設定
LOG_LEVEL=info
NODE_ENV=development
```

### セキュリティ関連
- シークレット情報は環境変数で管理
- `.env`ファイルは`.gitignore`に追加
- 本番環境では環境変数管理サービスを使用

## 認証フロー

### 認証方式
- **採用**: Firebase Authentication + IDトークン
- **プロバイダー**: Google認証、匿名認証
- **トークン**: Firebase IDトークンをAuthorizationヘッダーで送信

### バックエンドでの実装

#### Firebase Admin SDK設定
```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDK初期化
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export const auth = getAuth();
```

#### IDトークン検証ミドルウェア（Hono）
```typescript
import { auth } from './firebase-admin';
import { HTTPException } from 'hono/http-exception';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      res: c.json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authorizationヘッダーが必要です'
        }
      })
    });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    c.set('user', decodedToken);
    await next();
  } catch (error) {
    throw new HTTPException(401, {
      res: c.json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: '無効なトークンです'
        }
      })
    });
  }
};
```

#### 使用例
```typescript
import { authMiddleware } from './middleware/auth';

// 認証が必要なエンドポイント
app.get('/api/v1/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({ 
    message: 'Profile data', 
    uid: user.uid,
    name: user.name 
  });
});
```

### フロー
1. フロントエンドでFirebase Authentication認証
2. IDトークン取得
3. API呼び出し時に`Authorization: Bearer {idToken}`で送信
4. バックエンドでIDトークンを検証
5. 検証成功時はデコードされたユーザー情報を使用

### ユーザー管理

#### Prismaでのユーザーテーブル定義
```prisma
model User {
  id          String   @id @default(cuid()) @map("id")
  firebaseUid String   @unique @map("firebase_uid")
  name        String?  @map("name")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}
```

#### 初回ログイン時のユーザー作成
```typescript
import { prisma } from './prisma';

export const getOrCreateUser = async (decodedToken: any) => {
  let user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: decodedToken.uid,
        name: decodedToken.name,
      }
    });
  }
  
  return user;
};
```

#### 認証ミドルウェアでのユーザー取得
```typescript
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      res: c.json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authorizationヘッダーが必要です'
        }
      })
    });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await getOrCreateUser(decodedToken);
    
    c.set('user', user); // DB上のユーザー情報をセット
    c.set('firebaseUser', decodedToken); // Firebase情報もセット
    await next();
  } catch (error) {
    throw new HTTPException(401, {
      res: c.json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: '無効なトークンです'
        }
      })
    });
  }
};
```

## セキュリティ

### CORS設定
```javascript
{
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 入力サニタイゼーション

#### XSS対策
- HTMLタグのエスケープ
- Content Security Policy設定
- 入力値の検証・サニタイズ

#### SQLインジェクション対策
- ORM使用（生SQL禁止）
- パラメータクエリの使用
- 入力値のバリデーション

### セキュリティヘッダー
```javascript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000'
}
```

## 開発・テスト

### ログ設計

#### ログレベル
- `ERROR`: エラー情報
- `WARN`: 警告情報
- `INFO`: 一般情報
- `DEBUG`: デバッグ情報

#### 出力形式
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "INFO",
  "message": "User created",
  "user_id": "1698bbbc-5274-4810-a6c8-b325bb81faa2",
  "request_id": "6d7325cb-b62e-43bc-a956-941281cf318c"
}
```

#### 機密情報の扱い
- パスワード、トークンはログに出力禁止
- 個人情報はマスキング処理

### コーディング規約

#### 命名規則
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **クラス**: PascalCase
- **ファイル**: kebab-case
