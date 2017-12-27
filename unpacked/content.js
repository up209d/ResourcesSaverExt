document.addEventListener('DOMContentLoaded', function () {
  //	chrome.devtools.network.getHAR(function(logInfo){
  //			console.log(logInfo);
  //		});
  //  reqs = []
  chrome.devtools.network.onRequestFinished.addListener(function (req) {
    //    req.getContent(function (body) {
    //      reqs.push(Object.assign({},{body: body,url: req.request.url}));
    //      console.log(reqs[reqs.length-1],reqs.length);
    //      setResourceCount();
    //    })
    //    var resolvedURL = resolveURLToPath(req.request.url).path;
    //      if (!reqs.includes(req.request.url)) {
    //        reqs.push(req.request.url);
    //      }
    setResourceCount();
  });

  var setResourceCount = debounce(function () {
    if (document.getElementById('check-xhr').checked) {
      chrome.devtools.network.getHAR(function (logInfo) {
        document.getElementById('status').innerHTML = 'All requests count: ' + logInfo.entries.length;
      });
    } else {
      chrome.devtools.inspectedWindow.getResources(function (resources) {
        document.getElementById('status').innerHTML = 'Static resources count: ' + resources.length;
      })
    }
  }, 500);


  document.getElementById('up-save').addEventListener('click', saveAllResources);

  document.getElementById('check-xhr').addEventListener('change', function (e) {
    e.target.checked = !e.target.checked;
    if (!e.target.checked) {
      e.target.checked = false;
      document.getElementById('label-xhr').innerHTML = 'Reloading page for collecting XHR requests ...'; //Include all assets by XHR requests
      document.getElementById('up-save').innerHTML = 'Waiting for reload';
      document.getElementById('up-save').disabled = true;
      // Add listener, only when the check box is from unchecked to checked
      chrome.tabs.onUpdated.addListener(tabCompleteHandler);
      chrome.tabs.reload(chrome.devtools.inspectedWindow.tabId, null, function () {
        e.target.disabled = true;
      });
    } else {
      e.target.checked = false;
    }
    setResourceCount();
  });

  chrome.devtools.inspectedWindow.getResources(function (resources) {
    document.getElementById('status').innerHTML = 'Static resources count: ' + resources.length;
  })

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
    document.getElementById('label-xhr').innerHTML = 'Include all assets by XHR requests (require page reload).'
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
        xhrResources.push(Object.assign({}, entry.request, {
          getContent: entry.getContent
        }));
      })
      callback(xhrResources);
    });
  } else {
    callback(xhrResources);
  }
}

function saveAllResources(e) {
  var toDownload = [];
  var downloadThread = 5;

  // Reset Report Table
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
        e.target.innerHTML = 'Starting Download';
        e.target.disabled = true;

        var combineResources = xhrResources.concat(resources);

        // Filter Resource here
        if (document.getElementById('check-all').checked) {
          for (i = 0; i < combineResources.length; i++) {
            // Make sure unique URL
            if (toDownload.findIndex(function (item) {
                return item.url === combineResources[i].url
              }) === -1) {
              toDownload.push(combineResources[i]);
            }
          }
        } else {
          for (i = 0; i < combineResources.length; i++) {
            // Matching with current snippet URL
            if (combineResources[i].url.indexOf('://' + domain) >= 0) {
              // Make sure unique URL
              if (toDownload.findIndex(function (item) {
                  return item.url === combineResources[i].url
                }) === -1) {
                toDownload.push(combineResources[i]);
              }
            }
          }
        }

        console.log('Combine Resource: ', combineResources);
        console.log('Download List: ', toDownload)

        if (document.getElementById('check-zip').checked) {
          // No need to turn off notification for only one zip file
          chrome.downloads.setShelfEnabled(true);

          downloadZipFile(toDownload, allDone);
        } else {
          downloadListWithThread(toDownload, downloadThread, allDone);
        }

      });
    })
  });
}

function allDone(isSuccess) {
  // Default value
  if (typeof isSuccess === 'undefined') {
    isSuccess = true;
  }

  // Re-enable Download notification
  chrome.downloads.setShelfEnabled(true);
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
  } else {
    endStatus.className = 'all-done';
    endStatus.innerHTML = 'Something wrong, please try again or contact me for the issue.';
    document.getElementById('debug').insertBefore(endStatus, document.getElementById('debug').childNodes[0]);
  }

  // Restore/Change button state
  document.getElementById('status').innerHTML = 'Resources Folder: ';
  document.getElementById('status').appendChild(openDownload);

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

