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

/* Adds commas and up to 2 decimals, for example 12500 → "12,500" */
const numberFormat = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 });

/* 12500 → "KES 12,500" */
export function formatCurrency(amount) {
  return `KES ${numberFormat.format(amount)}`;
}

/* Today's date as "YYYY-MM-DD" in the farmer's own time zone */
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
