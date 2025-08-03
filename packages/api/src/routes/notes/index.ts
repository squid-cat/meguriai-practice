import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middleware/auth";
import {
	createNote,
	deleteNote,
	getNoteById,
	getNotes,
	shareNote,
	unshareNote,
	updateNote,
} from "./handlers";
import {
	CreateNoteRequestSchema,
	CreateNoteResponseSchema,
	NoteListResponseSchema,
	NoteResponseSchema,
	ShareResponseSchema,
	UpdateNoteRequestSchema,
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

const getNotesRoute = createRoute({
	method: "get",
	path: "/",
	security: [{ Bearer: [] }],
	request: {
		query: z.object({
			status: z.enum(["draft", "active", "completed"]).optional(),
			page: z.string().transform(Number).optional(),
			limit: z.string().transform(Number).optional(),
			sort: z.enum(["created_at_desc", "created_at_asc", "departure_date_desc", "departure_date_asc"]).optional(),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: NoteListResponseSchema,
				},
			},
			description: "ノート一覧を返します",
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
	tags: ["Notes"],
	summary: "ノート一覧取得",
	description: "認証されたユーザーのノート一覧を取得します。",
});

const getNoteByIdRoute = createRoute({
	method: "get",
	path: "/{id}",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: "id",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: NoteResponseSchema,
				},
			},
			description: "ノート詳細を返します",
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
	},
	tags: ["Notes"],
	summary: "ノート詳細取得",
	description: "指定されたノートの詳細情報を取得します。",
});

const createNoteRoute = createRoute({
	method: "post",
	path: "/",
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateNoteRequestSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				"application/json": {
					schema: CreateNoteResponseSchema,
				},
			},
			description: "ノートが正常に作成されました",
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
	tags: ["Notes"],
	summary: "ノート作成",
	description: "新しいノートを作成します。",
});

const updateNoteRoute = createRoute({
	method: "put",
	path: "/{id}",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: "id",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
		}),
		body: {
			content: {
				"application/json": {
					schema: UpdateNoteRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: NoteResponseSchema,
				},
			},
			description: "更新されたノート詳細を返します",
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
	tags: ["Notes"],
	summary: "ノート更新",
	description: "指定されたノートを更新します。",
});

const deleteNoteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: "id",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
		}),
	},
	responses: {
		204: {
			description: "ノートが正常に削除されました",
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
	},
	tags: ["Notes"],
	summary: "ノート削除",
	description: "指定されたノートを削除します。",
});

const shareNoteRoute = createRoute({
	method: "post",
	path: "/{id}/share",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: "id",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: ShareResponseSchema,
				},
			},
			description: "共有URLが正常に生成されました",
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
	},
	tags: ["Notes"],
	summary: "ノート共有有効化",
	description: "指定されたノートの共有を有効化し、共有URLを生成します。",
});

const unshareNoteRoute = createRoute({
	method: "delete",
	path: "/{id}/share",
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: "id",
					in: "path",
				},
				example: "note_123",
				description: "ノートID",
			}),
		}),
	},
	responses: {
		204: {
			description: "共有が正常に無効化されました",
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
	},
	tags: ["Notes"],
	summary: "ノート共有無効化",
	description: "指定されたノートの共有を無効化します。",
});

const app = new OpenAPIHono();

app.use("*", authMiddleware);
app.openapi(getNotesRoute, getNotes);
app.openapi(getNoteByIdRoute, getNoteById);
app.openapi(createNoteRoute, createNote);
app.openapi(updateNoteRoute, updateNote);
app.openapi(deleteNoteRoute, deleteNote);
app.openapi(shareNoteRoute, shareNote);
app.openapi(unshareNoteRoute, unshareNote);

export default app;