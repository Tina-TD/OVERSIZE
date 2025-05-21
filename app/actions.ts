'use server';

import { prisma } from '@/prisma/prisma-client';

import { CheckoutFormValues } from '@/shared/constants';
import { createPayment, sendEmail } from '@/shared/lib';
import { getUserSession } from '@/shared/lib/get-user-session';
import { OrderStatus, Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { cookies } from 'next/headers';
import { PayOrderTemplate, VerificationUserTemplate } from '@/shared/components/shared';

// Определяем или импортируем стоимость доставки
const DELIVERY_PRICE = 1250; // Если эта константа используется в других местах, лучше вынести ее
export async function createOrder(data: CheckoutFormValues) {
   try{
    const cookieStore = await cookies();
    const cartToken = cookieStore.get('cartToken')?.value;
    if (!cartToken) {
      throw new Error('Cart token not found');
    }

    const session = await getUserSession();
    console.log('[CreateOrder] User session:', session);

    const userCart = await prisma.cart.findFirst({
      where: { token: cartToken },
      // ... (includes для userCart)
       include: {
        user: true,
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            sizes: true,
            product: {
              include: {
                sizes: true,
                brand: true,
                color: true,
                type: true,
              },
            },
          },
        },
      },
    });

     if (!userCart) {
      throw new Error('Cart not found');
    }
    if (userCart?.totalAmount === 0) {
      throw new Error('Cart is empty');
    }
      // Рассчитываем ОБЩУЮ СУММУ ЗАКАЗА, включая доставку
    const finalTotalAmount = userCart.totalAmount + DELIVERY_PRICE;
    console.log(`[CreateOrder] Cart total: ${userCart.totalAmount}, Delivery: ${DELIVERY_PRICE}, Final total: ${finalTotalAmount}`);

    const orderData: Prisma.OrderCreateInput = {
      token: cartToken,
      fullName: data.firstName + ' ' + data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      comment: data.comment,
      totalAmount: finalTotalAmount,
      status: OrderStatus.PENDING,
      items: JSON.stringify(userCart.items),
      // Если пользователь авторизован, связываем заказ с ним
      ...(session?.id && { // Используем spread operator для условного добавления свойства
        user: {
          connect: {
            id: Number(session.id),
          },
        },
      }),
    };
    console.log('[CreateOrder] Order data to be created:', JSON.stringify(orderData, null, 2));



    const order = await prisma.order.create({
      data: orderData,
    });
    console.log('[CreateOrder] Order created with ID:', order.id, 'and userId:', order.userId); // Лог для отладки
    /* Очищаем корзину */
    await prisma.cart.update({
      where: {
        id: userCart.id,
      },
      data: {
        totalAmount: 0,
      },
    });

    await prisma.cartItem.deleteMany({
      where: {
        cartId: userCart.id,
      },
    });

    const paymentData = await createPayment({
      amount: order.totalAmount,
      orderId: order.id,
      description: 'Оплата заказа #' + order.id,
    });

    if (!paymentData) {
      throw new Error('Payment data not found');
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentId: paymentData.id,
      },
    });

    const paymentUrl = paymentData.confirmation.confirmation_url;

    await sendEmail(
      data.email,
      'OVERSIZE / Оплатите заказ #' + order.id,
      PayOrderTemplate(
        {
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentUrl,
        }
    ),
    );

    return paymentUrl;
  } catch (err) {
      console.error('[CreateOrder] Server error', err); // Изменено на console.error для лучшего логирования
    // Можно выбросить ошибку дальше, чтобы обработать на клиенте
    // throw err;
    // Или вернуть null/undefined/спецобъект ошибки
    return null;
  }
}

export async function updateUserInfo(body: Prisma.UserUpdateInput) {
  try {
    const currentUser = await getUserSession();

    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: Number(currentUser.id),
      },
    });

    await prisma.user.update({
      where: {
        id: Number(currentUser.id),
      },
      data: {
        fullName: body.fullName,
        email: body.email,
        password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
      },
    });
  } catch (err) {
    console.log('Error [UPDATE_USER]', err);
    throw err;
  }
}

