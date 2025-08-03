import {
	CheckCircle,
	Home,
	Plane,
	RotateCcw,
	Share2,
	Shield,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="border-b bg-white/80 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Image src="/images/leavenote.png" alt="LeaveNote" width={60} height={40} />
						<h1 className="text-2xl font-bold text-gray-900">LeaveNote</h1>
						<span className="text-sm text-gray-500">リーブノート</span>
					</div>
					<div className="space-x-4">
						<Link href="/dashboard">
							<Button variant="outline">ダッシュボード</Button>
						</Link>
						<Link href="/create">
							<Button>ノート作成</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 px-4">
				<div className="container mx-auto text-center max-w-4xl">
					<h2 className="text-5xl font-bold text-gray-900 mb-6">
						旅行前の不安を
						<span className="text-blue-600">安心</span>に変える
					</h2>
					<p className="text-xl text-gray-600 mb-8 leading-relaxed">
						「旅行中、何かあったとき、家族や友人は困らないだろうか？」
						<br />
						「出発前にやっておくべきこと、全部できたかな？」
						<br />
						<strong>LeaveNote</strong>
						は、そんな"やり残し"や"もしものとき"の不安を整理・共有する
						<br />
						Web完結型の安心ノートサービスです。
					</p>
					<div className="space-x-4">
						<Link href="/create">
							<Button size="lg" className="text-lg px-8 py-3">
								無料で始める
							</Button>
						</Link>
						<Link href="/demo">
							<Button
								variant="outline"
								size="lg"
								className="text-lg px-8 py-3 bg-transparent"
							>
								デモを見る
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 px-4 bg-white">
				<div className="container mx-auto max-w-6xl">
					<h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
						LeaveNoteの特徴
					</h3>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						<Card className="text-center">
							<CardHeader>
								<CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
								<CardTitle>Webだけで完結</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									IoTや外部デバイス不要。ブラウザだけで使えるシンプルな設計。
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<Share2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
								<CardTitle>簡単シェア</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									URLリンクで信頼できる人にだけ共有。パスワード保護や閲覧期限も設定可能。
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
								<CardTitle>不安の見える化</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									やり残しリスト・お願いメモ・緊急連絡情報を一元管理。
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<RotateCcw className="h-12 w-12 text-orange-600 mx-auto mb-4" />
								<CardTitle>事後の振り返り</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									旅行後の振り返り機能で次回に活かせる改善点を記録。
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Use Cases Section */}
			<section className="py-16 px-4 bg-gray-50">
				<div className="container mx-auto max-w-6xl">
					<h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
						こんな方におすすめ
					</h3>
					<div className="grid md:grid-cols-2 gap-8">
						<Card>
							<CardHeader>
								<Users className="h-8 w-8 text-blue-600 mb-2" />
								<CardTitle>30代〜40代の共働き家庭</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-gray-600">
									<li>• 子連れでの長期旅行前の準備が煩雑</li>
									<li>• 「やるべきこと」「お願いしたいこと」が多い</li>
									<li>• 万が一のときの連絡先を家族や隣人に伝えたい</li>
								</ul>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Home className="h-8 w-8 text-green-600 mb-2" />
								<CardTitle>一人暮らしの若年層（20〜30代）</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-gray-600">
									<li>• 実家帰省などで1週間以上家を空ける</li>
									<li>• 郵便や宅配、緊急対応に不安を感じている</li>
									<li>• 最小限の手間で自分のことを「託せる」仕組みが欲しい</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 px-4 bg-blue-600 text-white">
				<div className="container mx-auto text-center max-w-4xl">
					<h3 className="text-3xl font-bold mb-6">
						"行ってらっしゃい"をもっと自由に、もっと安心に
					</h3>
					<p className="text-xl mb-8 opacity-90">
						紙のメモでもない、チャットでもない。
						<br />
						LeaveNoteは外出中の"心の荷物"を軽くしてくれるWebツールです。
					</p>
					<Link href="/create">
						<Button size="lg" variant="secondary" className="text-lg px-8 py-3">
							今すぐ始める（無料）
						</Button>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-8 px-4">
				<div className="container mx-auto text-center">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<Plane className="h-6 w-6" />
						<span className="text-lg font-semibold">LeaveNote</span>
					</div>
					<p className="text-gray-400">
						© 2024 LeaveNote. 旅行前の不安を安心に変えるWebサービス
					</p>
				</div>
			</footer>
		</div>
	);
}
