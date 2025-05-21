'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { Button } from '../ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CartDrawerItem } from './cart-drawer-item';
import { getCartItemDetails } from '@/shared/lib';
import { Title } from './title';
import { cn } from '@/shared/lib/utils';
import { useCart } from '@/shared/hooks/use-cart';

const pluralizeItems = (count: number): string => {
  if (count === 0) return 'товаров';
  if (count === 1) return 'товар';
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'товаров';
  if (lastDigit >= 2 && lastDigit <= 4) return 'товара';
  return 'товаров';
};

export const CartDrawer: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { totalAmount, updateItemQuantity, items, removeCartItem } = useCart();
  const [redirecting, setRedirecting] = React.useState(false);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemWord = pluralizeItems(totalQuantity);

  const onClickCountButton = (id: number, qty: number, type: 'plus' | 'minus') => {
    const newQty = type === 'plus' ? qty + 1 : qty - 1;
    if (newQty >= 1) updateItemQuantity(id, newQty);
    else console.warn('Quantity cannot be less than 1.');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="flex flex-col justify-between pb-0 bg-[#f2f2f2]">
        <SheetHeader>
          <SheetTitle hidden={totalQuantity === 0}>
            {totalQuantity > 0 ? (
              <>В корзине <span className="font-bold">{totalQuantity} {itemWord}</span></>
            ) : (
              'Корзина'
            )}
          </SheetTitle>
        </SheetHeader>

        {totalQuantity > 0 ? (
          <div className={cn('flex flex-col h-full')}>
            <div className="-mx-6 mt-5 overflow-auto flex-1">
              {items.map(item => (
                <div key={item.id} className="mb-2">
                  <CartDrawerItem
                    id={item.id}
                    imageUrl={item.imageUrl}
                    details={getCartItemDetails(item.sizes)}
                    disabled={item.disabled}
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                    onClickCountButton={type => onClickCountButton(item.id, item.quantity, type)}
                    onClickRemove={() => removeCartItem(item.id)}
                  />
                </div>
              ))}
            </div>

            <SheetFooter className="-mx-6 bg-white p-8">
              <div className="w-full">
                <div className="flex mb-4">
                  <span className="flex flex-1 text-lg text-neutral-500">
                    Итого
                    <div className="flex-1 border-b border-dashed border-b-neutral-200 relative -top-1 mx-2" />
                  </span>
                  <span className="font-bold text-lg">{totalAmount} ₽</span>
                </div>

                {/* Убираем <a>, прокидываем класс и onClick прямо в Link */}
                <Link
                  href="/checkout"
                  className="w-full block"
                  onClick={() => setRedirecting(true)}
                >
                  <Button
                    loading={redirecting}
                    type="submit"
                    className="w-full h-12 text-base"
                  >
                    Оформить заказ
                    <ArrowRight className="w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </SheetFooter>
          </div>
        ) : (
          <div className={cn('flex flex-col h-full justify-center items-center w-72 mx-auto')}>
            <Image src="/images/empty-box.png" alt="Empty cart" width={120} height={120} />
            <Title size="sm" text="Корзина пустая" className="text-center font-bold my-2" />
            <p className="text-center text-neutral-500 mb-5">
              Добавьте хотя бы один товар, чтобы совершить заказ
            </p>
            <SheetClose asChild>
              <Button className="w-56 h-12 text-base" size="lg">
                <ArrowLeft className="w-5 mr-2" />
                Вернуться назад
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
