import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/routes';
import { useAuth } from './auth-context';
import { isSessionExpired } from './session-storage';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll'] as const;
/** On ne réécrit la session qu'une fois par minute au plus. */
const TOUCH_THROTTLE_MS = 60_000;
const CHECK_INTERVAL_MS = 30_000;

/**
 * Déconnexion automatique après une période d'inactivité (sécurité du back-office).
 */
export function useIdleLogout(): void {
  const { session, touch, logout } = useAuth();
  const navigate = useNavigate();
  const lastTouch = useRef(0);

  useEffect(() => {
    if (!session) return;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastTouch.current > TOUCH_THROTTLE_MS) {
        lastTouch.current = now;
        touch();
      }
    };
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, onActivity, { passive: true });
    return () => {
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, onActivity);
    };
  }, [session, touch]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      if (isSessionExpired(session)) {
        logout();
        navigate(ROUTES.admin.sessionExpired, { replace: true });
      }
    }, CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [session, logout, navigate]);
}
