# API設計書

## 概要
- **設計方針**: 機能設計書に基づくRESTful API設計
- **OpenAPI準拠**: OpenAPI 3.0仕様に基づく設計
- **認証方式**: Firebase Authentication + IDトークン
- **フレームワーク**: Hono + TypeScript
- **バリデーション**: Zod による型安全なバリデーション

## 認証設計

### 認証フロー
1. フロントエンドでFirebase Authentication認証
2. IDトークン取得
3. `Authorization: Bearer <idToken>` でAPIリクエスト
4. バックエンドでIDトークン検証
5. 検証成功時はユーザー情報をコンテキストに設定

### 認証ミドルウェア
```typescript
// 認証が必要なエンドポイントに適用
app.use('/api/v1/protected/*', authMiddleware);
```

## ユーザー認証API

### POST /api/v1/auth/me
**概要**: 現在のユーザー情報取得・初回ユーザー作成

**認証**: 必要（Bearer Token）

**レスポンス**:
```json
{
  "user": {
    "id": "user_123",
    "firebaseUid": "firebase_uid_123",
    "name": "田中花子",
    "email": "tanaka@example.com",
    "createdAt": "2024-08-01T00:00:00Z",
    "updatedAt": "2024-08-01T00:00:00Z"
  }
}
```

**エラーレスポンス**:
- 401: 認証エラー

### PUT /api/v1/auth/profile
**概要**: ユーザープロフィール更新

**認証**: 必要

**リクエスト**:
```json
{
  "name": "田中花子"
}
```

**レスポンス**:
```json
{
  "user": {
    "id": "user_123",
    "firebaseUid": "firebase_uid_123",
    "name": "田中花子",
    "email": "tanaka@example.com",
    "createdAt": "2024-08-01T00:00:00Z",
    "updatedAt": "2024-08-01T00:00:00Z"
  }
}
```

## ノート管理API

### GET /api/v1/notes
**概要**: ノート一覧取得

**認証**: 必要

**クエリパラメータ**:
- `status`: string (optional) - ステータスフィルタ（draft/active/completed）
- `page`: number (optional) - ページ番号（デフォルト: 1）
- `limit`: number (optional) - 取得件数（デフォルト: 10、最大: 50）
- `sort`: string (optional) - ソート条件（created_at_desc/created_at_asc/departure_date_desc/departure_date_asc）

**レスポンス**:
```json
{
  "notes": [
    {
      "id": "note_123",
      "title": "沖縄家族旅行",
      "destination": "沖縄",
      "departureDate": "2024-08-15",
      "returnDate": "2024-08-20",
      "description": "家族4人での沖縄旅行",
      "status": "active",
      "isShared": true,
      "shareToken": "share_token_123",
      "checklistProgress": {
        "completed": 3,
        "total": 5,
        "percentage": 60
      },
      "createdAt": "2024-08-01T00:00:00Z",
      "updatedAt": "2024-08-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET /api/v1/notes/`{id}`
**概要**: ノート詳細取得

**認証**: 必要

**パスパラメータ**: 
- `id`: ノートID

**レスポンス**:
```json
{
  "note": {
    "id": "note_123",
    "title": "沖縄家族旅行",
    "destination": "沖縄",
    "departureDate": "2024-08-15",
    "returnDate": "2024-08-20",
    "description": "家族4人での沖縄旅行",
    "status": "active",
    "isShared": true,
    "shareToken": "share_token_123",
    "checklistItems": [
      {
        "id": "item_1",
        "text": "エアコンの電源を切る",
        "completed": true,
        "sortOrder": 1
      }
    ],
    "emergencyContacts": [
      {
        "id": "contact_1",
        "name": "田中太郎",
        "relationship": "父親",
        "phone": "090-1234-5678",
        "email": "tanaka@example.com",
        "sortOrder": 1
      }
    ],
    "requests": [
      {
        "id": "request_1",
        "person": "隣人の佐藤さん",
        "request": "郵便受けの確認をお願いします",
        "priority": "high",
        "sortOrder": 1
      }
    ],
    "reflection": {
      "id": "reflection_1",
      "whatWorked": "隣人への依頼がスムーズだった",
      "whatDidntWork": "冷蔵庫の確認を忘れた",
      "improvements": "事前チェックを強化",
      "nextTimeReminder": "3日前にすべて完了"
    },
    "createdAt": "2024-08-01T00:00:00Z",
    "updatedAt": "2024-08-10T00:00:00Z"
  }
}
```

**エラーレスポンス**:
- 404: ノートが見つからない
- 403: アクセス権限なし

### POST /api/v1/notes
**概要**: ノート作成

**認証**: 必要

**リクエスト**:
```json
{
  "title": "沖縄家族旅行",
  "destination": "沖縄",
  "departureDate": "2024-08-15",
  "returnDate": "2024-08-20",
  "description": "家族4人での沖縄旅行",
  "checklistItems": [
    {
      "text": "エアコンの電源を切る",
      "sortOrder": 1
    }
  ],
  "emergencyContacts": [
    {
      "name": "田中太郎",
      "relationship": "父親",
      "phone": "090-1234-5678",
      "email": "tanaka@example.com",
      "sortOrder": 1
    }
  ],
  "requests": [
    {
      "person": "隣人の佐藤さん",
      "request": "郵便受けの確認をお願いします",
      "priority": "high",
      "sortOrder": 1
    }
  ]
}
```

**レスポンス**:
```json
{
  "note": {
    "id": "note_123",
    "title": "沖縄家族旅行",
    "destination": "沖縄",
    "departureDate": "2024-08-15",
    "returnDate": "2024-08-20",
    "description": "家族4人での沖縄旅行",
    "status": "draft",
    "isShared": false,
    "shareToken": null,
    "createdAt": "2024-08-01T00:00:00Z",
    "updatedAt": "2024-08-01T00:00:00Z"
  }
}
```

**バリデーション**:
- title: 必須、1-200文字
- destination: 必須、1-100文字
- departureDate: 必須、ISO 8601形式
- returnDate: 必須、ISO 8601形式、departureDate以降
- description: 任意、0-2000文字

### PUT /api/v1/notes/`{id}`
**概要**: ノート更新

**認証**: 必要

**パスパラメータ**: 
- `id`: ノートID

**リクエスト**: POST /api/v1/notes と同じ形式

**レスポンス**: GET /api/v1/notes/`{id}` と同じ形式

### DELETE /api/v1/notes/`{id}`
**概要**: ノート削除

**認証**: 必要

**パスパラメータ**: 
- `id`: ノートID

**レスポンス**: 204 No Content

## エラーハンドリング

### 共通エラーレスポンス形式
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": [
      {
        "field": "title",
        "message": "タイトルは必須です"
      }
    ]
  }
}
```

### HTTPステータスコード
- **200**: 成功
- **201**: 作成成功
- **204**: 成功（レスポンスボディなし）
- **400**: リクエストエラー
- **401**: 認証エラー
- **403**: 認可エラー
- **404**: リソースが見つからない
- **409**: 競合エラー
- **422**: バリデーションエラー
- **500**: サーバーエラー