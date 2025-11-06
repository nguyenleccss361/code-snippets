import * as React from 'react'

/**
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop or avoid re-executing effects when passed as a dependency
 * ref: https://tkdodo.eu/blog/the-useless-use-callback
 */
function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
  const callbackRef = React.useRef(callback)

  React.useEffect(() => {
    callbackRef.current = callback
  })

  // https://github.com/facebook/react/issues/19240
  return React.useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, [])
}

export { useCallbackRef }

/**
 * Use case:
 * ref: https://github.com/search?q=repo%3Aradix-ui%2Fprimitives%20useCallbackRef&type=code
 */
// const handleLoadingStatusChange = useCallbackRef((status: ImageLoadingStatus) => {
//   onLoadingStatusChange(status);
//   context.onImageLoadingStatusChange(status);
// });

// useLayoutEffect(() => {
//   if (imageLoadingStatus !== 'idle') {
//     handleLoadingStatusChange(imageLoadingStatus);
//   }
// }, [imageLoadingStatus, handleLoadingStatusChange]);
