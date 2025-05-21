import { Size, Product } from '@prisma/client';

export type ProductWithRelations = Product & { sizes: Size[]; };
