import { useReducer, useMemo } from 'react';
import { testReducer } from './test';
import { staticResourceReducer } from './staticResource';
import { networkResourceReducer } from './networkResource';

const combineReducers = reducers => {
  return (state = {}, action) => {
    const newState = {};
    for (let key in reducers) {
      if (reducers.hasOwnProperty(key)) {
        newState[key] = reducers[key](state[key], action);
      }
    }
    return newState;
  };
};

export const appReducers = combineReducers({
  test: testReducer,
  staticResource: staticResourceReducer,
  networkResource: networkResourceReducer,
});

export const appInitialState = {
  ...appReducers({}, {}),
};

export const useStore = () => {
  const [state, dispatch] = useReducer(appReducers, appInitialState, () => appInitialState);
  const store = useMemo(() => {
    return {
      state,
      dispatch: action => {
        if (typeof action === `function`) {
          return action(dispatch, () => state); // dispatch & getState
        } else {
          return dispatch(action);
        }
      },
    };
  }, [state, dispatch]);
  return [store.state, store.dispatch];
};

export default useStore;
