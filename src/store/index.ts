import { create } from "zustand";

interface Event {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  description: string;
  allowGuestInvites: boolean;
}

interface AuthState {
  isAdmin: boolean;
  currentAttendeeId: string | null;
  setAdmin: (isAdmin: boolean) => void;
  setCurrentAttendee: (attendeeId: string | null) => void;
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
}

interface StoreState extends AuthState, EventState {}

export const useStore = create<StoreState>((set) => ({
  // Auth state
  isAdmin: false,
  currentAttendeeId: null,
  setAdmin: (isAdmin) => set({ isAdmin }),
  setCurrentAttendee: (attendeeId) => set({ currentAttendeeId: attendeeId }),

  // Event state
  events: [],
  currentEvent: null,
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
}));
