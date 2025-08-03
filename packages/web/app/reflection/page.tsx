"use client";

import { CheckCircle, Lightbulb, RotateCcw, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getLeaveNoteById, saveReflection, getReflectionByNoteId, type LeaveNote, type Reflection } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function ReflectionContent() {
	const { user, loading, signInAnonymous, signInWithGoogle } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const noteId = searchParams.get('noteId');
	const [saving, setSaving] = useState(false);
	const [note, setNote] = useState<LeaveNote | null>(null);
	const [existingReflection, setExistingReflection] = useState<Reflection | null>(null);

	const [reflection, setReflection] = useState({
		whatWorked: "",
		whatDidntWork: "",
		improvements: "",
		nextTimeReminder: "",
	});

	// Load note and existing reflection
	useEffect(() => {
		if (noteId && user) {
			const loadData = async () => {
				try {
					const noteData = await getLeaveNoteById(noteId);
					if (noteData && noteData.userId === user.uid) {
						setNote(noteData);
						
						// Load existing reflection if any
						const existingRefl = await getReflectionByNoteId(noteId);
						if (existingRefl) {
							setExistingReflection(existingRefl);
							setReflection({
								whatWorked: existingRefl.whatWorked,
								whatDidntWork: existingRefl.whatDidntWork,
								improvements: existingRefl.improvements,
								nextTimeReminder: existingRefl.nextTimeReminder,
							});
						}
					}
				} catch (error) {
					console.error('Error loading data:', error);
				}
			};
			loadData();
		}
	}, [noteId, user]);

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
						<CardDescription>振り返りを作成するにはログインしてください</CardDescription>
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

	// Mock data for demo when no note specified
	const tripData = note || {
		title: "沖縄家族旅行",
		destination: "沖縄",
		departureDate: "2024-08-15",
		returnDate: "2024-08-20",
		checklist: [
			{ id: "1", text: "エアコンの電源を切る", completed: true },
			{ id: "2", text: "ガスの元栓を確認する", completed: true },
			{ id: "3", text: "ゴミ出しをする", completed: true },
			{ id: "4", text: "冷蔵庫の中身を確認", completed: false },
			{ id: "5", text: "植物の水やりを頼む", completed: true },
		],
		requests: [
			{ id: "1", person: "隣人の佐藤さん", request: "郵便受けの確認", completed: true },
			{ id: "2", person: "妹", request: "植物の水やり", completed: true },
		],
	};

	const completedTasks = tripData.checklist.filter(
		(item) => item.completed,
	).length;
	const totalTasks = tripData.checklist.length;
	const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

	const handleSave = async () => {
		if (!user) return;

		setSaving(true);
		try {
			await saveReflection({
				noteId: noteId || 'demo',
				userId: user.uid,
				...reflection,
			});
			
			alert('振り返りを保存しました');
			if (noteId) {
				router.push('/dashboard');
			}
		} catch (error) {
			console.error('Save error:', error);
			alert('保存に失敗しました');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
					</Link>
					<Button onClick={handleSave} disabled={saving}>
						<Save className="h-4 w-4 mr-2" />
						{saving ? '保存中...' : '振り返りを保存'}
					</Button>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="mb-8">
					<div className="flex items-center mb-4">
						<RotateCcw className="h-8 w-8 text-blue-600 mr-3" />
						<h1 className="text-3xl font-bold text-gray-900">旅行の振り返り</h1>
					</div>
					<p className="text-gray-600">
						{tripData.title}の振り返りをして、次回の旅行をより良くしましょう
					</p>
				</div>

				<div className="space-y-8">
					{/* Trip Summary */}
					<Card>
						<CardHeader>
							<CardTitle>旅行サマリー</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-3 gap-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{completionRate}%
									</div>
									<div className="text-sm text-gray-600">タスク完了率</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{completedTasks}
									</div>
									<div className="text-sm text-gray-600">完了したタスク</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-orange-600">
										{totalTasks - completedTasks}
									</div>
									<div className="text-sm text-gray-600">未完了のタスク</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Task Review */}
					<Card>
						<CardHeader>
							<CardTitle>タスクの振り返り</CardTitle>
							<CardDescription>
								完了できたタスクと未完了のタスクを確認しましょう
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-green-700 mb-3 flex items-center">
										<CheckCircle className="h-4 w-4 mr-2" />
										完了したタスク
									</h4>
									<div className="space-y-2">
										{tripData.checklist
											.filter((item) => item.completed)
											.map((item, index) => (
												<div
													key={index}
													className="flex items-center text-sm text-gray-600"
												>
													<CheckCircle className="h-4 w-4 mr-2 text-green-600" />
													{item.text}
												</div>
											))}
									</div>
								</div>

								<Separator />

								<div>
									<h4 className="font-medium text-red-700 mb-3 flex items-center">
										<XCircle className="h-4 w-4 mr-2" />
										未完了のタスク
									</h4>
									<div className="space-y-2">
										{tripData.checklist
											.filter((item) => !item.completed)
											.map((item, index) => (
												<div
													key={index}
													className="flex items-center text-sm text-gray-600"
												>
													<XCircle className="h-4 w-4 mr-2 text-red-600" />
													{item.text}
												</div>
											))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Reflection Questions */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
								振り返りの質問
							</CardTitle>
							<CardDescription>
								次回の旅行をより良くするための振り返りです
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="what-worked">
									うまくいったこと・役に立ったこと
								</Label>
								<Textarea
									id="what-worked"
									placeholder="例: 隣人の佐藤さんに郵便確認をお願いしたおかげで、重要な書類を受け取れた"
									value={reflection.whatWorked}
									onChange={(e) =>
										setReflection({ ...reflection, whatWorked: e.target.value })
									}
									rows={4}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="what-didnt-work">
									うまくいかなかったこと・困ったこと
								</Label>
								<Textarea
									id="what-didnt-work"
									placeholder="例: 冷蔵庫の中身確認を忘れて、帰宅後に食材が傷んでいた"
									value={reflection.whatDidntWork}
									onChange={(e) =>
										setReflection({
											...reflection,
											whatDidntWork: e.target.value,
										})
									}
									rows={4}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="improvements">次回改善したいこと</Label>
								<Textarea
									id="improvements"
									placeholder="例: 宅配の一時停止手続きを事前に行う、植物の水やり頻度をもっと詳しく伝える"
									value={reflection.improvements}
									onChange={(e) =>
										setReflection({
											...reflection,
											improvements: e.target.value,
										})
									}
									rows={4}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="next-time">
									次回の旅行で忘れずにやりたいこと
								</Label>
								<Textarea
									id="next-time"
									placeholder="例: 出発3日前にはすべてのタスクを完了させる、緊急連絡先リストを更新する"
									value={reflection.nextTimeReminder}
									onChange={(e) =>
										setReflection({
											...reflection,
											nextTimeReminder: e.target.value,
										})
									}
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Template Creation */}
					<Card className="bg-blue-50 border-blue-200">
						<CardHeader>
							<CardTitle className="text-blue-900">
								次回のテンプレート作成
							</CardTitle>
							<CardDescription className="text-blue-700">
								この振り返りを元に、次回の旅行用テンプレートを作成できます
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="bg-white p-4 rounded-md border border-blue-200">
									<h4 className="font-medium mb-2">
										テンプレートに含まれる内容：
									</h4>
									<ul className="text-sm text-gray-600 space-y-1">
										<li>• 今回完了できたタスクリスト</li>
										<li>• 改善点を反映した新しいタスク</li>
										<li>• 緊急連絡先（更新版）</li>
										<li>• お願いメモのテンプレート</li>
									</ul>
								</div>
								<Link href="/create">
									<Button className="w-full">
										<Save className="h-4 w-4 mr-2" />
										新しいLeaveNoteを作成
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-4">
						<Link href="/dashboard">
							<Button variant="outline">後で振り返る</Button>
						</Link>
						<Button onClick={handleSave} disabled={saving}>
							<Save className="h-4 w-4 mr-2" />
							{saving ? '保存中...' : '振り返りを保存'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ReflectionPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div>読み込み中...</div></div>}>
			<ReflectionContent />
		</Suspense>
	);
}