import { DateTime } from 'luxon';

export const compareDate = (dateTime: DateTime, days: number = 7) => {
  const now = DateTime.now();
  const createdDate = DateTime.fromISO(dateTime.toFormat('yyyy-MM-dd'));
  const daysAgo = now.minus({ days });

  return createdDate >= daysAgo && createdDate <= now;
};
