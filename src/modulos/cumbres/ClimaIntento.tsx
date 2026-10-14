import { Droplets, Hourglass, Thermometer, Wind, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Condiciones, Intento } from '../../compartido/tipos';
import { describirCielo, describirViento, redondear, unDecimal } from './descripcionClima';

// Línea corta para la tarjeta de la lista: ícono, frase y temperaturas.
export function ResumenClima({ intento }: { intento: Intento }) {
  const { condiciones } = intento;
  if (!condiciones) return <ClimaPendiente />;

  const { frase, Icono } = describirCielo(condiciones.codigoClima);
  const viento = describirViento(condiciones);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-slate-700">
      <span className="inline-flex items-center gap-1.5">
        <Icono size={20} aria-hidden="true" />
        {frase}
      </span>
      {viento && (
        <span className="inline-flex items-center gap-1.5 font-medium text-amber-900">
          <Wind size={20} aria-hidden="true" />
          {viento}
        </span>
      )}
      <span className="text-slate-600">
        {redondear(condiciones.tempMax)}° / {redondear(condiciones.tempMin)}°
      </span>
    </div>
  );
}

// Bloque completo para la pantalla de edición, con todos los valores.
export function DetalleClima({ intento }: { intento: Intento }) {
  const { condiciones } = intento;

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Clima de ese día</h2>
      {!condiciones ? (
        <ClimaPendiente />
      ) : (
        <>
          <Frases condiciones={condiciones} />
          <dl className="flex flex-col gap-2 text-base">
            <Dato Icono={Thermometer} nombre="Temperatura">
              máx {redondear(condiciones.tempMax)} °C, mín {redondear(condiciones.tempMin)} °C
            </Dato>
            <Dato Icono={Droplets} nombre="Lluvia o nieve">
              {unDecimal(condiciones.precipitacion)} mm
            </Dato>
            <Dato Icono={Wind} nombre="Viento">
              {redondear(condiciones.vientoMax)} km/h, rachas de {redondear(condiciones.rachasMax)} km/h
            </Dato>
          </dl>
          <p className="text-base text-slate-500">Calculado para la altura de la cumbre. Datos de Open-Meteo.</p>
        </>
      )}
    </section>
  );
}

function Frases({ condiciones }: { condiciones: Condiciones }) {
  const { frase, Icono } = describirCielo(condiciones.codigoClima);
  const viento = describirViento(condiciones);
  return (
    <div className="flex flex-col gap-2 text-lg font-medium">
      <span className="inline-flex items-center gap-2">
        <Icono size={28} aria-hidden="true" />
        {frase}
      </span>
      {viento && (
        <span className="inline-flex items-center gap-2 text-amber-900">
          <Wind size={28} aria-hidden="true" />
          {viento}
        </span>
      )}
    </div>
  );
}

function Dato({ Icono, nombre, children }: { Icono: LucideIcon; nombre: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icono size={20} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
      <dt className="font-medium">{nombre}:</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ClimaPendiente() {
  return (
    <p className="inline-flex items-center gap-1.5 text-base text-slate-500">
      <Hourglass size={20} aria-hidden="true" />
      Clima pendiente
    </p>
  );
}
