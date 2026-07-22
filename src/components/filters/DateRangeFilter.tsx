import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, CalendarIcon, FileClock, FilePlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export type DateFilterField = 'created' | 'modified' | 'effective';

export interface DateRangeFilterValue {
  field: DateFilterField;
  from: string;
  to: string;
}

interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  onClear?: () => void;
  className?: string;
  /** Oculta o rótulo externo (útil quando embutido na barra de filtros) */
  showLabel?: boolean;
  /** Remove o fundo próprio para fundir com a toolbar pai */
  embedded?: boolean;
  /** Controles menores para barra compacta */
  compact?: boolean;
}

interface MaterialDatePickerProps {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  /** Ao mudar o mês com as setas, aplica filtro do mês visível */
  onMonthNavigate?: (month: Date) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  compact?: boolean;
}

const FIELD_OPTIONS: Array<{
  value: DateFilterField;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'modified', label: 'Modificação', icon: FileClock },
  { value: 'created', label: 'Criação', icon: CalendarDays },
  { value: 'effective', label: 'Publicação', icon: FilePlus },
];

const toIsoDate = (date: Date) => format(date, 'yyyy-MM-dd');

const parseIsoDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
};

/**
 * Seletor de data estilo Material Design (Popover + Calendar), sem input nativo.
 */
