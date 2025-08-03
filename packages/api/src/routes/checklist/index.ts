import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import {
	createChecklistItem,
	deleteChecklistItem,
	updateChecklistItem,
} from "./handlers";
import {
	ChecklistItemResponseSchema,
	CreateChecklistItemRequestSchema,
	UpdateChecklistItemRequestSchema,
} from "./schemas";

const ErrorResponseSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
		details: z.array(z.object({
			field: z.string().optional(),
			message: z.string(),
		})).optional(),
	}),
});

const createChecklistItemRoute = createRoute({
	method: "post",
	path: "/{noteId}/checklist",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			noteId: z.string().openapi({
				param: {
					name: "noteId",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
		}),
		body: {
			content: {
				"application/json": {
					schema: CreateChecklistItemRequestSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				"application/json": {
					schema: ChecklistItemResponseSchema,
				},
			},
			description: "チェックリスト項目が正常に作成されました",
		},
		401: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "認証エラー",
		},
		403: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "アクセス権限なし",
		},
		404: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "ノートが見つからない",
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
	tags: ["Checklist"],
	summary: "チェックリスト項目追加",
	description: "指定されたノートにチェックリスト項目を追加します。",
});

const updateChecklistItemRoute = createRoute({
	method: "put",
	path: "/{noteId}/checklist/{itemId}",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			noteId: z.string().openapi({
				param: {
					name: "noteId",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
			itemId: z.string().openapi({
				param: {
					name: "itemId",
					in: "path",
				},
				example: "item_1",
				description: "チェックリスト項目ID",
			}),
		}),
		body: {
			content: {
				"application/json": {
					schema: UpdateChecklistItemRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: ChecklistItemResponseSchema,
				},
			},
			description: "更新されたチェックリスト項目を返します",
		},
		401: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "認証エラー",
		},
		403: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "アクセス権限なし",
		},
		404: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "チェックリスト項目が見つからない",
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
	tags: ["Checklist"],
	summary: "チェックリスト項目更新",
	description: "指定されたチェックリスト項目を更新します。",
});

const deleteChecklistItemRoute = createRoute({
	method: "delete",
	path: "/{noteId}/checklist/{itemId}",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			noteId: z.string().openapi({
				param: {
					name: "noteId",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
			itemId: z.string().openapi({
				param: {
					name: "itemId",
					in: "path",
				},
				example: "item_1",
				description: "チェックリスト項目ID",
			}),
		}),
	},
	responses: {
		204: {
			description: "チェックリスト項目が正常に削除されました",
		},
		401: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "認証エラー",
		},
		403: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "アクセス権限なし",
		},
		404: {
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
			description: "チェックリスト項目が見つからない",
		},
	},
	tags: ["Checklist"],
	summary: "チェックリスト項目削除",
	description: "指定されたチェックリスト項目を削除します。",
});

const app = new OpenAPIHono();

app.use("*", authMiddleware);
app.openapi(createChecklistItemRoute, createChecklistItem);
app.openapi(updateChecklistItemRoute, updateChecklistItem);
app.openapi(deleteChecklistItemRoute, deleteChecklistItem);

export default app;