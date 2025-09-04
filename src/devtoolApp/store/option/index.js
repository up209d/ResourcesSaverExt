import { getReducerConfig } from '../utils';
import { loadUrlFilterFromStorage, saveUrlFilterToStorage } from 'devtoolApp/utils/general';

export const STATE_KEY = `option`;

export const ACTIONS = {
  SET_IGNORE_NO_CONTENT_FILE: 'SET_IGNORE_NO_CONTENT_FILE',
  SET_BEAUTIFY_FILE: 'SET_BEAUTIFY_FILE',
  SET_URL_FILTER: 'SET_URL_FILTER',
  LOAD_URL_FILTER_FROM_STORAGE: 'LOAD_URL_FILTER_FROM_STORAGE',
};

export const INITIAL_STATE = {
  ignoreNoContentFile: false,
  beautifyFile: false,
  urlFilter: loadUrlFilterFromStorage(), // Load from sessionStorage on initialization
};

export const setIgnoreNoContentFile = (willIgnore) => ({
  type: ACTIONS.SET_IGNORE_NO_CONTENT_FILE,
  payload: !!willIgnore,
});

export const setBeautifyFile = (willBeautify) => ({
  type: ACTIONS.SET_BEAUTIFY_FILE,
  payload: !!willBeautify,
});

export const setUrlFilter = (filter) => {
  const urlFilter = filter || '';
  // Save to sessionStorage when setting URL filter
  saveUrlFilterToStorage(urlFilter);
  
  return {
    type: ACTIONS.SET_URL_FILTER,
    payload: urlFilter,
  };
};

export const loadUrlFilterFromStorageAction = () => ({
  type: ACTIONS.LOAD_URL_FILTER_FROM_STORAGE,
  payload: loadUrlFilterFromStorage(),
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
    case ACTIONS.SET_URL_FILTER:
    case ACTIONS.LOAD_URL_FILTER_FROM_STORAGE: {
      return {
        ...state,
        urlFilter: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default getReducerConfig(STATE_KEY, uiReducer);
