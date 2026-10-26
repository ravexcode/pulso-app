import { accent, background, foreground } from '@/constants/palette';

const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function luminance(hex: string) {
  const channel = parseInt(hex.slice(1, 3), 16) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe('palette', () => {
  it('uses the base colors', () => {
    expect(accent.DEFAULT).toBe('#FAFAFA');
    expect(background.DEFAULT).toBe('#010101');
  });

  it.each(steps.slice(1))('goes from lighter to darker at step %i', (step) => {
    const previous = (step - 100) as (typeof steps)[number];
    expect(luminance(accent[step])).toBeLessThan(luminance(accent[previous]));
    expect(luminance(background[step])).toBeLessThan(luminance(background[previous]));
  });

  it.each(steps)('accent-%i is readable on the background (WCAG AA)', (step) => {
    expect(contrast(accent[step], background.DEFAULT)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(steps)('text adapts to background-%i', (step) => {
    expect(contrast(foreground.DEFAULT, background[step])).toBeGreaterThanOrEqual(4.5);
  });

  it('inverse text is readable on accent surfaces', () => {
    for (const step of [100, 200, 300, 400, 500] as const) {
      expect(contrast(foreground.inverse, accent[step])).toBeGreaterThanOrEqual(4.5);
    }
  });
});
