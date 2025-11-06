import React, { createContext, useContext, useState } from 'react'

// Single canonical state
type State = { count: number; title: string; todos: string[] }
const initial: State = { count: 0, title: 'Hello', todos: ['a', 'b'] }

// One big context. No splitting. No memoization.
type Ctx = {
  state: State
  inc: () => void
  setTitle: (u: (s: string) => string) => void
  addTodo: (t: string) => void
}
const StoreContext = createContext<Ctx | null>(null)

function RootStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial)

  // Updaters recreated every render
  const inc = () => setState((s) => ({ ...s, count: s.count + 1 }))
  const setTitle = (u: (s: string) => string) =>
    setState((s) => ({ ...s, title: u(s.title) }))
  const addTodo = (t: string) =>
    setState((s) => ({ ...s, todos: [...s.todos, t] }))

  // New object identity on every render
  const value: Ctx = { state, inc, setTitle, addTodo }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// All consumers subscribe to the same context value
function Count() {
  const { state } = useContext(StoreContext)!
  console.log('[Worst] render <Count>')
  return <div>Count: {state.count}</div>
}

function Title() {
  const { state } = useContext(StoreContext)!
  console.log('[Worst] render <Title>')
  return <h1>{state.title}</h1>
}

function Todos() {
  const { state } = useContext(StoreContext)!
  console.log('[Worst] render <Todos>')
  return (
    <ul>
      {state.todos.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

function Controls() {
  const { inc, setTitle, addTodo, state } = useContext(StoreContext)!
  console.log('[Worst] render <Controls>')
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button onClick={inc}>inc count</button>
      <button onClick={() => setTitle((s) => s + '!')}>append to title</button>
      <button onClick={() => addTodo(String(state.todos.length))}>add todo</button>
    </div>
  )
}

export function VanillaUnoptimized() {
  return (
    <RootStoreProvider>
      <Title />
      <Count />
      <Todos />
      <Controls />
    </RootStoreProvider>
  )
}
