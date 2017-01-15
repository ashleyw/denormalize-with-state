import { expect } from 'chai';
import { postSchema, normalizedData } from '../data';
import denormalizeWithState from '../../src/index';
import state from './_state';

describe('entity = 1', () => {
  it('should merge in data', () => {
    const postSingle = denormalizeWithState(1, normalizedData.entities, postSchema, {
      posts: state.Post.view.result,
      comments: state.Comment.list.result,
      author: state.Author.list.result,
      contact: state.Contact.list.result,
    });

    expect(postSingle).to.deep.equal({
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
              name: 'The one',
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
    });
  });

  it('should not override entity data', () => {
    state.Post.view.result.title = 'NOT THIS TITLE';
    const postSingle = denormalizeWithState(1, normalizedData.entities, postSchema, {
      posts: state.Post.view.result,
      comments: state.Comment.list.result,
      author: state.Author.list.result,
    });

    expect(postSingle.title).to.not.equal(state.Post.view.result.title);
  });

  it('should allow function to be passed as mapping', () => {
    const postSingle = denormalizeWithState(1, normalizedData.entities, postSchema, {
      posts: state.Post.view.result,
      comments: state.Comment.list.result,
      author: state.Author.list.result,
      contact: contact => ({ ...contact, email: contact.email.toUpperCase() }),
    });

    expect(postSingle).to.deep.equal({
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
              email: 'HELLO@ABC.COM',
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
    });
  });
});
