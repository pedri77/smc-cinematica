import {demo} from '../content';
import {useAparecer} from '../hooks/useAparecer';
import {useMovimientoReducido} from '../hooks/useMovimientoReducido';

/**
 * Sección 4b · Demo · patrón 7 (aparición al entrar) · flujo normal
 *   vídeo de un minuto con subtítulos grabados: arranca solo y sin sonido salvo con movimiento reducido,
 *   donde espera a que se pulse play. Debajo, enlace a la guía de uso en YouTube.
 */
export function Demo() {
  const ref = useAparecer<HTMLElement>();
  const reducido = useMovimientoReducido();
  const base = import.meta.env.BASE_URL;
  return (
    <section ref={ref} id="demo" aria-labelledby="demo-titulo" className="relative bg-void px-5 py-[14svh] sm:px-6 md:px-[6vw]">
      <div className="mx-auto max-w-[1100px]">
        <p data-aparece className="antetitulo text-fosforo">
          {demo.antetitulo}
        </p>
        <h2 id="demo-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-4 font-display text-display font-semibold text-texto">
          {demo.titulo}
        </h2>
        <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-4 max-w-[60ch] text-body text-texto-2">
          {demo.entradilla}
        </p>
        <div data-aparece style={{'--i': 3} as React.CSSProperties} className="mt-8 overflow-hidden rounded-[14px] border border-borde bg-superficie shadow-[0_0_60px_rgb(60_245_138/0.08)]">
          <video
            key={reducido ? 'quieto' : 'auto'}
            className="block aspect-video w-full"
            src={base + demo.video}
            poster={base + demo.poster}
            aria-label={demo.etiqueta}
            controls
            muted
            playsInline
            loop={!reducido}
            autoPlay={!reducido}
            preload="metadata"
          />
        </div>
        <p className="mt-5 flex flex-col gap-2 text-[0.875rem] text-texto-2 sm:flex-row sm:items-center sm:justify-between">
          <a href={demo.guia.href} className="font-semibold text-fosforo underline-offset-4 hover:underline">
            {demo.guia.texto} →
          </a>
          <span className="text-texto-3">{demo.nota}</span>
        </p>
      </div>
    </section>
  );
}
