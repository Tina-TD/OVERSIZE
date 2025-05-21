// D:\Shop\oversize\shared\components\shared\modals\auth-modal\forms\login-form.tsx
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormLoginValues, formLoginSchema } from './schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Title } from '../../../title';
import { FormInput } from '../../../form';
import { Button } from '@/shared/components/ui';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';

interface Props {
  onClose?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose }) => {
  const form = useForm<TFormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: TFormLoginValues) => {
    try {
      const resp = await signIn('credentials', {
        ...data,
        redirect: false, // Важно, чтобы не было перенаправления и мы могли обработать ответ
      });

      if (resp && !resp.ok) {
        // resp.error будет содержать сообщение из ошибки, выброшенной в authorize
        const errorMessage = resp.error || 'Не удалось войти в аккаунт. Попробуйте снова.';
        toast.error(errorMessage, {
          icon: '❌',
        });
        // console.error('Error [LOGIN_FAILED]', resp.error, resp); // Логируем детали ответа
        return; // Прерываем выполнение, если ошибка
      }

      // Если resp.ok === true или resp не определен (что не должно случиться при redirect: false, если нет сетевой ошибки)
      // Дополнительная проверка на случай, если signIn сам по себе выбросил ошибку, которая не попала в resp.error
      if (!resp || resp.error) { // Если resp.error есть, даже если ok каким-то образом true
        const fallbackError = (resp && resp.error) ? resp.error : 'Произошла неизвестная ошибка при входе.';
        toast.error(fallbackError, { icon: '❌' });
        console.error('Error [LOGIN_UNEXPECTED]', resp);
        return;
      }

      toast.success('Вы успешно вошли в аккаунт', {
        icon: '✅',
      });

      onClose?.();
    } catch (error: any) {
      // Этот catch обработает ошибки, если signIn сам по себе упадет (например, сетевая проблема)
      // или если мы что-то выбросим вручную выше.
      console.error('Error [LOGIN_SUBMIT_CATCH]', error);
      toast.error(error.message || 'Произошла ошибка при попытке входа. Пожалуйста, попробуйте позже.', {
        icon: '❌',
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center">
          <div className="mr-2">
            <Title text="Вход в аккаунт" size="md" className="font-bold" />
            <p className="text-gray-400">Введите свою почту, чтобы войти в свой аккаунт</p>
          </div>
          <img src="/images/phone-icon.png" alt="phone-icon" width={60} height={60} />
        </div>

        <FormInput name="email" label="E-Mail" required />
        <FormInput name="password" label="Пароль" type="password" required />

        <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
          Войти
        </Button>
      </form>
    </FormProvider>
  );
};