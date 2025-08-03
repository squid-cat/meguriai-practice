import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { OPENAPI_CONFIG } from "./config";
import { errorHandler } from "./middleware/error";
import auth from "./routes/auth";
import checklist from "./routes/checklist";
import hello from "./routes/hello";
import notes from "./routes/notes";
import shared from "./routes/shared";
import test from "./routes/test";

export function createApp() {
	const app = new OpenAPIHono();

	app.use("*", logger());
	app.use("*", cors());
	app.use("*", errorHandler);

	app.get("/", (c) => {
		return c.json({ message: "Meguriai API Server" });
	});

	app.get("/health", (c) => {
		return c.json({ status: "OK", timestamp: new Date().toISOString() });
	});

	// API routes
	app.route("/api/hello", hello);
	app.route("/api/test", test);
	app.route("/api/v1/auth", auth);
	app.route("/api/v1/notes", notes);
	app.route("/api/v1/notes", checklist);
	app.route("/api/v1/shared", shared);

	// OpenAPI documentation
	app.doc("/doc", OPENAPI_CONFIG);

	app.get("/swagger", swaggerUI({ url: "/doc" }));

	const apiRoutes = app.basePath("/api");

	return { app, apiRoutes };
}
