import { Api } from '@/shared/services/api-client';
import {Color} from '@prisma/client';
import React from 'react';
import { useSet } from 'react-use';

interface ReturnProps {
    colors: Color[];
    loading: boolean;
    selectedIds: Set<string>;
    onAddId:(id: string) => void;
}

export const useFilterColors = (values: string[] =[]): ReturnProps => {
    const [colors, setColors] = React.useState<Color[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedIds, {toggle}] = useSet(new Set<string>(values))
    React.useEffect(() => {
      async function fetchColors() {
        try {
        setLoading(true);
          const colors = await Api.colors.getAll();
          setColors(colors);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchColors();
    }, []);
    return {colors, loading, onAddId: toggle, selectedIds}
};