import {useEffect, useRef, useState} from 'react';
import {flujo} from '../content';
import {clamp, easeOutCubic, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Sección 2 · Flujo · patrón 5 (trazo SVG que se dibuja por tramos) · alto 420 svh
 * Una pista de circuito impreso une los seis pasos del método: perfil → marcos → evaluación →
 * brechas → plan → informe. Cada chip se enciende al llegar la señal; un punto con halo
 * recorre el tramo activo. Debajo, el paso activo con aria-live.
 *
 * Guion de scroll (p):
 *   0.00 – 0.06  cabecera y pista apagada (en gris punteado)
 *   0.06 – 0.92  seis tramos, uno por paso (u = 0…6); en cada tramo la pista se traza,
 *                el chip se enciende con su color y cambia el texto del paso
 *   0.92 – 1.00  quieto: el último paso (informe y dashboard) queda encendido
 */

const ALTO_VH = 420;
const VENTANA = [0.06, 0.92] as const;
const N = flujo.pasos.length;

// Chips en una escalera de abajo a la izquierda a arriba a la derecha.
const NODOS = [
  {x: 110, y: 390},
  {x: 310, y: 250},
  {x: 520, y: 330},
  {x: 720, y: 170},
  {x: 920, y: 250},
  {x: 1110, y: 90},
];
const INICIO = {x: 0, y: 390};
const COLORES = ['var(--color-cian)', 'var(--color-cian)', 'var(--color-fosforo)', 'var(--color-rojo)', 'var(--color-ambar)', 'var(--color-fosforo)'];

/** Pista de circuito: horizontal, chaflán a 45°, vertical, chaflán, horizontal. */
function pista(a: {x: number; y: number}, b: {x: number; y: number}) {
  const mx = (a.x + b.x) / 2;
  const d = Math.min(24, Math.abs(b.y - a.y) / 2);
  const s = Math.sign(b.y - a.y) || 1;
  return `M${a.x} ${a.y} H${mx - d} L${mx} ${a.y + s * d} V${b.y - s * d} L${mx + d} ${b.y} H${b.x}`;
}
const TRAMOS = NODOS.map((b, i) => pista(i === 0 ? INICIO : NODOS[i - 1], b));

export function Flujo() {
  const raizRef = useRef<HTMLElement>(null);
  const tramoRefs = useRef<SVGPathElement[]>([]);
  const nodoRefs = useRef<SVGGElement[]>([]);
  const puntoRef = useRef<SVGGElement>(null);
  const barraRef = useRef<HTMLSpanElement>(null);
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    let pAnterior = -1;
    let actual = 0;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const u = tramo(p, ...VENTANA) * N;
      const s = clamp(Math.floor(u), 0, N - 1);
      if (s !== actual) {
        actual = s;
        setPaso(s);
      }
      tramoRefs.current.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        nodoRefs.current[i].style.setProperty('--on', k > 0.98 ? '1' : '0');
        if (i === s) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          puntoRef.current!.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        }
      });
      barraRef.current!.style.transform = `scaleX(${tramo(p, ...VENTANA)})`;
    });
  }, []);

  const p = flujo.pasos[paso];

  return (
    <section ref={raizRef} id="flujo" aria-labelledby="flujo-titulo" className="relative bg-void" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 flex h-pantalla flex-col overflow-hidden px-5 pt-20 pb-8 sm:px-6 md:px-[6vw] md:pt-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="antetitulo text-fosforo">{flujo.antetitulo}</p>
            <h2 id="flujo-titulo" className="mt-3 max-w-[20ch] font-display text-display font-semibold text-texto">
              {flujo.titulo}
            </h2>
          </div>
          <p className="font-mono text-etiqueta tracking-[0.14em] text-texto-3 uppercase">{flujo.nota}</p>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center">
          <svg viewBox="-20 40 1200 400" className="h-auto max-h-full w-full overflow-visible" role="img" aria-label={`Los ${N} pasos del flujo, unidos por una pista de circuito.`}>
            <defs>
              <radialGradient id="halo-flujo">
                <stop offset="0" stopColor="#3cf58a" stopOpacity="0.55" />
                <stop offset="1" stopColor="#3cf58a" stopOpacity="0" />
              </radialGradient>
            </defs>
            {TRAMOS.map((d, i) => (
              <path key={`f${i}`} d={d} fill="none" stroke="#e7eef3" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="4 8" />
            ))}
            {TRAMOS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) tramoRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke="var(--color-fosforo)"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
                style={{filter: 'drop-shadow(0 0 6px rgb(60 245 138 / 0.6))'}}
              />
            ))}
            {NODOS.map((n, i) => (
              <g
                key={`n${i}`}
                ref={(el) => {
                  if (el) nodoRefs.current[i] = el;
                }}
                style={{'--on': 0, '--c': COLORES[i]} as React.CSSProperties}
              >
                <rect
                  x={n.x - 22}
                  y={n.y - 22}
                  width="44"
                  height="44"
                  rx="6"
                  fill="var(--color-superficie)"
                  stroke="var(--c)"
                  strokeWidth="2.5"
                  style={{strokeOpacity: 'calc(0.3 + var(--on) * 0.7)', filter: 'drop-shadow(0 0 calc(var(--on) * 12px) var(--c))', transition: 'filter 0.3s, stroke-opacity 0.3s'}}
                />
                {[-12, 0, 12].map((d) => (
                  <g key={d} stroke="var(--c)" strokeOpacity="0.5" strokeWidth="2">
                    <line x1={n.x + d} y1={n.y - 22} x2={n.x + d} y2={n.y - 30} />
                    <line x1={n.x + d} y1={n.y + 22} x2={n.x + d} y2={n.y + 30} />
                  </g>
                ))}
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontWeight="700" fontSize="20" fill={i <= paso ? 'var(--c)' : '#62727f'}>
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text x={n.x} y={n.y + 58} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize="19" fill={i === paso ? '#e7eef3' : '#62727f'} className="max-md:hidden">
                  {flujo.pasos[i].titulo}
                </text>
              </g>
            ))}
            <g ref={puntoRef} transform={`translate(${INICIO.x} ${INICIO.y})`}>
              <circle r="26" fill="url(#halo-flujo)" />
              <circle r="6" fill="#e7eef3" />
            </g>
          </svg>
        </div>

        <div className="grid gap-4 border-t border-borde pt-5 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <p className="antetitulo text-fosforo">
            Paso <span className="font-mono tabular-nums">{String(paso + 1).padStart(2, '0')}</span> de {String(N).padStart(2, '0')}
          </p>
          <div key={paso} className="min-h-[7.5rem] animate-[entra-paso_0.5s_cubic-bezier(0.2,0.7,0.1,1)] md:min-h-0" aria-live="polite">
            <h3 className="font-display text-[1.375rem] font-semibold text-texto md:text-[1.75rem]">{p.titulo}</h3>
            <p className="mt-1.5 max-w-[42rem] text-body text-texto-2">{p.cuerpo}</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <code className="w-fit rounded-[6px] border border-borde bg-superficie px-3 py-1.5 font-mono text-[0.8125rem] text-fosforo">{p.codigo}</code>
            <span className="relative h-px w-40 bg-borde" aria-hidden="true">
              <span ref={barraRef} className="absolute inset-0 origin-left bg-fosforo" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
