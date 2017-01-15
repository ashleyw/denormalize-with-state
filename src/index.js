/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-use-before-define: 0 */

import { denormalize } from 'denormalizr';


function mergeMappings(entity, mapObj) {
  if (!mapObj) return entity;

  if (typeof mapObj === 'function') {
    return mapObj(entity);
  }

  if (Object.keys(mapObj).includes('id')) {
    return Object.assign({}, entity, mapObj);
  }

  return Object.assign({}, mapObj[entity.id], entity);
}


function iterateOverObject(object, mappings) {
  if (mappings === {}) return object;
  const mappingsKeys = Object.keys(mappings || {});

  Object.keys(object).forEach((key) => {
    const isArray = Array.isArray(object[key]);

    if (mappingsKeys.includes(key)) {
      if (isArray) {
        object[key] = object[key].map(item => mergeMappings(item, mappings[key]));
      } else {
        object[key] = mergeMappings(object[key], mappings[key]);
      }
    }

    if (isArray) {
      object[key] = iterateOverObject(object[key], mappings);
    } else if (typeof object[key] === 'object') {
      object[key] = iterateOverObject(object[key], mappings);
    }
  });

  return object;
}


export default (entity, entities, schema, mappings) => {
  const entityKeys = Object.keys(entity);

  // entity ~ { id: 1, isLoading: false }
  if (typeof entity === 'object' && entityKeys.includes('id')) {
    let state = denormalize(entity.id, entities, schema);
    state = iterateOverObject(state, mappings);
    state = mergeMappings(state, entity);
    return mappings ? mergeMappings(state, mappings[schema._key]) : state;

  // entity ~ [1, 2]
  } else if (Array.isArray(entity) && (typeof entity[0] === 'number' || typeof entity[0] === 'string')) {
    let state = denormalize(entity, entities, schema);
    state = iterateOverObject(state, mappings);

    if (mappings && schema._itemSchema._key in mappings) {
      return state.map(item => mergeMappings(item, mappings[schema._itemSchema._key]));
    }

    return state.map((item) => {
      item = mergeMappings(item, entity.find(i => i === item.id));
      return mappings ? mergeMappings(item, mappings[schema._itemSchema._key]) : item;
    });

  // entity ~ { 1: { isLoading: false } }
  } else if (typeof entity === 'object') {
    let state = denormalize(entityKeys.map(id => id), entities, schema);
    state = iterateOverObject(state, mappings);
    return state.map(item => mergeMappings(entity[item.id], item));

  // entity ~ 1
  } else if (typeof entity === 'number' || typeof entity === 'string') {
    let state = denormalize(entity, entities, schema);
    state = iterateOverObject(state, mappings);
    return mappings ? mergeMappings(state, mappings[schema._key]) : state;
  }

  // fall back to plain old denormalize
  return denormalize(entity, entities, schema);
};
