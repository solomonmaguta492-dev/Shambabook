/* The warning shown before deleting a crop, mentioning its expenses if it has any */
export function deleteCropMessage(expenseCount) {
  if (expenseCount === 0) {
    return "This crop will be removed for good. This can't be undone.";
  }

  const expenseWord = expenseCount === 1 ? 'expense' : 'expenses';
  return `This will also delete its ${expenseCount} ${expenseWord}. This can't be undone.`;
}
