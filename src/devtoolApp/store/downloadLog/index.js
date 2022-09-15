import { generateManageActions, generateManageReducer, getReducerConfig } from '../utils';

const ACTION = `DOWNLOAD_LOG_ACTION`;
const KEY = `url`;

export const STATE_KEY = `downloadLog`;

export const { add: addLogItem, remove: removeLogItem, replace: replaceLogItem, reset: resetLogList } = generateManageActions(ACTION, KEY);

export const downloadLogReducer = generateManageReducer(ACTION, KEY);

export default getReducerConfig(STATE_KEY, downloadLogReducer);
