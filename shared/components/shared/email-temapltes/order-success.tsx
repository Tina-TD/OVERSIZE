// D:\Shop\oversize\shared\components\shared\email-temapltes\order-success.tsx
import React, { JSX } from 'react'; // JSX здесь не используется напрямую, можно убрать

export interface OrderStoredItemForEmail {
  id: number;
  product: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Props {
  orderId: number;
  items: OrderStoredItemForEmail[];
}

// Изменяем объявление компонента
export function OrderSuccessTemplate({ orderId, items }: Props): JSX.Element {
  return (
    <div>
      <h1>Спасибо за покупку! 🎉</h1>
      <p>Ваш заказ #{orderId} оплачен. Список товаров:</p>
      <hr />
      {items && items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.product.name} | {item.product.price} ₽ x {item.quantity} шт. ={' '}
              {item.product.price * item.quantity} ₽
            </li>
          ))}
        </ul>
      ) : (
        <p>Информация о товарах в заказе недоступна.</p>
      )}
    </div>
  );
}