import { z } from "@hono/zod-openapi";

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

export const CreateChecklistItemRequestSchema = z.object({
	text: z.string().min(1).max(500).openapi({
		example: "新しいタスク",
		description: "チェックリスト項目のテキスト",
	}),
	sortOrder: z.number().openapi({
		example: 5,
		description: "並び順",
	}),
});

export const UpdateChecklistItemRequestSchema = z.object({
	text: z.string().min(1).max(500).optional().openapi({
		example: "エアコンの電源を切る",
		description: "チェックリスト項目のテキスト",
	}),
	completed: z.boolean().optional().openapi({
		example: true,
		description: "完了状態",
	}),
	sortOrder: z.number().optional().openapi({
		example: 1,
		description: "並び順",
	}),
});

export const ChecklistItemResponseSchema = z.object({
	item: ChecklistItemSchema,
});