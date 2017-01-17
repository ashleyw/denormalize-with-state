/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-use-before-define: 0 */

import { denormalize } from 'denormalizr';


function mergeMappings(entity, mapObj) {
  if (!mapObj) return entity;

  if (typeof mapObj === 'function') return mapObj(entity);

  if (Object.keys(mapObj).includes('id')) {
    return Object.assign({}, entity, mapObj);
  }

  return Object.assign({}, mapObj[entity.id], entity);
}


function iterateOverObject(object, mappings) {
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
  }, object);
}


export default (entity, entities, schema, mappings) => {
  if (entity === null) return null;
  const entityKeys = Object.keys(entity);

  // entity ~ { id: 1, isLoading: false }
  if (typeof entity === 'object' && entityKeys.includes('id')) {
    let state = denormalize(entity.id, entities, schema);
    state = iterateOverObject(state, mappings);
    state = mergeMappings(state, entity);
    return mappings ? mergeMappings(state, mappings[schema._key]) : state;
  }

  // entity ~ [1, 2]
  if (Array.isArray(entity) && (typeof entity[0] === 'number' || typeof entity[0] === 'string')) {
    let state = denormalize(entity, entities, schema);
    state = iterateOverObject(state, mappings);

    if (mappings && schema._itemSchema._key in mappings) {
      return state.map(item => mergeMappings(item, mappings[schema._itemSchema._key]));
    }

    return state.map((item) => {
      item = mergeMappings(item, entity.find(i => i === item.id));
      return mappings ? mergeMappings(item, mappings[schema._itemSchema._key]) : item;
    });
  }

  // entity ~ { 1: { isLoading: false } }
  if (typeof entity === 'object') {
    let state = denormalize(entityKeys.map(id => id), entities, schema);
    state = iterateOverObject(state, mappings);
    return state.map(item => mergeMappings(entity[item.id], item));
  }

  // entity ~ 1
  if (typeof entity === 'number' || typeof entity === 'string') {
    let state = denormalize(entity, entities, schema);
    state = iterateOverObject(state, mappings);
    return mappings ? mergeMappings(state, mappings[schema._key]) : state;
  }

  // fall back to plain old denormalize
  return denormalize(entity, entities, schema);
};
