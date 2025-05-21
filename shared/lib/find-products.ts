import { prisma } from '@/prisma/prisma-client';

export interface GetSearchParams {
  query?: string;
  sortBy?: 'popular' | 'new' | 'priceAsc' | 'priceDesc';
  sizes?: string;
  types?: string;
  brands?: string;
  colors?: string;
  priceFrom?: string;
  priceTo?: string;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 100000;

export const findProduct = async (params: GetSearchParams) => {
  const sizes = params.sizes?.split(',').map(Number);
  const types = params.types?.split(',').map(Number);
  const brands = params.brands?.split(',').map(Number);
  const colors = params.colors?.split(',').map(Number);
  const minPrice = Number(params.priceFrom) || DEFAULT_MIN_PRICE;
  const maxPrice = Number(params.priceTo) || DEFAULT_MAX_PRICE;
  const searchQuery = params.query?.toLowerCase();

  // определяем порядок сортировки
  let orderByClause: any;
  switch (params.sortBy) {
    case 'priceAsc':
      orderByClause = { price: 'asc' };
      break;
    case 'priceDesc':
      orderByClause = { price: 'desc' };
      break;
    case 'new':
      orderByClause = { createdAt: 'desc' };
      break;
    case 'popular':
      // «популярность» по количеству добавлений в корзину
      orderByClause = { items: { _count: 'desc' } };
      break;
    default:
      orderByClause = { id: 'desc' };
  }

  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: {
          AND: [
            searchQuery
              ? {
                  OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { description: { contains: searchQuery, mode: 'insensitive' } },
                  ],
                }
              : {},
            brands ? { brandId: { in: brands } } : {},
            colors ? { colorId: { in: colors } } : {},
            types ? { typeId: { in: types } } : {},
            {
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
            },
            sizes
              ? {
                  sizes: {
                    some: {
                      id: { in: sizes },
                    },
                  },
                }
              : {},
          ],
        },
        include: {
          brand: true,
          color: true,
          type: true,
          sizes: true,
          _count: { select: { items: true } },
        },
        orderBy: orderByClause,
      },
    },
    orderBy: { id: 'asc' },
  });

  return categories;
};
