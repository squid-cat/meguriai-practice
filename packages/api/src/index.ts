import { serve } from "@hono/node-server";
import { createApp } from "./app";

const { app } = createApp();

const port = Number(process.env.PORT) || 8000;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
