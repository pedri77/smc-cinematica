/** Todo el texto de la página vive aquí. Los componentes no llevan texto suelto. */

export const marca = {
  nombre: 'Security Manager Control',
  corto: 'SMC',
  repo: 'https://github.com/pedri77/security-manager-control',
  cta: 'Ver en GitHub',
};

export const nav = [
  {texto: 'Flujo', href: '#flujo'},
  {texto: 'Marcos', href: '#marcos'},
  {texto: 'Módulos', href: '#modulos'},
];

/** Estado de un control en el panel: cumplido, parcial o brecha. */
export type Estado = 'ok' | 'parcial' | 'brecha';
export type Prioridad = 'P1' | 'P2' | 'P3';

/**
 * Panel del escenario: los 15 controles NIS2 del catálogo (IDs reales).
 * Los estados y prioridades son un ejemplo ilustrativo, no datos de ningún cliente.
 */
export const controlesNis2: {id: string; titulo: string; estado: Estado; prioridad?: Prioridad; nota?: string}[] = [
  {id: 'NIS2-20.1', titulo: 'Aprobación y supervisión por el órgano de dirección', estado: 'ok'},
  {id: 'NIS2-20.2', titulo: 'Formación del órgano de dirección', estado: 'parcial'},
  {id: 'NIS2-21.2.a', titulo: 'Análisis de riesgos y políticas de seguridad', estado: 'ok'},
  {id: 'NIS2-21.2.b', titulo: 'Gestión de incidentes', estado: 'parcial'},
  {id: 'NIS2-21.2.c', titulo: 'Continuidad de negocio y copias de seguridad', estado: 'ok'},
  {id: 'NIS2-21.2.d', titulo: 'Seguridad de la cadena de suministro', estado: 'brecha', prioridad: 'P2', nota: 'Cadena de suministro sin evaluar'},
  {id: 'NIS2-21.2.e', titulo: 'Adquisición, desarrollo y vulnerabilidades', estado: 'parcial'},
  {id: 'NIS2-21.2.f', titulo: 'Evaluación de la eficacia de las medidas', estado: 'ok'},
  {id: 'NIS2-21.2.g', titulo: 'Ciberhigiene básica y formación', estado: 'ok'},
  {id: 'NIS2-21.2.h', titulo: 'Criptografía y cifrado', estado: 'brecha', prioridad: 'P3', nota: 'Política de cifrado sin evidencia'},
  {id: 'NIS2-21.2.i', titulo: 'RR. HH., control de acceso y activos', estado: 'parcial'},
  {id: 'NIS2-21.2.j', titulo: 'MFA y comunicaciones seguras', estado: 'brecha', prioridad: 'P1', nota: 'MFA sin desplegar en accesos remotos'},
  {id: 'NIS2-23.alerta', titulo: 'Alerta temprana en 24 h', estado: 'brecha', prioridad: 'P1', nota: 'Sin procedimiento de alerta en 24 h'},
  {id: 'NIS2-23.notificacion', titulo: 'Notificación del incidente en 72 h', estado: 'ok'},
  {id: 'NIS2-23.final', titulo: 'Informe final en un mes', estado: 'parcial'},
];

export const radar = {
  etiquetaSeccion: 'Sala de control: el radar barre el perímetro de una organización',
  antetitulo: 'Security Manager Control · código abierto',
  pregunta: '¿Qué me exige la normativa, qué tengo, con qué evidencia y qué me falta?',
  invitacion: 'Desliza para encender la sala',
  titulo: 'Todo el perímetro,',
  destacado: 'en una sola pantalla.',
  entradilla:
    'Una herramienta de línea de comandos en Python para el Security Manager y el CISO: decide qué marcos aplican a cada cliente, evalúa cada control con evidencias y prioriza lo que falta.',
  hud: {
    barrido: 'Barrido',
    controles: 'Controles NIS2',
    ecos: 'Ecos',
    modo: 'Ejecución local · UE',
    ejemplo: 'Ejemplo ilustrativo',
    turno: 'Turno de noche',
  },
  panel: 'Panel NIS2 · 15 controles',
  leyenda: [
    {estado: 'ok', texto: 'Implementado'},
    {estado: 'parcial', texto: 'Parcial'},
    {estado: 'brecha', texto: 'No implementado'},
  ] as {estado: Estado; texto: string}[],
  brechas: {
    titulo: 'Brechas priorizadas',
    nota: 'Ejemplo ilustrativo, no datos de un cliente.',
  },
};

export const flujo = {
  antetitulo: 'Flujo de trabajo',
  titulo: 'Del perfil del cliente al plan de acción.',
  nota: 'Un método para todos los clientes',
  pasos: [
    {
      titulo: 'Perfil del cliente',
      cuerpo: 'Sector, tamaño y si es sector público. Se rellena una plantilla YAML que vive fuera del repositorio.',
      codigo: 'assessment.template.yaml',
    },
    {
      titulo: 'Marcos aplicables',
      cuerpo: 'NIS2 siempre. ENS si es sector público, con su categoría BÁSICA, MEDIA o ALTA. Transversal y red, siempre.',
      codigo: 'NIS2 · ENS · TRV · NET',
    },
    {
      titulo: 'Evaluación con evidencias',
      cuerpo: 'Cada control con su estado: implementado, parcial, no implementado o no aplica. Un implementado sin evidencia sale como aviso.',
      codigo: 'implementado 1.0 · parcial 0.5',
    },
    {
      titulo: 'Brechas priorizadas',
      cuerpo: 'Lo que falta, ordenado en P1, P2 y P3 para saber por dónde empezar el lunes.',
      codigo: 'smc gap cliente.yaml',
    },
    {
      titulo: 'Plan de acción',
      cuerpo: 'Cada brecha con responsable, fecha y estado, para seguirla hasta cerrarla.',
      codigo: 'smc plan cliente.yaml',
    },
    {
      titulo: 'Informe y dashboard',
      cuerpo: 'Informe HTML por cliente y un dashboard estático con todos los clientes a la vista.',
      codigo: 'smc report cliente.yaml -o informe.html',
    },
  ],
};

