# Cuaderno de Cumbres

App de montañismo. PWA instalable en Android/iPhone, también usable desde navegador de escritorio.
Proyecto escolar de Oscar Sánchez Hernández y Enrique Anzures Morales (BUAP).

Responde siempre en español.

## Qué hace

Tres módulos:

1. **Cumbres** — registro de intentos de cumbre (montaña, fecha, resultado, notas) con consulta
   automática del clima de ese día vía Open-Meteo.
2. **Equipo** — checklist de equipo por categorías, con reinicio por salida.
3. **Entrenamiento** — sesiones de gimnasio con series, repeticiones y peso.

## Usuario objetivo

Montañistas aficionados **sin conocimientos técnicos**. Esto no es decorativo, manda sobre el diseño:

- Todo en español claro. Nunca mostrar códigos ni nombres de campos de la API.
- Nunca pedir coordenadas escritas a mano: la montaña se elige de una lista.
- Zonas táctiles mínimas de 44×44 px, texto mínimo de 16 px.
- Máximo tres toques para cualquier acción frecuente.
- Toda eliminación pide confirmación.
- El clima se muestra con ícono y frase corta ("Viento fuerte"), además de los valores.

## Stack

| Qué | Con qué |
|---|---|
| Base | Vite + React + TypeScript |
| Estilos | Tailwind CSS (mobile-first) |
| Navegación | React Router — tres pestañas fijas abajo |
| Datos locales | Dexie.js sobre IndexedDB |
| PWA | vite-plugin-pwa |
| Gráfica | Recharts |
| Íconos | lucide-react |
| Clima | API Open-Meteo (sin clave) |
| Hospedaje | Vercel |

**Sin backend, sin cuentas de usuario, sin sincronización.** Todo vive en el dispositivo.
La portabilidad se resuelve con exportar/importar un archivo de respaldo.

## Regla de aislamiento (importante)

```
src/
├── app/                    Navegación, pestañas, layout
├── compartido/
│   ├── tipos.ts            Contrato de datos — CONGELADO
│   ├── db.ts               Todas las tablas de Dexie
│   ├── servicios/          openMeteo.ts, respaldo.ts
│   └── componentes/        Botones, tarjetas, diálogos comunes
└── modulos/
    ├── cumbres/            Módulo 1 — Oscar
    ├── equipo/             Módulo 2 — Enrique
    └── entrenamiento/      Módulo 3 — Enrique
```

Un módulo puede importar de `compartido/`, **nunca** del interior de otro módulo.
Esto es lo que permite que dos personas programen en paralelo sin conflictos.

Si un cambio requiere tocar `compartido/tipos.ts`, **detente y avísalo** en vez de hacerlo:
rompe el trabajo del otro integrante y necesita su aprobación.

## Contrato de datos

```ts
// src/compartido/tipos.ts
export interface Montana {
  id: string; nombre: string;
  latitud: number; longitud: number; altitud: number;  // altitud en metros
  precargada: boolean;
}

export type Resultado = 'cumbre' | 'regreso' | 'cancelado';

export interface Condiciones {
  tempMax: number; tempMin: number;      // °C
  precipitacion: number;                 // mm
  vientoMax: number; rachasMax: number;  // km/h
  codigoClima: number;                   // código WMO
}

export interface Intento {
  id: string; montanaId: string;
  fecha: string;                         // 'YYYY-MM-DD'
  resultado: Resultado; notas: string;
  condiciones: Condiciones | null;
  climaPendiente: boolean;
}

export type Categoria = 'abrigo' | 'tecnico' | 'campamento' | 'comida' | 'botiquin' | 'otros';

export interface ArticuloEquipo {
  id: string; nombre: string; categoria: Categoria; empacado: boolean;
}

export interface Ejercicio { id: string; nombre: string; grupoMuscular: string; }
export interface Serie { ejercicioId: string; repeticiones: number; pesoKg: number; }
export interface Sesion { id: string; fecha: string; series: Serie[]; }
```

## Integración con Open-Meteo

Dos reglas que son fáciles de equivocar:

