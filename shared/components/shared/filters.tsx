'use client';
import React from "react";
import { Title } from "./title";
import { Input } from "../ui";
import { RangeSlider } from "./range-slider";
import { CheckboxFiltersGroup } from "./checkbox-filters-group";
import { useFilterTypes } from "@/shared/hooks/use-filter-types";
import { useFilterSizes } from "@/shared/hooks/use-filter-sizes";
import { useFilterColors } from "@/shared/hooks/use-filter-colors";
import { useFilterBrands } from "@/shared/hooks/use-filter-brands";
import qs from 'qs';
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchParam, useSet } from "react-use";

interface Props {
  className?: string;
}

interface PriceProps {
    priceFrom?: number;
    priceTo?: number;
}

interface QueryFilters extends PriceProps{
    sizes: string;
    brands: string;
    colors: string;
    types: string;
}
export const Filters: React.FC<Props> = ({ className }) => {
    const searchParams = useSearchParams() as unknown as Map <keyof QueryFilters, string>;
    const router = useRouter();
 
    const [prices, setPrice] = React.useState<PriceProps>({
      priceFrom:Number(searchParams.get('priceFrom')) || undefined,
      priceTo:Number(searchParams.get('priceTo')) || undefined,
    });
//  const [sizes, {toggle: toggleSizes}] = useSet(new Set<string>(searchParams.get('sizes') ? searchParams.get('sizes')?.split(','): []));

const updatePrice = (name: keyof PriceProps, value: number) => {
    setPrice({
        ...prices, 
        [name]: value,
    });
};

    const {
    sizes,
    loading: sizesLoading,
    onAddId: onAddSizeId,
    selectedIds: selectedSizeIds
  } = useFilterSizes(searchParams.get('sizes')?.split(','),);
  const itemsSizes = sizes.map((item) => ({ value: String(item.id), text: item.name }));

  const {
    brands,
    loading: brandsLoading,
    onAddId: onAddBrandId,
    selectedIds: selectedBrandIds
  } = useFilterBrands(searchParams.get('brands')?.split(','),);
  const itemsBrands = brands.map((item) => ({ value: String(item.id), text: item.name }));

  const {
    colors,
    loading: colorsLoading,
    onAddId: onAddColorId,
    selectedIds: selectedColorIds
  } = useFilterColors(searchParams.get('colors')?.split(','),);
  const itemsColors = colors.map((item) => ({ value: String(item.id), text: item.name }));

  const {
    types,
    loading: typesLoading,
    onAddId: onAddTypeId,
    selectedIds: selectedTypeIds
  } = useFilterTypes(searchParams.get('types')?.split(','),);
  const itemsTypes = types.map((item) => ({ value: String(item.id), text: item.name }));
 
 
  

  // Filters.tsx, useEffect
React.useEffect(() => {
  const qp = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const merged = {
    ...qp,
    ...prices,
    sizes: Array.from(selectedSizeIds),
    brands: Array.from(selectedBrandIds),
    colors: Array.from(selectedColorIds),
    types: Array.from(selectedTypeIds),
    // если у нас был sortBy — сохраним его
    sortBy: qp.sortBy,
  };
  const query = qs.stringify(merged, { arrayFormat: 'comma' });
  router.push(`?${query}`, { scroll: false });
}, [prices, selectedSizeIds, selectedBrandIds, selectedColorIds, selectedTypeIds]);

  return (
    <div className={className}>
      <Title text="Фильтрация" size="sm" className="mb-1 font-bold" />

      <div className="flex flex-col gap-4">
        <p className="font-bold">Цена от и до:</p>
        <div className="flex gap-3 mb-5">
          <Input type="number" placeholder="0" min={0} max={30000} value={String(prices.priceFrom)} 
           onChange={(e) => updatePrice('priceFrom', Number(e.target.value))} />
          <Input type="number" placeholder="100" min={100} max={30000} value={String(prices.priceTo) }
          onChange={(e) => updatePrice('priceTo', Number(e.target.value))} />
        </div>
        <RangeSlider min={0} max={30000} step={100} value={[prices.priceFrom || 0, prices.priceTo || 30000]} 
        onValueChange={([priceFrom, priceTo]) => setPrice({priceFrom, priceTo})}/>
      </div>
        
      <CheckboxFiltersGroup
        name = "sizes"
        title="Размер"
        className="mt-5"
        limit={4}
        defaultItems={itemsSizes.slice(0, 6)}
        items={itemsSizes}
        loading={sizesLoading}
        onClickCheckbox={onAddSizeId}
        selected={selectedSizeIds}
      />

      <CheckboxFiltersGroup
        name = "brands"
        title="Бренд"
        className="mt-5"
        limit={4}
        defaultItems={itemsBrands.slice(0, 6)}
        items={itemsBrands}
        loading={brandsLoading}
        onClickCheckbox={onAddBrandId}
        selected={selectedBrandIds}
      />

      <CheckboxFiltersGroup
        name = "colors"
        title="Цвет"
        className="mt-5"
        limit={4}
        defaultItems={itemsColors.slice(0, 6)}
        items={itemsColors}
        loading={colorsLoading}
        onClickCheckbox={onAddColorId}
        selected={selectedColorIds}
      />

      <CheckboxFiltersGroup
        name = "types"
        title="Категория"
        className="mt-5"
        limit={4}
        defaultItems={itemsTypes.slice(0, 6)}
        items={itemsTypes}
        loading={typesLoading}
        onClickCheckbox={onAddTypeId}
        selected={selectedTypeIds}
      />
    </div>
  );
};
