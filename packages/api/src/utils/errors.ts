export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code: string = "INTERNAL_SERVER_ERROR",
		public details?: Array<{ field?: string; message: string }>,
	) {
		super(message);
		this.name = "AppError";
	}
}

export class ValidationError extends AppError {
	constructor(
		message: string = "バリデーションエラーが発生しました",
		details?: Array<{ field?: string; message: string }>,
	) {
		super(message, 422, "VALIDATION_ERROR", details);
		this.name = "ValidationError";
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string = "認証が必要です") {
		super(message, 401, "AUTHENTICATION_ERROR");
		this.name = "AuthenticationError";
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string = "この操作を実行する権限がありません") {
		super(message, 403, "AUTHORIZATION_ERROR");
		this.name = "AuthorizationError";
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "リソースが見つかりません") {
		super(message, 404, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

export class ConflictError extends AppError {
	constructor(message: string = "競合エラーが発生しました") {
		super(message, 409, "DUPLICATE_ERROR");
		this.name = "ConflictError";
	}
}

export class BusinessRuleError extends AppError {
	constructor(message: string = "ビジネスルールエラーが発生しました") {
		super(message, 400, "BUSINESS_RULE_ERROR");
		this.name = "BusinessRuleError";
	}
}