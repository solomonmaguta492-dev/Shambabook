import { expensesForCrop, totalExpenses } from '../utils/calculations.js';

const expenses = [
  { id: 'e1', cropId: 'maize', amount: 1500 },
  { id: 'e2', cropId: 'beans', amount: 800 },
  { id: 'e3', cropId: 'maize', amount: 2000 },
];

describe('calculations', () => {
  it('totalExpenses adds up every amount', () => {
    expect(totalExpenses(expenses)).toBe(4300);
  });

  it('totalExpenses is 0 for an empty list', () => {
    expect(totalExpenses([])).toBe(0);
  });

  it('expensesForCrop keeps only that crop\'s expenses', () => {
    expect(expensesForCrop(expenses, 'maize').map((expense) => expense.id)).toEqual(['e1', 'e3']);
    expect(expensesForCrop(expenses, 'sorghum')).toEqual([]);
  });
});
