import {
  formatAcres,
  formatCurrency,
  formatDate,
  formatQuantity,
  profitTone,
  todayString,
} from '../utils/format.js';

describe('format', () => {
  it('formatCurrency shows KES with commas', () => {
    expect(formatCurrency(12500)).toBe('KES 12,500');
    expect(formatCurrency(0)).toBe('KES 0');
    expect(formatCurrency(1250.5)).toBe('KES 1,250.5');
    expect(formatCurrency(1000000)).toBe('KES 1,000,000');
  });

  it('formatCurrency puts the minus sign in front for a loss', () => {
    expect(formatCurrency(-2000)).toBe('-KES 2,000');
  });

  it('formatQuantity uses the singular for 1', () => {
    expect(formatQuantity(20, 'bags')).toBe('20 bags');
    expect(formatQuantity(1, 'bags')).toBe('1 bag');
    expect(formatQuantity(1, 'kg')).toBe('1 kg');
    expect(formatQuantity(3, 'pieces')).toBe('3 pieces');
  });

  it('profitTone picks a colour name for profit, loss or zero', () => {
    expect(profitTone(100)).toBe('positive');
    expect(profitTone(-100)).toBe('negative');
    expect(profitTone(0)).toBe('neutral');
  });

  it('formatDate shows a short, readable date', () => {
    expect(formatDate('2026-03-12')).toBe('12 Mar 2026');
    expect(formatDate('2026-01-01')).toBe('1 Jan 2026');
    expect(formatDate('')).toBe('Not set');
  });

  it('formatAcres uses acre or acres', () => {
    expect(formatAcres(1)).toBe('1 acre');
    expect(formatAcres(2.5)).toBe('2.5 acres');
  });

  it('todayString gives today as YYYY-MM-DD', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 5, 10, 30));

    expect(todayString()).toBe('2026-03-05');

    vi.useRealTimers();
  });
});
