import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const areSizeSetsEqual = (set1: number[], set2: number[]): boolean => {
  if (set1.length !== set2.length) {
      return false;
  }
  const sortedSet1 = [...set1].sort();
  const sortedSet2 = [...set2].sort();
  for (let i = 0; i < sortedSet1.length; i++) {
      if (sortedSet1[i] !== sortedSet2[i]) {
          return false;
      }
  }
  return true;
};