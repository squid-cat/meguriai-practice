"use client";

import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Clock,
	Mail,
	MapPin,
	Phone,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SharedNotePage({ params }: { params: { id: string } }) {
	// Mock shared note data
	const note = {
		id: params.id,
		title: "沖縄家族旅行",
		destination: "沖縄",
		departureDate: "2024-08-15",
		returnDate: "2024-08-20",
		description:
			"家族4人での沖縄旅行。子供たちは初めての沖縄なので楽しみにしています。",
		owner: "田中花子",
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

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center space-x-2">
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
						<Badge variant="outline">共有ページ</Badge>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Title Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{note.title}
					</h1>
					<div className="flex items-center space-x-6 text-gray-600 mb-4">
						<div className="flex items-center">
							<User className="h-4 w-4 mr-1" />
							{note.owner}さんのLeaveNote
						</div>
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
						<p className="text-gray-700 bg-blue-50 p-4 rounded-md border border-blue-200">
							{note.description}
						</p>
					)}
				</div>

				<div className="space-y-8">
					{/* Status Alert */}
					<Card className="bg-yellow-50 border-yellow-200">
						<CardContent className="pt-6">
							<div className="flex items-center">
								<Clock className="h-5 w-5 text-yellow-600 mr-2" />
								<span className="font-medium text-yellow-800">
									{note.owner}さんは現在旅行中です（{note.departureDate} 〜{" "}
									{note.returnDate}）
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Progress Overview */}
					<Card>
						<CardHeader>
							<CardTitle>出発前の準備状況</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-gray-600">完了状況</span>
								<span className="text-sm font-medium">
									{completedCount}/{totalCount}
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-blue-600 h-2 rounded-full transition-all duration-300"
									style={{
										width: `${Math.round((completedCount / totalCount) * 100)}%`,
									}}
								></div>
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
								緊急時や重要な連絡がある場合は、こちらに連絡してください
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
															className="hover:text-blue-600 font-medium"
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

					{/* Requests for You */}
					<Card>
						<CardHeader>
							<CardTitle>あなたへのお願い</CardTitle>
							<CardDescription>
								{note.owner}さんからのお願い事項です
							</CardDescription>
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
											<p className="text-gray-700 bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
												{request.request}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Checklist for Reference */}
					<Card>
						<CardHeader>
							<CardTitle>出発前チェックリスト（参考）</CardTitle>
							<CardDescription>
								{note.owner}さんが準備していた項目です
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{note.checklist.map((item) => (
									<div key={item.id} className="flex items-center space-x-3">
										<CheckCircle
											className={`h-4 w-4 ${item.completed ? "text-green-600" : "text-gray-300"}`}
										/>
										<span
											className={`flex-1 ${item.completed ? "line-through text-gray-500" : ""}`}
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

					{/* Footer Message */}
					<Card className="bg-blue-50 border-blue-200">
						<CardContent className="pt-6 text-center">
							<p className="text-blue-800 mb-2">
								このLeaveNoteは{note.owner}
								さんが安心して旅行を楽しむために作成されました。
							</p>
							<p className="text-sm text-blue-600">
								ご協力いただき、ありがとうございます。
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
