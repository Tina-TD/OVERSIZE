import { cn } from "@/shared/lib/utils";
import React from "react";
import { Container } from "./container";
import { Categories } from "./categories";
import { SortPopup } from "./sort-popup";
import { Category } from "@prisma/client";

interface Props {
  categories: Category[];
  sortBy: string;
  onSortChange: (val: string) => void;
  className?: string;
}

export const TopBar: React.FC<Props> = ({ categories, sortBy, onSortChange, className }) => (
  <div className={cn('sticky top-0 bg-white py-5 shadow-lg z-10', className)}>
    <Container className="flex items-center justify-between">
      <Categories items={categories} />
      <SortPopup value={sortBy} onChange={onSortChange} />
    </Container>
  </div>
);
