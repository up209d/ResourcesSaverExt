export const resolveURLToPath = (cUrl, cType, cContent) => {
  let filepath, filename, isDataURI;
  let foundIndex = cUrl.search(/:\/\//);
  // Check the url whether it is a link or a string of text data
  if (foundIndex === -1 || foundIndex >= 10) {
    isDataURI = true;
    console.log('Data URI Detected!!!!!');
    // Data URI
    if (cUrl.indexOf('data:') === 0) {
      let dataURIInfo = cUrl
        .split(';')[0]
        .split(',')[0]
        .substring(0, 30)
        .replace(/[^A-Za-z0-9]/g, '.');
      // console.log('=====> ',dataURIInfo);
      filename =
        dataURIInfo +
        '.' +
        Math.random()
          .toString(16)
          .substring(2) +
        '.txt';
    } else {
      filename =
        'data.' +
        Math.random()
          .toString(16)
          .substring(2) +
        '.txt';
    }
    filepath = '_DataURI/' + filename;
  } else {
    isDataURI = false;
    if (cUrl.split('://')[0].includes('http')) {
      // For http:// https://
      filepath = cUrl.split('://')[1].split('?')[0];
    } else {
      // For webpack:// ng:// ftp:// will be webpack--- ng--- ftp---
      filepath = cUrl.replace('://', '---').split('?')[0];
    }
    if (filepath.charAt(filepath.length - 1) === '/') {
      filepath = filepath + 'index.html';
    }
    filename = filepath.substring(filepath.lastIndexOf('/') + 1);
  }

  // Get Rid of QueryString after ;
  filename = filename.split(';')[0];
  filepath = filepath.substring(0, filepath.lastIndexOf('/') + 1) + filename;

  const noExtension = filename.search(/\./) === -1;
  // Add default extension to non extension filename
  if (noExtension) {
    let haveExtension = null;
    if (cType && cContent) {
      // Special Case for Images with Base64
      if (cType.indexOf('image') !== -1) {
        if (cContent.charAt(0) === '/') {
          filepath = filepath + '.jpg';
          haveExtension = 'jpg';
        }
        if (cContent.charAt(0) === 'R') {
          filepath = filepath + '.gif';
          haveExtension = 'gif';
        }
        if (cContent.charAt(0) === 'i') {
          filepath = filepath + '.png';
          haveExtension = 'png';
        }
        if (cContent.charAt(0) === 'U') {
          filepath = filepath + '.webp';
          haveExtension = 'webp';
        }
      }
      // Stylesheet | CSS
      if (cType.indexOf('stylesheet') !== -1 || cType.indexOf('css') !== -1) {
        filepath = filepath + '.css';
        haveExtension = 'css';
      }
      // JSON
      if (cType.indexOf('json') !== -1) {
        filepath = filepath + '.json';
        haveExtension = 'json';
      }
      // Javascript
      if (cType.indexOf('javascript') !== -1) {
        filepath = filepath + '.js';
        haveExtension = 'js';
      }
      // HTML
      if (cType.indexOf('html') !== -1) {
        filepath = filepath + '.html';
        haveExtension = 'html';
      }

      if (!haveExtension) {
        filepath = filepath + '.html';
        haveExtension = 'html';
      }
    } else {
      // Add default html for text document
      filepath = filepath + '.html';
      haveExtension = 'html';
    }
    console.log('File without extension: ', filename, 'Will process as: ', filename + '.' + haveExtension, filepath);
    filename = filename + '.' + haveExtension;
  }

  // Remove path violation case
  filepath = filepath
    .replace(/:|\\|=|\*|\.$|"|'|\?|~|\||<|>/g, '')
    .replace(/\/\//g, '/')
    .replace(/(\s|\.)\//g, '/')
    .replace(/\/(\s|\.)/g, '/');

  filename = filename.replace(/:|\\|=|\*|\.$|"|'|\?|~|\||<|>/g, '');

  // Decode URI
  if (filepath.indexOf('%') !== -1) {
    try {
      filepath = decodeURIComponent(filepath);
      filename = decodeURIComponent(filename);
    } catch (err) {
      console.log(err);
    }
  }

  // Strip double slashes ---
  while (filepath.includes('//')) {
    filepath = filepath.replace('//', '/');
  }

  // Strip the first slash '/src/...' -> 'src/...'
  if (filepath.charAt(0) === '/') {
    filepath = filepath.slice(1);
  }

  //  console.log('Save to: ', filepath);
  //  console.log('File name: ',filename);

  return {
    path: filepath,
    name: filename,
    dataURI: isDataURI && cUrl,
  };
};

export const resolveDuplicatedResources = (resourceList = []) => {
  const resolvedListByKey = {};
  const result = [];
  resourceList
    .filter(r => r && r.saveAs && r.saveAs.path && r.saveAs.name)
    .sort((rA, rB) => rA.saveAs.path.localeCompare(rB.saveAs.path))
    .forEach(r => resolvedListByKey[r.saveAs.path] = (resolvedListByKey[r.saveAs.path] || []).concat([r]));
  Object.values(resolvedListByKey).forEach(rGroup => {
    result.push(...rGroup.length < 2 ?
      rGroup :
      rGroup
        .map((r, rIndex) => rIndex === 0 ? r : {
          ...r,
          saveAs: {
            ...r.saveAs,
            name: r.saveAs.name.replace(/(\.)(?!.*\.)/g, ` (${rIndex}).`),
            path: r.saveAs.path.replace(/(\.)(?!.*\.)/g, ` (${rIndex}).`),
          },
        }));
  });
  return result;
};


export const downloadCompleteZip = (blobWriter, callback) => {
  blobWriter.close(function(blob) {
    chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function(tab) {
      let url = new URL(tab.url);
      let filename = url.hostname ? url.hostname.replace(/([^A-Za-z0-9.])/g, '_') : 'all';
      let a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename + '.zip';
      a.click();
      callback(true);
    });
  });
};
