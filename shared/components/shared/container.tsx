// Импорт функции cn из утилитарного модуля. Эта функция, вероятно, используется для объединения классов CSS.
import { cn } from '@/shared/lib/utils';

// Импорт библиотеки React, необходимой для создания компонентов.
import React from 'react';

// Определение интерфейса Props, который описывает свойства, которые компонент может принимать.
// В данном случае, компонент может принимать необязательное свойство className.
interface Props {
  className?: string;
}

// Определение функционального компонента Container с использованием React.FC (FunctionComponent).
// Компонент принимает свойства Props и дополнительно поддерживает свойство children благодаря React.PropsWithChildren.
export const Container: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
  // Возвращает JSX, который рендерится в виде div элемента.
  // Классы CSS объединяются с помощью функции cn.
  // 'mx-auto max-w-[1280px]' - это базовые стили, которые центрируют контейнер и ограничивают его максимальную ширину.
  // className - это дополнительные классы, переданные через свойства.
  return <div className={cn('mx-auto max-w-[1280px]', className)}>{children}</div>;
};
