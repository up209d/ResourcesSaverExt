export const helloAgain = message => ({
  type: `TEST`,
  payload: message || `again`,
});

export const helloThunk = message => (dispatch, getState) => {
  const { testReducer } = getState();
  dispatch({
    type: `TEST`,
    payload: `${testReducer.hello} and ${message}`
  })
};

export const testReducer = (state = { hello: 'world' }, action) => {
  switch (action.type) {
    case `TEST`: {
      return {
        ...state,
        hello: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};
