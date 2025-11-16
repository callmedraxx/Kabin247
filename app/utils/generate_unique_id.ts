import { customAlphabet } from 'nanoid';
import Order from '#models/order';
import { DateTime } from 'luxon';

export function generateNanoId(length: number = 6) {
  const nanoId = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', length);
  return nanoId();
}

// ORD-(Date)-(length todays order)-(last record Id) ---Format
export async function generateUniqueOrderNumber() {
  const currentDate = DateTime.now();
  const formattedDate = currentDate.toFormat('yyyy-MM-dd');
  const records = await Order.query()
    .whereRaw('DATE(created_at) = ?', [currentDate.toISODate()])
    .orderBy('id', 'desc');
  const formattedSequenceNumber = `${records.length + 1}`;

  return `${formattedDate}-${formattedSequenceNumber}`;
}
