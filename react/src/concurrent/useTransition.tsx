import { useEffect, useState, useTransition } from "react";

/**
 *
 * @see: https://www.charpeni.com/blog/dont-blindly-use-usetransition-everywhere
 */
export function Delay({ delay, children }) {
  const [isPending, startTransition] = useTransition();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(false);

    const timeout = setTimeout(() => {
      startTransition(() => { // <- This is where the magic happens
        setShouldRender(true);
      });
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  // We can even rely freely on isPending in the right context now!
  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;

}
