import type { HttpContext } from '@adonisjs/core/http';
import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (go up from app/controllers to project root)
const projectRoot = join(__dirname, '../..');

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kabin247 API Documentation',
      version: '1.0.0',
      description: 'API documentation for Kabin247 application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'adonis-session',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Menu Items', description: 'Menu item management endpoints' },
      { name: 'Categories', description: 'Category management endpoints' },
      { name: 'Reservations', description: 'Reservation management endpoints' },
      { name: 'Variants', description: 'Variant management endpoints' },
      { name: 'Addons', description: 'Addon management endpoints' },
      { name: 'Charges', description: 'Charge management endpoints' },
      { name: 'Coupons', description: 'Coupon management endpoints' },
      { name: 'Payments', description: 'Payment endpoints' },
      { name: 'Promotions', description: 'Promotion management endpoints' },
      { name: 'Reports', description: 'Report endpoints' },
      { name: 'Notifications', description: 'Notification endpoints' },
      { name: 'Settings', description: 'Settings endpoints' },
      { name: 'Airports', description: 'Airport management endpoints' },
    ],
  },
  apis: [
    join(projectRoot, 'app/controllers/**/*.ts'),
    join(projectRoot, 'app/routes/**/*.ts'),
    join(projectRoot, 'start/routes.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default class SwaggerController {
  /**
   * @swagger
   * /api-docs:
   *   get:
   *     summary: Get OpenAPI specification
   *     tags: [Swagger]
   *     responses:
   *       200:
   *         description: OpenAPI specification JSON
   */
  async getSpec({ response }: HttpContext) {
    return response.json(swaggerSpec);
  }

  /**
   * @swagger
   * /api-docs/ui:
   *   get:
   *     summary: Swagger UI interface
   *     tags: [Swagger]
   *     responses:
   *       200:
   *         description: Swagger UI HTML page
   */
  async getUI({ response }: HttpContext) {
    try {
      // Swagger UI HTML template using CDN
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kabin247 API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.30.2/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.30.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.30.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api-docs',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null
      });
    };
  </script>
</body>
</html>`;

      return response.type('text/html').send(html);
    } catch (error) {
      return response.status(500).json({ 
        error: 'Failed to load Swagger UI',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

