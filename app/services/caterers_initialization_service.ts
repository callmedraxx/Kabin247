import Caterer from '#models/caterer';
import Airport from '#models/airport';
import XLSX from 'xlsx';
import app from '@adonisjs/core/services/app';
import logger from '@adonisjs/core/services/logger';

/**
 * Service to initialize caterers data from Excel file on server startup
 * Only runs if caterers table is empty
 */
export default class CaterersInitializationService {
  /**
   * Initialize caterers data if database is empty
   * @param forceReinitialize - If true, will reinitialize even if caterers exist (default: false)
   */
  static async initializeCaterers(forceReinitialize: boolean = false) {
    try {
      // Check if caterers table exists first by trying to query it
      let count = 0;
      try {
        const existingCaterersCount = await Caterer.query().count('* as total').first();
        count = existingCaterersCount ? Number(existingCaterersCount.$extras.total) : 0;
      } catch (error: any) {
        // Table doesn't exist yet - migrations need to be run first
        if (error?.message?.includes("doesn't exist") || error?.code === 'ER_NO_SUCH_TABLE' || error?.message?.includes('Table')) {
          logger.warn('Caterers table does not exist yet. Please run migrations first: node ace migration:run');
          return;
        }
        throw error;
      }

      if (count > 0 && !forceReinitialize) {
        logger.info(`Caterers already exist (${count} caterers). Skipping initialization.`);
        return;
      }

      if (forceReinitialize && count > 0) {
        logger.warn(`Force re-initialization requested. Clearing existing ${count} caterers...`);
        await Caterer.query().delete();
        logger.info('Existing caterers cleared.');
      }

      logger.info('No caterers found. Initializing caterers from Excel file...');

      // Read Excel file - try multiple possible paths
      const fs = await import('fs');
      const path = await import('path');

      let excelPath = app.makePath('FlightBridge Report - FBOs and Caterers (1).xlsx');

      // If makePath doesn't find it, try project root
      if (!fs.existsSync(excelPath)) {
        // Try project root - app.appRoot is a URL, convert to file path
        const appRootUrl = app.appRoot;
        const projectRoot = appRootUrl.pathname || appRootUrl.toString().replace('file://', '');
        excelPath = path.join(projectRoot, 'FlightBridge Report - FBOs and Caterers (1).xlsx');
      }

      if (!fs.existsSync(excelPath)) {
        logger.error(`Excel file not found. Tried: ${excelPath}`);
        logger.error(`App root: ${app.appRoot}`);
        return;
      }

      logger.info(`Reading Excel file from: ${excelPath}`);

      let workbook;
      try {
        workbook = XLSX.readFile(excelPath);
        logger.info('Excel file read successfully');
      } catch (readError) {
        logger.error('Error reading Excel file:', readError);
        if (readError instanceof Error) {
          logger.error(`Read error message: ${readError.message}`);
          logger.error(`Read error stack: ${readError.stack}`);
        }
        return;
      }

      const catererSheet = workbook.Sheets['Caterer'];

      if (!catererSheet) {
        logger.error('Caterer sheet not found in Excel file');
        logger.info(`Available sheets: ${workbook.SheetNames.join(', ')}`);
        return;
      }

      // Convert to JSON
      let catererData;
      try {
        catererData = XLSX.utils.sheet_to_json(catererSheet) as Array<{
          Caterer_Name?: string;
          Caterer_Number?: string;
          Caterer_Email?: string;
          IATA?: string;
          ICAO?: string;
          Time_Zone?: string;
        }>;
        logger.info(`Found ${catererData.length} caterers in Excel file`);
      } catch (jsonError) {
        logger.error('Error converting sheet to JSON:', jsonError);
        if (jsonError instanceof Error) {
          logger.error(`JSON error message: ${jsonError.message}`);
          logger.error(`JSON error stack: ${jsonError.stack}`);
        }
        return;
      }

      // Get all airports for matching
      const airports = await Airport.all();
      const airportMap = new Map<string, Airport>();

      // Create maps for IATA and ICAO lookups
      airports.forEach((airport) => {
        if (airport.iataCode) {
          airportMap.set(airport.iataCode.toUpperCase(), airport);
        }
        if (airport.icaoCode) {
          airportMap.set(airport.icaoCode.toUpperCase(), airport);
        }
      });

      logger.info(`Loaded ${airports.length} airports for matching`);

      // Prepare caterers data
      const caterersToInsert: Array<{
        name: string;
        email: string | null;
        phone: string | null;
        iataCode: string | null;
        icaoCode: string | null;
        timeZone: string | null;
        airportId: number | null;
        isActive: boolean;
      }> = [];

      // Track unique caterers to avoid duplicates
      const seenCaterers = new Set<string>();

      logger.info('Processing caterer data...');
      let processedCount = 0;

      for (const row of catererData) {
        try {
          processedCount++;
          if (processedCount % 500 === 0) {
            logger.info(`Processed ${processedCount}/${catererData.length} rows...`);
          }

          const catererName = row.Caterer_Name ? String(row.Caterer_Name).trim() : null;
          const email = row.Caterer_Email ? String(row.Caterer_Email).trim() : null;
          const phone = row.Caterer_Number ? String(row.Caterer_Number).trim() : null;
          let iataCode = row.IATA ? String(row.IATA).trim().toUpperCase() : null;
          let icaoCode = row.ICAO ? String(row.ICAO).trim().toUpperCase() : null;
          const timeZone = row.Time_Zone ? String(row.Time_Zone).trim() : null;

          // Skip if no caterer name
          if (!catererName || catererName.length === 0) {
            continue;
          }

          // Truncate codes to max 4 characters (database constraint)
          if (iataCode && iataCode.length > 4) {
            logger.warn(`IATA code too long, truncating: ${iataCode} -> ${iataCode.substring(0, 4)}`);
            iataCode = iataCode.substring(0, 4);
          }
          if (icaoCode && icaoCode.length > 4) {
            logger.warn(`ICAO code too long, truncating: ${icaoCode} -> ${icaoCode.substring(0, 4)}`);
            icaoCode = icaoCode.substring(0, 4);
          }

          // Create unique key for duplicate detection
          // Use combination of name, email, and codes
          const uniqueKey = `${catererName}_${email || ''}_${iataCode || ''}_${icaoCode || ''}`.toLowerCase();

          if (seenCaterers.has(uniqueKey)) {
            continue; // Skip true duplicates
          }
          seenCaterers.add(uniqueKey);

          // Find matching airport by IATA or ICAO code
          let airportId: number | null = null;
          if (iataCode && airportMap.has(iataCode)) {
            airportId = airportMap.get(iataCode)!.id;
          } else if (icaoCode && airportMap.has(icaoCode)) {
            airportId = airportMap.get(icaoCode)!.id;
          }

          caterersToInsert.push({
            name: catererName.length > 255 ? catererName.substring(0, 255) : catererName,
            email: email && email.length > 255 ? email.substring(0, 255) : email,
            phone: phone && phone.length > 50 ? phone.substring(0, 50) : phone,
            iataCode: iataCode || null,
            icaoCode: icaoCode || null,
            timeZone: timeZone && timeZone.length > 100 ? timeZone.substring(0, 100) : timeZone,
            airportId,
            isActive: true,
          });
        } catch (rowError) {
          logger.error(`Error processing row ${processedCount}:`, rowError);
          if (rowError instanceof Error) {
            logger.error(`Row error message: ${rowError.message}`);
            logger.error(`Row error stack: ${rowError.stack}`);
          }
          logger.error(`Problematic row data: ${JSON.stringify(row)}`);
          // Continue processing other rows
        }
      }

      logger.info(`Prepared ${caterersToInsert.length} unique caterers for insertion`);

      // Insert in batches to avoid memory issues
      const batchSize = 200;
      let insertedCount = 0;
      const totalBatches = Math.ceil(caterersToInsert.length / batchSize);

      logger.info(`Starting insertion of ${caterersToInsert.length} caterers in ${totalBatches} batches...`);

      for (let i = 0; i < caterersToInsert.length; i += batchSize) {
        const batch = caterersToInsert.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        try {
          await Caterer.createMany(batch);
          insertedCount += batch.length;
          logger.info(
            `Inserted batch ${batchNumber}/${totalBatches} (${insertedCount}/${caterersToInsert.length})`
          );
        } catch (batchError) {
          logger.error(`Error inserting batch ${batchNumber}/${totalBatches}:`, batchError);
          if (batchError instanceof Error) {
            logger.error(`Batch error message: ${batchError.message}`);
          }
          // Try inserting one by one to find the problematic record
          logger.info(`Attempting to insert batch ${batchNumber} records individually...`);
          for (const caterer of batch) {
            try {
              await Caterer.create(caterer);
              insertedCount++;
            } catch (singleError) {
              logger.error(`Failed to insert caterer: ${JSON.stringify(caterer)}`, singleError);
              if (singleError instanceof Error) {
                logger.error(`Single insert error: ${singleError.message}`);
              }
            }
          }
        }
      }

      logger.info(`Successfully inserted ${insertedCount} out of ${caterersToInsert.length} caterers`);
    } catch (error) {
      logger.error('Error initializing caterers:', error);
      if (error instanceof Error) {
        logger.error(`Error message: ${error.message}`);
        logger.error(`Error stack: ${error.stack}`);
      } else {
        logger.error(`Error (not Error instance): ${JSON.stringify(error)}`);
        logger.error(`Error type: ${typeof error}`);
        logger.error(`Error constructor: ${error?.constructor?.name}`);
      }
      // Don't throw - allow server to start even if initialization fails
    }
  }
}

