# データフロー図

## 概要

LeaveNoteシステムにおけるデータの流れと処理フローを可視化し、システム全体のデータインタラクションを理解するためのドキュメントです。

## システム全体データフロー

### 基本アーキテクチャフロー

```mermaid
flowchart TD
    subgraph "ユーザーデバイス"
        User[ユーザー]
        Browser[ブラウザ]
    end
    
    subgraph "Firebase Services"
        FireAuth[Firebase Authentication]
        Firestore[Firestore]
        CloudStorage[Cloud Storage]
    end
    
    subgraph "Next.js Frontend"
        Pages[Pages/Components]
        APIClient[API Client]
        AuthContext[認証Context]
    end
    
    subgraph "Hono Backend"
        APIServer[API Server]
        AuthMiddleware[認証MW]
        BusinessLogic[Business Logic]
    end
    
    subgraph "Database"
        PostgreSQL[(PostgreSQL)]
    end
    
    User --> Browser
    Browser --> Pages
    Pages --> AuthContext
    AuthContext --> FireAuth
    Pages --> APIClient
    APIClient --> APIServer
    APIServer --> AuthMiddleware
    AuthMiddleware --> FireAuth
    AuthMiddleware --> BusinessLogic
    BusinessLogic --> PostgreSQL
    BusinessLogic --> CloudStorage
    Pages --> Firestore
```

## 主要機能のデータフロー

### 1. ユーザー認証フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as Next.js Frontend
    participant FireAuth as Firebase Auth
    participant Backend as Hono Backend
    participant DB as PostgreSQL
    
    Note over User, DB: 初回ログイン
    
    User->>Frontend: "Googleでログイン"ボタンクリック
    Frontend->>FireAuth: signInWithPopup(googleProvider)
    FireAuth->>FireAuth: Google認証フロー
    FireAuth-->>Frontend: UserCredential + IDToken
    
    Frontend->>Backend: POST /api/v1/auth/me (Bearer: IDToken)
    Backend->>FireAuth: verifyIdToken(IDToken)
    FireAuth-->>Backend: DecodedToken (Firebase UID)
    
    Backend->>DB: SELECT * FROM users WHERE firebase_uid = ?
    
    alt ユーザーが存在しない場合
        Backend->>DB: INSERT INTO users (firebase_uid, name, email)
        DB-->>Backend: 新規ユーザー情報
    else ユーザーが存在する場合
        DB-->>Backend: 既存ユーザー情報
    end
    
    Backend-->>Frontend: ユーザー情報 JSON
    Frontend->>Frontend: 認証状態をContextに保存
    Frontend-->>User: ダッシュボードへリダイレクト
```

### 2. ノート作成フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as Frontend
    participant Backend as Backend
    participant DB as PostgreSQL
    
    Note over User, DB: ノート作成プロセス
    
    User->>Frontend: ノート作成フォーム入力
    Frontend->>Frontend: フォームバリデーション (Zod)
    
    User->>Frontend: "作成"ボタンクリック
    Frontend->>Backend: POST /api/v1/notes (認証付き)
    
    Backend->>Backend: リクエストバリデーション (Zod)
    Backend->>DB: BEGIN TRANSACTION
    
    Backend->>DB: INSERT INTO notes (user_id, title, destination, ...)
    DB-->>Backend: note_id
    
    loop チェックリスト項目
        Backend->>DB: INSERT INTO checklist_items (note_id, text, sort_order)
    end
    
    loop 緊急連絡先
        Backend->>DB: INSERT INTO emergency_contacts (note_id, name, phone, ...)
    end
    
    loop お願いメモ
        Backend->>DB: INSERT INTO requests (note_id, person, request, ...)
    end
    
    Backend->>DB: COMMIT TRANSACTION
    Backend-->>Frontend: 作成されたノート情報 JSON
    Frontend-->>User: 作成完了 & ダッシュボードへリダイレクト
```

### 3. ノート共有フロー

