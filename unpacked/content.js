document.addEventListener('DOMContentLoaded', function () {
  //	chrome.devtools.network.getHAR(function(logInfo){
  //			console.log(logInfo);
  //		});
  window.reqs = []
  chrome.devtools.network.onRequestFinished.addListener(function (req) {
    req.getContent(function (body) {
      window.reqs.push(body);
    })
  });

  ZipFile.create();

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
      console.log('Resource Added: ', resource.url);
      // document.getElementById('debug').innerHTML += resource.url + '\n';
    }
  });

  //This can be used to detect when ever a resource code is changed/updated
  chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function (resource, content) {
    // alert("Resource Changed");
    // alert("New Content  " + content);
    // alert("New Resource  Object is " + resource);
    console.log('Resource Commited: ', resource.url);
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


function saveAllResources(e) {

  var toDownload = [];
  var downloadThread = 5;

  var xhrResources = [];
  if (document.getElementById('check-xhr').checked) {
    chrome.devtools.network.getHAR(function (logInfo) {
      logInfo.entries.map(function (entry) {
        xhrResources.push(entry.request);
      })
    });
  }

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

      if (document.getElementById('check-all').checked) {
        for (i = 0; i < combineResources.length; i++) {
          if (combineResources[i].url.search(/^(http|https)/) !== -1) {
            // Make sure unique URL
            if (toDownload.findIndex(function (item) {
                return item.url === combineResources[i].url
              }) === -1) {
              toDownload.push(combineResources[i]);
            }
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

      console.log('Download List: ', toDownload)

      downloadListWithThread(toDownload, downloadThread, function () {
        allDone(domain);
      });

    });
  })
}

var fileziplist = [];// files which need zip
function allDone(domain) {
  // start download
  ZipFile.add(fileziplist, domain);
  // Re-enable Download notification
  chrome.downloads.setShelfEnabled(true);

  var endStatus = document.createElement('p');
  endStatus.className = 'all-done';
  endStatus.innerHTML = 'Downloaded All Files !!!';
  document.getElementById('debug').insertBefore(endStatus, document.getElementById('debug').childNodes[0]);

  var openDownload = document.createElement('button');
  openDownload.innerHTML = 'Open';
  openDownload.addEventListener('click', function () {
    chrome.downloads.showDefaultFolder();
  });

  document.getElementById('status').innerHTML = 'Resources Folder: ';
  document.getElementById('status').appendChild(openDownload);

  document.getElementById('up-save').innerHTML = 'Re-Download?';
  document.getElementById('up-save').disabled = false;
}

function downloadListWithThread(toDownload, threadCount, callback) {
  document.getElementById('status').innerHTML = 'Files to download: ' + toDownload.length;
  var currentList = toDownload.slice(0, threadCount);
  var restList = toDownload.slice(threadCount);
  downloadURLs(toDownload, function () {
    // if (currentList.length > 0 && restList.length > 0) {
    //   downloadListWithThread(restList, threadCount, callback);
    // } else {
      callback();
    // }
  });
}

function downloadURLs(urls, callback) {
  var currentDownloadQueue = [];
  let count = 1;
  urls.forEach(function (currentURL, index) {
    console.log('Current request: ', currentURL);
    var cUrl = currentURL.url;
    var filepath, filename;

    if (cUrl.search(/\:\/\//) === -1) {
      console.log('Data URI Detected!');
      filename = 'file.' + Math.random().toString(16) + '.txt';
      filepath = 'dataURI/' + filename;
    } else {
      filepath = currentURL.url.split('://')[1].split('?')[0];
      if (filepath.charAt(filepath.length - 1) === '/') {
        filepath = filepath + 'index.html';
      }
      filename = filepath.substring(filepath.lastIndexOf('/') + 1);
      if (filename.search(/\./) === -1) {
        filepath = filepath + '.html';
      }
    }

    filepath = filepath
      .replace(/\:|\\|\/\/|\=|\*|\.$|\"|\'|\?|\~|\||\<|\>/g, '')
      .replace(/(\s|\.)\//g, '/')
      .replace(/\/(\s|\.)/g, '/');

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

        var currentContent = currentEnconding ? content : (function () {
          try {
            return btoa(content);
          } catch (err) {
            console.log('utoa fallback: ', currentURL.url);
            return btoa(unescape(encodeURIComponent(content)));
          }
        })(); //btoa(unescape(encodeURIComponent(content)))

        var finalURI = 'data:text/plain;base64,' + currentContent;
        try {
          fileziplist.push([filepath, finalURI]);
          resolveCurrentDownload();
          // chrome.downloads.download({
          //     url: finalURI, //currentURL.url
          //     filename: 'All Resources/' + filepath,
          //     saveAs: false
          //   },
          //   function (downloadId) {
          //     var currentIndex = currentDownloadQueue.findIndex(function (item) {
          //       return item.index === index
          //     });
          //     if (chrome.runtime.lastError) {
          //       console.log('URI ERR: ', chrome.runtime.lastError, filepath); // , filepath, finalURI
          //       // document.getElementById('status').innerHTML = 'Files to download: ERR occured';
          //       currentDownloadQueue[currentIndex].resolved = true;
          //       resolveCurrentDownload();
          //     } else {
          //       currentDownloadQueue[currentIndex].id = downloadId;
          //       currentDownloadQueue[currentIndex].order = currentIndex;
          //       //console.log('Create: ', JSON.stringify(currentDownloadQueue));
          //       //console.log(currentDownloadQueue);
          //       //chrome.downloads.search({
          //       //  id: downloadId
          //       //}, function (item) {
          //       //  //console.log(item[0].state);
          //       //})
          //     }
          //   }
          // );
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
    // var count = currentDownloadQueue.filter(function (item) {
    //   return item.resolved === true
    // }).length;
    //console.log('Count: ', count, '---', urls.length);
    if (count === urls.length) {
      //console.log('Callback');
      currentDownloadQueue = [];
      callback();
    }
    count++;

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