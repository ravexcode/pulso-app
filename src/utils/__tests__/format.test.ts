import {
  formatDateInput,
  formatDuration,
  formatRest,
  fromDisplayHeight,
  fromDisplayWeight,
  parseDecimal,
  toDisplayHeight,
  toDisplayWeight,
} from '@/utils/format';

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [9.6, '0:10'],
    [75, '1:15'],
    [3725, '1:02:05'],
    [-5, '0:00'],
  ])('formats %p seconds as %p', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('formatRest', () => {
  it.each([
    [45, '45 s'],
    [120, '2 min'],
    [90, '1 min 30 s'],
  ])('formats %p seconds as %p', (seconds, expected) => {
    expect(formatRest(seconds)).toBe(expected);
  });
});

describe('units', () => {
  it('keeps metric values', () => {
    expect(toDisplayWeight(60, 'metric')).toBe(60);
    expect(fromDisplayWeight(60, 'metric')).toBe(60);
    expect(toDisplayHeight(180, 'metric')).toBe(180);
  });

  it('converts imperial values', () => {
    expect(toDisplayWeight(100, 'imperial')).toBe(220.5);
    expect(fromDisplayWeight(220.462, 'imperial')).toBeCloseTo(100);
    expect(toDisplayHeight(180, 'imperial')).toBe(70.9);
    expect(fromDisplayHeight(70, 'imperial')).toBeCloseTo(177.8);
  });
});

describe('parseDecimal', () => {
  it('accepts dots and commas', () => {
    expect(parseDecimal('72.5')).toBe(72.5);
    expect(parseDecimal(' 72,5 ')).toBe(72.5);
  });

  it('returns undefined for empty or invalid text', () => {
    expect(parseDecimal('')).toBeUndefined();
    expect(parseDecimal('abc')).toBeUndefined();
  });
});

describe('formatDateInput', () => {
  it.each([
    ['1998', '1998'],
    ['19980', '1998-0'],
    ['199804', '1998-04'],
    ['19980412', '1998-04-12'],
    ['1998-04-12', '1998-04-12'],
    ['1998-04-123', '1998-04-12'],
    ['12/04/1998', '1204-19-98'],
  ])('formats %p as %p', (text, expected) => {
    expect(formatDateInput(text)).toBe(expected);
  });
});
