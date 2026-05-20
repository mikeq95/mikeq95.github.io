import { createContext, useContext } from 'react';

export const ClerkReadyContext = createContext(false);

export function useClerkReady() {
  return useContext(ClerkReadyContext);
}
