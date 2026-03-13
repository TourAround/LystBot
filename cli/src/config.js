const fs = require('fs');
const path = require('path');
const os = require('os');

// Support per-agent config via LYSTBOT_CONFIG env var or --config flag
let _configPath = process.env.LYSTBOT_CONFIG || null;

function setConfigPath(p) {
  _configPath = p;
}

function getConfigDir() {
  if (_configPath) return path.dirname(_configPath);
  return path.join(os.homedir(), '.lystbot');
}

function getConfigPath() {
  if (_configPath) return _configPath;
  return path.join(os.homedir(), '.lystbot', 'config.json');
}

// Keep backwards compat
const CONFIG_DIR = path.join(os.homedir(), '.lystbot');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

function read() {
  try {
    const data = fs.readFileSync(getConfigPath(), 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function write(config) {
  fs.mkdirSync(getConfigDir(), { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2) + '\n');
}

function remove() {
  try {
    fs.unlinkSync(getConfigPath());
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

module.exports = { read, write, remove, getApiKey, getBaseUrl, setCustomUrl, setConfigPath, getConfigPath, PROD_URL, CONFIG_PATH };
