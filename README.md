# My Billing

Herramienta para ahorrar en las facturas.

## Roadmap

- [x] Notificación sobre el precio del gasoil
- [x] Notificación sobre el precio de la luz por franjas
- [ ] App móvil para mostrar el precio de la luz por franjas y recibir notificaciones
- [ ] Mostrar más precios de combustibles
- [ ] Realizar previsión de gastos mensuales

## Development

- Instalar [Azure Functions Core Tools](https://docs.microsoft.com/es-es/azure/azure-functions/functions-run-local?tabs=v4%2Cmacos%2Ccsharp%2Cportal%2Cbash)
- Ejecutar `Azurite` mediante docker para simular blob storage: `docker run -p 10000:10000 mcr.microsoft.com/azure-storage/azurite azurite-blob --blobHost 0.0.0.0`

## Deployment

- Ejecutar `npm run zip`, luego ejecutar `npm run deploy`
