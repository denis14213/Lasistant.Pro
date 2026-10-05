import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import { IconArrowRight, IconWeightScope } from './icons';

/**
 * Lien éditorial violet, souligné au survol, avec flèche animée facultative.
 * <TextLink> pour la navigation interne, <TextAnchor> pour téléphone, e-mail ou site externe.
 */

const BASE =
  'group inline-flex w-fit items-center gap-2 border-b border-transparent leading-[1.3] font-semibold text-brand transition-colors hover:border-current [&_svg]:size-[1.1em] [&_svg]:shrink-0';

interface TextLinkContentProps {
  /** Icône placée avant le libellé (téléphone, e-mail…) */
  icon?: ReactNode;
  /** Affiche la flèche finale */
  arrow?: boolean;
  children: ReactNode;
}

function Content({ icon, arrow, children }: TextLinkContentProps) {
  return (
    <IconWeightScope weight="bold">
      {icon}
      <span>{children}</span>
      {arrow ? (
        <IconArrowRight
          className="transition-transform duration-200 group-hover:translate-x-[3px]"
          aria-hidden
        />
      ) : null}
    </IconWeightScope>
  );
}

type TextLinkProps = LinkProps & Omit<TextLinkContentProps, 'children'> & { children: ReactNode };

export function TextLink({ icon, arrow = false, className, children, ...props }: TextLinkProps) {
  return (
    <Link className={cn(BASE, className)} {...props}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </Link>
  );
}

type TextAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Omit<TextLinkContentProps, 'children'> & { children: ReactNode };

export function TextAnchor({ icon, arrow = false, className, children, ...props }: TextAnchorProps) {
  return (
    <a className={cn(BASE, className)} {...props}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </a>
  );
}
