import { z } from "@hono/zod-openapi";

export const SharedChecklistItemSchema = z.object({
	text: z.string().openapi({
		example: "エアコンの電源を切る",
		description: "チェックリスト項目のテキスト",
	}),
	completed: z.boolean().openapi({
		example: true,
		description: "完了状態",
	}),
});

export const SharedEmergencyContactSchema = z.object({
	name: z.string().openapi({
		example: "田中太郎",
		description: "連絡先の名前",
	}),
	relationship: z.string().openapi({
		example: "父親",
		description: "続柄",
	}),
	phone: z.string().nullable().openapi({
		example: "090-1234-5678",
		description: "電話番号",
	}),
	email: z.string().nullable().openapi({
		example: "tanaka@example.com",
		description: "メールアドレス",
	}),
});

export const SharedRequestSchema = z.object({
	person: z.string().openapi({
		example: "隣人の佐藤さん",
		description: "依頼先の人",
	}),
	request: z.string().openapi({
		example: "郵便受けの確認をお願いします",
		description: "依頼内容",
	}),
	priority: z.enum(["high", "medium", "low"]).openapi({
		example: "high",
		description: "優先度",
	}),
});

export const SharedNoteOwnerSchema = z.object({
	name: z.string().openapi({
		example: "田中花子",
		description: "ノート作成者の名前",
	}),
});

export const SharedNoteSchema = z.object({
	id: z.string().openapi({
		example: "note_123",
		description: "ノートID",
	}),
	title: z.string().openapi({
		example: "沖縄家族旅行",
		description: "ノートタイトル",
	}),
	destination: z.string().openapi({
		example: "沖縄",
		description: "行き先",
	}),
	departureDate: z
		.date()
		.transform((date) => date.toISOString().split("T")[0])
		.openapi({
			type: "string",
			format: "date",
			example: "2024-08-15",
			description: "出発日",
		}),
	returnDate: z
		.date()
		.transform((date) => date.toISOString().split("T")[0])
		.openapi({
			type: "string",
			format: "date",
			example: "2024-08-20",
			description: "帰宅日",
		}),
	description: z.string().nullable().openapi({
		example: "家族4人での沖縄旅行",
		description: "ノートの説明",
	}),
	status: z.enum(["draft", "active", "completed"]).openapi({
		example: "active",
		description: "ノートのステータス",
	}),
	owner: SharedNoteOwnerSchema.openapi({
		description: "ノート作成者情報",
	}),
	checklistItems: z.array(SharedChecklistItemSchema).openapi({
		description: "チェックリスト項目",
	}),
	emergencyContacts: z.array(SharedEmergencyContactSchema).openapi({
		description: "緊急連絡先",
	}),
	requests: z.array(SharedRequestSchema).openapi({
		description: "お願いメモ",
	}),
});

export const SharedNoteResponseSchema = z.object({
	note: SharedNoteSchema,
});