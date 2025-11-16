import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Airport from '#models/airport';
import XLSX from 'xlsx';
import app from '@adonisjs/core/services/app';

export default class extends BaseSeeder {
  async run() {
    try {
      // Check if airports already exist
      const existingAirportsCount = await Airport.query().count('* as total').first();
      if (existingAirportsCount && Number(existingAirportsCount.$extras.total) > 0) {
        console.log('Airports already exist in database. Skipping seeder.');
        return;
      }

      // Read Excel file
      const excelPath = app.makePath('FlightBridge Report - FBOs and Caterers (1).xlsx');
      const workbook = XLSX.readFile(excelPath);
      const fboSheet = workbook.Sheets['FBO'];
      
      if (!fboSheet) {
        console.error('FBO sheet not found in Excel file');
        return;
      }

      // Convert to JSON
      const fboData = XLSX.utils.sheet_to_json(fboSheet) as Array<{
        Airport_Name?: string;
        FBO_Name?: string;
        FBO_Email?: string;
        FBO_Phone?: string;
        Airport_Code_IATA?: string;
        Airport_Code_ICAO?: string;
      }>;

      console.log(`Found ${fboData.length} airports in Excel file`);

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

      for (const row of fboData) {
        const airportName = row.Airport_Name?.trim();
        const fboName = row.FBO_Name?.trim() || null;
        const fboEmail = row.FBO_Email?.trim() || null;
        const fboPhone = row.FBO_Phone?.trim() || null;
        let iataCode = row.Airport_Code_IATA?.trim().toUpperCase() || null;
        let icaoCode = row.Airport_Code_ICAO?.trim().toUpperCase() || null;

        // Skip if no airport name
        if (!airportName) {
          continue;
        }

        // Create unique key for duplicate detection
        // Use IATA if available, otherwise ICAO, otherwise name
        const uniqueKey = iataCode || icaoCode || airportName;
        
        if (seenAirports.has(uniqueKey)) {
          continue; // Skip duplicates
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
          name: airportName,
          fboName,
          fboEmail,
          fboPhone,
          iataCode: iataCode || null,
          icaoCode: icaoCode || null,
        });
      }

      console.log(`Prepared ${airportsToInsert.length} unique airports for insertion`);

      // Insert in batches to avoid memory issues
      const batchSize = 500;
      for (let i = 0; i < airportsToInsert.length; i += batchSize) {
        const batch = airportsToInsert.slice(i, i + batchSize);
        await Airport.createMany(batch);
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, airportsToInsert.length)}/${airportsToInsert.length})`);
      }

      console.log(`Successfully seeded ${airportsToInsert.length} airports`);
    } catch (error) {
      console.error('Error seeding airports:', error);
      throw error;
    }
  }
}