```mermaid
sequenceDiagram
    participant Owner as ノート作成者
    participant Frontend as Frontend
    participant Backend as Backend
    participant DB as PostgreSQL
    participant SharedUser as 共有先ユーザー
    participant SharedPage as 共有ページ
    
    Note over Owner, SharedPage: 共有機能プロセス
    
    Owner->>Frontend: "共有"ボタンクリック
    Frontend->>Backend: POST /api/v1/notes/{id}/share
    
    Backend->>Backend: UUID生成 (share_token)
    Backend->>DB: UPDATE notes SET share_token = ?, is_shared = true WHERE id = ?
    DB-->>Backend: 更新完了
    
    Backend-->>Frontend: 共有URL + share_token
    Frontend-->>Owner: 共有URL表示 & コピー機能
    
    Note over Owner, SharedUser: URL共有（外部手段）
    Owner-->>SharedUser: 共有URL送信 (LINE, メール等)
    
    SharedUser->>SharedPage: 共有URL访问
    SharedPage->>Backend: GET /api/v1/shared/{shareToken}
    
    Backend->>DB: SELECT notes, checklist_items, emergency_contacts, requests FROM ... WHERE share_token = ?
    DB-->>Backend: ノート情報（機密情報除外）
    
    Backend-->>SharedPage: 共有用ノート情報 JSON
    SharedPage-->>SharedUser: 共有ページ表示
```

### 4. 振り返り機能フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as Frontend
    participant Backend as Backend
    participant DB as PostgreSQL
    
    Note over User, DB: 旅行後の振り返り
    
    User->>Frontend: 結果ページアクセス (/reflection)
    Frontend->>Backend: GET /api/v1/notes/{noteId}/reflection
    
    Backend->>DB: SELECT reflection, checklist_items FROM ... WHERE note_id = ?
    DB-->>Backend: 振り返り情報 + 統計データ
    
    Backend-->>Frontend: 振り返り情報 + 完了率統計 JSON
    Frontend-->>User: 振り返りフォーム + 統計表示
    
    User->>Frontend: 振り返り内容入力
    User->>Frontend: "保存"ボタンクリック
    
    Frontend->>Backend: PUT /api/v1/notes/{noteId}/reflection
    
    Backend->>DB: INSERT/UPDATE reflections (note_id, what_worked, improvements, ...)
    DB-->>Backend: 更新完了
    
    Backend-->>Frontend: 保存完了
    
    alt ユーザーがテンプレート作成を選択
        User->>Frontend: "テンプレート作成"ボタンクリック
        Frontend->>Backend: POST /api/v1/templates (sourceNoteId: noteId)
        
        Backend->>DB: SELECT note, checklist_items, contacts, requests FROM ... WHERE id = ?
        DB-->>Backend: ノート詳細情報
        
        Backend->>DB: INSERT INTO templates (user_id, name, checklist_template, ...)
        DB-->>Backend: テンプレートID
        
        Backend-->>Frontend: テンプレート作成完了
        Frontend-->>User: 完了メッセージ表示
    end
```

## データ処理フロー詳細

### チェックリスト更新フロー

```mermaid
flowchart TD
    Start([ユーザーがチェックボックスクリック]) --> 
    Frontend[フロントエンドで状態更新] --> 
    OptimisticUpdate{楽観的更新} --> 
    APICall[PUT /api/v1/notes/{noteId}/checklist/{itemId}] --> 
    Validation[バックエンドでバリデーション] --> 
    DBUpdate[データベース更新] --> 
    Response[レスポンス返却] --> 
    Success{成功?}
    
    Success -->|Yes| ProgressCalc[進捗率再計算] --> 
    UIUpdate[UI更新完了] --> 
    End([終了])
    
    Success -->|No| Rollback[楽観的更新をロールバック] --> 
    ErrorDisplay[エラーメッセージ表示] --> 
    End
