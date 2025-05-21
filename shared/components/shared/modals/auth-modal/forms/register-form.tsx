// D:\Shop\oversize\shared\components\shared\modals\auth-modal\forms\register-form.tsx
'use client';

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { registerUser } from '@/app/actions';
import { TFormRegisterValues, formRegisterSchema } from './schemas';
import { FormInput } from '../../../form';
import { Button } from '@/shared/components/ui';

interface Props {
  onClose?: VoidFunction;
  onClickLogin?: VoidFunction;
}

export const RegisterForm: React.FC<Props> = ({ onClose, onClickLogin }) => {
  const form = useForm<TFormRegisterValues>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: TFormRegisterValues) => {
    try {
      await registerUser({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      // Изменено на toast.success
      toast.success('Регистрация успешна 📝. Подтвердите свою почту', {
        icon: '✅',
      });

      onClose?.();
    } catch (error: any) { // Явное указание типа error или any
      // Добавлена проверка на конкретное сообщение об ошибке
      if (error instanceof Error) {
        if (error.message === 'Пользователь уже существует') {
          toast.error('Такой пользователь уже зарегистрирован.', { icon: '🙋‍♂️' });
        } else if (error.message === 'Почта не подтверждена') {
          toast.error('Этот E-Mail уже используется, но почта не подтверждена.', { icon: '📧' });
        } else {
          // Общая ошибка для других случаев от registerUser
          toast.error(error.message || 'Ошибка регистрации. Попробуйте позже.', { icon: '❌' });
        }
      } else {
        // Неизвестная ошибка
        toast.error('Произошла неизвестная ошибка при регистрации.', { icon: '❌' });
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput name="email" label="E-Mail" required />
        <FormInput name="fullName" label="Полное имя" required />
        <FormInput name="password" label="Пароль" type="password" required />
        <FormInput name="confirmPassword" label="Подтвердите пароль" type="password" required />

        <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
          Зарегистрироваться
        </Button>
      </form>
    </FormProvider>
  );
};