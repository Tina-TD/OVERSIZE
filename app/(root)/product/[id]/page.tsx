
import { prisma } from '@/prisma/prisma-client';
import { notFound } from 'next/navigation';
import {  Container, ProductForm, } from '@/shared/components/shared';


export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // дождёмся распаковки async params
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    console.error('Invalid product ID:', id);
    return notFound();
  }

  const product = await prisma.product.findFirst({
    where: { id: Number(id) },
    include: {
      sizes: true,
      brand: true,
      color: true,
      type: true,
      category: {
        include: {
          products: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return notFound();
  }
  
  return (
    <Container className="flex flex-col my-10">
  <ProductForm product={product}></ProductForm>
    </Container>
  );
}
