import { Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export default function Clock() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return (
    <Text as="p" className="font-bold whitespace-nowrap">
      {`${displayHours}:${displayMinutes} ${ampm}`}
    </Text>
  );
}
