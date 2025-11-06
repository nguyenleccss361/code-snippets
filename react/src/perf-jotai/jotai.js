import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useMemo } from 'react'
import { buildClinicalTrialTree } from './clinical-trial-tree'
import { useFlashOnRender } from './use-flash-on-render'

const completedNodeIdsAtom = atom(new Set())
const completedCountAtom = atom((get) => {
  const completedNodeIds = get(completedNodeIdsAtom)
  return completedNodeIds.size
})
const isCompletedAtomFamily = atomFamily((nodeId) => {
  return atom((get) => {
    const completedNodeIds = get(completedNodeIdsAtom)
    return completedNodeIds.has(nodeId)
  })
})

export default function Jotai() {
  const clinicalTrialTree = useMemo(() => {
    return buildClinicalTrialTree(3, 3)
  }, [])

  return (
    <>
      <h1>Clinical Trial Data Tree</h1>
      <CompletedCount />
      {clinicalTrialTree.map((node) => (
        <Node key={node.id} node={node} />
      ))}
    </>
  )
}

function CompletedCount() {
  const ref = useFlashOnRender()
  const completedCount = useAtomValue(completedCountAtom)

  return (
    <p ref={ref}>
      Completed Count: <strong>{completedCount}</strong>
    </p>
  )
}

function Node({ node }) {
  const ref = useFlashOnRender(node)

  const setCompletedNodeIds = useSetAtom(completedNodeIdsAtom)
  const isCompleted = useAtomValue(isCompletedAtomFamily(node.id))

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
