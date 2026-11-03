import {useEffect, useRef} from 'react';
import {marca, modulos} from '../content';
import {clamp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Sección 4 · Módulos · patrón 6 (carrete horizontal fijado) · alto 360 svh
 * Nueve consolas de la sala pasan de lado: SOC, ofensiva, IA, tecnologías, vulnerabilidades, red,
 * normativa, PMO e informes. La más cercana a la línea de foco (62 % del ancho) se ve nítida; el instrumento
 * dibujado dentro de cada tarjeta se desplaza contra su marco (parallax).
 *
 * Guion de scroll (p):
 *   0.04 – 0.96  el carrete recorre todo su ancho (lineal); contador 01 / 09 y barra siguen
 *   fuera de foco  opacidad 1 → 0.45 y escala 1 → 0.94 según la distancia a la línea de foco
 */

const ALTO_VH = 480;
const BASE_REPO = `${marca.repo}/tree/main/`;
const CARPETA: Record<string, string> = {
  soc: 'soc',
  ofensiva: 'offensive',
  ia: 'frameworks/ai-act',
  pmo: 'pmo',
  tecnologias: 'technologies',
  vulnerabilidades: 'vulnerabilities',
  red: 'network',
  normativa: 'normativa',
};

const V = 'var(--color-fosforo)';
const A = 'var(--color-ambar)';
const R = 'var(--color-rojo)';
const C = 'var(--color-cian)';
const T3 = '#62727f';

/** Instrumento de cada consola, dibujado en SVG. */
function Instrumento({id}: {id: string}) {
  const mono = {fontFamily: 'var(--font-mono)', fontSize: 11, fill: T3, letterSpacing: 1} as const;
  switch (id) {
    case 'soc':
      return (
        <g>
          <polyline points="20,90 60,70 95,82 130,40 170,58 205,30 245,52 300,24" fill="none" stroke={V} strokeWidth="2.5" />
          <polyline points="20,90 60,70 95,82 130,40 170,58 205,30 245,52 300,24 300,110 20,110" fill="rgb(60 245 138 / 0.08)" />
          {['MTTD', 'MTTA', 'MTTC', 'MTTR'].map((m, i) => {
            const cx = 50 + i * 74;
            return (
              <g key={m}>
                <circle cx={cx} cy="170" r="26" fill="none" stroke="#1d2731" strokeWidth="6" />
                <circle cx={cx} cy="170" r="26" fill="none" stroke={i === 2 ? A : V} strokeWidth="6" pathLength={1} strokeDasharray={`${0.55 + i * 0.1} 1`} transform={`rotate(-90 ${cx} 170)`} />
                <text x={cx} y="216" textAnchor="middle" {...mono}>
                  {m}
                </text>
              </g>
            );
          })}
        </g>
      );
    case 'ofensiva':
      return (
        <g>
          {['RECON', 'ACCESO', 'EJECUCIÓN', 'LATERAL', 'EXFILTRAR'].map((t, i) => {
            const det = [V, V, R, A, V][i];
            return (
              <g key={t}>
                <text x="20" y={50 + i * 38} {...mono}>
                  {t}
                </text>
                <rect x="150" y={38 + i * 38} width="110" height="16" rx="3" fill="#121820" />
                <rect x="150" y={38 + i * 38} width={[100, 80, 30, 60, 95][i]} height="16" rx="3" fill={det} fillOpacity="0.85" />
                <circle cx="285" cy={46 + i * 38} r="7" fill="none" stroke={det} strokeWidth="2" />
                {det === V && <path d={`M281 ${46 + i * 38} l3 3 l5 -6`} fill="none" stroke={V} strokeWidth="2" />}
              </g>
            );
          })}
        </g>
      );
    case 'ia':
      return (
        <g>
          {[
            {l: 'PROHIBIDO', w: 100, c: R},
            {l: 'ALTO', w: 150, c: A},
            {l: 'LIMITADO', w: 200, c: C},
            {l: 'MÍNIMO', w: 250, c: V},
          ].map((n, i) => (
            <g key={n.l}>
              <rect x={160 - n.w / 2} y={30 + i * 44} width={n.w} height="34" rx="4" fill={n.c} fillOpacity="0.14" stroke={n.c} strokeWidth="2" />
              <text x="160" y={52 + i * 44} textAnchor="middle" {...mono} fill={n.c}>
                {n.l}
              </text>
            </g>
          ))}
          <text x="160" y="222" textAnchor="middle" {...mono}>
            RIA · 2027-12-02
          </text>
        </g>
      );
    case 'pmo':
      return (
        <g>
          {[
            {x: 20, w: 90, c: V},
            {x: 70, w: 110, c: V},
            {x: 140, w: 80, c: A},
            {x: 190, w: 100, c: C},
            {x: 230, w: 70, c: C},
          ].map((b, i) => (
            <rect key={i} x={b.x} y={44 + i * 24} width={b.w} height="14" rx="3" fill={b.c} fillOpacity="0.8" />
          ))}
          <line x1="175" y1="36" x2="175" y2="168" stroke={R} strokeWidth="1.5" strokeDasharray="4 4" />
          <polyline points="20,215 80,205 140,192 200,184 260,170 300,162" fill="none" stroke={V} strokeWidth="2.5" />
          <polyline points="20,215 80,208 140,198 200,194 260,186 300,180" fill="none" stroke={A} strokeWidth="2" strokeDasharray="5 4" />
          <text x="20" y="232" {...mono}>
            CPI 0.96 · SPI 0.92
          </text>
        </g>
      );
    case 'tecnologias':
      return (
        <g>
          <line x1="20" y1="120" x2="300" y2="120" stroke="#1d2731" strokeWidth="2" />
          {Array.from({length: 8}, (_, i) => (
            <line key={i} x1={20 + i * 40} y1="114" x2={20 + i * 40} y2="126" stroke={T3} strokeWidth="1.5" />
          ))}
          <rect x="210" y="40" width="90" height="160" fill="rgb(255 181 71 / 0.08)" />
          <text x="255" y="34" textAnchor="middle" {...mono} fill={A}>
            90 DÍAS
          </text>
          {[
            {x: 60, y: 70, c: V},
            {x: 120, y: 160, c: V},
            {x: 180, y: 90, c: V},
            {x: 232, y: 150, c: A},
            {x: 262, y: 70, c: A},
            {x: 290, y: 175, c: R},
          ].map((m, i) => (
            <g key={i}>
              <line x1={m.x} y1="120" x2={m.x} y2={m.y} stroke={m.c} strokeOpacity="0.5" strokeWidth="1.5" />
              <rect x={m.x - 7} y={m.y - 7} width="14" height="14" rx="3" fill={m.c} />
            </g>
          ))}
        </g>
      );
    case 'vulnerabilidades':
      return (
        <g>
          {[
            {l: 'KEV', w: 0.92, c: R},
            {l: 'EPSS', w: 0.7, c: R},
            {l: 'CVSS', w: 0.55, c: A},
            {l: 'SLA', w: 0.4, c: A},
            {l: 'OK', w: 0.25, c: V},
          ].map((b, i) => (
            <g key={b.l}>
              <text x="20" y={52 + i * 36} {...mono}>
                {b.l}
              </text>
              <rect x="70" y={40 + i * 36} width="230" height="16" rx="3" fill="#121820" />
              <rect x="70" y={40 + i * 36} width={230 * b.w} height="16" rx="3" fill={b.c} fillOpacity="0.85" />
            </g>
          ))}
        </g>
      );
    case 'red': {
      const zonas = [
        {l: 'DMZ', x: 30, y: 30},
        {l: 'SRV', x: 220, y: 30},
        {l: 'USR', x: 30, y: 160},
        {l: 'OT', x: 220, y: 160},
      ];
      return (
        <g>
          {zonas.map((z) => (
            <g key={z.l}>
              <line x1={z.x + 35} y1={z.y + 25} x2="160" y2="120" stroke={C} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="5 6" />
              <rect x={z.x} y={z.y} width="70" height="50" rx="6" fill="#0c1015" stroke={z.l === 'OT' ? A : C} strokeWidth="2" />
              <text x={z.x + 35} y={z.y + 29} textAnchor="middle" {...mono} fill="#e7eef3">
                {z.l}
              </text>
            </g>
          ))}
          <rect x="138" y="98" width="44" height="44" rx="8" fill="rgb(60 245 138 / 0.15)" stroke={V} strokeWidth="2.5" />
          <path d="M150 112 h20 M150 120 h20 M150 128 h20" stroke={V} strokeWidth="2" />
        </g>
      );
    }
    case 'normativa':
      return (
        <g>
          <rect x="40" y="24" width="140" height="190" rx="6" fill="#0c1015" stroke="#2a3642" strokeWidth="2" />
          {Array.from({length: 9}, (_, i) => (
            <rect key={i} x="58" y={50 + i * 18} width={i % 3 === 2 ? 70 : 104} height="6" rx="3" fill={i === 4 ? C : '#2a3642'} />
          ))}
          <path d="M162 80 C 200 80, 205 120, 230 120" fill="none" stroke={C} strokeWidth="2" />
          <rect x="226" y="104" width="78" height="32" rx="6" fill="rgb(60 245 138 / 0.12)" stroke={V} strokeWidth="2" />
          <text x="265" y="124" textAnchor="middle" {...mono} fill={V}>
            21.2.b
          </text>
          <text x="265" y="160" textAnchor="middle" {...mono}>
            CCN-STIC
          </text>
        </g>
      );
    default:
      return (
        <g>
          {Array.from({length: 12}, (_, i) => {
            const x = 24 + (i % 4) * 70;
            const y = 30 + Math.floor(i / 4) * 64;
            return (
              <g key={i}>
                <rect x={x} y={y} width="60" height="54" rx="6" fill="rgb(60 245 138 / 0.07)" stroke={V} strokeOpacity="0.55" strokeWidth="1.5" />
                <rect x={x + 8} y={y + 36} width={14 + ((i * 7) % 30)} height="6" rx="3" fill={V} />
                <circle cx={x + 48} cy={y + 12} r="4" fill={V} />
              </g>
            );
          })}
        </g>
      );
  }
}

export function Modulos() {
  const raizRef = useRef<HTMLElement>(null);
  const pistaRef = useRef<HTMLOListElement>(null);
  const tarjetaRefs = useRef<HTMLLIElement[]>([]);
  const dibujoRefs = useRef<SVGSVGElement[]>([]);
  const barraRef = useRef<HTMLSpanElement>(null);
  const cuentaRef = useRef<HTMLSpanElement>(null);
  const N = modulos.tarjetas.length;

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      const pista = pistaRef.current;
      if (!raiz || !pista) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const vw = window.innerWidth;
      const k = tramo(p, 0.04, 0.96);
      const recorrido = Math.max(0, pista.offsetLeft + pista.scrollWidth - vw * 0.94);
      pista.style.transform = `translate3d(${-k * recorrido}px, 0, 0)`;

      let cercana = 0;
      let mejor = Infinity;
      tarjetaRefs.current.forEach((t, i) => {
        const r = t.getBoundingClientRect();
        const desvio = (r.left + r.width / 2 - vw * 0.62) / vw;
        const a = clamp(Math.abs(desvio) * 1.6);
        t.style.opacity = String(1 - a * 0.55);
        t.style.transform = `scale(${1 - a * 0.06})`;
        dibujoRefs.current[i].style.transform = `translate3d(${desvio * -60}px, 0, 0)`;
        if (Math.abs(desvio) < mejor) {
          mejor = Math.abs(desvio);
          cercana = i;
        }
      });
      barraRef.current!.style.transform = `scaleX(${k})`;
      cuentaRef.current!.textContent = String(cercana + 1).padStart(2, '0');
    });
  }, []);

  return (
    <section ref={raizRef} id="modulos" aria-labelledby="modulos-titulo" className="relative bg-void" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 flex h-pantalla flex-col justify-center overflow-hidden pt-14 md:flex-row md:items-center md:justify-start md:pt-0">
        <div className="relative z-20 shrink-0 bg-void px-5 sm:px-6 md:flex md:w-[34vw] md:flex-col md:justify-center md:self-stretch md:pr-10 md:pl-[6vw] md:after:absolute md:after:inset-y-0 md:after:left-full md:after:w-24 md:after:bg-gradient-to-r md:after:from-void md:after:to-transparent">
          <p className="antetitulo text-fosforo">{modulos.antetitulo}</p>
          <h2 id="modulos-titulo" className="mt-3 font-display text-display font-semibold text-texto md:mt-4">
            {modulos.titulo}
          </h2>
          <p className="mt-5 max-w-[26rem] text-body text-texto-2 max-md:hidden">{modulos.cuerpo}</p>
          <div className="mt-4 flex items-center gap-4 font-mono text-etiqueta tracking-[0.14em] text-texto-3 uppercase md:mt-8" aria-hidden="true">
            <span>
              <span ref={cuentaRef} className="tabular-nums text-texto">
                01
              </span>{' '}
              / {String(N).padStart(2, '0')}
            </span>
            <span className="relative h-px w-32 bg-borde">
              <span ref={barraRef} className="absolute inset-0 origin-left bg-fosforo" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>

        <ol ref={pistaRef} className="relative z-10 mt-6 flex gap-4 pl-5 will-change-transform sm:pl-6 md:mt-0 md:gap-6 md:pl-0">
          {modulos.tarjetas.map((t, i) => (
            <li
              key={t.id}
              ref={(el) => {
                if (el) tarjetaRefs.current[i] = el;
              }}
              className="w-[74vw] shrink-0 origin-bottom sm:w-[44vw] md:w-[clamp(17rem,25vw,23rem)]"
            >
              <a
                href={CARPETA[t.id] ? BASE_REPO + CARPETA[t.id] : marca.repo}
                className="group block rounded-[14px] border border-borde bg-superficie p-3 transition-colors duration-200 hover:border-fosforo"
              >
                <div className="scanlines relative aspect-[4/3] overflow-hidden rounded-[8px] border border-borde bg-void">
                  <svg
                    ref={(el) => {
                      if (el) dibujoRefs.current[i] = el;
                    }}
                    viewBox="0 0 320 240"
                    className="absolute inset-0 size-full will-change-transform"
                    aria-hidden="true"
                  >
                    <Instrumento id={t.id} />
                  </svg>
                  <span className="absolute top-2.5 left-2.5 rounded-full border border-borde bg-elevado/90 px-2.5 py-0.5 font-mono text-[0.625rem] tracking-[0.12em] text-texto uppercase">
                    {t.etiqueta}
                  </span>
                </div>
                <div className="px-1 pt-4 pb-1.5">
                  <span className="block font-display text-[1.25rem] font-semibold text-texto">{t.titulo}</span>
                  <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-texto-2">{t.cuerpo}</span>
                  <code className="mt-3 block truncate font-mono text-[0.75rem] text-fosforo">{t.codigo.startsWith('smc') ? `$ ${t.codigo}` : t.codigo}</code>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
