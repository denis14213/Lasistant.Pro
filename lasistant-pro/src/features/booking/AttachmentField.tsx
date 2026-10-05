import { useId, useRef, useState, type DragEvent } from 'react';
import { IconBox, IconButton } from '@/components/ui';
import { FieldError } from '@/components/ui/form';
import { IconDelete, IconDocument, IconUpload } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { formatFileSize } from '@/lib/format';
import { ACCEPTED_EXTENSIONS, validateAttachment } from './attachment-rules';

interface AttachmentFieldProps {
  /** Nom du fichier retenu (seule information conservée en phase statique) */
  value: string;
  onChange: (fileName: string) => void;
  hint: string;
}

/**
 * Pièce jointe facultative : glisser-déposer ou parcourir.
 * Phase statique : seul le nom du fichier est enregistré. Phase 2 : envoi vers un
 * stockage privé, jamais public (les documents sensibles ne sont pas exposés).
 */
export function AttachmentField({ value, onChange, hint }: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const hintId = useId();
  const errorId = useId();
  const [details, setDetails] = useState<{ size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (file: File | undefined) => {
    if (!file) return;
    const problem = validateAttachment(file);
    if (problem) {
      setError(`${file.name} : ${problem}`);
      return;
    }
    setError(null);
    setDetails({ size: file.size });
    onChange(file.name);
  };

  const remove = () => {
    onChange('');
    setDetails(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-[14.5px] leading-snug font-semibold">
        Document <span className="font-normal text-muted">(facultatif)</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => accept(event.target.files?.[0])}
      />
      {value ? (
        <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-line bg-white px-3.5 py-3">
          <IconBox tone="success" size="xs">
            <IconDocument />
          </IconBox>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{value}</p>
            <p className="text-[13px] text-success">
              {details ? `${formatFileSize(details.size)} · ` : ''}ajouté
            </p>
          </div>
          <IconButton label={`Retirer le fichier ${value}`} size="sm" variant="ghost" onClick={remove}>
            <IconDelete aria-hidden />
          </IconButton>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex items-center gap-4.5 rounded-box border-[1.5px] border-dashed border-line-strong bg-canvas p-5.5 transition-colors',
            dragging && 'border-brand bg-brand-wash',
          )}
        >
          <IconBox size="sm" className="size-12">
            <IconUpload />
          </IconBox>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">
              Glissez un fichier ici ou{' '}
              <button
                type="button"
                aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
                onClick={() => inputRef.current?.click()}
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                parcourez
              </button>
            </p>
            <p id={hintId} className="text-[13.5px] leading-[1.45] text-muted">
              {hint}
            </p>
          </div>
        </div>
      )}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
