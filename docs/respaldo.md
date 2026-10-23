# Respaldo de datos — CDC-31 / RF-21

Desde el engrane de Ajustes se descarga un archivo JSON UTF-8, sin conexión ni
servicios externos. El nombre incluye fecha y hora UTC. No modifica los datos.

## Contrato de archivo, versión 1

```json
{
  "formato": "cuaderno-de-cumbres",
  "version": 1,
  "creadoEn": "2026-10-23T18:30:00.000Z",
  "datos": {
    "montanas": [],
    "intentos": [],
    "equipo": [],
    "ejercicios": [],
    "sesiones": []
  }
}
```

El tipo exportado `RespaldoV1` en `src/compartido/servicios/respaldo.ts` define
este contrato. Los elementos conservan todos los campos de `src/compartido/tipos.ts`,
incluidos identificadores, coordenadas, condiciones meteorológicas, clima pendiente,
estado de empacado y series de entrenamiento. Los catálogos incluyen registros
precargados y personalizados. Las tablas vacías se representan con `[]`.
Todas las tablas se leen en una misma transacción de solo lectura para evitar
mezclar estados de distintas escrituras concurrentes.

## Reglas para la futura restauración (RF-22)

- Validar `formato` y `version` antes de escribir. Rechazar versiones desconocidas.
- Validar `creadoEn` como fecha ISO 8601 y las cinco listas obligatorias, sus campos
  y tipos conforme a `tipos.ts`; no basta con convertir el JSON a un tipo TypeScript.
- Conservar los IDs y validar que sean únicos por tabla, que `intentos.montanaId`
  exista en `montanas` y que cada `series[].ejercicioId` exista en `ejercicios`.
- Restaurar todas las tablas en una transacción de escritura, con confirmación
  previa si se reemplazan registros. No generar IDs nuevos ni consultar de nuevo
  el clima guardado.
- La versión del archivo es independiente de la versión de la base de datos.
  Cambios incompatibles requieren una nueva versión del contrato.

La importación no forma parte de CDC-31. El archivo contiene los registros
personales sin cifrar y debe conservarse en un lugar seguro.

## Verificación manual

1. Crear registros en los tres módulos, incluyendo una sesión con varias series.
2. Abrir Ajustes, descargar y analizar el JSON. Comparar las cinco listas con
   IndexedDB; comprobar IDs, acentos, notas, clima nulo/guardado y valores numéricos.
3. Repetir sin conexión y con tablas vacías: la exportación debe seguir funcionando.
4. Pulsar rápidamente varias veces: mientras se prepara solo debe haber una exportación.
5. Simular un fallo de lectura: debe aparecer un error, habilitarse el botón y
   conservarse todos los registros para permitir un nuevo intento.
6. Revisar Ajustes a 320 px de ancho y con teclado: sin desbordamiento horizontal,
   controles accesibles y mensajes de estado anunciados.
