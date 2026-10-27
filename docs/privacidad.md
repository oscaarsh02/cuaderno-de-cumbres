# CDC-33 — Atribuciones y privacidad (RF-23)

La pantalla `/ajustes/privacidad` se abre desde Ajustes y desde el detalle del
clima. El contenido está incluido en la aplicación y no descarga documentos
externos para mostrarse. Los enlaces de las fuentes se abren en otra pestaña,
con `noopener noreferrer` y una indicación visible de sitio externo.

## Alcance del aviso

Se contrastó el texto con `db.ts`, `openMeteo.ts`, `clima.ts`, los servicios de
respaldo/restauración y las dependencias del proyecto:

- Registros locales en IndexedDB, sin cuentas ni sincronización automática.
- Las consultas a Open-Meteo transmiten coordenadas y altitud de la montaña,
  fecha y zona horaria. La aplicación no solicita GPS ni envía notas o sesiones.
- El aviso distingue los registros locales de las solicitudes de red y la IP
  visible para los proveedores. No promete que ningún dato salga del dispositivo.
- Explica la descarga de respaldos sin cifrar, las copias compartidas o guardadas
  en carpetas sincronizadas, la restauración local y el borrado de datos.
- No se añadieron cookies, analítica, llamadas de red ni dependencias.

## Fuentes de atribución

- Open-Meteo: https://open-meteo.com/en/terms
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/deed.es
- OpenStreetMap: https://www.openstreetmap.org/copyright
- ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/

Se indica la adaptación visual de los datos meteorológicos (redondeo, iconos y
descripciones). Se incluye el crédito a los colaboradores de OpenStreetMap
solicitado por RF-23, sin atribuirle una procedencia no documentada del catálogo
de montañas: esta versión no integra mapas ni consultas a servicios de OSM.
Si se incorpora un mapa, también deberá mostrarse la atribución correspondiente
en el propio mapa. Revisar el aviso cuando cambien los servicios o datos enviados.

## Verificación manual

1. Abrir Ajustes → Atribuciones y privacidad y volver a Ajustes.
2. Abrir el enlace desde un intento con clima guardado.
3. Comprobar textos, destinos de las licencias y navegación con teclado.
4. Comprobar a 320 px de ancho que no exista desbordamiento horizontal.
5. Con la aplicación ya cargada, desconectar la red y volver a abrir la pantalla:
   el contenido debe seguir disponible; solo los enlaces externos requieren red.
