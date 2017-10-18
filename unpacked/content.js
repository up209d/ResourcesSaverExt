console.log('Hello from -> Content');

document.addEventListener('DOMContentLoaded', function () {

	document.getElementById('up-save').addEventListener('click', saveAllResources);

	chrome.devtools.inspectedWindow.getResources(function (resources) {
		document.getElementById('status').innerHTML = 'Resources count: ' + resources.length;
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
			console.log('Resource added: ', resource.url);
			// document.getElementById('debug').innerHTML += resource.url + '\n';
		}
	});

	//This can be used to detect when ever a resource code is changed/updated
	chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function (resource, content) {
		// alert("Resource Changed");
		// alert("New Content  " + content);
		// alert("New Resource  Object is " + resource);
		console.log('Resource commited: ', resource.url);
	});
});

function saveAllResources(e) {

	var toDownload = [];
	var downloadThread = 5;

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

			if (document.getElementById('check-all').checked) {
				for (i = 0; i < resources.length; i++) {
					if (resources[i].url.search(/^(http|https)/) !== -1) {
						toDownload.push(resources[i]);
					}
				}
			} else {
				for (i = 0; i < resources.length; i++) {
					// Matching with current snippet URL
					if (resources[i].url.indexOf('://' + domain) >= 0) {
						toDownload.push(resources[i]);
					}
				}
			}

			//			toDownload.push({
			//				url: 'http://'+domain+'/abc.icon.png'
			//			})

			downloadListWithThread(toDownload, downloadThread, function () {
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

				e.target.innerHTML = 'Re-Download?';
				e.target.disabled = false;

			});

		});
	})
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

function downloadURLs(urls, callback) {
	var currentDownloadQueue = [];
	urls.forEach(function (currentURL, index) {
		console.log(currentURL);
		var cUrl = currentURL.url;
		var filename = currentURL.url.substring(currentURL.url.lastIndexOf('/') + 1);
		var filepath = currentURL.url.split('://')[1].split('?')[0];
		if (filepath.charAt(filepath.length - 1) === '/') {
			filepath = filepath + 'index.html';
		}

		currentDownloadQueue.push({
			index: index,
			url: cUrl,
			resolved: false
		})

		chrome.downloads.download({
				url: currentURL.url,
				filename: 'All Resources/' + filepath,
				saveAs: false
			},
			function (downloadId) {
				var currentIndex = currentDownloadQueue.findIndex(function (item) {
					return item.index === index
				});
				currentDownloadQueue[currentIndex].id = downloadId;
				//console.log('Create: ', JSON.stringify(currentDownloadQueue));
				//console.log(currentDownloadQueue);
				chrome.downloads.search({
					id: downloadId
				}, function (item) {
					//console.log(item[0].state);
				})
			}
		);
	});

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
						var newList = document.createElement('ul');
						newList.className = 'each-done';
						newList.innerHTML = '<li>' + item[0].id + '</li><li class="success">Success</li><li>' + item[0].url + '</li>';
						document.getElementById('debug').insertBefore(newList, document.getElementById('debug').childNodes[0]);
						currentDownloadQueue[index].resolved = true;
						var count = currentDownloadQueue.filter(function (item) {
							return item.resolved === true
						}).length;
						//console.log('Count: ', count, '---', urls.length);
						if (count === urls.length) {
							//console.log('Callback');
							currentDownloadQueue = [];
							callback();
						}
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
						var count = currentDownloadQueue.filter(function (item) {
							return item.resolved === true
						}).length;
						console.log('Count: ', count, '---', urls.length);
						if (count === urls.length) {
							//console.log('Callback');
							currentDownloadQueue = [];
							callback();
						}
					});
				});
			}
		}
	});
}



// resources[i].getContent(function (content, encoding) {
//	alert("encoding is " + encoding);
//	alert("content is  " + content);
// 	document.getElementById('debug').innerHTML += '<p>'+ cUrl +'</p>';
// });