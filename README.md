# denormalize-with-state [![Build Status](https://travis-ci.org/ashleyw/denormalize-with-state.svg?branch=master)](https://travis-ci.org/ashleyw/denormalize-with-state)

**denormalize-with-state** takes data denormalized by [denormalizr](https://github.com/gpbl/denormalizr) and merges in extra state.

## Use cases
- Merging in local state *(e.g. `isLoading` flags)*
- Optimistic updates of attributes *(an attribute in the mapping state will override entity attributes)*

## Install

```
npm install denormalize-with-state --save
```

## Example

```js
import { normalize, Schema, arrayOf } from 'normalizr';
import denormalizeWithState from 'denormalize-with-state';

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


### denormalizeWithState

```
(entity, entities, schema, mappings) -> Object | Array<Object>
```

### Params

**entity** `{Object | Array<Object | Number | String> | number | string}`

> The entity to denormalize, its id, or an array of entities or ids.

> Lists should be an object with the keys being the IDs and values being the local state.

**entities** `{Object}`

> An object to entities used to denormalize entity and its referred entities.

**entitySchema** `{Schema}`

> The normalizr Schema used to define `entity`.

**mappings** `{Object}`

> An object to map entity relationships to state.

> The object's keys should map to normalizr schemas, and the values should either be an object with the keys being the IDs and values being the local state, or an object with an `id` attribute.

**Returns** `{Object | Array}`

> The denormalized object, or an array of denormalized objects.

---

### normalizeIds

```
(ids, initalState = {}, initalIndex = 0) -> Object
```

### Params

**ids** `{Array<Integer | String>}`

> The list of ids.

**initalState** `{Object}`

> An optional object to initalize state for each entity.

**initalIndex** `{Integer}`

> The inital index to count from. Useful when appending results.

**Returns** `{Object}`

> The normalized object. For example, with `normalizeIds([2, 1], { isLoading: false })`:

    {
      1: { isLoading: false, _order: 2 },
      2: { isLoading: false, _order: 1 }
    }
---

### updateEntity

```
(state, id, newState) -> Object
```

### Params

**state** `{Object}`

> The state as returned from `normalizeIds`.

**id** `{Integer | String}`

> The ID of the entity to be updated.

**newState** `{Object}`

> Attributes to be updated in the entity's state.

**Returns** `{Object}`

> The normalized object. For example, following on from the example above of `normalizeIds`, calling `updateEntity(state, 2, { isLoading: true })` would return:

    {
      1: { isLoading: false, _order: 2 },
      2: { isLoading: true, _order: 1 }
    }
