import { todayString } from './format.js';

/* Each function returns an error message, or an empty string when the value is fine */

export function validateRequired(value, label) {
  return value.trim() === '' ? `${label} is required` : '';
}

export function validateEmail(email) {
  if (email.trim() === '') {
    return 'Email is required';
  }

  /* Something, then @, then something, a dot and something, with no spaces */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim()) ? '' : 'Please enter a valid email address';
}

export function validatePassword(password) {
  if (password === '') {
    return 'Password is required';
  }
  return password.length < 6 ? 'Password must be at least 6 characters' : '';
}

export function validatePasswordsMatch(password, confirmPassword) {
  if (confirmPassword === '') {
    return 'Please confirm your password';
  }
  return password === confirmPassword ? '' : 'Passwords do not match';
}

export const CROP_STATUSES = ['Planted', 'Growing', 'Harvested'];

/*
  Checks a crop form and returns an object of error messages, one per field.
  An empty object means everything is fine.
*/
export function validateCrop(data) {
  const errors = {};

  if (data.name.trim() === '') {
    errors.name = 'Crop name is required';
  }

  if (String(data.plotSize).trim() === '') {
    errors.plotSize = 'Plot size is required';
  } else if (!(Number(data.plotSize) > 0)) {
    errors.plotSize = 'Plot size must be a number greater than 0';
  }

  if (data.plantingDate === '') {
    errors.plantingDate = 'Planting date is required';
  }

  /* YYYY-MM-DD strings can be compared like words, so "<" works for dates */
  if (data.plantingDate && data.expectedHarvestDate && data.expectedHarvestDate < data.plantingDate) {
    errors.expectedHarvestDate = 'Harvest date cannot be before the planting date';
  }

  if (!CROP_STATUSES.includes(data.status)) {
    errors.status = 'Please choose a status';
  }

  return errors;
}

export const EXPENSE_CATEGORIES = ['Seed', 'Fertiliser', 'Pesticide', 'Labour', 'Transport', 'Other'];

/* Checks an expense form; an empty object means everything is fine */
export function validateExpense(data) {
  const errors = {};

  if (!data.cropId) {
    errors.cropId = 'Please choose a crop';
  }

  if (!EXPENSE_CATEGORIES.includes(data.category)) {
    errors.category = 'Please choose a category';
  }

  if (String(data.amount).trim() === '') {
    errors.amount = 'Amount is required';
  } else if (!(Number(data.amount) > 0)) {
    errors.amount = 'Amount must be greater than 0';
  }

  /* YYYY-MM-DD strings can be compared like words, so ">" works for dates */
  if (data.date === '') {
    errors.date = 'Date is required';
  } else if (data.date > todayString()) {
    errors.date = 'Date cannot be in the future';
  }

  return errors;
}
