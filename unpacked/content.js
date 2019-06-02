// Report Table
var reportElement = document.createElement('div');
var reportFailedElement = document.createElement('div');

// Downloading Flag
var isDownloading = false;

// Resource Collector
var reqs = {};

// Reset Resource Collector
function resetResourceCollector() {
  reqs = {};
}

// Refresh Button
document.getElementById('refresh').addEventListener('click', function () {
  // Reset Resource Collector
  resetResourceCollector();
  window.location.reload(true);
});

// Document Ready
document.addEventListener('DOMContentLoaded', function () {
  //	chrome.devtools.network.getHAR(function(logInfo){
  //			console.log(logInfo);
  //		});
  //  reqs = []
  chrome.devtools.network.onRequestFinished.addListener(function (req) {
    // Only collect Resource when XHR option is enabled
    if (document.getElementById('check-xhr').checked) {
      console.log('Resource Collector pushed: ', req.request.url);
      req.getContent(function (body, encoding) {
        if (!body) {
          console.log('No Content Detected!, Resource Collector will ignore: ', req.request.url);
        } else {
          reqs[req.request.url] = {
            body,
            encoding
          };
        }
        setResourceCount();
      });
      setResourceCount();
    }
  });

  var setResourceCount = debounce(function () {
    if (document.getElementById('check-xhr').checked) {
      chrome.devtools.network.getHAR(function (logInfo) {
        if (!isDownloading) {
          document.getElementById('status').innerHTML = 'Requests: ' + logInfo.entries.length;
        }
        chrome.devtools.inspectedWindow.getResources(function (resources) {
          if (!isDownloading) {
            document.getElementById('status').innerHTML += ' | Static Resources: ' + resources.length;
          }
        })
      });
    } else {
      chrome.devtools.inspectedWindow.getResources(function (resources) {
        if (!isDownloading) {
          document.getElementById('status').innerHTML = 'Static Resources count: ' + resources.length;
        }
      })
    }
  }, 150);


  document.getElementById('up-save').addEventListener('click', saveAllResources);

  document.getElementById('check-xhr').addEventListener('change', function (e) {
    if (e.target.checked) {
      // If change from false to true
      document.getElementById('label-xhr').innerHTML = 'Reloading page for collecting XHR requests ...'; //Include all assets by XHR requests
      document.getElementById('up-save').innerHTML = 'Waiting for reload';
      document.getElementById('up-save').disabled = true;
      // Add listener, only when the check box is from unchecked to checked
      chrome.tabs.onUpdated.addListener(tabCompleteHandler);
      chrome.tabs.reload(chrome.devtools.inspectedWindow.tabId, null, function () {
        e.target.disabled = true;
      });
    } else {
      // If change from true to false
      // Reset Resource Collector
      resetResourceCollector();
    }
    setResourceCount();
  });

  chrome.devtools.inspectedWindow.getResources(function (resources) {
    if (!isDownloading) {
      document.getElementById('status').innerHTML = 'Static resources count: ' + resources.length;
    }
  });

  //This can be used for identifying when ever a download is done (state from in_processing to complete)
  //	chrome.downloads.onChanged.addListener(function(downloadItem){
  //		console.log('Download Updated': downloadItem);
  //	});

  //This can be used for identifying when ever a new resource is added
  chrome.devtools.inspectedWindow.onResourceAdded.addListener(function (resource) {
    if (resource.url.indexOf('http') === 0) {
      // alert("resources added -> " + resource.url);
      // alert("resources content added " + resource.content);
      //      console.log('Resource Added: ', resource.url);
      // document.getElementById('debug').innerHTML += resource.url + '\n';
    }
  });

  //This can be used to detect when ever a resource code is changed/updated
  chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function (resource, content) {
    // alert("Resource Changed");
    // alert("New Content  " + content);
    // alert("New Resource  Object is " + resource);
    //    console.log('Resource Commited: ', resource.url);
  });
});

function tabCompleteHandler(tabId, changeInfo) {
  if (tabId === chrome.devtools.inspectedWindow.tabId && changeInfo.status === 'complete') {
    document.getElementById('check-xhr').checked = true;
    document.getElementById('check-xhr').disabled = false;
    document.getElementById('label-xhr').innerHTML = 'Include all assets by XHR requests (require page reload).';
    document.getElementById('up-save').innerHTML = 'Save All Resources';
    document.getElementById('up-save').disabled = false;
    // Remove listener from further same event
    chrome.tabs.onUpdated.removeListener(tabCompleteHandler);
  }
}

