import { useEffect, useRef } from 'react'

export function useFlashOnRender(node) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) {
      return
    }

    ref.current.style.transition = ''
    ref.current.style.background = `hsla(${(node?.depth ?? 0) * 90}, 100%, 75%, 50%)`

    const timeout = setTimeout(() => {
      if (ref.current) {
        ref.current.style.transition = 'background 0.5s ease-in-out'
        ref.current.style.background = ''
      }
    }, 500)

    return () => clearTimeout(timeout)
  })

  return ref;
}
