// D:\Shop\oversize\shared\components\shared\profile-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormRegisterValues, formRegisterSchema } from './modals/auth-modal/forms/schemas'; // Убедитесь, что путь к схеме верный
import { User } from '@prisma/client';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import Link from 'next/link'; // <<--- ДОБАВЬТЕ ЭТОТ ИМПОРТ
import { Container } from './container';
import { Title } from './title';
import { FormInput } from './form';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';

interface Props {
  data: User;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
  const form = useForm({
    resolver: zodResolver(formRegisterSchema), // Убедитесь, что используется подходящая схема валидации для профиля
    defaultValues: {
      fullName: data.fullName || '',
      email: data.email || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: TFormRegisterValues) => { // Убедитесь, что тип values соответствует схеме
    try {
      // Схема formRegisterSchema ожидает confirmPassword, но updateUserInfo - нет.
      // Убедитесь, что передаете только нужные поля или используйте другую схему.
      // Для примера, передаем только нужные поля:
      await updateUserInfo({
        email: values.email,
        fullName: values.fullName,
        // Пароль обновляется только если он введен
        ...(values.password && { password: values.password }),
      });

      // Используйте toast.success для успешных операций
      toast.success('Данные обновлены 📝');
      form.reset({ // Сбрасываем форму, очищая поля паролей
        ...values,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Ошибка при обновлении данных', {
        icon: '❌',
      });
    }
  };

  const onClickSignOut = () => {
    signOut({
      callbackUrl: '/',
    });
  };

  return (
    <Container className="my-10">
      <Title text={`Личные данные`} size="md" className="font-bold" />
 
      <FormProvider {...form}>
        <form className="flex flex-col gap-5 w-96 mt-10" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="fullName" label="Полное имя" required />

          <FormInput type="password" name="password" label="Новый пароль" />
          <FormInput type="password" name="confirmPassword" label="Повторите пароль" />

          <Button loading={form.formState.isSubmitting} className="text-base mt-10" type="submit">
            Сохранить
          </Button>
     {/* Кнопка "Мои заказы" */}
          <Link href="/profile/orders" className="flex flex-col gap-5 w-96 "  >
            <Button variant="outline" className="text-base" type="button">
              Мои заказы
            </Button>
          </Link>
      

          <Button
            onClick={onClickSignOut}
            variant="secondary"
            disabled={form.formState.isSubmitting}
            className="text-base"
            type="button">
            Выйти
          </Button>

        
        </form>
      </FormProvider>
    </Container>
  );
};