```

### リアルタイム同期フロー（将来機能）

```mermaid
sequenceDiagram
    participant User1 as ユーザー1
    participant Frontend1 as Frontend1
    participant User2 as ユーザー2
    participant Frontend2 as Frontend2
    participant Firestore as Firestore
    participant Backend as Backend
    participant DB as PostgreSQL
    
    Note over User1, DB: リアルタイム同期（将来機能）
    
    User1->>Frontend1: チェックリスト項目更新
    Frontend1->>Backend: PUT /api/v1/notes/{id}/checklist/{itemId}
    Backend->>DB: UPDATE checklist_items
    Backend->>Firestore: リアルタイム更新通知
    Backend-->>Frontend1: 更新完了レスポンス
    
    Firestore-->>Frontend2: リアルタイム更新通知
    Frontend2->>Frontend2: ローカル状態更新
    Frontend2-->>User2: UI自動更新
```

## エラーハンドリングフロー

### API エラー処理フロー

```mermaid
flowchart TD
    APIRequest[API リクエスト] --> 
    AuthCheck{認証チェック} --> 
    ValidationCheck{バリデーション} --> 
    BusinessLogic[ビジネスロジック実行] --> 
    DatabaseOperation[データベース操作] --> 
    Success[成功レスポンス]
    
    AuthCheck -->|認証エラー| Auth401[401 Unauthorized]
    ValidationCheck -->|バリデーションエラー| Validation400[400 Bad Request]
    BusinessLogic -->|ビジネスルールエラー| Business422[422 Unprocessable Entity]
    DatabaseOperation -->|DBエラー| Database500[500 Internal Server Error]
    
    Auth401 --> ErrorResponse[エラーレスポンス]
    Validation400 --> ErrorResponse
    Business422 --> ErrorResponse
    Database500 --> ErrorResponse
    
    ErrorResponse --> Frontend[フロントエンドでエラー処理]
    Frontend --> UserNotification[ユーザーへの通知]
```

### フロントエンドエラー処理

```mermaid
flowchart TD
    APIError[API エラー受信] --> 
    ErrorType{エラータイプ判定} --> 
    
    ErrorType -->|401| AuthError[認証エラー処理] --> 
    ClearAuth[認証状態クリア] --> 
    RedirectLogin[ログインページリダイレクト]
    
    ErrorType -->|400/422| ValidationError[バリデーションエラー] --> 
    ShowFieldErrors[フィールドエラー表示]
    
    ErrorType -->|404| NotFoundError[リソース不存在] --> 
    ShowNotFound[404ページ表示]
    
    ErrorType -->|500| ServerError[サーバーエラー] --> 
    ShowErrorPage[エラーページ表示] --> 
    ErrorReporting[エラーレポート送信]
    
    ErrorType -->|Network| NetworkError[ネットワークエラー] --> 
    RetryPrompt[再試行プロンプト] --> 
    OfflineMode[オフラインモード（将来機能）]
```

## データ同期・整合性フロー

### 楽観的更新パターン

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as Frontend
    participant Backend as Backend
    participant DB as Database
    
    Note over User, DB: 楽観的更新による即座のUI反応
    
    User->>Frontend: チェックボックスクリック
    Frontend->>Frontend: ローカル状態即座に更新
    Frontend-->>User: UI即座に反映
    
    Frontend->>Backend: PUT /api/v1/notes/{id}/checklist/{itemId}
    
    alt 成功パターン
        Backend->>DB: UPDATE checklist_items
        DB-->>Backend: 更新成功
        Backend-->>Frontend: 200 OK
        Frontend->>Frontend: 楽観的更新を確定
    else 失敗パターン
        Backend-->>Frontend: 4xx/5xx エラー
        Frontend->>Frontend: ローカル状態をロールバック
        Frontend-->>User: エラーメッセージ表示
    end
```

### データ競合解決フロー

```mermaid
flowchart TD
    ConcurrentUpdate[同時更新検出] --> 
    VersionCheck{バージョンチェック} --> 
    
    VersionCheck -->|バージョン一致| AllowUpdate[更新許可] --> 
    UpdateSuccess[更新成功]
    
    VersionCheck -->|バージョン不一致| ConflictDetected[競合検出] --> 
    ConflictResolution{競合解決戦略} --> 
    
    ConflictResolution -->|Last Write Wins| OverwriteUpdate[上書き更新] --> 
    UpdateSuccess
    
    ConflictResolution -->|User Choice| PresentOptions[ユーザーに選択肢提示] --> 
    UserDecision{ユーザー選択} --> 
    
    UserDecision -->|自分の変更を採用| KeepLocal[ローカル変更保持] --> 
    UpdateSuccess
    
    UserDecision -->|相手の変更を採用| AcceptRemote[リモート変更採用] --> 
    DiscardLocal[ローカル変更破棄] --> 
    Refresh[データ再取得]
```

