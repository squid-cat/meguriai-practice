import type { Context } from "hono";
import { NoteService } from "../../services/note.service";
import { AuthenticationError, ValidationError } from "../../utils/errors";

const noteService = new NoteService();

export const getNotes = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const query = c.req.query();
	const result = await noteService.findNotesByUserId(user.id, {
		status: query.status as any,
		page: query.page ? Number.parseInt(query.page) : undefined,
		limit: query.limit ? Number.parseInt(query.limit) : undefined,
		sort: query.sort as any,
	});

	return c.json(result);
};

export const getNoteById = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const noteId = c.req.param("id");
	const note = await noteService.findNoteById(noteId, user.id);

	return c.json({ note });
};

export const createNote = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const body = c.req.valid("json") as any;
	
	// 日付の変換
	const departureDate = new Date(body.departureDate);
	const returnDate = new Date(body.returnDate);

	// バリデーション
	if (departureDate >= returnDate) {
		throw new ValidationError("出発日は帰宅日よりも前である必要があります", [
			{ field: "departureDate", message: "出発日は帰宅日よりも前の日付を指定してください" },
		]);
	}

	const note = await noteService.createNote(user.id, {
		...body,
		departureDate,
		returnDate,
	});

	return c.json({ note }, 201);
};

export const updateNote = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const noteId = c.req.param("id");
	const body = c.req.valid("json") as any;

	const updateData = {
		...body,
		...(body.departureDate && { departureDate: new Date(body.departureDate) }),
		...(body.returnDate && { returnDate: new Date(body.returnDate) }),
	};

	// 日付バリデーション
	if (updateData.departureDate && updateData.returnDate) {
		if (updateData.departureDate >= updateData.returnDate) {
			throw new ValidationError("出発日は帰宅日よりも前である必要があります", [
				{ field: "departureDate", message: "出発日は帰宅日よりも前の日付を指定してください" },
			]);
		}
	}

	const note = await noteService.updateNote(noteId, user.id, updateData);

	return c.json({ note });
};

export const deleteNote = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const noteId = c.req.param("id");
	await noteService.deleteNote(noteId, user.id);

	return c.body(null, 204);
};

export const shareNote = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const noteId = c.req.param("id");
	const result = await noteService.generateShareToken(noteId, user.id);

	return c.json(result);
};

export const unshareNote = async (c: Context) => {
	const user = c.get("user");
	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	const noteId = c.req.param("id");
	await noteService.disableSharing(noteId, user.id);

	return c.body(null, 204);
};