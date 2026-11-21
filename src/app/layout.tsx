import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Академия Знаний «AURA» — Премиальный учебный центр",
  description: "Подготовка к ЕГЭ, ОГЭ и олимпиадам по математике, английскому языку и информатике. 96.8% поступление на бюджет, экспертные преподаватели, мини-группы в Москве.",
  keywords: "учебный центр, курсы математики, курсы английского, курсы информатики, подготовка к ЕГЭ, ОГЭ, олимпиады, репетитор Москва",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
