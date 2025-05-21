import { Api } from '@/shared/services/api-client';
import {Type} from '@prisma/client';
import React from 'react';
import { useSet } from 'react-use';

interface ReturnProps {
    types: Type[];
    loading: boolean;
    selectedIds: Set<string>;
    onAddId:(id: string) => void;
}

export const useFilterTypes = (values: string[] =[]): ReturnProps => {
    const [types, setTypes] = React.useState<Type[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedIds, {toggle}] = useSet(new Set<string>(values))
    React.useEffect(() => {
      async function fetchTypes() {
        try {
        setLoading(true);
          const types = await Api.types.getAll();
          setTypes(types);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchTypes();
    }, []);
    return {types, loading, onAddId: toggle, selectedIds}
};