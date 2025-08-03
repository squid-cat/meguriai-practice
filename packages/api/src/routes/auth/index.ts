import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import { getCurrentUser, updateProfile } from "./handlers";
import {
	ErrorResponseSchema,
	UpdateProfileRequestSchema,
	UserResponseSchema,
} from "./schemas";

const getCurrentUserRoute = createRoute({
	method: "post",
	path: "/me",
	security: [{ Bearer: [] }],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: UserResponseSchema,
				},
			},
			description: "現在のユーザー情報を返します",
		},
		401: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "認証エラー",
		},
	},
	tags: ["Auth"],
	summary: "現在のユーザー情報取得",
	description: "認証されたユーザーの情報を取得します。初回アクセス時はユーザーを作成します。",
});

const updateProfileRoute = createRoute({
	method: "put",
	path: "/profile",
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: UpdateProfileRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: UserResponseSchema,
				},
			},
			description: "更新されたユーザー情報を返します",
		},
		401: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "認証エラー",
		},
		422: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "バリデーションエラー",
		},
	},
	tags: ["Auth"],
	summary: "ユーザープロフィール更新",
	description: "認証されたユーザーのプロフィール情報を更新します。",
});

const app = new OpenAPIHono();

app.use("*", authMiddleware);
app.openapi(getCurrentUserRoute, getCurrentUser);
app.openapi(updateProfileRoute, updateProfile);

export default app;