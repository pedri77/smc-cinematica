import {useEffect, useRef} from 'react';
import {controlesNis2, radar, type Estado} from '../content';
import {easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Proyecto: Security Manager Control (SMC) · web cinemática
 * Metáfora: de noche, en una sala de control, un radar barre el perímetro de una organización;
 * los controles se encienden como luces de un panel, los marcos convergen en una rejilla, las
 * brechas aparecen como ecos rojos que se priorizan y al final la sala entera queda en verde.
 *
 * Sección 1 · Radar · patrón 1 (escenario fijado con capas SVG) + 4 (HUD) · alto 480 svh
 * Capas, de lejos a cerca: fondo (rejilla y viñeta), radar (anillos, marcas y perímetro),
 * barrido (cono cónico), ecos, texto y panel, HUD. Todo SVG/CSS generado por código.
 *
 * Guion de scroll (p):
 *   0.00 – 0.08  la pregunta y «Desliza…» se apagan
 *   0.02 – 0.12  el velo de pantalla apagada se retira: la sala se enciende
 *   0.00 – 1.00  el barrido gira 2,5 vueltas ligado al scroll (no al tiempo)
 *   0.00 – 0.40  el radar se asienta (escala 1.18 → 1)
 *   0.02 – 0.10  entra el HUD (barrido en grados, controles encendidos, ecos)
 *   0.06 – 0.40  el perímetro de la organización se dibuja (trazo SVG)
 *   0.10 – 0.26  titular y entradilla entran por líneas
 *   0.28 – 0.58  las 15 luces del panel NIS2 se encienden una a una (verde, ámbar o rojo)
 *   0.46 – 0.62  aparecen los ecos rojos: un eco por control en brecha
 *   0.56 – 0.62  el titular cede el sitio
 *   0.60 – 0.76  la lista de brechas entra ordenada P1, P2, P3; los ecos reciben su etiqueta
 *   0.86 – 1.00  salida: la sala funde a negro y enlaza con el flujo
 */

const ALTO_VH = 480;
const BRECHAS = controlesNis2.filter((c) => c.estado === 'brecha').sort((a, b) => (a.prioridad ?? 'P9').localeCompare(b.prioridad ?? 'P9'));

const COLOR: Record<Estado, string> = {ok: 'var(--color-fosforo)', parcial: 'var(--color-ambar)', brecha: 'var(--color-rojo)'};

// Posición de cada eco en el radar (grados desde el norte, radio en unidades del viewBox).
const POS_ECOS = [
  {ang: 52, r: 290},
  {ang: 148, r: 205},
  {ang: 232, r: 335},
  {ang: 312, r: 250},
];
const polar = (ang: number, r: number) => {
  const a = ((ang - 90) * Math.PI) / 180;
  return {x: Math.cos(a) * r, y: Math.sin(a) * r};
};

// Perímetro irregular de la organización (determinista) y sus sedes.
const PERIMETRO = (() => {
  const n = 11;
  const radios = [318, 352, 300, 362, 330, 296, 348, 318, 372, 306, 340];
  const pts = Array.from({length: n}, (_, i) => polar((i / n) * 360 + 8, radios[i]));
  return `M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} Z`;
})();
const SEDES = [
  {ang: 20, r: 150},
  {ang: 95, r: 250},
  {ang: 170, r: 120},
  {ang: 205, r: 245},
  {ang: 270, r: 165},
  {ang: 340, r: 230},
].map((s) => polar(s.ang, s.r));

export function Radar() {
  const raizRef = useRef<HTMLElement>(null);
  const veloRef = useRef<HTMLDivElement>(null);
  const invitacionRef = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const barridoRef = useRef<HTMLDivElement>(null);
  const perimetroRef = useRef<SVGPathElement>(null);
  const enlacesRef = useRef<SVGGElement>(null);
  const ecoRefs = useRef<SVGGElement[]>([]);
  const etiquetaEcoRefs = useRef<SVGGElement[]>([]);
  const lineaRefs = useRef<HTMLElement[]>([]);
  const tituloRef = useRef<HTMLDivElement>(null);
  const brechasRef = useRef<HTMLDivElement>(null);
  const filaRefs = useRef<HTMLLIElement[]>([]);
  const luzRefs = useRef<HTMLSpanElement[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const gradosRef = useRef<HTMLSpanElement>(null);
  const encendidosRef = useRef<HTMLSpanElement>(null);
  const ecosRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      invitacionRef.current!.style.opacity = String(1 - tramo(p, 0, 0.08));
      veloRef.current!.style.opacity = String(1 - tramo(p, 0.02, 0.12));

      const salida = tramo(p, 0.86, 1);
      escenaRef.current!.style.opacity = String(1 - salida);
      escenaRef.current!.style.transform = `translate3d(0, ${-salida * 8}vh, 0)`;

      const asienta = easeOutCubic(tramo(p, 0, 0.4));
      radarRef.current!.style.transform = `scale(${lerp(1.18, 1, asienta)})`;
      const grados = p * 900;
      barridoRef.current!.style.transform = `rotate(${grados}deg)`;
      perimetroRef.current!.style.strokeDashoffset = String(1 - easeOutCubic(tramo(p, 0.06, 0.4)));
      enlacesRef.current!.style.opacity = String(tramo(p, 0.25, 0.42));

      // Titular por líneas.
      lineaRefs.current.forEach((el, i) => {
        const a = 0.1 + i * 0.04;
        const k = easeOutCubic(tramo(p, a, a + 0.08));
        el.style.opacity = String(k);
        el.style.transform = `translate3d(0, ${(1 - k) * 28}px, 0)`;
      });
      const cede = tramo(p, 0.56, 0.62);
      tituloRef.current!.style.opacity = String(1 - cede);
      tituloRef.current!.style.visibility = cede >= 1 ? 'hidden' : 'visible';

      // Panel de luces.
      panelRef.current!.style.opacity = String(tramo(p, 0.24, 0.3));
      let encendidos = 0;
      luzRefs.current.forEach((el, i) => {
        const a = 0.28 + i * 0.018;
        const k = tramo(p, a, a + 0.04);
        if (k > 0.5) encendidos++;
        el.style.setProperty('--on', k.toFixed(3));
      });

      // Ecos y lista de brechas.
      let ecos = 0;
      ecoRefs.current.forEach((el, i) => {
        const a = 0.46 + i * 0.035;
        const k = easeOutCubic(tramo(p, a, a + 0.05));
        if (k > 0.5) ecos++;
        el.style.opacity = String(k);
        el.style.transform = `scale(${lerp(2.2, 1, k)})`;
        const e = tramo(p, 0.64 + i * 0.03, 0.7 + i * 0.03);
        etiquetaEcoRefs.current[i].style.opacity = String(e);
      });
      const lista = tramo(p, 0.6, 0.66);
      brechasRef.current!.style.opacity = String(lista);
      brechasRef.current!.style.visibility = lista <= 0 ? 'hidden' : 'visible';
      filaRefs.current.forEach((el, i) => {
        const k = easeOutCubic(tramo(p, 0.62 + i * 0.03, 0.68 + i * 0.03));
        el.style.opacity = String(k);
        el.style.transform = `translate3d(${(1 - k) * -24}px, 0, 0)`;
      });

      hudRef.current!.style.opacity = String(tramo(p, 0.02, 0.1) * (1 - tramo(p, 0.86, 0.94)));
      gradosRef.current!.textContent = String(Math.round(grados % 360)).padStart(3, '0');
      encendidosRef.current!.textContent = String(encendidos).padStart(2, '0');
      ecosRef.current!.textContent = String(ecos);
    });
  }, []);

  const linea = (i: number) => (el: HTMLElement | null) => {
    if (el) lineaRefs.current[i] = el;
  };

  return (
    <section id="inicio" ref={raizRef} aria-label={radar.etiquetaSeccion} className="relative" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 h-pantalla overflow-hidden bg-void">
        <div ref={escenaRef} className="absolute inset-0 will-change-transform">
          {/* Capa 0: fondo con rejilla de sala y viñeta. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 60% at 68% 52%, rgb(60 245 138 / 0.07), transparent 70%), linear-gradient(rgb(255 255 255 / 0.025) 1px, transparent 1px) 0 0 / 48px 48px, linear-gradient(90deg, rgb(255 255 255 / 0.025) 1px, transparent 1px) 0 0 / 48px 48px',
            }}
          />

          {/* Capa 1–3: radar, barrido y ecos. */}
          <div
            className="absolute top-[100px] left-1/2 aspect-square w-[min(78vw,37svh)] -translate-x-1/2 md:top-1/2 md:left-[68%] md:w-[min(46vw,80svh)] md:-translate-y-1/2"
            aria-hidden="true"
          >
            <div ref={radarRef} className="relative size-full will-change-transform">
              <svg viewBox="-540 -540 1080 1080" className="absolute inset-0 size-full overflow-visible">
                <circle r="470" fill="rgb(60 245 138 / 0.025)" />
                {[110, 220, 330, 440].map((r) => (
                  <circle key={r} r={r} fill="none" stroke="var(--color-fosforo)" strokeOpacity="0.16" strokeWidth="1.5" />
                ))}
                <circle r="470" fill="none" stroke="var(--color-fosforo)" strokeOpacity="0.45" strokeWidth="2" />
                <path d="M-470 0 H470 M0 -470 V470" stroke="var(--color-fosforo)" strokeOpacity="0.14" strokeWidth="1.5" />
                {Array.from({length: 72}, (_, i) => {
                  const largo = i % 6 === 0 ? 22 : 10;
                  const a = polar(i * 5, 470);
                  const b = polar(i * 5, 470 - largo);
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-fosforo)" strokeOpacity={i % 6 === 0 ? 0.6 : 0.3} strokeWidth="2" />;
                })}
                {Array.from({length: 12}, (_, i) => {
                  const t = polar(i * 30, 505);
                  return (
                    <text key={i} x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize="22" fill="var(--color-fosforo)" fillOpacity="0.55">
                      {String(i * 30).padStart(3, '0')}
                    </text>
                  );
                })}
                {/* Perímetro de la organización y sus sedes. */}
                <path ref={perimetroRef} d={PERIMETRO} pathLength={1} fill="rgb(102 214 232 / 0.04)" stroke="var(--color-cian)" strokeOpacity="0.75" strokeWidth="2.5" strokeDasharray="1 1" strokeDashoffset="1" strokeLinejoin="round" />
                <g ref={enlacesRef} style={{opacity: 0}}>
                  {SEDES.map((s, i) => (
                    <g key={i}>
                      <line x1="0" y1="0" x2={s.x} y2={s.y} stroke="var(--color-cian)" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="6 8" />
                      <rect x={s.x - 9} y={s.y - 9} width="18" height="18" fill="var(--color-void)" stroke="var(--color-cian)" strokeWidth="2" />
                    </g>
                  ))}
                  <rect x="-14" y="-14" width="28" height="28" fill="var(--color-cian)" fillOpacity="0.25" stroke="var(--color-cian)" strokeWidth="2" />
                </g>
              </svg>

              {/* Barrido: cono cónico que gira con el scroll. */}
              <div ref={barridoRef} className="absolute inset-[6.5%] rounded-full will-change-transform">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{background: 'conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgb(60 245 138 / 0.05) 310deg, rgb(60 245 138 / 0.32) 359deg, transparent 360deg)'}}
                />
                <div className="absolute top-0 left-1/2 h-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-t from-fosforo/90 to-fosforo/30 shadow-[0_0_12px_rgb(60_245_138/0.8)]" />
              </div>

              {/* Ecos: un control en brecha = un eco rojo. */}
              <svg viewBox="-540 -540 1080 1080" className="absolute inset-0 size-full overflow-visible">
                {BRECHAS.map((b, i) => {
                  const {x, y} = polar(POS_ECOS[i].ang, POS_ECOS[i].r);
                  const izquierda = x > 120;
                  return (
                    <g key={b.id} transform={`translate(${x} ${y})`}>
                      <g
                        ref={(el) => {
                          if (el) ecoRefs.current[i] = el;
                        }}
                        style={{opacity: 0, transformBox: 'fill-box', transformOrigin: 'center'}}
                      >
                        <circle r="42" className="pulso" fill="none" stroke="var(--color-rojo)" strokeWidth="3" />
                        <circle r="13" fill="var(--color-rojo)" style={{filter: 'drop-shadow(0 0 10px rgb(255 79 79 / 0.9))'}} />
                      </g>
                      <g
                        ref={(el) => {
                          if (el) etiquetaEcoRefs.current[i] = el;
                        }}
                        style={{opacity: 0}}
                      >
                        <rect x={izquierda ? -118 : 26} y="-20" width="92" height="40" rx="6" fill="var(--color-void)" stroke="var(--color-rojo)" strokeWidth="2" />
                        <text x={izquierda ? -72 : 72} y="2" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontWeight="700" fontSize="24" fill="var(--color-rojo)">
                          {b.prioridad}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Texto: titular y lista de brechas comparten celda; debajo, el panel de luces. */}
          <div className="absolute inset-x-0 bottom-[3svh] z-10 flex flex-col gap-5 px-5 sm:px-6 md:top-0 md:bottom-0 md:w-[48vw] md:justify-center md:gap-10 md:pl-[6vw]">
            <div className="grid">
              <div ref={tituloRef} className="[grid-area:1/1]">
                <p ref={linea(0)} className="antetitulo text-fosforo" style={{opacity: 0}}>
                  {radar.antetitulo}
                </p>
                <h1 aria-label={`${radar.titulo} ${radar.destacado}`} className="mt-3 font-display text-hero font-semibold text-texto md:mt-5">
                  <span ref={linea(1)} aria-hidden="true" className="block" style={{opacity: 0}}>
                    {radar.titulo}
                  </span>
                  <span ref={linea(2)} aria-hidden="true" className="block text-fosforo [text-shadow:0_0_40px_rgb(60_245_138/0.35)]" style={{opacity: 0}}>
                    {radar.destacado}
                  </span>
                </h1>
                <p ref={linea(3)} className="mt-4 max-w-[34rem] text-[0.9375rem] leading-relaxed text-texto-2 md:mt-6 md:text-lead" style={{opacity: 0}}>
                  {radar.entradilla}
                </p>
              </div>

              <div ref={brechasRef} className="self-end [grid-area:1/1] md:self-center" style={{opacity: 0, visibility: 'hidden'}}>
                <p className="antetitulo text-rojo">{radar.brechas.titulo}</p>
                <ol className="mt-3 space-y-2 md:mt-5 md:space-y-3">
                  {BRECHAS.map((b, i) => (
                    <li
                      key={b.id}
                      ref={(el) => {
                        if (el) filaRefs.current[i] = el;
                      }}
                      className="flex items-center gap-3 rounded-[10px] border border-borde bg-superficie/85 px-3 py-2 backdrop-blur-sm md:gap-4 md:px-4 md:py-3"
                      style={{opacity: 0}}
                    >
                      <span
                        className={`shrink-0 rounded-[6px] px-2 py-0.5 font-mono text-[0.8125rem] font-bold ${b.prioridad === 'P1' ? 'bg-rojo text-void' : b.prioridad === 'P2' ? 'bg-ambar text-void' : 'border border-texto-3 text-texto-2'}`}
                      >
                        {b.prioridad}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[0.75rem] text-texto-3">{b.id}</span>
                        <span className="block text-[0.875rem] leading-snug text-texto md:text-[1rem]">{b.nota}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-[0.75rem] text-texto-3">{radar.brechas.nota}</p>
              </div>
            </div>

            <div ref={panelRef} style={{opacity: 0}}>
              <p className="antetitulo text-texto-3">{radar.panel}</p>
              <ul className="mt-3 flex gap-[5px] md:gap-2" aria-label={radar.panel}>
                {controlesNis2.map((c, i) => (
                  <li key={c.id} title={`${c.id} · ${c.titulo}`} className="contents">
                    <span
                      ref={(el) => {
                        if (el) luzRefs.current[i] = el;
                      }}
                      className="luz block aspect-square flex-1 rounded-[4px] md:w-7 md:flex-none"
                      style={{'--c': COLOR[c.estado]} as React.CSSProperties}
                    />
                    <span className="sr-only">
                      {c.id}: {c.titulo}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-texto-2">
                {radar.leyenda.map((l) => (
                  <li key={l.estado} className="flex items-center gap-2">
                    <span className="inline-block size-2.5 rounded-[2px]" style={{background: COLOR[l.estado]}} />
                    {l.texto}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* HUD. */}
          <div ref={hudRef} aria-hidden="true" className="pointer-events-none absolute inset-3 font-mono text-[0.625rem] tracking-[0.14em] text-texto-2 uppercase sm:inset-5 md:text-etiqueta" style={{opacity: 0}}>
            <div className="esquinas absolute inset-0 text-texto-3" />
            <div className="absolute top-14 left-3 space-y-1 md:top-auto md:bottom-10 md:left-4">
              <p className="text-texto-3 max-md:hidden">{radar.hud.turno}</p>
              <p>
                {radar.hud.barrido} <span ref={gradosRef} className="tabular-nums text-fosforo">000</span>°
              </p>
            </div>
            <div className="absolute top-14 right-3 space-y-1 text-right md:top-20 md:right-4">
              <p>
                {radar.hud.controles} <span ref={encendidosRef} className="tabular-nums text-fosforo">00</span>/15
              </p>
              <p>
                {radar.hud.ecos} <span ref={ecosRef} className="tabular-nums text-rojo">0</span>
              </p>
            </div>
            <div className="absolute bottom-3 left-3 max-md:hidden md:bottom-4 md:left-4">{radar.hud.modo}</div>
            <div className="absolute right-3 bottom-3 max-md:hidden md:right-4 md:bottom-4">{radar.hud.ejemplo}</div>
          </div>
        </div>

        {/* Velo de pantalla apagada con la pregunta inicial. */}
        <div ref={veloRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-void/85" />
        <div ref={invitacionRef} className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
          <p className="antetitulo text-fosforo">{radar.antetitulo}</p>
          <p className="mx-auto mt-5 max-w-[34rem] font-display text-[1.5rem] leading-snug text-texto md:text-[2.125rem]">{radar.pregunta}</p>
          <p className="mt-8 font-mono text-[0.8125rem] tracking-[0.14em] text-texto-2 uppercase">
            {radar.invitacion} <span className="ml-1 inline-block animate-bounce text-fosforo motion-reduce:animate-none">↓</span>
          </p>
        </div>
        <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0" />
      </div>
    </section>
  );
}
