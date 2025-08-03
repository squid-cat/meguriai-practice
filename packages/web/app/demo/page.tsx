"use client";

import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Mail,
	MapPin,
	Phone,
	Share2,
	User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DemoPage() {
	// Demo data
	const demoNote = {
		id: "demo",
		title: "沖縄家族旅行",
		destination: "沖縄",
		departureDate: "2024-08-15",
		returnDate: "2024-08-20",
		description:
			"家族4人での沖縄旅行。子供たちは初めての沖縄なので楽しみにしています。美ら海水族館や首里城などを観光予定です。",
		owner: "田中花子",
		checklist: [
			{ id: "1", text: "エアコンの電源を切る", completed: true },
			{ id: "2", text: "ガスの元栓を確認する", completed: true },
			{ id: "3", text: "ゴミ出しをする", completed: true },
			{ id: "4", text: "冷蔵庫の中身を確認", completed: false },
			{ id: "5", text: "植物の水やりを頼む", completed: false },
			{ id: "6", text: "郵便受けの確認を隣人に依頼", completed: true },
			{ id: "7", text: "宅配の一時停止手続き", completed: false },
		],
		emergencyContacts: [
			{
				id: "1",
				name: "田中太郎",
				relationship: "父親",
				phone: "090-1234-5678",
				email: "tanaka.taro@example.com",
			},
			{
				id: "2",
				name: "管理会社",
				relationship: "マンション管理",
				phone: "03-1234-5678",
				email: "info@management.com",
			},
			{
				id: "3",
				name: "田中次郎",
				relationship: "兄",
				phone: "080-9876-5432",
				email: "jiro.tanaka@example.com",
			},
		],
		requests: [
			{
				id: "1",
				person: "隣人の佐藤さん",
				request: "郵便受けの確認をお願いします。重要な書類が届く予定です。",
				priority: "high" as const,
			},
			{
				id: "2",
				person: "妹",
				request: "植物の水やりを2日に1回お願いします。ベランダの観葉植物3鉢です。",
				priority: "medium" as const,
			},
			{
				id: "3",
				person: "管理会社",
				request: "何か緊急事態があった場合は、すぐに連絡をお願いします。",
				priority: "high" as const,
			},
		],
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

	const completedCount = demoNote.checklist.filter((item) => item.completed).length;
	const totalCount = demoNote.checklist.length;
	const completionRate = Math.round((completedCount / totalCount) * 100);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="flex items-center space-x-2">
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
						<Badge variant="outline">デモ</Badge>
					</Link>
					<div className="space-x-2">
						<Link href="/create">
							<Button variant="outline">実際に試してみる</Button>
						</Link>
						<Link href="/dashboard">
							<Button>ダッシュボードへ</Button>
						</Link>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Demo Introduction */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						LeaveNote デモ画面
					</h1>
					<Card className="bg-blue-50 border-blue-200">
						<CardContent className="pt-6">
							<p className="text-blue-800 mb-4">
								これは田中花子さんの沖縄家族旅行のLeaveNoteです。
								実際の使用例として、どのような情報が整理・共有されるかご確認ください。
							</p>
							<div className="grid md:grid-cols-3 gap-4 text-sm">
								<div className="bg-white p-3 rounded-md">
									<strong>出発前の準備状況:</strong> {completionRate}%完了
								</div>
								<div className="bg-white p-3 rounded-md">
									<strong>緊急連絡先:</strong> {demoNote.emergencyContacts.length}件登録
								</div>
								<div className="bg-white p-3 rounded-md">
									<strong>お願い事項:</strong> {demoNote.requests.length}件設定
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Title Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-bold text-gray-900">{demoNote.title}</h2>
						<Badge variant="default">アクティブ</Badge>
					</div>
					<div className="flex items-center space-x-6 text-gray-600 mb-4">
						<div className="flex items-center">
							<User className="h-4 w-4 mr-1" />
							{demoNote.owner}さんのLeaveNote
						</div>
						<div className="flex items-center">
							<MapPin className="h-4 w-4 mr-1" />
							{demoNote.destination}
						</div>
						<div className="flex items-center">
							<Calendar className="h-4 w-4 mr-1" />
							{demoNote.departureDate} 〜 {demoNote.returnDate}
						</div>
					</div>
					<p className="text-gray-700 bg-gray-50 p-4 rounded-md">
						{demoNote.description}
					</p>
				</div>

				<div className="space-y-8">
					{/* Progress Overview */}
					<Card>
						<CardHeader>
							<CardTitle>準備状況</CardTitle>
							<CardDescription>出発前のチェックリスト進捗</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-gray-600">完了率</span>
								<span className="text-sm font-medium">
									{completedCount}/{totalCount} ({completionRate}%)
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-blue-600 h-3 rounded-full transition-all duration-300"
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
								{demoNote.checklist.map((item) => (
									<div key={item.id} className="flex items-center space-x-3">
										<CheckCircle
											className={`h-5 w-5 ${
												item.completed ? "text-green-600" : "text-gray-300"
											}`}
										/>
										<span
											className={`flex-1 ${
												item.completed ? "line-through text-gray-500" : ""
											}`}
										>
											{item.text}
										</span>
										{item.completed && (
											<Badge variant="secondary" className="text-xs">
												完了
											</Badge>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Emergency Contacts */}
					<Card className="border-red-200">
						<CardHeader>
							<CardTitle className="flex items-center text-red-800">
								<AlertTriangle className="h-5 w-5 mr-2" />
								緊急連絡先
							</CardTitle>
							<CardDescription>
								万が一の時はこちらに連絡してください
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{demoNote.emergencyContacts.map((contact, index) => (
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
														<span className="font-medium">{contact.phone}</span>
													</div>
													<div className="flex items-center">
														<Mail className="h-4 w-4 mr-2" />
														<span>{contact.email}</span>
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
								{demoNote.requests.map((request, index) => (
									<div key={request.id}>
										{index > 0 && <Separator className="mb-4" />}
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="font-medium">{request.person}</span>
												{getPriorityBadge(request.priority)}
											</div>
											<p className="text-gray-700 bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
												{request.request}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Sharing Demo */}
					<Card className="bg-green-50 border-green-200">
						<CardHeader>
							<CardTitle className="text-green-900 flex items-center">
								<Share2 className="h-5 w-5 mr-2" />
								共有機能
							</CardTitle>
							<CardDescription className="text-green-700">
								このようなURLで信頼できる人に情報を共有できます
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="bg-white p-4 rounded-md border border-green-200 font-mono text-sm mb-4">
								{typeof window !== 'undefined' && `${window.location.origin}/shared/demo`}
							</div>
							<div className="grid md:grid-cols-2 gap-4 text-sm">
								<div className="bg-white p-3 rounded-md">
									<strong>パスワード保護:</strong> 設定可能
								</div>
								<div className="bg-white p-3 rounded-md">
									<strong>閲覧期限:</strong> 自動設定可能
								</div>
							</div>
						</CardContent>
					</Card>

					{/* CTA Section */}
					<Card className="bg-blue-600 text-white">
						<CardContent className="pt-6 text-center">
							<h3 className="text-xl font-bold mb-4">
								LeaveNoteを今すぐ始めてみませんか？
							</h3>
							<p className="mb-6 opacity-90">
								このデモのような安心ノートを、あなたも無料で作成できます。
								<br />
								ブラウザだけで完結するシンプルな設計です。
							</p>
							<div className="space-x-4">
								<Link href="/create">
									<Button size="lg" variant="secondary">
										今すぐ作成する（無料）
									</Button>
								</Link>
								<Link href="/dashboard">
									<Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
										ダッシュボードを見る
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}