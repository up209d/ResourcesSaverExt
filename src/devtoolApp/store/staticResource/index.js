import { generateManageActions, generateManageReducer, getReducerConfig } from '../utils';

export const STATE_KEY = `staticResource`;

const ACTION = `STATIC_RESOURCE_ACTION`;
const KEY = `url`;

export const { add: addStaticResource, remove: removeStaticResource, reset: resetStaticResource } = generateManageActions(ACTION, KEY);

export const staticResourceReducer = generateManageReducer(ACTION, KEY);

export default getReducerConfig(STATE_KEY, staticResourceReducer);