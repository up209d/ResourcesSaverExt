import { getReducerConfig } from '../utils';

export const STATE_KEY = `option`;

export const ACTIONS = {
  SET_IGNORE_NO_CONTENT_FILE: 'SET_IGNORE_NO_CONTENT_FILE',
  SET_BEAUTIFY_FILE: 'SET_BEAUTIFY_FILE',
};

export const INITIAL_STATE = {
  ignoreNoContentFile: false,
  beautifyFile: false,
};

export const setIgnoreNoContentFile = (willIgnore) => ({
  type: ACTIONS.SET_IGNORE_NO_CONTENT_FILE,
  payload: !!willIgnore,
});

export const setBeautifyFile = (willBeautify) => ({
  type: ACTIONS.SET_BEAUTIFY_FILE,
  payload: !!willBeautify,
});

export const uiReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.SET_IGNORE_NO_CONTENT_FILE: {
      return {
        ...state,
        ignoreNoContentFile: action.payload,
      };
    }
    case ACTIONS.SET_BEAUTIFY_FILE: {
      return {
        ...state,
        beautifyFile: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default getReducerConfig(STATE_KEY, uiReducer);
