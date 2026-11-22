import {
  cropProfit,
  expensesForCrop,
  harvestIncome,
  harvestsForCrop,
  mostProfitableCrop,
  nextHarvest,
  recentActivity,
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

describe('nextHarvest', () => {
  const today = '2026-11-22';

  it('picks the soonest harvest date that is today or later', () => {
    const crops = [
      { id: 'c1', name: 'Maize', status: 'Growing', expectedHarvestDate: '2027-01-10' },
      { id: 'c2', name: 'Beans', status: 'Planted', expectedHarvestDate: '2026-12-05' },
      { id: 'c3', name: 'Kale', status: 'Growing', expectedHarvestDate: '2026-11-01' },
    ];

    expect(nextHarvest(crops, today).name).toBe('Beans');
  });

  it('counts a harvest that is due today', () => {
    const crops = [{ id: 'c1', name: 'Maize', status: 'Growing', expectedHarvestDate: today }];

    expect(nextHarvest(crops, today).name).toBe('Maize');
  });

  it('skips crops that are already Harvested or have no date', () => {
    const crops = [
      { id: 'c1', name: 'Maize', status: 'Harvested', expectedHarvestDate: '2026-11-30' },
      { id: 'c2', name: 'Beans', status: 'Growing', expectedHarvestDate: '' },
    ];

    expect(nextHarvest(crops, today)).toBeNull();
  });

  it('does not change the order of the crops it was given', () => {
    const crops = [
      { id: 'c1', name: 'Maize', status: 'Growing', expectedHarvestDate: '2027-01-10' },
      { id: 'c2', name: 'Beans', status: 'Growing', expectedHarvestDate: '2026-12-05' },
    ];

    nextHarvest(crops, today);

    expect(crops.map((crop) => crop.id)).toEqual(['c1', 'c2']);
  });
});

describe('recentActivity', () => {
  const crops = [
    { id: 'maize', name: 'Maize' },
    { id: 'beans', name: 'Beans' },
  ];

  it('mixes expenses and harvests, newest date first', () => {
    const items = recentActivity(
      [{ id: 'e1', cropId: 'maize', amount: 1500, date: '2026-03-01' }],
      [{ id: 'h1', cropId: 'beans', quantity: 10, pricePerUnit: 50, date: '2026-03-05' }],
      crops
    );

    expect(items).toEqual([
      { id: 'harvest-h1', type: 'harvest', cropName: 'Beans', date: '2026-03-05', amount: 500 },
      { id: 'expense-e1', type: 'expense', cropName: 'Maize', date: '2026-03-01', amount: 1500 },
    ]);
  });

  it('keeps only the 5 newest', () => {
    const manyExpenses = ['01', '02', '03', '04', '05', '06', '07'].map((day) => ({
      id: day,
      cropId: 'maize',
      amount: 100,
      date: `2026-03-${day}`,
    }));

    const items = recentActivity(manyExpenses, [], crops);

    expect(items.map((item) => item.date)).toEqual([
      '2026-03-07',
      '2026-03-06',
      '2026-03-05',
      '2026-03-04',
      '2026-03-03',
    ]);
  });

  it('says "Unknown crop" when the crop is missing', () => {
    const items = recentActivity([{ id: 'e1', cropId: 'gone', amount: 100, date: '2026-03-01' }], [], crops);

    expect(items[0].cropName).toBe('Unknown crop');
  });

  it('returns an empty list when there is nothing', () => {
    expect(recentActivity([], [], crops)).toEqual([]);
  });
});
