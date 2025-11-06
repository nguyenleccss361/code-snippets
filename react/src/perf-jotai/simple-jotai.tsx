import { atom, useAtom, useSetAtom } from 'jotai'

// atoms = minimal pieces of state
const countAtom = atom(0)
const titleAtom = atom('Hello')
const todosAtom = atom<string[]>(['a', 'b'])

const Count = function Count() {
  const [count] = useAtom(countAtom)
  console.log('[Jotai] render <Count>')
  return <div>Count: {count}</div>
}

const Title = function Title() {
  const [title] = useAtom(titleAtom)
  console.log('[Jotai] render <Title>')
  return <h1>{title}</h1>
}

const Todos = function Todos() {
  const [todos] = useAtom(todosAtom)
  console.log('[Jotai] render <Todos>')
  return (
    <ul>
      {todos.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

function Controls() {
  const setCount = useSetAtom(countAtom)
  const setTitle = useSetAtom(titleAtom)
  const setTodos = useSetAtom(todosAtom)
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button onClick={() => setCount((c) => c + 1)}>inc count</button>
      <button onClick={() => setTitle((s) => s + '!')}>append to title</button>
      <button onClick={() => setTodos((xs) => [...xs, String(xs.length)])}>
        add todo
      </button>
    </div>
  )
}

export function SimpleJotai() {
  return (
    <div>
      <Title />
      <Count />
      <Todos />
      <Controls />
    </div>
  )
}
