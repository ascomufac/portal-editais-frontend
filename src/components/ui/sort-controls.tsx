import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CalendarArrowDown, CalendarArrowUp, CalendarDays, Clock } from 'lucide-react'
import React from 'react'

interface SortControlsProps {
  sortOrder: 'created' | 'modified' | 'sortable_title' | 'effective'
  sortDirection: 'ascending' | 'descending'
  onSortOrderChange: (val: 'created' | 'modified' | 'sortable_title' | 'effective') => void
  onSortDirectionToggle: () => void
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortOrder,
  sortDirection,
  onSortOrderChange,
  onSortDirectionToggle,
}) => {
  const sortOptions = [
    // { value: 'sortable_title', label: 'Título', icon: Type },
    { value: 'created', label: 'Criação', icon: CalendarDays },
    { value: 'effective', label: 'Publicação', icon: CalendarDays },
    { value: 'modified', label: 'Modificação', icon: Clock },
  ]

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <ToggleGroup
          type="single"
          value={sortOrder}
          onValueChange={(val) => onSortOrderChange(val as any)}
          className="inline-flex  rounded-xl shadow-sm"
          aria-label="Ordenar por"
        >
          {sortOptions.map(({ value, label, icon: Icon }, index, array) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className={`data-[state=on]:bg-ufac-blue data-[state=on]:text-white text-gray-700 px-4 py-2 transition-all flex items-center gap-1 rounded-none
                ${index === 0 ? 'rounded-l-xl' : ''}
                ${index === array.length - 1 ? 'rounded-r-xl' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <button
          type="button"
          onClick={onSortDirectionToggle}
          className="inline-flex items-center gap-2 border rounded-xl px-2 py-2 text-sm font-medium  hover:bg-ufac-blue hover:text-white text-ufac-blue transition"
          aria-label="Alternar direção da ordenação"
        >
          {sortDirection === 'ascending' ? (
            <>
              <CalendarArrowDown  className="h-6 w-6" />
            </>
          ) : (
            <>
              <CalendarArrowUp  className="h-6 w-6" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SortControls
