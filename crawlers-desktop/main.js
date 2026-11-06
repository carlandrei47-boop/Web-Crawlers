'use strict';
// Crawlers Desktop: a transparent, click-through overlay on every screen. Visual only - it never changes your files, windows or apps.
const { app, BrowserWindow, Tray, Menu, screen, desktopCapturer, globalShortcut, nativeImage, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

if (!app.requestSingleInstanceLock()) { app.quit(); }

const CREATURES = [
  ['random', 'Random'], ['centipede', 'Centipede (infection)'], ['spider', 'Spider (webs)'], ['ember', 'Fire hero'], ['zip', 'Speedster'], ['chomp', 'Chomper'],
  ['gang', 'Stick gang (all 5)'], ['orange', 'Orange stick'], ['red', 'Red stick'], ['green', 'Green stick'], ['yellow', 'Yellow stick'], ['blue', 'Blue stick'],
  ['ship', 'Starship'], ['tank', 'Pixel tank'], ['miner', 'Terrarian'], ['arena', 'Stick gang vs. endless waves']
];
const DEFAULTS = { species: 'random', scan: true, outline: true, reduced: false };
let settings = Object.assign({}, DEFAULTS), paused = false, quitting = false, tray = null, wins = [], worker = null, cursorTimer = null;
const lastHash = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
function loadSettings() { try { settings = Object.assign({}, DEFAULTS, JSON.parse(fs.readFileSync(settingsFile(), 'utf8'))); } catch (e) { settings = Object.assign({}, DEFAULTS); } }
function saveSettings() { try { fs.mkdirSync(path.dirname(settingsFile()), { recursive: true }); fs.writeFileSync(settingsFile(), JSON.stringify(settings)); } catch (e) {} }
const broadcast = (channel, payload) => { for (const w of wins) if (!w.win.isDestroyed()) w.win.webContents.send(channel, payload); };

function closeWindows() { for (const w of wins) { try { w.win.destroy(); } catch (e) {} } wins = []; }
function createWindows() {
  closeWindows();
  screen.getAllDisplays().forEach((d, index) => {
    const win = new BrowserWindow({
      x: d.bounds.x, y: d.bounds.y, width: d.bounds.width, height: d.bounds.height, transparent: true, backgroundColor: '#00000000', frame: false, resizable: false, movable: false,
      minimizable: false, maximizable: false, fullscreenable: false, focusable: false, skipTaskbar: true, hasShadow: false, alwaysOnTop: true, show: false,
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false }
    });
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setIgnoreMouseEvents(true, { forward: true });          // clicks and typing go straight through to whatever is underneath
    try { win.setContentProtection(true); } catch (e) {}        // keeps the overlay out of the screenshots used to read text
    try { win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); } catch (e) {}
    win.loadFile(path.join(__dirname, 'overlay.html'));
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('init', { species: settings.species, reduced: settings.reduced, outline: settings.outline, banner: index === 0 });
      win.showInactive();
    });
    wins.push({ win, display: d });
  });
}

function startCursorLoop() {
  clearInterval(cursorTimer);
  cursorTimer = setInterval(() => {
    if (paused || !wins.length) return;
    const p = screen.getCursorScreenPoint();
    for (const { win, display } of wins) {
      if (win.isDestroyed()) continue;
      const b = display.bounds, inside = p.x >= b.x && p.x < b.x + b.width && p.y >= b.y && p.y < b.y + b.height;
      win.webContents.send('cursor', { x: p.x - b.x, y: p.y - b.y, inside });
    }
  }, 16);
}