function getXHRs(callback) {
  var xhrResources = [];
  if (document.getElementById('check-xhr').checked) {
    chrome.devtools.network.getHAR(function (logInfo) {
      logInfo.entries.map(function (entry) {
        if (reqs[entry.request.url]) {
          console.log('Found in Resource Collector: ', entry.request.url);
          xhrResources.push(Object.assign({}, entry.request, {
            getContent: function (cb) {
              cb(reqs[entry.request.url].body, reqs[entry.request.url].encoding);
              return true;
            },
            type: entry.response.content.mimeType || 'text/plain',
            isStream: false
          }));
        } else {
          xhrResources.push(Object.assign({}, entry.request, {
            getContent: entry.getContent,
            type: entry.response.content.mimeType || 'text/plain',
            isStream: (entry.response.content.mimeType || '').indexOf('event-stream') !== -1
          }));
        }
      });
      callback(xhrResources);
    });
  } else {
    callback(xhrResources);
  }
}

// Convert all async getContent to sync getContent
function processContentFromResources(combineResources, cb) {
  var count = 0;
  combineResources.forEach(function(item,index){
    // Give timeout of 5000ms for the callback,
    // if the getContent callback cannot return in time, we move on
    var getContentTimeout = setTimeout(function () {
      count++;
      // Callback when all done
      if (count === combineResources.length) {
        cb(combineResources);
      }
    }, 5000);
    item.getContent(function(body,encoding) {
      clearTimeout(getContentTimeout);
      combineResources[index].getContent = function(cb) {
        cb(body,encoding);
      };
      count++;
      if (count === combineResources.length) {
        cb(combineResources);
      }
    });
  })
}

function saveAllResources(e) {
  var toDownload = [];
  var downloadThread = 5;

  // Downloading flag
  isDownloading = true;

  // Disable XHR Checkbox
  document.getElementById('check-xhr').disabled = true;

  // Reset Report Table
  reportElement.innerHTML = '';
  reportFailedElement.innerHTML = '';
  document.getElementById('open-folder').innerHTML = '';
  document.getElementById('debug').innerHTML = '';

  getXHRs(function (xhrResources) {
    // Disable download notification
    chrome.downloads.setShelfEnabled(false);

    chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, function (tab) {
      console.log('Save content from: ', tab.url);
      var domain = tab.url.split('://')[1].substring(0, tab.url.split('://')[1].indexOf('/'));
      //Fetching all available resources and filtering using name of script snippet added
      chrome.devtools.inspectedWindow.getResources(function (resources) {
        //		resources.map(function (item) {
        //			console.log(item);
        //		})
        //		alert(resources);
        // This function returns array of resources available in the current window

        // Disable button
        e.target.innerHTML = 'Downloading...';
        e.target.disabled = true;

        var allResources = xhrResources.concat(resources);

        processContentFromResources(allResources,function(combineResources){
          // Filter Resource here
          if (document.getElementById('check-all').checked) {
            for (i = 0; i < combineResources.length; i++) {
              if (!combineResources[i].url.includes('Chrome/Default/Extensions')) {
                var foundIndex = toDownload.findIndex(function (item) {
                  return item.url === combineResources[i].url
                });
                // Make sure unique URL
                if (foundIndex === -1) {
                  toDownload.push(combineResources[i]);
                } else {
                  // If the new one have content, replace with old one anyway
                  var j = i;
                  combineResources[j].getContent(function(body){
                    if (!!body) {
                      toDownload[foundIndex] = combineResources[j];
                    }
                  });
                }
              }
            }
          } else {
            for (i=0; i < combineResources.length; i++) {
              if (!combineResources[i].url.includes('Chrome/Default/Extensions')) {
                // Matching with current snippet URL
                if (combineResources[i].url.indexOf('://' + domain) >= 0) {
                  var foundIndex = toDownload.findIndex(function (item) {
                    return item.url === combineResources[i].url
                  });
                  // Make sure unique URL
                  if (foundIndex === -1) {
                    toDownload.push(combineResources[i]);
                  } else {
                    // If the new one have content, replace with old one anyway
                    var j = i;
                    combineResources[j].getContent(function(body){
                      if (!!body) {
                        toDownload[foundIndex] = combineResources[j];
                      }
                    });
                  }
                }
              }
            }
          }

          console.log('Combine Resource: ', combineResources);
          console.log('Download List: ', toDownload);

          // window.alll = toDownload;

          if (document.getElementById('check-zip').checked) {
            // No need to turn off notification for only one zip file
            chrome.downloads.setShelfEnabled(true);

            downloadZipFile(toDownload, allDone);
          } else {
            downloadListWithThread(toDownload, downloadThread, allDone);
          }
        });
      });
    })
  });
}

