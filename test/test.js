import { expect } from 'chai';
import { denormalize } from 'denormalizr';
import { postSchema, postListSchema, normalizedData } from './data';
import { denormalizeWithState } from '../src/index';

const state = {
  Post: {
    list: {
      result: [
        { id: 1, isLoading: false, tag: 'cool' },
        { id: 2, isLoading: true, tag: 'super' },
      ],
    },
    view: {
      result: {
        id: 1,
        tag: 'super cool',
      },
    },
  },
  Comment: {
    list: {
      result: [
        { id: 1, isLoading: false },
        { id: 2, isLoading: true },
      ],
    },
  },
  Author: {
    list: {
      result: [
        { id: 3, name: 'cool author C' },
        { id: 4, name: 'cool author D' },
      ],
    },
  },
  Contact: {
    list: {
      result: [
        { id: 1, name: 'The one' },
      ],
    },
  },
};

describe('denormalizeWithState', () => {
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
  });

  describe('entity = 1', () => {
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

    it('should not override entity data', () => {
      state.Post.view.result.title = 'NOT THIS TITLE';
      const postSingle = denormalizeWithState(1, normalizedData.entities, postSchema, {
        posts: state.Post.view.result,
        comments: state.Comment.list.result,
        author: state.Author.list.result,
      });

      expect(postSingle.title).to.not.equal(state.Post.view.result.title);
    });
  });

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
  });

  describe('entity = [{ id: 1, isLoading: false }]', () => {
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
  });

  describe('entity = [{ id: 1, isLoading: false }], without listing root in mappings', () => {
    it('should merge in data', () => {
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
  });

  describe('entity = { id: 1, isLoading: false }, without listing root in mappings', () => {
    it('should merge in data', () => {
      const postList = denormalizeWithState(state.Post.list.result[0], normalizedData.entities, postSchema, {
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
          isLoading: false,
          tag: 'cool',
        },
      );
    });
  });

  describe('entity = [1, 2], with no state map', () => {
    it('should merge in data', () => {
      const postListA = denormalizeWithState([1, 2], normalizedData.entities, postListSchema);
      const postListB = denormalize(state.Post.list.result.map(t => t.id), normalizedData.entities, postListSchema);
      expect(postListA).to.deep.equal(postListB);
    });
  });

  describe('entity = [{ id: 1, isLoading: false }], with no state map', () => {
    it('should merge in data', () => {
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
});
