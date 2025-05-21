'use client';
import React from 'react';
import { useIntersection } from 'react-use';
import { Title } from './title';
import { cn } from '@/shared/lib/utils';
import { ProductCard } from './product-card'; // Убедитесь, что путь правильный
import { useCategoryStore } from '@/shared/store/category'; // Убедитесь, что путь правильный

// Определяем интерфейс Product, основываясь на схеме и полях, которые будут использоваться
// Добавляем description, так как он есть в схеме и может быть использован (например, в карточке товара)
interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  description: string; // Добавлено из схемы
  // Можно добавить другие поля из схемы, если они нужны в этом компоненте или ProductCard,
  // но для текущей логики достаточно этих.
  // composition: string;
  // brandId: number;
  // colorId: number;
  // typeId: number;
}

interface Props {
  title: string;
  items: Product[]; // Теперь используем наш обновленный интерфейс Product
  categoryId: number;
  className?: string;
  listClassName?: string;
}

export const ProductsGroupList: React.FC<Props> = ({
  title,
  items,
  listClassName,
  categoryId,
  className,
}) => {
  const setActiveCategoryId = useCategoryStore((state) => state.setActiveId);

  const intersectionRef = React.useRef<HTMLDivElement | null>(null);

  const intersection = useIntersection(
    intersectionRef as React.RefObject<HTMLElement>,
    { threshold: 0.4 }
  );

  React.useEffect(() => {
    if (intersection?.isIntersecting) {
      setActiveCategoryId(categoryId);
    }
  }, [categoryId, intersection?.isIntersecting]);

  return (
    <div
      className={cn(className, 'product-group-section')}
      id={title} // ID нужен для JS скролла из Categories (соответствует name из cats)
      ref={intersectionRef} // Привязываем ref к DOM-элементу
    >
      <Title text={title} size="lg" className="font-extrabold mb-5" />
      <div className={cn('grid grid-cols-3 gap-[50px]', listClassName)}>
        {items.map((product) => (
          // Передаем все необходимые данные из Product Card
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            imageUrl={product.imageUrl}
            price={product.price}
            description={product.description} // Передаем description в ProductCard
            // Передайте другие поля, если они нужны в ProductCard
            // composition={product.composition}
            // brandId={product.brandId}
          />
        ))}
      </div>
    </div>
  );
};