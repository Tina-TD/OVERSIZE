// app/(root)/TopBarClient.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'qs';
import { TopBar } from '@/shared/components/shared/top-bar';
import type { Category } from '@prisma/client';

interface Props {
  categories: Category[];
  sortBy: string; // Проп остается
}

export const TopBarClient: React.FC<Props> = ({ categories, sortBy }) => { // Проп принимается
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortByParam = searchParams.get('sortBy') as string | null;

  // Используем sortByParam если он есть, иначе используем проп sortBy,
  // и только если его нет - 'new' (хотя если sortBy обязательный проп, то до 'new' не дойдет)
  const currentSortValue = sortByParam || sortBy || 'new';

  const handleSort = (val: string) => {
    const qp = qs.parse(searchParams.toString(), { ignoreQueryPrefix: true });
    qp.sortBy = val;
    const query = qs.stringify(qp, { arrayFormat: 'comma' });
    router.push(`/?${query}`);
  };

  return (
    <TopBar
      categories={categories}
      sortBy={currentSortValue} // Передаем вычисленное значение
      onSortChange={handleSort}
    />
  );
};