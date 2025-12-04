import { Ignitor } from '@adonisjs/core';
import type { ApplicationService } from '@adonisjs/core/types';

const APP_ROOT = new URL('../', import.meta.url);

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href);
  }
  return import(filePath);
};

const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER });

ignitor.tap((ignitorInstance) => {
  ignitorInstance.booting(async () => {
    await import('#start/env');
  });
});

(ignitor as any).app().then(async (appInstance: ApplicationService) => {
  await appInstance.boot();
  const { default: DataInitializationService } = await import('#services/data_initialization_service');
  console.log('Starting airport re-initialization...');
  await DataInitializationService.initializeAirports(true);
  console.log('Airport re-initialization complete!');
  await appInstance.terminate();
  process.exit(0);
}).catch((error: unknown) => {
  console.error('Error:', error);
  process.exit(1);
});

