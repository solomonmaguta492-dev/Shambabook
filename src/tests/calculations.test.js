import {
  cropProfit,
  expensesForCrop,
  harvestIncome,
  harvestsForCrop,
  mostProfitableCrop,
  totalExpenses,
  totalIncome,
} from '../utils/calculations.js';

const expenses = [
  { id: 'e1', cropId: 'maize', amount: 1500 },
  { id: 'e2', cropId: 'beans', amount: 800 },
  { id: 'e3', cropId: 'maize', amount: 2000 },
];

const harvests = [
  { id: 'h1', cropId: 'maize', quantity: 20, unit: 'bags', pricePerUnit: 3500 },
  { id: 'h2', cropId: 'beans', quantity: 10, unit: 'kg', pricePerUnit: 50 },
  { id: 'h3', cropId: 'maize', quantity: 5, unit: 'bags', pricePerUnit: 3000 },
];

describe('expense calculations', () => {
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

describe('harvest calculations', () => {
  it('harvestIncome is quantity times price per unit', () => {
    expect(harvestIncome(harvests[0])).toBe(70000);
    expect(harvestIncome({ quantity: '2.5', pricePerUnit: '100' })).toBe(250);
  });

  it('totalIncome adds up the income of every harvest', () => {
    expect(totalIncome(harvests)).toBe(70000 + 500 + 15000);
    expect(totalIncome([])).toBe(0);
  });

  it('harvestsForCrop keeps only that crop\'s harvests', () => {
    expect(harvestsForCrop(harvests, 'maize').map((harvest) => harvest.id)).toEqual(['h1', 'h3']);
  });
});

describe('profit', () => {
  it('cropProfit gives expenses, income and a profit', () => {
    expect(cropProfit('maize', expenses, harvests)).toEqual({
      expenses: 3500,
      income: 85000,
      profit: 81500,
    });
  });

  it('cropProfit gives a negative profit for a loss', () => {
    expect(cropProfit('beans', expenses, harvests)).toEqual({
      expenses: 800,
      income: 500,
      profit: -300,
    });
  });

  it('cropProfit is all zeros for a crop with no records', () => {
    expect(cropProfit('sorghum', expenses, harvests)).toEqual({ expenses: 0, income: 0, profit: 0 });
  });

  it('mostProfitableCrop picks the crop with the highest profit', () => {
    const crops = [
      { id: 'maize', name: 'Maize' },
      { id: 'beans', name: 'Beans' },
    ];

    expect(mostProfitableCrop(crops, expenses, harvests)).toEqual({ crop: crops[0], profit: 81500 });
  });

  it('mostProfitableCrop is null when no crop has income yet', () => {
    expect(mostProfitableCrop([{ id: 'maize', name: 'Maize' }], expenses, [])).toBeNull();
  });
});
