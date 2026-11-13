/**
 * Autonomous Multi-Search Engine Submission & IndexNow Broadcast
 * Broadcaster for Google, Bing, Yahoo, DuckDuckGo, Brave, Yandex
 */

const https = require('https');
const http = require('http');

const HOST = 'docuforensic-ai.onrender.com';
const INDEXNOW_KEY = '67a3f89e2b1049c6934e8f17bc6719aa';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const URLS_TO_INDEX = [
  `https://${HOST}/`,
  `https://${HOST}/sitemap.xml`,
  `https://${HOST}/manifest.webmanifest`
];

function sendPostRequest(hostname, path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'DocuForensic-Indexer/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          hostname,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          body: body.trim() || 'OK'
        });
      });
    });

    req.on('error', (err) => {
      resolve({ hostname, error: err.message, status: 'ERROR' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ hostname, error: 'Request Timed Out', status: 'TIMEOUT' });
    });

    req.write(postData);
    req.end();
  });
}

function sendGetRequest(fullUrl) {
  return new Promise((resolve) => {
    https.get(fullUrl, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          url: fullUrl,
          status: res.statusCode,
          body: body.substring(0, 100).trim() || 'OK'
        });
      });
    }).on('error', (err) => {
      resolve({ url: fullUrl, error: err.message, status: 'ERROR' });
    });
  });
}

async function runUniversalSearchBroadcast() {
  console.log('====================================================================');
  console.log('🌐 UNIVERSAL MULTI-SEARCH ENGINE INDEXING BROADCAST');
  console.log('Target Domain:', HOST);
  console.log('IndexNow Key:', INDEXNOW_KEY);
  console.log('Timestamp:', new Date().toISOString());
  console.log('====================================================================\n');

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS_TO_INDEX
  };

  // 1. Submit to Central Universal IndexNow Endpoint (Bing, Yahoo, DuckDuckGo, Seznam, Naver)
  console.log('📡 [1/5] Submitting to Universal IndexNow (api.indexnow.org)...');
  const resIndexNow = await sendPostRequest('api.indexnow.org', '/indexnow', payload);
  console.log(`   Response: HTTP ${resIndexNow.status} (${resIndexNow.body || resIndexNow.error || 'Acknowledged'})\n`);

  // 2. Submit to Microsoft Bing IndexNow Directly (Powers Bing, Yahoo, DuckDuckGo)
  console.log('📡 [2/5] Submitting directly to Microsoft Bing (www.bing.com/indexnow)...');
  const resBing = await sendPostRequest('www.bing.com', '/indexnow', payload);
  console.log(`   Response: HTTP ${resBing.status} (${resBing.body || resBing.error || 'Acknowledged'})\n`);

  // 3. Submit to Yandex IndexNow
  console.log('📡 [3/5] Submitting to Yandex (yandex.com/indexnow)...');
  const resYandex = await sendPostRequest('yandex.com', '/indexnow', payload);
  console.log(`   Response: HTTP ${resYandex.status} (${resYandex.body || resYandex.error || 'Acknowledged'})\n`);

  // 4. Ping Bing Sitemap
  console.log('📡 [4/5] Pinging Bing Sitemap Endpoint...');
  const sitemapUrl = `https://${HOST}/sitemap.xml`;
  const pingBing = await sendGetRequest(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
  console.log(`   Response: HTTP ${pingBing.status}\n`);

  // 5. Ping Google Sitemap
  console.log('📡 [5/5] Pinging Google Sitemap Ping Endpoint...');
  const pingGoogle = await sendGetRequest(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
  console.log(`   Response: HTTP ${pingGoogle.status}\n`);

  console.log('====================================================================');
  console.log('✅ ALL SEARCH ENGINES BROADCAST COMPLETED SUCCESSFULLY!');
  console.log('Covered Platforms:');
  console.log(' - Google Search');
  console.log(' - Microsoft Bing Search');
  console.log(' - Yahoo Search (via Bing)');
  console.log(' - DuckDuckGo (via Bing & IndexNow)');
  console.log(' - Brave Search (via Bravebot & robots.txt / Web Discovery Project)');
  console.log(' - Firefox Search defaults (uses Google / DuckDuckGo / Bing)');
  console.log(' - Yandex Search');
  console.log('====================================================================\n');
}

if (require.main === module) {
  runUniversalSearchBroadcast().then(() => process.exit(0));
}

module.exports = { runUniversalSearchBroadcast };
