import { Api } from '@/shared/services/api-client';
import {Brand} from '@prisma/client';
import React from 'react';
import { useSet } from 'react-use';

interface ReturnProps {
    brands: Brand[];
    loading: boolean;
    selectedIds: Set<string>;
    onAddId:(id: string) => void;
}

export const useFilterBrands = (values: string[] =[]): ReturnProps => {
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [loading, setLoading] = React.useState(true);
  
    const [selectedIds, {toggle}] = useSet(new Set<string>(values))
    React.useEffect(() => {
      async function fetchBrands() {
        try {
        setLoading(true);
          const brands = await Api.brands.getAll();
          setBrands(brands);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchBrands();
    }, []);
    return {brands, loading, onAddId: toggle, selectedIds};
};