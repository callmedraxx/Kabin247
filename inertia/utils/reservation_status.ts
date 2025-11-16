export type ReservationStatusType = {
  label: string;
  value: string;
  scheme: string;
  fgColor: string;
  bgColor: string;
};

export const reservationStatus: ReservationStatusType[] = [
  { label: 'Booked', value: 'booked', scheme: 'purple', fgColor: '#805AD5', bgColor: '#FFF' },
  { label: 'Canceled', value: 'cancelled', scheme: 'red', fgColor: '#E53E3E', bgColor: '#FFF' },
  { label: 'Completed', value: 'completed', scheme: 'green', fgColor: '#38A169', bgColor: '#FFF' },
];
