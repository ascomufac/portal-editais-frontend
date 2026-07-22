import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Sempre começa como `false` (igual ao SSR) e só atualiza após mount,
 * evitando hydration mismatch no header/sidebar.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
