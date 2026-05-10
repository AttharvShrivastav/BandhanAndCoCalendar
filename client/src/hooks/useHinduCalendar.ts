import { useQuery } from "@tanstack/react-query";

export interface HinduEvent {
  id: number;
  date: string;
  name: string;
  type: string;
  nakshatra?: string;
  timing?: string;
}

export function useHinduCalendar(year?: string) {
  // Fetch the data from our new backend route
  const { data: events = [], isLoading } = useQuery<HinduEvent[]>({
    queryKey: year ? ["/api/calendar-events", year] : ["/api/calendar-events"],
    queryFn: async () => {
      const url = year ? `/api/calendar-events?year=${year}` : "/api/calendar-events";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch calendar");
      return res.json();
    },
    // Cache the data for 24 hours so it doesn't spam the database on every page load
    staleTime: 1000 * 60 * 60 * 24, 
  });

  // Recreate the exact same helper functions you had before!
  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);
  const isAuspicious = (dateStr: string) => events.some(e => e.date === dateStr && e.type === "muhurat");
  const isFestival = (dateStr: string) => events.some(e => e.date === dateStr && e.type === "festival");
  const isInauspicious = (dateStr: string) => events.some(e => e.date === dateStr && e.type === "inauspicious");

  return {
    events,
    isLoading,
    getEventsForDate,
    isAuspicious,
    isFestival,
    isInauspicious
  };
}