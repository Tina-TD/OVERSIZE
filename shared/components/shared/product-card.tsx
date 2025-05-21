import React from 'react';
import Link from 'next/link';
import { Title } from './title';
import { Button } from '../ui/button'; // Убедитесь, что путь правильный
import { Plus } from 'lucide-react';
import Image from 'next/image'; // Хотя в оригинале использовался <img>, Next.js рекомендует <Image>

interface Props {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string; // Добавлено из схемы/интерфейса Product
  className?: string;
}

export const ProductCard: React.FC<Props> = ({
  id,
  name,
  price,
  imageUrl,
  description, // Принимаем description
  className,
}) => {
  return (
    <div className={className}>
      {/* Ссылка ведет на страницу товара */}
      <Link href={`/product/${id}`} passHref>
        {/* Оболочка карточки, чтобы вся область была кликабельной */}
        <div className="flex flex-col h-full"> {/* Используем flex для растягивания контента */}
            {/* Блок с изображением */}
            <div className="flex justify-center p-6 bg-secondary rounded-lg h-[260px] overflow-hidden"> {/* Добавлен overflow-hidden */}
              {/* Рекомендуется использовать Next.js Image компонент */}
               <img className="w-[215px] h-[215px] object-contain" src={imageUrl} alt={name} />
            </div>
            {/* Блок с информацией о товаре */}
            <div className="flex-grow mt-3"> {/* flex-grow чтобы занять доступное место */}
              <Title text={name} size="sm" className="mb-1 font-bold line-clamp-3"></Title> {/* line-clamp-2 для ограничения строк названия */}
              {/* Используем описание из данных, если оно есть */}
              {description ? (
                <p className="text-sm text-gray-400 line-clamp-4"> {/* line-clamp-2 для ограничения строк описания */}
                  {description}
                </p>
              ) : (
                // Запасной вариант или статический текст, если описания нет
                <p className="text-sm text-gray-400">Описание товара</p>
              )}
            </div>

            {/* Блок с ценой и кнопкой */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-[20px]">
                <b>{price} ₽</b>
              </span>

              {/* Кнопка "Добавить" - можно сделать ее интерактивной позже */}
              {/* Важно: Если кнопка находится внутри Link, обработка клика может быть неочевидной.
                 Обычно кнопку добавления делают вне Link или используют preventDefault.
                 В этом примере кнопка находится внутри Link, но действие добавления не реализовано.
                 Если кнопка должна выполнять отдельное действие (добавить в корзину)
                 без перехода на страницу товара, ее нужно вынести из Link.
              */}
              <Button variant="secondary" className="text-base font-bold" onClick={(e) => {
                  // Пример: предотвратить переход по ссылке при клике на кнопку
                  // e.preventDefault();
                  // Добавить товар в корзину (логика отсутствует в примере)
                  // console.log('Добавить в корзину товар:', id);
               }}>
                <Plus size={20} className="mr-1" />
                Добавить
              </Button>
            </div>
        </div>
      </Link>
    </div>
  );
};