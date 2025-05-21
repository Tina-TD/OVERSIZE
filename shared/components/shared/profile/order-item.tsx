// D:\Shop\oversize\shared\components\shared\profile\order-item.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image'; // Убедитесь, что Image импортирован
import { OrderStatus } from '@prisma/client';
import { OrderWithParsedItems, OrderStoredItem } from '@/app/actions';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface OrderItemProps {
  order: OrderWithParsedItems;
  displayOrderNumber: number; // Новый пропс
}

// Вспомогательная функция для форматирования даты
const formatOrderDate = (dateString: Date): string => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: OrderStatus): { text: string; className: string } => {
  switch (status) {
    case OrderStatus.SUCCEEDED:
      return { text: 'Оплачено', className: 'bg-green-100 text-green-700' };
    case OrderStatus.CANCELLED:
      return { text: 'Отклонено', className: 'bg-red-100 text-red-700' };
    case OrderStatus.PENDING:
      return { text: 'В ожидании', className: 'bg-yellow-100 text-yellow-700' };
    default:
      return { text: 'Неизвестно', className: 'bg-gray-100 text-gray-700' };
  }
};


export const OrderItem: React.FC<OrderItemProps> = ({ order, displayOrderNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statusInfo = getStatusBadge(order.status);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={handleToggle}
      >
        <div>
          {/* Используем displayOrderNumber вместо order.id для отображения */}
          <h3 className="text-lg font-semibold">Заказ #{displayOrderNumber}</h3>
          <p className="text-sm text-gray-500">
            ID: {order.id} от {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full',
              statusInfo.className
            )}
          >
            {statusInfo.text}
          </span>
          {isOpen ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
        </div>
      </div>

      {/* Body (expandable) */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-4 mb-6">
            {order.items.length > 0 ? (
              order.items.map((item: OrderStoredItem, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <Image
                    src={item.imageUrl || '/placeholder-image.png'}
                    alt={item.name}
                    width={64}
                    height={80}
                    className="rounded object-cover w-16 h-20"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    {item.sizes && item.sizes.length > 0 && (
                       <p className="text-xs text-gray-500">
                         Размер: {item.sizes.map(s => s.name).join(', ')}
                       </p>
                    )}
                     <p className="text-xs text-gray-500">Кол-во: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {item.price * item.quantity} ₽
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Информация о товарах в этом заказе недоступна.</p>
            )}
          </div>
          <div className="flex justify-end items-center pt-4 border-t border-gray-200">
            <span className="text-md font-semibold">Итого: {order.totalAmount} ₽</span>
          </div>
        </div>
      )}
    </div>
  );
};