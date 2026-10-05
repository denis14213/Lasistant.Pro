import { useId } from 'react';
import { ToolButton, ToolSeparator } from '@/components/admin/EditorToolbar';
import { useFieldContext } from '@/components/ui/form';
import { IconHyperlink } from '@/components/ui/icons';
import { IconBold, IconBulletList, IconButtonInsert, IconItalic } from '@/components/ui/icons-admin';
import { useTextareaEditing } from '@/hooks/useTextareaEditing';
import { cn } from '@/lib/cn';

interface EmailBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Variables proposées (« prénom », « référence »…) */
  variables: readonly string[];
}

/**
 * Corps d'un modèle d'e-mail : barre de mise en forme légère, champ de saisie
 * et variables insérées à l'emplacement du curseur. Placé dans un <Field>, il en reprend
 * l'identifiant, l'état d'erreur et les descriptions.
 */
export function EmailBodyEditor({ value, onChange, variables }: EmailBodyEditorProps) {
  const field = useFieldContext();
  const autoId = useId();
  const id = field?.id ?? `message-${autoId.replace(/:/g, '')}`;
  const invalid = field?.invalid ?? false;
  const { ref, replaceSelection, wrap, prefixLines, insertBlock } = useTextareaEditing(value, onChange);
  const hintId = `${id}-variables-aide`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div
          role="toolbar"
          aria-label="Mise en forme"
          aria-controls={id}
          className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-line-strong bg-smoke p-1.5"
        >
          <ToolButton label="Gras" onClick={() => wrap('**', '**', 'texte en gras')}>
            <IconBold />
          </ToolButton>
          <ToolButton label="Italique" onClick={() => wrap('_', '_', 'texte en italique')}>
            <IconItalic />
          </ToolButton>
          <ToolButton label="Lien" onClick={() => wrap('[', '](https://lasistant.pro)', 'libellé du lien')}>
            <IconHyperlink />
          </ToolButton>
          <ToolButton label="Liste" onClick={() => prefixLines(() => '- ')}>
            <IconBulletList />
          </ToolButton>
          <ToolSeparator />
          <ToolButton
            label="Insérer un bouton"
            onClick={() => insertBlock('::bouton [Visiter le site](https://lasistant.pro)')}
          >
            <IconButtonInsert />
          </ToolButton>
        </div>
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={9}
          spellCheck
          aria-invalid={invalid || undefined}
          aria-describedby={field?.describedBy}
          className={cn(
            'block min-h-[220px] w-full resize-y rounded-b-xl border border-line-strong bg-white px-4 py-3.5 text-base leading-[1.6] text-ink outline-none focus:border-brand focus:shadow-focus md:text-[15px]',
            invalid && 'border-danger shadow-invalid',
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-ink" id={`${id}-variables`}>
          Variables disponibles
        </p>
        <div
          role="group"
          aria-labelledby={`${id}-variables`}
          aria-describedby={hintId}
          className="flex flex-wrap gap-1.5"
        >
          {variables.map((variable) => (
            <button
              key={variable}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => replaceSelection(`[${variable}]`)}
              aria-label={`Insérer la variable ${variable}`}
              className="inline-flex min-h-[34px] items-center rounded-full border border-line bg-white px-3.5 text-sm font-medium text-ink-soft transition-colors hover:border-brand-line hover:bg-brand-wash hover:text-brand-dark"
            >
              [{variable}]
            </button>
          ))}
        </div>
        <p id={hintId} className="text-[13px] text-muted">
          Cliquez sur une variable pour l’insérer à l’emplacement du curseur.
        </p>
      </div>
    </div>
  );
}
