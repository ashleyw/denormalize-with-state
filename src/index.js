// @flow
/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-use-before-define: 0 */

import { denormalize } from 'denormalizr';
import clone from 'clone-deep';

type Entity = Object | Array<Object | Number | String> | number | string;
type Denormalized = Object | Array<Object> | null;

function mergeMappings(entity, mapObj) : Object {
  if (!mapObj) {
    return entity;
  }

  if (typeof mapObj === 'function') {
    return mapObj(clone(entity));
  }

  if (typeof entity === 'object') {
    if (!Array.isArray(entity) && Object.keys(mapObj).includes('id')) {
      return Object.assign({}, entity, mapObj);
    }

    return Object.assign({}, mapObj[entity.id], entity);
  }

  return entity;
}


function iterateOverObject(object, mappings) : Object {
  if (!object || mappings === {}) return object;
  const mappingsKeys = Object.keys(mappings || {});

  return Object.keys(object).reduce((newObject, key) => {
    const isArray = Array.isArray(newObject[key]);

    if (mappingsKeys.includes(key)) {
      if (isArray) {
        newObject[key] = newObject[key].map(item => mergeMappings(item, mappings[key]));
      } else {
        newObject[key] = mergeMappings(newObject[key], mappings[key]);
      }
    }

    if (isArray || typeof newObject[key] === 'object') {
      newObject[key] = iterateOverObject(newObject[key], mappings);
    }

    return newObject;
  }, clone(object));
}


export default (entity: Entity, entities: Object, schema: Object, mappings: Object) : Denormalized => {
  if (entity === null) return null;

  // entity ~ 1 or "abc"
  if (typeof entity === 'number' || typeof entity === 'string') {
    let state = denormalize(entity, entities, schema);
    state = iterateOverObject(state, mappings);
    return mappings ? mergeMappings(state, mappings[schema._key]) : state;
  } else if (typeof entity === 'object') {
    //
    // entity ~ [1, "abc"]
    if (Array.isArray(entity)) {
      if (typeof entity[0] === 'number' || typeof entity[0] === 'string') {
        let state = denormalize(entity, entities, schema);
        state = iterateOverObject(state, mappings);

        if (mappings && schema._itemSchema._key in mappings) {
          return state.map(item => mergeMappings(item, mappings[schema._itemSchema._key]));
        }

        return state.map((item) => {
          if (!item || typeof item !== 'object') return null;
          item = mergeMappings(item, entity.find(i => i === item.id));
          return mappings ? mergeMappings(item, mappings[schema._itemSchema._key]) : item;
        });
      }
    } else {
      const entityKeys = Object.keys(entity);

      // entity ~ { id: 1, isLoading: false }
      if (entityKeys.includes('id')) {
        let state = denormalize(entity.id, entities, schema);
        state = iterateOverObject(state, mappings);
        state = mergeMappings(state, entity);
        return mappings ? mergeMappings(state, mappings[schema._key]) : state;
      }

      // entity ~ { 1: { isLoading: false } }
      let state = denormalize(entityKeys.map(id => id), entities, schema);
      state = iterateOverObject(state, mappings);
      return state.map((item) => {
        if (!item || !item.id) {
          return null;
        }
        return mergeMappings(entity[item.id], item);
      });
    }
  }

  // fall back to plain old denormalize
  return denormalize(entity, entities, schema);
};
