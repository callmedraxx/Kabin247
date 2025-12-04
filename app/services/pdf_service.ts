import puppeteer from 'puppeteer-core';
import type { HttpContext } from '@adonisjs/core/http';
import { existsSync } from 'node:fs';

class PdfService {
  /**
   * Generate PDF from HTML invoice template
   */
  async generateInvoicePdf(
    view: HttpContext['view'],
    templateData: {
      order: any;
      itemsForPrint: any[];
      orderCharges: Array<{ name: string; amount: number }>;
      formattedDate: string;
      businessInfo: any;
      baseUrl: string;
    }
  ): Promise<Buffer> {
    let browser;
    try {
      // Render HTML from Edge template
      const html = await view.render('invoice', templateData);

      // Launch browser with appropriate executable
      const browserOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      };

      // Try to find Chrome/Chromium executable
      const possiblePaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        '/snap/chromium/current/usr/lib/chromium-browser/chrome', // Snap Chromium
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      ].filter(Boolean);

      let executablePath: string | undefined;
      for (const path of possiblePaths) {
        if (path && existsSync(path)) {
          executablePath = path;
          break;
        }
      }

      // If no executable found, try to use puppeteer's browser detection
      if (!executablePath) {
        try {
          // Try to get the executable path from @puppeteer/browsers
          const puppeteerBrowsers = await import('@puppeteer/browsers');
          // Check if getInstalledBrowserPath exists (it may not in all versions)
          if ('getInstalledBrowserPath' in puppeteerBrowsers && typeof puppeteerBrowsers.getInstalledBrowserPath === 'function') {
            const browserPath = await puppeteerBrowsers.getInstalledBrowserPath({
              browser: 'chrome',
              buildId: 'latest',
            });
            if (browserPath) executablePath = browserPath;
          }
        } catch (error) {
          // If that fails, we cannot proceed without an executable path
          console.warn('Could not auto-detect Chrome executable via @puppeteer/browsers');
        }
      }

      // puppeteer-core REQUIRES an executablePath or channel to be specified
      if (!executablePath) {
        const errorMessage = 'No Chrome/Chromium executable found. Please install Chromium or set PUPPETEER_EXECUTABLE_PATH environment variable.';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      browserOptions.executablePath = executablePath;

      browser = await puppeteer.launch(browserOptions);

      const page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });

      // Convert relative image URLs to absolute if needed
      // The template should already use absolute URLs, but we ensure it
      const processedHtml = html.replace(
        /src="([^"]+)"/g,
        (match: string, url: string) => {
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return match;
          }
          if (url.startsWith('/')) {
            const baseUrl = templateData.baseUrl || 'https://app.kabin247.com';
            return `src="${baseUrl}${url}"`;
          }
          return match;
        }
      );

      // Set content and wait for images to load
      await page.setContent(processedHtml, {
        waitUntil: ['networkidle0', 'load'],
        timeout: 30000,
      });

      // Wait a bit more for any lazy-loaded images
      // Note: This code runs in the browser context via page.evaluate()
      // We use type assertions since DOM types aren't available in Node.js context
      await page.evaluate(() => {
        // @ts-expect-error - document is available in browser context
        const images = Array.from(document.images || []);
        return Promise.all(
          images.map((img: unknown) => {
            const imgElement = img as { complete?: boolean; onload?: () => void; onerror?: () => void };
            if (imgElement.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
              imgElement.onload = () => resolve();
              imgElement.onerror = () => resolve(); // Continue even if image fails
              setTimeout(() => resolve(), 2000); // Timeout after 2s
            });
          })
        );
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm',
        },
        preferCSSPageSize: false,
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default new PdfService();


