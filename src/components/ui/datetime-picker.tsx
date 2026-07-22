import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type DateTimePickerProps = {
  label: string;
  /** ISO datetime ou vazio */
  value: string;
  onChange: (iso: string) => void;
  helperText?: string;
  className?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/**
 * Date+time no mesmo padrão visual do MaterialDatePicker (filtros do portal).
 */
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => {
    if (!value) return undefined;
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }, [value]);

  const [month, setMonth] = useState<Date>(() => selected || new Date());
  const [hour, setHour] = useState(() => selected?.getHours() ?? 0);
  const [minute, setMinute] = useState(() => selected?.getMinutes() ?? 0);

  useEffect(() => {
    if (selected) {
      setMonth(selected);
      setHour(selected.getHours());
      setMinute(selected.getMinutes());
    }
  }, [value]);

  const emit = (date: Date, h: number, m: number) => {
    const next = new Date(date);
    next.setHours(h, m, 0, 0);
    onChange(next.toISOString());
  };

  const display = selected
    ? format(selected, "dd/MM/yyyy, HH:mm", { locale: ptBR })
    : 'dd/mm/yyyy, --:--';

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium leading-none">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-10 w-full justify-between rounded-lg border-slate-200 bg-white px-3 font-normal text-slate-800 shadow-none hover:bg-slate-50',
              !selected && 'text-slate-400'
            )}
          >
            <span>{display}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
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
                ? format(selected, "dd 'de' MMM yyyy, HH:mm", { locale: ptBR })
                : format(month, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>

          <div className="flex bg-white">
            <div className="p-3">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={selected}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  if (!date) return;
                  emit(date, hour, minute);
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
                    setMonth(today);
                    setHour(today.getHours());
                    setMinute(today.getMinutes());
                    emit(today, today.getHours(), today.getMinutes());
                  }}
                >
                  Hoje
                </Button>
              </div>
            </div>

            <div className="flex border-l border-slate-100 py-3 pr-2">
              <div className="h-[280px] w-12 overflow-y-auto px-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={cn(
                      'mb-0.5 flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums',
                      hour === h
                        ? 'bg-ufac-blue font-semibold text-white'
                        : 'text-slate-600 hover:bg-ufac-lightBlue hover:text-ufac-blue'
                    )}
                    onClick={() => {
                      setHour(h);
                      const base = selected || month;
                      emit(base, h, minute);
                    }}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                ))}
              </div>
              <div className="h-[280px] w-12 overflow-y-auto px-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={cn(
                      'mb-0.5 flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums',
                      minute === m
                        ? 'bg-ufac-blue font-semibold text-white'
                        : 'text-slate-600 hover:bg-ufac-lightBlue hover:text-ufac-blue'
                    )}
                    onClick={() => {
                      setMinute(m);
                      const base = selected || month;
                      emit(base, hour, m);
                    }}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default DateTimePicker;
