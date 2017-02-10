export const normalizeIds = (ids, initalState = {}, count = 0) => (ids || []).reduce((obj, id, index) => {
  obj[id] = { ...initalState, _order: count + index + 1 };
  return obj;
}, {});