const MaterialDatePicker: React.FC<MaterialDatePickerProps> = ({
  label,
  value,
  onChange,
  onMonthNavigate,
  minDate,
  maxDate,
  placeholder = 'Selecionar',
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const min = parseIsoDate(minDate);
  const max = parseIsoDate(maxDate);
  const [month, setMonth] = useState<Date>(
    () => selected || max || min || new Date()
  );

  useEffect(() => {
    if (selected) setMonth(selected);
  }, [value]);

  const handleMonthChange = (nextMonth: Date) => {
    setMonth(nextMonth);
    onMonthNavigate?.(nextMonth);
  };

  return (
    <div className="flex items-center gap-1">
      {!compact && <span className="px-1 text-xs text-gray-400">{label}</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'justify-start gap-1.5 border-0 bg-ufac-lightBlue/50 font-medium text-ufac-blue shadow-none transition hover:bg-ufac-lightBlue hover:text-ufac-blue',
              compact
                ? 'h-8 min-w-[104px] sm:min-w-[128px] rounded-lg px-2 text-sm'
                : 'h-10 min-w-[168px] rounded-xl px-3 text-sm',
              !selected && 'text-ufac-blue/60'
            )}
            aria-label={`Data ${label.toLowerCase()}`}
            title={label}
          >
            <CalendarIcon className={cn('shrink-0 opacity-80', compact ? 'h-4 w-4' : 'h-4 w-4')} />
            <span>
              {selected
                ? format(selected, 'dd/MM/yyyy', { locale: ptBR })
                : compact
                  ? label
                  : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="w-auto max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border-0 p-0 shadow-[0_8px_28px_rgba(41,77,239,0.18)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="bg-ufac-blue px-5 pb-4 pt-5 text-white">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
              {format(month, 'MMMM yyyy', { locale: ptBR })}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight capitalize">
              {selected
                ? format(selected, "dd 'de' MMM yyyy", { locale: ptBR })
                : format(month, "MMMM yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="bg-white p-3">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selected}
              month={month}
              onMonthChange={handleMonthChange}
              onSelect={(date) => {
                if (!date) return;
                onChange(toIsoDate(date));
                setOpen(false);
              }}
              disabled={(date) => {
                if (min && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) {
                  return true;
                }
                if (max && date > new Date(max.getFullYear(), max.getMonth(), max.getDate())) {
                  return true;
                }
                return false;
              }}
              className="p-0"
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-3',
                caption: 'flex justify-center relative items-center h-10',
                caption_label: 'text-sm font-semibold text-slate-800 capitalize',
                nav: 'flex items-center gap-1',
                nav_button:
                  'h-8 w-8 rounded-full border-0 bg-ufac-lightBlue/60 p-0 text-ufac-blue opacity-100 hover:bg-ufac-lightBlue inline-flex items-center justify-center',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell:
                  'w-9 rounded-md text-[0.7rem] font-semibold uppercase text-slate-400',
                row: 'mt-1 flex w-full',
                cell: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 rounded-full p-0 font-medium text-slate-700 hover:bg-ufac-lightBlue hover:text-ufac-blue aria-selected:opacity-100',
                day_selected:
                  'bg-ufac-blue text-white hover:bg-ufac-blue hover:text-white focus:bg-ufac-blue focus:text-white shadow-md shadow-ufac-blue/30',
                day_today:
                  'bg-transparent text-ufac-blue ring-1 ring-inset ring-ufac-blue/40 font-semibold',
                day_outside: 'text-slate-300 opacity-60',
                day_disabled: 'text-slate-300 opacity-40',
                day_hidden: 'invisible',
              }}
            />

            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                Limpar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-ufac-blue hover:bg-ufac-lightBlue"
                onClick={() => {
                  const today = new Date();
                  onChange(toIsoDate(today));
                  setMonth(today);
                  setOpen(false);
                }}
              >
                Hoje
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/**
 * Filtro de faixa de data alinhado aos índices do catálogo Plone (@search).
 */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  onClear,
  className = '',
  showLabel = true,
  embedded = false,
  compact = false,
}) => {
  const hasRange = Boolean(value.from || value.to);

  const applyVisibleMonth = (month: Date) => {
    onChange({
      ...value,
      from: toIsoDate(startOfMonth(month)),
      to: toIsoDate(endOfMonth(month)),
    });
  };

  return (
    <div className={cn(embedded ? 'contents' : '', className)}>
      {showLabel && (
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Filtrar por data
        </label>
      )}
      <div
        className={cn(
          'flex flex-nowrap items-center',
          compact ? 'gap-1.5' : 'gap-2',
          !embedded && 'rounded-xl bg-white p-1'
        )}
      >
        <Select
          value={value.field}
          onValueChange={(field) =>
            onChange({ ...value, field: field as DateFilterField })
          }
        >
          <SelectTrigger
            className={cn(
              'border-none bg-ufac-lightBlue/50 text-ufac-blue shadow-none focus:ring-0',
              compact ? 'h-8 w-[108px] sm:w-[132px] rounded-lg px-2 text-sm' : 'h-10 w-[160px] rounded-xl bg-white'
            )}
          >
            <SelectValue placeholder="Campo" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none bg-white text-ufac-blue">
            {FIELD_OPTIONS.map(({ value: opt, label, icon: Icon }) => (
              <SelectItem
                key={opt}
                value={opt}
                className="h-8 rounded-lg text-xs data-[highlighted]:bg-ufac-lightBlue data-[highlighted]:text-ufac-blue"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-ufac-blue" />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <MaterialDatePicker
          label="De"
          value={value.from}
          maxDate={value.to || undefined}
          placeholder="dd/mm/aaaa"
          compact={compact}
          onChange={(from) => onChange({ ...value, from })}
          onMonthNavigate={applyVisibleMonth}
        />

        <MaterialDatePicker
          label="Até"
          value={value.to}
          minDate={value.from || undefined}
          placeholder="dd/mm/aaaa"
          compact={compact}
          onChange={(to) => onChange({ ...value, to })}
          onMonthNavigate={applyVisibleMonth}
        />

        {hasRange && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'text-gray-500 hover:bg-ufac-lightBlue hover:text-ufac-blue',
              compact ? 'h-8 w-8 rounded-lg p-0' : 'h-10 rounded-xl'
            )}
            onClick={() => {
              onChange({ ...value, from: '', to: '' });
              onClear?.();
            }}
            aria-label="Limpar filtro de data"
            title="Limpar"
          >
            <X className="h-4 w-4" />
            {!compact && <span className="ml-1">Limpar</span>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
