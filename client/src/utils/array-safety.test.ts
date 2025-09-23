// ========================================
// ARRAY SAFETY TESTS - UMFASSENDE EDGE-CASE-VALIDIERUNG
// ========================================

import { safeArray, safeFilter, safeMap, safeUnique } from './array-safety';

describe('Array Safety Utilities', () => {
  describe('safeArray', () => {
    test('should handle valid arrays', () => {
      const input = [1, 2, 3];
      const result = safeArray(input);
      expect(result).toEqual([1, 2, 3]);
    });

    test('should handle null', () => {
      const result = safeArray(null);
      expect(result).toEqual([]);
    });

    test('should handle undefined', () => {
      const result = safeArray(undefined);
      expect(result).toEqual([]);
    });

    test('should handle objects with data property', () => {
      const input = { success: true, data: [1, 2, 3] };
      const result = safeArray(input);
      expect(result).toEqual([1, 2, 3]);
    });

    test('should handle single objects', () => {
      const input = { id: 1, name: 'test' };
      const result = safeArray(input);
      expect(result).toEqual([{ id: 1, name: 'test' }]);
    });

    test('should handle strings', () => {
      const result = safeArray('test');
      expect(result).toEqual([]);
    });

    test('should handle numbers', () => {
      const result = safeArray(42);
      expect(result).toEqual([]);
    });

    test('should handle booleans', () => {
      const result = safeArray(true);
      expect(result).toEqual([]);
    });
  });

  describe('safeFilter', () => {
    test('should filter valid arrays', () => {
      const input = [1, 2, 3, 4, 5];
      const result = safeFilter(input, x => x > 3);
      expect(result).toEqual([4, 5]);
    });

    test('should handle null input', () => {
      const result = safeFilter(null, x => x > 3);
      expect(result).toEqual([]);
    });

    test('should handle undefined input', () => {
      const result = safeFilter(undefined, x => x > 3);
      expect(result).toEqual([]);
    });

    test('should handle non-array input', () => {
      const result = safeFilter('test', x => x > 3);
      expect(result).toEqual([]);
    });

    test('should handle filter errors gracefully', () => {
      const input = [1, 2, 3];
      const result = safeFilter(input, () => {
        throw new Error('Filter error');
      });
      expect(result).toEqual([]);
    });
  });

  describe('safeMap', () => {
    test('should map valid arrays', () => {
      const input = [1, 2, 3];
      const result = safeMap(input, x => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });

    test('should handle null input', () => {
      const result = safeMap(null, x => x * 2);
      expect(result).toEqual([]);
    });

    test('should handle undefined input', () => {
      const result = safeMap(undefined, x => x * 2);
      expect(result).toEqual([]);
    });

    test('should handle non-array input', () => {
      const result = safeMap('test', x => x * 2);
      expect(result).toEqual([]);
    });

    test('should handle map errors gracefully', () => {
      const input = [1, 2, 3];
      const result = safeMap(input, () => {
        throw new Error('Map error');
      });
      expect(result).toEqual([]);
    });
  });

  describe('safeUnique', () => {
    test('should get unique values', () => {
      const input = [1, 2, 2, 3, 3, 3];
      const result = safeUnique(input);
      expect(result).toEqual([1, 2, 3]);
    });

    test('should handle key extractor', () => {
      const input = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' }
      ];
      const result = safeUnique(input, x => x.id);
      expect(result).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' }
      ]);
    });

    test('should handle null input', () => {
      const result = safeUnique(null);
      expect(result).toEqual([]);
    });

    test('should handle undefined input', () => {
      const result = safeUnique(undefined);
      expect(result).toEqual([]);
    });

    test('should handle non-array input', () => {
      const result = safeUnique('test');
      expect(result).toEqual([]);
    });
  });
});

// ========================================
// EDGE-CASE SIMULATION TESTS
// ========================================

describe('Edge Case Simulations', () => {
  test('API Response Edge Cases', () => {
    // Simulate various API response structures
    const testCases = [
      null,
      undefined,
      {},
      { data: null },
      { data: undefined },
      { data: {} },
      { data: 'string' },
      { data: 42 },
      { data: true },
      { success: true, data: [1, 2, 3] },
      { success: false, data: [] },
      { error: 'API Error' },
      'invalid json',
      [1, 2, 3], // Direct array
      { items: [1, 2, 3] }, // Different property name
    ];

    testCases.forEach((testCase, index) => {
      const result = safeArray(testCase);
      expect(Array.isArray(result)).toBe(true);
      console.log(`Test case ${index}: ${JSON.stringify(testCase)} -> ${JSON.stringify(result)}`);
    });
  });

  test('Frontend State Edge Cases', () => {
    // Simulate various frontend state scenarios
    const stateScenarios = [
      { legalCases: null },
      { legalCases: undefined },
      { legalCases: [] },
      { legalCases: [1, 2, 3] },
      { legalCases: {} },
      { legalCases: 'invalid' },
      { templates: null },
      { templates: undefined },
      { templates: [] },
      { templates: [{ id: 1, name: 'test' }] },
    ];

    stateScenarios.forEach((scenario, index) => {
      const legalCases = safeArray(scenario.legalCases);
      const templates = safeArray(scenario.templates);
      
      expect(Array.isArray(legalCases)).toBe(true);
      expect(Array.isArray(templates)).toBe(true);
      
      console.log(`State scenario ${index}: legalCases=${legalCases.length}, templates=${templates.length}`);
    });
  });
});