function resolveURLToPath(cUrl) {
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
    filepath = cUrl.split('://')[1].split('?')[0];
    if (filepath.charAt(filepath.length - 1) === '/') {
      filepath = filepath + 'index.html';
    }
    filename = filepath.substring(filepath.lastIndexOf('/') + 1);
  }

  // Get Rid of QueryString after ;
  filepath = filepath.substring(0, filepath.lastIndexOf('/') + 1) + filename.split(';')[0];

  // Add default extension to non extension filename
  if (filename.search(/\./) === -1) {
    filepath = filepath + '.html';
  }

  filepath = filepath
    .replace(/\:|\\|\/\/|\=|\*|\.$|\"|\'|\?|\~|\||\<|\>/g, '')
    .replace(/(\s|\.)\//g, '/')
    .replace(/\/(\s|\.)/g, '/');

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
            document.getElementById('debug').insertBefore(newList, document.getElementById('debug').childNodes[0]);
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
            document.getElementById('debug').insertBefore(newList, document.getElementById('debug').childNodes[0]);
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
      console.log(result);
      zip.createWriter(new zip.BlobWriter(), function (blobWriter) {
        addItemsToZipWriter(blobWriter, result, downloadCompleteZip.bind(this, blobWriter, callback));
      }, function (err) {
        console.log('ERROR: ', err, currentRest);
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

  // window.toDownload = toDownload;

  toDownload.forEach(function (item, index) {
    if (item.getContent) {
      item.getContent(function (body, encode) {

        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        }
        // console.log(index,': ',encode,'---->',body ? body.substring(0,20) : null);
        var resolvedItem = resolveURLToPath(item.url);
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
            originalUrl: item.url,
            url: newURL,
            content: resolvedItem.dataURI || body,
            encoding: currentEnconding
          });
        }

        // Update status bar
        document.getElementById('status').innerHTML = 'Fetched: ' + resolvedItem.path;

        // Callback when all done
        pendingDownloads--;
        if (pendingDownloads === 0) {
          callback(result);
        }
      });
    } else {
      pendingDownloads--;
    }
  });
}

function addItemsToZipWriter(blobWriter, items, callback) {
  var item = items[0];
  var rest = items.slice(1);

  // if item exist so add it to zip
  if (item) {
    // Check whether base64 encoding is valid
    if (item.encoding === 'base64') {
      // Try to decode first
      try {
        var tryAtob = atob(item.content);
      } catch (err) {
        console.log(item.url, ' is not base64 encoding, fallback to plain text');
        item.encoding = null;
      }
    }

    // Create a reader of the content for zip
    var resolvedContent = (item.encoding === 'base64') ? 
        new zip.Data64URIReader(item.content || '') : 
        new zip.TextReader(item.content || 'No Content: ' + item.originalUrl);

    // Create a Row of Report Table
    var newList = document.createElement('ul');

    // Make sure the file has some byte otherwise no import to avoid corrupted zip
    resolvedContent.init(function () {
      if (resolvedContent.size > 0) {
        console.log(resolvedContent.size, item.encoding || 'No Encoding', item.url);
        blobWriter.add(item.url, resolvedContent,
          function () {
            // On Success, to the next item
            addItemsToZipWriter(blobWriter, rest, callback);

            // Update Status
            document.getElementById('status').innerHTML = 'Compressed: ' + item.url;

            // Update Report Table
            newList.className = 'each-done';
            newList.innerHTML = '<li>Added</li><li class="success">Success</li><li>' + item.url + '</li>';
            document.getElementById('debug').insertBefore(newList, document.getElementById('debug').childNodes[0]);
          },
          function () {
            // On Progress
          }
        );
      } else {
        // If no size, exclude the item
        console.log('EXCLUDED: ', item.url);

        // Update Status
        document.getElementById('status').innerHTML = 'Excluded: ' + item.url;

        // Update Report Table
        newList.className = 'each-failed';
        newList.innerHTML = '<li>Excluded</li><li class="failed">Failed</li><li>' + item.url + '</li>';
        document.getElementById('debug').insertBefore(newList, document.getElementById('debug').childNodes[0]);

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

function downloadCompleteZip(blobWriter, callback) {
  // Close the writer and save it by dataURI
  blobWriter.close(function (blob) {
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename: 'All Resources/all.zip',
      saveAs: false
    }, function () {
      if (chrome.runtime.lastError) {
        callback(false);
      } else {
        callback(true);
      }
    });
  });
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