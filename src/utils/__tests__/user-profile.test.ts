import type { UserProfileInput } from '@/types/user';
import {
  createUserProfile,
  InvalidUserProfileError,
  isUserProfile,
  isValidBirthDate,
  updateUserProfile,
  validateUserProfileInput,
} from '@/utils/user-profile';

const now = new Date('2026-10-25T12:00:00.000Z');

const input: UserProfileInput = {
  name: '  Ana  ',
  birthDate: '1998-04-12',
  sex: 'female',
  heightCm: 168,
  weightKg: 61.5,
  goal: 'build-muscle',
  level: 'beginner',
  units: 'metric',
  trainingDaysPerWeek: 4,
};

describe('isValidBirthDate', () => {
  it('accepts a past calendar date', () => {
    expect(isValidBirthDate('2000-02-29', now)).toBe(true);
  });

  it.each(['2001-02-29', '2000-13-01', '12/04/1998', '2027-01-01', 19980412])(
    'rejects %p',
    (value) => {
      expect(isValidBirthDate(value, now)).toBe(false);
    }
  );
});

describe('validateUserProfileInput', () => {
  it('returns no errors for a valid input', () => {
    expect(validateUserProfileInput(input, now)).toEqual([]);
  });

  it('lists every invalid field', () => {
    const errors = validateUserProfileInput(
      { ...input, name: '   ', heightCm: 10, sex: 'x', trainingDaysPerWeek: 3.5 },
      now
    );

    expect(errors).toEqual(['name', 'sex', 'heightCm', 'trainingDaysPerWeek']);
  });
});

describe('createUserProfile', () => {
  it('trims the name and sets the timestamps', () => {
    const profile = createUserProfile(input, now);

    expect(profile.name).toBe('Ana');
    expect(profile.createdAt).toBe(now.toISOString());
    expect(profile.updatedAt).toBe(now.toISOString());
    expect(isUserProfile(profile)).toBe(true);
  });

  it('throws with the invalid fields', () => {
    expect(() => createUserProfile({ ...input, weightKg: 0 }, now)).toThrow(
      new InvalidUserProfileError(['weightKg'])
    );
  });
});

describe('updateUserProfile', () => {
  it('keeps createdAt and changes updatedAt', () => {
    const profile = createUserProfile(input, now);
    const later = new Date('2026-11-01T08:00:00.000Z');

    const updated = updateUserProfile(profile, { weightKg: 60 }, later);

    expect(updated.weightKg).toBe(60);
    expect(updated.createdAt).toBe(profile.createdAt);
    expect(updated.updatedAt).toBe(later.toISOString());
  });

  it('ignores unknown keys', () => {
    const profile = createUserProfile(input, now);
    const changes = { level: 'advanced', extra: true } as Partial<UserProfileInput>;

    expect(updateUserProfile(profile, changes, now)).not.toHaveProperty('extra');
  });
});

describe('isUserProfile', () => {
  it.each([null, 'text', {}, { ...input, createdAt: 'yesterday', updatedAt: 'today' }])(
    'rejects %p',
    (value) => {
      expect(isUserProfile(value)).toBe(false);
    }
  );
});
