import { IconAnchor, IconButton } from '@/components/ui';
import { IconEmail, IconFacebook, IconHyperlink, IconWeightScope, IconWhatsApp } from '@/components/ui/icons';
import { useToast } from '@/features/toasts/toast-context';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

/** Pictogrammes plus petits que dans les autres boutons ronds (dessin « bold » à cette taille). */
const ICON_SIZE = '[&_svg]:size-4';

interface ShareButtonsProps {
  url: string;
  title: string;
}

/**
 * Partage d'un article par de simples liens : aucun script tiers n'est chargé,
 * donc aucun cookie n'est déposé tant que le visiteur ne clique pas.
 */
export function ShareButtons({ url, title }: ShareButtonsProps) {
  const copy = useCopyToClipboard();
  const toast = useToast();
  const encodedUrl = encodeURIComponent(url);

  const copyLink = async () => {
    if (await copy(url)) toast.success('Lien de l’article copié.');
    else
      toast.error('Impossible de copier le lien.', {
        action: { label: 'Réessayer', onClick: () => void copyLink() },
      });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconWeightScope weight="bold">
        <span className="mr-1 text-[13px] font-semibold text-muted">Partager</span>
        <IconAnchor
          className={ICON_SIZE}
          label="Partager sur Facebook (nouvelle fenêtre)"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconFacebook />
        </IconAnchor>
        <IconAnchor
          className={ICON_SIZE}
          label="Partager sur WhatsApp (nouvelle fenêtre)"
          href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconWhatsApp />
        </IconAnchor>
        <IconAnchor
          className={ICON_SIZE}
          label="Partager par e-mail"
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodedUrl}`}
        >
          <IconEmail aria-hidden />
        </IconAnchor>
        <IconButton className={ICON_SIZE} label="Copier le lien" onClick={() => void copyLink()}>
          <IconHyperlink aria-hidden />
        </IconButton>
      </IconWeightScope>
    </div>
  );
}
