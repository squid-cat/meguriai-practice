import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const HelloResponseSchema = z.object({
	message: z.string().openapi({
		example: "Hello from Hono API!",
		description: "挨拶メッセージ",
	}),
});

const helloRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: HelloResponseSchema,
				},
			},
			description: "挨拶メッセージを返します",
		},
	},
	tags: ["Hello"],
	summary: "挨拶API",
	description: "シンプルな挨拶メッセージを返すエンドポイント",
});

const app = new OpenAPIHono().openapi(helloRoute, (c) =>
	c.json({ message: "Hello from Hono API!" }),
);

export default app;
