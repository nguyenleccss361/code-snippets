import React, { createContext, useCallback, useMemo, useState, useContext } from 'react'

// Single canonical state object
type State = {
  count: number
  title: string
  todos: string[]
}

const initial: State = { count: 0, title: 'Hello', todos: ['a', 'b'] }

// Three independent contexts for three slices
type CountCtx = { count: number; inc: () => void }
type TitleCtx = { title: string; setTitle: (f: (s: string) => string) => void }
type TodosCtx = { todos: string[]; addTodo: (t: string) => void }

const CountContext = createContext<CountCtx | null>(null)
const TitleContext = createContext<TitleCtx | null>(null)
const TodosContext = createContext<TodosCtx | null>(null)

// Root provider hoists a single source of truth,
// but memoizes each context value by its own deps.
// Only the context whose slice changed gets a new reference.
function RootStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial)

  const inc = useCallback(() => {
    setState((s) => ({ ...s, count: s.count + 1 }))
  }, [])

  const setTitle = useCallback((updater: (s: string) => string) => {
    setState((s) => ({ ...s, title: updater(s.title) }))
  }, [])

  const addTodo = useCallback((t: string) => {
    setState((s) => ({ ...s, todos: [...s.todos, t] }))
  }, [])

  // isolate references per-slice
  const countValue = useMemo<CountCtx>(() => ({ count: state.count, inc }), [state.count, inc])
  const titleValue = useMemo<TitleCtx>(() => ({ title: state.title, setTitle }), [state.title, setTitle])
  const todosValue = useMemo<TodosCtx>(() => ({ todos: state.todos, addTodo }), [state.todos, addTodo])

  return (
    <CountContext.Provider value={countValue}>
      <TitleContext.Provider value={titleValue}>
        <TodosContext.Provider value={todosValue}>{children}</TodosContext.Provider>
      </TitleContext.Provider>
    </CountContext.Provider>
  )
}

// Consumers subscribe to one slice only
const Count = function Count() {
  const ctx = useContext(CountContext)!
  console.log('[Vanilla] render <Count>')
  return <div>Count: {ctx.count}</div>
}

const Title = function Title() {
  const ctx = useContext(TitleContext)!
  console.log('[Vanilla] render <Title>')
  return <h1>{ctx.title}</h1>
}

const Todos = function Todos() {
  const ctx = useContext(TodosContext)!
  console.log('[Vanilla] render <Todos>')
  return (
    <ul>
      {ctx.todos.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

function Controls() {
  const { inc } = useContext(CountContext)!
  const { setTitle } = useContext(TitleContext)!
  const { addTodo, todos } = useContext(TodosContext)!
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button onClick={inc}>inc count</button>
      <button onClick={() => setTitle((s) => s + '!')}>append to title</button>
      <button onClick={() => addTodo(String(todos.length))}>add todo</button>
    </div>
  )
}

export function SplitContext() {
  return (
    <RootStoreProvider>
      <Title />
      <Count />
      <Todos />
      <Controls />
    </RootStoreProvider>
  )
}
