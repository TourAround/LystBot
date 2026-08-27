const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readImageFile, normalizeUrl } = require('../src/api');

test('readImageFile returns buffer, filename and mime type from the extension', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lystbot-')), 'shot.PNG');
  fs.writeFileSync(file, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

  const result = readImageFile(file);
  assert.equal(result.filename, 'shot.PNG');
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.buffer.length, 4);
});

test('readImageFile falls back to a generic mime type for unknown extensions', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lystbot-')), 'scan.bin');
  fs.writeFileSync(file, Buffer.from([1, 2, 3]));

  assert.equal(readImageFile(file).mimeType, 'application/octet-stream');
});

test('readImageFile rejects missing and empty files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lystbot-'));
  const empty = path.join(dir, 'empty.png');
  fs.writeFileSync(empty, '');

  assert.throws(() => readImageFile(path.join(dir, 'nope.png')), /file not found/);
  assert.throws(() => readImageFile(empty), /file is empty/);
});

test('normalizeUrl accepts http(s) and trims, rejects everything else', () => {
  assert.equal(normalizeUrl('  https://example.com/a?b=1  '), 'https://example.com/a?b=1');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com');

  for (const bad of ['', 'example.com', 'file:///etc/passwd', 'javascript:alert(1)', null, undefined]) {
    assert.throws(() => normalizeUrl(bad), /Invalid URL/);
  }
});
