import { IconArticles, IconCalendar, IconEmail, IconServices, type AppIcon } from '@/components/ui/icons';
import { IconDashboard, IconIdentity, IconImages, IconInbox, IconUsers } from '@/components/ui/icons-admin';
import type { AdminIconName } from '@/types';

/**
 * Icônes de la navigation du back-office. Séparées du registre des contenus : elles ne sont
 * chargées qu'avec le back-office, jamais sur le site public.
 */
export const adminNavIcons: Record<AdminIconName, AppIcon> = {
  dashboard: IconDashboard,
  inbox: IconInbox,
  calendar: IconCalendar,
  services: IconServices,
  articles: IconArticles,
  images: IconImages,
  identity: IconIdentity,
  users: IconUsers,
  email: IconEmail,
};
