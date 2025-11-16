import { Transmit } from '@adonisjs/transmit-client';

declare global {
  interface Window {
    currency: {
      code: string;
      symbolPosition: 'left' | 'right';
    };

    transmit: Transmit;
  }

  var transmit: Transmit;
}

export {};
