import type { ReactNode } from 'react';
import { phoneHref } from '@/lib/format';
import { EMAIL_COLORS as c, EMAIL_FONT } from './email-theme';

/**
 * Gabarit des e-mails : carte blanche de 600 px, en-tête de marque ou d'équipe,
 * contenu et pied de page. Styles en ligne et tableaux de mise en page : rendu fiable
 * dans les messageries courantes. Les classes « lp-* » ne servent qu'à l'adaptation
 * mobile (voir `render.ts`), ignorée sans dommage par les messageries qui ne la gèrent pas.
 */

export interface EmailEnvelope {
  from: string;
  to: string;
  subject: string;
}

interface EmailLayoutProps {
  /** Expéditeur, destinataire et objet, affichés au-dessus de la carte (aperçu uniquement) */
  envelope?: EmailEnvelope;
  /** « brand » : e-mail aux couleurs du site ; « team » : bandeau prune du back-office */
  variant: 'brand' | 'team';
  /** Pastille du bandeau « équipe » (« Nouvelle demande ») */
  badge?: string;
  /** Adresse publique du site (logo, liens) */
  siteUrl: string;
  children: ReactNode;
  footer: ReactNode;
}

export function EmailLayout({ envelope, variant, badge, siteUrl, children, footer }: EmailLayoutProps) {
  const logo = `${siteUrl}/icon-192.png`;
  const gutter = variant === 'brand' ? 40 : 36;
  return (
    <div
      className="lp-envelope"
      style={{
        fontFamily: EMAIL_FONT,
        color: c.ink,
        background: c.envelope,
        padding: '40px 0',
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {envelope ? (
        <div
          className="lp-pad"
          style={{ maxWidth: 600, margin: '0 auto 16px', padding: '0 16px', fontSize: 13, color: c.muted }}
        >
          <p style={{ margin: 0 }}>
            <strong style={{ color: c.ink }}>De :</strong> {envelope.from}
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: c.ink }}>À :</strong> {envelope.to}
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: c.ink }}>Objet :</strong> {envelope.subject}
          </p>
        </div>
      ) : null}
      <div
        className="lp-card"
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: c.white,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 20px 40px -24px rgba(42,15,56,.35)',
        }}
      >
        {variant === 'brand' ? (
          <>
            <div
              style={{
                height: 6,
                background: `linear-gradient(90deg, ${c.brand}, ${c.brandBright} 70%, ${c.successBright})`,
              }}
            />
            <div
              className="lp-pad"
              style={{ padding: `28px ${gutter}px`, borderBottom: `1px solid ${c.line}` }}
            >
              <img
                src={logo}
                alt="LASISTANT.PRO"
                width={40}
                height={40}
                style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 12, border: 0 }}
              />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '-.03em',
                  verticalAlign: 'middle',
                }}
              >
                <span style={{ color: c.brand }}>Lasistant</span>
                <span style={{ color: c.wordmarkGreen }}>.Pro</span>
              </span>
            </div>
          </>
        ) : (
          <div className="lp-pad" style={{ background: c.plum, color: c.white, padding: `24px ${gutter}px` }}>
            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: c.white,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        marginRight: 12,
                      }}
                    >
                      <img
                        src={logo}
                        alt=""
                        width={30}
                        height={30}
                        style={{ display: 'inline-block', marginTop: 5, border: 0 }}
                      />
                    </span>
                    <span style={{ fontWeight: 600, verticalAlign: 'middle', color: c.white }}>
                      Back-office LASISTANT.PRO
                    </span>
                  </td>
                  {badge ? (
                    <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: c.brandBright,
                          color: c.white,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          padding: '6px 12px',
                          borderRadius: 999,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge}
                      </span>
                    </td>
                  ) : null}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="lp-pad" style={{ padding: `${variant === 'brand' ? 40 : 34}px ${gutter}px 34px` }}>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}

/** Pied de page sombre des e-mails adressés aux demandeurs. */
export function PublicEmailFooter({
  address,
  email,
  siteUrl,
}: {
  address: string;
  email: string | null;
  siteUrl: string;
}) {
  return (
    <div
      className="lp-pad"
      style={{ background: c.night, color: c.onNight, padding: '26px 40px', fontSize: 12.5, lineHeight: 1.6 }}
    >
      <p style={{ margin: '0 0 6px', color: c.white, fontWeight: 600 }}>
        LASISTANT.PRO · Soutien médical &amp; hébergement
      </p>
      <p style={{ margin: 0 }}>{[address, email].filter(Boolean).join(' · ')}</p>
      <p style={{ margin: '10px 0 0' }}>
        Vous recevez cet e-mail à la suite de votre demande sur notre site. Nos services d’accompagnement ne
        remplacent pas un avis médical.
      </p>
      <p style={{ margin: '10px 0 0' }}>
        <a href={`${siteUrl}/politique-de-confidentialite`} style={{ color: c.brandLight }}>
          Politique de confidentialité
        </a>
        {' · '}
        <a href={`${siteUrl}/mentions-legales`} style={{ color: c.brandLight }}>
          Mentions légales
        </a>
      </p>
    </div>
  );
}

/** Pied de page sobre des e-mails internes à l'équipe. */
export function TeamEmailFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="lp-pad"
      style={{
        background: c.canvas,
        borderTop: `1px solid ${c.line}`,
        color: c.muted,
        padding: '18px 36px',
        fontSize: 12.5,
      }}
    >
      {children}
    </div>
  );
}

/** Numéros de téléphone cliquables, séparés par « · ». */
export function EmailPhones({ phones }: { phones: string[] }) {
  return (
    <>
      {phones.map((phone, index) => (
        <span key={phone}>
          {index > 0 ? ' · ' : null}
          <a
            href={phoneHref(phone)}
            style={{ color: c.brand, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            {phone}
          </a>
        </span>
      ))}
    </>
  );
}
