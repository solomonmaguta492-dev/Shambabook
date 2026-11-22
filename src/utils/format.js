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

/* 12500 → "KES 12,500", and a loss of 2000 → "-KES 2,000" */
export function formatCurrency(amount) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}KES ${numberFormat.format(Math.abs(amount))}`;
}

/* "positive" for a profit, "negative" for a loss, "neutral" at exactly 0; used to pick a colour */
export function profitTone(amount) {
  if (amount > 0) {
    return 'positive';
  }
  return amount < 0 ? 'negative' : 'neutral';
}

/* 20 and "bags" → "20 bags", but 1 and "bags" → "1 bag" */
export function formatQuantity(quantity, unit) {
  const singular = unit === 'kg' ? unit : unit.slice(0, -1);
  return `${quantity} ${quantity === 1 ? singular : unit}`;
}

/* Today's date as "YYYY-MM-DD" in the farmer's own time zone */
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/*
  "2026-11-24" → "Tue", or "Tuesday" with style "long".
  Built from its parts, like formatDate, so the time zone can't shift the day.
*/
export function formatWeekday(dateString, style = 'short') {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { weekday: style });
}
