import { initTransmit } from '../../lib/transmit';
import React from 'react';

export default function InitTransmit() {
  React.useEffect(() => {
    if (window.transmit) {
      return;
    }

    initTransmit();
  }, []);
  return null;
}
