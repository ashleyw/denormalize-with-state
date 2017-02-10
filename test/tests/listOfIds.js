import { expect } from 'chai';
import { denormalize } from 'denormalizr';
import { postListSchema, normalizedData } from '../data';
import { denormalizeWithState } from '../../src/index';
import state from '../state';

describe('entity = [1, 2]', () => {
  it('should merge in data', () => {
    const postList = denormalizeWithState([1, 2], normalizedData.entities, postListSchema, {
      posts: state.Post.list.result,
      comments: state.Comment.list.result,
      author: state.Author.list.result,
    });

    expect(postList).to.deep.equal(
      [
        {
          id: 1,
          title: 'post A',
          isLoading: false,
          tag: 'cool',
          comments: [
            {
              id: 1,
              text: 'comment A',
              author: {
                id: 1,
                text: "author A's message",
                contact: {
                  id: 1,
                  email: 'hello@abc.com',
                },
              },
              isLoading: false,
            },
            {
              id: 2,
              text: 'comment B',
              author: {
                id: 2,
                text: "author B's message",
              },
              isLoading: true,
            },
          ],
        },
        {
          id: 2,
          title: 'post B',
          isLoading: true,
          tag: 'super',
          comments: [
            {
              id: 3,
              text: 'comment C',
              author: {
                id: 3,
                text: "author C's message",
                name: 'cool author C',
              },
            },
            {
              id: 4,
              text: 'comment D',
              author: {
                id: 4,
                text: "author D's message",
                name: 'cool author D',
              },
            },
          ],
        },
      ],
      );
  });

  it('with no state map', () => {
    const postListA = denormalizeWithState([1, 2], normalizedData.entities, postListSchema);
    const postListB = denormalize([1, 2], normalizedData.entities, postListSchema);
    expect(postListA).to.deep.equal(postListB);
  });

  it('allows string IDs', () => {
    const newState = {
      Post: {
        list: {
          result: {
            abc: {
              tag: 'awesome',
            },
          },
        },
      },
    };
    const posts = denormalizeWithState(['abc'], normalizedData.entities, postListSchema, {
      posts: newState.Post.list.result,
    });
    expect(posts).to.deep.equal([{
      id: 'abc',
      title: 'post C',
      comments: [],
      tag: 'awesome',
    }]);
  });
});
