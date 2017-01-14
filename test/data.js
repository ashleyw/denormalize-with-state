import { normalize, Schema, arrayOf } from 'normalizr';

export const postSchema = new Schema('posts');
export const postListSchema = arrayOf(postSchema);
export const commentSchema = new Schema('comments');
export const authorSchema = new Schema('author');
commentSchema.define({
  author: authorSchema,
});
postSchema.define({
  comments: arrayOf(commentSchema),
});


export const normalizedData = normalize([
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
  },
], arrayOf(postSchema));
