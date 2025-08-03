import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { OPENAPI_CONFIG } from "./config";
import hello from "./routes/hello";
import test from "./routes/test";

export function createApp() {
	const app = new OpenAPIHono();

	app.use("*", logger());
	app.use("*", cors());

	app.get("/", (c) => {
		return c.json({ message: "Meguriai API Server" });
	});

	app.get("/health", (c) => {
		return c.json({ status: "OK", timestamp: new Date().toISOString() });
	});

	// API routes
	app.route("/api/hello", hello);
	app.route("/api/test", test);

	// OpenAPI documentation
	app.doc("/doc", OPENAPI_CONFIG);

	app.get("/swagger", swaggerUI({ url: "/doc" }));

	const apiRoutes = app.basePath("/api");

	return { app, apiRoutes };
}
