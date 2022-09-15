import * as networkResourceActions from 'devtoolApp/store/networkResource';
import * as staticResourceActions from 'devtoolApp/store/staticResource';
import { flashStatus } from 'devtoolApp/store/ui';
import { resolveURLToPath } from './file';
import { debounce } from 'lodash';

export const SOURCES = {
  STATIC: 'STATIC',
  NETWORK: 'NETWORD',
};

export const flashStatusDebounced = debounce((dispatch, message, timeout = 1000) => {
  dispatch(flashStatus(message, timeout));
}, 50);

export const processNetworkResourceToStore = (dispatch, req) => {
  flashStatusDebounced(dispatch, `[NETWORK] Processing: ${req && req.request && (req.request.url || `No Url`)}`);
  if (!res.url.match(`^(debugger:|chrome-extension:|ws:)`)) {
    req.getContent((content, encoding) => {
      const uriDataTypeMatches = req.request.url.match(/^data:(?<dataType>.*?);/);
      const uriDataType = uriDataTypeMatches && uriDataTypeMatches.groups && uriDataTypeMatches.groups.dataType;
      const mimeType = req.response && req.response.content && req.response.content.mimeType;
      const contentTypeHeader =
        req.response && req.response.headers && req.response.headers.find(i => i.name.toLowerCase().includes('content-type'));
      const contentTypeMatches =
        contentTypeHeader && contentTypeHeader.value && contentTypeHeader.value.match(/^(?<contentType>.*?);/);
      const contentType = contentTypeMatches && contentTypeMatches.groups && contentTypeMatches.groups.contentType;
      const type = uriDataType || mimeType || contentType;
      dispatch(
        networkResourceActions.addNetworkResource({
          source: SOURCES.NETWORK,
          url: req.request.url,
          type,
          content,
          encoding,
          origin: req,
          saveAs: resolveURLToPath(req.request.url, type, content),
        })
      );
    });
  }
};

export const processStaticResourceToStore = (dispatch, res) => {
  if (!res.url.match(`^(debugger:|chrome-extension:|ws:)`)) {
    flashStatusDebounced(dispatch, `[STATIC] Processing a resource: ${res && (res.url || `No Url`)}`);
    res.getContent((content, encoding) => {
      const meta = {
        source: SOURCES.STATIC,
        url: res.url,
        type: res.type,
        content,
        encoding,
        origin: res,
        saveAs: resolveURLToPath(res.url, res.type, content),
      };
      if (!content) {
        console.debug('No content, will retry 1 more time: ', res.url);
        fetch(res.url)
          .then(retryRequest => {
            if (retryRequest.ok) {
              meta.content = retryRequest.blob();
            } else {
              meta.failed = true;
            }
            dispatch(staticResourceActions.addStaticResource(meta));
          })
          .catch(err => {
            console.error(err);
            meta.failed = true;
            dispatch(staticResourceActions.addStaticResource(meta));
          });
      } else {
        dispatch(staticResourceActions.addStaticResource(meta));
      }
    });
  }
};
