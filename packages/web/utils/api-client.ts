import createClient from "openapi-fetch";
import type { paths } from "./api-types";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });
