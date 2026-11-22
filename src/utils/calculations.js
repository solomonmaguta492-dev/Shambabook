/* Adds up the amount of every expense in the list */
export function totalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

/* Only the expenses that belong to one crop */
export function expensesForCrop(expenses, cropId) {
  return expenses.filter((expense) => expense.cropId === cropId);
}

/* Money from one harvest: how much was sold times the price of each unit */
export function harvestIncome(harvest) {
  return Number(harvest.quantity) * Number(harvest.pricePerUnit);
}

/* Adds up the income of every harvest in the list */
export function totalIncome(harvests) {
  return harvests.reduce((total, harvest) => total + harvestIncome(harvest), 0);
}

/* Only the harvests that belong to one crop */
export function harvestsForCrop(harvests, cropId) {
  return harvests.filter((harvest) => harvest.cropId === cropId);
}

/* What one crop cost, what it earned, and the difference */
export function cropProfit(cropId, expenses, harvests) {
  const cropExpenses = totalExpenses(expensesForCrop(expenses, cropId));
  const cropIncome = totalIncome(harvestsForCrop(harvests, cropId));

  return {
    expenses: cropExpenses,
    income: cropIncome,
    profit: cropIncome - cropExpenses,
  };
}

/*
  The crop that made the most profit, as { crop, profit }.
  Only crops with some income count; returns null if no crop has earned anything yet.
*/
export function mostProfitableCrop(crops, expenses, harvests) {
  let best = null;

  crops.forEach((crop) => {
    const result = cropProfit(crop.id, expenses, harvests);
    if (result.income > 0 && (best === null || result.profit > best.profit)) {
      best = { crop, profit: result.profit };
    }
  });

  return best;
}

/*
  The crop whose harvest comes soonest: not yet Harvested and expected today or later.
  Dates are "YYYY-MM-DD" text, so comparing them as text also compares them as dates.
  Returns null when there is no upcoming harvest.
*/
export function nextHarvest(crops, today) {
  const upcoming = crops.filter(
    (crop) => crop.status !== 'Harvested' && crop.expectedHarvestDate && crop.expectedHarvestDate >= today
  );

  if (upcoming.length === 0) {
    return null;
  }

  /* Copy before sorting, so the crops list we were given stays as it was */
  const soonestFirst = [...upcoming].sort((a, b) => a.expectedHarvestDate.localeCompare(b.expectedHarvestDate));
  return soonestFirst[0];
}

/*
  Expenses and harvests in one list, newest date first, cut to "limit" items.
  Each item is { id, type, cropName, date, amount }, where type is "expense" or "harvest".
*/
export function recentActivity(expenses, harvests, crops, limit = 5) {
  function cropName(cropId) {
    return crops.find((crop) => crop.id === cropId)?.name ?? 'Unknown crop';
  }

  const expenseItems = expenses.map((expense) => ({
    id: `expense-${expense.id}`,
    type: 'expense',
    cropName: cropName(expense.cropId),
    date: expense.date,
    amount: Number(expense.amount),
  }));

  const harvestItems = harvests.map((harvest) => ({
    id: `harvest-${harvest.id}`,
    type: 'harvest',
    cropName: cropName(harvest.cropId),
    date: harvest.date,
    amount: harvestIncome(harvest),
  }));

  const newestFirst = [...expenseItems, ...harvestItems].sort((a, b) => b.date.localeCompare(a.date));
  return newestFirst.slice(0, limit);
}
