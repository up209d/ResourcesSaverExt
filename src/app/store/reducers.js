import uiReducerConfig from './ui';
import staticResourceReducerConfig from './staticResource';
import networkResourceReducerConfig from './networkResource';
import downloadListReducerConfig from './downloadList';

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
  ...uiReducerConfig,
  ...staticResourceReducerConfig,
  ...networkResourceReducerConfig,
  ...downloadListReducerConfig,
});

export const appInitialState = {
  ...appReducers({}, {}),
};

export default appReducers;
