// D:\Shop\oversize\shared\constants\auth-options.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/prisma/prisma-client';
import { compare, hashSync } from 'bcrypt';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          // Эта ошибка должна быть обработана валидацией формы на клиенте,
          // но на всякий случай добавим проверку и здесь.
          throw new Error('Пожалуйста, введите E-Mail и пароль.');
        }

        const findUser = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (!findUser) {
          throw new Error('Пользователь с таким E-Mail не зарегистрирован.');
        }

        const isPasswordValid = await compare(credentials.password, findUser.password);

        if (!isPasswordValid) {
          throw new Error('Неверный пароль.');
        }

        if (!findUser.verified) {
          // Можно добавить отдельное сообщение, если почта не подтверждена,
          // или оставить общее "Неверный пароль" / "Пользователь не найден",
          // чтобы не давать лишнюю информацию.
          // Для примера, сделаем явное сообщение:
          throw new Error('Ваш аккаунт не подтвержден. Проверьте почту.');
        }

        return {
          id: findUser.id,
          email: findUser.email,
          name: findUser.fullName,
          role: findUser.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'credentials') {
          // Для credentials провайдера, основная логика уже в authorize
          return true;
        }

        if (!user.email) {
          return false;
        }

        const findUser = await prisma.user.findFirst({
          where: {
            OR: [
              { provider: account?.provider, providerId: account?.providerAccountId },
              { email: user.email },
            ],
          },
        });

        if (findUser) {
          // Если пользователь найден, но вошел через другого OAuth провайдера ранее,
          // можно обновить данные или просто разрешить вход.
          // Здесь мы обновляем provider и providerId, если они изменились.
          if (findUser.provider !== account?.provider || findUser.providerId !== account?.providerAccountId) {
            await prisma.user.update({
              where: {
                id: findUser.id,
              },
              data: {
                provider: account?.provider,
                providerId: account?.providerAccountId,
                // Убедимся, что почта верифицирована при OAuth входе
                verified: findUser.verified || new Date(),
              },
            });
          }
          return true;
        }

        // Если пользователь не найден, создаем нового
        await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name || 'User-' + Date.now().toString().slice(-4), // Более уникальное имя по умолчанию
            password: hashSync(user.id?.toString() || Date.now().toString(), 10), // Пароль для OAuth не используется для входа, но поле обязательное
            verified: new Date(), // OAuth аккаунты считаем подтвержденными
            provider: account?.provider,
            providerId: account?.providerAccountId,
          },
        });

        return true;
      } catch (error) {
        console.error('Error [SIGNIN_CALLBACK]', error);
        return false; // В случае любой ошибки в этом коллбэке, запрещаем вход
      }
    },
    async jwt({ token }) {
      if (!token.email) {
        return token;
      }

      const findUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (findUser) {
        token.id = String(findUser.id);
        token.email = findUser.email; // Убедимся, что email актуален
        token.fullName = findUser.fullName;
        token.role = findUser.role;
        // token.verified = findUser.verified; // Можно добавить, если нужно в токен
      }

      return token;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string; // Приведение типа, т.к. id в токене строка
        session.user.role = token.role as any; // Используйте UserRole из Prisma, если определен тип
        // session.user.fullName = token.fullName as string; // Можно добавить, если нужно в сессии
        // session.user.verified = token.verified as Date | null; // Можно добавить
      }
      return session;
    },
  },
  // Добавьте эту страницу, если хотите кастомную страницу ошибок NextAuth
  // pages: {
  //   signIn: '/auth/signin', // Укажите путь к вашей странице входа
  //   error: '/auth/error', // Страница для отображения ошибок аутентификации
  // },
};