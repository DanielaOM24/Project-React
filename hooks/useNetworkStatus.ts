import { useEffect, useState } from 'react';

export type NetworkStatus = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

/**
 * Hook para detectar estado de conexión.
 * En web/nativo sin NetInfo retorna isConnected: true para no bloquear flujos.
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkState, setNetworkState] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (isMounted) {
          setNetworkState({ isConnected: res.ok, isInternetReachable: res.ok });
        }
      } catch {
        if (isMounted) {
          setNetworkState({ isConnected: false, isInternetReachable: false });
        }
      }
    };

    check();
    const id = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  return networkState;
}
