import { useEffect, useState } from 'react';

/** Current time in ms, refreshed every `intervalMs` while `isActive` is `true`. */
export function useNow(isActive: boolean, intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive) return;
    // Refresh at once: the value may be old after a pause.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [isActive, intervalMs]);

  return now;
}
