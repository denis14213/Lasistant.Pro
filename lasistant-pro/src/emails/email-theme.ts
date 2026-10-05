import type { CSSProperties } from 'react';

/**
 * Palette et styles des e-mails.
 * Les messageries ignorent les feuilles de style et les variables CSS : les couleurs
 * du système de design sont donc reprises ici en valeurs littérales, appliquées en ligne.
 */
export const EMAIL_COLORS = {
  ink: '#17151C',
  text: '#4A4553',
  muted: '#5F5A69',
  line: '#E8E3EC',
  lineStrong: '#D8D1DF',
  canvas: '#FBFAF8',
  envelope: '#ECEAF0',
  white: '#FFFFFF',
  brand: '#7A1FA0',
  brandDark: '#5E1680',
  brandBright: '#B526D9',
  brandSoft: '#F3E6F8',
  brandLight: '#E3B0F5',
  mist: '#F4EFF7',
  plum: '#2A0F38',
  onPlum: '#CDBFD8',
  night: '#141218',
  onNight: '#ABA4B5',
  success: '#177A2E',
  successBright: '#2BB24C',
  wordmarkGreen: '#2A9A35',
  goldWash: '#FFFCF4',
  goldLine: '#EEDDB0',
  goldText: '#5B4310',
  goldSoft: '#F8EFD8',
  goldDark: '#6E4F0C',
  dangerSoft: '#FDECEA',
  dangerText: '#7A1A12',
  neutralSoft: '#ECEAF0',
  neutral: '#4B4654',
  infoSoft: '#E8EEFF',
  infoDark: '#1A3FA8',
} as const;

export const EMAIL_FONT = "'Instrument Sans', 'Segoe UI', Helvetica, Arial, sans-serif";

const c = EMAIL_COLORS;

export const emailStyles = {
  paragraph: { margin: '0 0 14px', color: c.text, fontSize: 15.5, lineHeight: 1.6 } satisfies CSSProperties,
  eyebrow: {
    margin: '0 0 10px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '.16em',
    textTransform: 'uppercase',
    color: c.success,
  } satisfies CSSProperties,
  title: {
    margin: '0 0 16px',
    fontSize: 28,
    lineHeight: 1.15,
    letterSpacing: '-.03em',
    fontWeight: 600,
    color: c.ink,
  } satisfies CSSProperties,
  pending: {
    background: c.goldSoft,
    color: c.goldDark,
    borderRadius: 6,
    padding: '1px 7px',
    fontWeight: 600,
    fontSize: 12.5,
  } satisfies CSSProperties,
};
