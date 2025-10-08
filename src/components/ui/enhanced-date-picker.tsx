import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EnhancedDatePickerProps {
  className?: string
  classNames?: React.ComponentProps<typeof DayPicker>['classNames']
  showOutsideDays?: boolean
  enableYearMonthDropdowns?: boolean
  yearRange?: { from: number; to: number }
  selected?: Date | Date[] | { from?: Date; to?: Date } | undefined
  onSelect?: ((date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void) | undefined
  mode?: 'single' | 'multiple' | 'range'
  disabled?: ((date: Date) => boolean) | boolean
  initialFocus?: boolean
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
}

function EnhancedDatePicker({
  className,
  classNames,
  showOutsideDays = true,
  enableYearMonthDropdowns = true,
  yearRange = { from: 1900, to: new Date().getFullYear() },
  selected,
  onSelect,
  mode = 'single',
  disabled,
  initialFocus,
  defaultMonth,
  onMonthChange,
}: EnhancedDatePickerProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<Date | undefined>(
    defaultMonth || new Date()
  )

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month)
    if (onMonthChange) {
      onMonthChange(month)
    }
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedMonth || new Date())
    newDate.setFullYear(parseInt(year))
    handleMonthChange(newDate)
  }

  const handleMonthSelect = (month: string) => {
    const newDate = new Date(selectedMonth || new Date())
    newDate.setMonth(parseInt(month))
    handleMonthChange(newDate)
  }

  // Generate year options
  const yearOptions = React.useMemo(() => {
    const years = []
    for (let year = yearRange.to; year >= yearRange.from; year--) {
      years.push(year)
    }
    return years
  }, [yearRange])

  // Generate month options
  const monthOptions = React.useMemo(() => {
    return [
      { value: '0', label: 'January' },
      { value: '1', label: 'February' },
      { value: '2', label: 'March' },
      { value: '3', label: 'April' },
      { value: '4', label: 'May' },
      { value: '5', label: 'June' },
      { value: '6', label: 'July' },
      { value: '7', label: 'August' },
      { value: '8', label: 'September' },
      { value: '9', label: 'October' },
      { value: '10', label: 'November' },
      { value: '11', label: 'December' },
    ]
  }, [])

  const currentYear = selectedMonth?.getFullYear() || new Date().getFullYear()
  const currentMonth = selectedMonth?.getMonth() || new Date().getMonth()

  if (enableYearMonthDropdowns) {
    return (
      <div className={cn('p-4', className)}>
        {/* Enhanced Header with Year and Month Dropdowns */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Select Date</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'size-8 p-0 hover:bg-accent rounded-md transition-colors'
                )}
                onClick={() => {
                  const newDate = new Date(selectedMonth || new Date())
                  newDate.setMonth(newDate.getMonth() - 1)
                  handleMonthChange(newDate)
                }}
                title="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'size-8 p-0 hover:bg-accent rounded-md transition-colors'
                )}
                onClick={() => {
                  const newDate = new Date(selectedMonth || new Date())
                  newDate.setMonth(newDate.getMonth() + 1)
                  handleMonthChange(newDate)
                }}
                title="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Year and Month Selection */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Year</label>
              <Select
                value={currentYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-20 h-9 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-sm">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Month</label>
              <Select
                value={currentMonth.toString()}
                onValueChange={handleMonthSelect}
              >
                <SelectTrigger className="w-28 h-9 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value} className="text-sm">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Enhanced Calendar */}
        <div className="border-t pt-4">
          {mode === 'range' ? (
            <DayPicker
              showOutsideDays={showOutsideDays}
              month={selectedMonth}
              onMonthChange={handleMonthChange}
              selected={selected as any}
              onSelect={onSelect as any}
              mode="range"
              disabled={disabled}
              initialFocus={initialFocus}
              captionLayout="dropdown"
              required={true}
              classNames={{
                months: 'flex flex-col sm:flex-row gap-2',
                month: 'flex flex-col gap-3',
                month_caption: 'hidden', // Hide the default caption since we have custom header
                caption_label: 'text-sm font-medium',
                nav: 'flex items-center gap-1',
                button_previous: 'hidden', // Hide default nav buttons since we have custom ones
                button_next: 'hidden', // Hide default nav buttons since we have custom ones
                month_grid: 'w-full border-collapse space-x-1',
                weekdays: 'flex mb-2',
                weekday:
                  'text-muted-foreground rounded-md w-9 h-8 font-medium text-xs flex items-center justify-center',
                week: 'flex w-full',
                day: cn(
                  'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
                  '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                ),
                day_button: cn(
                  buttonVariants({ variant: 'ghost' }),
                  'size-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors'
                ),
                day_selected: 'opacity-100 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                range_start:
                  'day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground',
                range_end:
                  'day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground',
                selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'bg-accent text-accent-foreground rounded-md font-semibold',
                outside:
                  'day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50',
                disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
                range_middle:
                  'aria-selected:bg-accent aria-selected:text-accent-foreground',
                hidden: 'invisible',
                ...classNames,
              }}
            />
          ) : (
            <DayPicker
              showOutsideDays={showOutsideDays}
              month={selectedMonth}
              onMonthChange={handleMonthChange}
              selected={selected as any}
              onSelect={onSelect as any}
              mode={mode === 'multiple' ? 'multiple' : 'single'}
              disabled={disabled}
              initialFocus={initialFocus}
              captionLayout="dropdown"
              {...(mode === 'multiple' && { required: true })}
              classNames={{
                months: 'flex flex-col sm:flex-row gap-2',
                month: 'flex flex-col gap-3',
                month_caption: 'hidden', // Hide the default caption since we have custom header
                caption_label: 'text-sm font-medium',
                nav: 'flex items-center gap-1',
                button_previous: 'hidden', // Hide default nav buttons since we have custom ones
                button_next: 'hidden', // Hide default nav buttons since we have custom ones
                month_grid: 'w-full border-collapse space-x-1',
                weekdays: 'flex mb-2',
                weekday:
                  'text-muted-foreground rounded-md w-9 h-8 font-medium text-xs flex items-center justify-center',
                week: 'flex w-full',
                day: cn(
                  'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
                  'aria-selected:rounded-md [&[aria-selected="true"]>button]:hover:bg-foreground [&[aria-selected="true"]>button]:hover:text-background/85'
                ),
                day_button: cn(
                  buttonVariants({ variant: 'ghost' }),
                  'size-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors'
                ),
                day_selected: 'opacity-100 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                range_start:
                  'day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground',
                range_end:
                  'day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground',
                selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'bg-accent text-accent-foreground rounded-md font-semibold',
                outside:
                  'day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50',
                disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
                range_middle:
                  'aria-selected:bg-accent aria-selected:text-accent-foreground',
                hidden: 'invisible',
                ...classNames,
              }}
            />
          )}
        </div>
      </div>
    )
  }

  // Fallback to regular calendar if dropdowns are disabled
  return (
    <div className={cn('p-4', className)}>
      {mode === 'range' ? (
        <DayPicker
          showOutsideDays={showOutsideDays}
          selected={selected as any}
          onSelect={onSelect as any}
          mode="range"
          disabled={disabled}
          initialFocus={initialFocus}
          required={true}
          classNames={{
            months: 'flex flex-col sm:flex-row gap-2',
            month: 'flex flex-col gap-3',
            month_caption: 'flex justify-center pt-1 relative items-center w-full mb-4',
            caption_label: 'text-sm font-semibold',
            nav: 'flex items-center gap-1',
            button_previous: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-8 bg-transparent p-0 hover:bg-accent rounded-md transition-colors z-10',
              'absolute left-4 top-3'
            ),
            button_next: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-8 bg-transparent p-0 hover:bg-accent rounded-md transition-colors z-10',
              'absolute right-4 top-3'
            ),
            month_grid: 'w-full border-collapse space-x-1',
            weekdays: 'flex mb-2',
            weekday:
              'text-muted-foreground rounded-md w-9 h-8 font-medium text-xs flex items-center justify-center',
            week: 'flex w-full',
            day: cn(
              'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
              '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            ),
            day_button: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors'
            ),
            day_selected: 'opacity-100 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            range_start:
              'day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground',
            range_end:
              'day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground',
            selected:
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            today: 'bg-accent text-accent-foreground rounded-md font-semibold',
            outside:
              'day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50',
            disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
            range_middle:
              'aria-selected:bg-accent aria-selected:text-accent-foreground',
            hidden: 'invisible',
            ...classNames,
          }}
        />
      ) : (
        <DayPicker
          showOutsideDays={showOutsideDays}
          selected={selected as any}
          onSelect={onSelect as any}
          mode={mode === 'multiple' ? 'multiple' : 'single'}
          disabled={disabled}
          initialFocus={initialFocus}
          {...(mode === 'multiple' && { required: true })}
          classNames={{
            months: 'flex flex-col sm:flex-row gap-2',
            month: 'flex flex-col gap-3',
            month_caption: 'flex justify-center pt-1 relative items-center w-full mb-4',
            caption_label: 'text-sm font-semibold',
            nav: 'flex items-center gap-1',
            button_previous: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-8 bg-transparent p-0 hover:bg-accent rounded-md transition-colors z-10',
              'absolute left-4 top-3'
            ),
            button_next: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-8 bg-transparent p-0 hover:bg-accent rounded-md transition-colors z-10',
              'absolute right-4 top-3'
            ),
            month_grid: 'w-full border-collapse space-x-1',
            weekdays: 'flex mb-2',
            weekday:
              'text-muted-foreground rounded-md w-9 h-8 font-medium text-xs flex items-center justify-center',
            week: 'flex w-full',
            day: cn(
              'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
              'aria-selected:rounded-md [&[aria-selected="true"]>button]:hover:bg-foreground [&[aria-selected="true"]>button]:hover:text-background/85'
            ),
            day_button: cn(
              buttonVariants({ variant: 'ghost' }),
              'size-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors'
            ),
            day_selected: 'opacity-100 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            range_start:
              'day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground',
            range_end:
              'day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground',
            selected:
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            today: 'bg-accent text-accent-foreground rounded-md font-semibold',
            outside:
              'day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50',
            disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
            range_middle:
              'aria-selected:bg-accent aria-selected:text-accent-foreground',
            hidden: 'invisible',
            ...classNames,
          }}
        />
      )}
    </div>
  )
}

export { EnhancedDatePicker }
