import { Fragment, type CSSProperties } from 'react';
import { fillTemplate } from '@/lib/text';
import { emailHref, emailInline, parseEmailBody } from './email-markup';
import { EmailButton } from './EmailParts';
import { EMAIL_COLORS as c, emailStyles } from './email-theme';

interface EmailBodyProps {
  /** Texte du modèle, variables non remplacées */
  source: string;
  values: Record<string, string>;
  siteUrl: string;
  /** Couleur du texte (texte courant par défaut) */
  color?: string;
  /** Style des boutons insérés dans le texte */
  buttonShape?: 'pill' | 'rounded';
}

/** Corps d'un e-mail : texte saisi dans le back-office, mis en forme avec des styles en ligne. */
export function EmailBody({ source, values, siteUrl, color = c.text, buttonShape = 'pill' }: EmailBodyProps) {
  const paragraph: CSSProperties = { ...emailStyles.paragraph, color };
  return (
    <>
      {parseEmailBody(source).map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} style={paragraph}>
                {block.lines.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 ? <br /> : null}
                    <EmailInline text={line} values={values} siteUrl={siteUrl} />
                  </Fragment>
                ))}
              </p>
            );
          case 'list':
            return (
              <ul key={index} style={{ ...paragraph, paddingLeft: 22 }}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ margin: '0 0 4px' }}>
                    <EmailInline text={item} values={values} siteUrl={siteUrl} />
                  </li>
                ))}
              </ul>
            );
          case 'button': {
            const href = emailHref(fillTemplate(block.href, values), siteUrl);
            return href ? (
              <p key={index} style={{ margin: '4px 0 18px' }}>
                <EmailButton href={href} shape={buttonShape}>
                  {fillTemplate(block.label, values)}
                </EmailButton>
              </p>
            ) : null;
          }
        }
      })}
    </>
  );
}

function EmailInline({
  text,
  values,
  siteUrl,
}: {
  text: string;
  values: Record<string, string>;
  siteUrl: string;
}) {
  return (
    <>
      {emailInline(text, values).map((token, index) => {
        switch (token.type) {
          case 'strong':
            return (
              <strong key={index} style={{ color: c.ink }}>
                {token.text}
              </strong>
            );
          case 'em':
            return <em key={index}>{token.text}</em>;
          case 'pending':
            return (
              <span key={index} style={emailStyles.pending}>
                {token.text}
              </span>
            );
          case 'link': {
            const href = emailHref(token.href, siteUrl);
            return href ? (
              <a key={index} href={href} style={{ color: c.brand, fontWeight: 600 }}>
                {token.label}
              </a>
            ) : (
              <Fragment key={index}>{token.label}</Fragment>
            );
          }
          default:
            return <Fragment key={index}>{token.text}</Fragment>;
        }
      })}
    </>
  );
}
