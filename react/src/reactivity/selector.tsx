import React, { createContext, useContext, useEffect, useState } from 'react'

type Listener<S> = (s: S) => void

class Store<S> {
  state: S
  private listeners = new Set<Listener<S>>()
  constructor(initial: S) { this.state = initial }
  subscribe = (fn: Listener<S>) => { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  update = (next: S) => { this.state = next; this.listeners.forEach(l => l(next)) }
}

function useSelector<S, A extends unknown[], T>(
  store: Store<S>,
  selector: (s: S, ...a: A) => T,
  ...args: A
): T {
  const [value, setValue] = useState<T>(() => selector(store.state, ...args))
  useEffect(() =>
    store.subscribe((state) =>
      setValue(selector(state, ...args)))
  , []);
  return value
}

type ReactivityState = { focus: number }
const Ctx = createContext<Store<ReactivityState> | null>(null)
const useStore = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('Store missing')
  return v
}

export function Reactivity() {
  const [store] = useState(() => new Store<ReactivityState>({ focus: 0 }))
  return (
    <Ctx.Provider value={store}>
      <Grid />
    </Ctx.Provider>
  )
}

function Grid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 48px)', gap: 8 }}>
      {Array.from({ length: 50 }).map((_, i) => <Cell key={i} index={i} />)}
    </div>
  )
}

const selectors = { isFocus: (s: ReactivityState, index: number) => s.focus === index }

function Cell({ index }: { index: number }) {
  const store = useStore()
  const focused = useSelector(store, selectors.isFocus, index)
  console.log('Cell rerender: ', index)

  return (
    <button
      onClick={() => store.update({ ...store.state, focus: index })}
      style={{
        width: 48, height: 48, border: '1px solid #888', borderRadius: 6,
        background: focused ? '#cfe8ff' : '#111', color: focused ? '#111' : '#eee', fontSize: 12
      }}
    >
      {index}
    </button>
  )
}

// unoptimized code
// import React, { createContext, useContext, useState } from 'react'

// type Ctx = {
//   focus: number
//   setFocus: React.Dispatch<React.SetStateAction<number>>
// }

// const Context = createContext<Ctx | null>(null)

// export function Reactivity() {
//   const [focus, setFocus] = useState(0)
//   return (
//     <Context.Provider value={{ focus, setFocus }}>
//       <Grid />
//     </Context.Provider>
//   )
// }

// function Grid() {
//   const cells = Array.from({ length: 50 })
//   return (
//     <div
//       style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(10, 48px)',
//         gap: 8,
//         padding: 16,
//         background: '#0f0f0f',
//         minHeight: '100vh',
//       }}
//     >
//       {cells.map((_, i) => (
//         <Cell key={i} index={i} />
//       ))}
//     </div>
//   )
// }

// function Cell({ index }: { index: number }) {
//   const ctx = useContext(Context)
//   if (!ctx) throw new Error('Context missing')
//   const isFocus = ctx.focus === index
//   console.log('Cell rerender: ', index)

//   return (
//     <button
//       onClick={() => ctx.setFocus(index)}
//       style={{
//         width: 48,
//         height: 48,
//         borderRadius: 6,
//         border: '1px solid #777',
//         background: isFocus ? '#cfe8ff' : '#1b1b1b',
//         color: isFocus ? '#111' : '#eaeaea',
//         fontSize: 12,
//         cursor: 'pointer',
//       }}
//     >
//       {index}
//     </button>
//   )
// }
