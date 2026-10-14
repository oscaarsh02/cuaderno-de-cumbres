import Dexie, { type EntityTable } from 'dexie';
import { EQUIPO_PRECARGADO, MONTANAS_PRECARGADAS } from './datosIniciales';
import type { ArticuloEquipo, Ejercicio, Intento, Montana, Sesion } from './tipos';

export const db = new Dexie('cuaderno-de-cumbres') as Dexie & {
  montanas: EntityTable<Montana, 'id'>;
  intentos: EntityTable<Intento, 'id'>;
  equipo: EntityTable<ArticuloEquipo, 'id'>;
  ejercicios: EntityTable<Ejercicio, 'id'>;
  sesiones: EntityTable<Sesion, 'id'>;
};

// Solo se listan los campos por los que se busca u ordena.
const TABLAS = {
  montanas: 'id, nombre',
  intentos: 'id, montanaId, fecha',
  equipo: 'id, categoria',
  ejercicios: 'id, nombre',
  sesiones: 'id, fecha',
};

db.version(1).stores(TABLAS);

// Versión 2: agrega el equipo básico a las bases que ya existían.
// Las tablas no cambian; solo se cargan datos.
db.version(2)
  .stores(TABLAS)
  .upgrade(async (tx) => {
    const equipo = tx.table('equipo');
    if ((await equipo.count()) === 0) await equipo.bulkAdd(EQUIPO_PRECARGADO);
  });

// 'populate' corre una sola vez: cuando la base se crea por primera vez en el dispositivo.
// En una base nueva no corren los upgrade, así que aquí va todo lo precargado.
db.on('populate', (tx) => {
  tx.table('montanas').bulkAdd(MONTANAS_PRECARGADAS);
  tx.table('equipo').bulkAdd(EQUIPO_PRECARGADO);
});
