'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
// import { Product } from '@prisma/client'; // Не нужно, если используем ProductWithRelations

import { ProductWithRelations } from '@/@types/prisma';
import { useCartStore } from '@/shared/store';
// Убедись, что CreateCartItemValues обновлен и ожидает productId и sizeIds
import { CreateCartItemValues } from '@/shared/services/dto/cart.dto';
import toast from 'react-hot-toast';
import { ProductForm } from '../product-form';


interface Props {
  product: ProductWithRelations | null; // product может быть null, если модалка закрыта
  className?: string;
}

export const ChooseProductModal: React.FC<Props> = ({ product, className }) => {
  const router = useRouter();
  

  return (
    // Модальное окно открыто, если product не null
    <Dialog open={Boolean(product)} onOpenChange={() => router.back()}>
      <DialogContent
        className={cn(
          'p-0 w-[1060px] max-w-[1060px] min-h-[500px] bg-white overflow-hidden',
          className,
        )}>
          <DialogTitle hidden/>
          {/* Отображаем форму только если product загружен */}
          {product && (
            <ProductForm product={product} onSubmit = {()=>router.back()}/>
          )}
      </DialogContent>
    </Dialog>
  );
};