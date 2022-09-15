import uiReducerConfig from './ui';
import optionReducerConfig from './option';
import staticResourceReducerConfig from './staticResource';
import networkResourceReducerConfig from './networkResource';
import downloadListReducerConfig from './downloadList';
import downloadLogReducerConfig from './downloadLog';

const combineReducers = (reducers) => {
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
  ...optionReducerConfig,
  ...staticResourceReducerConfig,
  ...networkResourceReducerConfig,
  ...downloadListReducerConfig,
  ...downloadLogReducerConfig,
});

export const appInitialState = {
  ...appReducers({}, {}),
};

export default appReducers;
