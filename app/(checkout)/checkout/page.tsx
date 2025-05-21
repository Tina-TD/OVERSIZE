// D:\Shop\oversize\app\(checkout)\checkout\page.tsx
'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  CheckoutSidebar,
  Container,
  Title,
  CheckoutAddressForm,
  CheckoutCart,
  CheckoutPersonalForm,
} from '@/shared/components/shared';
import { CheckoutFormValues, checkoutFormSchema } from '@/shared/constants';

import toast from 'react-hot-toast';
import React from 'react'; // Можно убрать React, если используется только JSX и хуки
import { useSession } from 'next-auth/react';
import { Api } from '@/shared/services/api-client';
import { useCart } from '@/shared/hooks';
import { createOrder } from '@/app/actions';

export default function CheckoutPage() {
  const [submitting, setSubmitting] = React.useState(false);
  const { totalAmount, updateItemQuantity, items, removeCartItem, loading } = useCart();
  const { data: session } = useSession();

  const form = useForm<CheckoutFormValues>({ // form объявлен здесь
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      comment: '',
    },
  });

  // Извлекаем setValue из form для использования в зависимостях
  const { setValue } = form;

  React.useEffect(() => {
    async function fetchUserInfo() {
      try { // Хорошей практикой будет добавить try...catch
        const data = await Api.auth.getMe();
        if (data && data.fullName) { // Добавим проверку на случай, если data или fullName могут быть undefined
          const names = data.fullName.split(' ');
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || ''; // Обработка случая, если нет фамилии или она из нескольких слов

          setValue('firstName', firstName);
          setValue('lastName', lastName);
          setValue('email', data.email || ''); // Убедимся, что email тоже не undefined
        }
      } catch (error) {
        console.error("Failed to fetch user info for form:", error);
        // Можно показать toast или другую индикацию ошибки
      }
    }

    if (session) {
      fetchUserInfo();
    }
  }, [session, setValue]); // <--- ДОБАВЛЕН setValue В МАССИВ ЗАВИСИМОСТЕЙ

  const onSubmit = async (data: CheckoutFormValues) => {
    // ... (ваш код onSubmit)
    try {
      setSubmitting(true);

      const url = await createOrder(data);

      // Используйте toast.success для успешных операций
      toast.success('Заказ успешно оформлен! 📝 Переход на оплату... ', {
        icon: '✅',
      });

      if (url) {
        window.location.href = url; // Используйте window.location.href для явного перехода
      } else {
        // Если URL не пришел, возможно, createOrder вернул null из-за ошибки
        setSubmitting(false); // Сбросить состояние загрузки
        toast.error('Не удалось получить ссылку на оплату. Попробуйте снова.', {
          icon: '❌',
        });
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setSubmitting(false);
      toast.error('Не удалось создать заказ', {
        icon: '❌',
      });
    }
  };

  const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
    const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
    updateItemQuantity(id, newQuantity);
  };

  return (
    <Container className="mt-10">
      <Title text="Оформление заказа" className="font-extrabold mb-8 text-[36px]" />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-10">
            {/* Левая часть */}
            <div className="flex flex-col gap-10 flex-1 mb-20">
              <CheckoutCart
                onClickCountButton={onClickCountButton}
                removeCartItem={removeCartItem}
                items={items}
                loading={loading}
              />
              <CheckoutPersonalForm className={loading ? 'opacity-40 pointer-events-none' : ''} />
              <CheckoutAddressForm className={loading ? 'opacity-40 pointer-events-none' : ''} />
            </div>

            {/* Правая часть */}
            <div className="w-[450px]">
              <CheckoutSidebar totalAmount={totalAmount} loading={loading || submitting} />
            </div>
          </div>
        </form>
      </FormProvider>
    </Container>
  );
}