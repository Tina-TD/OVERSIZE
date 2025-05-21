// D:\Shop\oversize\app\api\checkout\callback\route.ts
import { PaymentCallbackData } from '@/@types/yookassa'; // Убедитесь, что этот тип актуален для вашей платежной системы
import { prisma } from '@/prisma/prisma-client';
import { OrderSuccessTemplate, OrderStoredItemForEmail } from '@/shared/components/shared/email-temapltes/order-success';
import { sendEmail } from '@/shared/lib';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Интерфейс для элемента, как он сохранен в Order.items (JSON)
// Адаптируйте его под точную структуру ваших userCart.items,
// которую вы видите в логе JSON.stringify(userCart.items) при создании заказа.
interface StoredCartItem {
  id: number; // ID элемента корзины (CartItem.id)
  quantity: number;
  product: {
    id: number; // ID продукта (Product.id)
    name: string;
    price: number;
    imageUrl?: string; // Если это поле есть в userCart.items[].product
    // ... другие поля продукта, которые вы сохраняете в JSON ...
  };
  sizes?: Array<{ // Массив размеров, если они сохраняются для каждого CartItem
    id: number;
    name: string;
    // ... другие поля размера ...
  }>;
  // ... другие поля элемента корзины, если они сохраняются в JSON ...
}


