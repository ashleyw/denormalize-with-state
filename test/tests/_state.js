export default {
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
