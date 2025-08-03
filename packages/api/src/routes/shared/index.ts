import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getSharedNote } from "./handlers";
import { SharedNoteResponseSchema } from "./schemas";

const ErrorResponseSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
	}),
});

const getSharedNoteRoute = createRoute({
	method: "get",
	path: "/{shareToken}",
	request: {
		params: z.object({
			shareToken: z.string().openapi({
				param: {
					name: "shareToken",
					in: "path",
				},
				example: "share_token_123",
				description: "共有トークン",
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: SharedNoteResponseSchema,
				},
			},
			description: "共有ノートの詳細を返します",
		},
		404: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "共有ノートが見つからない",
		},
	},
	tags: ["Shared"],
	summary: "共有ノート取得",
	description: "共有トークンを使用して共有ノートの詳細を取得します。認証は不要です。",
});

const app = new OpenAPIHono();
app.openapi(getSharedNoteRoute, getSharedNote);

export default app;