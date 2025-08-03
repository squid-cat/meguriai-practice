"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";

export default function TestPage() {
	const [text, setText] = useState("");
	const [posts, setPosts] = useState<
		{ text: string; id: string; createdAt: string; updatedAt: string }[]
	>([]);
	const [loading, setLoading] = useState(false);

	const getPosts = useCallback(async () => {
		const { data, error } = await apiClient.GET("/api/test");
		if (error) {
			console.error("Error fetching posts:", error);
			return;
		}
		setPosts(data.tests);
	}, []);

	useEffect(() => {
		getPosts();
	}, [getPosts]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await apiClient.POST("/api/test", {
				body: { text },
			});

			if (error) {
				throw new Error("API Error");
			}

			setText(""); // 送信後にフォームをクリア
			getPosts();
		} catch (error) {
			console.error("エラー:", error);
			alert("エラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
			<h1>テスト画面</h1>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "16px" }}>
					<label
						htmlFor="text"
						style={{ display: "block", marginBottom: "8px" }}
					>
						テキストを入力:
					</label>
					<textarea
						id="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="ここにテキストを入力..."
						style={{
							width: "100%",
							height: "120px",
							padding: "8px",
							border: "1px solid #ccc",
							borderRadius: "4px",
							fontSize: "16px",
						}}
						required
					/>
				</div>

				<button
					type="submit"
					disabled={loading || !text.trim()}
					style={{
						backgroundColor: loading ? "#ccc" : "#0070f3",
						color: "white",
						padding: "12px 24px",
						border: "none",
						borderRadius: "4px",
						fontSize: "16px",
						cursor: loading ? "not-allowed" : "pointer",
						marginBottom: "32px",
					}}
				>
					{loading ? "送信中..." : "POST"}
				</button>
			</form>

			<h2 style={{ marginBottom: "20px", color: "#333" }}>投稿一覧</h2>

			{posts.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "40px",
						color: "#666",
						backgroundColor: "#f8f9fa",
						borderRadius: "8px",
						border: "1px solid #e9ecef",
					}}
				>
					まだ投稿がありません
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					{posts.map((post) => (
						<div
							key={post.id}
							style={{
								backgroundColor: "#fff",
								border: "1px solid #e1e5e9",
								borderRadius: "8px",
								padding: "16px",
								boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
								transition: "box-shadow 0.2s ease",
							}}
							className="post-card"
						>
							<div
								style={{
									fontSize: "16px",
									lineHeight: "1.5",
									color: "#333",
									marginBottom: "12px",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
								}}
							>
								{post.text}
							</div>
							<div
								style={{
									fontSize: "14px",
									color: "#666",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									borderTop: "1px solid #f0f0f0",
									paddingTop: "8px",
								}}
							>
								<span>投稿日時: {formatDate(post.createdAt)}</span>
								<span
									style={{
										fontSize: "12px",
										color: "#999",
										fontFamily: "monospace",
									}}
								>
									PostID: {post.id.slice(0, 8)}...
								</span>
							</div>
						</div>
					))}
				</div>
			)}

			<style jsx>{`
        .post-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
		</div>
	);
}
