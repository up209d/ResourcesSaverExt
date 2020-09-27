export const MANAGE_ACTION_NAMES = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  RESET: 'RESET',
};

export const generateManageActions = (actionName, key) => {
  return {
    add: item =>
      item && item[key]
        ? {
          type: `${actionName}_${MANAGE_ACTION_NAMES.ADD}`,
          payload: item,
        }
        : {},
    remove: item =>
      item && item[key]
        ? {
          type: `${actionName}_${MANAGE_ACTION_NAMES.REMOVE}`,
          payload: {
            [key]: item[key],
          },
        }
        : {},
    reset: () => ({
      type: `${actionName}_${MANAGE_ACTION_NAMES.RESET}`,
    }),
  };
};

export const generateManageReducer = (actionName, key, initialState = [], options = {}) => (state = initialState, action) => {
  const { type, payload = {} } = action;
  const { payloadMapper, newPayloadMapper, replacePayloadMapper } = options;
  const mappedPayload = payloadMapper ? payloadMapper(payload, state) : payload;
  switch (type) {
    case `${actionName}_${MANAGE_ACTION_NAMES.ADD}`: {
      const index = state.findIndex(item => item[key] === mappedPayload[key]);
      if (index >= 0) {
        // Replace
        return [...state.slice(0, index), { ...replacePayloadMapper ? replacePayloadMapper(mappedPayload, state) : mappedPayload }, ...state.slice(index + 1)];
      } else {
        // Add New
        return [...state, { ...newPayloadMapper ? newPayloadMapper(mappedPayload, state) : mappedPayload }];
      }
    }
    case `${actionName}_${MANAGE_ACTION_NAMES.REMOVE}`: {
      const index = state.findIndex(item => item[key] === mappedPayload[key]);
      if (index >= 0) {
        // Remove
        return [...state.slice(0, index), ...state.slice(index + 1)];
      } else {
        return state;
      }
    }
    case `${actionName}_${MANAGE_ACTION_NAMES.RESET}`: {
      return [];
    }
    default: {
      return state;
    }
  }
};
