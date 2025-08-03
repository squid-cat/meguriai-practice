import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
	title: "LeaveNote - 旅行前の不安を安心に変える",
	description: "旅行前の準備と緊急時の情報をまとめて共有できるWebサービス",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<head>
				<style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
			</head>
			<body>
				<AuthProvider>
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
