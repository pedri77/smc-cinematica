import {cierre, marca, nav} from '../content';
import {useAjustarTexto} from '../hooks/useAjustarTexto';
import {useAparecer} from '../hooks/useAparecer';
import {irA} from '../lib/scroll';

/**
 * Cabecera fija y cierre.
 *
 * Sección 5 · Cierre · patrón 7 (aparición al entrar) + 8 (wordmark de borde a borde) · flujo normal
 *   al entrar: antetítulo, titular (--i 1), puntos de soberanía (--i 2), bloque de instalación (--i 3)
 *   muro de luces: al entrar, los 129 pilotos (15 NIS2, 73 ENS, 21 transversales, 20 de red) se
 *   encienden en verde con un escalonado de 9 ms: toda la sala en verde
 *   después: CTA «Ver en GitHub» y wordmark SMC de borde a borde en el pie
 */

const GitHub = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

export function Cabecera() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-[6vw] md:py-4">
      <a
        href="#inicio"
        onClick={(e) => {
          e.preventDefault();
          irA('#inicio');
        }}
        className="flex items-center gap-2 font-mono text-[1rem] font-bold tracking-[0.08em] text-texto"
        aria-label={marca.nombre}
      >
        <span className="inline-block size-2.5 rounded-full bg-fosforo shadow-[0_0_10px_rgb(60_245_138/0.9)]" aria-hidden="true" />
        {marca.corto}
      </a>
      <div className="flex items-center gap-2">
        <nav aria-label="Secciones" className="flex items-center gap-1 rounded-full border border-borde bg-superficie/80 p-1 backdrop-blur-sm max-md:hidden">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                irA(n.href);
              }}
              className="rounded-full px-4 py-1.5 text-[0.8125rem] text-texto-2 transition-colors duration-200 hover:bg-elevado hover:text-texto"
            >
              {n.texto}
            </a>
          ))}
        </nav>
        <a
          href={marca.repo}
          className="flex items-center gap-2 rounded-full border border-fosforo/50 bg-superficie/80 px-4 py-2 text-[0.8125rem] font-semibold text-fosforo backdrop-blur-sm transition-colors duration-200 hover:bg-fosforo hover:text-void"
        >
          <GitHub />
          {marca.cta}
        </a>
      </div>
    </header>
  );
}

export function Cierre() {
  const ref = useAparecer<HTMLElement>();
  const marcaRef = useAjustarTexto<HTMLSpanElement>();
  let n = 0;
  return (
    <footer ref={ref} aria-labelledby="cierre-titulo" className="relative overflow-hidden bg-void px-5 pt-[16svh] pb-8 sm:px-6 md:px-[6vw]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60svh]" style={{background: 'radial-gradient(60% 70% at 70% 30%, rgb(60 245 138 / 0.08), transparent 70%)'}} />
      <div className="relative grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-[5vw]">
        <div>
          <p data-aparece className="antetitulo text-fosforo">
            {cierre.antetitulo}
          </p>
          <h2 id="cierre-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-4 font-display text-display font-semibold text-texto">
            {cierre.titulo}
          </h2>
          <ul data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-6 space-y-2 text-body text-texto-2">
            {cierre.puntos.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-[0.6em] inline-block size-1.5 shrink-0 rounded-full bg-fosforo" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <pre data-aparece style={{'--i': 3} as React.CSSProperties} className="mt-8 overflow-x-auto rounded-[10px] border border-borde bg-superficie p-4 font-mono text-[0.8125rem] leading-relaxed text-texto">
            {cierre.instalar.map((l) => (
              <span key={l} className="block">
                <span className="text-texto-3 select-none">$ </span>
                {l}
              </span>
            ))}
          </pre>
        </div>

        <div data-aparece style={{'--i': 2} as React.CSSProperties} className="rounded-[14px] border border-borde bg-superficie/60 p-5 md:p-7">
          <p className="antetitulo text-fosforo">{cierre.muro}</p>
          <div className="mt-5 space-y-5">
            {cierre.grupos.map((g) => (
              <div key={g.marco}>
                <p className="flex items-baseline justify-between font-mono text-[0.75rem] tracking-[0.1em] text-texto-2 uppercase">
                  <span>{g.marco}</span>
                  <span className="tabular-nums">
                    {g.n} {g.texto}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-[4px]" aria-hidden="true">
                  {Array.from({length: g.n}, () => {
                    const i = n++;
                    return <span key={i} className="muro-luz block size-[11px] rounded-[2px] md:size-[13px]" style={{'--i': i} as React.CSSProperties} />;
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[0.875rem] text-texto-2">{cierre.meta}</p>
        </div>
      </div>

      <div className="relative mt-[12svh] flex justify-center">
        <a
          data-aparece
          href={marca.repo}
          className="inline-flex items-center gap-3 rounded-full bg-fosforo px-8 py-4 text-[1.0625rem] font-semibold text-void shadow-[0_0_40px_rgb(60_245_138/0.3)] transition-transform duration-200 hover:scale-[1.03]"
        >
          <GitHub />
          {cierre.cta}
        </a>
      </div>

      <div className="relative mt-[10svh] pb-[0.04em]" aria-hidden="true">
        <span ref={marcaRef} className="inline-block font-mono leading-[0.9] font-bold whitespace-nowrap text-[#16301f] [text-shadow:0_0_80px_rgb(60_245_138/0.18)]">
          {marca.corto}
        </span>
      </div>
      <p className="relative mt-6 flex flex-col gap-2 border-t border-borde pt-5 text-[0.75rem] text-texto-3 sm:flex-row sm:justify-between">
        <span>
          {marca.nombre}. {cierre.aviso}
        </span>
        <span className="font-mono">{cierre.firma}</span>
      </p>
    </footer>
  );
}
