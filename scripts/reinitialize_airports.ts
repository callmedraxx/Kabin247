import app from '@adonisjs/core/services/app';
import { Ignitor } from '@adonisjs/core';

const APP_ROOT = new URL('../', import.meta.url);

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href);
  }
  return import(filePath);
};

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env');
    });
  })
  .app()
  .then(async (app) => {
    await app.boot();
    const { default: DataInitializationService } = await import('#services/data_initialization_service');
    console.log('Starting airport re-initialization...');
    await DataInitializationService.initializeAirports(true);
    console.log('Airport re-initialization complete!');
    await app.terminate();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

