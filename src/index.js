import { denormalize } from 'denormalizr';

function mergeMappings(a, mapping, key) {
  if (mapping === undefined) {
    return a;
  }
  if (typeof mapping[key] === 'object') {
    if (Object.keys(mapping[key]).includes('id')) {
      return Object.assign({}, mapping[key], a);
    }
    return Object.assign({}, mapping[key][a.id], a);
  } else if (typeof mapping[key] === 'function') {
    return mapping[key](a);
  }
  return Object.assign({}, mapping[key], a);
}

function iterateOverObject(object, keys, mappings) {
  Object.keys(object).forEach((key) => {
    if (keys.includes(key)) {
      if (Array.isArray(object[key])) {
        object[key] = object[key].map(item => mergeMappings(item, mappings, key));
      } else {
        object[key] = mergeMappings(object[key], mappings, key);
      }
    }

    if (Array.isArray(object[key])) {
      object[key] = mergeState(object[key], mappings);
    } else if (typeof object[key] === 'object') {
      object[key] = iterateOverObject(object[key], keys, mappings);
    }
  });
  return object;
}

function mergeState(object, mappings) {
  if (mappings === undefined) return object;
  const keys = Object.keys(mappings);
  if (typeof object === 'object' && !Object.keys(object).includes('id')) {
    return Object.entries(object).map(([_, _entity]) => iterateOverObject(_entity, keys, mappings));
  }
  return iterateOverObject(object, keys, mappings);
}

export const denormalizeWithState = (entity, entities, schema, mappings) => {
  let state;

  // entity ~ { id: 1, isLoading: false }
  if (typeof entity === 'object' && Object.keys(entity).includes('id')) {
    state = mergeState(denormalize(entity.id, entities, schema), mappings);
    state = mergeMappings(state, [entity], 0);

  // entity ~ [1, 2]
  } else if (Array.isArray(entity) && typeof entity[0] === 'number') {
    state = mergeState(denormalize(entity, entities, schema), mappings);

    if (mappings && schema._itemSchema._key in mappings) {
      state = state.map(item => mergeMappings(item, mappings, schema._itemSchema._key));
    } else {
      state = state.map(item => mergeMappings(item, [entity.find(i => i === item.id)], 0));
    }

  // entity ~ { 1: { isLoading: false } }
  } else if (typeof entity === 'object') {
    state = mergeState(denormalize(Object.entries(entity).map(([id]) => id), entities, schema), mappings);
    if (mappings && schema._key in mappings) {
      state = state.map(item => mergeMappings(item, mappings, schema._key));
    } else {
      state = state.map(item => Object.assign({}, entity[item.id], item));
    }

  // entity ~ 1
  } else if (typeof entity === 'number') {
    state = mergeState(denormalize(entity, entities, schema), mappings);
    state = mergeMappings(state, mappings, schema._key);

  // fall back to plain old denormalize
  } else {
    state = denormalize(entity, entities, schema);
  }
  return state;
};