export const marcos = {
  antetitulo: 'Cruce de marcos',
  titulo: 'Tres marcos, una sola rejilla.',
  cuerpo:
    'El mapeo NIS2 ↔ ENS ↔ ISO 27001 permite evaluar un control una vez y reutilizar la evidencia en los tres. RGPD, DORA y CIS Controls v8 forman la capa transversal. Las 73 medidas ENS, contrastadas con el Anexo II del BOE.',
  nombres: ['NIS2', 'ENS', 'ISO 27001'] as const,
  cifras: [
    {n: 15, texto: 'controles NIS2'},
    {n: 73, texto: 'medidas ENS'},
    {n: 21, texto: 'transversales'},
  ],
  ejemplo: {
    titulo: 'Una evidencia, tres marcos',
    filas: [
      {marco: 'NIS2', valor: '21.2.b · Gestión de incidentes'},
      {marco: 'ENS', valor: 'op.exp.7 · op.exp.9 · op.mon.1'},
      {marco: 'ISO 27001', valor: 'Anexo A 5.24 a 5.28'},
    ],
  },
  categoria: {titulo: 'Categoría ENS', niveles: ['BÁSICA', 'MEDIA', 'ALTA']},
  alineados: 'marcos alineados',
};

export const modulos = {
  antetitulo: 'Módulos',
  titulo: 'Toda la sala, no solo el cumplimiento.',
  cuerpo: 'El SOC, las tecnologías, las vulnerabilidades, la red y la normativa, enlazados a los mismos controles.',
  tarjetas: [
    {
      id: 'soc',
      etiqueta: 'SOC',
      titulo: 'Rendimiento del SOC',
      cuerpo:
        'MTTD, MTTA, MTTC y MTTR desde la exportación de incidentes, cumplimiento de SLA por severidad, madurez MITRE ATT&CK por táctica con playbooks y export a Navigator, y 20 verticales con baremo 0-5 (EDR/XDR, MDM, SASE, ZTNA, GRC…) enlazadas a NIS2.',
      codigo: 'smc soc incidentes.csv',
    },
    {
      id: 'tecnologias',
      etiqueta: 'Tecnologías',
      titulo: 'Tecnologías, reglas y suscripciones',
      cuerpo: 'Licencias, soporte y certificados con aviso de caducidad; estado de las reglas de cada dispositivo (y por qué no se puede evaluar cuando no se puede); suscripciones con uso y coste.',
      codigo: 'smc expiring registro.yaml --days 90',
    },
    {
      id: 'vulnerabilidades',
      etiqueta: 'Vulnerabilidades',
      titulo: 'CVEs con SLA',
      cuerpo: 'CVEs abiertos con plazo de remediación, priorizados con KEV, EPSS y CVSS, playbooks por caso de uso y 28 protocolos con búsquedas en NVD, CVE Details y ENISA.',
      codigo: 'smc vulns tracker.csv',
    },
    {
      id: 'red',
      etiqueta: 'Red',
      titulo: 'Módulo de red',
      cuerpo: '20 controles propios: segmentación, perímetro, acceso remoto, DNS, Wi‑Fi, OT y monitorización.',
      codigo: 'NET-SEG-01 · NET-INV-01',
    },
    {
      id: 'normativa',
      etiqueta: 'Normativa',
      titulo: 'Base legal a un clic',
      cuerpo: 'Desde cualquier control, su base en NIS2 y en el Reglamento de Ejecución 2024/2690, y las guías CCN-STIC del CCN-CERT que aplican.',
      codigo: 'smc refs NIS2-21.2.b',
    },
    {
      id: 'dashboard',
      etiqueta: 'Informes',
      titulo: 'Informes, dashboard y mapa 3D',
      cuerpo: 'Informe HTML por cliente, dashboard estático multicliente y un visor 3D de la red con el semáforo de cada dispositivo: todo se abre en local, sin servidor ni CDN.',
      codigo: 'smc visor mapa.json -o visor.html',
    },
  ],
};

export const cierre = {
  antetitulo: 'Soberanía del dato',
  titulo: 'Los datos del cliente no salen de tu equipo.',
  puntos: [
    'Datos de clientes fuera del repositorio.',
    'Ejecución local u on-prem, en la UE.',
    'Catálogos en YAML, versionados y revisables.',
  ],
  instalar: ['pip install -e .', 'smc validate', 'smc gap cliente.yaml -o informe.md', 'smc report cliente.yaml -o informe.html', 'smc dashboard clientes/ -o panel/', 'smc visor mapa.json -o visor.html'],
  muro: 'Toda la sala en verde',
  grupos: [
    {marco: 'NIS2', n: 15, texto: 'controles'},
    {marco: 'ENS', n: 73, texto: 'medidas'},
    {marco: 'Transversal', n: 21, texto: 'controles'},
    {marco: 'Red', n: 20, texto: 'controles'},
  ],
  meta: 'El objetivo de cada cliente: todos los controles que aplican, implementados y con evidencia.',
  cta: 'Ver en GitHub',
  aviso: 'Código abierto. Ilustraciones generadas por código, sin imágenes de IA.',
  firma: 'Hecho por pedri77',
};
