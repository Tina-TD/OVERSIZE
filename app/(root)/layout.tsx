// D:\Shop\oversize\app\(root)\layout.tsx
import type { Metadata } from "next";
import { Header } from "@/shared/components/shared/header";
import { Suspense } from 'react'; // 1. Импортируем Suspense

export const metadata: Metadata = {
  title: "oveRSize",
  description: "Магазин женской одежды oveRSize",
};

// 2. (Опционально) Создаем простую заглушку для Header
const HeaderFallback = () => (
  <header className="border-b">
    <div className="flex items-center justify-between py-8 h-[101px] animate-pulse bg-gray-200 dark:bg-gray-700">
      {/* Можно добавить сюда простой макет хедера, если хотите */}
    </div>
  </header>
);

export default function HomeLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      {/* 3. Оборачиваем Header в Suspense */}
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      {children}
      {modal}
    </main>
  );
}