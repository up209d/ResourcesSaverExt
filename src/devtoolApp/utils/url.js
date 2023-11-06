export const resolveURLToPath = (cUrl, cType, cContent) => {
    let filepath, filename, isDataURI;
    let foundIndex = cUrl.search(/:\/\//);
    // Check the url whether it is a link or a string of text data
    if (foundIndex === -1 || foundIndex >= 10) {
        isDataURI = true;
        console.log('[DEVTOOL]', 'Data URI Detected!!!!!');
        // Data URI
        if (cUrl.indexOf('data:') === 0) {
            let dataURIInfo = cUrl
                .split(';')[0]
                .split(',')[0]
                .substring(0, 30)
                .replace(/[^A-Za-z0-9]/g, '.');
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
        console.log(
            '[DEVTOOL]',
            'File without extension: ',
            filename,
            'Will process as: ',
            filename + '.' + haveExtension,
            filepath
        );
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
            console.log('[DEVTOOL]', err);
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
