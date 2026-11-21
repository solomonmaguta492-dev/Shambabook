/* "1 expense" or "2 expenses" */
function countOf(count, word) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/* The warning shown before deleting a crop, mentioning its expenses and harvests if it has any */
export function deleteCropMessage(expenseCount, harvestCount = 0) {
  const records = [];
  if (expenseCount > 0) {
    records.push(countOf(expenseCount, 'expense'));
  }
  if (harvestCount > 0) {
    records.push(countOf(harvestCount, 'harvest'));
  }

  if (records.length === 0) {
    return "This crop will be removed for good. This can't be undone.";
  }

  return `This will also delete its ${records.join(' and ')}. This can't be undone.`;
}
