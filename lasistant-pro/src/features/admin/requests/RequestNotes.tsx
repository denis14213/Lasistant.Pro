import { useId, useState } from 'react';
import { Avatar } from '@/components/admin/Avatar';
import { Button, Callout } from '@/components/ui';
import { Textarea } from '@/components/ui/form';
import { IconWarning } from '@/components/ui/icons';
import { formatDateTime } from '@/lib/format';
import type { InternalNote } from '@/types';

interface RequestNotesProps {
  notes: InternalNote[];
  onAdd: (text: string, done: () => void) => void;
  saving: boolean;
  canWrite: boolean;
}

/** Notes internes d'une demande (jamais visibles par le demandeur). */
export function RequestNotes({ notes, onAdd, saving, canWrite }: RequestNotesProps) {
  const [text, setText] = useState('');
  const fieldId = useId();
  return (
    <div className="flex flex-col gap-4">
      {notes.length === 0 ? <p className="text-[13.5px] text-muted">Aucune note pour le moment.</p> : null}
      {notes.map((note) => (
        <div key={note.id} className="flex items-start gap-2.5">
          <Avatar name={note.author} size="sm" tone="neutral" />
          <div className="flex-1 rounded-xl bg-smoke px-3.5 py-3">
            <p className="text-[14.5px] whitespace-pre-line">{note.text}</p>
            <p className="mt-1 text-[12.5px] text-muted">
              {note.author} · {formatDateTime(note.createdAt)}
            </p>
          </div>
        </div>
      ))}
      {canWrite ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) onAdd(text, () => setText(''));
          }}
        >
          <label htmlFor={fieldId} className="sr-only">
            Ajouter une note
          </label>
          <Textarea
            id={fieldId}
            density="compact"
            rows={3}
            value={text}
            maxLength={1000}
            onChange={(event) => setText(event.target.value)}
            placeholder="Ajouter une note…"
          />
          <Callout tone="warning" size="sm" icon={<IconWarning />}>
            Ne consignez pas d’informations médicales détaillées dans les notes.
          </Callout>
          <Button
            type="submit"
            variant="dark"
            size="sm"
            shape="rounded"
            className="w-fit"
            loading={saving}
            disabled={!text.trim()}
          >
            Ajouter la note
          </Button>
        </form>
      ) : null}
    </div>
  );
}