1. **Elegir el endpoint por antigüedad de la fecha.** Más de 5 días →
   `https://archive-api.open-meteo.com/v1/archive`. Reciente o futura →
   `https://api.open-meteo.com/v1/forecast` con `start_date` y `end_date`.
   El archivo histórico tiene unos días de retraso; por eso el corte.

2. **Mandar siempre `elevation` con la altitud de la montaña.** Sin eso, la temperatura se
   calcula para la altura de la celda del modelo y en el Orizaba da valores irreales.

Parámetros: `latitude`, `longitude`, `elevation`, `start_date`, `end_date`,
`timezone=America/Mexico_City`.

Variables diarias: `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`,
`wind_speed_10m_max`, `wind_gusts_10m_max`, `weather_code`.

**El clima se guarda una sola vez dentro del intento y no se vuelve a consultar.** Es una
fotografía del día: si la API cambia o desaparece, los registros históricos siguen intactos.

Sin conexión: el intento se guarda igual con `climaPendiente: true`, y el clima se completa
cuando vuelva la red.

## Catálogo inicial de montañas

| Montaña | Lat | Lon | Altitud |
|---|---|---|---|
| Pico de Orizaba | 19.0303 | -97.2685 | 5636 |
| Iztaccíhuatl | 19.1789 | -98.6422 | 5230 |
| Nevado de Toluca | 19.1083 | -99.7583 | 4680 |
| La Malinche | 19.2311 | -98.0319 | 4461 |
| Cofre de Perote | 19.4925 | -97.1503 | 4282 |
| Cerro Tláloc | 19.4108 | -98.7128 | 4120 |
| Ajusco | 19.2083 | -99.2583 | 3930 |

## Requerimientos

**Cumbres:** RF-01 crear intento · RF-02 resultado (Cumbre / Me regresé / Cancelado) ·
RF-03 elegir montaña del catálogo · RF-04 clima automático · RF-05 guardar sin conexión ·
RF-06 clima en lenguaje natural · RF-07 lista por fecha descendente · RF-08 editar y borrar.

**Equipo:** RF-09 categorías · RF-10 CRUD de artículos · RF-11 marcar empacado ·
RF-12 avance "X de Y" · RF-13 botón Nueva salida (desmarca todo, con confirmación) ·
RF-14 lista precargada de equipo básico.

**Entrenamiento:** RF-15 crear ejercicios · RF-16 catálogo precargado · RF-17 registrar sesión
con series · RF-18 mostrar la sesión anterior como referencia · RF-19 gráfica de progreso ·
RF-20 editar y borrar sesiones.

**Generales:** RF-21 exportar respaldo · RF-22 importar respaldo · RF-23 atribuciones de
Open-Meteo y OpenStreetMap + aviso de privacidad · RF-24 instrucciones de instalación.

## Alcance del prototipo

Fuera por ahora: selección de montaña en mapa, gráfica de progreso, catálogo precargado de
ejercicios, edición de sesiones. Son los de prioridad baja; van en una segunda versión.

## Orden de construcción

No saltarse el paso 1: define el contrato que ambos integrantes usan.

1. Proyecto base + `tipos.ts` + `db.ts` + navegación de tres pestañas (pantallas vacías).
2. Módulo Cumbres: primero sin clima, luego Open-Meteo, luego sin conexión.
3. Módulo Equipo completo.
4. Módulo Entrenamiento.
5. Respaldo, atribuciones, aviso de privacidad.
6. PWA instalable: manifiesto, íconos, service worker.

Cada paso debe dejar la app compilando y usable.

## Convenciones de git

El tablero es Jira, proyecto **CDC**. Antepón siempre la clave para que Jira enlace el trabajo:

- Rama: `CDC-21-registro-de-intentos`
- Commit: `CDC-21 Agrega el formulario de intento`
- Pull request: `CDC-21 Módulo de registro de intentos`

`main` está protegida: todo entra por pull request, revisado por el otro integrante.

## Notas

- No instalar dependencias que no estén en la tabla del stack sin avisar antes.
- iOS borra los datos de una PWA no instalada tras unos días sin uso. Por eso el aviso de
  instalación y el respaldo son requisitos, no adornos.
- Verificar en ancho de celular: sin scroll horizontal, gutter lateral de 16 px.
