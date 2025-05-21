import { CartDTO, CartItemDTO } from '../services/dto/cart.dto'; // Убедись, что импортируешь CartItemDTO
import { calcCartItemTotalPrice } from './calc-cart-item-total-price';
import { Size } from '@prisma/client'; // Возможно, понадобится импорт Size для типа

export type CartStateItem = {
  id: number;
  quantity: number;
  name: string;
  imageUrl: string;
  price: number; // Цена одного товара без учета количества
  disabled?: boolean;
  // ИСПРАВЛЕНО: sizes теперь отражает ВЫБРАННЫЕ размеры для этого конкретного CartItem
  sizes: Array<{ id: number; name: string; }>; // Используем более полный тип, возможно { id, name } или просто Array<Size>
  // Если нужно показать доступные размеры продукта, добавь:
  // availableSizes: Array<{ id: number; name: string; }>;
};

interface ReturnProps {
  items: CartStateItem[];
  totalAmount: number; // Общая сумма корзины (приходит из бэкенда)
}

export const getCartDetails = (data: CartDTO): ReturnProps => {
  const items = data.items.map((item: CartItemDTO) => { // Явно указываем тип item
    const itemPrice = item.product.price; // Цена единицы товара

    return {
      id: item.id,
      quantity: item.quantity,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      price: itemPrice, // Цена за единицу
      // Если нужна общая цена для этой позиции: totalPrice: item.quantity * itemPrice,

      // ИСПРАВЛЕНО: Доступ к ВЫБРАННЫМ размерам через item.sizes
      sizes: item.sizes.map((size) => ({
        id: size.id, // Включаем ID, может пригодиться
        name: size.name,
      })),

      disabled: false,
      // Если добавил availableSizes:
      // availableSizes: item.product.sizes.map(size => ({ id: size.id, name: size.name })),
    };
  }) as CartStateItem[]; // Приводим тип

  return {
    items,
    totalAmount: data.totalAmount, // Используем общую сумму из корзины
  };
};