"use client";

import {
	AlertTriangle,
	Calendar,
	Download,
	Edit,
	Mail,
	MapPin,
	Phone,
	Share2,
	User,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getLeaveNoteById, updateLeaveNote, type LeaveNote } from "@/lib/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function NoteViewPage({ params }: { params: { id: string } }) {
	const { user, loading } = useAuth();
	const [note, setNote] = useState<LeaveNote | null>(null);
	const [loadingNote, setLoadingNote] = useState(true);

	useEffect(() => {
		const loadNote = async () => {
			try {
				const noteData = await getLeaveNoteById(params.id);
				setNote(noteData);
			} catch (error) {
				console.error('Error loading note:', error);
			} finally {
				setLoadingNote(false);
			}
		};

		loadNote();
	}, [params.id]);

	const handleChecklistToggle = async (itemId: string) => {
		if (!note || !user || note.userId !== user.uid) return;

		const updatedChecklist = note.checklist.map(item =>
			item.id === itemId ? { ...item, completed: !item.completed } : item
		);

		const updatedNote = { ...note, checklist: updatedChecklist };
		setNote(updatedNote);

		try {
			await updateLeaveNote(params.id, { checklist: updatedChecklist });
		} catch (error) {
			console.error('Error updating checklist:', error);
			// Revert on error
			setNote(note);
		}
	};

	const handleShare = () => {
		const shareUrl = `${window.location.origin}/shared/${params.id}`;
		navigator.clipboard.writeText(shareUrl);
		alert('共有URLをクリップボードにコピーしました');
	};

	const getPriorityBadge = (priority: string) => {
		switch (priority) {
			case "high":
				return <Badge variant="destructive">高</Badge>;
			case "medium":
				return <Badge variant="default">中</Badge>;
			case "low":
				return <Badge variant="secondary">低</Badge>;
			default:
				return <Badge variant="secondary">-</Badge>;
		}
	};

	if (loading || loadingNote) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div>読み込み中...</div>
			</div>
		);
	}

	if (!note) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>ノートが見つかりません</CardTitle>
						<CardDescription>指定されたノートが存在しないか、アクセス権限がありません</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/dashboard">
							<Button className="w-full">ダッシュボードに戻る</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (user && note.userId !== user.uid) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>アクセス権限がありません</CardTitle>
						<CardDescription>このノートにアクセスする権限がありません</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/dashboard">
							<Button className="w-full">ダッシュボードに戻る</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const completedCount = note.checklist.filter((item) => item.completed).length;
	const totalCount = note.checklist.length;
	const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
					</Link>
					<div className="space-x-2">
						<Button variant="outline" onClick={() => window.print()}>
							<Download className="h-4 w-4 mr-2" />
							PDF出力
						</Button>
						<Link href={`/create?edit=${note.id}`}>
							<Button variant="outline">
								<Edit className="h-4 w-4 mr-2" />
								編集
							</Button>
						</Link>
						<Button onClick={handleShare}>
							<Share2 className="h-4 w-4 mr-2" />
							共有
						</Button>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Title Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
						<Badge variant={note.status === 'active' ? 'default' : note.status === 'draft' ? 'secondary' : 'outline'}>
							{note.status === 'active' ? 'アクティブ' : note.status === 'draft' ? '下書き' : '完了'}
						</Badge>
					</div>
					<div className="flex items-center space-x-6 text-gray-600">
						<div className="flex items-center">
							<MapPin className="h-4 w-4 mr-1" />
							{note.destination}
						</div>
						<div className="flex items-center">
							<Calendar className="h-4 w-4 mr-1" />
							{note.departureDate} 〜 {note.returnDate}
						</div>
					</div>
					{note.description && (
						<p className="mt-4 text-gray-700">{note.description}</p>
					)}
				</div>

				<div className="space-y-8">
					{/* Progress Overview */}
					<Card>
						<CardHeader>
							<CardTitle>準備状況</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-gray-600">完了率</span>
								<span className="text-sm font-medium">
									{completedCount}/{totalCount} ({completionRate}%)
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-blue-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${completionRate}%` }}
								></div>
							</div>
						</CardContent>
					</Card>

					{/* Checklist */}
					<Card>
						<CardHeader>
							<CardTitle>やることリスト</CardTitle>
							<CardDescription>出発前に完了すべき項目</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{note.checklist.map((item) => (
									<div key={item.id} className="flex items-center space-x-3">
										<Checkbox 
											checked={item.completed}
											onCheckedChange={() => handleChecklistToggle(item.id)}
											disabled={!user || note.userId !== user.uid}
										/>
										<span
											className={`flex-1 ${item.completed ? "line-through text-gray-500" : ""}`}
										>
											{item.text}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Emergency Contacts */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
								緊急連絡先
							</CardTitle>
							<CardDescription>
								万が一の時はこちらに連絡してください
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{note.emergencyContacts.map((contact, index) => (
									<div key={contact.id}>
										{index > 0 && <Separator className="mb-4" />}
										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<div className="flex items-center mb-2">
													<User className="h-4 w-4 mr-2 text-gray-500" />
													<span className="font-medium">{contact.name}</span>
													<Badge variant="outline" className="ml-2">
														{contact.relationship}
													</Badge>
												</div>
												<div className="space-y-1 text-sm text-gray-600">
													<div className="flex items-center">
														<Phone className="h-4 w-4 mr-2" />
														<a
															href={`tel:${contact.phone}`}
															className="hover:text-blue-600"
														>
															{contact.phone}
														</a>
													</div>
													<div className="flex items-center">
														<Mail className="h-4 w-4 mr-2" />
														<a
															href={`mailto:${contact.email}`}
															className="hover:text-blue-600"
														>
															{contact.email}
														</a>
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Requests */}
					<Card>
						<CardHeader>
							<CardTitle>お願いメモ</CardTitle>
							<CardDescription>家族や隣人へのお願い事項</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{note.requests.map((request, index) => (
									<div key={request.id}>
										{index > 0 && <Separator className="mb-4" />}
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="font-medium">{request.person}</span>
												{getPriorityBadge(request.priority)}
											</div>
											<p className="text-gray-700 bg-gray-50 p-3 rounded-md">
												{request.request}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Sharing Info */}
					<Card className="bg-blue-50 border-blue-200">
						<CardHeader>
							<CardTitle className="text-blue-900">共有情報</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-blue-800 mb-4">
								このLeaveNoteは以下のURLで共有できます：
							</p>
							<div className="bg-white p-3 rounded-md border border-blue-200 font-mono text-sm">
								{typeof window !== 'undefined' && `${window.location.origin}/shared/${note.id}`}
							</div>
							<p className="text-sm text-blue-700 mt-2">
								※ 共有URLをコピーするには「共有」ボタンをクリックしてください
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}