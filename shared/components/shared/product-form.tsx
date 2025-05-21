'use client';

import { ProductWithRelations } from '@/@types/prisma';
import { useCartStore } from '@/shared/store';
import React from 'react';
import toast from 'react-hot-toast';
import { ChooseProductForm } from './choose-product-form';
import { CreateCartItemValues } from '@/shared/services/dto/cart.dto';

interface Props {
  product: ProductWithRelations;
  onSubmit?: VoidFunction;
}

export const ProductForm: React.FC<Props> = ({ product, onSubmit: _onSubmit }) => {
    const addCartItem = useCartStore(state => state.addCartItem);
  const loading     = useCartStore(state => state.loading);
  
  // Эта функция будет вызвана из ChooseProductForm с выбранным ID размера
  const handleAddToCart = (selectedSizeId: number) => {
    if (!product) {
      // Нельзя добавить товар, если product === null
      console.error("Attempted to add item, but product is null.");
      toast.error('Не удалось добавить товар в корзину');
      return;
    }

    // Подготавливаем данные для добавления в корзину
    const itemData: CreateCartItemValues = {
      productId: product.id,
      // Передаем выбранный ID размера в виде массива (т.к. связь Many-to-Many)
      // Предполагаем, что выбирается один размер за раз.
      sizeIds: [selectedSizeId],
      quantity: 1, // Можно добавить опцию выбора количества, если нужно
    };

    addCartItem(itemData);
    
    // Закрываем модальное окно после добавления
    toast.success(product.name + ' добавлен в корзину');
    _onSubmit?.();
  };
  return (
    <ChooseProductForm
    imageUrl={product.imageUrl}
    name={product.name}
    description={product.description}
    composition={product.composition}
    sizes={product.sizes} // Передаем ДОСТУПНЫЕ размеры продукта
    price={product.price}
    // Передаем функцию, которую форма вызовет при добавлении в корзину
    onAddToCart={handleAddToCart}
    loading = {loading}
   />
);
};
