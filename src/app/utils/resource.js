import * as networkResourceActions from 'app/store/networkResource';
import * as staticResourceActions from 'app/store/staticResource';
import { flashStatus } from 'app/store/ui';
import { resolveURLToPath } from './file';
import { debounce } from './general';

const flashStatusDebounced = debounce((dispatch, message, timeout = 1000) => {
  dispatch(flashStatus(message, timeout));
}, 50);

export const processNetworkResourceToStore = (dispatch, req) => {
  flashStatusDebounced(dispatch, `[NETWORK] Processing: ${req && req.request && (req.request.url || `No Url`)}`);
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
        url: req.request.url,
        type,
        content,
        encoding,
        origin: req,
        saveAs: resolveURLToPath(req.request.url, type, content),
      })
    );
  });
};

export const processStaticResourceToStore = (dispatch, res) => {
  if (!res.url.match(`^(debugger:|chrome-extension:|ws:)`)) {
    flashStatusDebounced(dispatch, `[STATIC] Processing a resource: ${res && (res.url || `No Url`)}`);
    res.getContent((content, encoding) => {
      dispatch(
        staticResourceActions.addStaticResource({
          url: res.url,
          type: res.type,
          content,
          encoding,
          origin: res,
          saveAs: resolveURLToPath(res.url, res.type, content),
        })
      );
    });
  }
};
