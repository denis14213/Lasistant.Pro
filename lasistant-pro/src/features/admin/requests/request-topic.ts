import { SOURCE_LABELS } from '@/content/labels';
import type { Booking, Service } from '@/types';

/** Libellé du service ou du type de demande (« Assistance médicale », « Message de contact »…). */
export function requestTopic(booking: Booking, services: Service[]): string {
  const service = services.find((item) => item.id === booking.serviceId);
  if (service) return service.title;
  return booking.subject ?? SOURCE_LABELS[booking.source];
}
