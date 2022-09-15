import { generateManageActions, generateManageReducer, getReducerConfig } from '../utils';

const ACTION = `NETWORK_RESOURCE_ACTION`;
const KEY = `url`;

export const STATE_KEY = `networkResource`;

export const {
  add: addNetworkResource,
  remove: removeNetworkResource,
  reset: resetNetworkResource,
} = generateManageActions(ACTION, KEY);

export const networkResourceReducer = generateManageReducer(ACTION, KEY);

export default getReducerConfig(STATE_KEY, networkResourceReducer);
