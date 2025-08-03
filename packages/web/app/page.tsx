import { apiClient } from "../utils/api-client";

export const dynamic = "force-dynamic";

export default async function Home() {
	try {
		const { data, error } = await apiClient.GET("/api/hello");

		if (error) {
			throw new Error("API Error");
		}

		return <h1>{data.message}</h1>;
	} catch (error) {
		console.error("Error:", error);
		return <h1>データの取得に失敗しました</h1>;
	}
}
