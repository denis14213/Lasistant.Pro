import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getErrorMessage, queryKeys, servicesQuery, servicesRepository } from '@/api';
import { prefetch } from '@/app/prefetch';
import { AdminPage, AdminPageHeader, Panel, PanelFooter, PanelHeader } from '@/components/admin/AdminPage';
import { Seo } from '@/components/seo/Seo';
import { Badge, Button, ButtonAnchor, Dialog, IconButton, ResponsiveImage } from '@/components/ui';
import { Field, Input, Switch } from '@/components/ui/form';
import { IconAdd } from '@/components/ui/icons';
import { IconMoveDown, IconMoveUp, IconPreview } from '@/components/ui/icons-admin';
import { ROUTES, servicePath } from '@/config/routes';
import { ServiceEditor } from '@/features/admin/services/ServiceEditor';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { cn } from '@/lib/cn';
import type { Service } from '@/types';

export const loader = () => prefetch(servicesQuery(true));

/** Gestion des services affichés sur le site (cahier des charges § 8.5). */
export function Component() {
  const session = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const [selectedId, setSelectedId] = useState(services[0]?.id ?? '');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const selected = services.find((service) => service.id === selectedId) ?? services[0];
  const hidden = services.filter((service) => !service.active).length;

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.services });
  const onError = (error: Error) => toast.error(getErrorMessage(error));

  const move = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      servicesRepository.move(id, direction),
    onSuccess: refresh,
    onError,
  });
  const toggle = useMutation({
    mutationFn: (service: Service) =>
      servicesRepository.update(service.id, { active: !service.active }, session.name),
    onSuccess: (service) => {
      toast.success(
        service.active
          ? `« ${service.title} » est de nouveau visible.`
          : `« ${service.title} » est masqué du site.`,
      );
      return refresh();
    },
    onError,
  });
  const create = useMutation({
    mutationFn: (title: string) => servicesRepository.create(title, session.name),
    onSuccess: async (service) => {
      toast.success('Service créé. Complétez sa description puis activez-le.');
      setCreating(false);
      setNewTitle('');
      await refresh();
      setSelectedId(service.id);
    },
    onError,
  });

  return (
    <AdminPage>
      <Seo title="Services" description="Gestion des services." noIndex />
      <AdminPageHeader
        title="Services"
        description="Créez, modifiez, réordonnez et masquez les services affichés sur le site."
        actions={
          <>
            <ButtonAnchor
              href={ROUTES.services}
              target="_blank"
              rel="noopener"
              variant="outline"
              shape="rounded"
              icon={<IconPreview />}
            >
              Voir la page<span className="sr-only"> (nouvel onglet)</span>
            </ButtonAnchor>
            <Button shape="rounded" icon={<IconAdd />} onClick={() => setCreating(true)}>
              Nouveau service
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel labelledBy="liste-services">
          <PanelHeader
            titleId="liste-services"
            title="Services"
            description="Les flèches modifient l’ordre d’affichage sur le site."
          />
          <ul>
            {services.map((service, index) => {
              const isSelected = service.id === selected?.id;
              return (
                <li
                  key={service.id}
                  className={cn(
                    'flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0',
                    isSelected && 'bg-brand-wash',
                  )}
                >
                  <div className="flex flex-col">
                    <IconButton
                      label={`Monter « ${service.title} »`}
                      variant="ghost"
                      size="sm"
                      className="size-6"
                      disabled={index === 0 || move.isPending}
                      onClick={() => move.mutate({ id: service.id, direction: 'up' })}
                    >
                      <IconMoveUp aria-hidden />
                    </IconButton>
                    <IconButton
                      label={`Descendre « ${service.title} »`}
                      variant="ghost"
                      size="sm"
                      className="size-6"
                      disabled={index === services.length - 1 || move.isPending}
                      onClick={() => move.mutate({ id: service.id, direction: 'down' })}
                    >
                      <IconMoveDown aria-hidden />
                    </IconButton>
                  </div>
                  <ResponsiveImage
                    image={service.image}
                    alt=""
                    sizes="64px"
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(service.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <strong className="block truncate font-semibold hover:text-brand">{service.title}</strong>
                    <span className="block truncate font-mono text-[12.5px] text-muted">
                      {service.kind === 'page'
                        ? servicePath(service.slug)
                        : 'Réservation uniquement · masqué du menu'}
                    </span>
                  </button>
                  {service.active ? null : <Badge tone="neutral">Masqué</Badge>}
                  <span className="text-[13px] whitespace-nowrap text-muted">Ordre {index + 1}</span>
                  <Switch
                    checked={service.active}
                    disabled={toggle.isPending}
                    onCheckedChange={() => toggle.mutate(service)}
                    label={`${service.title} : ${service.active ? 'visible' : 'masqué'}`}
                  />
                </li>
              );
            })}
          </ul>
          <PanelFooter>
            <span>Services masqués : {hidden}</span>
          </PanelFooter>
        </Panel>

        {selected ? (
          <Panel labelledBy="edition-service">
            <ServiceEditor key={`${selected.id}-${selected.updatedAt}`} service={selected} />
          </Panel>
        ) : null}
      </div>

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        size="sm"
        title="Nouveau service"
        description="Le service est créé masqué et proposé dans la réservation en ligne une fois activé."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button
              shape="rounded"
              icon={<IconAdd />}
              disabled={newTitle.trim().length < 3}
              loading={create.isPending}
              onClick={() => create.mutate(newTitle)}
            >
              Créer le service
            </Button>
          </>
        }
      >
        <Field label="Nom du service" id="nouveau-service" density="compact">
          <Input
            density="compact"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Ex. : Accueil à l’aéroport"
          />
        </Field>
      </Dialog>
    </AdminPage>
  );
}
