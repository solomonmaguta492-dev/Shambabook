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
