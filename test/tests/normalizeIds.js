import { expect } from 'chai';
import { denormalize } from 'denormalizr';
import { postSchema, normalizedData } from '../data';
import { normalizeIds } from '../../src/index';
import state from '../state';

describe('normalizeIds', () => {
  it('should override entity data', () => {
    const normalized = normalizeIds([2, 3, 1], { isLoading: false });
    expect(normalized).to.deep.equal({
      1: { _order: 3, isLoading: false },
      2: { _order: 1, isLoading: false },
      3: { _order: 2, isLoading: false },
    });
  });
});
