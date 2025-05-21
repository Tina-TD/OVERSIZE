// D:\Shop\oversize\shared\components\shared\profile\orders-list.tsx
'use client';

import React from 'react';
import { OrderWithParsedItems } from '@/app/actions';
import { OrderItem } from './order-item';

interface OrdersListProps {
  orders: OrderWithParsedItems[]; // Список отсортирован: самый новый заказ в orders[0]
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-500">Заказов не найдено.</p>;
  }

  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      {orders.map((order, index) => (
        <OrderItem
          key={order.id}
          order={order}
          // Самый старый заказ (последний в массиве orders) получит displayId = 1
          // Самый новый заказ (первый в массиве orders) получит displayId = totalOrders
          displayOrderNumber={totalOrders - index}
        />
      ))}
    </div>
  );
};