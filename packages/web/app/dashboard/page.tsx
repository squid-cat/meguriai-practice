"use client";

import { Calendar, Edit, Eye, Plus, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { apiClient } from "@/utils/api-client";
import Image from "next/image";

interface LeaveNote {
	id: string;
	title: string;
	destination: string;
	departureDate: string;
	returnDate: string;
	status: "draft" | "active" | "completed";
	isShared: boolean;
	shareToken: string | null;
	checklistProgress?: {
		completed: number;
		total: number;
		percentage: number;
	};
	createdAt: string;
	updatedAt: string;
}

export default function DashboardPage() {
	const [notes, setNotes] = useState<LeaveNote[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchNotes = async () => {
			try {
				// 将来的にはAPI実装時にこちらを使用
				// const { data, error } = await apiClient.GET("/api/v1/notes");
				// if (error) {
				// 	setError("ノートの取得に失敗しました");
				// 	return;
				// }
				// setNotes(data.notes);

				// 現在はモックデータを使用
				const mockNotes: LeaveNote[] = [
					{
						id: "1",
						title: "沖縄家族旅行",
						destination: "沖縄",
						departureDate: "2024-08-15",
						returnDate: "2024-08-20",
						status: "active",
						isShared: true,
						shareToken: "share_token_123",
						checklistProgress: {
							completed: 3,
							total: 5,
							percentage: 60,
						},
						createdAt: "2024-08-01T00:00:00Z",
						updatedAt: "2024-08-10T00:00:00Z",
					},
					{
						id: "2",
						title: "実家帰省",
						destination: "大阪",
						departureDate: "2024-09-01",
						returnDate: "2024-09-05",
						status: "draft",
						isShared: false,
						shareToken: null,
						checklistProgress: {
							completed: 1,
							total: 3,
							percentage: 33,
						},
						createdAt: "2024-08-05T00:00:00Z",
						updatedAt: "2024-08-05T00:00:00Z",
					},
					{
						id: "3",
						title: "北海道出張",
						destination: "札幌",
						departureDate: "2024-07-20",
						returnDate: "2024-07-25",
						status: "completed",
						isShared: true,
						shareToken: "share_token_456", 
						checklistProgress: {
							completed: 5,
							total: 5,
							percentage: 100,
						},
						createdAt: "2024-07-15T00:00:00Z",
						updatedAt: "2024-07-26T00:00:00Z",
					},
				];
				setNotes(mockNotes);
				setError(null);
			} catch (err) {
				console.error("Error fetching notes:", err);
				setError("ネットワークエラーが発生しました");
			} finally {
				setLoading(false);
			}
		};

		fetchNotes();
	}, []);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "draft":
				return <Badge variant="secondary">下書き</Badge>;
			case "active":
				return <Badge variant="default">アクティブ</Badge>;
			case "completed":
				return <Badge variant="outline">完了</Badge>;
			default:
				return <Badge variant="secondary">不明</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">読み込み中...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="flex items-center space-x-2">
						<Image src="/images/leavenote.png" alt="LeaveNote" width={60} height={40} />
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
					</Link>
					<Link href="/create">
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							新しいノート
						</Button>
					</Link>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						ダッシュボード
					</h1>
					<p className="text-gray-600">あなたのLeaveNoteを管理しましょう</p>
				</div>

				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				{/* Stats Cards */}
				<div className="grid md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								総ノート数
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{notes.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								アクティブ
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600">
								{notes.filter((n) => n.status === "active").length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								共有中
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{notes.filter((n) => n.isShared).length}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Notes List */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold text-gray-900">
						あなたのLeaveNote
					</h2>
					{notes.map((note) => (
						<Card key={note.id} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="flex items-center gap-2">
											{note.title}
											{getStatusBadge(note.status)}
										</CardTitle>
										<CardDescription className="mt-1">
											{note.destination} • {note.departureDate} 〜{" "}
											{note.returnDate}
										</CardDescription>
									</div>
									<div className="flex space-x-2">
										<Button variant="ghost" size="sm">
											<Eye className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="sm">
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="sm">
											<Share2 className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between text-sm text-gray-500">
									<div className="flex items-center space-x-4">
										<span className="flex items-center">
											<Share2 className="h-4 w-4 mr-1" />
											{note.isShared ? "共有中" : "未共有"}
										</span>
										{note.checklistProgress && (
											<span className="flex items-center">
												<Calendar className="h-4 w-4 mr-1" />
												進捗: {note.checklistProgress.completed}/{note.checklistProgress.total}
											</span>
										)}
										<span className="flex items-center">
											<Calendar className="h-4 w-4 mr-1" />
											最終更新: {new Date(note.updatedAt).toLocaleDateString("ja-JP")}
										</span>
									</div>
									<Link href={`/note/${note.id}`}>
										<Button variant="outline" size="sm">
											詳細を見る
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{notes.length === 0 && (
					<Card className="text-center py-12">
						<CardContent>
							<div className="text-gray-400 mb-4">
								<Calendar className="h-16 w-16 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									まだLeaveNoteがありません
								</h3>
								<p className="text-gray-600 mb-6">
									最初のLeaveNoteを作成して、旅行の準備を始めましょう
								</p>
								<Link href="/create">
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										新しいノートを作成
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
