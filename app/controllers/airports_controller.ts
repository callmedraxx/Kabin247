import type { HttpContext } from '@adonisjs/core/http'
import Airport from '#models/airport'

export default class AirportsController {
  /**
   * @swagger
   * /api/airports:
   *   get:
   *     summary: Get airports
   *     tags: [Airports]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query
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
   *         description: List of airports
   */
  async index({ request, response }: HttpContext) {
    try {
      const q = request.input('q', '').trim()
      const page = Math.max(Number(request.input('page', 1)), 1)
      const limit = Math.min(Number(request.input('limit', 20)), 100)

      // Prioritize code search over name search
      const query = Airport.query()

      if (q.length > 0) {
        const searchTerm = q.toUpperCase().trim()
        query.where((sub) => {
          // Search by codes first (IATA/ICAO), then by name/FBO
          sub
            .whereILike('iata_code', `%${searchTerm}%`)
            .orWhereILike('icao_code', `%${searchTerm}%`)
            .orWhereILike('name', `%${q}%`)
            .orWhereILike('fbo_name', `%${q}%`)
        })
        // Order by code matches first, then by name
        query.orderByRaw(
          `CASE 
            WHEN iata_code LIKE ? THEN 1 
            WHEN icao_code LIKE ? THEN 2 
            ELSE 3 
          END`,
          [`%${searchTerm}%`, `%${searchTerm}%`]
        )
        query.orderBy('iata_code', 'asc')
        query.orderBy('icao_code', 'asc')
      } else {
        // Default ordering: by code first, then name
        query.orderByRaw('CASE WHEN iata_code IS NOT NULL THEN 0 ELSE 1 END')
        query.orderBy('iata_code', 'asc')
        query.orderBy('icao_code', 'asc')
        query.orderBy('name', 'asc')
      }

      const total = await query.clone().count('* as total').first()
      const results = await query.offset((page - 1) * limit).limit(limit)

      return response.ok({
        results,
        total: total?.$extras.total ?? 0,
        page,
        hasMore: results.length === limit,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Failed to fetch airports' })
    }
  }

  /**
   * @swagger
   * /api/airports:
   *   post:
   *     summary: Create airport
   *     tags: [Airports]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - fbo_name
   *             properties:
   *               name:
   *                 type: string
   *               fbo_name:
   *                 type: string
   *               fbo_email:
   *                 type: string
   *               fbo_phone:
   *                 type: string
   *               iata_code:
   *                 type: string
   *               icao_code:
   *                 type: string
   *     responses:
   *       201:
   *         description: Airport created successfully
   *       400:
   *         description: Bad request
   */
  async store({ request, response }: HttpContext) {
    try {
      const body = request.only([
        'name',
        'fbo_name',
        'fbo_email',
        'fbo_phone',
        'iata_code',
        'icao_code',
      ])

      if (!body.name || !body.fbo_name) {
        return response.badRequest({ message: 'Name and FBO Name are required.' })
      }

      const airport = await Airport.create({
        name: body.name,
        fboName: body.fbo_name,
        fboEmail: body.fbo_email,
        fboPhone: body.fbo_phone,
        iataCode: body.iata_code,
        icaoCode: body.icao_code,
      })

      return response.created(airport)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Failed to create airport' })
    }
  }

  /**
   * @swagger
   * /api/airports/{id}:
   *   delete:
   *     summary: Delete airport
   *     tags: [Airports]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Airport deleted successfully
   *       404:
   *         description: Airport not found
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const id = params.id
      const airport = await Airport.find(id)

      if (!airport) {
        return response.notFound({ message: 'Airport not found' })
      }

      await airport.delete()
      return response.ok({ success: true, message: 'Airport deleted successfully' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Failed to delete airport' })
    }
  }

  /**
   * @swagger
   * /api/airports/{id}:
   *   put:
   *     summary: Update airport
   *     tags: [Airports]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               fbo_name:
   *                 type: string
   *               fbo_email:
   *                 type: string
   *               fbo_phone:
   *                 type: string
   *               iata_code:
   *                 type: string
   *               icao_code:
   *                 type: string
   *     responses:
   *       200:
   *         description: Airport updated successfully
   *       404:
   *         description: Airport not found
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const airport = await Airport.find(params.id)

      if (!airport) {
        return response.notFound({ message: 'Airport not found' })
      }

      const body = request.only([
        'name',
        'fbo_name',
        'fbo_email',
        'fbo_phone',
        'iata_code',
        'icao_code',
      ])

      airport.name = body.name || airport.name
      airport.fboName = body.fbo_name || airport.fboName
      airport.fboEmail = body.fbo_email || airport.fboEmail
      airport.fboPhone = body.fbo_phone || airport.fboPhone
      airport.iataCode = body.iata_code || airport.iataCode
      airport.icaoCode = body.icao_code || airport.icaoCode

      await airport.save()

      return response.ok({ success: true, message: 'Airport updated successfully', data: airport })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Failed to update airport' })
    }
  }

  /**
   * @swagger
   * /api/airports/bulk/delete:
   *   delete:
   *     summary: Bulk delete airports
   *     tags: [Airports]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ids
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Airports deleted successfully
   *       400:
   *         description: No IDs provided
   */
  async bulkDelete({ request, response }: HttpContext) {
    try {
      const ids = request.input('ids', [])

      if (!Array.isArray(ids) || ids.length === 0) {
        return response.badRequest({ message: 'No IDs provided for deletion' })
      }

      await Airport.query().whereIn('id', ids).delete()

      return response.ok({ success: true, message: 'Airports deleted successfully' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Failed to delete airports' })
    }
  }
}
