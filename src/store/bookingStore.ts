import { create } from 'zustand'

export interface SelectedService {
  id: string
  name: string
  durationMinutes: number
  price: number
}

interface BookingState {
  selectedServices: SelectedService[]
  selectedBarberId: string | null
  selectedBarberName: string | null
  selectedDate: Date | null
  selectedSlot: string | null
  totalDuration: number
  totalPrice: number

  addService: (service: SelectedService) => void
  removeService: (serviceId: string) => void
  toggleService: (service: SelectedService) => void
  selectBarber: (barberId: string, barberName: string) => void
  selectDate: (date: Date) => void
  selectSlot: (slot: string) => void
  reset: () => void
}

function totals(services: SelectedService[]) {
  return {
    totalDuration: services.reduce((acc, s) => acc + s.durationMinutes, 0),
    totalPrice: services.reduce((acc, s) => acc + s.price, 0),
  }
}

const initial = {
  selectedServices: [] as SelectedService[],
  selectedBarberId: null,
  selectedBarberName: null,
  selectedDate: null,
  selectedSlot: null,
  totalDuration: 0,
  totalPrice: 0,
}

// NÃO usar persist — o fluxo de agendamento não deve sobreviver ao refresh.
export const useBookingStore = create<BookingState>((set) => ({
  ...initial,

  addService: (service) =>
    set((state) => {
      if (state.selectedServices.some((s) => s.id === service.id)) return state
      const selectedServices = [...state.selectedServices, service]
      return { selectedServices, ...totals(selectedServices) }
    }),

  removeService: (serviceId) =>
    set((state) => {
      const selectedServices = state.selectedServices.filter((s) => s.id !== serviceId)
      return { selectedServices, ...totals(selectedServices) }
    }),

  toggleService: (service) =>
    set((state) => {
      const exists = state.selectedServices.some((s) => s.id === service.id)
      const selectedServices = exists
        ? state.selectedServices.filter((s) => s.id !== service.id)
        : [...state.selectedServices, service]
      return { selectedServices, ...totals(selectedServices) }
    }),

  selectBarber: (barberId, barberName) =>
    set({ selectedBarberId: barberId, selectedBarberName: barberName }),

  selectDate: (date) => set({ selectedDate: date, selectedSlot: null }),

  selectSlot: (slot) => set({ selectedSlot: slot }),

  reset: () => set({ ...initial }),
}))
