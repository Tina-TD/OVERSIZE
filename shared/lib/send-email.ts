// D:\Shop\oversize\shared\lib\send-email.ts
import { Resend } from 'resend';
import React from 'react';

export const sendEmail = async (
  to: string,
  subject: string,
  template: React.ReactElement // Изменили тип с ReactNode на ReactElement
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    text: subject, // Добавили fallback для текстовой версии
    react: template,
  });

  if (error) throw error;
  return data;
};