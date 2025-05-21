export const mapProductSize = {
    1: 'S',
    2: 'M',
    3: 'L',
    4: 'XL',
    5: 'XXL',
    6: '3XL',
    7: '4XL',
  } as const;


  export const productSizes = Object.entries(mapProductSize).map(([value, name]) => ({
    name,
    value,
  }));
  export type ProductSize = keyof typeof mapProductSize;