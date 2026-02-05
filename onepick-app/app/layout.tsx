import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OnePick - 季度 One-Pick 投票系统',
  description: '一个以订单号为唯一凭证、按季度运行的 one-pick 投票系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
