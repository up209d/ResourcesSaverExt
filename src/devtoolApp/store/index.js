import { useReducer, useMemo, createContext } from 'react';
import { appReducers, appInitialState } from './reducers';

export const StoreContext = createContext(null);

export const useStore = () => {
  const [state, dispatch] = useReducer(appReducers, appInitialState, () => appInitialState);
  const thunkDispatch = useMemo(
    () => action => {
      if (typeof action === `function`) {
        return action(dispatch, () => state); // dispatch & getAllState
      } else {
        return dispatch(action);
      }
    },
    [dispatch]
  );
  window.debugState = state;
  return [state, thunkDispatch, { state, dispatch: thunkDispatch }];
};

export default useStore;
