import Dexie, { type EntityTable, type Table } from 'dexie';
import { EJERCICIOS_PRECARGADOS, EQUIPO_PRECARGADO, MONTANAS_PRECARGADAS } from './datosIniciales';
import type { ArticuloEquipo, Ejercicio, Intento, Montana, Perfil, Sesion } from './tipos';
import { normalizar } from './utilidades/texto';

export const db = new Dexie('cuaderno-de-cumbres') as Dexie & {
  montanas: EntityTable<Montana, 'id'>;
  intentos: EntityTable<Intento, 'id'>;
  equipo: EntityTable<ArticuloEquipo, 'id'>;
  ejercicios: EntityTable<Ejercicio, 'id'>;
  sesiones: EntityTable<Sesion, 'id'>;
  perfil: EntityTable<Perfil, 'id'>;
};

// La tabla perfil tiene un solo registro, siempre con este id.
export const ID_PERFIL = 'usuario';

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

// Versión 4: agrega la tabla perfil y el peso a los artículos precargados que
// sigan en la base. Se reconocen por su id fijo; los que creó el usuario no se tocan.
db.version(4)
  .stores({ ...TABLAS, perfil: 'id' })
  .upgrade(async (tx) => {
    const pesos = new Map(EQUIPO_PRECARGADO.map((a) => [a.id, a.pesoGramos]));
    await tx
      .table<ArticuloEquipo, string>('equipo')
      .where('id')
      .anyOf([...pesos.keys()])
      .modify((articulo) => {
        if (articulo.pesoGramos === undefined) articulo.pesoGramos = pesos.get(articulo.id);
      });
  });

// Versión 5: descripción y fotos para los ejercicios precargados que sigan en la base.
// Las tablas no cambian (la foto propia es un campo más, sin índice).
db.version(5)
  .stores({ ...TABLAS, perfil: 'id' })
  .upgrade((tx) => completarEjerciciosPrecargados(tx.table('ejercicios')));

// Agrega descripción y fotos a los ejercicios precargados que no las tengan. Los
// reconoce por su id fijo; no toca los que creó el usuario ni una descripción ya escrita.
// También se usa al restaurar respaldos hechos antes de la versión 5.
export async function completarEjerciciosPrecargados<I>(ejercicios: Table<Ejercicio, string, I>): Promise<void> {
  const precargados = new Map(EJERCICIOS_PRECARGADOS.map((e) => [e.id, e]));
  await ejercicios
    .where('id')
    .anyOf([...precargados.keys()])
    .modify((ejercicio) => {
      const { descripcion, imagenes } = precargados.get(ejercicio.id)!;
      if (ejercicio.descripcion === undefined && descripcion) ejercicio.descripcion = descripcion;
      if (ejercicio.imagenes === undefined && imagenes) ejercicio.imagenes = imagenes;
    });
}

// 'populate' corre una sola vez: cuando la base se crea por primera vez en el dispositivo.
// En una base nueva no corren los upgrade, así que aquí va todo lo precargado.
db.on('populate', (tx) => {
  tx.table('montanas').bulkAdd(MONTANAS_PRECARGADAS);
  tx.table('equipo').bulkAdd(EQUIPO_PRECARGADO);
  tx.table('ejercicios').bulkAdd(EJERCICIOS_PRECARGADOS);
});
