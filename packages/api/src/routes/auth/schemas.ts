import { z } from "@hono/zod-openapi";

export const UserSchema = z.object({
	id: z.string().openapi({
		example: "user_123",
		description: "ユーザーID",
	}),
	firebaseUid: z.string().openapi({
		example: "firebase_uid_123",
		description: "Firebase UID",
	}),
	name: z.string().openapi({
		example: "田中花子",
		description: "ユーザー名",
	}),
	email: z.string().email().openapi({
		example: "tanaka@example.com",
		description: "メールアドレス",
	}),
	createdAt: z
		.date()
		.transform((date) => date.toISOString())
		.openapi({
			type: "string",
			format: "date-time",
			example: "2024-08-01T00:00:00Z",
			description: "作成日時",
		}),
	updatedAt: z
		.date()
		.transform((date) => date.toISOString())
		.openapi({
			type: "string",
			format: "date-time",
			example: "2024-08-01T00:00:00Z",
			description: "更新日時",
		}),
});

export const UserResponseSchema = z.object({
	user: UserSchema,
});

export const UpdateProfileRequestSchema = z.object({
	name: z.string().min(1).max(100).openapi({
		example: "田中花子",
		description: "ユーザー名",
	}),
});

export const ErrorResponseSchema = z.object({
	error: z.object({
		code: z.string().openapi({
			example: "AUTHENTICATION_ERROR",
			description: "エラーコード",
		}),
		message: z.string().openapi({
			example: "認証が必要です",
			description: "エラーメッセージ",
		}),
		details: z
			.array(
				z.object({
					field: z.string().optional(),
					message: z.string(),
				}),
			)
			.optional(),
	}),
});