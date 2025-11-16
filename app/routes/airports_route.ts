import router from '@adonisjs/core/services/router'
const AirportsController = () => import('#controllers/airports_controller')

router
  .group(() => {
    router.get('/', [AirportsController, 'index'])
    router.post('/', [AirportsController, 'store'])
    router.delete('/:id', [AirportsController, 'destroy'])
    router.put('/:id', [AirportsController, 'update'])
    router.delete('/bulk/delete', [AirportsController, 'bulkDelete'])
  })
  .prefix('/api/airports')
