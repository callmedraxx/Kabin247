import type { HttpContext } from '@adonisjs/core/http';
import Caterer from '#models/caterer';

export default class CaterersController {
  /**
   * @swagger
   * /api/caterers:
   *   get:
   *     summary: Get caterers
   *     tags: [Caterers]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query
   *       - in: query
   *         name: airport_id
   *         schema:
   *           type: integer
   *         description: Filter by airport ID
   *       - in: query
   *         name: iata
   *         schema:
   *           type: string
   *         description: Filter by IATA code
   *       - in: query
   *         name: icao
   *         schema:
   *           type: string
   *         description: Filter by ICAO code
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: List of caterers
   */
  async index({ request, response }: HttpContext) {
    try {
      const q = request.input('q', '').trim();
      const airportId = request.input('airport_id');
      const iata = request.input('iata');
      const icao = request.input('icao');
      const page = Math.max(Number(request.input('page', 1)), 1);
      const limit = Math.min(Number(request.input('limit', 20)), 100);

      const query = Caterer.query().preload('airport').where('is_active', true);

      // Filter by airport if provided
      if (airportId) {
        query.where('airport_id', airportId);
      }

      // Filter by IATA code if provided
      if (iata) {
        query.where('iata_code', iata.toUpperCase());
      }

      // Filter by ICAO code if provided
      if (icao) {
        query.where('icao_code', icao.toUpperCase());
      }

      // Search query
      if (q.length > 0) {
        const searchTerm = q.toUpperCase().trim();
        query.where((sub) => {
          sub
            .whereILike('iata_code', `%${searchTerm}%`)
            .orWhereILike('icao_code', `%${searchTerm}%`)
            .orWhereILike('name', `%${q}%`)
            .orWhereILike('email', `%${q}%`);
        });
        // Order by code matches first
        query.orderByRaw(
          `CASE 
            WHEN iata_code LIKE ? THEN 1 
            WHEN icao_code LIKE ? THEN 2 
            ELSE 3 
          END`,
          [`%${searchTerm}%`, `%${searchTerm}%`]
        );
        query.orderBy('iata_code', 'asc');
        query.orderBy('icao_code', 'asc');
      } else {
        // Default ordering: by code first, then name
        query.orderByRaw('CASE WHEN iata_code IS NOT NULL THEN 0 ELSE 1 END');
        query.orderBy('iata_code', 'asc');
        query.orderBy('icao_code', 'asc');
        query.orderBy('name', 'asc');
      }

      const total = await query.clone().count('* as total').first();
      const results = await query.offset((page - 1) * limit).limit(limit);

      return response.ok({
        results,
        total: total?.$extras.total ?? 0,
        page,
        hasMore: results.length === limit,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Failed to fetch caterers' });
    }
  }

  /**
   * @swagger
   * /api/caterers/{id}:
   *   get:
   *     summary: Get caterer by ID
   *     tags: [Caterers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Caterer details
   *       404:
   *         description: Caterer not found
   */
  async show({ params, response }: HttpContext) {
    try {
      const caterer = await Caterer.query()
        .where('id', params.id)
        .preload('airport')
        .first();

      if (!caterer) {
        return response.notFound({ message: 'Caterer not found' });
      }

      return response.ok(caterer);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Failed to fetch caterer' });
    }
  }
}
