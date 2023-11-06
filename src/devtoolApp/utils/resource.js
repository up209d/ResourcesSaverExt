import * as networkResourceActions from 'devtoolApp/store/networkResource';
import * as staticResourceActions from 'devtoolApp/store/staticResource';
import { flashStatus } from 'devtoolApp/store/ui';
import { resolveURLToPath } from './url';
import { debounce, logIfDev } from './general';
import * as downloadLogActions from '../store/downloadLog';

export const SOURCES = {
  STATIC: 'STATIC',
  NETWORK: 'NETWORK',
};

export const flashStatusDebounced = debounce((dispatch, message, timeout = 1000) => {
  logIfDev(`[FLASH STATUS]: ${message}`);
  dispatch(flashStatus(message, timeout));
}, 50);

export const processNetworkResourceToStore = (dispatch, res) => {
  // logIfDev('[NETWORK] Resource: ', res);
  flashStatusDebounced(dispatch, `[NETWORK] Processing: ${res.request?.url || `No Url`}`);
  if (res.request?.url && !res.request.url.match(`^(debugger:|chrome-extension:|ws:)`)) {
    res.getContent((content, encoding) => {
      const uriDataTypeMatches = res.request.url.match(/^data:(?<dataType>.*?);/);
      const uriDataType = uriDataTypeMatches?.groups?.dataType;
      const mimeType = res.response?.content?.mimeType;
      const contentTypeHeader = res.response?.headers?.find((i) => i.name.toLowerCase().includes('content-type'));
      const contentTypeMatches = contentTypeHeader?.value?.match(/^(?<contentType>.*?);/);
      const contentType = contentTypeMatches?.groups?.contentType;
      const type = uriDataType || mimeType || contentType;
      dispatch(
        networkResourceActions.addNetworkResource({
          source: SOURCES.NETWORK,
          url: res.request.url,
          type,
          content,
          encoding,
          origin: res,
          saveAs: resolveURLToPath(res.request.url, type, content),
        })
      );
    });
  }
};

export const processStaticResourceToStore = (dispatch, res) => {
  // logIfDev('[STATIC] Resource: ', res);
  if (!res.url.match(`^(debugger:|chrome-extension:|ws:)`)) {
    flashStatusDebounced(dispatch, `[STATIC] Processing a resource: ${res.url || `No Url`}`);
    res.getContent(async (content, encoding) => {
      const meta = {
        source: SOURCES.STATIC,
        url: res.url,
        type: res.type,
        content,
        encoding,
        origin: res,
        saveAs: resolveURLToPath(res.url, res.type, content),
      };
      // If content is a promise
      if (content?.then) {
        try {
          meta.content = await content;
        } catch {
          meta.content = null;
          meta.failed = true;
        }
      }
      if (!meta.content && res.url.startsWith('http')) {
        console.debug(`[STATIC] ${res.url} No content from memory, try to fetch content directly: `, res.url);
        fetch(res.url)
          .then(async (retryRequest) => {
            if (retryRequest.ok) {
              meta.content = await retryRequest.blob();
            } else {
              meta.failed = true;
            }
            dispatch(staticResourceActions.addStaticResource(meta));
          })
          .catch((err) => {
            console.log(`[STATIC]: Error ${res.url}`, err);
            meta.failed = true;
            dispatch(staticResourceActions.addStaticResource(meta));
          });
      } else {
        dispatch(staticResourceActions.addStaticResource(meta));
      }
    });
  }
};

export const logResourceByUrl = (dispatch, url, resources) => {
  console.debug(`[ALL] Now log resource state from url: `, url);
  dispatch(
    downloadLogActions.addLogItem({
      url: url,
      logs: resources.map((i) => ({
        failed: i.failed,
        hasContent: !!i.content,
        url: i.url,
        saveAs: i.saveAs,
      })),
    })
  );
};
