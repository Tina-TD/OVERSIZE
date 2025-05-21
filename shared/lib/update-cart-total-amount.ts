import { prisma } from '@/prisma/prisma-client';
import { calcCartItemTotalPrice } from './calc-cart-item-total-price';

export const updateCartTotalAmount = async (token: string) => {
  const userCart = await prisma.cart.findFirst({
    where: {
      token,
    },
    include: {
      items: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: { // Включаем сам продукт
            include: { sizes: true }, // Включаем доступные размеры продукта
          },
          sizes: true, // ИСПРАВЛЕНО: Включаем выбранные размеры для этого элемента корзины
        },
      },
    },
  });
  if (!userCart) {
    return;
  }

  const totalAmount = userCart.items.reduce((acc, item) => {
    return acc + calcCartItemTotalPrice(item);
  }, 0);

  return await prisma.cart.update({
    where: {
      id: userCart.id,
    },
    data: {
      totalAmount,
    },
    include: {
      items: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: { // Включаем сам продукт
            include: { sizes: true }, // Включаем доступные размеры продукта
          },
          sizes: true, // ИСПРАВЛЕНО: Включаем выбранные размеры для этого элемента корзины
        },
      },
    },
  });
};