function allDone(isSuccess) {
  // Default value
  if (typeof isSuccess === 'undefined') {
    isSuccess = true;
  }

  // Downloading flag
  isDownloading = false;

  // Enable XHR Checkbox
  document.getElementById('check-xhr').disabled = false;

  // Re-enable Download notification
  chrome.downloads.setShelfEnabled(true);

  // Push reportElement to debugElement
  document.getElementById('debug').insertBefore(reportElement, document.getElementById('debug').childNodes[0]);
  document.getElementById('debug').insertBefore(reportFailedElement, document.getElementById('debug').childNodes[0]);

  var endStatus = document.createElement('p');

  // Report in the end
  if (isSuccess) {
    endStatus.className = 'all-done';
    endStatus.innerHTML = 'Downloaded All Files !!!';
    document.getElementById('debug').insertBefore(endStatus, document.getElementById('debug').childNodes[0]);

    var openDownload = document.createElement('button');
    openDownload.innerHTML = 'Open';
    openDownload.addEventListener('click', function () {
      chrome.downloads.showDefaultFolder();
    });
    document.getElementById('open-folder').innerHTML = 'Resources Folder: ';
    document.getElementById('open-folder').appendChild(openDownload);

  } else {
    endStatus.className = 'all-done';
    endStatus.innerHTML = 'Something wrong, please try again or contact me for the issue.';
    document.getElementById('debug').insertBefore(endStatus, document.getElementById('debug').childNodes[0]);
  }

  // Restore/Change button state
  document.getElementById('up-save').innerHTML = 'Re-Download?';
  document.getElementById('up-save').disabled = false;
}

function downloadListWithThread(toDownload, threadCount, callback) {
  document.getElementById('status').innerHTML = 'Files to download: ' + toDownload.length;
  var currentList = toDownload.slice(0, threadCount);
  var restList = toDownload.slice(threadCount);
  downloadURLs(currentList, function () {
    if (currentList.length > 0 && restList.length > 0) {
      downloadListWithThread(restList, threadCount, callback);
    } else {
      callback();
    }
  });
}

