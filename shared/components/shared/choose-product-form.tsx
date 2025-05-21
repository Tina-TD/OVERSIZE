'use client';

import React from 'react';
import { Size } from '@prisma/client'; // Импортируем тип Size

// Импортируем нужные компоненты
import { Title } from './title';
import { Button } from '../ui';
import { GroupVariants } from './group-variants';
import { cn } from '@/shared/lib/utils';
import { ProductImage } from './product-image';

// Удаляем все неиспользуемые/закомментированные импорты и типы из старой логики
// import { Ingredient, ProductItem } from '@prisma/client';
// import { PizzaImage } from './pizza-image';
// import { ProductSize, productSizes } from '@/shared/constants/product';
// import { PizzaSize, PizzaType, pizzaTypes } from '@/shared/constants/pizza';
// import { IngredientItem } from './ingredient-item';
// import { getPizzaDetails } from '@/shared/lib';
// import { usePizzaOptions } from '@/shared/hooks';


interface Props {
  imageUrl: string;
  name: string;
  description: string;
  composition: string;
  sizes: Size[]; // Массив ДОСТУПНЫХ размеров для этого товара (приходит из product.sizes)
  loading?: boolean; // Пропс loading не используется в текущей логике кнопки, можно удалить
  price: number;
  // ИСПРАВЛЕНО: Новая пропса onAddToCart, которая принимает ID выбранного размера
  onAddToCart: (selectedSizeId: number) => void;
  // onSubmit?: (itemId: number, ingredients: number[]) => void; // Удаляем или комментируем старую пропсу onSubmit
  className?: string;
}


export const ChooseProductForm: React.FC<Props> = ({
  name,
  description,
  imageUrl,
  composition,
  sizes, // Принимаем массив доступных размеров
  loading, // Пропс loading удален из деструктуризации
  price,
  onAddToCart, // Принимаем новую пропсу
  // onSubmit, // Старая пропса onSubmit удалена из деструктуризации
  className,
}) => {
  // Определяем начальное значение для выбранного размера.
  // Берем ID первого размера из списка доступных.
  // Используем undefined как начальное значение, чтобы показать, что размер еще не выбран,
  // если список размеров пустой или нужно явное действие выбора.
  // Если товар *обязательно* должен иметь размер, можно выбрать первый по умолчанию.
  const initialSizeId = sizes.length > 0 ? sizes[0].id : undefined;

  // Состояние для хранения ID выбранного размера (число или undefined)
  const [selectedSizeId, setSelectedSizeId] = React.useState<number | undefined>(initialSizeId);

  // Преобразуем массив размеров (Size[]) в формат, который ожидает GroupVariants ({ name: string, value: string }[])
  const availableSizeVariants = sizes.map(size => ({
    name: size.name, // Имя размера (например, 'S', 'M')
    value: String(size.id), // ID размера, преобразованный в строку (например, '1', '2')
  }));

  // Обработчик клика по кнопке "Добавить в корзину"
  const handleAddButtonClick = () => {
    // Проверяем, выбран ли размер
    if (selectedSizeId !== undefined) {
        // Вызываем пропсу onAddToCart, передавая выбранный ID размера
        onAddToCart(selectedSizeId);
    } else {
        // Можно добавить логику показа ошибки или сообщения пользователю
        console.warn("No size selected.");
        // TODO: Handle case where no size is selected
    }
  };

  // Кнопка добавления активна только если выбран размер (если размеры есть)
  const isAddButtonDisabled = sizes.length > 0 && selectedSizeId === undefined;


  return (
    <div className={cn(className, 'flex flex-1')}>
      <ProductImage imageUrl={imageUrl}/>

      <div className="w-[490px] bg-[#f7f6f5] p-7">
        <Title text={name} size="md" className="font-extrabold mb-1" />

        <p className="text-gray-400">{description}</p>
        <p className="text-gray-500 font-bold mt-6" >Состав:</p>
        <p className="text-gray-400">{composition}</p>

        <div className="flex flex-col gap-4 mt-5">
          {/* Передаем только доступные размеры товара */}
          {/* Отображаем выбор размеров только если они есть */}
          {availableSizeVariants.length > 0 && (
               <GroupVariants
                items={availableSizeVariants}
                // Передаем текущий выбранный ID размера (число), преобразованный в строку
                // Используем пустую строку или undefined если размер еще не выбран
                value={selectedSizeId !== undefined ? String(selectedSizeId) : undefined}
                // Обработчик клика: получаем value (ID размера в виде строки),
                // преобразуем обратно в число и обновляем состояние
                onClick={(value) => setSelectedSizeId(Number(value))}
              />
          )}
           {availableSizeVariants.length === 0 && (
             <p className="text-orange-600 font-bold">Размеры недоступны</p>
           )}
        </div>

        <Button
          loading={loading} // Пропс loading удален
          onClick={handleAddButtonClick} // Используем новый обработчик
          disabled={isAddButtonDisabled} // Кнопка может быть неактивна
          className="h-[55px] px-10 text-base rounded-[18px] w-full mt-10">
          Добавить в корзину за {price} ₽
        </Button>
      </div>
    </div>
  );
};