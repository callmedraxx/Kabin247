import { Transmit } from '@adonisjs/transmit-client';

export const initTransmit = () => {
  // set transmit instance as a global variable
  // so that it can be accessed from anywhere

  if (globalThis.transmit) {
    return globalThis.transmit;
  }

  globalThis.transmit = new Transmit({ baseUrl: window.location.origin });
  return transmit;
};
