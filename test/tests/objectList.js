import { expect } from 'chai';
import { postListSchema, normalizedData } from '../data';
import denormalizeWithState from '../../src/index';
import state from './_state';

describe('entity = { 1: { isLoading: false } }', () => {
  it('should merge in data', () => {
    const postList = denormalizeWithState(state.Post.list.result, normalizedData.entities, postListSchema, {
      posts: state.Post.list.result,
      comments: state.Comment.list.result,
      author: state.Author.list.result,
    });

    expect(postList).to.deep.equal(
      [
        {
          id: 1,
          title: 'post A',
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
          isLoading: false,
          tag: 'cool',
        },
        {
          id: 2,
          title: 'post B',
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
          isLoading: true,
          tag: 'super',
        },
      ],
      );
  });

  it('without listing root in mappings', () => {
    const postList = denormalizeWithState(state.Post.list.result, normalizedData.entities, postListSchema, {
      comments: state.Comment.list.result,
      author: state.Author.list.result,
    });

    expect(postList).to.deep.equal(
      [
        {
          id: 1,
          title: 'post A',
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
          isLoading: false,
          tag: 'cool',
        },
        {
          id: 2,
          title: 'post B',
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
          isLoading: true,
          tag: 'super',
        },
      ],
    );
  });

  it('with no state map', () => {
    const postList = denormalizeWithState(state.Post.list.result, normalizedData.entities, postListSchema);
    expect(postList).to.deep.equal([
      {
        id: 1,
        title: 'post A',
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
          },
          {
            id: 2,
            text: 'comment B',
            author: {
              id: 2,
              text: "author B's message",
            },
          },
        ],
        isLoading: false,
        tag: 'cool',
      },
      {
        id: 2,
        title: 'post B',
        comments: [
          {
            id: 3,
            text: 'comment C',
            author: {
              id: 3,
              text: "author C's message",
            },
          },
          {
            id: 4,
            text: 'comment D',
            author: {
              id: 4,
              text: "author D's message",
            },
          },
        ],
        isLoading: true,
        tag: 'super',
      },
    ]);
  });
});
