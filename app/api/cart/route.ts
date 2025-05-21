// Файл: D:\Shop\oversize\app\api\cart\route.ts
import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { CreateCartItemValues } from '@/shared/services/dto/cart.dto';
import { updateCartTotalAmount } from '@/shared/lib/update-cart-total-amount';
import { findOrCreateCart } from '@/shared/lib/find-or-create-cart';
import { areSizeSetsEqual } from '@/shared/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('cartToken')?.value;

    if (!token) {
      return NextResponse.json({ totalAmount: 0, items: [] });
    }

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
            product: {
              include: { sizes: true }
            },
            sizes: true,
          },
        },
      },
    });

    if (!userCart) {
      return NextResponse.json({ totalAmount: 0, items: [] });
    }

    return NextResponse.json(userCart);
  } catch (error) {
    console.error('[CART_GET] Server error', error);
    return NextResponse.json({ message: 'Не удалось получить корзину' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('cartToken')?.value;

    if (!token) {
      token = crypto.randomUUID();
    }

    const userCart = await findOrCreateCart(token);
    const data = (await req.json()) as CreateCartItemValues;
    const { productId, quantity = 1, sizeIds = [] } = data;

    const existingCartItemsForProduct = await prisma.cartItem.findMany({
        where: {
            cartId: userCart.id,
            productId: productId,
        },
        include: {
            sizes: true,
        }
    });

    const findCartItem = existingCartItemsForProduct.find(item =>
         areSizeSetsEqual(item.sizes.map(s => s.id), sizeIds)
    );

    if (findCartItem) {
      await prisma.cartItem.update({
        where: {
          id: findCartItem.id,
        },
        data: {
          quantity: findCartItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: productId,
          quantity: quantity,
          sizes: {
            connect: sizeIds.map(id => ({ id })),
          },
        },
      });
    }

    const updatedUserCart = await updateCartTotalAmount(token);

    const resp = NextResponse.json(updatedUserCart);
    resp.cookies.set('cartToken', token, { path: '/', httpOnly: true, sameSite: 'lax' });
    return resp;
  } catch (error) {
    console.error('[CART_POST] Server error', error);
    return NextResponse.json({ message: 'Не удалось добавить товар в корзину' }, { status: 500 });
  }
}

// НЕКОРРЕКТНЫЙ DELETE ОБРАБОТЧИК, КОТОРЫЙ ВЫЗЫВАЛ ОШИБКУ, БЫЛ ЗДЕСЬ.
// ЕСЛИ ВАМ НУЖЕН DELETE ДЛЯ /api/cart (например, для очистки всей корзины),
// он должен быть реализован иначе, без ожидания { params: { id: string } }.
// Пример такого обработчика был в предыдущем ответе (закомментированный).

/*
// Пример DELETE для очистки всей корзины (если нужен):
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('cartToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Cart token not found' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { token },
      include: { items: true } // для удаления связанных cartItems
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Удаляем все CartItems, связанные с этой корзиной
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Обновляем totalAmount корзины на 0
    const updatedCart = await prisma.cart.update({
      where: { token },
      data: { totalAmount: 0 }, // Убедитесь, что у вас есть это поле или адаптируйте
      select: { // Возвращаем только необходимые данные
        id: true,
        token: true,
        totalAmount: true,
        items: true, // Будет пустым массивом
      }
    });
    
    // Можно также удалить cookie, если пользователь выходит или полностью очищает сессию
    // const response = NextResponse.json(updatedCart);
    // response.cookies.delete('cartToken');
    // return response;

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('[CART_CLEAR_ALL] Server error', error);
    return NextResponse.json({ message: 'Не удалось очистить корзину' }, { status: 500 });
  }
}
*/