// D:\Shop\oversize\app\(root)\@modal\(.)product\[id]\page.tsx
import { prisma } from '@/prisma/prisma-client';
import { notFound } from 'next/navigation';
import { ChooseProductModal } from '@/shared/components/shared';

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // дождёмся реальных параметров
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    console.error('Invalid product ID received:', id);
    return notFound();
  }

  const product = await prisma.product.findFirst({
    where: { id: productId },
    include: {
      sizes: true,
      brand: true,
      color: true,
      category: true,
      type: true,
    },
  });

  if (!product) {
    return notFound();
  }

  return <ChooseProductModal product={product} />;
}
