import type { CSSProperties, ReactNode } from 'react';
import { EMAIL_COLORS as c, emailStyles } from './email-theme';

/**
 * Blocs réutilisables des e-mails (styles en ligne, mise en page par tableaux
 * pour un rendu fiable dans les messageries).
 */

/** Sur-titre vert (« Demande enregistrée »). */
export function EmailEyebrow({ children }: { children: ReactNode }) {
  return <p style={emailStyles.eyebrow}>{children}</p>;
}

/** Titre principal de l'e-mail. */
export function EmailTitle({ children, size = 'lg' }: { children: ReactNode; size?: 'lg' | 'md' }) {
  const style: CSSProperties =
    size === 'lg'
      ? emailStyles.title
      : { ...emailStyles.title, fontSize: 26, lineHeight: 1.2, margin: '0 0 12px' };
  return (
    <h1 className="lp-title" style={style}>
      {children}
    </h1>
  );
}

interface EmailButtonProps {
  href: string;
  children: ReactNode;
  /** « primary » : violet ; « dark » : encre (e-mails internes) ; « outline » : bordure */
  variant?: 'primary' | 'dark' | 'outline';
  shape?: 'pill' | 'rounded';
}

export function EmailButton({ href, children, variant = 'primary', shape = 'pill' }: EmailButtonProps) {
  const filled = variant !== 'outline';
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        background: variant === 'primary' ? c.brand : variant === 'dark' ? c.ink : 'transparent',
        color: filled ? c.white : c.ink,
        textDecoration: 'none',
        fontWeight: 600,
        padding: filled ? '14px 24px' : '13px 22px',
        borderRadius: shape === 'pill' ? 999 : 12,
        border: filled ? 'none' : `1px solid ${c.lineStrong}`,
        margin: '0 8px 10px 0',
      }}
    >
      {children}
    </a>
  );
}

/** Rangée de boutons. */
export function EmailActions({ children }: { children: ReactNode }) {
  return <div style={{ margin: '24px 0 0' }}>{children}</div>;
}

export interface EmailSummaryRow {
  label: string;
  value: ReactNode;
  /** Valeur en chasse fixe (référence) */
  mono?: boolean;
}

interface EmailSummaryProps {
  rows: EmailSummaryRow[];
  /** « split » : libellé à gauche, valeur à droite ; « grid » : colonne de libellés fixe */
  layout?: 'split' | 'grid';
}

/** Tableau récapitulatif « libellé / valeur ». */
export function EmailSummary({ rows, layout = 'split' }: EmailSummaryProps) {
  const split = layout === 'split';
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        border: `1px solid ${c.line}`,
        borderRadius: 14,
        borderCollapse: 'separate',
        borderSpacing: 0,
        overflow: 'hidden',
        margin: '28px 0 0',
        fontSize: split ? 15 : 14.5,
      }}
    >
      <tbody>
        {rows.map((row, index) => {
          const cell: CSSProperties = {
            padding: split ? '14px 18px' : '12px 16px',
            borderBottom: index < rows.length - 1 ? `1px solid ${c.line}` : 'none',
            background: index === 0 ? c.canvas : c.white,
            verticalAlign: 'top',
          };
          return (
            <tr key={row.label}>
              <td
                style={{
                  ...cell,
                  color: c.muted,
                  width: split ? undefined : 150,
                  whiteSpace: split ? 'nowrap' : undefined,
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  ...cell,
                  fontWeight: 600,
                  textAlign: split ? 'right' : 'left',
                  fontFamily: row.mono ? 'Consolas, monospace' : undefined,
                  letterSpacing: row.mono ? '.04em' : undefined,
                }}
              >
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Lien d'une valeur du récapitulatif (téléphone, e-mail). */
export function EmailValueLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} style={{ color: c.brand, fontWeight: 600, textDecoration: 'none' }}>
      {children}
    </a>
  );
}

/** Intertitre d'une section. */
export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{ margin: '32px 0 14px', fontSize: 18, fontWeight: 600, letterSpacing: '-.01em', color: c.ink }}
    >
      {children}
    </h2>
  );
}

/** Étapes numérotées (« Les prochaines étapes »). */
export function EmailSteps({ steps }: { steps: string[] }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ borderCollapse: 'collapse' }}
    >
      <tbody>
        {steps.map((step, index) => {
          const border = `1px solid ${c.line}`;
          const cell: CSSProperties = {
            padding: '12px 0',
            borderTop: border,
            borderBottom: index === steps.length - 1 ? border : 'none',
            verticalAlign: 'top',
          };
          return (
            <tr key={step}>
              <td style={{ ...cell, width: 42 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 28,
                    height: 28,
                    lineHeight: '28px',
                    textAlign: 'center',
                    borderRadius: 999,
                    background: c.brandSoft,
                    color: c.brandDark,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {index + 1}
                </span>
              </td>
              <td style={{ ...cell, color: c.text, paddingTop: 15 }}>{step}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Liste à puces simple (« Pour préparer notre échange »). */
export function EmailBullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <p key={item} style={{ margin: index === items.length - 1 ? 0 : '0 0 8px', color: c.text }}>
          • {item}
        </p>
      ))}
    </>
  );
}

/** Encadré d'information (rappel sur les données médicales, sécurité…). */
export function EmailNote({
  tone = 'gold',
  children,
}: {
  tone?: 'gold' | 'danger' | 'mist';
  children: ReactNode;
}) {
  const styles: Record<typeof tone, CSSProperties> = {
    gold: { background: c.goldWash, border: `1px solid ${c.goldLine}`, color: c.goldText, fontSize: 14 },
    danger: { background: c.dangerSoft, color: c.dangerText, fontSize: 14 },
    mist: { background: c.mist, color: c.text, fontSize: 13.5 },
  };
  return (
    <div style={{ margin: '26px 0 0', padding: '15px 18px', borderRadius: 12, ...styles[tone] }}>
      {children}
    </div>
  );
}

/** Mention « à valider » (information à confirmer par le propriétaire du site). */
export function EmailPending({ children }: { children: ReactNode }) {
  return <span style={emailStyles.pending}>{children}</span>;
}

/** Texte secondaire en petits caractères. */
export function EmailSmallPrint({ children, spacing = 20 }: { children: ReactNode; spacing?: number }) {
  return <p style={{ margin: `${spacing}px 0 0`, fontSize: 13.5, color: c.muted }}>{children}</p>;
}

/** Signature des e-mails adressés aux demandeurs. */
export function EmailSignature() {
  return (
    <p style={{ margin: '18px 0 0', color: c.ink, fontSize: 14.5 }}>
      À très bientôt,
      <br />
      <strong>L’équipe LASISTANT.PRO</strong>
    </p>
  );
}
