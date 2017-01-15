import { expect } from 'chai';
import { postSchema, normalizedData } from '../data';
import denormalizeWithState from '../../src/index';
import state from './_state';

describe('entity = { id: 1, isLoading: false }', () => {
  it('should allow function to be passed as mapping', () => {
    const postSingle = denormalizeWithState(state.Post.view.result, normalizedData.entities, postSchema, {
      posts: state.Post.view.result,
      comments: state.Comment.list.result,
    });

    expect(postSingle).to.deep.equal({
      id: 1,
      tag: 'super cool',
      title: 'post A',
      comments: [
        {
          id: 1,
          text: 'comment A',
          isLoading: false,
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
          isLoading: true,
          author: {
            id: 2,
            text: "author B's message",
          },
        },
      ],
    });
  });

  it('without listing root in mappings', () => {
    const postList = denormalizeWithState(state.Post.view.result, normalizedData.entities, postSchema, {
      comments: state.Comment.list.result,
      author: state.Author.list.result,
    });

    expect(postList).to.deep.equal(
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
        tag: 'super cool',
      },
    );
  });

  it('should allow function to be passed as mapping for root', () => {
    const postSingle = denormalizeWithState(state.Post.view.result, normalizedData.entities, postSchema, {
      posts: post => ({ ...post, title: post.title.toUpperCase() }),
    });

    expect(postSingle).to.deep.equal({
      id: 1,
      title: 'POST A',
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
      tag: 'super cool',
    });
  });
});
