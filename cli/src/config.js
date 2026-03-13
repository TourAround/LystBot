const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.lystbot');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

function read() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function write(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

function remove() {
  try {
    fs.unlinkSync(CONFIG_PATH);
    return true;
  } catch {
    return false;
  }
}

function getApiKey() {
  const cfg = read();
  if (!cfg || !cfg.apiKey) {
    console.error('❌ Not logged in. Run: lystbot login');
    process.exit(1);
  }
  return cfg.apiKey;
}

const PROD_URL = 'https://lystbot.com/api/v1';

let _customUrl = null;

function setCustomUrl(url) {
  _customUrl = url;
}

function getBaseUrl() {
  if (_customUrl) return _customUrl;
  if (process.env.LYSTBOT_API_URL) return process.env.LYSTBOT_API_URL;
  const cfg = read();
  if (cfg && cfg.apiUrl) return cfg.apiUrl;
  return PROD_URL;
}

module.exports = { read, write, remove, getApiKey, getBaseUrl, setCustomUrl, PROD_URL, CONFIG_PATH };
