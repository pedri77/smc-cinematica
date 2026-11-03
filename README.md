# SMC · web cinemática

Landing de scroll cinematográfico para [Security Manager Control](https://github.com/pedri77/security-manager-control).
Concepto «sala de control»: un radar barre el perímetro, los controles se encienden como luces de un panel,
NIS2, ENS e ISO 27001 convergen en una rejilla y las brechas aparecen como ecos rojos que se priorizan.

- Stack: Vite, React, Tailwind 4, Lenis. Un solo bucle rAF; el scroll no re-renderiza.
- Todo el arte es SVG/CSS generado por código. Sin imágenes de pago ni de IA.
- Textos en `src/content.ts`. Guion de scroll en la cabecera de cada componente.
- Fuentes autoalojadas (Space Grotesk y JetBrains Mono vía @fontsource).

```bash
npm install
npm run dev      # http://localhost:3027/smc-cinematica/
npm run build
```

Despliegue: GitHub Pages con `.github/workflows/pages.yml` (base `/smc-cinematica/`).
Técnica de la skill `web-cinematica`; código y textos propios.
