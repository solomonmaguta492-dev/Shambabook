/* Adds up the amount of every expense in the list */
export function totalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

/* Only the expenses that belong to one crop */
export function expensesForCrop(expenses, cropId) {
  return expenses.filter((expense) => expense.cropId === cropId);
}
