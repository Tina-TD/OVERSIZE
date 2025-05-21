import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';
import { Type } from '@prisma/client';

export const getAll = async (): Promise<Type[]> => {
  return (await axiosInstance.get<Type[]>(ApiRoutes.COLORS)).data;
};
