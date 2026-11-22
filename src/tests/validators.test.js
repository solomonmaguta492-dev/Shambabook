import {
  validateCrop,
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
  validateRequired,
} from '../utils/validators.js';

describe('validators', () => {
  it('validateRequired needs some text', () => {
    expect(validateRequired('', 'Full name')).toBe('Full name is required');
    expect(validateRequired('   ', 'Full name')).toBe('Full name is required');
    expect(validateRequired('Amina', 'Full name')).toBe('');
  });

  it('validateEmail checks the email format', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('farmer')).toBe('Please enter a valid email address');
    expect(validateEmail('farmer@mail')).toBe('Please enter a valid email address');
    expect(validateEmail('farmer@example.com')).toBe('');
  });

  it('validatePassword needs at least 6 characters', () => {
    expect(validatePassword('')).toBe('Password is required');
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters');
    expect(validatePassword('123456')).toBe('');
  });

  it('validatePasswordsMatch checks both passwords are the same', () => {
    expect(validatePasswordsMatch('secret1', '')).toBe('Please confirm your password');
    expect(validatePasswordsMatch('secret1', 'secret2')).toBe('Passwords do not match');
    expect(validatePasswordsMatch('secret1', 'secret1')).toBe('');
  });
});

describe('validateCrop', () => {
  /* A crop with no mistakes; each test changes one field */
  const validCrop = {
    name: 'Maize',
    variety: 'H614',
    plotSize: '2.5',
    plantingDate: '2026-03-01',
    expectedHarvestDate: '2026-07-15',
    status: 'Planted',
  };

  it('returns no errors for a valid crop', () => {
    expect(validateCrop(validCrop)).toEqual({});
  });

  it('needs a name', () => {
    expect(validateCrop({ ...validCrop, name: '  ' }).name).toBe('Crop name is required');
  });

  it('needs a plot size greater than 0', () => {
    expect(validateCrop({ ...validCrop, plotSize: '' }).plotSize).toBe('Plot size is required');
    expect(validateCrop({ ...validCrop, plotSize: '0' }).plotSize).toBe(
      'Plot size must be a number greater than 0'
    );
    expect(validateCrop({ ...validCrop, plotSize: 'abc' }).plotSize).toBe(
      'Plot size must be a number greater than 0'
    );
    expect(validateCrop({ ...validCrop, plotSize: 3 }).plotSize).toBeUndefined();
  });

  it('needs a planting date', () => {
    expect(validateCrop({ ...validCrop, plantingDate: '' }).plantingDate).toBe('Planting date is required');
  });

  it('does not allow a harvest date before the planting date', () => {
    expect(validateCrop({ ...validCrop, expectedHarvestDate: '2026-02-01' }).expectedHarvestDate).toBe(
      'Harvest date cannot be before the planting date'
    );
    expect(validateCrop({ ...validCrop, expectedHarvestDate: '' })).toEqual({});
  });

  it('only allows the three statuses', () => {
    expect(validateCrop({ ...validCrop, status: 'Dead' }).status).toBe('Please choose a status');
    expect(validateCrop({ ...validCrop, status: 'Harvested' })).toEqual({});
  });
});
