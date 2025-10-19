/**
 * MedTech Data Platform - Date Utils Tests
 * Umfassende Tests fÃ¼r die Date-Utility-Funktionen
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatDate, formatDateTime, getRelativeTime, isValidDate, parseDate } from '../../utils/dateUtils';

describe.skip('Date Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe.skip('formatDate', () => {
    it('should format date correctly with default format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('15.01.2024');
    });

    it('should format date with custom format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'YYYY-MM-DD');
      expect(result).toBe('2024-01-15');
    });

    it('should handle different date formats', () => {
      const date = new Date('2024-12-25T10:30:00Z');
      const result = formatDate(date, 'DD.MM.YYYY');
      expect(result).toBe('25.12.2024');
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('N/A');
    });

    it('should handle null date', () => {
      const result = formatDate(null);
      expect(result).toBe('N/A');
    });

    it('should handle undefined date', () => {
      const result = formatDate(undefined);
      expect(result).toBe('N/A');
    });

    it('should handle string date input', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('15.01.2024');
    });

    it('should handle ISO string date input', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('15.01.2024');
    });
  });

  describe.skip('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toBe('15.01.2024 10:30');
    });

    it('should format date and time with custom format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTime(date, 'YYYY-MM-DD HH:mm:ss');
      expect(result).toBe('2024-01-15 10:30:00');
    });

    it('should handle different time formats', () => {
      const date = new Date('2024-01-15T14:45:30Z');
      const result = formatDateTime(date, 'DD.MM.YYYY HH:mm');
      expect(result).toBe('15.01.2024 14:45');
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = formatDateTime(invalidDate);
      expect(result).toBe('N/A');
    });

    it('should handle null date', () => {
      const result = formatDateTime(null);
      expect(result).toBe('N/A');
    });

    it('should handle undefined date', () => {
      const result = formatDateTime(undefined);
      expect(result).toBe('N/A');
    });
  });

  describe.skip('getRelativeTime', () => {
    beforeEach(() => {
      // Mock current time to 2024-01-15 12:00:00
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show "just now" for very recent time', () => {
      const date = new Date('2024-01-15T11:59:30Z');
      const result = getRelativeTime(date);
      expect(result).toBe('gerade eben');
    });

    it('should show minutes ago for recent time', () => {
      const date = new Date('2024-01-15T11:45:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('vor 15 Minuten');
    });

    it('should show hours ago for older time', () => {
      const date = new Date('2024-01-15T09:00:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('vor 3 Stunden');
    });

    it('should show days ago for older time', () => {
      const date = new Date('2024-01-13T12:00:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('vor 2 Tagen');
    });

    it('should show weeks ago for older time', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('vor 2 Wochen');
    });

    it('should show months ago for older time', () => {
      const date = new Date('2023-11-15T12:00:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('vor 2 Monaten');
    });

    it('should show years ago for very old time', () => {
      const date = new Date('2022-01-15T12:00:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('vor 2 Jahren');
    });

    it('should handle future dates', () => {
      const date = new Date('2024-01-16T12:00:00Z');
      const result = getRelativeTime(date);
      expect(result).toBe('in 1 Tag');
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = getRelativeTime(invalidDate);
      expect(result).toBe('N/A');
    });

    it('should handle null date', () => {
      const result = getRelativeTime(null);
      expect(result).toBe('N/A');
    });

    it('should handle undefined date', () => {
      const result = getRelativeTime(undefined);
      expect(result).toBe('N/A');
    });
  });

  describe.skip('isValidDate', () => {
    it('should return true for valid date', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = isValidDate(date);
      expect(result).toBe(true);
    });

    it('should return false for invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = isValidDate(invalidDate);
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const result = isValidDate(null);
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = isValidDate(undefined);
      expect(result).toBe(false);
    });

    it('should return true for valid date string', () => {
      const result = isValidDate('2024-01-15');
      expect(result).toBe(true);
    });

    it('should return false for invalid date string', () => {
      const result = isValidDate('invalid-date');
      expect(result).toBe(false);
    });

    it('should return true for valid timestamp', () => {
      const result = isValidDate(1705312200000);
      expect(result).toBe(true);
    });

    it('should return false for invalid timestamp', () => {
      const result = isValidDate(NaN);
      expect(result).toBe(false);
    });
  });

  describe.skip('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2024-01-15');
      expect(result).toEqual(new Date('2024-01-15'));
    });

    it('should parse valid ISO string', () => {
      const result = parseDate('2024-01-15T10:30:00Z');
      expect(result).toEqual(new Date('2024-01-15T10:30:00Z'));
    });

    it('should parse valid timestamp', () => {
      const timestamp = 1705312200000;
      const result = parseDate(timestamp);
      expect(result).toEqual(new Date(timestamp));
    });

    it('should handle invalid date string', () => {
      const result = parseDate('invalid-date');
      expect(result).toBeNull();
    });

    it('should handle null input', () => {
      const result = parseDate(null);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = parseDate(undefined);
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = parseDate('');
      expect(result).toBeNull();
    });

    it('should handle invalid timestamp', () => {
      const result = parseDate(NaN);
      expect(result).toBeNull();
    });

    it('should handle date object input', () => {
      const date = new Date('2024-01-15');
      const result = parseDate(date);
      expect(result).toEqual(date);
    });
  });

  describe.skip('Edge cases and error handling', () => {
    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01');
      const result = formatDate(oldDate);
      expect(result).toBe('01.01.1900');
    });

    it('should handle very future dates', () => {
      const futureDate = new Date('2100-12-31');
      const result = formatDate(futureDate);
      expect(result).toBe('31.12.2100');
    });

    it('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29');
      const result = formatDate(leapYearDate);
      expect(result).toBe('29.02.2024');
    });

    it('should handle timezone differences', () => {
      const utcDate = new Date('2024-01-15T12:00:00Z');
      const localDate = new Date('2024-01-15T12:00:00');
      
      const utcResult = formatDate(utcDate);
      const localResult = formatDate(localDate);
      
      expect(utcResult).toBe('15.01.2024');
      expect(localResult).toBe('15.01.2024');
    });

    it('should handle milliseconds in timestamps', () => {
      const timestamp = 1705312200123;
      const result = parseDate(timestamp);
      expect(result).toEqual(new Date(timestamp));
    });

    it('should handle different date formats consistently', () => {
      const formats = [
        '2024-01-15',
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00.000Z',
        '01/15/2024',
        '15.01.2024'
      ];

      formats.forEach(format => {
        const result = parseDate(format);
        if (result) {
          expect(isValidDate(result)).toBe(true);
        }
      });
    });

    it('should handle empty objects', () => {
      const result = parseDate({});
      expect(result).toBeNull();
    });

    it('should handle arrays', () => {
      const result = parseDate([2024, 0, 15]);
      expect(result).toBeNull();
    });

    it('should handle boolean values', () => {
      const result1 = parseDate(true);
      const result2 = parseDate(false);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should handle zero timestamp', () => {
      const result = parseDate(0);
      expect(result).toEqual(new Date(0));
    });

    it('should handle negative timestamp', () => {
      const result = parseDate(-1000);
      expect(result).toEqual(new Date(-1000));
    });
  });

  describe.skip('Performance and memory', () => {
    it('should handle large number of date operations efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const date = new Date(`2024-01-${(i % 28) + 1}`);
        formatDate(date);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should not create memory leaks with repeated calls', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10000; i++) {
        const date = new Date(`2024-01-${(i % 28) + 1}`);
        formatDate(date);
        getRelativeTime(date);
        isValidDate(date);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});


