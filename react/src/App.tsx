import { scan } from 'react-scan'
import "./App.css";
import { useEffect } from 'react';
import { Context } from "./perf-jotai/context";
import { Jotai } from "./perf-jotai/jotai";
import { SplitContext } from "./perf-jotai/split-context";
import { ExternalStore } from "./perf-jotai/external-store";
import { SimpleJotai } from "./perf-jotai/simple-jotai";
import { VanillaUnoptimized } from "./perf-jotai/vanilla-unoptimized";
import {Reactivity} from './reactivity/selector'

function App() {
  useEffect(() => {
      if ( import.meta.env.MODE === 'development') {
        scan({ enabled: true })
      }
    }, [])

  return (
    // <Context />
    // <Jotai />
    // <SplitContext />
    // <ExternalStore />
    // <SimpleJotai />
    <VanillaUnoptimized />
    // <Reactivity />
  );
}

export default App;
