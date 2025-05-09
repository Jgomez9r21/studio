
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "buttons", // Default caption layout
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: captionLayout === "dropdown-buttons" ? "hidden" : "text-sm font-medium", // Hide default label when dropdowns are used
        caption_dropdowns: "flex gap-1", // Style for dropdown container
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "text-accent-foreground", // Default today styling, can be overridden by modifiers or other classes
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", 
        day_disabled: "text-muted-foreground opacity-50 !cursor-not-allowed", // Ensure disabled days show not-allowed cursor
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames, // Allow overriding any class via props
      }}
      components={{
        IconLeft: ({ className: iconClassName, ...iconProps }) => ( // Renamed className to avoid conflict
          <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
        ),
        IconRight: ({ className: iconClassName, ...iconProps }) => ( // Renamed className to avoid conflict
          <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
        ),
      }}
      captionLayout={captionLayout} // Pass captionLayout prop
      fromYear={fromYear} // Pass fromYear prop
      toYear={toYear} // Pass toYear prop
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

