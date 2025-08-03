import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { AppError } from "../utils/errors";

export const errorHandler = async (c: Context, next: Next) => {
	try {
		await next();
	} catch (error) {
		console.error("Error:", error);

		if (error instanceof AppError) {
			return c.json(
				{
					error: {
						code: error.code,
						message: error.message,
						details: error.details,
					},
				},
				error.statusCode as any,
			);
		}

		if (error instanceof HTTPException) {
			return c.json(
				{
					error: {
						code: "HTTP_EXCEPTION",
						message: error.message,
					},
				},
				error.status as any,
			);
		}

		return c.json(
			{
				error: {
					code: "INTERNAL_SERVER_ERROR",
					message: "サーバー内部エラーが発生しました",
				},
			},
			500 as any,
		);
	}
};