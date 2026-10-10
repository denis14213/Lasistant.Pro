import { useId, useState } from 'react';
import { Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { Button, IconButton } from '@/components/ui';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { iconRegistry } from '@/components/ui/icon-registry';
import { IconAdd, IconChevronDown, IconDelete } from '@/components/ui/icons';
import { IconMoveDown, IconMoveUp } from '@/components/ui/icons-admin';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/text';
import {
  BLOCK_TYPE_LABELS,
  blankLike,
  fieldKind,
  fieldLabel,
  isFixedList,
  itemTitle,
  TONE_LABELS,
  TONES,
  type ContentPath,
} from './content-fields';
import { ImagePickerField } from './ImagePickerField';

const ICON_NAMES = Object.keys(iconRegistry);

/** Documents légaux : mise en forme légère acceptée dans les paragraphes. */
const LEGAL_PAGES = new Set(['mentions-legales', 'confidentialite']);
const LEGAL_FORMAT_HINT =
  'Mise en forme : **gras**, [lien](https://…), [[à valider]] pour une mention en doré.';

interface NodeProps {
  pageKey: string;
  path: ContentPath;
  name: string | number;
  parentName?: string | number;
  value: unknown;
  onChange: (path: ContentPath, value: unknown) => void;
}

/**
 * Formulaire d'une page, déduit de sa structure : une carte par rubrique de premier niveau
 * (en-tête, sections…), puis des champs, groupes et listes imbriqués.
 */
export function ContentEditor({
  pageKey,
  value,
  onChange,
}: {
  pageKey: string;
  value: Record<string, unknown>;
  onChange: (path: ContentPath, value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {Object.entries(value).map(([key, section]) => {
        if (fieldKind(key, section) === 'hidden') return null;
        const titleId = `rubrique-${key}`;
        return (
          <div key={key} id={`section-${key}`} className="scroll-mt-24">
            <Panel labelledBy={titleId}>
              <PanelHeader titleId={titleId} title={fieldLabel(key)} />
              <PanelBody>
                <ContentNode
                  pageKey={pageKey}
                  path={[key]}
                  name={key}
                  value={section}
                  onChange={onChange}
                  bare
                />
              </PanelBody>
            </Panel>
          </div>
        );
      })}
    </div>
  );
}

function ContentNode({ bare = false, ...props }: NodeProps & { bare?: boolean }) {
  const { pageKey, path, name, parentName, value, onChange } = props;
  const kind = fieldKind(name, value, parentName);
  const label = fieldLabel(name, parentName);

  switch (kind) {
    case 'hidden':
      return null;
    case 'readonly':
      return (
        <p className="text-[13.5px] text-muted">
          {label} :{' '}
          <strong className="font-semibold text-ink">
            {BLOCK_TYPE_LABELS[String(value)] ?? String(value)}
          </strong>
        </p>
      );
    case 'object': {
      const entries = Object.entries(value as Record<string, unknown>);
      const fields = (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {entries.map(([key, child]) => {
            const childKind = fieldKind(key, child, name);
            const wide = !['text', 'number', 'boolean', 'icon', 'tone'].includes(childKind);
            return (
              <div key={key} className={cn(wide && 'md:col-span-2')}>
                <ContentNode
                  pageKey={pageKey}
                  path={[...path, key]}
                  name={key}
                  parentName={name}
                  value={child}
                  onChange={onChange}
                />
              </div>
            );
          })}
        </div>
      );
      if (bare) return fields;
      return (
        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-1.5 text-[13.5px] font-semibold">{label}</legend>
          {fields}
        </fieldset>
      );
    }
    case 'accent': {
      const title = value as { start: string; accent: string; end?: string };
      return (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13.5px] font-semibold">{label}</legend>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(['start', 'accent', 'end'] as const)
              .filter((part) => part !== 'end' || title.end !== undefined)
              .map((part) => (
                <Field key={part} label={fieldLabel(part)} density="compact">
                  <Input
                    density="compact"
                    value={title[part] ?? ''}
                    onChange={(event) => onChange([...path, part], event.target.value)}
                    className={part === 'accent' ? 'italic' : undefined}
                  />
                </Field>
              ))}
          </div>
        </fieldset>
      );
    }
    case 'list':
      return <ListField {...props} label={label} bare={bare} />;
    case 'image':
      return (
        <ImagePickerField label={label} value={String(value)} onChange={(next) => onChange(path, next)} />
      );
    case 'icon':
      return (
        <Field label={label} density="compact">
          <Select
            density="compact"
            value={String(value)}
            onChange={(event) => onChange(path, event.target.value)}
          >
            {ICON_NAMES.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </Select>
        </Field>
      );
    case 'tone':
      return (
        <Field label={label} density="compact">
          <Select
            density="compact"
            value={String(value)}
            onChange={(event) => onChange(path, event.target.value)}
          >
            {TONES.map((tone) => (
              <option key={tone} value={tone}>
                {TONE_LABELS[tone]}
              </option>
            ))}
          </Select>
        </Field>
      );
    case 'boolean':
      return (
        <Checkbox
          size="sm"
          label={label}
          checked={Boolean(value)}
          onChange={(event) => onChange(path, event.target.checked)}
        />
      );
    case 'number':
      return (
        <Field label={label} density="compact">
          <Input
            density="compact"
            type="number"
            min={1}
            value={Number(value)}
            onChange={(event) => onChange(path, Number(event.target.value) || 1)}
          />
        </Field>
      );
    case 'textarea':
      return (
        <Field
          label={label}
          density="compact"
          hint={LEGAL_PAGES.has(pageKey) ? LEGAL_FORMAT_HINT : undefined}
        >
          <Textarea
            density="compact"
            rows={String(value ?? '').length > 280 ? 6 : 3}
            value={String(value ?? '')}
            onChange={(event) => onChange(path, event.target.value)}
          />
        </Field>
      );
    default:
      return (
        <Field
          label={label}
          density="compact"
          hint={
            name === 'to'
              ? 'Adresse d’une page du site, par exemple /reservation'
              : value === null
                ? 'À compléter'
                : undefined
          }
        >
          <Input
            density="compact"
            value={String(value ?? '')}
            // Un texte « à compléter » (null) vidé redevient « à compléter ».
            onChange={(event) =>
              onChange(path, event.target.value === '' && value === null ? null : event.target.value)
            }
          />
        </Field>
      );
  }
}

/** Liste d'éléments : ajout, retrait, réordonnancement, éléments repliables. */
function ListField({ label, bare, ...props }: NodeProps & { label: string; bare?: boolean }) {
  const { pageKey, path, name, value, onChange } = props;
  const items = value as unknown[];
  const fixed = isFixedList(pageKey, path);
  const listId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const template = items[items.length - 1];
  const simple = items.every((item) => typeof item === 'string');

  const move = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(path, next);
    setOpenIndex(to);
  };
  const remove = (index: number) => {
    onChange(
      path,
      items.filter((_, position) => position !== index),
    );
    setOpenIndex(null);
  };
  const add = () => {
    onChange(path, [...items, template === undefined ? '' : blankLike(template)]);
    setOpenIndex(items.length);
  };

  const controls = (index: number) =>
    fixed ? null : (
      <div className="flex shrink-0 gap-1">
        <IconButton
          label="Monter"
          size="sm"
          variant="ghost"
          disabled={index === 0}
          onClick={() => move(index, index - 1)}
        >
          <IconMoveUp aria-hidden />
        </IconButton>
        <IconButton
          label="Descendre"
          size="sm"
          variant="ghost"
          disabled={index === items.length - 1}
          onClick={() => move(index, index + 1)}
        >
          <IconMoveDown aria-hidden />
        </IconButton>
        <IconButton
          label="Retirer"
          size="sm"
          variant="ghost"
          className="text-danger"
          onClick={() => remove(index)}
        >
          <IconDelete aria-hidden />
        </IconButton>
      </div>
    );

  return (
    <div className="flex flex-col gap-3" role="group" aria-labelledby={`${listId}-titre`}>
      <div className="flex items-center justify-between gap-3">
        <span id={`${listId}-titre`} className={cn('text-[13.5px] font-semibold', bare && 'sr-only')}>
          {label}
        </span>
        <span className="text-[13px] text-muted">{pluralize(items.length, 'élément')}</span>
      </div>

      {simple ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <Input
                density="compact"
                aria-label={`${label} ${index + 1}`}
                value={String(item)}
                onChange={(event) => onChange([...path, index], event.target.value)}
              />
              {controls(index)}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item, index) => {
            const expanded = openIndex === index;
            return (
              <li key={index} className="rounded-xl border border-line bg-white">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenIndex(expanded ? null : index)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left text-[14.5px] font-semibold"
                  >
                    <IconChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted transition-transform',
                        expanded && 'rotate-180',
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{itemTitle(item, index)}</span>
                  </button>
                  {controls(index)}
                </div>
                {expanded ? (
                  <div className="border-t border-line p-4">
                    <ContentNode
                      pageKey={pageKey}
                      path={[...path, index]}
                      name={index}
                      parentName={name}
                      value={item}
                      onChange={onChange}
                      bare
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {fixed ? null : (
        <Button
          variant="outline"
          size="sm"
          shape="rounded"
          icon={<IconAdd />}
          className="w-fit"
          onClick={add}
        >
          Ajouter un élément
        </Button>
      )}
    </div>
  );
}
