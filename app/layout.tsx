import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "メディカルクチコミランキング | 全国のクリニックを地図で探す",
  description: "全国のクリニック情報を地図上で簡単に検索・確認。評価やレビュー数も一目で分かるメディカルクチコミランキングサービスです。",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.className} antialiased`} style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Kosugi Maru, sans-serif',
        backgroundColor: 'rgb(254, 246, 228)'
      }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgb(254, 246, 228)' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
