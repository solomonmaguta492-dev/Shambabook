import { getFarmingTips } from '../utils/weatherTips.js';

/* 22 Nov 2026 is a Sunday, so the week runs Sunday to Saturday */
const dates = ['2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28'];

/* A week of mild days with a little rain; each test changes what it needs */
function week(changes = {}) {
  return dates.map((date, index) => ({ date, max: 25, min: 14, rain: 2, ...changes[index] }));
}

describe('getFarmingTips', () => {
  it('warns about heavy rain on the first day with 10 mm or more', () => {
    const tips = getFarmingTips(week({ 2: { rain: 10 }, 4: { rain: 20 } }));

    expect(tips).toContain('Heavy rain expected on Tuesday. Avoid spraying or applying fertiliser that day.');
  });

  it('says dry days are ahead when the next 3 days have less than 1 mm in total', () => {
    const tips = getFarmingTips(week({ 0: { rain: 0.2 }, 1: { rain: 0 }, 2: { rain: 0.5 } }));

    expect(tips).toContain('Dry days ahead. Water young crops and plan harvesting.');
  });

  it('does not say dry when the 3 days add up to 1 mm', () => {
    const tips = getFarmingTips(week({ 0: { rain: 0.5 }, 1: { rain: 0.5 }, 2: { rain: 0 } }));

    expect(tips).not.toContain('Dry days ahead. Water young crops and plan harvesting.');
  });

  it('warns about heat on the first day reaching 30°C', () => {
    const tips = getFarmingTips(week({ 5: { max: 30 } }));

    expect(tips).toContain('Hot on Friday. Water crops early in the morning or late in the evening.');
  });

  it('gives the "good conditions" tip when nothing stands out', () => {
    expect(getFarmingTips(week())).toEqual(['Good conditions for normal farm work this week.']);
  });

  it('returns at most 3 tips', () => {
    const tips = getFarmingTips(
      week({ 0: { rain: 0 }, 1: { rain: 0 }, 2: { rain: 0 }, 3: { rain: 15 }, 4: { max: 33 } })
    );

    expect(tips).toHaveLength(3);
    expect(tips).not.toContain('Good conditions for normal farm work this week.');
  });
});
