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
	// Mock data - in real app, this would be fetched based on params.id
	const note = {
		id: params.id,
		title: "沖縄家族旅行",
		destination: "沖縄",
		departureDate: "2024-08-15",
		returnDate: "2024-08-20",
		description:
			"家族4人での沖縄旅行。子供たちは初めての沖縄なので楽しみにしています。",
		status: "active",
		checklist: [
			{ id: "1", text: "エアコンの電源を切る", completed: true },
			{ id: "2", text: "ガスの元栓を確認する", completed: false },
			{ id: "3", text: "ゴミ出しをする", completed: true },
			{ id: "4", text: "冷蔵庫の中身を確認", completed: false },
			{ id: "5", text: "植物の水やりを頼む", completed: false },
		],
		emergencyContacts: [
			{
				id: "1",
				name: "田中太郎",
				relationship: "父親",
				phone: "090-1234-5678",
				email: "tanaka@example.com",
			},
			{
				id: "2",
				name: "管理会社",
				relationship: "マンション管理",
				phone: "03-1234-5678",
				email: "info@management.com",
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
				request: "植物の水やりを2日に1回お願いします。",
				priority: "medium" as const,
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

	const completedCount = note.checklist.filter((item) => item.completed).length;
	const totalCount = note.checklist.length;
	const completionRate = Math.round((completedCount / totalCount) * 100);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
					</Link>
					<div className="space-x-2">
						<Button variant="outline">
							<Download className="h-4 w-4 mr-2" />
							PDF出力
						</Button>
						<Button variant="outline">
							<Edit className="h-4 w-4 mr-2" />
							編集
						</Button>
						<Button>
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
						<Badge variant="default">アクティブ</Badge>
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
										<Checkbox checked={item.completed} />
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
								https://leavenote.app/shared/{note.id}
							</div>
							<p className="text-sm text-blue-700 mt-2">
								※ パスワード保護や閲覧期限の設定も可能です
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
