import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconClose, IconError, IconInfo, IconSuccess } from '@/components/ui/icons';
import { ToastContext, type ToastApi, type ToastOptions, type ToastTone } from './toast-context';

/**
 * Notifications temporaires (« Modifications enregistrées », « Lien copié »…).
 * Annoncées aux lecteurs d'écran et refermées automatiquement après quelques secondes.
 */

interface ToastItem extends ToastOptions {
  id: number;
  tone: ToastTone;
  message: string;
}

/** Icône d'état pleine, colorée pour rester lisible sur le fond sombre de la notification. */
const ICONS: Record<ToastTone, ReactNode> = {
  success: <IconSuccess weight="fill" className="size-6 shrink-0 text-success-light" />,
  error: <IconError weight="fill" className="size-6 shrink-0 text-danger-bright" />,
  info: <IconInfo weight="fill" className="size-6 shrink-0 text-brand-light" />,
};

const DEFAULT_DURATION = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((tone: ToastTone, message: string, options: ToastOptions = {}) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, tone, message, ...options }]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      info: (message, options) => show('info', message, options),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              aria-live="polite"
              aria-relevant="additions"
              className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--mobile-nav-height)+12px)] z-[140] flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
            >
              {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  // Fermeture automatique ; « onDismiss » est stable, le minuteur n'est donc jamais relancé.
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration ?? DEFAULT_DURATION);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id, toast.duration]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full max-w-[460px] items-center gap-3 rounded-2xl bg-night py-3 pr-3 pl-3.5 text-[14.5px] leading-snug text-white shadow-float"
    >
      {ICONS[toast.tone]}
      <p className="flex-1">{toast.message}</p>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="font-semibold whitespace-nowrap underline underline-offset-2"
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer le message"
        className="flex rounded-lg p-1.5 text-on-dark transition-colors hover:bg-white/10 hover:text-white"
      >
        <IconClose className="size-4" aria-hidden />
      </button>
    </div>
  );
}
