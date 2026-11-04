import {useEffect} from 'react';
import {Flujo} from './components/Flujo';
import {Demo} from './components/Demo';
import {Cabecera, Cierre} from './components/Marco';
import {Marcos} from './components/Marcos';
import {Modulos} from './components/Modulos';
import {Radar} from './components/Radar';
import {useMovimientoReducido} from './hooks/useMovimientoReducido';
import {iniciarScroll} from './lib/scroll';

/** Secciones en orden de scroll: radar, flujo, marcos, módulos, demo y cierre. */
export default function App() {
  const reducido = useMovimientoReducido();
  useEffect(() => iniciarScroll(reducido), [reducido]);
  return (
    <>
      <Cabecera />
      <main>
        <Radar />
        <Flujo />
        <Marcos />
        <Modulos />
        <Demo />
      </main>
      <Cierre />
    </>
  );
}