export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Checkout Callback START] Received POST request.`);

  try {
    const body = (await req.json()) as PaymentCallbackData;
    console.log(`[${timestamp}] [Checkout Callback BODY] Request body:`, JSON.stringify(body, null, 2));

    if (!body.object || !body.object.metadata || !body.object.metadata.order_id) {
      console.error(`[${timestamp}] [Checkout Callback ERROR] Missing order_id in metadata.`);
      return NextResponse.json({ error: 'Missing order_id in metadata' }, { status: 400 });
    }

    const orderIdFromMetadata = Number(body.object.metadata.order_id);
    if (isNaN(orderIdFromMetadata)) {
      console.error(`[${timestamp}] [Checkout Callback ERROR] Invalid order_id in metadata:`, body.object.metadata.order_id);
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }
    console.log(`[${timestamp}] [Checkout Callback INFO] Extracted order_id: ${orderIdFromMetadata}`);

    const order = await prisma.order.findFirst({
      where: {
        id: orderIdFromMetadata,
      },
    });

    if (!order) {
      console.error(`[${timestamp}] [Checkout Callback ERROR] Order not found with ID: ${orderIdFromMetadata}. Acknowledging callback.`);
      return NextResponse.json({ success: true, message: 'Order not found, callback acknowledged' }, { status: 200 });
    }
    console.log(`[${timestamp}] [Checkout Callback INFO] Found order ID: ${order.id}, Current DB status: ${order.status}`);

    const paymentStatusFromCallback = body.object.status;
    console.log(`[${timestamp}] [Checkout Callback INFO] Payment status from Yookassa: ${paymentStatusFromCallback}`);

    const isSucceeded = paymentStatusFromCallback === 'succeeded';
    const isCancelled = paymentStatusFromCallback === 'canceled' || paymentStatusFromCallback === 'cancelled';

    console.log(`[${timestamp}] [Checkout Callback INFO] Calculated flags: isSucceeded=${isSucceeded}, isCancelled=${isCancelled}`);

    if (order.status === OrderStatus.PENDING) {
      console.log(`[${timestamp}] [Checkout Callback INFO] Order ID: ${order.id} is PENDING. Proceeding with status update logic.`);
      let newStatus: OrderStatus = order.status;
      if (isSucceeded) {
        newStatus = OrderStatus.SUCCEEDED;
        console.log(`[${timestamp}] [Checkout Callback INFO] Setting newStatus to SUCCEEDED for order ID: ${order.id}`);
      } else if (isCancelled) {
        newStatus = OrderStatus.CANCELLED;
        console.log(`[${timestamp}] [Checkout Callback INFO] Setting newStatus to CANCELLED for order ID: ${order.id}`);
      } else {
        console.log(`[${timestamp}] [Checkout Callback INFO] Payment status '${paymentStatusFromCallback}' is not 'succeeded' or 'canceled'. Status will not be changed from PENDING.`);
      }

      if (newStatus !== order.status) {
        try {
          console.log(`[${timestamp}] [Checkout Callback INFO] Attempting to update order ID: ${order.id} to status: ${newStatus}`);
          await prisma.order.update({
            where: { id: order.id },
            data: { status: newStatus },
          });
          console.log(`[${timestamp}] [Checkout Callback SUCCESS] Order ID: ${order.id} status successfully updated to: ${newStatus} in DB.`);

          if (newStatus === OrderStatus.SUCCEEDED) {
            console.log(`[${timestamp}] [Checkout Callback INFO] Order ID: ${order.id} is SUCCEEDED. Attempting to send email.`);
            if (!order.items || typeof order.items !== 'string') {
               console.error(`[${timestamp}] [Checkout Callback ERROR] order.items is missing or not a string for order ID: ${order.id}`);
            } else {
              try {
                console.log(`[${timestamp}] [Checkout Callback INFO] Parsing items for email for order ID: ${order.id}. Raw items:`, order.items);

                // Парсим JSON, ожидая массив объектов типа StoredCartItem
                const rawParsedItems: StoredCartItem[] = JSON.parse(order.items);

                // Теперь преобразуем rawParsedItems в OrderStoredItemForEmail
                const parsedItemsForEmail: OrderStoredItemForEmail[] = rawParsedItems.map((item: StoredCartItem) => ({
                  id: item.id, // id из элемента корзины
                  product: {
                    name: item.product.name,
                    price: item.product.price,
                  },
                  quantity: item.quantity,
                }));
                console.log(`[${timestamp}] [Checkout Callback INFO] Parsed items for email for order ID: ${order.id}:`, JSON.stringify(parsedItemsForEmail));

                console.log(`[${timestamp}] [Checkout Callback INFO] Attempting to send email to: ${order.email} for order ID: ${order.id}`);
                await sendEmail(
                  order.email,
                  'OVERSIZE / Ваш заказ успешно оформлен 🎉',
                  OrderSuccessTemplate({ orderId: order.id, items: parsedItemsForEmail })
                );
                console.log(`[${timestamp}] [Checkout Callback SUCCESS] Success email sent for order ID: ${order.id}`);
              } catch(emailError) {
                console.error(`[${timestamp}] [Checkout Callback ERROR] Error parsing items or sending email for order ID: ${order.id}`, emailError);
              }
            }
          } else if (newStatus === OrderStatus.CANCELLED) {
            console.log(`[${timestamp}] [Checkout Callback INFO] Order ID: ${order.id} was cancelled. No email sent in this flow.`);
          }
        } catch (dbUpdateError) {
          console.error(`[${timestamp}] [Checkout Callback ERROR] Error updating order status in DB for order ID: ${order.id}`, dbUpdateError);
        }
      } else {
        console.log(`[${timestamp}] [Checkout Callback INFO] Order ID: ${order.id} status was not changed from PENDING because newStatus is same or payment status was not final.`);
      }
    } else {
      console.log(`[${timestamp}] [Checkout Callback INFO] Order ID: ${order.id} already has final status: ${order.status}. Ignoring callback.`);
    }

    console.log(`[${timestamp}] [Checkout Callback END] Callback processed for order ID: ${order.id}. Returning 200 OK.`);
    return NextResponse.json({ success: true, message: 'Callback processed' }, { status: 200 });

  } catch (error) {
    console.error(`[${timestamp}] [Checkout Callback FATAL ERROR] Uncaught error:`, error);
    return NextResponse.json({ success: false, message: 'Internal server error during callback' }, { status: 200 });
  }
}