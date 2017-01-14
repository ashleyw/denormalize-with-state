import { denormalize } from 'denormalizr';

function mergeMappings(a, mapping, key) {
  if (mapping === undefined) {
    return a;
  }
  if (Array.isArray(mapping[key])) {
    return Object.assign({}, mapping[key].find(b => a.id == b.id), a);
  }
  return Object.assign({}, mapping[key], a);
}

function iterateOverObject(object, keys, mappings) {
  for (const key in object) {
    if (keys.includes(key)) {
      if (Array.isArray(object[key])) {
        object[key] = object[key].map(itemA => mergeMappings(itemA, mappings, key));
      } else {
        object[key] = mergeMappings(object[key], mappings, key);
      }
    }

    if (Array.isArray(object[key])) {
      object[key] = mergeState(object[key], mappings);
    } else if (typeof object[key] === 'object') {
      object[key] = iterateOverObject(object[key], keys, mappings);
    }
  }
  return object;
}

function mergeState(object, mappings) {
  if (mappings === undefined) {
    return object;
  }
  const keys = Object.keys(mappings);
  if (Array.isArray(object)) {
    return object.map(item => iterateOverObject(item, keys, mappings));
  } else {
    return iterateOverObject(object, keys, mappings);
  }
}

export const denormalizeWithState = (entity, entities, schema, mappings) => {
  let state;

  // entity ~ { id: 1, isLoading: false }
  if (!Array.isArray(entity) && typeof entity === 'object') {
    state = mergeState(denormalize(entity.id, entities, schema), mappings);
    state = mergeMappings(state, [entity], 0);

  // entity ~ [{ id: 1, isLoading: false }]
  } else if (Array.isArray(entity) && typeof entity[0] === 'object') {
    state = mergeState(denormalize(entity.map(i => i.id), entities, schema), mappings);
    if (mappings && schema._itemSchema._key in mappings) {
      state = state.map(item => mergeMappings(item, mappings, schema._itemSchema._key));
    } else {
      state = state.map(item => mergeMappings(item, [entity.find(i => i.id == item.id)], 0));
    }

  // entity ~ [1, 2]
  } else if (Array.isArray(entity) && typeof entity[0] === 'number') {
    state = mergeState(denormalize(entity, entities, schema), mappings);

    if (mappings && schema._itemSchema._key in mappings) {
      state = state.map(item => mergeMappings(item, mappings, schema._itemSchema._key));
    } else {
      state = state.map(item => mergeMappings(item, [entity.find(i => i.id == item.id)], 0));
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
