var global_zipWriter = null;
var filelist = [];
var zipFilelist = [];
var ZipFile = {}
zip.workerScriptsPath = "/zip/";

ZipFile.create = function () {
  if (!global_zipWriter) {
    zip.createWriter(new zip.BlobWriter(), function (zipWriter) {
      global_zipWriter = zipWriter;
    }, onerror);
  }
}


ZipFile.add = function (files, domain) {
  let file = files.slice(0, 1);
  let restfile = files.slice(1);

  global_zipWriter.add(file[0][0], new zip.Data64URIReader(file[0][1]), function () {
    if (file.length > 0 && restfile.length > 0) {
      ZipFile.add(restfile, domain);
    } else {
      ZipFile.save(domain);
    }
  });
}

// save .zip file
ZipFile.save = function (domain) {
  global_zipWriter.close(function (blob) {
    var blobURL = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: blobURL,
      filename: 'All Resources/' + domain + '.zip',
      saveAs: false
    }, function (did) {
      global_zipWriter = null;
    })
  });
}