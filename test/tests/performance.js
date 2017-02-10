import { expect } from 'chai';
import now from 'performance-now';
import { postSchema, normalizedData } from '../data';
import { denormalizeWithState } from '../../src/index';
import state from '../state';

describe('performance', () => {
  it('should be fast', () => {
    const times = [];
    for (let i = 0; i < 100; i += 1) {
      const start = now();
      const post = denormalizeWithState(state.Post.view.result, normalizedData.entities, postSchema, {
        comments: state.Comment.list.result,
        author: state.Author.list.result,
      });
      times.push(now() - start);
      expect(post.tag).to.equal('super cool');
    }
    const avg = times.reduce((total, time) => total + time) / times.length;

    expect(avg).to.be.below(0.4);
  });
});
