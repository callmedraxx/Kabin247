import Airport from '#models/airport';
import XLSX from 'xlsx';
import app from '@adonisjs/core/services/app';
import logger from '@adonisjs/core/services/logger';

/**
 * Service to initialize airports data from Excel file on server startup
 * Only runs if airports table is empty
 */
export default class DataInitializationService {
  /**
   * Initialize airports data if database is empty
   * @param forceReinitialize - If true, will reinitialize even if airports exist (default: false)
   */
  static async initializeAirports(forceReinitialize: boolean = false) {
    try {
      // Check if airports already exist
      const existingAirportsCount = await Airport.query().count('* as total').first();
      const count = existingAirportsCount ? Number(existingAirportsCount.$extras.total) : 0;

      if (count > 0 && !forceReinitialize) {
        logger.info(`Airports already exist (${count} airports). Skipping initialization.`);
        logger.info(`To force re-initialization, call initializeAirports(true) or clear the airports table.`);
        return;
      }

      if (forceReinitialize && count > 0) {
        logger.warn(`Force re-initialization requested. Clearing existing ${count} airports...`);
        await Airport.query().delete();
        logger.info('Existing airports cleared.');
      }

      logger.info('No airports found. Initializing airports from Excel file...');

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
      
      const fboSheet = workbook.Sheets['FBO'];

      if (!fboSheet) {
        logger.error('FBO sheet not found in Excel file');
        logger.info(`Available sheets: ${workbook.SheetNames.join(', ')}`);
        return;
      }

      // Convert to JSON
      let fboData;
      try {
        fboData = XLSX.utils.sheet_to_json(fboSheet) as Array<{
          Airport_Name?: string;
          FBO_Name?: string;
          FBO_Email?: string;
          FBO_Phone?: string;
          Airport_Code_IATA?: string;
          Airport_Code_ICAO?: string;
        }>;
        logger.info(`Found ${fboData.length} airports in Excel file`);
      } catch (jsonError) {
        logger.error('Error converting sheet to JSON:', jsonError);
        if (jsonError instanceof Error) {
          logger.error(`JSON error message: ${jsonError.message}`);
          logger.error(`JSON error stack: ${jsonError.stack}`);
        }
        return;
      }

      // Prepare airports data
      const airportsToInsert: Array<{
        name: string;
        fboName: string | null;
        fboEmail: string | null;
        fboPhone: string | null;
        iataCode: string | null;
        icaoCode: string | null;
      }> = [];

      // Track unique airports by IATA/ICAO to avoid duplicates
      const seenAirports = new Set<string>();

      logger.info('Processing airport data...');
      let processedCount = 0;
      for (const row of fboData) {
        try {
          processedCount++;
          if (processedCount % 1000 === 0) {
            logger.info(`Processed ${processedCount}/${fboData.length} rows...`);
          }
          
          const airportName = row.Airport_Name ? String(row.Airport_Name).trim() : null;
          const fboName = row.FBO_Name ? String(row.FBO_Name).trim() : null;
          const fboEmail = row.FBO_Email ? String(row.FBO_Email).trim() : null;
          const fboPhone = row.FBO_Phone ? String(row.FBO_Phone).trim() : null;
          let iataCode = row.Airport_Code_IATA ? String(row.Airport_Code_IATA).trim().toUpperCase() : null;
          let icaoCode = row.Airport_Code_ICAO ? String(row.Airport_Code_ICAO).trim().toUpperCase() : null;

          // Skip if no airport name
          if (!airportName || airportName.length === 0) {
            continue;
          }
          
          // Ensure name is not too long (database constraint)
          const maxNameLength = 255;
          const finalAirportName = airportName.length > maxNameLength ? airportName.substring(0, maxNameLength) : airportName;

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
          // Use combination of codes and name to avoid false duplicates
          // Multiple airports can share the same IATA code in different locations
          const uniqueKey = `${iataCode || ''}_${icaoCode || ''}_${airportName}`.toLowerCase();

          if (seenAirports.has(uniqueKey)) {
            continue; // Skip true duplicates
          }
          seenAirports.add(uniqueKey);

          // Handle cases where IATA/ICAO might be swapped
          // IATA codes are typically 3 characters, ICAO are 4 characters
          if (iataCode && icaoCode) {
            if (iataCode.length === 4 && icaoCode.length === 3) {
              // Likely swapped
              [iataCode, icaoCode] = [icaoCode, iataCode];
            }
          }

          airportsToInsert.push({
            name: finalAirportName,
            fboName: fboName && fboName.length > 255 ? fboName.substring(0, 255) : fboName,
            fboEmail: fboEmail && fboEmail.length > 255 ? fboEmail.substring(0, 255) : fboEmail,
            fboPhone: fboPhone && fboPhone.length > 50 ? fboPhone.substring(0, 50) : fboPhone,
            iataCode: iataCode || null,
            icaoCode: icaoCode || null,
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

      logger.info(`Prepared ${airportsToInsert.length} unique airports for insertion`);

      // Insert in batches to avoid memory issues
      // SQLite can handle large batches, but we'll use smaller batches for reliability
      const batchSize = 200;
      let insertedCount = 0;
      const totalBatches = Math.ceil(airportsToInsert.length / batchSize);
      
      logger.info(`Starting insertion of ${airportsToInsert.length} airports in ${totalBatches} batches...`);
      
      for (let i = 0; i < airportsToInsert.length; i += batchSize) {
        const batch = airportsToInsert.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        try {
          await Airport.createMany(batch);
          insertedCount += batch.length;
          logger.info(
            `Inserted batch ${batchNumber}/${totalBatches} (${insertedCount}/${airportsToInsert.length})`
          );
        } catch (batchError) {
          logger.error(`Error inserting batch ${batchNumber}/${totalBatches}:`, batchError);
          if (batchError instanceof Error) {
            logger.error(`Batch error message: ${batchError.message}`);
          }
          // Try inserting one by one to find the problematic record
          logger.info(`Attempting to insert batch ${batchNumber} records individually...`);
          for (const airport of batch) {
            try {
              await Airport.create(airport);
              insertedCount++;
            } catch (singleError) {
              logger.error(`Failed to insert airport: ${JSON.stringify(airport)}`, singleError);
              if (singleError instanceof Error) {
                logger.error(`Single insert error: ${singleError.message}`);
              }
            }
          }
        }
      }
      
      logger.info(`Successfully inserted ${insertedCount} out of ${airportsToInsert.length} airports`);
    } catch (error) {
      logger.error('Error initializing airports:', error);
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

