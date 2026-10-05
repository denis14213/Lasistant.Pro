import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  /** Action proposée dans la notification (« Ouvrir », « Réessayer »…) */
  action?: { label: string; onClick: () => void };
  /** Durée d'affichage en millisecondes */
  duration?: number;
}

export interface ToastApi {
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Accès aux notifications depuis n'importe quel composant. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit être utilisé à l’intérieur de <ToastProvider>.');
  return context;
}
