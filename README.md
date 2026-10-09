## Endpoints implementados

Todos los endpoints de propiedades requieren un token JWT:
Authorization: Bearer <token>

- GET /api/listings?page=1&pageSize=20
  Listado de propiedades con paginación opcional.

- GET /api/listings/:id
  Detalle de una propiedad.

- GET /api/listings/property-type/:type
  Propiedades por tipo de alojamiento.
  Parámetros opcionales: page y pageSize.

- GET /api/listings/with-total-price
  Propiedades con totalPrice calculado.
  Parámetros opcionales: page y pageSize.

- GET /api/listings/host/:host_id
  Propiedades de un host.
  Parámetros opcionales: page y pageSize.

- PATCH /api/listings/:id/availability
  Actualización parcial de disponibilidad.
  Body de ejemplo:
  {"availability":{"available_30":20}}

- GET /api/listings/top-hosts?limit=10
  Ranking de hosts por cantidad de propiedades.
  limit es opcional.