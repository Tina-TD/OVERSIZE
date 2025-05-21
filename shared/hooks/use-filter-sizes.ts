import { Api } from '@/shared/services/api-client';
import {Size} from '@prisma/client';
import React from 'react';
import { useSet } from 'react-use';

interface ReturnProps {
    sizes: Size[];
    loading: boolean;
    selectedIds: Set<string>;
    onAddId:(id: string) => void;
}

export const useFilterSizes = (values: string[] =[]): ReturnProps => {
    const [sizes, setSizes] = React.useState<Size[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedIds, {toggle}] = useSet(new Set<string>(values))
    React.useEffect(() => {
      async function fetchSizes() {
        try {
        setLoading(true);
          const sizes = await Api.sizes.getAll();
          setSizes(sizes);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchSizes();
    }, []);

    return {sizes, loading, onAddId: toggle, selectedIds,}
};