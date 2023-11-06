import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import * as urlUtils from './src/devtoolApp/utils/url.js';
import * as generalUtils from './src/devtoolApp/utils/general';
import URLS from './auto.json';
async function start(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null,
    devtools: true,
    args: ['--window-size=1920,1080', '--window-position=0,0'],
  });
  const page = (await browser.pages())?.[0];
  if (!page) {
    return;
  }
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  client.on('Network.responseReceived', async (result) => {
    if (!result) {
      return;
    }
    const { requestId, type, response,
      // loaderId, timestamp, hasExtraInfo, frameId
    } = result;
    if (type === 'Preflight') {
      return;
    }
    console.log(requestId, type, response.url, response.status);
    const fileInfo = urlUtils.resolveURLToPath(response?.url);
    let resBody;
    try {
      await generalUtils.pause(1000);
      resBody = await client.send('Network.getResponseBody', { requestId });
    } catch (err) {
      console.log('NO DATA - IGNORED: ', response?.url, fileInfo, err);
    }
    if (!resBody) {
      return;
    }
    const dir = new URL(url).hostname.replace(/([^A-Za-z0-9.])/g, '_');
    const content = resBody.base64Encoded ? Buffer.from(resBody.body, 'base64') : resBody.body;
    const filePath = path.resolve('./output/' + dir + '/' + fileInfo.path);
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, content, resBody.base64Encoded ? 'binary' : 'utf8');
    console.log('Saved file: ', resBody.base64Encoded ? 'base64' : 'text', filePath);
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
  } catch (err) {
    console.log('BYPASS NETWORK WAITING ERROR: ', err);
  }
  await generalUtils.pause(5000);
  await browser.close();
  return 'OK: ' + url;
}

URLS.reduce(
  async (results, url) => (console.log(await results) || true) && start(url),
  Promise.resolve('WATERFALL STARTED!!!')
).then(console.log.bind(null,'WATERFALL DONE!!!'));

// babel-node auto.js --presets @babel/preset-env
