import { BaseUserType } from './customer_type';

export type ReservationType = {
  id: number;
  reservationDate: string;
  reservationNote: string;
  numberOfPeople: number;
  tableNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: BaseUserType;
};
