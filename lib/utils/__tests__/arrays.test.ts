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
    type PersonLike = {
      id?: string;
      name: string;
    };

    const items: PersonLike[] = [
      { id: '1', name: 'Alice' },
      { name: 'Bob No ID' },
      { id: undefined, name: 'Charlie Undefined ID' },
    ];
    
    const result = uniqueBy(items, (item) => item.id);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob No ID');
    expect(result[2].name).toBe('Charlie Undefined ID');
  });

  it('handles empty arrays', () => {
    expect(uniqueBy([], (i) => i)).toEqual([]);
  });
});
