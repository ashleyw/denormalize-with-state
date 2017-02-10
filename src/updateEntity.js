export const updateEntity = (state, id, newState) => ({
  ...state,
  [id]: {
    ...state[id],
    ...newState,
  },
});