export async function registerUser(body: Prisma.UserCreateInput) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (user) {
      if (!user.verified) {
        throw new Error('Почта не подтверждена');
      }

      throw new Error('Пользователь уже существует');
    }

    const createdUser = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        password: hashSync(body.password, 10),
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        code,
        userId: createdUser.id,
      },
    });

    await sendEmail(
      createdUser.email,
      'OVERSIZE / 📝 Подтверждение регистрации',
      VerificationUserTemplate({
        code,
      }),
    );
  } catch (err) {
    console.log('Error [CREATE_USER]', err);
    throw err;
  }
}
export interface OrderStoredItem {
  id: number; // ID элемента корзины (CartItem)
  name: string; // Название продукта из CartItem.product.name
  imageUrl: string; // URL изображения продукта из CartItem.product.imageUrl
  price: number; // Цена за единицу продукта из CartItem.product.price
  quantity: number;
  sizes: { name: string }[]; // Пример: [{ name: 'M' }, { name: 'L' }]
  // productId: number; // Можно добавить ID самого продукта
}

// Добавляем тип для заказа, который будет использоваться на клиенте
// Order из @prisma/client плюс распарсенные items
export type OrderWithParsedItems = Omit<Prisma.OrderGetPayload<{
  include: { user: true } // Указываем, что user должен быть включен
}>, 'items'> & {
  items: OrderStoredItem[];
};
interface ItemSize { // <--- ДОБАВЬТЕ ЭТОТ ИНТЕРФЕЙС
  name: string;
  // добавьте другие поля, если они есть и используются, например id
  // id?: number;
}
export async function getUserOrders(): Promise<OrderWithParsedItems[]> {
  try {
    const currentUser = await getUserSession();
 console.log('actions.ts => getUserOrders: currentUser:', currentUser); // <--- ОТЛАДКА

    if (!currentUser?.id) {
      console.error('actions.ts => getUserOrders: User not authenticated or ID missing');
      return [];
    }
console.log('actions.ts => getUserOrders: Fetching orders for userId:', Number(currentUser.id)); // <--- ОТЛАДКА
    const ordersFromDb = await prisma.order.findMany({ // Переименовал для ясности
      where: {
        userId: Number(currentUser.id),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { // << --- ВОТ ИЗМЕНЕНИЕ: ВКЛЮЧАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
        user: true,
      }
    });
 console.log('actions.ts => getUserOrders: ordersFromDb (raw from DB):', JSON.stringify(ordersFromDb, null, 2)); // <--- ОТЛАДКА (используем JSON.stringify для лучшего вывода)

    if (!ordersFromDb || ordersFromDb.length === 0) {
      console.log('actions.ts => getUserOrders: No orders found in DB for this user.');
      return []; // Возвращаем пустой массив, если ничего не найдено
    }
    // Теперь ordersFromDb будет содержать поле user для каждого заказа
     const ordersWithParsedItems: OrderWithParsedItems[] = ordersFromDb.map(order => {
      let parsedItems: OrderStoredItem[] = [];
      try {
        if (typeof order.items === 'string') {
          const itemsData = JSON.parse(order.items);
          if (Array.isArray(itemsData)) {
            parsedItems = itemsData.map(item => ({ // <--- Здесь `item` это элемент из JSON поля Order.items
              id: item.id,
              name: item.product.name,
              imageUrl: item.product.imageUrl,
              price: item.product.price,
              quantity: item.quantity,
              // Указываем тип для s
              sizes: item.sizes.map((s: ItemSize) => ({ name: s.name })), // <--- ИЗМЕНЕНИЕ: s: ItemSize
              // productId: item.product.id,
            }));
          } else {
            console.warn(`Order.items for order ${order.id} is not an array after parsing:`, itemsData);
          }
        } else if (order.items !== null) {
            console.warn(`Order.items for order ${order.id} is not a string:`, order.items);
        }
      } catch (e) {
         console.error(`actions.ts => getUserOrders: Failed to parse items for order ${order.id}:`, e);
          }
      return {
        ...order, // Теперь order содержит поле user, и присвоение будет корректным
        items: parsedItems,
      };
    });

    console.log('actions.ts => getUserOrders: ordersWithParsedItems (after parsing):', JSON.stringify(ordersWithParsedItems, null, 2)); // <--- ОТЛАДКА
    return ordersWithParsedItems;
  } catch (error) {
    console.error('actions.ts => getUserOrders: General error:', error);
    return [];
  }
}