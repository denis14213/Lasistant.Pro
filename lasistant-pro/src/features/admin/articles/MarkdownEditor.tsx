import { useMemo, useState } from 'react';
import { ToolButton, ToolSeparator } from '@/components/admin/EditorToolbar';
import { MarkdownContent } from '@/components/content/RichText';
import { ChoiceGroup } from '@/components/ui/form';
import { IconHyperlink, IconInfo } from '@/components/ui/icons';
import {
  IconBold,
  IconBulletList,
  IconButtonInsert,
  IconHeading2,
  IconHeading3,
  IconItalic,
  IconLede,
  IconNumberedList,
  IconParagraph,
  IconQuote,
  IconRedo,
  IconUndo,
} from '@/components/ui/icons-admin';
import { useTextareaEditing } from '@/hooks/useTextareaEditing';
import { cn } from '@/lib/cn';
import { parseMarkdown } from '@/lib/markdown';

interface MarkdownEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  label: string;
}

type Mode = 'rediger' | 'apercu';

/**
 * Éditeur du contenu des articles : barre d'outils de mise en forme (Markdown simplifié)
 * et aperçu fidèle au rendu du site. Les insertions passent par l'historique natif du champ :
 * « Annuler » et « Rétablir » (Ctrl Z / Ctrl Y) fonctionnent normalement.
 */
export function MarkdownEditor({
  id,
  value,
  onChange,
  invalid = false,
  describedBy,
  label,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>('rediger');
  const blocks = useMemo(() => (mode === 'apercu' ? parseMarkdown(value) : []), [mode, value]);
  const {
    ref: textareaRef,
    wrap,
    prefixLines,
    insertBlock,
    history: run,
  } = useTextareaEditing(value, onChange);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border border-b-0 border-line-strong bg-smoke p-1.5">
        <div
          role="toolbar"
          aria-label="Mise en forme"
          aria-controls={id}
          className={cn(
            'flex flex-wrap items-center gap-0.5',
            mode === 'apercu' && 'pointer-events-none opacity-40',
          )}
        >
          <ToolButton label="Annuler" onClick={() => run('undo')}>
            <IconUndo />
          </ToolButton>
          <ToolButton label="Rétablir" onClick={() => run('redo')}>
            <IconRedo />
          </ToolButton>
          <ToolSeparator />
          <ToolButton label="Titre de niveau 2" onClick={() => prefixLines(() => '## ')}>
            <IconHeading2 />
          </ToolButton>
          <ToolButton label="Titre de niveau 3" onClick={() => prefixLines(() => '### ')}>
            <IconHeading3 />
          </ToolButton>
          <ToolButton label="Paragraphe" onClick={() => prefixLines(() => '')}>
            <IconParagraph />
          </ToolButton>
          <ToolButton label="Chapô (introduction)" onClick={() => prefixLines(() => '::lede ')}>
            <IconLede />
          </ToolButton>
          <ToolSeparator />
          <ToolButton label="Gras" onClick={() => wrap('**', '**', 'texte en gras')}>
            <IconBold />
          </ToolButton>
          <ToolButton label="Italique" onClick={() => wrap('_', '_', 'texte en italique')}>
            <IconItalic />
          </ToolButton>
          <ToolButton label="Lien" onClick={() => wrap('[', '](/contact)', 'libellé du lien')}>
            <IconHyperlink />
          </ToolButton>
          <ToolSeparator />
          <ToolButton label="Liste à puces" onClick={() => prefixLines(() => '- ')}>
            <IconBulletList />
          </ToolButton>
          <ToolButton label="Liste numérotée" onClick={() => prefixLines((index) => `${index + 1}. `)}>
            <IconNumberedList />
          </ToolButton>
          <ToolButton label="Citation" onClick={() => prefixLines(() => '> ')}>
            <IconQuote />
          </ToolButton>
          <ToolSeparator />
          <ToolButton
            label="Insérer un encadré « Bon à savoir »"
            onClick={() => insertBlock('> **Bon à savoir** Votre texte.')}
          >
            <IconInfo />
          </ToolButton>
          <ToolButton label="Insérer le bouton d’appel à l’action" onClick={() => insertBlock('::cta')}>
            <IconButtonInsert />
          </ToolButton>
          <ToolButton
            label="Signaler une information à valider"
            onClick={() => wrap('[[', ']]', 'information à valider')}
          >
            <span className="text-[13px] font-bold">[[ ]]</span>
          </ToolButton>
        </div>
        <ChoiceGroup<Mode>
          name={`${id}-mode`}
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'rediger', label: 'Rédiger' },
            { value: 'apercu', label: 'Aperçu' },
          ]}
        />
      </div>
      {mode === 'rediger' ? (
        <textarea
          ref={textareaRef}
          id={id}
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={22}
          spellCheck
          className={cn(
            'block min-h-[420px] w-full resize-y rounded-b-xl border border-line-strong bg-white px-5 py-5 font-mono text-base leading-[1.7] text-ink outline-none focus:border-brand focus:shadow-focus md:px-8 md:text-[14.5px]',
            invalid && 'border-danger shadow-invalid',
          )}
        />
      ) : (
        <div className="min-h-[420px] rounded-b-xl border border-line-strong bg-white px-5 py-7 md:px-11 md:py-9">
          <MarkdownContent
            blocks={blocks}
            className="prose-compact max-w-none"
            renderCta={() => (
              <p className="rounded-xl border border-dashed border-brand-line bg-brand-wash px-4 py-3 text-sm font-semibold text-brand-dark">
                Bloc d’appel à l’action « Demander un accompagnement »
              </p>
            )}
          />
        </div>
      )}
    </div>
  );
}
