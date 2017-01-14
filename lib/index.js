'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.denormalizeWithState = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _denormalizr = require('denormalizr');

function mergeMappings(a, mapping, key) {
  if (mapping === undefined) {
    return a;
  }
  if (Array.isArray(mapping[key])) {
    return Object.assign({}, mapping[key].find(function (b) {
      return a.id == b.id;
    }), a);
  }
  return Object.assign({}, mapping[key], a);
}

function iterateThroughObject(object, keys, mappings) {
  var _loop = function _loop(key) {
    if (keys.includes(key)) {
      if (Array.isArray(object[key])) {
        object[key] = object[key].map(function (itemA) {
          return mergeMappings(itemA, mappings, key);
        });
      } else {
        object[key] = mergeMappings(object[key], mappings, key);
      }
    }
    if (Array.isArray(object[key])) {
      object[key] = mergeState(object[key], mappings);
    }
  };

  for (var key in object) {
    _loop(key);
  }
  return object;
}

function mergeState(object, mappings) {
  if (mappings === undefined) {
    return object;
  }
  var keys = Object.keys(mappings);
  if (Array.isArray(object)) {
    return object.map(function (item) {
      return iterateThroughObject(item, keys, mappings);
    });
  } else {
    return iterateThroughObject(object, keys, mappings);
  }
}

var denormalizeWithState = exports.denormalizeWithState = function denormalizeWithState(entity, entities, schema, mappings) {
  var state = void 0;

  // entity ~ { id: 1, isLoading: false }
  if (!Array.isArray(entity) && (typeof entity === 'undefined' ? 'undefined' : _typeof(entity)) === 'object') {
    state = mergeState((0, _denormalizr.denormalize)(entity.id, entities, schema), mappings);
    state = mergeMappings(state, [entity], 0);

    // entity ~ [{ id: 1, isLoading: false }]
  } else if (Array.isArray(entity) && _typeof(entity[0]) === 'object') {
    state = mergeState((0, _denormalizr.denormalize)(entity.map(function (i) {
      return i.id;
    }), entities, schema), mappings);
    if (mappings && schema._itemSchema._key in mappings) {
      state = state.map(function (item) {
        return mergeMappings(item, mappings, schema._itemSchema._key);
      });
    } else {
      state = state.map(function (item) {
        return mergeMappings(item, [entity.find(function (i) {
          return i.id == item.id;
        })], 0);
      });
    }

    // entity ~ [1, 2]
  } else if (Array.isArray(entity) && typeof entity[0] === 'number') {
    state = mergeState((0, _denormalizr.denormalize)(entity, entities, schema), mappings);

    if (mappings && schema._itemSchema._key in mappings) {
      state = state.map(function (item) {
        return mergeMappings(item, mappings, schema._itemSchema._key);
      });
    } else {
      state = state.map(function (item) {
        return mergeMappings(item, [entity.find(function (i) {
          return i.id == item.id;
        })], 0);
      });
    }

    // entity ~ 1
  } else if (typeof entity === 'number') {
    state = mergeState((0, _denormalizr.denormalize)(entity, entities, schema), mappings);
    state = mergeMappings(state, mappings, schema._key);

    // fall back to plain old denormalize
  } else {
    state = (0, _denormalizr.denormalize)(entity, entities, schema);
  }
  return state;
};