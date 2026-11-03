import Dexie, { type EntityTable } from 'dexie';
import { EJERCICIOS_PRECARGADOS, EQUIPO_PRECARGADO, MONTANAS_PRECARGADAS } from './datosIniciales';
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

// Versión 3: agrega el catálogo de ejercicios a las bases que ya existían.
// Aquí ya puede haber ejercicios creados a mano, así que solo se agregan los que
// no tengan uno con el mismo nombre (sin importar mayúsculas ni acentos).
db.version(3)
  .stores(TABLAS)
  .upgrade(async (tx) => {
    const ejercicios = tx.table<Ejercicio, string>('ejercicios');
    const existentes = new Set((await ejercicios.toArray()).map((e) => normalizar(e.nombre)));
    await ejercicios.bulkAdd(EJERCICIOS_PRECARGADOS.filter((e) => !existentes.has(normalizar(e.nombre))));
  });

function normalizar(nombre: string): string {
  return nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
}

// 'populate' corre una sola vez: cuando la base se crea por primera vez en el dispositivo.
// En una base nueva no corren los upgrade, así que aquí va todo lo precargado.
db.on('populate', (tx) => {
  tx.table('montanas').bulkAdd(MONTANAS_PRECARGADAS);
  tx.table('equipo').bulkAdd(EQUIPO_PRECARGADO);
  tx.table('ejercicios').bulkAdd(EJERCICIOS_PRECARGADOS);
});
