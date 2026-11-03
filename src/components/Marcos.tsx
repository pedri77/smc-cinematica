import {useEffect, useRef} from 'react';
import {marcos} from '../content';
import {clamp, easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Sección 3 · Marcos · patrón 10 (convergencia) · alto 360 svh
 * Tres rejillas, una por marco, llegan desde fuera giradas y desenfocadas y se superponen en
 * una sola: NIS2 (15 casillas), ENS (73 puntos) e ISO 27001 (malla fina). Al alinearse, la
 * casilla de un control común se ilumina y aparece el ejemplo de mapeo real del repositorio.
 *
 * Guion de scroll (p):
 *   0.00 – 0.12  texto de la sección aparece
 *   0.05 – 0.40  las cifras cuentan (15 · 73 · 21)
 *   0.05 – 0.58  las tres rejillas convergen escalonadas (0.05, 0.13, 0.21; duración 0.37)
 *   0.60 – 0.72  la casilla común (NIS2-21.2.b) y sus puntos ENS se iluminan; brillo del conjunto
 *   0.64 – 0.76  ficha «Una evidencia, tres marcos» con las tres filas del mapeo
 *   0.76 – 0.92  la categoría ENS se enciende: BÁSICA, MEDIA, ALTA
 */

const ALTO_VH = 360;
const LADO = 400;

// NIS2: 5 × 3 casillas. ENS: 73 puntos en una rejilla 9 × 9. ISO: malla de 12 × 12.
const NIS2 = Array.from({length: 15}, (_, i) => ({x: 20 + (i % 5) * 72, y: 74 + Math.floor(i / 5) * 88, w: 64, h: 80}));
const COMUN = 3; // NIS2-21.2.b, cuarta casilla del catálogo
const ENS = Array.from({length: 73}, (_, i) => ({x: 40 + (i % 9) * 40, y: 40 + Math.floor(i / 9) * 40}));
const dentroDeComun = (x: number, y: number) => {
  const c = NIS2[COMUN];
  return x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h;
};

const INICIO = [
  {dx: -38, dy: -14, giro: -28, escala: 1.35},
  {dx: 36, dy: -10, giro: 22, escala: 1.25},
  {dx: 4, dy: 40, giro: 10, escala: 0.8},
];

export function Marcos() {
  const raizRef = useRef<HTMLElement>(null);
  const textoRef = useRef<HTMLDivElement>(null);
  const capaRefs = useRef<HTMLDivElement[]>([]);
  const cifraRefs = useRef<HTMLSpanElement[]>([]);
  const alineadosRef = useRef<HTMLSpanElement>(null);
  const comunRef = useRef<SVGGElement>(null);
  const puntosComunRef = useRef<SVGGElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const fichaRef = useRef<HTMLDivElement>(null);
  const nivelRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const t = easeOutCubic(tramo(p, 0, 0.12));
      textoRef.current!.style.opacity = String(t);
      textoRef.current!.style.transform = `translate3d(0, ${(1 - t) * 24}px, 0)`;

      const cuenta = easeOutCubic(tramo(p, 0.05, 0.4));
      marcos.cifras.forEach((c, i) => {
        cifraRefs.current[i].textContent = String(Math.round(c.n * cuenta));
      });

      let alineados = 0;
      capaRefs.current.forEach((el, i) => {
        const a = 0.05 + i * 0.08;
        const k = easeOutCubic(tramo(p, a, a + 0.37));
        if (k > 0.98) alineados++;
        const o = INICIO[i];
        el.style.transform = `translate3d(${o.dx * (1 - k)}vw, ${o.dy * (1 - k)}vh, 0) rotate(${o.giro * (1 - k)}deg) scale(${lerp(o.escala, 1, k)})`;
        el.style.opacity = String(lerp(0.4, 1, k));
        el.style.filter = k < 0.99 ? `blur(${(1 - k) * 3}px)` : '';
      });
      alineadosRef.current!.textContent = String(alineados);

      const luz = tramo(p, 0.6, 0.72);
      comunRef.current!.style.opacity = String(luz);
      puntosComunRef.current!.style.opacity = String(luz);
      escenaRef.current!.style.setProperty('--brillo', String(clamp(luz)));

      const ficha = easeOutCubic(tramo(p, 0.64, 0.76));
      fichaRef.current!.style.opacity = String(ficha);
      fichaRef.current!.style.transform = `translate3d(0, ${(1 - ficha) * 20}px, 0)`;

      nivelRefs.current.forEach((el, i) => {
        el.style.setProperty('--on', tramo(p, 0.76 + i * 0.05, 0.8 + i * 0.05).toFixed(3));
      });
    });
  }, []);

  return (
    <section ref={raizRef} id="marcos" aria-labelledby="marcos-titulo" className="relative bg-void" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 flex h-pantalla flex-col items-center justify-center gap-4 overflow-hidden px-5 pt-16 sm:px-6 md:flex-row md:gap-[5vw] md:px-[6vw] md:pt-0">
        <div ref={textoRef} className="relative z-10 w-full md:w-[36vw] md:max-w-[32rem]" style={{opacity: 0}}>
          <p className="antetitulo text-fosforo">{marcos.antetitulo}</p>
          <h2 id="marcos-titulo" className="mt-3 font-display text-display font-semibold text-texto md:mt-4">
            {marcos.titulo}
          </h2>
          <p className="mt-5 text-body text-texto-2 max-md:hidden">{marcos.cuerpo}</p>
          <dl className="mt-4 grid grid-cols-3 gap-3 md:mt-8">
            {marcos.cifras.map((c, i) => (
              <div key={c.texto} className="border-l border-borde pl-3">
                <dt className="sr-only">{c.texto}</dt>
                <dd>
                  <span
                    ref={(el) => {
                      if (el) cifraRefs.current[i] = el;
                    }}
                    className="block font-mono text-[1.75rem] leading-none font-bold tabular-nums text-texto md:text-[2.5rem]"
                    aria-hidden="true"
                  >
                    0
                  </span>
                  <span className="sr-only">{c.n}</span>
                  <span className="mt-1.5 block text-[0.75rem] leading-snug text-texto-2 md:text-[0.8125rem]" aria-hidden="true">
                    {c.texto}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 max-md:hidden">
            <p className="antetitulo text-texto-3">{marcos.categoria.titulo}</p>
            <div className="mt-3 flex gap-2">
              {marcos.categoria.niveles.map((n, i) => (
                <span
                  key={n}
                  ref={(el) => {
                    if (el) nivelRefs.current[i] = el;
                  }}
                  className="rounded-full border px-3.5 py-1 font-mono text-[0.75rem] font-bold tracking-[0.1em]"
                  style={
                    {
                      '--on': 0,
                      borderColor: 'color-mix(in srgb, var(--color-ambar) calc(25% + var(--on) * 75%), transparent)',
                      color: 'color-mix(in srgb, var(--color-ambar) calc(35% + var(--on) * 65%), var(--color-texto-3))',
                      boxShadow: '0 0 calc(var(--on) * 16px) rgb(255 181 71 / calc(var(--on) * 0.35))',
                    } as React.CSSProperties
                  }
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <div
            ref={escenaRef}
            className="relative aspect-square w-[min(74vw,38svh)] rounded-[14px] border border-borde bg-superficie/50 md:w-[min(36vw,58svh)]"
            style={{boxShadow: '0 0 calc(var(--brillo, 0) * 70px) rgb(60 245 138 / calc(var(--brillo, 0) * 0.18))'}}
          >
            {/* ISO 27001: malla fina. */}
            <div
              ref={(el) => {
                if (el) capaRefs.current[2] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={{opacity: 0.4}}
            >
              <svg viewBox={`0 0 ${LADO} ${LADO}`} className="size-full" aria-hidden="true">
                {Array.from({length: 13}, (_, i) => (
                  <g key={i} stroke="#e7eef3" strokeOpacity="0.16" strokeWidth="1">
                    <line x1={20 + i * 30} y1="20" x2={20 + i * 30} y2="380" />
                    <line x1="20" y1={20 + i * 30} x2="380" y2={20 + i * 30} />
                  </g>
                ))}
                <rect x="20" y="20" width="360" height="360" fill="none" stroke="#e7eef3" strokeOpacity="0.4" strokeWidth="1.5" />
              </svg>
              <span className="absolute bottom-1.5 left-2 rounded-[4px] bg-void/80 px-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-texto-2 uppercase">{marcos.nombres[2]}</span>
            </div>

            {/* ENS: 73 medidas como puntos. */}
            <div
              ref={(el) => {
                if (el) capaRefs.current[1] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={{opacity: 0.4}}
            >
              <svg viewBox={`0 0 ${LADO} ${LADO}`} className="size-full" aria-hidden="true">
                {ENS.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r="5" fill="var(--color-cian)" fillOpacity="0.55" />
                ))}
                <g ref={puntosComunRef} style={{opacity: 0}}>
                  {ENS.filter((d) => dentroDeComun(d.x, d.y)).map((d, i) => (
                    <circle key={i} cx={d.x} cy={d.y} r="8" fill="var(--color-cian)" style={{filter: 'drop-shadow(0 0 8px rgb(102 214 232 / 0.9))'}} />
                  ))}
                </g>
              </svg>
              <span className="absolute top-1.5 right-2 rounded-[4px] bg-void/80 px-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-cian uppercase">{marcos.nombres[1]}</span>
            </div>

            {/* NIS2: 15 controles como casillas. */}
            <div
              ref={(el) => {
                if (el) capaRefs.current[0] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={{opacity: 0.4}}
            >
              <svg viewBox={`0 0 ${LADO} ${LADO}`} className="size-full" aria-hidden="true">
                {NIS2.map((c, i) => (
                  <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill="none" stroke="var(--color-fosforo)" strokeOpacity="0.7" strokeWidth="2" />
                ))}
                <g ref={comunRef} style={{opacity: 0}}>
                  <rect
                    x={NIS2[COMUN].x}
                    y={NIS2[COMUN].y}
                    width={NIS2[COMUN].w}
                    height={NIS2[COMUN].h}
                    rx="6"
                    fill="rgb(60 245 138 / 0.18)"
                    stroke="var(--color-fosforo)"
                    strokeWidth="3"
                    style={{filter: 'drop-shadow(0 0 12px rgb(60 245 138 / 0.8))'}}
                  />
                </g>
              </svg>
              <span className="absolute top-1.5 left-2 rounded-[4px] bg-void/80 px-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-fosforo uppercase">{marcos.nombres[0]}</span>
            </div>
          </div>

          <p className="mt-6 font-mono text-[0.6875rem] tracking-[0.14em] text-texto-3 uppercase" aria-hidden="true">
            <span ref={alineadosRef} className="tabular-nums text-texto">
              0
            </span>{' '}
            / 3 {marcos.alineados}
          </p>

          <div
            ref={fichaRef}
            className="w-[min(86vw,24rem)] rounded-[12px] border border-borde bg-superficie/90 p-4 backdrop-blur-sm md:absolute md:-left-20 md:bottom-12 md:w-[22rem] md:shadow-[0_12px_40px_rgb(0_0_0/0.6)]"
            style={{opacity: 0}}
          >
            <p className="antetitulo text-fosforo">{marcos.ejemplo.titulo}</p>
            <dl className="mt-3 space-y-1.5">
              {marcos.ejemplo.filas.map((f) => (
                <div key={f.marco} className="grid grid-cols-[5.5rem_1fr] gap-2 text-[0.8125rem]">
                  <dt className="font-mono text-texto-3">{f.marco}</dt>
                  <dd className="text-texto">{f.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
