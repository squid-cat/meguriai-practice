import type { Context, Next } from "hono";
import { PrismaClient } from "@prisma/client";
import { AuthenticationError } from "../utils/errors";

const prisma = new PrismaClient();

declare module "hono" {
	interface ContextVariableMap {
		user: {
			id: string;
			firebaseUid: string;
			name: string;
			email: string;
		};
	}
}

export const authMiddleware = async (c: Context, next: Next) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new AuthenticationError("認証トークンが必要です");
	}

	const idToken = authHeader.replace("Bearer ", "");

	try {
		// 本番環境ではFirebase Admin SDKを使用してトークンを検証
		// 開発環境では簡略化した検証を行う
		const firebaseUid = await verifyIdToken(idToken);

		// ユーザー情報を取得
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: {
				id: true,
				firebaseUid: true,
				name: true,
				email: true,
			},
		});

		if (!user) {
			throw new AuthenticationError("ユーザーが見つかりません");
		}

		c.set("user", user);
		await next();
	} catch (error) {
		if (error instanceof AuthenticationError) {
			throw error;
		}
		throw new AuthenticationError("認証トークンが無効です");
	}
};

// TODO: Firebase Admin SDKを使用した実際のトークン検証に置き換える
async function verifyIdToken(idToken: string): Promise<string> {
	// 開発環境での簡略化した検証
	// 実際の実装ではFirebase Admin SDKを使用
	if (idToken === "test-token") {
		return "test-firebase-uid";
	}

	// 実際の実装例（コメントアウト）
	/*
	const admin = require('firebase-admin');
	
	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		return decodedToken.uid;
	} catch (error) {
		throw new AuthenticationError('認証トークンの検証に失敗しました');
	}
	*/

	throw new AuthenticationError("認証トークンの検証に失敗しました");
}