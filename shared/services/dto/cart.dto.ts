import { Cart, CartItem, Product, Size } from '@prisma/client';

// CartItemDTO теперь включает selected sizes на уровне CartItem
export type CartItemDTO = CartItem & {
  product: Product & { // product включает все доступные размеры
    sizes: Size[];
  };
  sizes: Size[]; // CartItem включает выбранные размеры
};

export interface CartDTO extends Cart {
  items: CartItemDTO[];
}

export interface CreateCartItemValues {
  productId: number;
  // Добавляем количество (опционально) и ID выбранных размеров
  quantity?: number; // Опционально, если 1 по умолчанию
  sizeIds: number[]; // ID выбранных размеров для этого товара в корзине
}