# Swagger API Documentation

This project uses Swagger UI for interactive API documentation.

## Accessing the Documentation

Once your server is running, you can access the Swagger UI at:

- **Swagger UI**: `http://localhost:3333/api-docs/ui`
- **OpenAPI JSON Spec**: `http://localhost:3333/api-docs`

## How It Works

The Swagger documentation is generated from JSDoc comments in your controller files using the `swagger-jsdoc` package. The documentation is served via:

1. **SwaggerController** (`app/controllers/swagger_controller.ts`) - Handles serving the OpenAPI spec and Swagger UI
2. **Routes** (`start/routes.ts`) - Defines the `/api-docs` and `/api-docs/ui` endpoints

## Adding Documentation to Your Controllers

To document an API endpoint, add Swagger JSDoc comments above your controller method:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Brief description of the endpoint
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *               - field2
 *             properties:
 *               field1:
 *                 type: string
 *                 example: value1
 *               field2:
 *                 type: number
 *                 example: 123
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 */
async yourMethod({ request, response }: HttpContext) {
  // Your implementation
}
```

## Security Documentation

For endpoints that require authentication, add security schemes:

```typescript
/**
 * @swagger
 * /api/protected-endpoint:
 *   get:
 *     summary: Protected endpoint
 *     tags: [YourTag]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
```

## Example

See `app/controllers/auth_controller.ts` for examples of documented endpoints including:
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- GET `/api/auth/check`
- POST `/api/auth/logout`

## Available Tags

The following tags are pre-configured in the Swagger setup:
- Auth
- Users
- Orders
- Menu Items
- Categories
- Reservations
- Variants
- Addons
- Charges
- Coupons
- Payments
- Promotions
- Reports
- Notifications
- Settings
- Airports

## Customization

To customize the Swagger configuration, edit the `swaggerOptions` object in `app/controllers/swagger_controller.ts`. You can:

- Update server URLs
- Add/modify tags
- Change API information (title, version, description)
- Modify security schemes

## Resources

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

