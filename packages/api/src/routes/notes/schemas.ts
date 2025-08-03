import { z } from "@hono/zod-openapi";

export const NoteStatusEnum = z.enum(["draft", "active", "completed"]).openapi({
	example: "active",
	description: "ノートのステータス",
});

export const RequestPriorityEnum = z.enum(["high", "medium", "low"]).openapi({
	example: "high",
	description: "お願いメモの優先度",
});

export const ChecklistItemSchema = z.object({
	id: z.string().openapi({
		example: "item_1",
		description: "チェックリスト項目ID",
	}),
	text: z.string().openapi({
		example: "エアコンの電源を切る",
		description: "チェックリスト項目のテキスト",
	}),
	completed: z.boolean().openapi({
		example: true,
		description: "完了状態",
	}),
	sortOrder: z.number().openapi({
		example: 1,
		description: "並び順",
	}),
});

export const EmergencyContactSchema = z.object({
	id: z.string().openapi({
		example: "contact_1",
		description: "緊急連絡先ID",
	}),
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
	sortOrder: z.number().openapi({
		example: 1,
		description: "並び順",
	}),
});

export const RequestSchema = z.object({
	id: z.string().openapi({
		example: "request_1",
		description: "お願いメモID",
	}),
	person: z.string().openapi({
		example: "隣人の佐藤さん",
		description: "依頼先の人",
	}),
	request: z.string().openapi({
		example: "郵便受けの確認をお願いします",
		description: "依頼内容",
	}),
	priority: RequestPriorityEnum,
	sortOrder: z.number().openapi({
		example: 1,
		description: "並び順",
	}),
});

export const ReflectionSchema = z.object({
	id: z.string().openapi({
		example: "reflection_1",
		description: "振り返りID",
	}),
	whatWorked: z.string().openapi({
		example: "隣人への依頼がスムーズだった",
		description: "良かった点",
	}),
	whatDidntWork: z.string().openapi({
		example: "冷蔵庫の確認を忘れた",
		description: "改善が必要な点",
	}),
	improvements: z.string().openapi({
		example: "事前チェックを強化",
		description: "改善策",
	}),
	nextTimeReminder: z.string().openapi({
		example: "3日前にすべて完了",
		description: "次回への提案",
	}),
});

export const ChecklistProgressSchema = z.object({
	completed: z.number().openapi({
		example: 3,
		description: "完了済み項目数",
	}),
	total: z.number().openapi({
		example: 5,
		description: "全項目数",
	}),
	percentage: z.number().openapi({
		example: 60,
		description: "完了率（%）",
	}),
});

export const NoteSchema = z.object({
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
	status: NoteStatusEnum,
	isShared: z.boolean().openapi({
		example: true,
		description: "共有状態",
	}),
	shareToken: z.string().nullable().openapi({
		example: "share_token_123",
		description: "共有トークン",
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
			example: "2024-08-10T00:00:00Z",
			description: "更新日時",
		}),
});

export const NoteDetailSchema = NoteSchema.extend({
	checklistItems: z.array(ChecklistItemSchema).openapi({
		description: "チェックリスト項目",
	}),
	emergencyContacts: z.array(EmergencyContactSchema).openapi({
		description: "緊急連絡先",
	}),
	requests: z.array(RequestSchema).openapi({
		description: "お願いメモ",
	}),
	reflection: ReflectionSchema.nullable().openapi({
		description: "振り返り",
	}),
});

export const NoteListItemSchema = NoteSchema.extend({
	checklistProgress: ChecklistProgressSchema.openapi({
		description: "チェックリストの進捗",
	}),
});

export const CreateNoteRequestSchema = z.object({
	title: z.string().min(1).max(200).openapi({
		example: "沖縄家族旅行",
		description: "ノートタイトル",
	}),
	destination: z.string().min(1).max(100).openapi({
		example: "沖縄",
		description: "行き先",
	}),
	departureDate: z.string().date().openapi({
		example: "2024-08-15",
		description: "出発日（YYYY-MM-DD形式）",
	}),
	returnDate: z.string().date().openapi({
		example: "2024-08-20",
		description: "帰宅日（YYYY-MM-DD形式）",
	}),
	description: z.string().max(2000).optional().openapi({
		example: "家族4人での沖縄旅行",
		description: "ノートの説明",
	}),
	checklistItems: z.array(
		z.object({
			text: z.string().min(1).openapi({
				example: "エアコンの電源を切る",
				description: "チェックリスト項目のテキスト",
			}),
			sortOrder: z.number().openapi({
				example: 1,
				description: "並び順",
			}),
		})
	).optional().openapi({
		description: "チェックリスト項目",
	}),
	emergencyContacts: z.array(
		z.object({
			name: z.string().min(1).openapi({
				example: "田中太郎",
				description: "連絡先の名前",
			}),
			relationship: z.string().min(1).openapi({
				example: "父親",
				description: "続柄",
			}),
			phone: z.string().optional().openapi({
				example: "090-1234-5678",
				description: "電話番号",
			}),
			email: z.string().email().optional().openapi({
				example: "tanaka@example.com",
				description: "メールアドレス",
			}),
			sortOrder: z.number().openapi({
				example: 1,
				description: "並び順",
			}),
		})
	).optional().openapi({
		description: "緊急連絡先",
	}),
	requests: z.array(
		z.object({
			person: z.string().min(1).openapi({
				example: "隣人の佐藤さん",
				description: "依頼先の人",
			}),
			request: z.string().min(1).max(500).openapi({
				example: "郵便受けの確認をお願いします",
				description: "依頼内容",
			}),
			priority: RequestPriorityEnum,
			sortOrder: z.number().openapi({
				example: 1,
				description: "並び順",
			}),
		})
	).optional().openapi({
		description: "お願いメモ",
	}),
});

export const UpdateNoteRequestSchema = CreateNoteRequestSchema.partial();

export const NoteListResponseSchema = z.object({
	notes: z.array(NoteListItemSchema),
	pagination: z.object({
		page: z.number().openapi({
			example: 1,
			description: "現在のページ番号",
		}),
		limit: z.number().openapi({
			example: 10,
			description: "1ページあたりの件数",
		}),
		total: z.number().openapi({
			example: 25,
			description: "総件数",
		}),
		totalPages: z.number().openapi({
			example: 3,
			description: "総ページ数",
		}),
	}),
});

export const NoteResponseSchema = z.object({
	note: NoteDetailSchema,
});

export const CreateNoteResponseSchema = z.object({
	note: NoteSchema,
});

export const ShareResponseSchema = z.object({
	shareUrl: z.string().openapi({
		example: "https://leavenote.app/shared/share_token_123",
		description: "共有URL",
	}),
	shareToken: z.string().openapi({
		example: "share_token_123",
		description: "共有トークン",
	}),
	isShared: z.boolean().openapi({
		example: true,
		description: "共有状態",
	}),
});