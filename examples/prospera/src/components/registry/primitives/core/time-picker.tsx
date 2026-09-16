"use client";

import * as React from "react";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/registry/primitives/core/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/registry/primitives/core/select";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import { cn } from "@/lib/registry/cn";

interface TimeValue {
  hour: string;
  minute: string;
  period?: "AM" | "PM";
}

interface TimePickerProps {
  value?: TimeValue;
  onChange?: (value: TimeValue | undefined) => void;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
}: TimePickerProps) {
  const [time, setTime] = React.useState<TimeValue | undefined>(value);
  const [isOpen, setIsOpen] = React.useState(false);

  // Generate hours (12-hour format)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return { value: hour.toString().padStart(2, "0"), label: hour.toString() };
  });

  // Generate minutes
  const minutes = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, "0");
    return { value: minute, label: minute };
  });

  const periods = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  const handleTimeChange = (field: keyof TimeValue, val: string) => {
    const newTime = {
      hour: time?.hour || "12",
      minute: time?.minute || "00",
      period: time?.period || "AM",
      [field]: val,
    };
    setTime(newTime);
    onChange?.(newTime);
  };

  const formatTime = (timeValue?: TimeValue) => {
    if (!timeValue) return null;
    return `${timeValue.hour}:${timeValue.minute} ${timeValue.period}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          colorScheme={"neutral"}
          className={cn(
            "flex h-10 w-fit items-center justify-between gap-2 whitespace-nowrap rounded-md border-1 border-input bg-background px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[2px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=open]:border-1 data-[state=open]:border-primary data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='text-'])]:text-muted-foreground",
            !time && "text-muted-foreground",
          )}
        >
          {time ? formatTime(time) : <span>{placeholder}</span>}
          <ThemeIcon name="clock" className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-2">
            <span
              aria-hidden="true"
              className="font-medium text-muted-foreground text-xs"
            >
              Hour
            </span>
            <Select
              value={time?.hour || "12"}
              onValueChange={(val) => handleTimeChange("hour", val)}
            >
              <SelectTrigger className="w-[70px]" aria-label="Hour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-20 p-0">
                {hours.map((hour) => (
                  <SelectItem key={hour.value} value={hour.value}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="mt-6 font-bold text-2xl">:</span>

          <div className="flex flex-col gap-2">
            <span
              aria-hidden="true"
              className="font-medium text-muted-foreground text-xs"
            >
              Minute
            </span>
            <Select
              value={time?.minute || "00"}
              onValueChange={(val) => handleTimeChange("minute", val)}
            >
              <SelectTrigger className="w-[70px]" aria-label="Minute">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] min-w-20 p-0">
                {minutes.map((minute) => (
                  <SelectItem key={minute.value} value={minute.value}>
                    {minute.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span
              aria-hidden="true"
              className="font-medium text-muted-foreground text-xs"
            >
              Period
            </span>
            <Select
              value={time?.period || "AM"}
              onValueChange={(val) =>
                handleTimeChange("period", val as "AM" | "PM")
              }
            >
              <SelectTrigger className="w-[75px]" aria-label="Period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setTime(undefined);
              onChange?.(undefined);
              setIsOpen(false);
            }}
          >
            Clear
          </Button>
          <Button size="sm" className="flex-1" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
