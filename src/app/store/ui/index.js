import { getReducerConfig } from '../utils';

export const STATE_KEY = `ui`;

export const ACTIONS = {
  SET_IS_SAVING: 'SET_IS_SAVING',
  SET_STATUS: 'SET_STATUS',
  SET_TAB: 'SET_TAB',
};

export const INITIAL_STATE = {
  tab: null,
  isSaving: false,
  status: `Idle...`,
};

export const setTab = tab => ({
  type: ACTIONS.SET_TAB,
  payload: tab,
});

export const setIsSaving = isSaving => ({
  type: ACTIONS.SET_IS_SAVING,
  payload: isSaving,
});

export const setStatus = status => ({
  type: ACTIONS.SET_STATUS,
  payload: status,
});

let flashStatusTimeoutHandler = null;
export const flashStatus = (status, timeout = 1000) => (dispatch, getState) => {
  if (status) {
    clearTimeout(flashStatusTimeoutHandler);
    dispatch(setStatus(status));
    flashStatusTimeoutHandler = setTimeout(() => {
      dispatch(setStatus(INITIAL_STATE.status));
    }, timeout);
  }
};

export const uiReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.SET_IS_SAVING: {
      return {
        ...state,
        isSaving: action.payload,
      };
    }
    case ACTIONS.SET_STATUS: {
      return {
        ...state,
        status: action.payload,
      };
    }
    case ACTIONS.SET_TAB: {
      return {
        ...state,
        tab: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default getReducerConfig(STATE_KEY, uiReducer);
