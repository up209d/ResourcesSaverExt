import { generateManageActions, generateManageReducer } from '../utils';

const ACTION = `STATIC_RESOURCE_ACTION`;
const KEY = `url`;

export const { add: addStaticResource, remove: removeStaticResource, reset: resetStaticResource } = generateManageActions(ACTION, KEY);

export const staticResourceReducer = generateManageReducer(ACTION, KEY);
