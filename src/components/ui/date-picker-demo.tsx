import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { EnhancedDatePicker } from '@/components/ui/enhanced-date-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date())
  const [traditionalDate, setTraditionalDate] = useState<Date | undefined>(new Date())

  // Type-safe wrapper functions
  const handleDateSelect = (selectedDate: Date | Date[] | { from?: Date; to?: Date } | undefined) => {
    if (selectedDate instanceof Date) {
      setDate(selectedDate)
    }
  }

  const handleEventDateSelect = (selectedDate: Date | Date[] | { from?: Date; to?: Date } | undefined) => {
    if (selectedDate instanceof Date) {
      setEventDate(selectedDate)
    }
  }

  const handleTraditionalDateSelect = (selectedDate: Date | Date[] | { from?: Date; to?: Date } | undefined) => {
    if (selectedDate instanceof Date) {
      setTraditionalDate(selectedDate)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Enhanced Date Picker</h2>
        <p className="text-muted-foreground">
          Improved date selection with year/month dropdowns for better user experience
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date of Birth Example */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Date of Birth</h3>
            <p className="text-xs text-muted-foreground">Perfect for selecting birth dates with year/month dropdowns</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select your date of birth"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <EnhancedDatePicker
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                enableYearMonthDropdowns={true}
                yearRange={{ from: 1900, to: new Date().getFullYear() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Event Date Example */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Event Date</h3>
            <p className="text-xs text-muted-foreground">Great for scheduling future events</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !eventDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventDate ? format(eventDate, "PPP") : "Select event date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <EnhancedDatePicker
                mode="single"
                selected={eventDate}
                onSelect={handleEventDateSelect}
                disabled={(date) => date < new Date()}
                enableYearMonthDropdowns={true}
                yearRange={{ from: new Date().getFullYear() - 5, to: new Date().getFullYear() + 5 }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Traditional Calendar Comparison */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Traditional Calendar</h3>
          <p className="text-xs text-muted-foreground">For comparison - requires clicking through months</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !traditionalDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {traditionalDate ? format(traditionalDate, "PPP") : "Select date (traditional)"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <EnhancedDatePicker
              mode="single"
              selected={traditionalDate}
              onSelect={handleTraditionalDateSelect}
              disabled={(date) => date < new Date()}
              enableYearMonthDropdowns={false}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Features List */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold">Key Improvements</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Year/Month Dropdowns:</strong> Direct selection without clicking through months</li>
          <li>• <strong>Better Visual Hierarchy:</strong> Clear labels and improved spacing</li>
          <li>• <strong>Enhanced Styling:</strong> Modern design with better hover states</li>
          <li>• <strong>Flexible Year Ranges:</strong> Customizable for different use cases</li>
          <li>• <strong>Improved Accessibility:</strong> Better focus states and tooltips</li>
        </ul>
      </div>
    </div>
  )
}
