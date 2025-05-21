// import { ProductSize } from '../constants/product'; // Не используется, можно удалить
import { CartStateItem } from './get-cart-details';
// import { Size } from '@prisma/client'; // Не нужно, если CartStateItem['sizes'] уже { name: string }

// Эта функция теперь получает массив *выбранных* размеров для элемента корзины.
// Логика объединения их имен остается прежней.
export const getCartItemDetails = (
  // Тип уже определен в CartStateItem, который теперь ссылается на item.sizes
  sizes: CartStateItem['sizes'],
): string => {
  // Проверяем на null/undefined и пустой массив
  if (!sizes || sizes.length === 0) {
      return ''; // Возвращаем пустую строку, если размеров нет
  }
  
  // map((size) => size.name) правильно извлекает имена из { id, name } или { name }
  return sizes.map((size) => size.name).join(', ');
};