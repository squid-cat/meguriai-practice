import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TestSchema = z.object({
	id: z.string().openapi({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "テストID (UUID)",
	}),
	text: z.string().openapi({
		example: "テストメッセージ",
		description: "テスト内容",
	}),
	createdAt: z
		.date()
		.transform((date) => date.toISOString())
		.openapi({
			type: "string",
			format: "date-time",
			example: "2024-01-01T00:00:00.000Z",
			description: "作成日時",
		}),
	updatedAt: z
		.date()
		.transform((date) => date.toISOString())
		.openapi({
			type: "string",
			format: "date-time",
			example: "2024-01-01T00:00:00.000Z",
			description: "更新日時",
		}),
});

const TestListResponseSchema = z.object({
	tests: z.array(TestSchema),
});

const CreateTestRequestSchema = z.object({
	text: z.string().min(1).openapi({
		example: "新しいテストメッセージ",
		description: "作成するテスト内容",
	}),
});

const CreateTestResponseSchema = z.object({
	message: z.string().openapi({
		example: "created",
		description: "作成完了メッセージ",
	}),
	test: TestSchema,
});

const getTestsRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: TestListResponseSchema,
				},
			},
			description: "テスト一覧を返します",
		},
	},
	tags: ["Test"],
	summary: "テスト一覧取得API",
	description: "データベースに保存されているテストデータの一覧を取得します",
});

const createTestRoute = createRoute({
	method: "post",
	path: "/",
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateTestRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: CreateTestResponseSchema,
				},
			},
			description: "テストデータが正常に作成されました",
		},
	},
	tags: ["Test"],
	summary: "テスト作成API",
	description: "新しいテストデータをデータベースに作成します",
});

const app = new OpenAPIHono()
	.openapi(getTestsRoute, async (c) => {
		const tests = await prisma.test.findMany({
			orderBy: { createdAt: "desc" },
		});
		return c.json({ tests });
	})
	.openapi(createTestRoute, async (c) => {
		const body = c.req.valid("json");
		const test = await prisma.test.create({
			data: {
				text: body.text,
			},
		});

		return c.json({ message: "created", test });
	});

export default app;
