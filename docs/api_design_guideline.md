# Web API設計ガイドライン

## 基本方針

このドキュメントは、Web APIのインターフェース設計時に従うべきガイドラインです。

## 基本設計原則

### RESTful API設計
- リソース指向の設計を採用する
- HTTPメソッドの適切な使用
- ステートレス設計の維持

### HTTPメソッドの使用方法
- **GET**: リソースの取得
- **POST**: リソースの作成
- **PUT**: リソースの完全更新
- **PATCH**: リソースの部分更新
- **DELETE**: リソースの削除

## URL設計

### 基本原則
- 名詞を使用する（動詞は使わない）
- 小文字とハイフンを使用する
- 複数形を使用する

### エンドポイント設計例
```
GET    /api/users           # ユーザー一覧取得
GET    /api/users/{id}      # 特定ユーザー取得
POST   /api/users           # ユーザー作成
PUT    /api/users/{id}      # ユーザー完全更新
PATCH  /api/users/{id}      # ユーザー部分更新
DELETE /api/users/{id}      # ユーザー削除
```

### 階層構造
```
GET /api/users/{userId}/posts           # 特定ユーザーの投稿一覧
GET /api/users/{userId}/posts/{postId}  # 特定ユーザーの特定投稿
```

### パラメータの使い分け
- **パスパラメータ**: リソースの識別子
- **クエリパラメータ**: フィルタ、ソート、ページネーション

## HTTPステータスコード

### 成功時
- **200 OK**: 取得・更新成功
- **201 Created**: 作成成功
- **204 No Content**: 削除成功（レスポンスボディなし）

### クライアントエラー
- **400 Bad Request**: リクエストの形式が不正・バリデーションエラー
- **401 Unauthorized**: 認証が必要
- **403 Forbidden**: 権限がない
- **404 Not Found**: リソースが見つからない
- **409 Conflict**: リソースの競合

### サーバーエラー
- **500 Internal Server Error**: サーバー内部エラー

## リクエスト・レスポンス形式

### データ形式
- **Content-Type**: `application/json`
- **文字エンコーディング**: UTF-8

### 日時フォーマット

#### レスポンス時
- **基本原則**: すべての日時データはUTC（協定世界時）で統一する
- **形式**: ISO 8601形式のUTC（`2024-01-15T10:30:00Z`）
- **Zサフィックス**: 必須（UTCを明示）

#### リクエスト時
- **基本形式**: ISO 8601拡張形式を受け入れる
- **UTC形式**: `2024-01-15T10:30:00Z`（推奨）
- **タイムゾーン付き**: `2024-01-15T19:30:00+09:00`（許可）
- **バックエンド処理**: 受信時にUTCに変換して処理

#### 日時フォーマット例
```json
// レスポンス（常にUTC）
{
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T15:45:30Z"
}

// リクエスト（ISO 8601拡張形式であれば許可）
{
  "scheduledAt": "2024-01-15T10:30:00Z",        // UTC（推奨）
  "deadline": "2024-01-15T19:30:00+09:00"       // タイムゾーン付き（許可）
}

// 間違った例
{
  "createdAt": "2024-01-15 15:45:30",           // 禁止
  "updatedAt": "2024/01/15 15:45:30"            // 禁止
}
```

### レスポンスの統一フォーマット

#### 単一リソース取得時のレスポンス
```json
{
  "id": "123",
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### リスト取得時のレスポンス
```json
{
  "users": [
    {
      "id": "123",
      "name": "田中太郎",
      "email": "tanaka@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 認証・認可

### 認証方式
- **Firebase Authentication IDトークン**を使用
- **Authorization Bearerヘッダ**で送信

### ヘッダ形式
```
Authorization: Bearer <IDトークン>
```

### 認証が必要なエンドポイント
- 必要なAPIのみ認証を必須とする
- 認証が必要なAPIに認証情報がない場合は `401 Unauthorized` を返す
- パブリックAPIや認証不要なAPIは認証なしでアクセス可能

## エラーハンドリング

### エラーレスポンス形式
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値に誤りがあります",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  }
}
```

### エラーコード定義
- **VALIDATION_ERROR**: バリデーションエラー
- **AUTHENTICATION_ERROR**: 認証エラー
- **AUTHORIZATION_ERROR**: 認可エラー
- **NOT_FOUND**: リソースが見つからない
- **CONFLICT**: リソースの競合
- **INTERNAL_ERROR**: サーバー内部エラー

## データ操作

### ページネーション
- **原則**: page / limit方式を使用する
- **page**: ページ番号（1から開始）
- **limit**: 1ページあたりの件数

```
GET /api/users?page=1&limit=20
```

### フィルタリング
```
GET /api/users?status=active&role=admin
```

### ソート
```
GET /api/users?sort=createdAt&order=desc
```

### 検索
```
GET /api/users?search=田中
```

## ファイル操作

### ファイルアップロード
- **APIパス**: 用途に応じてAPIパスを設ける
    - 汎用ファイル: `POST /api/files`
    - ユーザーアバター: `POST /api/users/{userId}/avatar`
    - 投稿画像: `POST /api/posts/{postId}/images`

```
POST /api/files
Content-Type: multipart/form-data

# レスポンス
{
  "fileId": "abc123",
  "fileName": "document.pdf",
  "fileSize": 1024,
  "downloadUrl": "https://storage.googleapis.com/...",
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

## セキュリティ

### 入力値検証
- 全てのパラメータでバリデーションを実施
- SQLインジェクション対策を実施
- XSS対策を実施

### CORS設定
- 必要なオリジンのみを許可
- 認証情報を含むリクエストに対応

## バージョニング

### バージョン管理
- URLパスでバージョンを指定: `/api/v1/users`
- 後方互換性を維持する
- 非推奨APIは事前に告知してから削除

## ドキュメント化

### 必須項目
- エンドポイントURL
- HTTPメソッド
- リクエスト・レスポンス例
- 認証要否
- パラメータ仕様
- 必要があればAPIの使用方法（複数APIの組み合わせ、前提条件など）
