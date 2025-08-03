import type { Context } from "hono";
import { ChecklistService } from "../../services/checklist.service";
import { AuthenticationError, ValidationError } from "../../utils/errors";

const checklistService = new ChecklistService();

export const createChecklistItem = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const noteId = c.req.param("noteId");
	const body = c.req.valid("json") as { text: string; sortOrder?: number };

	if (!body.text || body.text.trim().length === 0) {
		throw new ValidationError("チェックリスト項目のテキストは必須です", [
			{ field: "text", message: "テキストを入力してください" },
		]);
	}

	const item = await checklistService.createChecklistItem(noteId, user.id, {
		text: body.text.trim(),
		sortOrder: body.sortOrder || 0,
	});

	return c.json({ item }, 201);
};

export const updateChecklistItem = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const itemId = c.req.param("itemId");
	const body = c.req.valid("json") as { text?: string; completed?: boolean; sortOrder?: number };

	if (body.text !== undefined && (!body.text || body.text.trim().length === 0)) {
		throw new ValidationError("チェックリスト項目のテキストは必須です", [
			{ field: "text", message: "テキストを入力してください" },
		]);
	}

	const updateData = {
		...(body.text !== undefined && { text: body.text.trim() }),
		...(body.completed !== undefined && { completed: body.completed }),
		...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
	};

	const item = await checklistService.updateChecklistItem(
		itemId,
		user.id,
		updateData,
	);

	return c.json({ item });
};

export const deleteChecklistItem = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const itemId = c.req.param("itemId");
	await checklistService.deleteChecklistItem(itemId, user.id);

	return c.body(null, 204);
};