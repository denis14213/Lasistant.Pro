import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Callout, ToValidate } from '@/components/ui';
import { cn } from '@/lib/cn';
import { isSafeHref, tokenizeInline, type MarkdownBlock } from '@/lib/markdown';

/**
 * Rendu React du Markdown simplifié (voir `lib/markdown.ts`).
 * Uniquement des éléments React : aucun HTML saisi n'est interprété.
 */

function InlineLink({ label, href }: { label: string; href: string }) {
  if (!isSafeHref(href)) return <>{label}</>;
  if (href.startsWith('/')) return <Link to={href}>{label}</Link>;
  const external = /^https?:\/\//i.test(href);
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {label}
      {external ? <span className="sr-only"> (nouvelle fenêtre)</span> : null}
    </a>
  );
}

/** Texte comportant des mises en forme en ligne (gras, italique, liens, mentions à valider). */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((token, index) => {
        switch (token.type) {
          case 'strong':
            return <strong key={index}>{token.text}</strong>;
          case 'em':
            return <em key={index}>{token.text}</em>;
          case 'pending':
            return <ToValidate key={index}>{token.text}</ToValidate>;
          case 'link':
            return <InlineLink key={index} label={token.label} href={token.href} />;
          default:
            return <Fragment key={index}>{token.text}</Fragment>;
        }
      })}
    </>
  );
}

interface MarkdownContentProps {
  blocks: MarkdownBlock[];
  /** Contenu du bloc « ::cta » (appel à l'action propre à la page) */
  renderCta?: () => ReactNode;
  className?: string;
}

/** Corps d'un contenu éditorial, mis en forme par la classe « prose-lp ». */
export function MarkdownContent({ blocks, renderCta, className }: MarkdownContentProps) {
  return (
    <div className={cn('prose-lp', className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'lede':
            return (
              <p key={index} className="lede">
                <InlineText text={block.text} />
              </p>
            );
          case 'heading': {
            const Heading = block.level === 2 ? 'h2' : 'h3';
            return (
              <Heading key={block.id} id={block.id}>
                <InlineText text={block.text} />
              </Heading>
            );
          }
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return (
              <List key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineText text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case 'callout':
            return (
              <Callout
                key={index}
                tone="privacy"
                title={block.title ?? undefined}
                className="mt-[1.6em]! text-base"
              >
                <p>
                  <InlineText text={block.text} />
                </p>
              </Callout>
            );
          case 'cta':
            return renderCta ? <Fragment key={index}>{renderCta()}</Fragment> : null;
          default:
            return (
              <p key={index}>
                <InlineText text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
