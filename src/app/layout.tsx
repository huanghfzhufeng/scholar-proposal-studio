import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '校研智申 MVP',
  description: '校内科研人员 AI 国自然申请书生成系统 Demo'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
