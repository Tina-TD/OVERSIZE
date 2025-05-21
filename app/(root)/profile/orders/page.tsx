// D:\Shop\oversize\app\(root)\profile\orders\page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getUserSession } from '@/shared/lib/get-user-session';
import { getUserOrders, OrderWithParsedItems } from '@/app/actions';
import { Container } from '@/shared/components/shared/container';
import { Title } from '@/shared/components/shared/title';
import { OrdersList } from '@/shared/components/shared/profile/orders-list'; // Убедитесь, что этот путь корректен

// D:\Shop\oversize\app\(root)\profile\orders\page.tsx
// ...
export default async function MyOrdersPage() {
  const session = await getUserSession();
  console.log('orders/page.tsx => MyOrdersPage: session:', session); // <--- ОТЛАДКА

  if (!session) {
    console.log('orders/page.tsx => MyOrdersPage: No session, redirecting.');
    return redirect('/not-auth');
  }

  let orders: OrderWithParsedItems[] = [];
  try {
    console.log('orders/page.tsx => MyOrdersPage: Calling getUserOrders...');
    orders = await getUserOrders();
    console.log('orders/page.tsx => MyOrdersPage: Orders received on page:', JSON.stringify(orders, null, 2)); // <--- ОТЛАДКА
  } catch (error) {
    // Этот catch сработает только если getUserOrders выбросит ошибку,
    // а мы изменили его, чтобы он возвращал [] в случае ошибки.
    console.error("orders/page.tsx => MyOrdersPage: Failed to load orders for page:", error);
  }

  return (
    <Container className="my-10">
      <Title text="Мои заказы" size="lg" className="font-bold mb-8" />
      {orders.length > 0 ? (
        <OrdersList orders={orders} />
      ) : (
        <p>У вас пока нет заказов.</p> // <--- Добавим маркер для ясности
      )}
    </Container>
  );
}