
'use client';

import { useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'; // Changed useSearchParams to useNextSearchParams
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

interface MonthSelectorProps {
  availableMonths: string[];
  currentMonth: string; // This prop comes from the server/parent: actual month, "" (for homepage default), or "all-time"
  id?: string;
  hideAllTimeOption?: boolean;
}

export default function MonthSelector({ availableMonths, currentMonth, id, hideAllTimeOption = false }: MonthSelectorProps) {
  const router = useRouter();
  const currentUrlSearchParams = useNextSearchParams(); // Renamed for clarity

  const [selectedValue, setSelectedValue] = useState<string>(currentMonth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Sync selectedValue if the prop currentMonth changes (e.g. parent re-rendered due to URL change)
    if (currentMonth !== selectedValue) {
      setSelectedValue(currentMonth);
    }
  }, [currentMonth, selectedValue]);

  useEffect(() => {
    if (isMounted && hideAllTimeOption && (currentMonth === "" || currentMonth === "all-time") && availableMonths.length > 0) {
      // Logic for homepage: if currentMonth indicates a default state and "all-time" is hidden,
      // set a specific month from client-side info and redirect.
      const now = new Date();
      const clientCurrentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      let targetMonth = '';

      if (availableMonths.includes(clientCurrentMonthYear)) {
        targetMonth = clientCurrentMonthYear;
      } else if (availableMonths.length > 0) {
        targetMonth = availableMonths[0]; // First available month from the list
      }

      if (targetMonth) {
        const monthInUrl = currentUrlSearchParams.get('month');
        if (monthInUrl !== targetMonth) { // Only redirect if URL isn't already set to target
          const params = new URLSearchParams(currentUrlSearchParams.toString());
          params.set('month', targetMonth);
          router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
          // After redirect, parent (HomePage) will re-render with new `currentMonth` from URL,
          // which will update `selectedValue` via the other useEffect.
        } else if (selectedValue !== targetMonth) {
           // URL is correct, but internal selectedValue might be stale from initial prop
           setSelectedValue(targetMonth);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, hideAllTimeOption, currentMonth, availableMonths, router, currentUrlSearchParams]);
  // selectedValue removed from deps of this effect to prevent potential loops before redirect syncs currentMonth prop.

  const handleMonthChange = (value: string) => {
    // Optimistically update the value for immediate UI feedback,
    // though it will be re-confirmed by prop change after navigation.
    setSelectedValue(value);

    const params = new URLSearchParams(currentUrlSearchParams.toString());
    if (value === "all-time" && !hideAllTimeOption) {
      params.delete('month');
    } else if (value === "" && hideAllTimeOption) { // Should not happen if UI forces a selection
      params.delete('month');
    } else if (value !== "") {
      params.set('month', value);
    } else { // Fallback for empty selection when "all-time" is not an option (should be rare)
        params.delete('month');
    }
    const currentPath = window.location.pathname;
    router.replace(`${currentPath}?${params.toString()}`);
  };

  const formatMonthDisplay = (monthYear: string) => {
    if (monthYear === "all-time") return "Desde siempre";
    if (monthYear === "") return hideAllTimeOption ? "Seleccionar mes" : "Desde siempre"; // Placeholder for homepage if no month
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (!date || isNaN(date.getTime())) {
       return monthYear; // Fallback if format is incorrect
    }
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };
  
  // Initial rendering: if not mounted and no months, or currentMonth is essentially a placeholder for homepage
  if (!isMounted && availableMonths.length === 0 && (currentMonth === "" || currentMonth === "all-time")) {
     return null; 
  }

  return (
    <Select
      onValueChange={handleMonthChange}
      value={selectedValue} 
    >
      <SelectTrigger id={id} className="w-full sm:w-[220px] bg-card text-sm h-9">
        <SelectValue placeholder={formatMonthDisplay(hideAllTimeOption && !currentMonth && availableMonths.length > 0 ? "" : currentMonth)} />
      </SelectTrigger>
      <SelectContent>
        {!hideAllTimeOption && <SelectItem value="all-time">{formatMonthDisplay("all-time")}</SelectItem>}
        {availableMonths.map(month => (
          <SelectItem key={month} value={month}>
            {formatMonthDisplay(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
