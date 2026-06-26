export interface CalendarMemory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  year_id: number;
  year: number;
}

export interface CalendarData {
  memories: Record<string, CalendarMemory[]>;
  total_dates: number;
  total_memories: number;
}

export interface RouteState {
  openBookModal?: boolean;
  bookDate?: string;
  memoryId?: number;
  fromBookModal?: boolean;
}

export type ViewMode = 'calendar' | 'timeline';