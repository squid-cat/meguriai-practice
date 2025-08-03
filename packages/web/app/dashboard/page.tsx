"use client";

import { Calendar, Edit, Eye, Plus, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getUserLeaveNotes, deleteLeaveNote, subscribeToUserNotes, type LeaveNote } from "@/lib/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
	const { user, loading, signInAnonymous, signInWithGoogle } = useAuth();
	const [notes, setNotes] = useState<LeaveNote[]>([]);
	const [loadingNotes, setLoadingNotes] = useState(true);

	useEffect(() => {
		if (!user) {
			setLoadingNotes(false);
			return;
		}

		const unsubscribe = subscribeToUserNotes(user.uid, (userNotes) => {
			setNotes(userNotes);
			setLoadingNotes(false);
		});

		return () => unsubscribe();
	}, [user]);

	const handleDeleteNote = async (id: string) => {
		if (confirm('このノートを削除しますか？')) {
			try {
				await deleteLeaveNote(id);
			} catch (error) {
				console.error('Delete error:', error);
				alert('削除に失敗しました');
			}
		}
	};

	const handleShare = (noteId: string) => {
		const shareUrl = `${window.location.origin}/shared/${noteId}`;
		navigator.clipboard.writeText(shareUrl);
		alert('共有URLをクリップボードにコピーしました');
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div>読み込み中...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>ログインが必要です</CardTitle>
						<CardDescription>ダッシュボードを利用するにはログインしてください</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button onClick={signInWithGoogle} className="w-full">
							Googleでログイン
						</Button>
						<Button onClick={signInAnonymous} variant="outline" className="w-full">
							ゲストとして利用
						</Button>
						<div className="text-center">
							<Link href="/" className="text-sm text-blue-600 hover:underline">
								ホームに戻る
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

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

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="flex items-center space-x-2">
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
								{notes.reduce((sum, n) => sum + (n.sharedWith || 0), 0)}
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
										<Link href={`/note/${note.id}`}>
											<Button variant="ghost" size="sm" title="表示">
												<Eye className="h-4 w-4" />
											</Button>
										</Link>
										<Link href={`/create?edit=${note.id}`}>
											<Button variant="ghost" size="sm" title="編集">
												<Edit className="h-4 w-4" />
											</Button>
										</Link>
										<Button 
											variant="ghost" 
											size="sm" 
											title="共有"
											onClick={() => handleShare(note.id!)}
										>
											<Share2 className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											title="削除"
											className="text-red-600 hover:text-red-700"
											onClick={() => handleDeleteNote(note.id!)}
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
											{note.sharedWith || 0}人と共有
										</span>
										<span className="flex items-center">
											<Calendar className="h-4 w-4 mr-1" />
											最終更新: {note.updatedAt ? new Date(note.updatedAt.toDate()).toLocaleDateString('ja-JP') : '不明'}
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