## パフォーマンス最適化フロー

### データ取得最適化

```mermaid
flowchart TD
    PageLoad[ページ読み込み] --> 
    CacheCheck{キャッシュ確認} --> 
    
    CacheCheck -->|キャッシュあり| CacheHit[キャッシュヒット] --> 
    ValidateCache{キャッシュ有効性} --> 
    
    ValidateCache -->|有効| DisplayCached[キャッシュデータ表示] --> 
    BackgroundRefresh[バックグラウンド更新]
    
    ValidateCache -->|無効| CacheMiss[キャッシュミス]
    CacheCheck -->|キャッシュなし| CacheMiss --> 
    
    CacheMiss --> LoadingState[ローディング状態表示] --> 
    APIRequest[API リクエスト] --> 
    DataReceived[データ受信] --> 
    UpdateCache[キャッシュ更新] --> 
    DisplayData[データ表示]
    
    BackgroundRefresh --> APIRequest
```

### バッチ処理フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as Frontend
    participant BatchQueue as バッチキュー
    participant Backend as Backend
    participant DB as Database
    
    Note over User, DB: 複数操作のバッチ処理
    
    User->>Frontend: 複数のチェックリスト更新
    Frontend->>BatchQueue: 操作をキューに追加
    Frontend->>BatchQueue: 操作をキューに追加
    Frontend->>BatchQueue: 操作をキューに追加
    
    Note over BatchQueue: 一定時間後またはキューサイズ到達
    
    BatchQueue->>Frontend: バッチ実行トリガー
    Frontend->>Backend: PATCH /api/v1/notes/{id}/checklist (複数操作)
    
    Backend->>DB: BEGIN TRANSACTION
    loop バッチ内の各操作
        Backend->>DB: UPDATE checklist_items
    end
    Backend->>DB: COMMIT TRANSACTION
    
    Backend-->>Frontend: バッチ処理結果
    Frontend-->>User: 全体の更新完了通知
```

## セキュリティデータフロー

### トークン検証フロー

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant Backend as Hono Backend
    participant FireAuth as Firebase Auth
    participant Cache as Token Cache
    
    Client->>Backend: API リクエスト (Bearer Token)
    Backend->>Cache: トークン検証キャッシュ確認
    
    alt キャッシュヒット (有効期限内)
        Cache-->>Backend: キャッシュされたユーザー情報
    else キャッシュミス or 期限切れ
        Backend->>FireAuth: verifyIdToken(token)
        alt トークン有効
            FireAuth-->>Backend: DecodedToken + User Info
            Backend->>Cache: ユーザー情報をキャッシュ
        else トークン無効
            FireAuth-->>Backend: TokenError
            Backend-->>Client: 401 Unauthorized
        end
    end
    
    Backend->>Backend: リクエスト処理継続
    Backend-->>Client: API レスポンス
```

## データフロー設計のベストプラクティス

### 1. エラー伝播の明確化
- 各レイヤーでのエラーハンドリング責務を明確に定義
- ユーザー向けエラーメッセージの一貫性確保
- ログ記録とモニタリングポイントの設定

### 2. パフォーマンス考慮
- 楽観的更新による即座のUI反応
- 適切なキャッシュ戦略の実装
- バッチ処理による効率的な更新

### 3. セキュリティ確保
- 認証トークンの適切な検証
- 機密情報の流出防止
- アクセス権限の厳密なチェック

### 4. 拡張性確保
- 将来のリアルタイム機能への対応準備
- マイクロサービス化を想定した疎結合設計
- 外部サービス連携のためのインターフェース設計