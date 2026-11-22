import { formatWeekday } from './format.js';

/* Rain (mm) in one day that counts as heavy */
const HEAVY_RAIN_MM = 10;
/* Less rain than this (mm) over the next 3 days counts as dry */
const DRY_TOTAL_MM = 1;
/* A top temperature (°C) at or above this counts as hot */
const HOT_TEMPERATURE = 30;

/* Looks at the 7-day forecast and returns up to 3 short farming tips */
export function getFarmingTips(days) {
  const tips = [];

  const rainyDay = days.find((day) => day.rain >= HEAVY_RAIN_MM);
  if (rainyDay) {
    tips.push(
      `Heavy rain expected on ${formatWeekday(rainyDay.date, 'long')}. Avoid spraying or applying fertiliser that day.`
    );
  }

  const rainNextThreeDays = days.slice(0, 3).reduce((total, day) => total + day.rain, 0);
  if (days.length > 0 && rainNextThreeDays < DRY_TOTAL_MM) {
    tips.push('Dry days ahead. Water young crops and plan harvesting.');
  }

  const hotDay = days.find((day) => day.max >= HOT_TEMPERATURE);
  if (hotDay) {
    tips.push(
      `Hot on ${formatWeekday(hotDay.date, 'long')}. Water crops early in the morning or late in the evening.`
    );
  }

  if (tips.length === 0) {
    tips.push('Good conditions for normal farm work this week.');
  }

  return tips.slice(0, 3);
}
