export type DayAvailability = "available" | "limited" | "full" | "closed";

export type DaySummary = {
  date: string;
  weekday: number;
  status: DayAvailability;
  remaining: number;
  total: number;
};

export type PublicSlot = {
  slotId: string;
  startsAt: string;
  endsAt: string;
  remaining: number;
};

export type SlotSummary = {
  live: boolean;
  nextAvailable: string | null;
  days: DaySummary[];
};

export type BookedAppointment = {
  ref: string;
  token: string;
  startsAt: string;
  endsAt: string;
  display: string;
  mapsUrl: string;
  icsDataUri: string;
};

export type BookingBoard = {
  live: boolean;
  days: DaySummary[];
  nextAvailable: string | null;
};
