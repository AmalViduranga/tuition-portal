import { describe, it, expect } from 'vitest';
import { uniqueBy } from '../arrays';

describe('uniqueBy', () => {
  it('returns unique items based on the provided key getter', () => {
    const items = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '1', name: 'Alice Duplicate' },
    ];
    const result = uniqueBy(items, (item) => item.id);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('includes items with missing or undefined keys', () => {
    const items = [
      { id: '1', name: 'Alice' },
      { name: 'Bob No ID' },
      { id: undefined, name: 'Charlie Undefined ID' },
    ] as any[];
    
    const result = uniqueBy(items, (item) => item.id);
    expect(result).toHaveLength(3);
  });

  it('handles empty arrays', () => {
    expect(uniqueBy([], (i) => i)).toEqual([]);
  });
});
