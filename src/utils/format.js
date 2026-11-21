/*
  Turns "2026-03-01" into "1 Mar 2026".
  We build the date from its parts so the time zone can't shift it to the day before.
*/
export function formatDate(dateString) {
  if (!dateString) {
    return 'Not set';
  }

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatAcres(plotSize) {
  return `${plotSize} ${plotSize === 1 ? 'acre' : 'acres'}`;
}
