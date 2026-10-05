import { emailDefinition, emailEnvelope } from './registry';
import type { EmailContent, EmailContext } from './types';

interface EmailDocumentProps {
  content: EmailContent;
  values: Record<string, string>;
  context: EmailContext;
  /** Affiche l'expéditeur, le destinataire et l'objet au-dessus de l'e-mail (aperçu) */
  withEnvelope?: boolean;
}

/** E-mail complet correspondant à un modèle (gabarit choisi dans le registre). */
export function EmailDocument({ content, values, context, withEnvelope = false }: EmailDocumentProps) {
  const { Component } = emailDefinition(content.key);
  return (
    <Component
      envelope={withEnvelope ? emailEnvelope(content, values, context) : undefined}
      content={content}
      values={values}
      context={context}
    />
  );
}
