import { describe, expect, it } from 'vitest';
import { getHeroBook } from './get-hero-book';

describe('getHeroBook', () => {
  it('returns the expected hero content', () => {
    expect(getHeroBook()).toEqual({
      title: 'Muy pronto',
      subtitle: 'Estamos preparando la experiencia.',
    });
  });
});