function resolveURLToPath(cUrl, cType, cContent) {
  var filepath, filename, isDataURI;
  var foundIndex = cUrl.search(/\:\/\//);
  // Check the url whether it is a link or a string of text data
  if ((foundIndex === -1) || (foundIndex >= 10)) {
    isDataURI = true;
    console.log('Data URI Detected!!!!!');

    if (cUrl.indexOf('data:') === 0) {
      var dataURIInfo = cUrl.split(';')[0].split(',')[0].substring(0, 30).replace(/[^A-Za-z0-9]/g, '.');
      // console.log('=====> ',dataURIInfo);
      filename = dataURIInfo + '.' + Math.random().toString(16).substring(2) + '.txt';
    } else {
      filename = 'data.' + Math.random().toString(16).substring(2) + '.txt';
    }

    filepath = '_DataURI/' + filename;
  } else {
    isDataURI = false;
    if (cUrl.split('://')[0].includes('http')) {
      // For http:// https://
      filepath = cUrl.split('://')[1].split('?')[0];
    } else {
      // For webpack:// ng:// ftp://
      filepath = cUrl.replace('://','---').split('?')[0];
    }
    if (filepath.charAt(filepath.length - 1) === '/') {
      filepath = filepath + 'index.html';
    }
    filename = filepath.substring(filepath.lastIndexOf('/') + 1);
  }

  // Get Rid of QueryString after ;
  filename = filename.split(';')[0];
  filepath = filepath.substring(0, filepath.lastIndexOf('/') + 1) + filename;

  // Add default extension to non extension filename
  if (filename.search(/\./) === -1) {
    var haveExtension = null;
    if (cType && cContent) {
      // Special Case for Images with Base64
      if (cType.indexOf('image') !== -1) {
        if (cContent.charAt(0) == '/') {
          filepath = filepath + '.jpg';
          haveExtension = 'jpg';
        }
        if (cContent.charAt(0) == 'R') {
          filepath = filepath + '.gif';
          haveExtension = 'gif';
        }
        if (cContent.charAt(0) == 'i') {
          filepath = filepath + '.png';
          haveExtension = 'png';
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
    filename = filename + '.' + haveExtension;
    console.log('File without extension: ', filename, filepath);
  }

  // Remove path violation case
  filepath = filepath
    .replace(/\:|\\|\=|\*|\.$|\"|\'|\?|\~|\||\<|\>/g, '')
    .replace(/\/\//g, '/')
    .replace(/(\s|\.)\//g, '/')
    .replace(/\/(\s|\.)/g, '/');

  filename = filename
    .replace(/\:|\\|\=|\*|\.$|\"|\'|\?|\~|\||\<|\>/g, '')

  // Decode URI
  if (filepath.indexOf('%') !== -1) {
    try {
      filepath = decodeURIComponent(filepath);
      filename = decodeURIComponent(filename);
    } catch (err) {
      console.log(err);
    }
  }

  // Strip double slashes
  while (filepath.includes('//')) {
    filepath = filepath.replace('//','/');
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
    dataURI: isDataURI && cUrl
  }
}

function downloadURLs(urls, callback) {
  var currentDownloadQueue = [];
  urls.forEach(function (currentURL, index) {
    console.log('Current request: ', currentURL);
    var cUrl = currentURL.url;
    var cType = currentURL.type;
    var resolvedURL = resolveURLToPath(cUrl);

    var filepath = resolvedURL.path;
    var filename = resolvedURL.name;

    console.log('Save to: ', filepath);

    currentDownloadQueue.push({
      index: index,
      url: cUrl,
      resolved: false
    });

    if (document.getElementById('check-cache').checked && currentURL.getContent) {
      currentURL.getContent(function (content, encoding) {
        var currentEnconding = encoding;
        if (filename.search(/\.(png|jpg|jpeg|gif|ico|svg)/) !== -1) {
          currentEnconding = 'base64';
        }

        var currentContent, finalURI;

        if (resolvedURL.dataURI) {
          currentContent = content;
          finalURI = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(resolvedURL.dataURI);
        } else {
          currentContent = currentEnconding ? content : (function () {
            try {
              return btoa(content);
            } catch (err) {
              console.log('utoa fallback: ', currentURL.url);
              return btoa(unescape(encodeURIComponent(content)));
            }
          })(); //btoa(unescape(encodeURIComponent(content)))

          finalURI = 'data:text/plain;base64,' + currentContent;
        }

        try {
          chrome.downloads.download({
              url: finalURI, //currentURL.url
              filename: 'All Resources/' + filepath,
              saveAs: false
            },
            function (downloadId) {
              var currentIndex = currentDownloadQueue.findIndex(function (item) {
                return item.index === index
              });
              if (chrome.runtime.lastError) {
                console.log('URI ERR: ', chrome.runtime.lastError, filepath); // , filepath, finalURI
                // document.getElementById('status').innerHTML = 'Files to download: ERR occured';
                currentDownloadQueue[currentIndex].resolved = true;
                resolveCurrentDownload();
              } else {
                currentDownloadQueue[currentIndex].id = downloadId;
                currentDownloadQueue[currentIndex].order = currentIndex;
                //console.log('Create: ', JSON.stringify(currentDownloadQueue));
                //console.log(currentDownloadQueue);
                //chrome.downloads.search({
                //  id: downloadId
                //}, function (item) {
                //  //console.log(item[0].state);
                //})
              }
            }
          );
        } catch (runTimeErr) {
          console.log(runTimeErr)
        }
      });
    } else {
      try {
        chrome.downloads.download({
            url: currentURL.url,
            filename: 'All Resources/' + filepath,
            saveAs: false
          },
          function (downloadId) {
            var currentIndex = currentDownloadQueue.findIndex(function (item) {
              return item.index === index
            });
            if (chrome.runtime.lastError) {
              console.log('URL ERR: ', chrome.runtime.lastError, filepath); // , filepath, finalURI
              // document.getElementById('status').innerHTML = 'Files to download: ERR occured';
              currentDownloadQueue[currentIndex].resolved = true;
              resolveCurrentDownload();
            } else {
              currentDownloadQueue[currentIndex].id = downloadId;
              currentDownloadQueue[currentIndex].order = currentIndex;
              //console.log('Create: ', JSON.stringify(currentDownloadQueue));
              //console.log(currentDownloadQueue);
              //chrome.downloads.search({
              //  id: downloadId
              //}, function (item) {
              //  //console.log(item[0].state);
              //})
            }
          }
        );
      } catch (runTimeErr) {
        console.log(runTimeErr);
      }
    }

  });

  function resolveCurrentDownload() {
    var count = currentDownloadQueue.filter(function (item) {
      return item.resolved === true
    }).length;
    //console.log('Count: ', count, '---', urls.length);
    if (count === urls.length) {
      //console.log('Callback');
      currentDownloadQueue = [];
      callback();
    }
  };

  chrome.downloads.onChanged.addListener(function (downloadItem) {
    var index = currentDownloadQueue.findIndex(function (item) {
      return item.id === downloadItem.id
    });
    if (index >= 0 && downloadItem.state) {
      //console.log(downloadItem.state.current);
      if (downloadItem.state.current === 'complete') {
        chrome.downloads.search({
          id: downloadItem.id
        }, function (item) {
          chrome.downloads.erase({
            id: downloadItem.id
          }, function () {
            var newListUrl = currentDownloadQueue.find(function (item) {
              return item.id === downloadItem.id
            }).url;

            if (newListUrl.indexOf('data:') === 0) {
              newListUrl = 'DATA URI CONTENT';
            }

            var newList = document.createElement('ul');
            newList.className = 'each-done';
            newList.innerHTML = '<li>' + item[0].id + '</li><li class="success">Success</li><li>' + newListUrl + '</li>';
            reportElement.insertBefore(newList, reportElement.childNodes[0]);
            currentDownloadQueue[index].resolved = true;
            resolveCurrentDownload();
          });
        });
      } else if (downloadItem.state.current === 'interrupted') {
        chrome.downloads.search({
          id: downloadItem.id
        }, function (item) {
          chrome.downloads.erase({
            id: downloadItem.id
          }, function () {
            var newList = document.createElement('ul');
            newList.className = 'each-failed';
            newList.innerHTML = '<li>' + item[0].id + '</li><li class="failed">Failed</li><li>' + item[0].url + '</li>';
            reportFailedElement.insertBefore(newList, reportFailedElement.childNodes[0]);
            currentDownloadQueue[index].resolved = true;
            resolveCurrentDownload();
          });
        });
      }
    }
  });
}

function downloadZipFile(toDownload, callback) {
  if (zip) {
    zip.workerScriptsPath = "zip/";
    getAllToDownloadContent(toDownload, function (result) {
      // console.log('All ToDownload: ',result);
      // window.alll = result;
      //Double check duplicated
      var newResult = [];
      result.forEach((item) => {
        if (newResult.findIndex(i => i.url === item.url) === -1) {
          newResult.push(item);
        } else {
          // console.log('Final Duplicated: ', item.url);
        }
      });

      zip.createWriter(new zip.BlobWriter(), function (blobWriter) {
        addItemsToZipWriter(blobWriter, newResult, downloadCompleteZip.bind(this, blobWriter, callback));
      }, function (err) {
        console.log('ERROR: ', err);
        // Continue on Error, error might lead to corrupted zip, so might need to escape here
        callback(false);
      });
    });
  } else {
    callback(false);
  }
};

function getAllToDownloadContent(toDownload, callback) {
  // Prepare the file list for adding into zip
  var result = [];
  var pendingDownloads = toDownload.length;

  toDownload.forEach(function (item, index) {
    if (item.getContent && !item.isStream) {
      // Give timeout of 5000ms for the callback,
      // if the getContent callback cannot return in time, we move on
      var getContentTimeout = setTimeout(function () {
        pendingDownloads--;
        // Callback when all done
        if (pendingDownloads === 0) {
          callback(result);
        }
      }, 5000);

      item.getContent(function (body, encode) {
        // Cancel the timeout above
        clearTimeout(getContentTimeout);

        // console.log(index,': ',encode,'---->',body ? body.substring(0,20) : null);
        var resolvedItem = resolveURLToPath(item.url, item.type, body);
        var newURL = resolvedItem.path;
        var filename = resolvedItem.name;
        var currentEnconding = encode || null;

        if (filename.search(/\.(png|jpg|jpeg|gif|ico|svg)/) !== -1) {
          currentEnconding = 'base64';
        }

        if (resolvedItem.dataURI) {
          currentEnconding = null;
        }

        // Make sure the file is unique, otherwise exclude
        var foundIndex = result.findIndex(function (currentItem) {
          return currentItem.url === newURL;
        });

        // Only add to result when the url is unique
        if (foundIndex === -1) {
          result.push({
            name: filename,
            type: item.type || 'text/plain',
            originalUrl: item.url,
            url: newURL, // Actually the path
            content: resolvedItem.dataURI || body,
            encoding: currentEnconding
          });
        } else {
          // console.log('XXX: ',newURL, item.url);
          // Otherwise add suffix to the path and filename
          var newFilename = filename.split('.')[0] + '-' + Math.random().toString(16).substring(2) + '.' + filename.split('.')[1];
          var newPath = newURL.toString().replace(filename, newFilename);
          console.log('Duplicated: ', newFilename, newPath , filename, newURL);
          // console.log(filename + ' ------- ' + newURL);
          result.push({
            name: newFilename,
            type: item.type || 'text/plain',
            originalUrl: item.url,
            url: newPath,
            content: resolvedItem.dataURI || body,
            encoding: currentEnconding
          });
        }

        // Update status bar
        document.getElementById('status').innerHTML = 'Timeout in 5sec - Fetched: ' + resolvedItem.path;

        pendingDownloads--;

        // Callback when all done
        if (pendingDownloads === 0) {
          // window.alll = result;
          callback(result);
        }

        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        }
      });
    } else {
      pendingDownloads--;
      // Callback when all done
      if (pendingDownloads === 0) {
        callback(result);
      }
    }
  });
}

function addItemsToZipWriter(blobWriter, items, callback) {
  var item = items[0];
  var rest = items.slice(1);

  // if item exist so add it to zip
  if (item) {
    // Try to beautify JS,CSS,HTML here
    if (js_beautify &&
      html_beautify &&
      css_beautify &&
      document.getElementById('check-beautify').checked &&
      item.name &&
      item.content
    ) {
      var fileExt = item.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/);
      switch (fileExt ? fileExt[1] : '') {
        case 'js': {
          console.log(item.name, ' will be beautified!');
          item.content = js_beautify(item.content);
          break;
        }
        case 'html': {
          console.log(item.name, ' will be beautified!');
          item.content = html_beautify(item.content);
          break;
        }
        case 'css': {
          console.log(item.name, ' will be beautified!');
          item.content = css_beautify(item.content);
          break;
        }
      }
    }

    // Check whether base64 encoding is valid
    if (item.encoding === 'base64') {
      // Try to decode first
      try {
        var tryAtob = atob(item.content);
      } catch (err) {
        console.log(item.url, ' is not base64 encoding, try to encode to base64.');
        try {
          item.content = btoa(item.content);
        } catch (err) {
          console.log(item.url, ' failed to encode to base64, fallback to text.');
          item.encoding = null;
        }
      }
    }

    // Create a reader of the content for zip
    var resolvedContent = (item.encoding === 'base64') ?
      new zip.Data64URIReader(item.content || '') :
      new zip.TextReader(item.content || 'No Content: ' + item.originalUrl);

    var isNoContent = !item.content;

    // Create a Row of Report Table
    var newList = document.createElement('ul');

    // Make sure the file has some byte otherwise no import to avoid corrupted zip
    resolvedContent.init(function () {
      if (resolvedContent.size > 0) {
        if (!isNoContent) {
          console.log(resolvedContent.size, item.encoding || 'No Encoding', item.url, item.name);
          blobWriter.add(item.url, resolvedContent,
            function () {
              // On Success, to the next item
              addItemsToZipWriter(blobWriter, rest, callback);

              // Update Status
              document.getElementById('status').innerHTML = 'Compressed: ' + item.url;

              // Update Report Table
              newList.className = 'each-done';
              newList.innerHTML = '<li>Added</li><li class="success">Done</li><li>' + item.url + '</li>';
              reportElement.insertBefore(newList, reportElement.childNodes[0]);
            },
            function () {
              // On Progress
            }
          );
        } else {
          if (document.getElementById('check-content').checked) {
            blobWriter.add(item.url, resolvedContent,
              function () {
                // On Success, to the next item
                addItemsToZipWriter(blobWriter, rest, callback);

                // Update Status
                document.getElementById('status').innerHTML = 'Compressed: ' + item.url;

                // Update Report Table
                newList.className = 'each-done';
                newList.innerHTML = '<li>Added</li><li class="success"><b>No Content</b></li><li>' + item.url + '</li>';
                reportFailedElement.insertBefore(newList, reportFailedElement.childNodes[0]);
              },
              function () {
                // On Progress
              }
            );
          } else {
            console.log('EXCLUDED: ', item.url);

            // Update Status
            document.getElementById('status').innerHTML = 'Excluded: ' + item.url;

            // Update Report Table
            newList.className = 'each-failed';
            newList.innerHTML = '<li>Ignored</li><li class="failed"><b>No Content</b></li><li>' + item.url + '</li>';
            reportFailedElement.insertBefore(newList, reportFailedElement.childNodes[0]);

            // To the next item
            addItemsToZipWriter(blobWriter, rest, callback);
          }
        }
      } else {
        // If no size, exclude the item
        console.log('EXCLUDED: ', item.url);

        // Update Status
        document.getElementById('status').innerHTML = 'Excluded: ' + item.url;

        // Update Report Table
        newList.className = 'each-failed';
        newList.innerHTML = '<li>Ignored</li><li class="failed">Request Failed</li><li>' + item.url + '</li>';
        reportFailedElement.insertBefore(newList, reportFailedElement.childNodes[0]);

        // To the next item
        addItemsToZipWriter(blobWriter, rest, callback);
      }
    });

  } else {
    // Callback when all done
    callback();
  }
  return rest;
}

//function downloadCompleteZip(blobWriter, callback) {
//	// Close the writer and save it by dataURI
//	blobWriter.close(function (blob) {
//		chrome.downloads.download({
//			url: URL.createObjectURL(blob),
//			filename: 'All Resources/all.zip',
//			saveAs: false
//		}, function () {
//			if (chrome.runtime.lastError) {
//				callback(false);
//			} else {
//				callback(true);
//			}
//		});
//	});
//}

function downloadCompleteZip(blobWriter, callback) {
  blobWriter.close(function (blob) {
    chrome.tabs.get(
      chrome.devtools.inspectedWindow.tabId, function (tab) {
        var url = new URL(tab.url);
        var filename = url.hostname ? url.hostname.replace(/([^A-Za-z0-9\.])/g, "_") : 'all';
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename + '.zip';
        a.click();
        callback(true);
      });
  })
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// console.log('Hello from -> Content');

// Communication between tab and extension
// Inject a message sending from an active tab
//setTimeout(function(){
//	chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
//		code: 'window.addEventListener("load", function(){chrome.runtime.sendMessage({type: "RELOADED"})}, false);'
//	});
//},3000);

// Communication between tab and extension
// Function when this extension get an message event and react that
//chrome.runtime.onMessage.addListener(
//	function(request, sender, sendResponse) {
//		//	console.log(request.type,sender.tab.id,chrome.devtools.inspectedWindow.tabId)
//		if (request.type === 'RELOADED' && sender.tab.id === chrome.devtools.inspectedWindow.tabId) {
//			document.getElementById('check-xhr').checked = true;
//			document.getElementById('check-xhr').disabled = false;
//			document.getElementById('label-xhr').innerHTML = 'Include all assets by XHR requests'
//			document.getElementById('up-save').innerHTML = 'Save All Resources';
//			document.getElementById('up-save').disabled = false;
//		}
//	}
//);

// resources[i].getContent(function (content, encoding) {
//	alert("encoding is " + encoding);
//	alert("content is  " + content);
// 	document.getElementById('debug').innerHTML += '<p>'+ cUrl +'</p>';
// });
