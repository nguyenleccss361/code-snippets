import { createContext, useContext, useMemo, useState } from 'react'
import { buildClinicalTrialTree } from './clinical-trial-tree'
import { useFlashOnRender } from './use-flash-on-render'

const CompletedNodeIdsContext = createContext([new Set(), () => {}])

export default function Context() {
  const clinicalTrialTree = useMemo(() => {
    return buildClinicalTrialTree(3, 3)
  }, [])

  const [completedNodeIds, setCompletedNodeIds] = useState(new Set())

  return (
    <>
      <CompletedNodeIdsContext.Provider
        value={[completedNodeIds, setCompletedNodeIds]}
      >
        <h1>Clinical Trial Data Tree</h1>
        <CompletedCount />
        {clinicalTrialTree.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </CompletedNodeIdsContext.Provider>
    </>
  )
}

function CompletedCount() {
  const ref = useFlashOnRender()

  const [completedNodeIds] = useContext(CompletedNodeIdsContext)
  const completedCount = completedNodeIds.size

  return (
    <p ref={ref}>
      Completed Count: <strong>{completedCount}</strong>
    </p>
  )
}

function Node({ node }) {
  const ref = useFlashOnRender(node)

  const [completedNodeIds, setCompletedNodeIds] = useContext(
    CompletedNodeIdsContext,
  )
  const isCompleted = completedNodeIds.has(node.id)

  return (
    <div key={node.id} ref={ref} style={{ userSelect: 'none' }}>
      <p>
        &mdash; {node.id}{' '}
        {node.type === 'field' &&
          (isCompleted ? (
            <span
              onClick={() =>
                setCompletedNodeIds((prev) => {
                  prev.delete(node.id)
                  return new Set([...prev])
                })
              }
            >
              ✅
            </span>
          ) : (
            <button
              onClick={() =>
                setCompletedNodeIds((prev) => new Set([...prev, node.id]))
              }
            >
              Mark Completed
            </button>
          ))}
      </p>
      <div style={{ paddingLeft: '20px' }}>
        {node.children.map((child) => (
          <Node key={child.id} node={child} />
        ))}
      </div>
    </div>
  )
}
