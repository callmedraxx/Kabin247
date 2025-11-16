import { format } from 'date-fns';
import { TZDate } from '@date-fns/tz';

const getTimeZonesList = () => {
  // Get all available time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Loop through all time zones and format their UTC offset
  const timeZonesWithOffset = timeZones.map((zone) => {
    const zoneTime = TZDate.tz(zone);
    const offset = format(zoneTime, 'xxx');
    return { name: zone, offset: offset };
  });

  // Return the time zone list with offsets in the desired format
  return timeZonesWithOffset;
};

export const timeZonesList = getTimeZonesList();
