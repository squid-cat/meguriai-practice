import { writeFileSync } from "node:fs";
import { createApp } from "../src/app";
import { OPENAPI_CONFIG } from "../src/config";

const { app } = createApp();

// Generate OpenAPI spec
const openApiSpec = app.getOpenAPIDocument(OPENAPI_CONFIG);

// Write to file
writeFileSync("./openapi.json", JSON.stringify(openApiSpec, null, 2), "utf-8");

console.log("✅ OpenAPI schema generated at ./openapi.json");
