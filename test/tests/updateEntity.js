import { expect } from 'chai';
import { denormalize } from 'denormalizr';
import { postSchema, normalizedData } from '../data';
import { normalizeIds, updateEntity } from '../../src/index';
import state from '../state';

describe('updateEntity', () => {
  it('should update entity', () => {
    const normalizedState = normalizeIds([2, 3, 1], { isLoading: false });
    let newState = updateEntity(normalizedState, 3, {
      isLoading: true,
      coolNewAttribute: 'yes!',
    });
    newState = updateEntity(newState, 2, {
      isLoading: null,
      coolNewAttribute: 'mabes!',
    });
    expect(newState).to.deep.equal({
      1: { _order: 3, isLoading: false },
      2: { _order: 1, isLoading: null, coolNewAttribute: 'mabes!' },
      3: { _order: 2, isLoading: true, coolNewAttribute: 'yes!' },
    });
  });
});