// ---- screen text scanner: screenshot -> OCR -> word boxes. Everything stays on this computer. ----
function collectWords(data) {
  if (Array.isArray(data.words) && data.words.length) return data.words;
  const out = [];
  for (const b of data.blocks || []) for (const p of b.paragraphs || []) for (const l of p.lines || []) for (const w of l.words || []) out.push(w);
  return out;
}
async function getWorker() {
  if (worker) return worker;
  const { createWorker } = require('tesseract.js');
  const cachePath = path.join(app.getPath('userData'), 'ocr');
  try { fs.mkdirSync(cachePath, { recursive: true }); } catch (e) {}
  try { worker = await createWorker('eng', 1, { cachePath }); } catch (e) { worker = await createWorker('eng'); }
  return worker;
}
function quickHash(img) {
  const bmp = img.resize({ width: 96, height: 54 }).toBitmap(); let h = 0;
  for (let i = 0; i < bmp.length; i += 4) h = (h * 31 + bmp[i] + (bmp[i + 1] << 1) + (bmp[i + 2] << 2)) | 0;
  return h;
}
async function scanDisplay(entry) {
  const d = entry.display, scale = Math.min(1, 1920 / (d.size.width * d.scaleFactor)) * d.scaleFactor;
  const thumbnailSize = { width: Math.round(d.size.width * scale), height: Math.round(d.size.height * scale) };
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize });
  const src = sources.find(s => String(s.display_id) === String(d.id)) || sources[0];
  if (!src || src.thumbnail.isEmpty()) return;
  const img = src.thumbnail, size = img.getSize(), hash = quickHash(img);
  if (lastHash.get(d.id) === hash) return;                      // nothing changed on this screen: skip the heavy OCR
  lastHash.set(d.id, hash);
  const png = img.toPNG(), wk = await getWorker();
  const result = await wk.recognize(png);
  const k = d.size.width / size.width;
  const list = collectWords(result.data || {}).filter(w => (w.confidence == null || w.confidence > 55) && w.bbox && /[\p{L}\p{N}]/u.test(w.text || '')).map(w => ({
    t: String(w.text).replace(/[^\p{L}\p{N}'’-]/gu, '') || String(w.text), x: w.bbox.x0 * k, y: w.bbox.y0 * k, w: (w.bbox.x1 - w.bbox.x0) * k, h: (w.bbox.y1 - w.bbox.y0) * k
  })).filter(w => w.t.length > 1 && w.w > 8 && w.h > 6 && w.h < 90);
  if (!entry.win.isDestroyed()) entry.win.webContents.send('scan', { words: list, png, imgW: size.width, imgH: size.height });
}
async function scanLoop() {
  while (!quitting) {
    if (!paused && settings.scan && wins.length) {
      for (const entry of wins.slice()) { try { await scanDisplay(entry); } catch (e) { console.error('[Crawlers] scan failed:', e && e.message); await sleep(5000); } }
    }
    await sleep(settings.scan ? 1200 : 2500);
  }
}

// ---- tray menu + hotkeys: always an obvious way to stop it ----
function buildMenu() {
  const set = (key, value) => { settings[key] = value; saveSettings(); broadcast('cmd', { type: key, value }); buildMenu(); };
  return Menu.buildFromTemplate([
    { label: 'Crawlers overlay', enabled: false },
    { label: paused ? 'Resume' : 'Pause', accelerator: 'CommandOrControl+Alt+P', click: () => { paused = !paused; broadcast('cmd', { type: 'pause', value: paused }); buildMenu(); } },
    { label: 'Special move now', accelerator: 'CommandOrControl+Alt+Space', click: () => broadcast('cmd', { type: 'special' }) },
    { label: 'Heal the screen (undo effects)', accelerator: 'CommandOrControl+Alt+H', click: () => broadcast('cmd', { type: 'heal' }) },
    { type: 'separator' },
    { label: 'Creature', submenu: CREATURES.map(([id, label]) => ({ label, type: 'radio', checked: settings.species === id, click: () => { settings.species = id; saveSettings(); broadcast('cmd', { type: 'species', value: id }); } })) },
    { label: 'Read screen text (needs a moment of CPU)', type: 'checkbox', checked: !!settings.scan, click: item => { settings.scan = item.checked; saveSettings(); } },
    { label: 'Pixel outline', type: 'checkbox', checked: !!settings.outline, click: item => set('outline', item.checked) },
    { label: 'Reduced effects (lighter on the CPU)', type: 'checkbox', checked: !!settings.reduced, click: item => set('reduced', item.checked) },
    { label: 'Show the "how to quit" banner', click: () => broadcast('cmd', { type: 'banner' }) },
    { type: 'separator' },
    { label: 'Quit', accelerator: 'CommandOrControl+Alt+Q', click: quit }
  ]);
}
function quit() {
  quitting = true; clearInterval(cursorTimer); try { globalShortcut.unregisterAll(); } catch (e) {}
  closeWindows(); if (worker) { try { worker.terminate(); } catch (e) {} }
  app.quit();
}

app.on('second-instance', () => { try { new Notification({ title: 'Crawlers is already running', body: 'Use the tray icon, or Ctrl+Alt+Q to quit it.' }).show(); } catch (e) {} });
app.on('window-all-closed', () => {});   // stay alive in the tray
app.whenReady().then(() => {
  if (app.dock) app.dock.hide();
  loadSettings();
  let icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  if (!icon.isEmpty()) icon = icon.resize({ width: 18, height: 18 });
  tray = new Tray(icon); tray.setToolTip('Crawlers overlay - click for options, Ctrl+Alt+Q quits'); tray.setContextMenu(buildMenu()); tray.on('click', () => tray.popUpContextMenu(buildMenu()));
  globalShortcut.register('CommandOrControl+Alt+Q', quit);
  globalShortcut.register('CommandOrControl+Alt+P', () => { paused = !paused; broadcast('cmd', { type: 'pause', value: paused }); tray.setContextMenu(buildMenu()); });
  globalShortcut.register('CommandOrControl+Alt+Space', () => broadcast('cmd', { type: 'special' }));
  globalShortcut.register('CommandOrControl+Alt+H', () => broadcast('cmd', { type: 'heal' }));
  createWindows(); startCursorLoop(); scanLoop();
  for (const ev of ['display-added', 'display-removed', 'display-metrics-changed']) screen.on(ev, () => { lastHash.clear(); createWindows(); });
  try { new Notification({ title: 'Crawlers is running', body: 'It only draws on top of your screen. Quit any time with Ctrl+Alt+Q or the tray icon.' }).show(); } catch (e) {}
});
