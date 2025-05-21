import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const OPTIONS: Record<string,string> = {
  popular: 'популярное',
  priceAsc: 'дешевле',
  priceDesc: 'дороже',
  new: 'новое',
};

export const SortPopup: React.FC<Props> = ({ value, onChange, className }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('inline-flex items-center gap-1 bg-gray-50 px-5 h-[52px] rounded-2xl cursor-pointer', className)}>
          <ArrowUpDown size={16} />
          <b>Сортировка:</b>
          <b className="text-gray-400">{OPTIONS[value]}</b>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        <ul>
          {Object.entries(OPTIONS).map(([key, label]) => (
            <li
              key={key}
              className={cn(
                'p-2 px-4 cursor-pointer rounded-md',
                key === value
                  ? 'bg-secondary text-primary'
                  : 'hover:bg-secondary hover:text-primary'
              )}
              onClick={() => {
                onChange(key);
                setOpen(false);            // ← закрываем поповер
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
