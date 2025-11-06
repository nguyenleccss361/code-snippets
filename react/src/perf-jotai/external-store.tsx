import { useSyncExternalStore } from 'react'

// Single canonical state object
type State = {
  count: number
  title: string
  todos: string[]
}

type Listener = () => void
const listeners = new Set<Listener>()
let state: State = { count: 0, title: 'Hello', todos: ['a', 'b'] }

function setState(updater: (s: State) => State) {
  const next = updater(state)
  if (next !== state) {
    state = next
    listeners.forEach((l) => l())
  }
}

function subscribe(l: Listener) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function useStore<T>(selector: (s: State) => T, isEqual: (a: T, b: T) => boolean = Object.is) {
  return useSyncExternalStore(
    subscribe,
    (() => {
      let last = selector(state)
      return () => {
        const next = selector(state)
        // prevent spurious updates
        if (!isEqual(next, last)) last = next
        return last
      }
    })(),
    () => selector(state)
  )
}

const Count = function Count() {
  const count = useStore((s) => s.count)
  console.log('[ExternalStore] render <Count>')
  return <div>Count: {count}</div>
}

const Title = function Title() {
  const title = useStore((s) => s.title)
  console.log('[ExternalStore] render <Title>')
  return <h1>{title}</h1>
}

const Todos = function Todos() {
  const todos = useStore((s) => s.todos)
  console.log('[ExternalStore] render <Todos>')
  return <ul>{todos.map((t, i) => <li key={i}>{t}</li>)}</ul>
}

function Controls() {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button onClick={() => setState((s) => ({ ...s, count: s.count + 1 }))}>inc count</button>
      <button onClick={() => setState((s) => ({ ...s, title: s.title + '!' }))}>append to title</button>
      <button onClick={() => setState((s) => ({ ...s, todos: [...s.todos, String(s.todos.length)] }))}>
        add todo
      </button>
    </div>
  )
}

export function ExternalStore() {
  return (
    <div>
      <Title />
      <Count />
      <Todos />
      <Controls />
    </div>
  )
}
