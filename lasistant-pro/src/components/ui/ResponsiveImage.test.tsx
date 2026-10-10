// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { images } from '@/assets/images';
import { ResponsiveImage } from './ResponsiveImage';

const imgOf = (container: HTMLElement) => container.querySelector('img') as HTMLImageElement;

describe('ResponsiveImage', () => {
  it('rend une photo du registre avec ses variantes, ses dimensions et son texte alternatif', () => {
    const img = imgOf(render(<ResponsiveImage image="teamMeeting" sizes="50vw" />).container);
    expect(img).toHaveAttribute('alt', images.teamMeeting.alt);
    expect(img).toHaveAttribute('width', String(images.teamMeeting.width));
    expect(img).toHaveAttribute('sizes', '50vw');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img.style.objectPosition).toBe('');
  });

  it('garde visible le point d’intérêt d’une photo recadrée', () => {
    const img = imgOf(render(<ResponsiveImage image="teamVehicle" />).container);
    expect(img.style.objectPosition).toBe(images.teamVehicle.focus);
  });

  it('affiche une ancienne clé d’image avec la photo qui la remplace', () => {
    const img = imgOf(render(<ResponsiveImage image="airplaneWing" />).container);
    expect(img).toHaveAttribute('alt', images.teamVehicle.alt);
  });
});
