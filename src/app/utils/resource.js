import * as networkResourceActions from 'app/store/networkResource';
import * as staticResourceActions from 'app/store/staticResource';

export const processNetworkResourceToStore = (dispatch, req) => {
  req.getContent((content, encoding) => {
    const uriDataTypeMatches = req.request.url.match(/^data:(?<dataType>.*?);/);
    const uriDataType = uriDataTypeMatches && uriDataTypeMatches.groups && uriDataTypeMatches.groups.dataType;

    const mimeType = req.response && req.response.content && req.response.content.mimeType;

    const contentTypeHeader = req.response && req.response.headers && req.response.headers.find(i => i.name.toLowerCase().includes('content-type'));
    const contentTypeMatches = contentTypeHeader && contentTypeHeader.value && contentTypeHeader.value.match(/^(?<contentType>.*?);/);
    const contentType = contentTypeMatches && contentTypeMatches.groups && contentTypeMatches.groups.contentType;

    dispatch(
      networkResourceActions.addNetworkResource({
        url: req.request.url,
        type: uriDataType || mimeType || contentType,
        content,
        encoding,
        origin: req,
      })
    );
  });
};

export const processStaticResourceToStore = (dispatch, res) => {
  if (!res.url.match(`^(debugger:|chrome-extension:|ws:)`)) {
    res.getContent((content, encoding) => {
      dispatch(
        staticResourceActions.addStaticResource({
          url: res.url,
          type: res.type,
          content,
          encoding,
          origin: res,
        })
      );
    });
  }
}