import type { Context } from "hono";
import { AuthService } from "../../services/auth.service";
import { AuthenticationError, ValidationError } from "../../utils/errors";

const authService = new AuthService();

export const getCurrentUser = async (c: Context) => {
	const user = c.get("user");

	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	// Firebase UIDでユーザーを再取得して最新情報を返す
	const latestUser = await authService.findUserByFirebaseUid(
		user.firebaseUid,
	);

	if (!latestUser) {
		throw new AuthenticationError("ユーザーが見つかりません");
	}

	return c.json({ user: latestUser });
};

export const updateProfile = async (c: Context) => {
	const user = c.get("user");
	const body = c.req.valid("json") as { name: string };

	if (!user) {
		throw new AuthenticationError("ユーザー情報が取得できません");
	}

	if (!body.name || body.name.trim().length === 0) {
		throw new ValidationError("ユーザー名は必須です", [
			{ field: "name", message: "ユーザー名を入力してください" },
		]);
	}

	const updatedUser = await authService.updateUserProfile(user.id, {
		name: body.name.trim(),
	});

	return c.json({ user: updatedUser });
};