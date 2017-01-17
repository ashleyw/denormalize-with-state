import { expect } from 'chai';
import { postSchema, normalizedData } from '../data';
import denormalizeWithState from '../../src/index';
import state from '../state';

describe('entity = null', () => {
  it('should return null', () => {
    const output = denormalizeWithState(null, normalizedData.entities, postSchema, {
      posts: state.Post.view.result,
      comments: state.Comment.list.result,
      author: state.Author.list.result,
      contact: state.Contact.list.result,
    });

    expect(output).to.equal(null);
  });

  it('should not complain at null values', () => {
    const newNormalized = JSON.parse(JSON.stringify(normalizedData.entities));
    newNormalized.posts['1'].comments = null;
    const output = denormalizeWithState(null, newNormalized, postSchema, {});
    expect(output).to.equal(null);
  });
});
