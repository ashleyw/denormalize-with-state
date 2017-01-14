# denormalize-with-state [![Build Status](https://travis-ci.org/ashleyw/denormalize-with-state.svg?branch=master)](https://travis-ci.org/ashleyw/denormalize-with-state)

**denormalize-with-state** takes data denormalized by [denormalizr](https://github.com/gpbl/denormalizr) and merges in extra state.

While denormalizr is great at reassembling entities, sometimes you want to merge in local state (i.e. `isLoading` flags)

```
npm install denormalize-with-state --save
```

```js
import { normalize, Schema, arrayOf } from 'normalizr';
import { denormalizeWithState } from 'denormalize-with-state';

export const postSchema = new Schema('posts');
export const postListSchema = arrayOf(postSchema);
export const commentSchema = new Schema('comments');
export const authorSchema = new Schema('author');
export const contactSchema = new Schema('contact');

authorSchema.define({
  contact: contactSchema,
});

commentSchema.define({
  author: authorSchema,
});

postSchema.define({
  comments: arrayOf(commentSchema),
});


eexport const entities = {
  posts: {
    1: {
      id: 1,
      title: 'post A',
      comments: [1, 2],
    },
    2: {
      id: 2,
      title: 'post B',
      comments: [3, 4],
    },
  },
  comments: {
    1: { id: 1, text: 'comment A', author: 1 },
    2: { id: 2, text: 'comment B', author: 2 },
    3: { id: 3, text: 'comment C', author: 3 },
    4: { id: 4, text: 'comment D', author: 4 },
  },
  author: {
    1: { id: 1, text: "author A's message", contact: 1 },
    2: { id: 2, text: "author B's message" },
    3: { id: 3, text: "author C's message" },
    4: { id: 4, text: "author D's message" },
  },
  contact: {
    1: { id: 1, email: 'hello@abc.com' },
  },
};


const state = {
  Post: {
    list: {
      result: {
        1: { isLoading: false, tag: 'cool' },
        2: { isLoading: true, tag: 'super' },
      },
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
      result: {
        1: { isLoading: false },
        2: { isLoading: true },
      },
    },
  },
  Author: {
    list: {
      result: {
        3: { name: 'cool author C' },
        4: { name: 'cool author D' },
      },
    },
  },
  Contact: {
    list: {
      result: {
        1: { name: 'The one' },
      },
    },
  },
};


const posts = denormalizeWithState(state.Post.list.result, entities, postListSchema, {
  posts: state.Post.list.result,
  comments: state.Comment.list.result,
  author: state.Author.list.result,
  contact: contact => ({ ...contact, email: contact.email.toUpperCase() }),
});

console.log(JSON.stringify(posts, null, 2));
// [
//   {
//     "isLoading": false,
//     "tag": "cool",
//     "id": 1,
//     "title": "post A",
//     "comments": [
//       {
//         "isLoading": false,
//         "id": 1,
//         "text": "comment A",
//         "author": {
//           "id": 1,
//           "text": "author A's message",
//           "contact": {
//             "id": 1,
//             "email": "HELLO@ABC.COM"
//           }
//         }
//       },
//       {
//         "isLoading": true,
//         "id": 2,
//         "text": "comment B",
//         "author": {
//           "id": 2,
//           "text": "author B's message"
//         }
//       }
//     ]
//   },
//   {
//     "isLoading": true,
//     "tag": "super",
//     "id": 2,
//     "title": "post B",
//     "comments": [
//       {
//         "id": 3,
//         "text": "comment C",
//         "author": {
//           "name": "cool author C",
//           "id": 3,
//           "text": "author C's message"
//         }
//       },
//       {
//         "id": 4,
//         "text": "comment D",
//         "author": {
//           "name": "cool author D",
//           "id": 4,
//           "text": "author D's message"
//         }
//       }
//     ]
//   }
// ]
```

## API

```
denormalize (entity, entities, schema, mappings) -> Object|Array
```

### Params

**entity** `{Object|Array|Number|String}`

> The entity to denormalize, its id, or an array of entities or ids.

**entities** `{Object}`

> An object to entities used to denormalize entity and its referred entities.

**entitySchema** `{Schema}`

> The normalizr Schema used to define `entity`.

**mappings** `{Object}`

> An object to map entity relationships to state.

### Returns

The denormalized object, or an array of denormalized objects.
