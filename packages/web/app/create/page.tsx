"use client";

import { Plus, Save, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface ChecklistItem {
	id: string;
	text: string;
	completed: boolean;
}

interface EmergencyContact {
	id: string;
	name: string;
	relationship: string;
	phone: string;
	email: string;
}

interface RequestItem {
	id: string;
	person: string;
	request: string;
	priority: "low" | "medium" | "high";
}

export default function CreateNotePage() {
	const [basicInfo, setBasicInfo] = useState({
		title: "",
		destination: "",
		departureDate: "",
		returnDate: "",
		description: "",
	});

	const [checklist, setChecklist] = useState<ChecklistItem[]>([
		{ id: "1", text: "エアコンの電源を切る", completed: false },
		{ id: "2", text: "ガスの元栓を確認する", completed: false },
		{ id: "3", text: "ゴミ出しをする", completed: false },
	]);

	const [emergencyContacts, setEmergencyContacts] = useState<
		EmergencyContact[]
	>([{ id: "1", name: "", relationship: "", phone: "", email: "" }]);

	const [requests, setRequests] = useState<RequestItem[]>([
		{ id: "1", person: "", request: "", priority: "medium" },
	]);

	const addChecklistItem = () => {
		const newItem: ChecklistItem = {
			id: Date.now().toString(),
			text: "",
			completed: false,
		};
		setChecklist([...checklist, newItem]);
	};

	const removeChecklistItem = (id: string) => {
		setChecklist(checklist.filter((item) => item.id !== id));
	};

	const updateChecklistItem = (id: string, text: string) => {
		setChecklist(
			checklist.map((item) => (item.id === id ? { ...item, text } : item)),
		);
	};

	const addEmergencyContact = () => {
		const newContact: EmergencyContact = {
			id: Date.now().toString(),
			name: "",
			relationship: "",
			phone: "",
			email: "",
		};
		setEmergencyContacts([...emergencyContacts, newContact]);
	};

	const removeEmergencyContact = (id: string) => {
		setEmergencyContacts(
			emergencyContacts.filter((contact) => contact.id !== id),
		);
	};

	const updateEmergencyContact = (
		id: string,
		field: keyof EmergencyContact,
		value: string,
	) => {
		setEmergencyContacts(
			emergencyContacts.map((contact) =>
				contact.id === id ? { ...contact, [field]: value } : contact,
			),
		);
	};

	const addRequest = () => {
		const newRequest: RequestItem = {
			id: Date.now().toString(),
			person: "",
			request: "",
			priority: "medium",
		};
		setRequests([...requests, newRequest]);
	};

	const removeRequest = (id: string) => {
		setRequests(requests.filter((request) => request.id !== id));
	};

	const updateRequest = (
		id: string,
		field: keyof RequestItem,
		value: string,
	) => {
		setRequests(
			requests.map((request) =>
				request.id === id ? { ...request, [field]: value } : request,
			),
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<Image src="/images/leavenote.png" alt="LeaveNote" width={60} height={40} />
						<span className="text-2xl font-bold text-blue-600">LeaveNote</span>
					</Link>
					<div className="space-x-2">
						<Button variant="outline">
							<Save className="h-4 w-4 mr-2" />
							下書き保存
						</Button>
						<Button>
							<Share2 className="h-4 w-4 mr-2" />
							作成して共有
						</Button>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						新しいLeaveNote
					</h1>
					<p className="text-gray-600">
						旅行前の準備と緊急時の情報をまとめましょう
					</p>
				</div>

				<div className="space-y-8">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>基本情報</CardTitle>
							<CardDescription>
								旅行の基本的な情報を入力してください
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title">タイトル</Label>
									<Input
										id="title"
										placeholder="例: 沖縄家族旅行"
										value={basicInfo.title}
										onChange={(e) =>
											setBasicInfo({ ...basicInfo, title: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="destination">行き先</Label>
									<Input
										id="destination"
										placeholder="例: 沖縄"
										value={basicInfo.destination}
										onChange={(e) =>
											setBasicInfo({
												...basicInfo,
												destination: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<div className="grid md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="departure">出発日</Label>
									<Input
										id="departure"
										type="date"
										value={basicInfo.departureDate}
										onChange={(e) =>
											setBasicInfo({
												...basicInfo,
												departureDate: e.target.value,
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="return">帰宅日</Label>
									<Input
										id="return"
										type="date"
										value={basicInfo.returnDate}
										onChange={(e) =>
											setBasicInfo({ ...basicInfo, returnDate: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">メモ</Label>
								<Textarea
									id="description"
									placeholder="旅行の詳細や特記事項があれば記入してください"
									value={basicInfo.description}
									onChange={(e) =>
										setBasicInfo({ ...basicInfo, description: e.target.value })
									}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Checklist */}
					<Card>
						<CardHeader>
							<CardTitle>やることリスト</CardTitle>
							<CardDescription>
								出発前にやっておくべきことをリストアップしましょう
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{checklist.map((item) => (
									<div key={item.id} className="flex items-center space-x-3">
										<Checkbox />
										<Input
											placeholder="やることを入力..."
											value={item.text}
											onChange={(e) =>
												updateChecklistItem(item.id, e.target.value)
											}
											className="flex-1"
										/>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => removeChecklistItem(item.id)}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								))}
								<Button
									variant="outline"
									onClick={addChecklistItem}
									className="w-full bg-transparent"
								>
									<Plus className="h-4 w-4 mr-2" />
									項目を追加
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Emergency Contacts */}
					<Card>
						<CardHeader>
							<CardTitle>緊急連絡先</CardTitle>
							<CardDescription>
								万が一の時の連絡先を登録しておきましょう
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{emergencyContacts.map((contact, index) => (
									<div key={contact.id}>
										{index > 0 && <Separator className="mb-4" />}
										<div className="grid md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>名前</Label>
												<Input
													placeholder="例: 田中太郎"
													value={contact.name}
													onChange={(e) =>
														updateEmergencyContact(
															contact.id,
															"name",
															e.target.value,
														)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label>続柄・関係</Label>
												<Input
													placeholder="例: 父親、隣人"
													value={contact.relationship}
													onChange={(e) =>
														updateEmergencyContact(
															contact.id,
															"relationship",
															e.target.value,
														)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label>電話番号</Label>
												<Input
													placeholder="例: 090-1234-5678"
													value={contact.phone}
													onChange={(e) =>
														updateEmergencyContact(
															contact.id,
															"phone",
															e.target.value,
														)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label>メールアドレス</Label>
												<Input
													placeholder="例: tanaka@example.com"
													value={contact.email}
													onChange={(e) =>
														updateEmergencyContact(
															contact.id,
															"email",
															e.target.value,
														)
													}
												/>
											</div>
										</div>
										{emergencyContacts.length > 1 && (
											<div className="flex justify-end mt-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeEmergencyContact(contact.id)}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													削除
												</Button>
											</div>
										)}
									</div>
								))}
								<Button
									variant="outline"
									onClick={addEmergencyContact}
									className="w-full bg-transparent"
								>
									<Plus className="h-4 w-4 mr-2" />
									連絡先を追加
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Requests */}
					<Card>
						<CardHeader>
							<CardTitle>お願いメモ</CardTitle>
							<CardDescription>
								家族や隣人にお願いしたいことを記録しましょう
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{requests.map((request, index) => (
									<div key={request.id}>
										{index > 0 && <Separator className="mb-4" />}
										<div className="space-y-4">
											<div className="grid md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label>お願いする人</Label>
													<Input
														placeholder="例: 隣人の佐藤さん"
														value={request.person}
														onChange={(e) =>
															updateRequest(
																request.id,
																"person",
																e.target.value,
															)
														}
													/>
												</div>
												<div className="space-y-2">
													<Label>優先度</Label>
													<select
														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
														value={request.priority}
														onChange={(e) =>
															updateRequest(
																request.id,
																"priority",
																e.target.value,
															)
														}
													>
														<option value="low">低</option>
														<option value="medium">中</option>
														<option value="high">高</option>
													</select>
												</div>
											</div>
											<div className="space-y-2">
												<Label>お願い内容</Label>
												<Textarea
													placeholder="例: 郵便受けの確認をお願いします。重要な書類が届く予定です。"
													value={request.request}
													onChange={(e) =>
														updateRequest(request.id, "request", e.target.value)
													}
												/>
											</div>
										</div>
										{requests.length > 1 && (
											<div className="flex justify-end mt-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeRequest(request.id)}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													削除
												</Button>
											</div>
										)}
									</div>
								))}
								<Button
									variant="outline"
									onClick={addRequest}
									className="w-full bg-transparent"
								>
									<Plus className="h-4 w-4 mr-2" />
									お願いを追加
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-4">
						<Link href="/dashboard">
							<Button variant="outline">キャンセル</Button>
						</Link>
						<Button variant="outline">
							<Save className="h-4 w-4 mr-2" />
							下書き保存
						</Button>
						<Button>
							<Share2 className="h-4 w-4 mr-2" />
							作成して共有
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
