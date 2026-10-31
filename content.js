(() => {
if (window.__crawlerLoaded) return; window.__crawlerLoaded = 1;
console.log('[Crawlers v2.7] running on', location.href);
const api = globalThis.browser || globalThis.chrome, R = Math.random, TAU = 6.2832;
const C = { b: '#3b5bff', y: '#ffd400', r: '#e0301e', p: '#ff4d8d', c: '#27d3c3', g: '#7dff2a', o: '#ff8a1f', w: '#dff3ff' }, PAL = [C.p, C.c, C.g, C.y];
const tierOf = xp => xp > 200 ? { n: 'Legendary', c: '#9d00ff', s: 1.3 } : xp > 80 ? { n: 'Shadow', c: C.p, s: 1.18 } : xp > 30 ? { n: 'Electric', c: C.y, s: 1.08 } : { n: 'Baby', c: C.c, s: 1 };
let on = false, paused = false, reducedEffects = false, species = 'random', power = 'random', host, cv, x, raf, W, H, D, tx, ty, last = 0, fr = 0, crit, xp = 0, boost = 0, lastEatAt = 0;
let lastInputAt = 0, lastProgressAt = 0, lastAutoScrollAt = 0, autoScrollUntil = 0, autoScrollCueUntil = 0, observedXp = 0;
let ledges = [], temps = [], pool = [], bridges = [], infected = [], toxinWords = [];
let spans = [], debris = [], parts = [], rings = [], webs = [], threads = [], traps = [], plats = [], platT = 0, visualHits = [];

// ---------- words ----------
function grab(px, py) {
  let r;
  if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(px, py); if (!p) return; r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); }
  else if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(px, py);
  if (!r) return;
  const n = r.startContainer; if (n.nodeType !== 3) return;
  const el = n.parentElement;
  if (!el || el.closest('input,textarea,select,[contenteditable],script,style,svg,canvas')) return;
  const near = b => !(px < b.left - 14 || px > b.right + 14 || py < b.top - 14 || py > b.bottom + 14);
  if (el.dataset.crawl) return el.dataset.t || !near(el.getBoundingClientRect()) ? undefined : el;
  const t = n.data; let a = r.startOffset, b = a;
  while (a > 0 && /\S/.test(t[a - 1])) a--;
  while (b < t.length && /\S/.test(t[b])) b++;
  if (b - a < 2 || b - a > 24) return;
  const rg = document.createRange(); rg.setStart(n, a); rg.setEnd(n, b);
  const bb = rg.getBoundingClientRect(); if (!bb.width || !near(bb)) return;
  const s = document.createElement('span'); s.dataset.crawl = '1'; s.dataset.o = t.slice(a, b);
  try { rg.surroundContents(s); } catch (e) { return; }
  spans.push(s); return s;
}
function burst(px, py, n, c, g) { const limit = reducedEffects ? 180 : 500; if (reducedEffects) n = Math.ceil(n * .45); for (let i = 0; i < n && parts.length < limit; i++) { const a = R() * TAU, v = 1 + R() * 3.5; parts.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c, g: g || 0 }); } }
function ring(px, py, m, c) { rings.push({ x: px, y: py, r: 4, m, c, l: 1 }); }
function toss(s, txt, kind, o) {
  o = o || {}; kind = kind || 'label';
  if (kind === 'label') {
    let copies = 0;
    for (const d of debris) if (d.t === txt && d.k === 'label' && ++copies >= 2) return false;
  }
  if (debris.length > 120) debris.shift();
  const b = s.getBoundingClientRect(), cs = getComputedStyle(s), fs = parseFloat(cs.fontSize) || 14, item = kind !== 'label';
  const font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily; x.font = font;
  debris.push({ b: performance.now(), t: txt, k: kind, font, h: item ? 12 : fs + 6, w: item ? 12 : x.measureText(txt).width + 8,
    px: b.left + scrollX + (item ? b.width / 2 : 0), py: b.top + scrollY + b.height / 2,
    vx: o.vx != null ? o.vx : (R() - .5) * 9, vy: o.vy != null ? o.vy : (R() - .5) * 9, g: o.g || 0, pull: o.pull ? .03 : 0,
    rot: item ? 0 : (R() - .5) * .8, vr: item ? 0 : (R() - .5) * .12, c: o.col || PAL[R() * 4 | 0] });
  return true;
}
function wipe(s, kind, o) {
  if (s.dataset.t) return false;
  if (s.dataset.v && performance.now() < Number(s.dataset.vUntil)) return false;
  if (kind !== 'boom' && !toss(s, o && o.text != null ? o.text : s.textContent, kind, o)) return false;
  s.dataset.t = 1; xp++;
  const b = s.getBoundingClientRect(); burst(b.left + b.width / 2, b.top + b.height / 2, kind === 'boom' ? 16 : 8, (o && o.col) || PAL[R() * 4 | 0]);
  if (kind === 'boom') { s.style.setProperty('visibility', 'hidden', 'important'); return; }
  s.style.setProperty('visibility', 'hidden', 'important');
  return true;
}
function infect(s, col = C.g) {
  if (s.dataset.t || s.dataset.v || infected.length >= 300) return false;
  const expires = performance.now() + 20000;
  const original = s.dataset.o || s.textContent;
  if (original && !toxinWords.includes(original)) {
    if (toxinWords.length >= 80) toxinWords.shift();
    toxinWords.push(original);
  }
  s.dataset.v = '1';
  s.dataset.vUntil = String(expires);
  s.style.setProperty('color', col, 'important');
  s.style.setProperty('text-shadow', '0 0 7px ' + col + ', 0 0 12px ' + col, 'important');
  s.textContent = nextToxinWord(s, original);
  infected.push({ element: s, expires, color: col });
  return true;
}
function nextToxinWord(s, original) {
  const alternatives = toxinWords.filter(word => word !== s.textContent);
  if (alternatives.length) return alternatives[R() * alternatives.length | 0];
  return original.length > 1 ? original.slice(1) + original[0] : original;
}
function infectAlongPath(x1, y1, x2, y2, col) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.min(48, Math.max(2, Math.ceil(distance / 24)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const element = grab(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    if (element) infect(element, col);
  }
}
function randomScreenWord(exclude, fromX, fromY, minDistance = 0) {
  for (let i = 0; i < 18; i++) {
    const element = grab(12 + R() * Math.max(1, W - 24), 12 + R() * Math.max(1, H - 24));
    if (!element || element === exclude || element.dataset.t || element.dataset.v || element.dataset.w || element.dataset.b) continue;
    if (minDistance) {
      const rect = element.getBoundingClientRect();
      if (Math.hypot(rect.left + rect.width / 2 - fromX, rect.top + rect.height / 2 - fromY) < minDistance) continue;
    }
    return element;
  }
  return null;
}
function findWordTarget() {
  const targets = [];
  for (let row = 0; row < 6; row++) for (let col = 0; col < 8; col++) {
    const px = (col + .2 + R() * .6) * W / 8;
    const py = (row + .2 + R() * .6) * H / 6;
    const element = grab(px, py);
    if (element && !element.dataset.t && !element.dataset.v && !targets.includes(element)) targets.push(element);
  }
  if (!targets.length) return null;
  const target = targets[R() * targets.length | 0], rect = target.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
function updateInfected(now) {
  infected = infected.filter(status => {
    const s = status.element;
    if (!s.isConnected || s.dataset.t) return false;
    if (now < status.expires) {
      s.textContent = nextToxinWord(s, s.dataset.o);
      return true;
    }
    if (!wipe(s, 'label', { g: .1, vy: -1, col: status.color, text: s.dataset.o })) return true;
    return false;
  });
}
function restoreAll() {
  restoreVisuals();
  for (const s of spans) { if (!s.isConnected) continue; const p = s.parentNode; s.replaceWith(document.createTextNode(s.dataset.o)); p && p.normalize && p.normalize(); }
  pool = []; bridges = []; temps = []; infected = []; toxinWords = [];
  spans = []; debris = []; parts = []; rings = []; webs = []; threads = []; traps = [];
}

// ---------- pictures / boxes ----------
function undoVisual(v) { if (!v.done) { v.done = 1; if (v.el.isConnected) { v.o === null ? v.el.removeAttribute('style') : v.el.setAttribute('style', v.o); v.el.removeAttribute('data-crawlv'); } } }
function restoreVisuals() { visualHits.forEach(undoVisual); visualHits = []; }
function hitVisual(px, py) {
  visualHits = visualHits.filter(v => !v.done);
  if (visualHits.some(v => !v.done)) return;
  const list = (document.elementsFromPoint ? document.elementsFromPoint(px, py) : []).filter(e => e !== host && e.tagName !== 'HTML' && !e.dataset.crawlv);
  if (!list.length) return;
  const el = list[R() * Math.min(3, list.length) | 0], modes = ['rainbow', 'bounce', 'neon', 'matrix', 'glitch', 'tilt', 'flip'], mode = power === 'random' ? modes[R() * modes.length | 0] : power, st = el.style;
  const v = { el, o: el.getAttribute('style') }; visualHits.push(v); el.dataset.crawlv = '1';
  st.setProperty('transition', 'filter .4s ease, transform .4s ease', 'important');
  if (mode === 'rainbow') st.setProperty('filter', 'hue-rotate(' + (R() * 360 | 0) + 'deg) saturate(1.5)', 'important');
  else if (mode === 'bounce') st.setProperty('transform', 'translateY(-4px) scale(1.03)', 'important');
  else if (mode === 'neon') st.setProperty('filter', 'drop-shadow(0 0 8px ' + PAL[R() * 4 | 0] + ') saturate(1.4)', 'important');
  else if (mode === 'matrix') st.setProperty('filter', 'hue-rotate(90deg) saturate(2.2) contrast(1.15)', 'important');
  else if (mode === 'tilt') st.setProperty('transform', 'rotate(' + ((R() - .5) * 4).toFixed(1) + 'deg)', 'important');
  else if (mode === 'flip') {
    const dir = ['left', 'right', 'up', 'down'][R() * 4 | 0];
    const transform = dir === 'left' ? 'scaleX(-1)' : dir === 'right' ? 'scaleX(1)' : dir === 'up' ? 'scaleY(-1)' : 'scaleY(1)';
    st.setProperty('transform-origin', 'center center', 'important');
    st.setProperty('transform', transform, 'important');
  }
  else st.setProperty('filter', 'contrast(2) invert(.8)', 'important');
  setTimeout(() => undoVisual(v), 2800);
}

// ---------- invisible text platform tracking ----------
function buildPlats() {
  const out = [], tw = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT); let n, seen = 0;
  while ((n = tw.nextNode()) && seen++ < 4000) {
    if (!/\S/.test(n.data)) continue;
    const p = n.parentElement; if (!p || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const r of rg.getClientRects()) if (r.width > 24 && r.height > 6 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W) out.push({ l: r.left, r: r.right, t: r.top });
    if (out.length > 1500) break;
  }
  plats = out.concat(ledges);
}
function makeLedges() {
  ledges = [];
  for (let y = H - 85, row = 0; y > 30; y -= 85, row++) { let xx = (row % 2) * 90 + R() * 60; while (xx < W) { const wd = 110 + R() * 90; ledges.push({ l: xx, r: Math.min(W, xx + wd), t: y + (R() - .5) * 14 }); xx += wd + 90 + R() * 120; } }
}
function walker() { return { x: W * (.25 + R() * .5), y: H * .3, vx: 0, vy: 0, face: 1, ground: false, drop: 0, jc: 0, hit: 0, st: 0, bt: 0, lx: null }; }
function warp(w, gx, gy) {
  let best = null, bs = 1e9;
  for (const p of plats) { if (p.t < 20 || p.t > H - 40) continue; const sc = Math.abs(p.t - gy) + Math.abs((p.l + p.r) / 2 - gx) * .4; if (sc < bs) { bs = sc; best = p; } }
  if (best) { burst(w.x, w.y, 14, C.w); w.x = (best.l + best.r) / 2; w.y = best.t - 2; w.vy = 0; w.vx = 0; burst(w.x, w.y, 14, C.w); }
  w.bt = 0;
}
function phys(w, run, jump, free, extraPlats, arenaTarget) {
  const gx = arenaTarget ? arenaTarget.x : w.tx != null ? w.tx : tx;
  const gy = arenaTarget ? arenaTarget.y : w.ty != null ? w.ty : ty;
  let tgx = gx;
  const all = extraPlats !== undefined ? extraPlats : temps.length ? plats.concat(temps) : plats;
  if (!free && w.ground && gy < w.y - 40) {
    let best = null, bs = 1e9;
    for (let pass = 0; pass < 2 && !best; pass++) {
      const lim = pass ? 1e9 : 170;
      for (const p of all) { const dy = w.y - p.t; if (dy < 18 || dy > 105) continue; const m = Math.min(24, (p.r - p.l) / 2), cx = Math.max(p.l + m, Math.min(p.r - m, w.x)), dxp = Math.abs(cx - w.x); if (dxp > lim) continue; const sc = dxp + Math.abs(p.t - gy) * .6 + Math.abs((p.l + p.r) / 2 - gx) * .15; if (sc < bs) { bs = sc; best = { x: cx }; } }
    }
    w.nav = best;
  } else if (w.ground) w.nav = null;
  if (w.nav) tgx = w.nav.x; else if (!w.ground && w.navx != null) tgx = w.navx;
  const dx = tgx - w.x;
  if (!free) { const want = Math.abs(dx) > 10 ? Math.sign(dx) * (w.nav && Math.abs(dx) < 40 ? Math.max(1.2, Math.abs(dx) * .12) : run) : 0; w.vx += (want - w.vx) * (w.ground ? .25 : .08); if (want) w.face = Math.sign(dx); }
  w.jc--; if (!free && w.ground && w.jc <= 0 && gy < w.y - 36 && (!w.nav || (Math.abs(dx) < 12 && Math.abs(w.vx) < 1.6) || (Math.sign(w.vx) === Math.sign(dx) && Math.abs(dx) < Math.max(14, Math.abs(w.vx) * 24)))) { w.vy = -jump; w.ground = false; w.jc = 25; w.navx = w.nav ? w.nav.x : null; }
  if (!free && w.ground && gy > w.y + 50 && R() < .04) w.drop = 14;
  if (!free) {
    if (w.lx != null && Math.abs(w.x - w.lx) < .5 && Math.abs(gx - w.x) > 40) w.st++; else w.st = 0; w.lx = w.x;
    if (w.st > 70) { w.vy = -15; w.vx = (R() - .5) * 14; w.st = 0; w.ground = false; }
    if (w.y >= H - 1 && gy < H - 120) w.bt++; else w.bt = 0;
    // Keep enemies from snapping to a random platform when they get stuck.
    // A forced warp makes their movement look like instant teleportation.
    if (w.bt > 150) { w.vx = (R() - .5) * 12; w.vy = -8; w.bt = 0; w.ground = false; }
  }
  w.vy = Math.min(w.vy + .62, 18); const py = w.y; w.x += w.vx; w.y += w.vy; if (w.drop > 0) w.drop--;
  w.ground = false; w.hit = 0;
  if (w.vy >= 0 && !w.drop) {
    let best = null;
    for (const p of all) if (w.x > p.l - 3 && w.x < p.r + 3 && py <= p.t + 1 && w.y >= p.t && (!best || p.t < best.t)) best = p;
    if (best) { w.hit = w.vy; w.y = best.t; w.vy = 0; w.ground = true; w.navx = null; }
  }
  if (w.y >= H) { w.hit = w.vy; w.y = H; w.vy = 0; w.ground = true; w.navx = null; }
  w.x = Math.max(10, Math.min(W - 10, w.x)); const minY = w.minY || 26; if (w.y < minY) { w.y = minY; if (w.vy < 0) w.vy = 0; }
}
function steer(h, max) {
  const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy) || 1;
  let da = Math.atan2(dy, dx) - h.a; da = Math.atan2(Math.sin(da), Math.cos(da)); h.a += da * .09;
  const sp = Math.min(d * .06, max * (1 + boost * 1.6)); h.x += Math.cos(h.a) * sp; h.y += Math.sin(h.a) * sp;
}
function line(a, b, c, d) { x.moveTo(a, b); x.lineTo(c, d); }
const rnd = (cx, cy, r) => { const a = R() * TAU, d = R() * r; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; };

// ---------- CENTIPEDE ----------
function centipede(arenaMode, arenaColor, arenaLock = false) {
  const N = 15, S = 20, seg = [], legs = [], lasers = [];
  const tox = arenaColor ? [arenaColor, arenaColor, arenaColor, arenaColor, arenaColor] : [C.g, C.p, C.c, C.y, '#9d00ff'];
  const outline = arenaColor || C.g, headColor = arenaColor || '#ff4d5a';
  let arenaTarget = { x: W / 2, y: H / 2 };
  for (let i = 0; i < N; i++) {
    const px = W * .5 - i * S, py = H * .5;
    seg.push({ x: px, y: py, a: 0, trailX: px, trailY: py });
  }
  seg.forEach((s, i) => { if (i) for (const k of [-1, 1]) legs.push({ s, i, k, fx: s.x, fy: s.y + k * 20, tx: 0, ty: 0, sx: 0, sy: 0, t: 1, hx: 0, hy: 0 }); });
  const fireLaser = (x1, y1, x2, y2, victim) => {
    if (lasers.length > 12) lasers.shift();
    const col = tox[R() * tox.length | 0];
    infectAlongPath(x1, y1, x2, y2, col);
    burst(x2, y2, 12, col);
    ring(x2, y2, 46, col);
    lasers.push({ type: 'toxin', x1, y1, x2, y2, life: 24, col, victim, applied: false });
  };
  return {
    col: outline, tiered: true, vac: true, pts: () => seg,
    arenaPosition() { return seg[0]; },
    setArenaTarget(px, py) { arenaTarget = { x: px, y: py }; },
    arenaAttack(px, py, victim) { fireLaser(seg[0].x, seg[0].y, px, py, victim); },
    arenaEffects() { return lasers; },
    click(px, py) { ring(px, py, 150, C.g); burst(px, py, 30, C.g, .15); boost = 1; for (let i = 0; i < 4; i++) setTimeout(() => { const p = rnd(px, py, 130), s = grab(p[0], p[1]); s && infect(s); }, i * 150); },
    update() {
      const h = seg[0];
      if (arenaMode) {
        if (arenaLock) {
          h.x = arenaTarget.x; h.y = arenaTarget.y;
        } else {
          const dx = arenaTarget.x - h.x, dy = arenaTarget.y - h.y, d = Math.hypot(dx, dy) || 1;
          let da = Math.atan2(dy, dx) - h.a; da = Math.atan2(Math.sin(da), Math.cos(da)); h.a += da * .12;
          const speed = Math.min(d * .08, 2.5); h.x += Math.cos(h.a) * speed; h.y += Math.sin(h.a) * speed;
          const margin = Math.min(140, W * .4);
          h.x = Math.max(margin, Math.min(W - margin, h.x));
          const marginY = Math.min(34, H * .25);
          h.y = Math.max(marginY, Math.min(H - marginY, h.y));
        }
      } else steer(h, 3.4);
      for (let i = 1; i < N; i++) { const p = seg[i - 1], s = seg[i], a = Math.atan2(p.y - s.y, p.x - s.x); s.a = a; s.x = p.x - Math.cos(a) * S; s.y = p.y - Math.sin(a) * S; }
      for (const segment of seg) {
        if (Math.hypot(segment.x - segment.trailX, segment.y - segment.trailY) < 10) continue;
        infectAlongPath(segment.trailX, segment.trailY, segment.x, segment.y, tox[R() * tox.length | 0]);
        segment.trailX = segment.x;
        segment.trailY = segment.y;
      }
      if (!arenaMode && fr % 48 === 0) {
        const target = findWordTarget(h.x, h.y, h.a);
        if (target) fireLaser(h.x, h.y, target.x, target.y);
      }
      if (fr % (reducedEffects ? 24 : 12) === 0 && parts.length < (reducedEffects ? 120 : 400)) { const b = seg[R() * N | 0]; parts.push({ x: b.x, y: b.y, vx: (R() - .5) * .6, vy: .3, l: 1, c: tox[R() * tox.length | 0], g: .04 }); }
      for (const l of legs) {
        const s = l.s, c = Math.cos(s.a), n = Math.sin(s.a), L = l.i >= N - 2 ? 46 : 32;
        l.hx = s.x - n * l.k * 7; l.hy = s.y + c * l.k * 7;
        if (l.t >= 1) { if (Math.hypot(l.hx - l.fx, l.hy - l.fy) > L) { l.sx = l.fx; l.sy = l.fy; l.tx = l.hx + c * L * .6 - n * l.k * L * .7; l.ty = l.hy + n * L * .6 + c * l.k * L * .7; l.t = 0; } }
        else { l.t = Math.min(1, l.t + .14); l.fx = l.sx + (l.tx - l.sx) * l.t; l.fy = l.sy + (l.ty - l.sy) * l.t; }
      }
      for (let i = lasers.length - 1; i >= 0; i--) { const l = lasers[i]; l.life--; if (l.life <= 0) lasers.splice(i, 1); }
    },
    draw(now) {
      const h = seg[0];
      for (const l of lasers) {
        const pulse = .65 + Math.sin(now / 35) * .2, dx = l.x2 - l.x1, dy = l.y2 - l.y1, length = Math.hypot(dx, dy) || 1;
        x.save(); x.globalAlpha = pulse * Math.min(1, l.life / 5); x.lineCap = 'round';
        x.strokeStyle = l.col; x.lineWidth = 8; x.shadowColor = l.col; x.shadowBlur = 20;
        x.beginPath(); line(l.x1, l.y1, l.x2, l.y2); x.stroke();
        x.strokeStyle = '#fff'; x.lineWidth = 2.2; x.shadowBlur = 8;
        x.beginPath(); line(l.x1, l.y1, l.x2, l.y2); x.stroke();
        x.strokeStyle = l.col; x.lineWidth = 1.2; x.beginPath();
        for (let i = 0; i <= 8; i++) {
          const t = i / 8, j = i === 0 || i === 8 ? 0 : Math.sin(now / 24 + i * 7) * 5;
          const px = l.x1 + dx * t - dy / length * j, py = l.y1 + dy * t + dx / length * j;
          if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
        }
        x.stroke();
        x.globalAlpha = pulse; x.fillStyle = '#fff'; x.shadowColor = l.col; x.shadowBlur = 16;
        x.beginPath(); x.arc(l.x2, l.y2, 3 + Math.sin(now / 30) * 1.5, 0, TAU); x.fill();
        x.restore();
      }
      x.lineWidth = .6; x.strokeStyle = outline; x.globalAlpha = .35; x.beginPath();
      for (let j = 2; j < legs.length; j++) { line(legs[j].fx, legs[j].fy, legs[j - 2].fx, legs[j - 2].fy); line(legs[j].fx, legs[j].fy, legs[j - 1].fx, legs[j - 1].fy); }
      x.stroke(); x.globalAlpha = 1; x.lineWidth = 1.2;
      for (const l of legs) {
        const c = Math.cos(l.s.a), n = Math.sin(l.s.a), kx = (l.hx + l.fx) / 2 - n * l.k * 9, ky = (l.hy + l.fy) / 2 + c * l.k * 9;
        x.strokeStyle = outline; x.beginPath(); line(l.hx, l.hy, kx, ky); x.lineTo(l.fx, l.fy); x.stroke();
        x.fillStyle = tox[(l.i + (fr / 3 | 0)) % tox.length]; x.beginPath(); x.arc(l.fx, l.fy, l.t < 1 ? 3 : 2, 0, 7); x.fill();
      }
      for (let i = N - 1; i >= 0; i--) {
        const s = seg[i], w = Math.sin(now / 160 - i * .7) * 3; x.save(); x.translate(s.x - Math.sin(s.a) * w, s.y + Math.cos(s.a) * w); x.rotate(s.a);
        x.fillStyle = i ? tox[(i + (fr / 4 | 0)) % tox.length] : headColor; x.globalAlpha = i ? .85 : 1; x.fillRect(-S / 2 + 2, -7, S - 4, 14); x.globalAlpha = 1;
        x.strokeStyle = outline; x.lineWidth = 1.5; x.strokeRect(-S / 2 + 2, -7, S - 4, 14); x.lineWidth = 1; x.strokeRect(-3, -4, 6, 8); x.restore();
      }
      x.strokeStyle = outline; x.lineWidth = 1;
      for (const k of [-1, 1]) { const a = h.a + k * .5 + Math.sin(now / 200 + k) * .25; x.beginPath(); line(h.x + Math.cos(h.a) * 9, h.y + Math.sin(h.a) * 9, h.x + Math.cos(a) * 34, h.y + Math.sin(a) * 34); x.stroke(); }
    }
  };
}

// ---------- SPIDER ----------
function swapPair(br) {
  const A = br.a, B = br.b, ta = A.textContent, tb = B.textContent, r = R();
  if (r < .55) { A.textContent = tb; B.textContent = ta; }
  else if (r < .8) { const h = t => Math.ceil(t.length / 2); A.textContent = ta.slice(0, h(ta)) + tb.slice(h(tb)); B.textContent = tb.slice(0, h(tb)) + ta.slice(h(ta)); }
  else { (R() < .5 ? A : B).textContent = pool[R() * pool.length | 0] || ta; }
  xp++;
}
function bridge(from) {
  if (bridges.length >= 12) return;
  const ok = q => q && !q.dataset.t && !q.dataset.w && !q.dataset.b && !q.dataset.v;
  const a = randomScreenWord();
  if (!a) return;
  const rect = a.getBoundingClientRect(), ax = rect.left + rect.width / 2, ay = rect.top + rect.height / 2;
  const b = randomScreenWord(a, ax, ay, Math.hypot(W, H) * .35);
  if (!ok(a) || !ok(b) || a === b) return;
  for (const q of [a, b]) { q.dataset.b = 1; pool.push(q.dataset.o); q.style.setProperty('color', C.c, 'important'); q.style.setProperty('border-bottom', '1px solid ' + C.c, 'important'); }
  if (pool.length > 300) pool.splice(0, 50);
  bridges.push({ a, b, l: 0, src: from, pulses: [{ p: 0, d: 1 }, { p: .5, d: -1 }] });
}
function web(s, from) {
  if (s.dataset.t || s.dataset.w || s.dataset.b || s.dataset.v) return; s.dataset.w = 1;
  const st = s.style; st.setProperty('text-decoration', 'line-through', 'important'); st.setProperty('color', C.w, 'important'); st.setProperty('opacity', '.7', 'important');
  webs.push({ p: from, s, l: 0 });
}
function spider(arenaMode, arenaColor, arenaLock = false) {
  const h = { x: W / 2, y: H / 2, a: 0 }, ab = { x: h.x - 26, y: h.y, a: 0 }, legs = [], trail = [];
  const bodyColor = arenaColor || C.c, webColor = arenaColor || C.w;
  const legColor = arenaColor || C.c, spotColor = arenaColor || C.g;
  let arenaTarget = { x: W / 2, y: H / 2 }, arenaThreat = { x: W / 2, y: H / 2 };
  const arenaNets = [];
  for (const k of [-1, 1]) for (let j = 0; j < 4; j++) legs.push({ k, ang: k * (.55 + j * .42), L: 96 - j * 4, fx: h.x, fy: h.y + k * 30, sx: 0, sy: 0, tx: 0, ty: 0, t: 1 });
  return {
    col: bodyColor, tiered: true, reel: true, eat: 22, pts: () => [h, ab],
    arenaPosition() { return h; },
    setArenaTarget(px, py) { arenaTarget = { x: px, y: py }; },
    arenaAttack(px, py, victim) { arenaNets.push({ type: 'web', x: px, y: py, life: 22, victim, applied: false }); },
    arenaEffects() { return arenaNets; },
    click(px, py) { ring(px, py, 150, C.w); traps.push({ x: px, y: py, l: 1 }); boost = 1; for (let i = 0; i < 12; i++) { const p = rnd(px, py, 130), s = grab(p[0], p[1]); s && web(s, { x: px, y: py }); } },
    update() {
      if (arenaMode) {
        if (arenaLock) {
          h.x = arenaTarget.x; h.y = arenaTarget.y;
        } else {
          const dx = arenaTarget.x - h.x, dy = arenaTarget.y - h.y, d = Math.hypot(dx, dy) || 1;
          let da = Math.atan2(dy, dx) - h.a; da = Math.atan2(Math.sin(da), Math.cos(da)); h.a += da * .12;
          const speed = Math.min(d * .08, 2.5); h.x += Math.cos(h.a) * speed; h.y += Math.sin(h.a) * speed;
          const margin = Math.min(104, W * .35);
          h.x = Math.max(margin, Math.min(W - margin, h.x));
          const marginY = Math.min(104, H * .35);
          h.y = Math.max(marginY, Math.min(H - marginY, h.y));
        }
      } else {
        if (fr % 8 == 0) { let n = 0; for (const d of debris) if (d.pull) n++; if (n < 4) for (const d of debris) if (!d.pull) { d.pull = .06; break; } }
        if (fr % 45 == 0) bridge(h);
        steer(h, 3);
      }
      trail.push({ x: h.x, y: h.y }); if (trail.length > 60) trail.shift();
      ab.a = Math.atan2(h.y - ab.y, h.x - ab.x); ab.x = h.x - Math.cos(ab.a) * 26; ab.y = h.y - Math.sin(ab.a) * 26;
      if (fr % 90 == 0 && webs.length < 4) { const s = randomScreenWord(); if (s) web(s, h); }
      for (const l of legs) {
        const rx = h.x + Math.cos(h.a + l.ang) * l.L, ry = h.y + Math.sin(h.a + l.ang) * l.L;
        if (l.t >= 1) { if (Math.hypot(rx - l.fx, ry - l.fy) > l.L * .5) { l.sx = l.fx; l.sy = l.fy; l.tx = rx + Math.cos(h.a) * 12; l.ty = ry + Math.sin(h.a) * 12; l.t = 0; } }
        else { l.t = Math.min(1, l.t + .13); l.fx = l.sx + (l.tx - l.sx) * l.t; l.fy = l.sy + (l.ty - l.sy) * l.t; if (l.t >= 1) { threads.push({ x1: l.sx + scrollX, y1: l.sy + scrollY, x2: l.fx + scrollX, y2: l.fy + scrollY, b: performance.now(), c: C.w }); if (threads.length > 140) threads.shift(); } }
      }
      if (arenaMode) for (let i = arenaNets.length - 1; i >= 0; i--) if (--arenaNets[i].life <= 0) arenaNets.splice(i, 1);
    },
    draw() {
      for (const net of arenaNets) {
        x.save(); x.globalAlpha = net.life / 22; x.strokeStyle = webColor; x.lineWidth = 1.4;
        x.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = i * TAU / 8;
          line(net.x, net.y, net.x + Math.cos(a) * 32, net.y + Math.sin(a) * 32);
        }
        for (let r = 8; r <= 32; r += 8) for (let i = 0; i < 8; i++) {
          const a = i * TAU / 8, b = a + TAU / 8;
          line(net.x + Math.cos(a) * r, net.y + Math.sin(a) * r, net.x + Math.cos(b) * r, net.y + Math.sin(b) * r);
        }
        x.stroke(); x.restore();
      }
      x.strokeStyle = webColor; x.lineWidth = 1.5;
      for (let i = 1; i < trail.length; i++) { x.globalAlpha = i / trail.length * .5; x.beginPath(); line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y); x.stroke(); }
      x.lineWidth = .6; x.strokeStyle = legColor; x.globalAlpha = .45; x.beginPath();
      legs.forEach((l, i) => { line(h.x, h.y, l.fx, l.fy); if (i % 4) line(l.fx, l.fy, legs[i - 1].fx, legs[i - 1].fy); });
      x.stroke(); x.globalAlpha = 1; x.lineWidth = 1.2;
      for (const l of legs) {
        const kx = (h.x + l.fx) / 2 - Math.sin(h.a) * l.k * 26, ky = (h.y + l.fy) / 2 + Math.cos(h.a) * l.k * 26;
        x.strokeStyle = legColor; x.beginPath(); line(h.x, h.y, kx, ky); x.lineTo(l.fx, l.fy); x.stroke();
        x.fillStyle = spotColor; x.beginPath(); x.arc(l.fx, l.fy, l.t < 1 ? 3.5 : 2.5, 0, 7); x.fill();
        x.fillStyle = legColor; x.beginPath(); x.arc(kx, ky, 2, 0, 7); x.fill();
      }
      for (const [b, w, hh] of [[ab, 30, 22], [h, 18, 14]]) {
        x.save(); x.translate(b.x, b.y); x.rotate(b.a); const cw = w / 3, ch = hh / 2;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { x.fillStyle = b === h ? bodyColor : arenaColor || ((i + j) % 2 ? '#0a0a0a' : spotColor); x.fillRect(-w / 2 + i * cw, -hh / 2 + j * ch, cw, ch); }
        x.strokeStyle = legColor; x.lineWidth = 1.5; x.strokeRect(-w / 2, -hh / 2, w, hh); x.restore();
      }
    }
  };
}

// ---------- EMBER ----------
function ember(arenaMode = false) {
  const w = walker(), fb = []; let cd = 30, arenaTarget = { x: W / 2, y: H / 2 }, arenaFloor = null;
  const throwF = (dir, d, aim) => fb.push({
    x: w.x + dir * 12, y: w.y - 22,
    vx: aim ? Math.cos(aim) * 7 : dir * 6.5,
    vy: aim ? Math.sin(aim) * 7 : -1 - d, b: 0, age: 0
  });
  return {
    col: C.o, needsPlats: true, eat: 22, pts: () => [{ x: w.x, y: w.y - 14 }],
    arenaPosition() { return { x: w.x, y: w.y - 14 }; },
    setArenaFloor(floor) { arenaFloor = floor; },
    setArenaTarget(px, py) { arenaTarget = { x: px, y: py }; },
    arenaAttack(px, py) {
      const aim = Math.atan2(py - (w.y - 22), px - w.x);
      throwF(Math.cos(aim) < 0 ? -1 : 1, 0, aim);
      cd = 40;
    },
    arenaShots() { return fb; },
    removeArenaShot(shot) { const i = fb.indexOf(shot); if (i >= 0) fb.splice(i, 1); },
    click(px) { const dir = px >= w.x ? 1 : -1; w.face = dir; for (let i = 0; i < 3; i++) setTimeout(() => throwF(dir, i * 1.2), i * 90); ring(w.x, w.y - 20, 60, C.o);     },
    update() {
      phys(w, 4.2, 12, false, arenaMode && arenaFloor ? plats.concat(arenaFloor) : undefined, arenaMode ? arenaTarget : undefined);
      if (w.hit > 6) { const s = grab(w.x, w.y + 4); if (s) { wipe(s, 'coin', { g: .45, vx: (R() - .5) * 3, vy: -6, col: C.y }); ring(w.x, w.y, 45, C.y); w.vy = -7; w.ground = false; } }
      if (arenaMode) { if (cd > 0) cd--; }
      else if (--cd <= 0) { throwF(w.face, 0); cd = 38; }
      for (let i = fb.length - 1; i >= 0; i--) {
        const f = fb[i]; f.age++; f.vy += arenaMode ? .08 : .5; const py = f.y; f.x += f.vx; f.y += f.vy;
        if (f.vy > 0) { let hitP = f.y >= H ? { t: H } : null; for (const p of plats) if (f.x > p.l && f.x < p.r && py <= p.t + 1 && f.y >= p.t) { hitP = p; break; } if (hitP) { f.y = hitP.t; f.vy = -6.5; f.b++; } }
        let dead = f.age > 220 || f.b > 5 || f.x < -20 || f.x > W + 20;
        if (!dead && f.age % 2 == 0) { const s = grab(f.x, f.y); if (s) { wipe(s, 'coin', { g: .45, vx: f.vx * .4, vy: -5, col: C.y }); burst(f.x, f.y, 14, C.o); dead = true; } }
        if (dead) fb.splice(i, 1);
      }
    },
    draw(now) {
      x.save(); x.translate(w.x, w.y); x.scale(w.face, 1);
      const sw = w.ground ? Math.sin(w.x * .3) * 5 * Math.min(1, Math.abs(w.vx) / 2) : 6;
      x.fillStyle = '#3a2a1a'; x.fillRect(-6 + sw, -5, 6, 5); x.fillRect(1 - sw, -5, 6, 5);
      x.fillStyle = '#2b4cff'; x.fillRect(-6, -14, 13, 10); x.fillStyle = '#ff7a1a'; x.fillRect(-7, -24, 15, 11);
      x.fillStyle = '#ffcf9f'; x.beginPath(); x.arc(1, -30, 7, 0, TAU); x.fill(); x.fillRect(7, -24, 6 + (cd > 30 ? 4 : 0), 4);
      x.fillStyle = '#ff3d00'; x.beginPath(); x.moveTo(-7, -32); x.quadraticCurveTo(-2, -48, 4, -42); x.quadraticCurveTo(7, -46, 9, -32); x.closePath(); x.fill();
      x.fillStyle = C.y; x.beginPath(); x.moveTo(-2, -33); x.quadraticCurveTo(1, -42, 4, -33); x.fill();
      x.fillStyle = '#222'; x.fillRect(4, -32, 2, 3); x.restore();
      for (const f of fb) { x.save(); x.shadowColor = C.o; x.shadowBlur = 12; x.fillStyle = C.o; x.beginPath(); x.arc(f.x, f.y, 6, 0, TAU); x.fill(); x.fillStyle = C.y; x.beginPath(); x.arc(f.x, f.y, 3, 0, TAU); x.fill(); x.restore(); }
    }
  };
}

// ---------- ZIP ----------
function zip(arenaMode = false) {
  const w = walker(); let st = 'run', ct = 0, rt = 0, cdD = 0, cdH = 0, homing = null, spin = 0;
  let arenaTarget = { x: W / 2, y: H / 2 }, arenaFloor = null, arenaDash = null;
  const dash = dir => { st = 'charge'; ct = 0; w.face = dir; };
  return {
    col: '#18b9c9', needsPlats: true, eat: 22, pts: () => [{ x: w.x, y: w.y - 12 }],
    arenaPosition() { return { x: w.x, y: w.y - 12 }; },
    setArenaFloor(floor) { arenaFloor = floor; },
    setArenaTarget(px, py) { arenaTarget = { x: px, y: py }; },
    arenaAttack(px, py) { arenaDash = { x: px, y: py }; dash(px >= w.x ? 1 : -1); },
    click(px) { dash(px >= w.x ? 1 : -1); ring(w.x, w.y - 12, 60, '#18b9c9'); },
    update() {
      cdD--; cdH--; spin += .5;
      if (arenaMode) {
        if (st === 'run') {
          phys(w, 6.5, 12, false, arenaFloor ? plats.concat(arenaFloor) : undefined, arenaTarget);
          if (Math.abs(arenaTarget.x - w.x) > 260 && w.ground && cdD <= 0) dash(Math.sign(arenaTarget.x - w.x));
          if (!w.ground && !homing && cdH <= 0) {
            let best = null, bd = 150;
            for (const p of plats) {
              const px = Math.max(p.l, Math.min(p.r, w.x)), d = Math.hypot(px - w.x, p.t - w.y);
              if (d > 40 && d < bd) { bd = d; best = { x: px, y: p.t + 3 }; }
            }
            if (best) homing = { x: best.x, y: best.y, t: 10 };
          }
          if (homing) {
            const dx = homing.x - w.x, dy = homing.y - (w.y - 10), d = Math.hypot(dx, dy) || 1;
            w.vx = dx / d * 12; w.vy = dy / d * 12;
            if (--homing.t <= 0 || d < 14) {
              const element = grab(homing.x, homing.y);
              if (element) wipe(element, 'ring', { g: .35, vy: -6, col: C.y });
              homing = null; cdH = 50; w.vy = -8;
            }
          }
        } else if (st === 'charge') {
          phys(w, 0, 0, true, arenaFloor ? plats.concat(arenaFloor) : undefined);
          w.vx = 0;
          if (++ct > 12) {
            st = 'roll'; rt = 0;
            const dx = (arenaDash ? arenaDash.x : arenaTarget.x) - w.x;
            const dy = (arenaDash ? arenaDash.y : arenaTarget.y) - w.y;
            const d = Math.hypot(dx, dy) || 1;
            w.vx = dx / d * 13; w.vy = dy / d * 13; arenaDash = null;
          }
        } else {
          phys(w, 0, 0, true, arenaFloor ? plats.concat(arenaFloor) : undefined);
          w.vx *= w.ground ? .985 : 1; rt++;
          if (fr % 2 === 0) {
            const p = rnd(w.x, w.y - 12, 14), element = grab(p[0], p[1]);
            if (element) wipe(element, 'ring', { g: .35, vy: -6, col: C.y });
          }
          if (Math.abs(w.vx) < 3 || rt > 90) { st = 'run'; cdD = 60; }
        }
        this.st = st;
        return;
      }
      if (st === 'run') {
        phys(w, 6.5, 12);
        if (Math.abs(tx - w.x) > 260 && w.ground && cdD <= 0) dash(Math.sign(tx - w.x));
        if (!w.ground && !homing && cdH <= 0) { let best = null, bd = 150; for (const p of plats) { const px = Math.max(p.l, Math.min(p.r, w.x)), d = Math.hypot(px - w.x, p.t - w.y); if (d > 40 && d < bd) { bd = d; best = { x: px, y: p.t + 3 }; } } if (best) homing = { x: best.x, y: best.y, t: 10 }; }
        if (homing) { const dx = homing.x - w.x, dy = homing.y - (w.y - 10), d = Math.hypot(dx, dy) || 1; w.vx = dx / d * 12; w.vy = dy / d * 12; if (--homing.t <= 0 || d < 14) { const s = grab(homing.x, homing.y); if (s) wipe(s, 'ring', { g: .35, vy: -6, col: C.y }); homing = null; cdH = 50; w.vy = -8; } }
      } else if (st === 'charge') { phys(w, 0, 0, true); w.vx = 0; if (++ct > 24) { st = 'roll'; rt = 0; w.vx = w.face * 15; } }
      else { phys(w, 0, 0, true); w.vx *= w.ground ? .985 : 1; rt++; if (fr % 2 == 0) { const p = rnd(w.x, w.y - 12, 14), s = grab(p[0], p[1]); if (s) wipe(s, 'ring', { g: .35, vy: -6, col: C.y }); } if (Math.abs(w.vx) < 3 || rt > 90) { st = 'run'; cdD = 60; } }
      this.st = st;
    },
    draw(now) {
      x.save(); x.translate(w.x, w.y);
      if (st !== 'run') {
        x.translate(0, -12); x.rotate(spin * (st === 'roll' ? 1.2 : 2.4) * w.face);
        for (let i = 0; i < 6; i++) { x.rotate(TAU / 6); x.fillStyle = '#0e8c9a'; x.beginPath(); x.moveTo(8, -4); x.lineTo(19, 0); x.lineTo(8, 4); x.fill(); }
        x.fillStyle = '#18b9c9'; x.beginPath(); x.arc(0, 0, 11, 0, TAU); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.stroke();
        x.restore(); if (st === 'charge') { x.strokeStyle = C.w; x.lineWidth = 1; x.beginPath(); for (let i = 0; i < 4; i++) { const a = R() * TAU; line(w.x + Math.cos(a) * 14, w.y - 12 + Math.sin(a) * 14, w.x + Math.cos(a) * 26, w.y - 12 + Math.sin(a) * 26); } x.stroke(); } return;
      }
      x.scale(w.face, 1);
      x.fillStyle = '#0e8c9a'; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-8, -20 - i * 5); x.lineTo(-22, -14 - i * 6); x.lineTo(-7, -13 - i * 5); x.fill(); }
      const run = Math.abs(w.vx) > 3, sw = Math.sin(now / 50) * 7;
      x.fillStyle = '#ff6a1a'; if (run) { x.beginPath(); x.ellipse(0, -3, 12, 4, 0, 0, TAU); x.fill(); } else { x.fillRect(-7, -5, 7, 5); x.fillRect(1, -5, 7, 5); }
      x.fillStyle = '#18b9c9'; x.beginPath(); x.arc(0, -17, 11, 0, TAU); x.fill();
      x.fillStyle = '#ffd9b3'; x.beginPath(); x.ellipse(5, -15, 6, 7, 0, 0, TAU); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(5, -22, 4, 0, TAU); x.fill(); x.fillStyle = '#111'; x.fillRect(6, -23, 2, 3); x.restore();
    }
  };
}

// ---------- CHOMP ----------
function chomp(arenaMode = false) {
  const c = { x: W / 2, y: H / 2, dx: 1, dy: 0, turn: 0, power: 0 };
  let arenaTarget = { x: W / 2, y: H / 2 };
  return {
    col: C.y, eat: 20, pts: () => [c],
    arenaPosition() { return c; },
    setArenaTarget(px, py) { arenaTarget = { x: px, y: py }; },
    arenaAttack() { c.power = 50; },
    click(px, py) { c.power = 300; ring(c.x, c.y, 110, C.y); burst(c.x, c.y, 24, C.y); },
    update() {
      const targetX = arenaMode ? arenaTarget.x : tx, targetY = arenaMode ? arenaTarget.y : ty;
      if (--c.turn <= 0) { const ex = targetX - c.x, ey = targetY - c.y; if (Math.hypot(ex, ey) > 14) { if (Math.abs(ex) > Math.abs(ey)) { c.dx = Math.sign(ex); c.dy = 0; } else { c.dx = 0; c.dy = Math.sign(ey); } } else { c.dx = 0; c.dy = 0; } c.turn = 16; }
      const sp = (c.power > 0 ? 4.6 : 3.4) * (1 + boost); c.x += c.dx * sp; c.y += c.dy * sp; if (c.power > 0) c.power--;
      c.x = Math.max(12, Math.min(W - 12, c.x)); c.y = Math.max(12, Math.min(H - 12, c.y));
      if (fr % 2 == 0) {
        const r = c.power > 0 ? 24 : 14, n = c.power > 0 ? 4 : 2;
        for (let i = 0; i < n; i++) { const p = rnd(c.x + c.dx * r, c.y + c.dy * r, r), s = grab(p[0], p[1]); if (s) wipe(s, 'dot', { vx: 0, vy: 0, col: C.y }); }
      }
    },
    draw(now) {
      const sc = c.power > 0 ? 1.7 : 1, m = .05 + Math.abs(Math.sin(now / 90)) * .9, ang = Math.atan2(c.dy, c.dx || (c.dy ? 0 : 1));
      x.save(); x.translate(c.x, c.y); x.rotate(c.dx || c.dy ? ang : 0); x.scale(sc, sc);
      x.fillStyle = c.power > 0 && fr % 8 < 4 ? C.o : C.y; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 14, m, TAU - m); x.closePath(); x.fill();
      x.fillStyle = '#111'; x.beginPath(); x.arc(2, -7, 2, 0, TAU); x.fill(); x.restore();
    }
  };
}

// ---------- STICK GANG ----------
const SCOL = { orange: '#ff8a1f', red: '#ff3b3b', green: '#3ddc5a', yellow: '#ffe135', blue: '#3b82ff' };
function freeze(s) {
  if (s.dataset.t || s.dataset.f) return; s.dataset.f = 1;
  const st = s.style; st.setProperty('color', '#aeeaff', 'important'); st.setProperty('text-shadow', '0 0 8px #aeeaff', 'important'); st.setProperty('background', 'rgba(174,234,255,.25)', 'important');
  setTimeout(() => { if (s.isConnected) wipe(s, 'boom', { col: '#aeeaff' }); }, 1100);
}
const knock = (s, vx, vy) => wipe(s, 'label', { g: .5, vx, vy });
function stickFig(kind, idx, arenaMode) {
  const col = SCOL[kind], w = walker(), shots = [], bolts = []; w.x = W * (.15 + idx * .17); w.tx = w.x; w.ty = H / 2; w.minY = arenaMode ? Math.min(80, H * .3) : 26; let cd = 20 + idx * 9, atk = 0, cdB = 0;
  const shoot = (vx, vy, type) => shots.push({ x: w.x + w.face * 14, y: w.y - 24, vx, vy, type, life: 120, stuck: 0 });
  const bolt = (px, py) => {
    const pts = [[px + (R() - .5) * 30, 0]], n = 8; for (let i = 1; i <= n; i++) pts.push([px + (R() - .5) * 24, py * i / n]); pts[n] = [px, py]; bolts.push({ pts, l: 12 });
    const s = grab(px, py); if (s) wipe(s, 'boom', { col }); for (let k = 0; k < 2; k++) { const p = rnd(px, py, 70), s2 = grab(p[0], p[1]); if (s2) wipe(s2, 'boom', { col }); } ring(px, py, 50, col);
  };
  const act = (px, py) => {
    const f = w.face, aim = px != null ? Math.atan2(py - (w.y - 24), px - w.x) : f > 0 ? 0 : Math.PI; atk = 14;
    if (kind === 'orange') { for (let i = 0; i < 6; i++) { const a = aim - 1.3 + i * .45, s = grab(w.x + Math.cos(a) * 42, w.y - 24 + Math.sin(a) * 42); if (s) knock(s, Math.cos(a) * 5, Math.sin(a) * 5); } shoot(Math.cos(aim) * 9, Math.sin(aim) * 9, 'wave'); }
    else if (kind === 'red') { if (w.ground) { w.vy = -13; w.ground = false; w.pound = true; } }
    else if (kind === 'green') { for (const d of [-.14, 0, .14]) shoot(Math.cos(aim + d) * 11, Math.sin(aim + d) * 11, 'arrow'); }
    else if (kind === 'yellow') { const p = px != null ? [px, py] : rnd(w.x, w.y - 20, 260); bolt(p[0], p[1]); }
    else for (const d of [-.15, 0, .15]) shoot(Math.cos(aim + d) * 9, Math.sin(aim + d) * 9, 'ice');
  };
  return {
    kind, pt: () => ({ x: w.x, y: w.y - 14 }), position: () => w, combatShots: () => shots,
    setTarget(a, b) { w.tx = a; w.ty = b; }, special: act,
    update() {
      phys(w, kind === 'yellow' ? 6.2 : kind === 'red' ? 4.4 : 5, 12);
      if (!arenaMode && --cd <= 0) { act(); cd = kind === 'red' ? 90 : kind === 'yellow' ? 70 : kind === 'orange' ? 44 : 52; }
      if (atk > 0) atk--;
      if (w.pound && w.hit > 6) { w.pound = false; ring(w.x, w.y, 130, col); burst(w.x, w.y, 24, col); for (let k = 0; k < 14; k++) { const s = grab(w.x + (R() - .5) * 260, w.y - R() * 40); if (s) knock(s, (s.getBoundingClientRect().left - w.x) * .05, -8); } }
      if (!arenaMode && kind === 'green' && --cdB <= 0 && w.ground && w.ty < w.y - 50) { temps.push({ l: w.x + w.face * 10 - 18, r: w.x + w.face * 10 + 18, t: w.y - 58, life: 360 }); cdB = 70; }
      for (let i = shots.length - 1; i >= 0; i--) {
        const a = shots[i]; if (a.stuck) { if (--a.stuck <= 0) shots.splice(i, 1); continue; }
        a.px = a.x; a.py = a.y;
        if (a.type !== 'wave') a.vy += a.type === 'arrow' ? .08 : .02; a.x += a.vx; a.y += a.vy; a.life--;
        let s = grab(a.x + Math.sign(a.vx || 1) * 8, a.y); if (!s && a.type === 'wave') s = grab(a.x, a.y - 16) || grab(a.x, a.y + 16);
        if (s) { if (a.type === 'ice') { freeze(s); burst(a.x, a.y, 8, '#aeeaff'); a.stuck = 1; } else { knock(s, a.vx * .4, -4); if (a.type === 'arrow') { a.stuck = 30; a.vx = 0; a.vy = 0; } } }
        if (a.life <= 0 || a.x < -30 || a.x > W + 30) shots.splice(i, 1);
      }
      for (let i = bolts.length - 1; i >= 0; i--) if (--bolts[i].l <= 0) bolts.splice(i, 1);
    },
    draw(now) {
      x.save(); x.translate(w.x, w.y); x.scale(w.face, 1); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 3.2; x.lineCap = 'round';
      const mv = w.ground ? Math.sin(w.x * .28) * 8 * Math.min(1, Math.abs(w.vx) / 2) : 8, ext = atk > 0 ? atk / 14 : 0;
      x.beginPath(); line(0, -14, -mv, 0); line(0, -14, mv, 0); line(0, -14, 0, -30); line(0, -27, -8, -18); line(0, -27, 10 + ext * 6, -24); x.stroke();
      x.beginPath(); x.arc(0, -36, 6, 0, TAU); x.stroke(); x.lineWidth = 2.5;
      if (kind === 'orange') { x.strokeStyle = '#fff3d6'; x.shadowColor = col; x.shadowBlur = 8; x.beginPath(); line(10, -24, 30, -38 + ext * 26); x.stroke(); if (ext) { x.globalAlpha = ext; x.strokeStyle = col; x.beginPath(); x.arc(0, -26, 44, -1.3, 1.1); x.stroke(); } }
      else if (kind === 'green') { x.strokeStyle = '#c98a3a'; x.beginPath(); x.arc(14, -24, 12, -1.2, 1.2); x.stroke(); }
      else if (kind === 'blue') { x.fillStyle = '#aeeaff'; x.shadowColor = '#aeeaff'; x.shadowBlur = 8; x.beginPath(); x.moveTo(12, -24); x.lineTo(17, -34); x.lineTo(22, -24); x.lineTo(17, -20); x.closePath(); x.fill(); }
      else if (kind === 'red') { if (!w.ground) { x.shadowColor = col; x.shadowBlur = 10; x.beginPath(); x.arc(12, -24, 5, 0, TAU); x.fill(); } }
      else if (atk > 0) { x.strokeStyle = '#fff'; x.shadowColor = col; x.shadowBlur = 10; x.beginPath(); for (let i = 0; i < 5; i++) line(R() * 20 - 10, -44 + R() * 40, R() * 20 - 10, -44 + R() * 40); x.stroke(); }
      x.restore();
      for (const a of shots) {
        if (a.type === 'wave') { x.save(); x.translate(a.x, a.y); x.scale(Math.sign(a.vx) || 1, 1); x.strokeStyle = col; x.shadowColor = col; x.shadowBlur = 10; x.lineWidth = 3; x.beginPath(); x.arc(-14, 0, 18, -1, 1); x.stroke(); x.restore(); }
        else if (a.type === 'ice') { x.fillStyle = '#aeeaff'; x.fillRect(a.x - 4, a.y - 2, 8, 4); }
        else { x.strokeStyle = C.w; x.lineWidth = 2; x.beginPath(); line(a.x - Math.sign(a.vx || 1) * 12, a.y, a.x, a.y + a.vy); x.stroke(); }
      }
      for (const b of bolts) { x.save(); x.strokeStyle = '#fff'; x.shadowColor = col; x.shadowBlur = 14; x.lineWidth = 2.5; x.globalAlpha = b.l / 12; x.beginPath(); x.moveTo(b.pts[0][0], b.pts[0][1]); for (const p of b.pts) x.lineTo(p[0], p[1]); x.stroke(); x.restore(); }
    }
  };
}
function gang(kinds) {
  const figs = kinds.map((k, i) => stickFig(k, kinds.length === 1 ? 2 : i)); figs.forEach(f => { f.wt = 0; });
  return {
    col: SCOL[kinds[0]], needsPlats: true, eat: 0, pts: () => figs.map(f => f.pt()),
    click(px, py) { figs.forEach(f => f.special(px, py)); },
    update(now) { figs.forEach((f, i) => { if (now - last < 3500) f.setTarget(tx + (i - (figs.length - 1) / 2) * 70, ty); else if (--f.wt <= 0) { f.setTarget(40 + R() * (W - 80), 40 + R() * (H - 80)); f.wt = 140 + R() * 140 | 0; } f.update(); }); },
    draw(now) { figs.forEach(f => f.draw(now)); }
  };
}

// ---------- pixel characters ----------
const PXC = ['#8b5a2b', '#7a7a7a', '#4caf50', '#ffd54f', '#5ac8fa'];
function pix(rows, pal, ox, oy, sz) { for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const c = pal[rows[j][i]]; if (c) { x.fillStyle = c; x.fillRect(ox + i * sz, oy + j * sz, sz, sz); } } }

// STARSHIP: Free-roaming floating flight across the full screen
function starship() {
  const s = { x: W / 2, y: H / 2 }, bl = []; let cd = 0, beam = 0, bx = 0;
  const SHIP = ['.....c.....', '....cwc....', '....cwc....', '...ccwcc...', '.c.ccwcc.c.', '.cccccccccc', 'ccrcccccrcc', 'cc.ccwcc.cc', 'c...r.r...c'], PAL2 = { c: '#27d3c3', w: '#ffffff', r: '#ff4d4d' };
  return {
    col: C.c, eat: 0, pts: () => [s],
    click() { beam = 36; bx = s.x; ring(s.x, s.y, 80, C.c); },
    update() {
      s.x += (tx - s.x) * .08; s.y += (ty - s.y) * .08;
      s.x = Math.max(20, Math.min(W - 20, s.x)); s.y = Math.max(20, Math.min(H - 20, s.y));
      if (--cd <= 0) { bl.push({ x: s.x - 8, y: s.y - 14, vy: -12 }, { x: s.x + 8, y: s.y - 14, vy: -12 }); cd = 12; }
      if (beam > 0) { beam--; for (let i = 0; i < 6; i++) { const w = grab(bx + (R() - .5) * 48, R() * s.y); if (w) wipe(w, 'boom', { col: PXC[R() * 5 | 0], vx: (R() - .5) * 3, vy: 2 }); } }
      for (let i = bl.length - 1; i >= 0; i--) {
        const b = bl[i]; b.y += b.vy; const w = grab(b.x, b.y - 4);
        if (w) { wipe(w, 'boom', { col: PXC[R() * 5 | 0], vx: (R() - .5) * 3, vy: 2 }); burst(b.x, b.y, 6, C.w); bl.splice(i, 1); } else if (b.y < -10 || b.y > H + 10) bl.splice(i, 1);
      }
    },
    draw(now) {
      if (beam > 0) { x.save(); x.globalAlpha = Math.min(1, beam / 12) * .55; x.fillStyle = C.c; x.shadowColor = C.c; x.shadowBlur = 14; x.fillRect(bx - 22, 0, 44, s.y); x.restore(); }
      pix(SHIP, PAL2, s.x - 16.5, s.y - 13.5, 3);
      if (fr % 6 < 3) { x.fillStyle = C.y; x.fillRect(s.x - 8, s.y + 14, 3, 6); x.fillRect(s.x + 5, s.y + 14, 3, 6); }
      x.fillStyle = C.w; for (const b of bl) x.fillRect(b.x - 1.5, b.y - 6, 3, 9);
    }
  };
}

// TANK: Free-roaming top-down movement across the entire screen
function tank() {
  const c = { x: W / 2, y: H / 2, dx: 0, dy: -1, turn: 0 }, sh = []; let cd = 10, anim = 0, mvg = false;
  const fire = (dx, dy) => sh.push({ x: c.x + dx * 16, y: c.y + dy * 16, dx, dy, age: 0 });
  return {
    col: '#c4d450', eat: 0, pts: () => [c],
    click() { fire(1, 0); fire(-1, 0); fire(0, 1); fire(0, -1); ring(c.x, c.y, 70, '#c4d450'); },
    update() {
      const ex = tx - c.x, ey = ty - c.y; mvg = Math.hypot(ex, ey) > 14;
      if (--c.turn <= 0 && mvg) { if (Math.abs(ex) > Math.abs(ey)) { c.dx = Math.sign(ex); c.dy = 0; } else { c.dx = 0; c.dy = Math.sign(ey); } c.turn = 14; }
      if (mvg) { const sp = 3.2 * (1 + boost); c.x += c.dx * sp; c.y += c.dy * sp; anim++; }
      c.x = Math.max(14, Math.min(W - 14, c.x)); c.y = Math.max(14, Math.min(H - 14, c.y));
      if (--cd <= 0) { fire(c.dx, c.dy); cd = 22; }
      for (let i = sh.length - 1; i >= 0; i--) {
        const b = sh[i]; b.x += b.dx * 8; b.y += b.dy * 8; b.age++; const w = grab(b.x + b.dx * 6, b.y + b.dy * 6);
        if (w) { wipe(w, 'boom', { col: ['#c4d450', '#8a9a3a', '#7a7a7a'][R() * 3 | 0], vx: b.dx * 3 + (R() - .5) * 2, vy: b.dy * 3 + (R() - .5) * 2 }); burst(b.x, b.y, 10, C.y); sh.splice(i, 1); }
        else if (b.age > 90 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) sh.splice(i, 1);
      }
    },
    draw() {
      x.save(); x.translate(c.x, c.y); x.rotate(Math.atan2(c.dx, -c.dy));
      x.fillStyle = '#3d4a1a'; x.fillRect(-11, -11, 5, 22); x.fillRect(6, -11, 5, 22);
      x.fillStyle = '#8a9a3a'; for (let i = 0; i < 5; i++) { const o = ((anim * 2 + i * 5) % 22) - 11; x.fillRect(-11, o, 5, 2); x.fillRect(6, o, 5, 2); }
      x.fillStyle = '#a9ba46'; x.fillRect(-6, -9, 12, 18); x.fillStyle = '#c4d450'; x.fillRect(-4, -4, 8, 8); x.fillStyle = '#556018'; x.fillRect(-1.5, -17, 3, 13); x.restore();
      x.fillStyle = C.y; for (const b of sh) x.fillRect(b.x - 2, b.y - 2, 4, 4);
    }
  };
}

// MINER: Platform-walking prospector with ranged tools
function miner(arenaMode = false) {
  const w = walker(), bombs = [], arrows = [], orbs = [], blasts = [], inv = [0, 0, 0, 0, 0], structures = []; let sw = 0, cd = 14, tool = 0, hook = null, buildCd = 0, arenaAttackCount = 0;
  let arenaTarget = { x: W / 2, y: H / 2 }, arenaFloor = null;
  const BODY = ['..hhhh..', '.hhhhhh.', '.ffffff.', '.feffef.', '.ffffff.', '..bbbb..', '.bbbbbb.', 'fbbbbbbf', '.bbbbbb.', '..pppp..', '..pppp..'], LEG = ['..p..p..', '..p..p..', '.kk..kk.'], LEG2 = ['.p....p.', '.p....p.', 'kk....kk'];
  const PAL3 = { h: '#8b4a1b', f: '#ffcf9f', e: '#222', b: '#3a8cff', p: '#4b4b9b', k: '#2a2a2a' };
  const mine = (px, py) => {
    const s = grab(px, py);
    if (!s) return false;
    const color = PXC[R() * PXC.length | 0];
    wipe(s, 'px', { col: color, vx: (R() - .5) * 4, vy: -3, g: .45 });
    if (arenaMode) inv[PXC.indexOf(color)]++;
    return true;
  };
  const slot = i => W / 2 - 87 + i * 29;
  const takeBlocks = () => {
    if (inv.reduce((sum, count) => sum + count, 0) < 3) return null;
    const colors = [];
    for (let i = 0; i < inv.length && colors.length < 3; i++) {
      while (inv[i] > 0 && colors.length < 3) { inv[i]--; colors.push(PXC[i]); }
    }
    return colors;
  };
  const buildPlatform = (targetX = tx) => {
    const direction = Math.sign(targetX - w.x) || w.face, center = Math.max(38, Math.min(W - 38, w.x + direction * 24));
    const top = Math.max(48, Math.min(H - 70, w.y - 58)), left = center - 36, right = center + 36;
    if (structures.some(p => p.kind === 'platform' && Math.abs(p.t - top) < 28 && left < p.r + 10 && right > p.l - 10)) return false;
    const colors = takeBlocks();
    if (!colors) return false;
    structures.push({ kind: 'platform', l: left, r: right, t: top, b: top + 8, colors });
    ring(center, top, 36, colors[0]);
    buildCd = 90;
    return true;
  };
  const buildWall = (targetX, targetY) => {
    if (Math.abs(targetY - w.y) > 190) return false;
    const direction = Math.sign(targetX - w.x) || w.face;
    const center = Math.max(16, Math.min(W - 16, w.x + direction * 62));
    const top = Math.max(32, Math.min(H - 76, w.y - 68)), left = center - 6, right = center + 6, bottom = top + 72;
    if (structures.some(p => p.kind === 'wall' && Math.abs(p.l - left) < 22 && Math.abs(p.t - top) < 48)) return false;
    const colors = takeBlocks();
    if (!colors) return false;
    structures.push({ kind: 'wall', l: left, r: right, t: top, b: bottom, colors, hp: 4 });
    if (structures.length > 12) structures.shift();
    ring(center, w.y - 32, 34, colors[0]);
    buildCd = 90;
    return true;
  };
  const icon = (i, cx, cy) => {
    x.save(); x.translate(cx, cy);
    if (i === 0) { x.fillStyle = '#7a4a1e'; x.fillRect(-1, -8, 2, 16); x.fillStyle = '#b8c4cc'; x.fillRect(-8, -9, 16, 3); }
    else if (i === 1) { x.fillStyle = '#dfe9f2'; x.fillRect(-1.5, -9, 3, 13); x.fillStyle = '#7a4a1e'; x.fillRect(-4, 4, 8, 2); x.fillRect(-1, 6, 2, 3); }
    else if (i === 2) { x.strokeStyle = '#c98a3a'; x.lineWidth = 2; x.beginPath(); x.arc(2, 0, 8, -1.2, 1.2); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = 1; x.beginPath(); line(2 + Math.cos(-1.2) * 8, Math.sin(-1.2) * 8, 2 + Math.cos(1.2) * 8, Math.sin(1.2) * 8); x.stroke(); }
    else if (i === 3) { x.fillStyle = '#7a4a1e'; x.fillRect(-1, -4, 2, 12); x.fillStyle = '#b36bff'; x.beginPath(); x.arc(0, -6, 4, 0, TAU); x.fill(); }
    else if (i === 4) { x.fillStyle = '#d33'; x.fillRect(-5, -6, 10, 12); x.fillStyle = '#222'; x.fillRect(-5, -6, 10, 2); }
    else { x.strokeStyle = '#aab'; x.lineWidth = 2; x.beginPath(); x.arc(0, 2, 6, .4, 3.6); x.stroke(); x.fillStyle = '#aab'; x.fillRect(-1, -8, 2, 6); }
    x.restore();
  };
  const useTool = (t, ux, uy) => {
    const f = w.face;
    if (t === 0) { sw = 12; for (let r = 12; r <= 40; r += 7) mine(w.x + ux * r, w.y - 18 + uy * r); }
    else if (t === 1) { sw = 12; for (let i = 0; i < 7; i++) { const a = -1.3 + i * .4; mine(w.x + f * Math.cos(a) * 40, w.y - 22 + Math.sin(a) * 40); } }
    else if (t === 2) { sw = 8; arrows.push({ x: w.x + f * 14, y: w.y - 22, vx: ux * 11, vy: uy * 11 - 1, life: 120, stuck: 0 }); }
    else if (t === 3) { sw = 8; orbs.push({ x: w.x + f * 14, y: w.y - 24, vx: ux * 5, vy: uy * 5, age: 0 }); }
    else if (t === 4) { sw = 8; bombs.push({ x: w.x + f * 12, y: w.y - 24, vx: ux * 5, vy: uy * 5 - 4, t: 70 }); }
    else if (t === 5) hook = { x: arenaMode ? w.x + ux * 180 : tx, y: arenaMode ? w.y - 20 + uy * 180 : ty, t: 24 };
  };
  const explodeBomb = bomb => {
    ring(bomb.x, bomb.y, 100, '#ff6a1a');
    burst(bomb.x, bomb.y, 30, '#ff9a3a');
    for (let k = 0; k < 16; k++) { const p = rnd(bomb.x, bomb.y, 100); mine(p[0], p[1]); }
    if (arenaMode) blasts.push({ type: 'blast', x: bomb.x, y: bomb.y, radius: 100, applied: false });
  };
  return {
    col: '#ffb84d', eat: 24, mag: 70, pts: () => [{ x: w.x, y: w.y - 14 }],
    arenaPosition() { return { x: w.x, y: w.y - 14 }; },
    setArenaFloor(floor) { arenaFloor = floor; },
    setArenaTarget(px, py, threatX = px, threatY = py) {
      arenaTarget = { x: px, y: py };
      arenaThreat = { x: threatX, y: threatY };
    },
    arenaBlocks() { return structures; },
    arenaAttack(px, py) {
      const dx = px - w.x, dy = py - (w.y - 20), d = Math.hypot(dx, dy) || 1;
      if (d < 72) tool = arenaAttackCount++ % 2;
      else tool = [2, 3, 4, 5][arenaAttackCount++ % 4];
      useTool(tool, dx / d, dy / d);
    },
    arenaEffects() { return blasts.splice(0); },
    arenaShots() { return arrows.filter(arrow => !arrow.stuck).concat(orbs, bombs); },
    removeArenaShot(shot) {
      for (const projectiles of [arrows, orbs]) {
        const i = projectiles.indexOf(shot);
        if (i >= 0) { projectiles.splice(i, 1); return; }
      }
      const bombIndex = bombs.indexOf(shot);
      if (bombIndex >= 0) { const [bomb] = bombs.splice(bombIndex, 1); explodeBomb(bomb); }
    },
    got(d) { const i = PXC.indexOf(d.c); if (i >= 0) inv[i]++; },
    click() { tool = 4; bombs.push({ x: w.x, y: w.y - 24, vx: w.face * 5, vy: -7, t: 70 }); cd = 30; },
    update() {
      const targetX = arenaMode ? arenaTarget.x : tx, targetY = arenaMode ? arenaTarget.y : ty;
      if (!arenaMode) {
        if (buildCd > 0) buildCd--;
        if (buildCd <= 0 && ty < w.y - 90) buildPlatform();
        phys(w, 4.8, 12, false, structures);
      } else {
        phys(w, 4.8, 12, false, plats.concat(structures.filter(structure => structure.kind === 'platform'), arenaFloor ? [arenaFloor] : []), arenaTarget);
        if (buildCd > 0) buildCd--;
        if (buildCd <= 0 && !buildWall(arenaThreat.x, arenaThreat.y)) buildPlatform(arenaTarget.x);
        if (hook) {
          const dx = hook.x - w.x, dy = hook.y - (w.y - 20), distance = Math.hypot(dx, dy) || 1;
          w.vx += dx / distance * 1.2;
          w.vy += dy / distance * 1.2;
        }
      }
      const dx = targetX - w.x, dy = targetY - w.y, dist = Math.hypot(dx, dy) || 1;
      w.face = dx >= 0 ? 1 : -1;

      if (hook && --hook.t <= 0) hook = null;
      if (!arenaMode && --cd <= 0) {
        let ux = dx / dist, uy = dy / dist;
        tool = dist < 80 ? (R() < .5 ? 0 : 1) : (R() < .65 ? 2 : 3);
        useTool(tool, ux, uy); cd = 22;
      }
      if (sw > 0) sw--;
      for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i]; if (a.stuck) { if (--a.stuck <= 0) arrows.splice(i, 1); continue; }
        a.vy += .08; a.x += a.vx; a.y += a.vy; a.life--;
        if (mine(a.x + Math.sign(a.vx || 1) * 8, a.y)) { a.stuck = 30; a.vx = 0; a.vy = 0; }
        if (a.life <= 0 || a.x < -20 || a.x > W + 20) arrows.splice(i, 1);
      }
      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i]; o.age++; const odx = targetX - o.x, ody = targetY - o.y, od = Math.hypot(odx, ody) || 1; o.vx += odx / od * .25; o.vy += ody / od * .25;
        o.x += o.vx; o.y += o.vy; let boom = o.age > 140;
        if (!boom && mine(o.x, o.y)) { for (let k = 0; k < 5; k++) { const p = rnd(o.x, o.y, 34); mine(p[0], p[1]); } ring(o.x, o.y, 40, '#b36bff'); burst(o.x, o.y, 12, '#b36bff'); boom = true; }
        if (boom) orbs.splice(i, 1);
      }
      for (let i = bombs.length - 1; i >= 0; i--) {
        const b = bombs[i]; b.vy += .3; b.x += b.vx; b.y += b.vy; b.t--;
        if (b.t <= 0) { explodeBomb(b); bombs.splice(i, 1); }
      }
    },
    draw(now) {
      for (const p of structures) {
        for (let i = 0; i < p.colors.length; i++) {
          const width = p.kind === 'wall' ? p.r - p.l : 24;
          const height = p.kind === 'wall' ? (p.b - p.t) / p.colors.length : 8;
          const bx = p.kind === 'wall' ? p.l : p.l + i * width;
          const by = p.t + i * height;
          x.fillStyle = p.colors[i]; x.fillRect(bx, by, width, height);
          x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 1; x.strokeRect(bx + .5, by + .5, width - 1, height - 1);
        }
        x.fillStyle = 'rgba(255,255,255,.55)';
        if (p.kind === 'wall') x.fillRect(p.l + 2, p.t + 1, 2, p.b - p.t - 2);
        else x.fillRect(p.l + 2, p.t + 1, 20, 1);
      }
      x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createRadialGradient(w.x, w.y - 20, 4, w.x, w.y - 20, 100); g.addColorStop(0, 'rgba(255,200,110,.28)'); g.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = g; x.fillRect(w.x - 100, w.y - 120, 200, 200); x.restore();
      if (hook) { x.strokeStyle = '#aab'; x.lineWidth = 1.5; x.beginPath(); line(w.x, w.y - 20, hook.x, hook.y); x.stroke(); x.fillStyle = '#aab'; x.fillRect(hook.x - 3, hook.y - 3, 6, 6); }
      x.save(); x.translate(w.x, w.y); x.scale(w.face, 1);
      pix(BODY, PAL3, -8, -28, 2); pix(w.ground && Math.abs(w.vx) > .5 && fr % 10 < 5 ? LEG2 : LEG, PAL3, -8, -6, 2);
      x.save(); x.translate(6, -16);
      if (tool === 0) { x.rotate(sw > 0 ? -1.3 : -.5); x.fillStyle = '#7a4a1e'; x.fillRect(0, -1, 16, 2); x.fillStyle = '#b8c4cc'; x.fillRect(13, -6, 3, 12); }
      else if (tool === 1) { x.rotate(sw > 0 ? -1.5 : -.4); x.fillStyle = '#dfe9f2'; x.fillRect(2, -1.5, 20, 3); }
      else if (tool === 2) { x.strokeStyle = '#c98a3a'; x.lineWidth = 2; x.beginPath(); x.arc(8, 0, 11, -1.2, 1.2); x.stroke(); }
      else if (tool === 3) { x.fillStyle = '#b36bff'; x.beginPath(); x.arc(17, 0, 4, 0, TAU); x.fill(); }
      else { x.fillStyle = '#d33'; x.fillRect(4, -5, 8, 10); }
      x.restore(); x.restore();
      for (const a of arrows) { x.strokeStyle = C.w; x.lineWidth = 2; x.beginPath(); line(a.x - Math.sign(a.vx || 1) * 12, a.y, a.x, a.y + a.vy); x.stroke(); }
      for (const o of orbs) { x.save(); x.shadowColor = '#b36bff'; x.shadowBlur = 12; x.fillStyle = '#b36bff'; x.fillRect(o.x - 4, o.y - 4, 8, 8); x.restore(); }
      for (const b of bombs) { x.fillStyle = '#d33'; x.fillRect(b.x - 4, b.y - 4, 8, 8); }
      const barY = arenaMode ? H - 46 : 10;
      for (let i = 0; i < 6; i++) { const hx = slot(i); x.fillStyle = 'rgba(20,30,70,.75)'; x.fillRect(hx, barY, 26, 26); x.strokeStyle = i === tool ? C.y : 'rgba(255,255,255,.35)'; x.lineWidth = i === tool ? 2 : 1; x.strokeRect(hx, barY, 26, 26); icon(i, hx + 13, barY + 13); }
      x.font = '10px monospace'; let ix = slot(0); for (let i = 0; i < 5; i++) if (inv[i]) { x.fillStyle = PXC[i]; x.fillRect(ix, barY + 32, 8, 8); x.fillStyle = '#fff'; x.fillText(inv[i], ix + 10, barY + 40); ix += 14 + String(inv[i]).length * 6; }
    }
  };
}

function arena() {
  const enemyTop = Math.min(90, H * .3), enemyBottom = Math.max(enemyTop, H - 50);
  const arenaFloor = { l: 0, r: W, t: enemyBottom };
  const kinds = ['orange', 'red', 'green', 'yellow', 'blue'];
  const names = { orange: 'Blade', red: 'Breaker', green: 'Ranger', yellow: 'Volt', blue: 'Frost' };
  const heroes = kinds.map((kind, i) => ({
    team: 'heroes', kind, name: names[kind], color: SCOL[kind], fig: stickFig(kind, i, true),
    hp: 5, maxHp: 5, inv: 0, cd: 45 + i * 13, respawn: 0, poundTarget: null
  }));
  const waveSets = [
    { name: 'Wild Things', kinds: ['mite', 'wisp', 'spider', 'centipede'] },
    { name: 'Rival Crew', kinds: ['runner', 'builder', 'chomper', 'ember'] },
    { name: 'Block Raiders', kinds: ['fuse', 'bonearcher', 'rotwalker', 'fuse'] },
    { name: 'Phantom Maze', kinds: ['ghost', 'ghost', 'ghost', 'ghost'] },
    { name: 'Wild Things', kinds: ['spider', 'mite', 'centipede', 'wisp'] },
    { name: 'Bolt Bots', kinds: ['buzz', 'crabbot', 'spinroll', 'buzz'] },
    { name: 'Rival Crew', kinds: ['chomper', 'runner', 'ember', 'builder'] },
    { name: 'Shroom Realm', kinds: ['capwalker', 'shellhopper', 'mallet', 'capwalker'] },
    { name: 'Cavern Critters', kinds: ['slime', 'eye', 'bat', 'slime'] }
  ];
  const enemyInfo = {
    mite: { name: 'Shard Mite', color: '#b3e34a', hp: 6, radius: 13 },
    wisp: { name: 'Flicker Wisp', color: '#a779ff', hp: 6, radius: 13 },
    spider: { name: 'Web Stalker', color: '#61e6d5', hp: 7, radius: 20 },
    centipede: { name: 'Rust Centipede', color: '#ff8059', hp: 7, radius: 18 },
    runner: { name: 'Speedster', color: '#18b9c9', hp: 7, radius: 15 },
    builder: { name: 'Terrarian', color: '#ffb84d', hp: 8, radius: 16 },
    chomper: { name: 'Chomper', color: '#ffe135', hp: 8, radius: 17 },
    ember: { name: 'Fire Hero', color: '#ff7a1a', hp: 7, radius: 15 },
    fuse: { name: 'Fuse Pixel', color: '#6fd36f', hp: 5, radius: 15 },
    bonearcher: { name: 'Bone Archer', color: '#cfd8dc', hp: 5, radius: 14 },
    rotwalker: { name: 'Rot Walker', color: '#5fb3a1', hp: 7, radius: 15 },
    buzz: { name: 'Buzz Drone', color: '#8fb4ff', hp: 5, radius: 14 },
    crabbot: { name: 'Crab Bot', color: '#ff7a59', hp: 6, radius: 16 },
    spinroll: { name: 'Spike Roller', color: '#33c4d0', hp: 6, radius: 14 },
    ghost: { name: 'Phantom', color: '#ff3b3b', hp: 4, radius: 15 },
    capwalker: { name: 'Spore Walker', color: '#9b5de5', hp: 4, radius: 14 },
    shellhopper: { name: 'Shell Hopper', color: '#35c6a0', hp: 6, radius: 15 },
    mallet: { name: 'Mallet Brute', color: '#ff9f43', hp: 6, radius: 16 },
    slime: { name: 'Gel Slime', color: '#5ac8fa', hp: 7, radius: 18 },
    miniSlime: { name: 'Mini Slime', color: '#5ac8fa', hp: 3, radius: 10 },
    eye: { name: 'Watcher Eye', color: '#ff5c7a', hp: 7, radius: 17 },
    bat: { name: 'Cave Bat', color: '#a06cff', hp: 4, radius: 12 }
  };
  const enemies = [], fighters = heroes.slice(), shots = [];
  let round = 1, phase = 'wave', intermissionAt = 0, boss;
  const floaters = []; let bannerFr = 0, powerUntil = 0;
  const MON = new Set(['fuse', 'bonearcher', 'rotwalker', 'buzz', 'crabbot', 'spinroll', 'ghost', 'capwalker', 'shellhopper', 'mallet', 'slime', 'miniSlime', 'eye', 'bat']);
  const platformMonsters = new Set(['runner', 'builder', 'ember', 'fuse', 'bonearcher', 'rotwalker', 'crabbot', 'spinroll', 'capwalker', 'shellhopper', 'mallet', 'slime', 'miniSlime']);
  const usesPlatforms = fighter => platformMonsters.has(fighter.kind) || (fighter.kind === 'boss' && fighter.theme === 'shell');
  const GH = [{ name: 'Red Phantom', color: '#ff3b3b' }, { name: 'Rose Phantom', color: '#ff9bd2' }, { name: 'Aqua Phantom', color: '#3de0ff' }, { name: 'Amber Phantom', color: '#ffa53b' }];
  const makeBossModel = () => {
    const spiderModel = spider(true, '#c34dff', true), centipedeModel = centipede(true, '#c34dff', true);
    let bx = W / 2, by = H / 2;
    return {
      arenaPosition() { return { x: bx, y: by }; },
      setArenaTarget(px, py) {
        const marginX = Math.min(140, W * .4), marginY = Math.min(104, H * .35);
        bx = Math.max(marginX, Math.min(W - marginX, px));
        by = Math.max(marginY, Math.min(H - marginY, py));
        spiderModel.setArenaTarget(bx, by);
        centipedeModel.setArenaTarget(bx, by);
      },
      arenaAttack(px, py, victim) {
        spiderModel.arenaAttack(px, py, victim);
        centipedeModel.arenaAttack(px, py, victim);
      },
      arenaEffects() { return [...spiderModel.arenaEffects(), ...centipedeModel.arenaEffects()]; },
      update() { spiderModel.update(); centipedeModel.update(); },
      draw(now) {
        centipedeModel.draw(now);
        spiderModel.draw(now);
        x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = '#efb6ff';
        x.shadowColor = '#c34dff'; x.shadowBlur = 22;
        x.beginPath(); x.arc(bx, by - 18, 12 + Math.sin(now / 90) * 2, 0, TAU); x.fill();
        x.restore();
      }
    };
  };
  const makeArachne = () => ({
    team: 'monsters', kind: 'boss', name: 'Arachne, World-Eater', color: '#c34dff',
    x: W / 2, y: H / 2, vx: 0, vy: 0, hp: 0, maxHp: 32 + round * 4,
    inv: 0, cd: 45, respawn: 0, radius: 42, active: false, model: makeBossModel()
  });
  const BOSSES = {
    wyrm: { name: 'Void Wyrm', color: '#b66bff' }, mech: { name: 'Gearhead Mech', color: '#ffb33b' }, phantom: { name: 'Grand Phantom', color: '#ff6b9a' },
    shell: { name: 'Shell Tyrant', color: '#ff8a3d' }, eye: { name: 'Overseer Eye', color: '#ff4d6d' }
  };
  const themeFor = () => ({ 'Block Raiders': 'wyrm', 'Bolt Bots': 'mech', 'Phantom Maze': 'phantom', 'Shroom Realm': 'shell', 'Cavern Critters': 'eye' })[waveSets[(round - 1) % waveSets.length].name];
  const makeBoss = () => {
    const th = themeFor(); if (!th) return makeArachne();
    const info = BOSSES[th];
    return { team: 'monsters', kind: 'boss', theme: th, name: info.name, color: info.color, x: W / 2, y: H / 2, vx: 0, vy: 0, hp: 0, maxHp: th === 'eye' ? 26 + round * 3 : 36 + round * 4, inv: 0, cd: 45, respawn: 0, radius: 40, active: false, t: 0, eatCd: 0, face: 1 };
  };
  const addWaveEnemy = (kind, index) => {
    const info = enemyInfo[kind], p = [
      [W * .25, H * .25], [W * .75, H * .25],
      [W * .25, H * .75], [W * .75, H * .75]
    ][index % 4];
    const scale = 1 + Math.floor((round - 1) / waveSets.length) * .2;
    const enemy = {
      team: 'monsters', kind, name: info.name, color: info.color,
      x: p[0], y: Math.max(enemyTop, Math.min(enemyBottom, p[1])),
      vx: 0, vy: 0, hp: Math.round(info.hp * scale), maxHp: Math.round(info.hp * scale),
      inv: 0, cd: kind === 'mite' ? 55 : kind === 'wisp' ? 75 : 65,
      respawn: 0, radius: info.radius
    };
    if (kind === 'spider') enemy.model = spider(true, enemy.color);
    if (kind === 'centipede') enemy.model = centipede(true, enemy.color);
    if (kind === 'runner') enemy.model = zip(true);
    if (kind === 'builder') enemy.model = miner(true);
    if (kind === 'chomper') enemy.model = chomp(true);
    if (kind === 'ember') enemy.model = ember(true);
    enemy.t = 0; enemy.variant = index; enemy.face = 1;
    if (kind === 'ghost') { const g = GH[index % 4]; enemy.name = g.name; enemy.color = g.color; enemy.variant = index % 4; }
    if (enemy.model) {
      if (enemy.model.setArenaFloor) enemy.model.setArenaFloor(arenaFloor);
      if (enemy.model.setArenaTarget) enemy.model.setArenaTarget(enemy.x, enemy.y);
    }
    enemies.push(enemy); fighters.push(enemy);
  };
  const spawnRound = () => {
    bannerFr = fr; powerUntil = 0;
    enemies.length = 0;
    fighters.length = heroes.length;
    const wave = waveSets[(round - 1) % waveSets.length];
    wave.kinds.forEach(addWaveEnemy);
    boss = makeBoss();
    enemies.push(boss); fighters.push(boss);
    phase = 'wave'; intermissionAt = 0;
  };
  spawnRound();
  const pos = fighter => {
    if (fighter.fig) return fighter.fig.pt();
    if (fighter.model) return fighter.model.arenaPosition();
    return fighter;
  };
  const targetFor = fighter => {
    let target = null, nearest = Infinity;
    const here = pos(fighter);
    for (const other of fighters) {
      if (other.team === fighter.team || other.hp <= 0) continue;
      const there = pos(other), d = Math.hypot(there.x - here.x, there.y - here.y);
      if (d < nearest) { nearest = d; target = other; }
    }
    return target && { fighter: target, point: pos(target), distance: nearest };
  };
  const addMini = (px, py) => {
    const info = enemyInfo.miniSlime;
    const e = { team: 'monsters', kind: 'miniSlime', name: info.name, color: info.color, x: px, y: py, vx: (R() - .5) * 6, vy: -6, hp: info.hp, maxHp: info.hp, inv: 20, cd: 40, respawn: 0, radius: info.radius, t: 0, face: 1 };
    enemies.splice(enemies.length - 1, 0, e); fighters.push(e);
  };
  const onDefeat = m => {
    const p = pos(m);
    ring(p.x, p.y, 46, m.color); burst(p.x, p.y, 22, m.color, .12); burst(p.x, p.y, 8, '#fff');
    if (!m.silent) floaters.push({ x: p.x, y: p.y - 26, t: m.kind === 'boss' ? 'BOSS DOWN!' : 'DEFEATED', c: m.color, l: 1, big: true });
    if (m.kind === 'slime') for (let i = 0; i < 2; i++) addMini(m.x + (i ? 14 : -14), m.y);
    xp += 3;
  };
  const damage = fighter => {
    if (fighter.hp <= 0 || fighter.inv > 0) return;
    const p = pos(fighter);
    fighter.hp--; fighter.inv = 24;
    burst(p.x, p.y, 10, fighter.color); ring(p.x, p.y, 34, fighter.color);
    floaters.push({ x: p.x + (R() - .5) * 14, y: p.y - 22, t: '-1', c: fighter.team === 'heroes' ? '#ff8a8a' : '#ffe277', l: 1 });
    if (fighter.hp === 0) { if (fighter.team === 'heroes') fighter.respawn = 100; else onDefeat(fighter); }
    xp++;
  };
  const blockedByWalls = (team, x1, y1, x2, y2, radius = 0) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 5));
    for (const builder of fighters) {
      if (builder.team === team || !builder.model || !builder.model.arenaBlocks) continue;
      const walls = builder.model.arenaBlocks();
      for (const wall of walls) {
        if (wall.kind !== 'wall') continue;
        let hit = false;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps, px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t;
          if (px + radius >= wall.l && px - radius <= wall.r && py + radius >= wall.t && py - radius <= wall.b) {
            hit = true;
            break;
          }
        }
        if (!hit) continue;
        wall.hp--;
        ring((wall.l + wall.r) / 2, (wall.t + wall.b) / 2, 20, wall.colors[0]);
        burst(x2, y2, 4, wall.colors[0]);
        if (wall.hp <= 0) walls.splice(walls.indexOf(wall), 1);
        return true;
      }
    }
    return false;
  };
  const applyModelEffects = fighter => {
    if (!fighter.model || !fighter.model.arenaEffects) return;
    for (const effect of fighter.model.arenaEffects()) {
      if (effect.applied) continue;
      effect.applied = true;
      if (effect.type === 'blast') {
        for (const target of fighters) {
          if (target.team === fighter.team || target.hp <= 0) continue;
          const p = pos(target);
          if (Math.hypot(p.x - effect.x, p.y - effect.y) <= effect.radius + (target.radius || 0)) damage(target);
        }
        continue;
      }
      if (!effect.victim) continue;
      const victim = effect.victim;
      if (victim.hp <= 0 || victim.team === fighter.team) continue;
      victim.statusColor = effect.type === 'web' ? '#dff3ff' : effect.col || fighter.color;
      if (effect.type === 'web') {
        victim.snared = Math.max(victim.snared || 0, 40);
      } else if (effect.type === 'toxin') {
        victim.poisoned = Math.max(victim.poisoned || 0, 100);
        victim.poisonTick = 24;
      }
      const p = pos(victim);
      ring(p.x, p.y, effect.type === 'web' ? 42 : 30, victim.statusColor);
      burst(p.x, p.y, effect.type === 'web' ? 8 : 10, victim.statusColor);
      if (effect.type === 'web') {
        const element = grab(effect.x, effect.y);
        if (element) web(element, { x: effect.x, y: effect.y });
      }
      damage(victim);
    }
  };
  const fire = (fighter, target, speed, radius, type, g) => {
    const p = pos(fighter), dx = target.x - p.x, dy = target.y - p.y, distance = Math.hypot(dx, dy) || 1;
    shots.push({ owner: fighter, x: p.x, y: p.y - 14, vx: dx / distance * speed, vy: dy / distance * speed, radius, life: 100, color: fighter.color, type, g: g || 0 });
  };
  const movementGoal = (fighter, target, here) => {
    const standOff = fighter.kind === 'builder' ? 230 : fighter.kind === 'ember' ? 210 :
      fighter.kind === 'green' ? 240 : fighter.kind === 'yellow' ? 205 : fighter.kind === 'blue' ? 220 : 0;
    if (!standOff) return target;
    const dx = here.x - target.x, dy = here.y - target.y, distance = Math.hypot(dx, dy) || 1;
    if (distance >= standOff - 28 && distance <= standOff + 38) return here;
    return { x: target.x + dx / distance * standOff, y: target.y + dy / distance * standOff };
  };
  const respawn = fighter => {
    fighter.hp = fighter.maxHp; fighter.inv = 35; fighter.respawn = 0;
    if (fighter.fig) {
      const w = fighter.fig.position(); w.x = W * (.2 + R() * .6); w.y = H * .3;
      w.vx = 0; w.vy = 0; w.ground = false; w.pound = false;
    } else {
      fighter.x = W * (.2 + R() * .6); fighter.y = Math.max(enemyTop, Math.min(enemyBottom, H * (.2 + R() * .6)));
      fighter.vx = 0; fighter.vy = 0;
    }
  };
  const activateBoss = () => {
    if (phase !== 'wave' || boss.active || enemies.slice(0, -1).some(enemy => enemy.hp > 0)) return;
    boss.active = true; boss.hp = boss.maxHp; boss.inv = 50;
    phase = 'boss';
    boss.x = W / 2; boss.y = H / 2; boss.cd = 45;
    if (boss.theme === 'shell') boss.y = enemyBottom;
    if (boss.theme === 'wyrm') boss.segs = null;
    ring(boss.x, boss.y, 100, boss.color); burst(boss.x, boss.y, 36, boss.color);
    floaters.push({ x: W / 2, y: H * .3, t: 'WARNING: ' + boss.name.toUpperCase(), c: boss.color, l: 2, big: true });
  };
  const updateShot = shot => {
    const previousX = shot.x, previousY = shot.y;
    shot.vy += shot.g || 0; shot.x += shot.vx; shot.y += shot.vy; shot.life--;
    shot.trail = shot.trail || []; shot.trail.push({ x: previousX, y: previousY }); if (shot.trail.length > 5) shot.trail.shift();
    if (blockedByWalls(shot.owner.team, previousX, previousY, shot.x, shot.y, shot.radius)) return false;
    for (const target of fighters) {
      if (target.team === shot.owner.team || target.hp <= 0) continue;
      const p = pos(target);
      if (Math.hypot(p.x - shot.x, p.y - shot.y) < shot.radius + (target.radius || 13)) {
        damage(target); return false;
      }
    }
    return shot.life > 0 && shot.x > -20 && shot.x < W + 20 && shot.y > -20 && shot.y < H + 20;
  };
  const drawHealth = fighter => {
    const p = pos(fighter), width = fighter.fig ? 30 : fighter.kind === 'boss' ? 110 : 44, h = fighter.kind === 'boss' ? 6 : 4;
    const y = p.y - (fighter.fig ? 50 : (fighter.radius || 13) + 17), ratio = Math.max(0, fighter.hp / fighter.maxHp);
    x.save();
    x.fillStyle = 'rgba(0,0,0,.72)'; x.fillRect(p.x - width / 2 - 1, y - 1, width + 2, h + 2);
    x.fillStyle = ratio > .6 ? '#5fe08a' : ratio > .3 ? '#ffd24a' : '#ff5a5a'; x.fillRect(p.x - width / 2, y, width * ratio, h);
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(p.x - width / 2, y, width * ratio, 1.5);
    x.fillStyle = fighter.color; x.shadowColor = 'rgba(0,0,0,.85)'; x.shadowBlur = 3;
    x.font = fighter.kind === 'boss' ? '12px system-ui,sans-serif' : '10px system-ui,sans-serif'; x.textAlign = 'center';
    x.fillText(fighter.name, p.x, y - 3);
    x.restore();
  };
  const drawBoss = (b, now) => {
    const th = b.theme, f = b.face || 1, r = b.radius;
    const off = Math.max(r + 4, enemyBottom + r - b.y);
    x.save(); x.globalAlpha *= Math.max(.06, .28 * (1 - Math.min(1, off / 320))); x.fillStyle = '#000'; x.beginPath(); x.ellipse(0, off, r * 1.1, 6, 0, 0, TAU); x.fill(); x.restore();
    if (th === 'wyrm') {
      const segs = b.segs || [];
      for (let i = segs.length - 1; i >= 0; i--) {
        const s = segs[i], sz = i < 3 ? 19 : 15 - Math.min(5, i * .3), a = i === 0 ? Math.atan2(b.y - segs[0].y, b.x - segs[0].x) : Math.atan2(segs[i - 1].y - s.y, segs[i - 1].x - s.x);
        x.save(); x.translate(s.x - b.x, s.y - b.y); x.rotate(a);
        x.fillStyle = i % 2 ? '#4a1f80' : '#5c2a9c'; x.fillRect(-sz, -sz * .7, sz * 2, sz * 1.4); x.strokeStyle = '#2a0f4d'; x.lineWidth = 1.5; x.strokeRect(-sz, -sz * .7, sz * 2, sz * 1.4);
        x.fillStyle = '#e9b6ff'; x.fillRect(-2, -2, 4, 4);
        if (i === 3 || i === 4) { const fl = Math.sin(now / 90) * .5; for (const sd of [-1, 1]) { x.save(); x.rotate(sd * (1.1 + fl)); x.fillStyle = 'rgba(120,60,200,.75)'; x.beginPath(); x.moveTo(0, 0); x.lineTo(-10, sd * 46); x.lineTo(20, sd * 38); x.closePath(); x.fill(); x.restore(); } }
        x.restore();
      }
      const ha = Math.atan2(b.vy || 0, b.vx || 1); x.save(); x.rotate(ha); x.shadowColor = '#c34dff'; x.shadowBlur = 14;
      x.fillStyle = '#6b2fa8'; x.fillRect(-18, -16, 40, 32); x.fillStyle = '#4a1f80'; x.fillRect(22, -10, 14, 20); x.fillRect(-18, -22, 8, 8); x.fillRect(-18, 14, 8, 8);
      x.fillStyle = '#ff9bf5'; x.fillRect(6, -10, 8, 6); x.fillRect(6, 4, 8, 6); x.restore();
    } else if (th === 'mech') {
      if (b.ball) {
        const bx = b.ball.x - b.x, by = b.ball.y - b.y, n = 10;
        x.fillStyle = '#6b7380'; for (let i = 1; i < n; i++) x.fillRect(bx * i / n - 2, 28 + (by - 28) * i / n - 2, 4, 4);
        x.save(); x.translate(bx, by); x.fillStyle = '#39404a'; for (let i = 0; i < 8; i++) { x.rotate(TAU / 8); x.beginPath(); x.moveTo(22, -5); x.lineTo(36, 0); x.lineTo(22, 5); x.closePath(); x.fill(); }
        x.beginPath(); x.arc(0, 0, 25, 0, TAU); x.fill(); x.strokeStyle = '#8b94a3'; x.lineWidth = 2; x.stroke(); x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(-8, -8, 7, 0, TAU); x.fill(); x.restore();
      }
      const fl = 8 + Math.sin(now / 40) * 5; x.fillStyle = '#ffb33b'; x.beginPath(); x.moveTo(-14, 34); x.lineTo(0, 34 + fl * 2); x.lineTo(14, 34); x.closePath(); x.fill();
      x.fillStyle = '#eef2f8'; x.beginPath(); x.ellipse(0, 4, 46, 34, 0, 0, TAU); x.fill(); x.strokeStyle = '#ff7a2f'; x.lineWidth = 5; x.beginPath(); x.ellipse(0, 6, 46, 34, 0, .15, Math.PI - .15); x.stroke();
      x.fillStyle = 'rgba(120,210,255,.8)'; x.beginPath(); x.arc(0, -12, 21, Math.PI, 0); x.closePath(); x.fill(); x.fillStyle = '#2b3140'; x.beginPath(); x.arc(0, -10, 8, 0, TAU); x.fill(); x.fillStyle = '#ff4d4d'; x.fillRect(-4, -12, 3, 3); x.fillRect(2, -12, 3, 3);
      x.strokeStyle = '#6b7380'; x.lineWidth = 3; x.beginPath(); line(18, -30, 24, -46); x.stroke(); x.fillStyle = Math.floor(now / 250) % 2 ? '#ff4d4d' : '#5a1b1b'; x.beginPath(); x.arc(24, -47, 4, 0, TAU); x.fill();
      x.strokeStyle = '#8b94a3'; x.lineWidth = 5; for (const s of [-1, 1]) { x.beginPath(); line(s * 40, 8, s * 54, 26); x.stroke(); x.fillStyle = '#39404a'; x.fillRect(s * 54 - 5, 24, 10, 8); }
    } else if (th === 'phantom') {
      const scared = fr < powerUntil, flash = scared && powerUntil - fr < 90 && fr % 12 < 6, col = scared ? (flash ? '#fff' : '#2a3cff') : b.color;
      x.save(); x.shadowColor = col; x.shadowBlur = 18; x.fillStyle = col; x.beginPath(); x.arc(0, -4, r, Math.PI, 0); x.lineTo(r, r - 2);
      for (let i = 0; i < 6; i++) x.quadraticCurveTo(r - (i * 2 + 1) * r / 6, r + (i % 2 ? -3 : 9) + Math.sin(now / 120 + i) * 3, r - (i + 1) * r / 3, r - 2);
      x.closePath(); x.fill(); x.restore();
      if (scared) {
        x.fillStyle = flash ? '#2a3cff' : '#ffe0e0'; x.fillRect(-14, -12, 7, 7); x.fillRect(7, -12, 7, 7); x.strokeStyle = x.fillStyle; x.lineWidth = 3; x.beginPath(); x.moveTo(-20, 12); for (let i = 1; i < 6; i++) x.lineTo(-20 + i * 8, i % 2 ? 22 : 12); x.stroke();
      } else {
        const lx = (b.lookx || 0) * 6, ly = (b.looky || 0) * 6;
        x.fillStyle = '#fff'; x.beginPath(); x.ellipse(-13, -10, 9, 12, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(13, -10, 9, 12, 0, 0, TAU); x.fill();
        x.fillStyle = '#1b2cff'; x.beginPath(); x.arc(-13 + lx, -10 + ly, 5, 0, TAU); x.fill(); x.beginPath(); x.arc(13 + lx, -10 + ly, 5, 0, TAU); x.fill();
        x.strokeStyle = '#220'; x.lineWidth = 3; x.beginPath(); line(-23, -24, -6, -19); line(23, -24, 6, -19); x.stroke();
        x.fillStyle = '#ffe135'; x.beginPath(); x.moveTo(-14, -r + 2); x.lineTo(-8, -r - 10); x.lineTo(0, -r + 1); x.lineTo(8, -r - 10); x.lineTo(14, -r + 2); x.closePath(); x.fill();
      }
    } else if (th === 'shell') {
      x.save(); x.scale(f, 1);
      const sq = Math.min(.12, Math.abs(b.vy || 0) * .012); x.scale(1 - sq, 1 + sq);
      x.fillStyle = '#c9702a'; x.fillRect(-30, r - 14, 20, 16); x.fillRect(8, r - 14, 20, 16);
      x.fillStyle = '#ffd9a0'; x.beginPath(); x.ellipse(0, 6, 34, 30, 0, 0, TAU); x.fill();
      x.fillStyle = '#ff8a3d'; x.beginPath(); x.ellipse(-12, -4, 36, 32, -.2, 0, TAU); x.fill(); x.strokeStyle = '#8a3d12'; x.lineWidth = 2.5; x.stroke();
      x.beginPath(); line(-12, -34, -12, 26); line(-44, -4, 20, -4); x.stroke();
      x.fillStyle = '#f2f2f2'; for (const [sx, sy] of [[-30, -28], [-8, -36], [14, -26], [-42, -10]]) { x.beginPath(); x.moveTo(sx - 6, sy + 8); x.lineTo(sx, sy - 10); x.lineTo(sx + 6, sy + 8); x.closePath(); x.fill(); }
      x.fillStyle = '#6bbf3a'; x.fillRect(18, -22, 26, 24); x.fillStyle = '#ffd9a0'; x.fillRect(34, -6, 16, 12);
      x.fillStyle = '#fff'; x.fillRect(26, -16, 8, 8); x.fillStyle = '#c0261a'; x.fillRect(30, -14, 4, 5); x.strokeStyle = '#2a1a0a'; x.lineWidth = 3; x.beginPath(); line(24, -20, 36, -16); x.stroke();
      x.fillStyle = '#f2f2f2'; x.beginPath(); x.moveTo(20, -22); x.lineTo(22, -36); x.lineTo(28, -22); x.closePath(); x.fill();
      if (b.cd < 24) { x.save(); x.shadowColor = '#ff8a3d'; x.shadowBlur = 16; x.fillStyle = '#ffcf5a'; x.beginPath(); x.arc(52, 0, 8, 0, TAU); x.fill(); x.restore(); }
      x.restore();
    } else if (th === 'eye') {
      const rage = b.hp <= b.maxHp / 2, lx = (b.lookx || 0) * r * .32, ly = (b.looky || 0) * r * .32;
      if (b.trail) b.trail.forEach((p, i) => { x.save(); x.globalAlpha = (i + 1) / 10; x.fillStyle = '#ff2a4a'; x.beginPath(); x.arc(p.x - b.x, p.y - b.y, r * .9, 0, TAU); x.fill(); x.restore(); });
      x.save(); if (b.dash > 0 || rage) { x.shadowColor = '#ff2a4a'; x.shadowBlur = 20; }
      x.fillStyle = rage ? '#e8c8c8' : '#f4f0f0'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); x.restore();
      x.strokeStyle = rage ? '#ff2a4a' : '#d96a7a'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < 9; i++) { const a = i * TAU / 9 + .2; line(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * r * .5 + lx * .3, Math.sin(a) * r * .5 + ly * .3); } x.stroke();
      x.fillStyle = rage ? '#ff2a4a' : '#d03050'; x.beginPath(); x.arc(lx, ly, r * .5, 0, TAU); x.fill();
      if (rage) { x.fillStyle = '#120008'; x.beginPath(); x.arc(lx, ly, r * .36, 0, TAU); x.fill(); x.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; x.beginPath(); x.moveTo(lx + Math.cos(a - .15) * r * .36, ly + Math.sin(a - .15) * r * .36); x.lineTo(lx + Math.cos(a) * r * .2, ly + Math.sin(a) * r * .2); x.lineTo(lx + Math.cos(a + .15) * r * .36, ly + Math.sin(a + .15) * r * .36); x.closePath(); x.fill(); } }
      else { x.fillStyle = '#120008'; x.beginPath(); x.arc(lx, ly, r * .22, 0, TAU); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(lx - r * .22, ly - r * .22, 5, 5);
    }
  };
  // ---- monster sprites (all original designs, drawn centred on the monster) ----
  const drawMon = (m, now) => {
    const K = m.kind, r = m.radius, f = m.face || 1, off = Math.max(r + 2, enemyBottom + r - m.y);
    x.save(); x.globalAlpha *= Math.max(.08, .3 * (1 - Math.min(1, off / 260))); x.fillStyle = '#000'; x.beginPath(); x.ellipse(0, off, r * .9, 4, 0, 0, TAU); x.fill(); x.restore();
    x.save(); if (K !== 'ghost' && K !== 'eye') x.scale(f, 1);
    if (K === 'fuse') {
      const fl = m.fuse && m.fuse % 10 < 5, a = fl ? '#fff' : '#58b858', b = fl ? '#f2f2f2' : '#3f9a3f';
      x.fillStyle = a; x.fillRect(-9, -r, 18, 16); x.fillStyle = b; x.fillRect(-6, -r + 16, 12, 14); x.fillRect(-9, r - 4, 7, 6); x.fillRect(2, r - 4, 7, 6);
      x.fillStyle = fl ? '#fff' : '#7ad77a'; x.fillRect(-7, -r + 2, 4, 4); x.fillRect(3, -r + 9, 4, 4);
      x.fillStyle = '#16301a'; x.fillRect(-6, -r + 5, 4, 4); x.fillRect(2, -r + 5, 4, 4); x.fillRect(-3, -r + 10, 6, 3); x.fillRect(-5, -r + 12, 2, 3); x.fillRect(3, -r + 12, 2, 3);
      if (m.fuse) { x.strokeStyle = '#ffe277'; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 24 + (45 - m.fuse) * .5, 0, TAU); x.stroke(); }
    } else if (K === 'bonearcher') {
      x.fillStyle = '#e6edf0'; x.fillRect(-6, -r, 12, 12); x.fillStyle = '#24323a'; x.fillRect(-4, -r + 4, 3, 3); x.fillRect(1, -r + 4, 3, 3); x.fillRect(-2, -r + 8, 4, 1.5);
      x.fillStyle = '#cfd8dc'; x.fillRect(-1, -r + 12, 2, 14); for (let i = 0; i < 3; i++) x.fillRect(-5, -r + 14 + i * 4, 10, 1.6);
      x.fillRect(-5, r - 8, 2, 10); x.fillRect(3, r - 8, 2, 10);
      x.strokeStyle = '#a8743a'; x.lineWidth = 2; x.beginPath(); x.arc(9, -4, 11, -1.2, 1.2); x.stroke();
      x.strokeStyle = '#fff'; x.lineWidth = 1; x.beginPath(); line(9 + Math.cos(-1.2) * 11, -4 + Math.sin(-1.2) * 11, 9 + Math.cos(1.2) * 11, -4 + Math.sin(1.2) * 11); x.stroke();
    } else if (K === 'rotwalker') {
      const sw = Math.sin(m.x * .25) * 3;
      x.fillStyle = '#6fa88f'; x.fillRect(-7, -r, 14, 13); x.fillStyle = '#2a4a3d'; x.fillRect(-5, -r + 4, 3, 3); x.fillRect(2, -r + 4, 3, 3);
      x.fillStyle = '#ff5a5a'; x.fillRect(-4, -r + 5, 1.5, 1.5); x.fillRect(3, -r + 5, 1.5, 1.5);
      x.fillStyle = '#3b6fb0'; x.fillRect(-7, -r + 13, 14, 12); x.fillStyle = '#6fa88f'; x.fillRect(6, -r + 14, 10, 4); x.fillRect(-14, -r + 16, 8, 4);
      x.fillStyle = '#2f3b52'; x.fillRect(-6 + sw, r - 5, 5, 7); x.fillRect(2 - sw, r - 5, 5, 7);
    } else if (K === 'buzz') {
      x.fillStyle = '#9fb4d8'; x.beginPath(); x.ellipse(0, 0, 14, 10, 0, 0, TAU); x.fill(); x.strokeStyle = '#5c78a8'; x.lineWidth = 1.5; x.stroke();
      x.save(); x.fillStyle = '#ff4d4d'; x.shadowColor = '#ff4d4d'; x.shadowBlur = 8; x.beginPath(); x.arc(7, -1, 3, 0, TAU); x.fill(); x.restore();
      const rl = 10 + Math.abs(Math.sin(now / 25)) * 10; x.strokeStyle = '#dfe8ff'; x.lineWidth = 2; x.beginPath(); line(-rl, -13, rl, -13); x.stroke(); x.fillStyle = '#5c78a8'; x.fillRect(-1, -13, 2, 4);
      x.beginPath(); x.moveTo(-14, 0); x.lineTo(-22, -3); x.lineTo(-22, 3); x.closePath(); x.fill();
    } else if (K === 'crabbot') {
      const cl = Math.sin(now / 150) * .25;
      x.fillStyle = '#ff7a59'; x.beginPath(); x.arc(0, 4, 15, Math.PI, 0); x.fill(); x.fillRect(-15, 4, 30, 6); x.fillStyle = '#c94a2e'; x.fillRect(-12, 10, 5, 5); x.fillRect(7, 10, 5, 5);
      for (const s of [-1, 1]) {
        x.save(); x.translate(s * 17, 0); x.rotate(s * cl); x.fillStyle = '#ff7a59'; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 6, .3, 5.9); x.closePath(); x.fill(); x.restore();
        x.strokeStyle = '#c94a2e'; x.lineWidth = 1.5; x.beginPath(); line(s * 5, -10, s * 6, -18); x.stroke();
        x.fillStyle = '#fff'; x.beginPath(); x.arc(s * 6, -19, 3, 0, TAU); x.fill(); x.fillStyle = '#222'; x.fillRect(s * 6 - .5, -20, 2, 2);
      }
    } else if (K === 'spinroll') {
      x.rotate(now / (m.dash > 0 ? 40 : 160));
      x.fillStyle = '#0f7a83'; for (let i = 0; i < 8; i++) { x.rotate(TAU / 8); x.beginPath(); x.moveTo(r - 4, -3); x.lineTo(r + 7, 0); x.lineTo(r - 4, 3); x.closePath(); x.fill(); }
      x.fillStyle = '#33c4d0'; x.beginPath(); x.arc(0, 0, r - 2, 0, TAU); x.fill(); x.strokeStyle = '#d8fbff'; x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, r - 6, .4, 2.2); x.stroke();
      x.fillStyle = '#ff4d4d'; x.beginPath(); x.arc(r - 5, 0, 2.5, 0, TAU); x.fill();
    } else if (K === 'ghost') {
      const scared = fr < powerUntil, flash = scared && powerUntil - fr < 90 && fr % 12 < 6, col = scared ? (flash ? '#fff' : '#2a3cff') : m.color;
      x.fillStyle = col; x.beginPath(); x.arc(0, -2, r, Math.PI, 0); x.lineTo(r, r - 2);
      for (let i = 0; i < 4; i++) x.quadraticCurveTo(r - (i * 2 + 1) * r / 4, r + (i % 2 ? -2 : 6), r - (i + 1) * r / 2, r - 2);
      x.closePath(); x.fill();
      if (scared) {
        x.fillStyle = flash ? '#2a3cff' : '#ffe0e0'; x.fillRect(-5, -5, 3, 3); x.fillRect(3, -5, 3, 3);
        x.strokeStyle = x.fillStyle; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-7, 4); for (let i = 1; i < 5; i++) x.lineTo(-7 + i * 3.5, i % 2 ? 7 : 4); x.stroke();
      } else {
        const lx = (m.lookx || 0) * 2.5, ly = (m.looky || 0) * 2.5;
        x.fillStyle = '#fff'; x.beginPath(); x.ellipse(-5, -5, 4, 5, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(5, -5, 4, 5, 0, 0, TAU); x.fill();
        x.fillStyle = '#1b2cff'; x.beginPath(); x.arc(-5 + lx, -5 + ly, 2, 0, TAU); x.fill(); x.beginPath(); x.arc(5 + lx, -5 + ly, 2, 0, TAU); x.fill();
      }
    } else if (K === 'capwalker') {
      const sw = Math.sin(m.x * .3) * 3;
      x.fillStyle = '#d9b98a'; x.fillRect(-8, -2, 16, 12); x.fillStyle = '#3a2a1a'; x.fillRect(-9 + sw, r - 5, 8, 5); x.fillRect(1 - sw, r - 5, 8, 5);
      x.fillStyle = '#9b5de5'; x.beginPath(); x.arc(0, -2, r, Math.PI, 0); x.closePath(); x.fill();
      x.fillStyle = '#ffe277'; for (const [sx, sy, sr] of [[-6, -9, 3], [5, -11, 2.5], [9, -5, 2]]) { x.beginPath(); x.arc(sx, sy, sr, 0, TAU); x.fill(); }
      x.fillStyle = '#fff'; x.fillRect(-6, 1, 5, 5); x.fillRect(1, 1, 5, 5); x.fillStyle = '#222'; x.fillRect(-3, 3, 2.5, 3); x.fillRect(2, 3, 2.5, 3);
      x.strokeStyle = '#222'; x.lineWidth = 2; x.beginPath(); line(-7, -1, -1, 1); line(7, -1, 1, 1); x.stroke();
    } else if (K === 'shellhopper') {
      if (m.shell > 0) {
        x.rotate(now / 60 * f); x.fillStyle = '#ff9f43'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); x.strokeStyle = '#a85a12'; x.lineWidth = 2; x.stroke();
        x.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6; line(0, 0, Math.cos(a) * r, Math.sin(a) * r); } x.stroke(); x.beginPath(); x.arc(0, 0, r * .55, 0, TAU); x.stroke();
      } else {
        const sq = Math.min(.18, Math.abs(m.vy || 0) * .02); x.scale(1 - sq, 1 + sq);
        x.fillStyle = '#35c6a0'; x.fillRect(-4, r - 9, 14, 9); x.fillRect(4, -8, 10, 10); x.fillStyle = '#fff'; x.fillRect(10, -6, 3, 3); x.fillStyle = '#222'; x.fillRect(11, -5, 1.5, 1.5);
        x.fillStyle = '#ff9f43'; x.beginPath(); x.ellipse(-3, 0, 12, 11, 0, 0, TAU); x.fill(); x.strokeStyle = '#a85a12'; x.lineWidth = 1.5; x.stroke();
        x.beginPath(); line(-3, -11, -3, 11); line(-13, 0, 7, 0); x.stroke(); x.fillStyle = '#35c6a0'; x.fillRect(-12, r - 4, 6, 5);
      }
    } else if (K === 'mallet') {
      const sw = m.windup > 0 ? (14 - m.windup) / 14 * 2.4 - 1.4 : -.6;
      x.fillStyle = '#ff9f43'; x.fillRect(-9, -4, 18, 18); x.fillStyle = '#7d8793'; x.fillRect(-8, -r, 16, 11); x.fillStyle = '#d6dde5'; x.fillRect(-8, -r, 16, 3);
      x.fillStyle = '#222'; x.fillRect(-4, -r + 6, 3, 3); x.fillRect(2, -r + 6, 3, 3); x.fillStyle = '#4a3a2a'; x.fillRect(-8, r - 4, 7, 6); x.fillRect(2, r - 4, 7, 6);
      x.save(); x.translate(8, -2); x.rotate(sw); x.fillStyle = '#7a4a1e'; x.fillRect(0, -1.5, 20, 3); x.fillStyle = '#9aa4b0'; x.fillRect(15, -7, 10, 14); x.restore();
    } else if (K === 'slime' || K === 'miniSlime') {
      const sq = m.ground ? Math.sin(now / 200 + (m.t || 0)) * .05 : Math.min(.2, Math.abs(m.vy || 0) * .025);
      x.fillStyle = 'rgba(90,200,250,.8)'; x.beginPath(); x.ellipse(0, r * .2, r * (1 + sq), r * (.82 - sq), 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(190,240,255,.9)'; x.lineWidth = 1.5; x.stroke();
      x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-r * .35, -r * .2, r * .22, r * .12, -.5, 0, TAU); x.fill();
      x.fillStyle = '#103a52'; x.fillRect(-r * .38, r * .05, r * .18, r * .22); x.fillRect(r * .2, r * .05, r * .18, r * .22);
    } else if (K === 'eye') {
      const lx = (m.lookx || 0) * r * .35, ly = (m.looky || 0) * r * .35, rage = m.hp <= m.maxHp / 2;
      x.save(); if (m.dash > 0) { x.shadowColor = '#ff2a4a'; x.shadowBlur = 16; } x.fillStyle = '#f4f0f0'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); x.restore();
      x.strokeStyle = rage ? '#ff2a4a' : '#d96a7a'; x.lineWidth = 1; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + .3; line(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * r * .55 + lx * .3, Math.sin(a) * r * .55 + ly * .3); } x.stroke();
      x.fillStyle = rage ? '#ff2a4a' : '#d03050'; x.beginPath(); x.arc(lx, ly, r * .45, 0, TAU); x.fill(); x.fillStyle = '#120008'; x.beginPath(); x.arc(lx, ly, r * .2, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(lx - r * .2, ly - r * .2, 3, 3);
    } else if (K === 'bat') {
      const fl = Math.sin(now / 55 + (m.ph || 0)) * .7;
      x.fillStyle = '#5a2fa8';
      for (const s of [-1, 1]) { x.save(); x.rotate(s * fl); x.beginPath(); x.moveTo(0, -2); x.quadraticCurveTo(s * 14, -16, s * 24, -4); x.lineTo(s * 17, -3); x.lineTo(s * 12, 3); x.lineTo(s * 6, 0); x.closePath(); x.fill(); x.restore(); }
      x.fillStyle = '#7b4bd6'; x.beginPath(); x.ellipse(0, 0, 7, 9, 0, 0, TAU); x.fill();
      x.beginPath(); x.moveTo(-6, -7); x.lineTo(-4, -14); x.lineTo(-1, -8); x.closePath(); x.fill(); x.beginPath(); x.moveTo(6, -7); x.lineTo(4, -14); x.lineTo(1, -8); x.closePath(); x.fill();
      x.fillStyle = '#ff4d6d'; x.fillRect(-4, -3, 2.5, 2.5); x.fillRect(2, -3, 2.5, 2.5);
    }
    x.restore();
  };
  // ---- monster behaviour: each family has its own moves ----
  const landOnPlatforms = (m, previousY) => {
    m.ground = false;
    if (m.vy < 0) return;
    let best = null;
    for (const p of plats.concat(arenaFloor)) {
      if (m.x < p.l - m.radius * .5 || m.x > p.r + m.radius * .5 ||
          previousY > p.t + 1 || m.y < p.t) continue;
      if (!best || p.t < best.t) best = p;
    }
    if (best) { m.y = best.t; m.vy = 0; m.ground = true; m.platformGoal = null; }
  };
  const grav = m => {
    const previousY = m.y;
    m.vy = Math.min((m.vy || 0) + .5, 18);
    m.y += m.vy;
    landOnPlatforms(m, previousY);
  };
  const platformGoal = (m, goal, threat = goal) => {
    if (!usesPlatforms(m)) return goal;
    m.evadeCd = Math.max(0, (m.evadeCd || 0) - 1);
    m.evade = Math.max(0, (m.evade || 0) - 1);
    const dx = m.x - threat.x, dy = m.y - threat.y;
    if (!m.evade && Math.hypot(dx, dy) < 105 && m.evadeCd === 0) {
      m.evade = 24;
      m.evadeCd = 100 + (R() * 45 | 0);
      m.evadeDir = Math.sign(dx) || (R() < .5 ? -1 : 1);
    }
    if (!m.ground && m.platformGoal) return m.platformGoal;
    if (m.ground) m.platformGoal = null;
    const escaping = m.evade > 0;
    let result = escaping
      ? { x: m.x + m.evadeDir * 130, y: m.y - 65 }
      : goal;
    if (m.ground && result.y < m.y - 30) {
      let best = null, bestScore = Infinity;
      for (const p of plats) {
        const cx = Math.max(p.l + 12, Math.min(p.r - 12, result.x));
        if (p.t < 24 || p.t >= m.y - 24 || m.y - p.t > 150 || Math.abs(cx - m.x) > 230) continue;
        if (escaping && Math.sign(cx - m.x) !== Math.sign(result.x - m.x)) continue;
        const score = Math.abs(cx - m.x) + Math.abs(cx - result.x) +
          Math.abs(p.t - result.y) * .65;
        if (score < bestScore) { bestScore = score; best = { x: cx, y: p.t }; }
      }
      if (best && bestScore < Math.hypot(result.x - m.x, result.y - m.y) * 1.8) {
        result = best;
        m.platformGoal = best;
      }
    }
    return result;
  };
  const walk = (m, gx, spd, threat) => {
    const target = threat || { x: gx, y: m.y };
    const goal = platformGoal(m, { x: gx, y: target.y }, target);
    m.navTarget = goal;
    const slow = m.snared > 0 ? .3 : 1;
    m.vx = ((m.vx || 0) + Math.sign(goal.x - m.x) * .3) * .93;
    const mx = spd * slow;
    m.vx = Math.max(-mx, Math.min(mx, m.vx)); m.x += m.vx;
  };
  const hop = (m, h, tp) => {
    const target = m.navTarget || tp;
    if (m.ground && (target.y < m.y - 40 || R() < .006)) { m.vy = -h; m.ground = false; }
  };
  const touch = (m, T, d, reach, cdv) => { if (d < reach && --m.cd <= 0) { damage(T); m.cd = cdv || 40; } };
  const glide = (m, gx, gy, k, cap) => {
    m.vx = ((m.vx || 0) + (gx - m.x) * k) * .92; m.vy = ((m.vy || 0) + (gy - m.y) * k) * .92;
    const sp = Math.hypot(m.vx, m.vy); if (sp > cap) { m.vx *= cap / sp; m.vy *= cap / sp; } m.x += m.vx; m.y += m.vy;
  };
  const stomp = m => {
    for (const h of heroes) {
      if (h.hp <= 0) continue;
      const w = h.fig.position();
      if (w.vy > 1.5 && Math.abs(w.x - m.x) < m.radius + 12 && w.y < m.y && w.y > m.y - m.radius - 30) {
        w.vy = -9; w.ground = false; m.hp = 0; m.silent = true; onDefeat(m);
        floaters.push({ x: m.x, y: m.y - 30, t: 'STOMP!', c: '#ffe277', l: 1, big: true });
        return true;
      }
    }
    return false;
  };
  const blast = m => {
    ring(m.x, m.y, 95, '#7ad77a'); ring(m.x, m.y, 60, '#fff'); burst(m.x, m.y, 36, '#7ad77a'); burst(m.x, m.y, 14, '#fff');
    for (const o of fighters) {
      if (o.team === m.team || o.hp <= 0) continue;
      const p = pos(o);
      if (Math.hypot(p.x - m.x, p.y - m.y) < 85 + (o.radius || 0)) { o.inv = 0; damage(o); }
    }
    for (let k = 0; k < 6; k++) { const q = rnd(m.x, m.y, 85), s = grab(q[0], q[1]); if (s) wipe(s, 'boom', { col: '#7ad77a' }); }
    m.hp = 0; m.silent = true; onDefeat(m);
    floaters.push({ x: m.x, y: m.y - 26, t: 'BOOM!', c: '#7ad77a', l: 1, big: true });
  };
  // ---- themed bosses: one per new wave family (original designs) ----
  const addMinion = (kind, px, py, variant = 0) => {
    const info = enemyInfo[kind];
    const e = { team: 'monsters', kind, name: info.name, color: info.color, x: px, y: py, vx: 0, vy: 0, hp: info.hp, maxHp: info.hp, inv: 30, cd: 60, respawn: 0, radius: info.radius, t: 0, variant, face: 1 };
    if (kind === 'ghost') { const g = GH[variant % 4]; e.name = g.name; e.color = g.color; }
    enemies.splice(enemies.length - 1, 0, e); fighters.push(e); return e;
  };
  const bossThink = (b, tg, here, dx, dy, d) => {
    const tp = tg.point, T = tg.fighter, half = b.hp <= b.maxHp / 2, th = b.theme;
    b.t = (b.t || 0) + 1; b.face = dx >= 0 ? 1 : -1; b.lookx = dx / d; b.looky = dy / d;
    if (half && !b.enraged) { b.enraged = true; ring(b.x, b.y, 140, b.color); burst(b.x, b.y, 40, b.color); floaters.push({ x: b.x, y: b.y - 60, t: 'PHASE 2!', c: b.color, l: 1.6, big: true }); }
    if (th === 'wyrm') {
      if (!b.segs) { b.segs = []; for (let i = 0; i < 16; i++) b.segs.push({ x: b.x - i * 16, y: b.y }); b.ang = 0; b.st = 'orbit'; b.stT = 0; }
      b.stT++; b.ang += half ? .026 : .018;
      let gx, gy, cap = 3.2;
      if (b.st === 'orbit') {
        gx = W / 2 + Math.cos(b.ang) * Math.min(W * .32, 300); gy = H * .36 + Math.sin(b.ang * 1.3) * Math.min(H * .18, 110);
        if (b.stT > (half ? 200 : 300)) { b.st = 'dive'; b.stT = 0; b.dx = dx / d; b.dy = dy / d; }
      } else { gx = b.x + b.dx * 120; gy = b.y + b.dy * 120; cap = 8.5; if (b.stT > 36) { b.st = 'orbit'; b.stT = 0; } }
      glide(b, gx, gy, b.st === 'dive' ? .08 : .03, cap);
      b.x = Math.max(60, Math.min(W - 60, b.x)); b.y = Math.max(60, Math.min(H - 120, b.y));
      let px = b.x, py = b.y;
      for (const s of b.segs) { const ex = px - s.x, ey = py - s.y, ed = Math.hypot(ex, ey) || 1; if (ed > 16) { s.x = px - ex / ed * 16; s.y = py - ey / ed * 16; } px = s.x; py = s.y; }
      if (--b.cd <= 0 && b.st === 'orbit' && d < 650) {
        fire(b, tp, 4.8, 8, 'orb');
        if (half) { fire(b, { x: tp.x - 50, y: tp.y + 30 }, 4.2, 6, 'orb'); fire(b, { x: tp.x + 50, y: tp.y - 30 }, 4.2, 6, 'orb'); }
        b.cd = half ? 42 : 56;
      }
      for (const o of heroes) { if (o.hp <= 0) continue; const p = pos(o); if (Math.hypot(p.x - b.x, p.y - b.y) < 44 || b.segs.some((s, i) => i % 3 === 0 && Math.hypot(p.x - s.x, p.y - s.y) < 22)) damage(o); }
    } else if (th === 'mech') {
      glide(b, W / 2 + Math.sin(b.t / 120) * Math.min(W * .3, 260), H * .26 + Math.sin(b.t / 70) * 20, .02, 2.6);
      if (!b.ball) b.ball = { x: b.x, y: b.y + 120 };
      if (b.slam > 0) { b.slam--; b.ball.x += (b.slx - b.ball.x) * .12; b.ball.y += (b.sly - b.ball.y) * .14; if (b.slam === 0) { ring(b.ball.x, b.ball.y, 90, '#ffb33b'); burst(b.ball.x, b.ball.y, 20, '#ffb33b'); } }
      else { const a = Math.sin(b.t / 38) * 1.05; b.ball.x += (b.x + Math.sin(a) * 150 - b.ball.x) * .2; b.ball.y += (b.y + Math.cos(a) * 150 - b.ball.y) * .2; }
      if (b.t % (half ? 200 : 300) === 0) { b.slam = 40; b.slx = tp.x; b.sly = Math.min(enemyBottom, tp.y); }
      for (const o of heroes) { if (o.hp <= 0) continue; const p = pos(o); if (Math.hypot(p.x - b.ball.x, p.y - b.ball.y) < 30 + (o.radius || 13)) damage(o); }
      if (--b.cd <= 0 && d < 650) { for (const off of [-1, 0, 1]) fire(b, { x: tp.x + off * 60, y: tp.y }, 3.8, 6, 'orb'); b.cd = half ? 70 : 95; }
    } else if (th === 'phantom') {
      const scared = fr < powerUntil; let gx = tp.x, gy = tp.y, sp = 1.9;
      if (scared) { gx = b.x - dx; gy = b.y - dy; sp = 1.2; } else if (b.dashT > 0) { b.dashT--; sp = 7; } else if (b.t % 220 === 0) b.dashT = 20;
      const ex = gx - b.x, ey = gy - b.y, ed = Math.hypot(ex, ey) || 1;
      b.vx = ((b.vx || 0) + ex / ed * .14) * .9; b.vy = ((b.vy || 0) + ey / ed * .14) * .9; const cs = Math.hypot(b.vx, b.vy); if (cs > sp) { b.vx *= sp / cs; b.vy *= sp / cs; } b.x += b.vx; b.y += b.vy;
      if (!scared && b.t % 240 === 120) for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + b.t * .01; shots.push({ owner: b, x: b.x, y: b.y, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2, radius: 6, life: 140, color: '#ffe135', type: 'dot' }); }
      if (!scared && b.t % 480 === 60 && enemies.filter(e => e.kind === 'ghost' && e.hp > 0).length < 3) { addMinion('ghost', b.x, b.y, R() * 4 | 0); addMinion('ghost', b.x, b.y, R() * 4 | 0); ring(b.x, b.y, 80, b.color); }
      if (d < 46) {
        if (scared) { b.eatCd = (b.eatCd || 0) - 1; if (b.eatCd <= 0) { b.inv = 0; damage(b); b.eatCd = 45; floaters.push({ x: b.x, y: b.y - 40, t: 'CHOMP!', c: '#7fb2ff', l: 1, big: true }); } }
        else { b.cc = (b.cc || 0) - 1; if (b.cc <= 0) { damage(T); b.cc = 45; } }
      }
    } else if (th === 'shell') {
      const goal = platformGoal(b, tp, tp), wasGround = b.ground, impactSpeed = b.vy || 0;
      grav(b);
      if (!wasGround && b.ground && impactSpeed > 6) {
        ring(b.x, b.y + 20, 170, '#ff8a3d'); burst(b.x, b.y + 30, 28, '#ff8a3d');
        for (const o of heroes) {
          if (o.hp <= 0) continue;
          const p = pos(o);
          if (Math.hypot(p.x - b.x, p.y - b.y) < 170) damage(o);
        }
      }
      if (b.ground) {
        b.vx = ((b.vx || 0) + Math.sign(goal.x - b.x) * .2) * .93;
        const mx = half ? 2.1 : 1.5;
        b.vx = Math.max(-mx, Math.min(mx, b.vx)); b.x += b.vx;
      } else b.x += (goal.x - b.x) * .02;
      if (b.ground && (goal.y < b.y - 40 || b.t % (half ? 190 : 260) === 0)) { b.vy = -14; b.ground = false; }
      if (--b.cd <= 0 && d < 560) {
        for (let i = -1; i <= 1; i++) { const tt = 55, g = .12; shots.push({ owner: b, x: b.x, y: b.y - 20, vx: (tp.x - b.x) / tt + i * .8, vy: (tp.y - b.y) / tt - g * tt / 2, radius: 8, life: 130, color: '#ff8a3d', type: 'orb', g }); }
        b.cd = half ? 95 : 130;
      }
      if (b.t % 150 === 75) { const tt = 50, g = .14; shots.push({ owner: b, x: b.x, y: b.y - 30, vx: (tp.x - b.x) / tt, vy: (tp.y - b.y) / tt - g * tt / 2, radius: 7, life: 120, color: b.color, type: 'mallet', g }); }
      if (d < 55) { b.cc = (b.cc || 0) - 1; if (b.cc <= 0) { damage(T); b.cc = 45; } }
    } else if (th === 'eye') {
      const rage = half ? 1.3 : 1;
      if (b.dash > 0) { b.x += b.vx; b.y += b.vy; b.dash--; b.trail = b.trail || []; b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 6) b.trail.shift(); if (d < 52) damage(T); }
      else {
        b.trail = [];
        glide(b, tp.x + Math.cos(b.t / 70) * 240, tp.y - 140 + Math.sin(b.t / 50) * 60, .008, 2.4 * rage);
        if (half) { b.dc = (b.dc || 0) - 1; if (b.dc <= 0) { b.dash = 22; b.vx = dx / d * 9; b.vy = dy / d * 9; b.dc = 85; } }
      }
      if (--b.cd <= 0 && d < 650) { for (let i = -2; i <= 2; i++) fire(b, { x: tp.x + i * 70, y: tp.y }, 4, 7, 'orb'); b.cd = half ? 85 : 110; }
      if (b.t % (half ? 360 : 480) === 200 && enemies.filter(e => (e.kind === 'eye' || e.kind === 'bat') && e.hp > 0).length < 3) { addMinion('eye', b.x - 60, b.y); addMinion('bat', b.x + 60, b.y); ring(b.x, b.y, 90, b.color); }
    }
  };
  const think = (m, tg, here, dx, dy, d) => {
    const K = m.kind, tp = tg.point, T = tg.fighter, slow = m.snared > 0 ? .3 : 1;
    m.t = (m.t || 0) + 1; m.face = dx >= 0 ? 1 : -1; m.lookx = dx / d; m.looky = dy / d;
    if (K === 'fuse') {
      if (!m.fuse) { walk(m, tp.x, 1.7, tp); if (d < 95) m.fuse = 45; }
      else if (--m.fuse <= 0) { blast(m); return; }
      grav(m); hop(m, 10, tp);
    } else if (K === 'bonearcher') {
      walk(m, tp.x + (m.x < tp.x ? -240 : 240), 1.3, tp); grav(m); hop(m, 10, tp);
      if (--m.cd <= 0 && d < 480) { fire(m, tp, 5.2, 5, 'arrow'); m.cd = 70 + (R() * 30 | 0); }
    } else if (K === 'rotwalker') {
      walk(m, tp.x, 1.2, tp); grav(m); hop(m, 11, tp); touch(m, T, d, 34, 45);
    } else if (K === 'buzz') {
      glide(m, tp.x + Math.sin(m.t / 40) * 140, tp.y - 150, .008, 3 * slow);
      if (--m.cd <= 0 && d < 480) { fire(m, tp, 4.6, 5, 'orb'); m.cd = 78; }
    } else if (K === 'crabbot') {
      if (m.t % 120 === 1) m.dir = R() < .5 ? -1 : 1;
      walk(m, tp.x + (m.dir || 1) * 150, 1.6, tp); grav(m); hop(m, 9, tp);
      if (--m.cd <= 0 && d < 440) { fire(m, tp, 4.2, 5, 'orb'); fire(m, { x: tp.x, y: tp.y - 30 }, 4.2, 5, 'orb'); m.cd = 88; }
    } else if (K === 'spinroll') {
      if (m.dash > 0) {
        const previousY = m.y;
        m.x += m.vx; m.y += m.vy; m.dash--;
        landOnPlatforms(m, previousY);
        if (d < 30) { damage(T); m.dash = 0; }
      } else {
        walk(m, tp.x, 1.1, tp); grav(m); hop(m, 8, tp);
        if (--m.cd <= 0 && d < 320) { m.dash = 24; m.vx = dx / d * 7.5; m.vy = dy / d * 7.5; m.cd = 115; }
      }
    } else if (K === 'ghost') {
      const fright = fr < powerUntil; let gx = tp.x, gy = tp.y;
      if (fright) { gx = m.x - dx; gy = m.y - dy; }
      else if (m.variant === 1) gx += (T.fig ? T.fig.position().face : 1) * 80;
      else if (m.variant === 2) { gx += Math.sin(m.t / 40) * 120; gy += Math.cos(m.t / 40) * 80; }
      else if (m.variant === 3 && d < 150) { gx = W - tp.x; gy = H - tp.y; }
      const ex = gx - m.x, ey = gy - m.y, ed = Math.hypot(ex, ey) || 1, sp = (fright ? 1.1 : 1.7 + m.variant * .08) * slow;
      m.vx = ((m.vx || 0) + ex / ed * .12) * .9; m.vy = ((m.vy || 0) + ey / ed * .12) * .9;
      const cs = Math.hypot(m.vx, m.vy); if (cs > sp) { m.vx *= sp / cs; m.vy *= sp / cs; } m.x += m.vx; m.y += m.vy;
      if (d < 28) {
        if (fright) { m.hp = 0; m.silent = true; onDefeat(m); floaters.push({ x: m.x, y: m.y - 26, t: 'EATEN!', c: '#7fb2ff', l: 1, big: true }); }
        else if (--m.cd <= 0) { damage(T); m.cd = 40; }
      }
    } else if (K === 'capwalker') {
      walk(m, tp.x, 1.1, tp); grav(m); hop(m, 8, tp); if (stomp(m)) return; touch(m, T, d, 30, 40);
    } else if (K === 'shellhopper') {
      const goal = platformGoal(m, tp, tp); m.navTarget = goal;
      if (m.shell > 0) { m.shell--; m.x += m.vx; if (m.x < 24 || m.x > W - 24) m.vx *= -1; grav(m); if (d < 30) damage(T); if (m.shell <= 0) m.vx = 0; }
      else {
        if (stomp(m)) return;
        if (m.ground) {
          m.cd--;
          if (goal.y < m.y - 40 || m.cd <= 0) {
            m.vy = -9.5; m.vx = Math.sign(goal.x - m.x || 1) * 2.4 * slow; m.cd = 55;
            if (m.hp <= 2 || R() < .22) { m.shell = 110; m.vx = Math.sign(goal.x - m.x || 1) * 6.5; m.vy = 0; }
          }
        }
        grav(m); if (m.ground && !m.shell) m.vx *= .8; m.x += m.vx; if (!m.shell) touch(m, T, d, 30, 45);
      }
    } else if (K === 'mallet') {
      walk(m, tp.x + (m.x < tp.x ? -200 : 200), 1.0, tp); grav(m); hop(m, 10, tp);
      if (m.windup > 0) m.windup--;
      if (--m.cd <= 0 && d < 430) { const tt = 50, g = .14; m.windup = 14; shots.push({ owner: m, x: m.x, y: m.y - 16, vx: (tp.x - m.x) / tt, vy: (tp.y - m.y) / tt - g * tt / 2, radius: 7, life: 120, color: m.color, type: 'mallet', g }); m.cd = 100; }
    } else if (K === 'slime' || K === 'miniSlime') {
      const big = K === 'slime';
      const goal = platformGoal(m, tp, tp); m.navTarget = goal;
      if (m.ground) {
        m.vx *= .8; m.cd--;
        if (goal.y < m.y - 40 || m.cd <= 0) {
          m.vy = -(big ? 10 : 8) - R() * 2;
          m.vx = Math.sign(goal.x - m.x || 1) * (big ? 2.4 : 3) * slow;
          m.cd = big ? 48 : 36; m.ground = false;
        }
      }
      grav(m); m.x += m.vx; touch(m, T, d, m.radius + 16, 40);
    } else if (K === 'eye') {
      const rage = m.hp <= m.maxHp / 2 ? 1.35 : 1;
      if (m.dash > 0) { m.x += m.vx; m.y += m.vy; m.dash--; if (d < 32) { damage(T); m.dash = 0; } }
      else {
        glide(m, tp.x + Math.cos(m.t / 50) * 190, tp.y - 110 + Math.sin(m.t / 35) * 50, .006, 2.4 * rage * slow);
        if (--m.cd <= 0 && d < 420) { m.dash = 26; m.vx = dx / d * 7 * rage; m.vy = dy / d * 7 * rage; m.cd = Math.round(130 / rage); }
      }
    } else if (K === 'bat') {
      m.ph = (m.ph || R() * 6) + .07;
      glide(m, tp.x + Math.cos(m.ph) * 200, tp.y - 50 + Math.sin(m.ph * 2) * 120, .014, 3.6 * slow); touch(m, T, d, 28, 35);
    }
  };
  return {
    col: C.o, needsPlats: true, eat: 0, pts: () => fighters.filter(fighter => fighter.hp > 0).map(pos),
    click(px, py) {
      ring(px, py, 100, C.w);
      for (const hero of heroes) if (hero.hp > 0) hero.fig.special(px, py);
    },
    update() {
      if (phase === 'boss' && boss.hp <= 0) {
        phase = 'intermission'; intermissionAt = fr; shots.length = 0;
        ring(W / 2, H / 2, 150, '#ffe277'); burst(W / 2, H / 2, 60, '#ffe277');
      } else if (phase === 'intermission' && fr - intermissionAt > 110) {
        round++; spawnRound();
      }
      activateBoss();
      if (phase === 'wave' && fr % 840 === 0 && enemies.some(e => (e.kind === 'ghost' || e.theme === 'phantom') && e.hp > 0)) {
        powerUntil = fr + 330; floaters.push({ x: W / 2, y: H * .35, t: 'POWER PELLET!', c: '#7fb2ff', l: 1.6, big: true }); ring(W / 2, H / 2, 160, '#7fb2ff');
      }
      if (phase === 'intermission' && fr % 24 === 0) {
        const hero = heroes[R() * heroes.length | 0], p = pos(hero);
        burst(p.x, p.y - 28, 12, PAL[R() * PAL.length | 0]);
      }
      for (const fighter of fighters) {
        if (fighter.active === false) continue;
        if (fighter.inv > 0) fighter.inv--;
        if (fighter.hp <= 0) {
          if (fighter.team === 'heroes' && --fighter.respawn <= 0) respawn(fighter);
          continue;
        }
        if (fighter.snared > 0) fighter.snared--;
        if (fighter.poisoned > 0) {
          fighter.poisoned--;
          if (--fighter.poisonTick <= 0) {
            fighter.poisonTick = 30;
            damage(fighter);
          }
          if (fr % 8 === 0) {
            const p = pos(fighter);
            burst(p.x, p.y - 12, 2, fighter.statusColor || '#7dff2a');
          }
        }
        const target = targetFor(fighter);
        if (!target) {
          if (fighter.fig) {
            const w = fighter.fig.position(), phase = (fr + heroes.indexOf(fighter) * 24) / 35;
            fighter.fig.setTarget(w.x + Math.sin(phase) * 28, w.y - 34 + Math.cos(phase) * 12);
            fighter.fig.update();
          }
          continue;
        }
        const here = pos(fighter), dx = target.point.x - here.x, dy = target.point.y - here.y, d = target.distance || 1;
        if (fighter.model && fighter.model.arenaShots) {
          const goal = movementGoal(fighter, target.point, here);
          const targetX = fighter.snared > 0 ? here.x + (goal.x - here.x) * .2 : goal.x;
          const targetY = fighter.snared > 0 ? here.y + (goal.y - here.y) * .2 : goal.y;
          const previousShots = new Map(fighter.model.arenaShots().map(projectile => [
            projectile,
            { x: projectile.x, y: projectile.y }
          ]));
          fighter.model.setArenaTarget(targetX, targetY, target.point.x, target.point.y);
          fighter.model.update();
          applyModelEffects(fighter);
          const attackRange = fighter.kind === 'chomper' ? 58 : 430;
          if (--fighter.cd <= 0 && d < attackRange) {
            fighter.model.arenaAttack(target.point.x, target.point.y);
            if (fighter.kind === 'chomper' && d < 52) damage(target.fighter);
            if (fighter.kind === 'builder' && d < 65) damage(target.fighter);
            fighter.cd = fighter.kind === 'runner' ? 85 : fighter.kind === 'builder' ? 72 : fighter.kind === 'chomper' ? 40 : 62;
          }
          if (fighter.kind === 'runner' && fighter.model.st === 'roll' && d < 52 && fr % 8 === 0) damage(target.fighter);
          const projectiles = fighter.model.arenaShots();
          for (const projectile of projectiles) {
            const previous = previousShots.get(projectile);
            if (previous && blockedByWalls(fighter.team, previous.x, previous.y, projectile.x, projectile.y, 4)) {
              fighter.model.removeArenaShot(projectile);
              continue;
            }
            let hit = false;
            for (const other of fighters) {
              if (other.team === fighter.team || other.hp <= 0) continue;
              const p = pos(other);
              if (Math.hypot(p.x - projectile.x, p.y - projectile.y) < 12 + (other.radius || 0)) {
                damage(other); fighter.model.removeArenaShot(projectile); hit = true; break;
              }
            }
            if (hit) continue;
          }
          continue;
        }
        if (fighter.fig) {
          const w = fighter.fig.position(), wasPounding = !!w.pound;
          const goal = movementGoal(fighter, target.point, here);
          fighter.fig.setTarget(
            fighter.snared > 0 ? w.x + (goal.x - w.x) * .2 : goal.x,
            fighter.snared > 0 ? w.y + (goal.y - w.y) * .2 : goal.y
          );
          fighter.fig.update();
          if (fighter.poundTarget && wasPounding && !w.pound && w.hit > 6) {
            const p = pos(fighter.poundTarget);
            if (Math.hypot(p.x - w.x, p.y - w.y) < 125) damage(fighter.poundTarget);
            fighter.poundTarget = null;
          }
          if (--fighter.cd <= 0 && d < (fighter.kind === 'yellow' ? 330 : fighter.kind === 'red' ? 210 : 290)) {
            if (fighter.kind === 'red') {
              if (w.ground) { fighter.fig.special(target.point.x, target.point.y); fighter.poundTarget = target.fighter; }
            } else {
              fighter.fig.special(target.point.x, target.point.y);
              if (fighter.kind === 'yellow' && d < 230) damage(target.fighter);
            }
            fighter.cd = fighter.kind === 'red' ? 100 : fighter.kind === 'yellow' ? 85 : 72;
          }
          const projectiles = fighter.fig.combatShots();
          for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (blockedByWalls(
              fighter.team, projectile.px ?? projectile.x, projectile.py ?? projectile.y,
              projectile.x, projectile.y, projectile.type === 'wave' ? 8 : 4
            )) {
              projectiles.splice(i, 1);
              continue;
            }
            let hit = false;
            for (const other of fighters) {
              if (other.team === fighter.team || other.hp <= 0) continue;
              const p = pos(other);
              if (Math.hypot(p.x - projectile.x, p.y - projectile.y) < (projectile.type === 'wave' ? 22 : 14) + (other.radius || 0)) {
                damage(other); projectiles.splice(i, 1); hit = true; break;
              }
            }
            if (hit) continue;
          }
          continue;
        }
        if (fighter.kind === 'boss' && fighter.theme) {
          bossThink(fighter, target, here, dx, dy, d);
        } else if (fighter.kind === 'boss') {
          const angle = fr * .014;
          const marginX = Math.min(140, W * .4), marginY = Math.min(104, H * .35);
          const orbitX = Math.max(marginX, Math.min(W - marginX, W * .5 + Math.cos(angle) * Math.min(W * .26, 220)));
          const orbitY = Math.max(marginY, Math.min(H - marginY, H * .42 + Math.sin(angle * .83) * Math.min(H * .14, 90)));
          fighter.vx = (orbitX - fighter.x) * .045;
          fighter.vy = (orbitY - fighter.y) * .045;
          fighter.x += fighter.vx; fighter.y += fighter.vy;
          if (--fighter.cd <= 0 && d < 500) {
            fire(fighter, target.point, 4.5, 9);
            fighter.model.arenaAttack(target.point.x, target.point.y, target.fighter);
            fire(fighter, { x: target.point.x - 42, y: target.point.y + 24 }, 3.6, 7);
            fire(fighter, { x: target.point.x + 42, y: target.point.y - 24 }, 3.6, 7);
            fighter.cd = 55;
          }
        } else if (MON.has(fighter.kind)) {
          think(fighter, target, here, dx, dy, d);
        } else if ((fighter.kind === 'mite' || fighter.kind === 'runner') && fighter.dash > 0) {
          fighter.x += fighter.vx; fighter.y += fighter.vy;
          fighter.vx *= fighter.kind === 'runner' ? .9 : .94; fighter.vy *= fighter.kind === 'runner' ? .9 : .94;
          fighter.dash--;
          if (d < (fighter.kind === 'runner' ? 36 : 30)) { damage(target.fighter); fighter.dash = 0; }
        } else {
          const desired = fighter.kind === 'mite' ? 135 : fighter.kind === 'spider' ? 100 :
            fighter.kind === 'runner' ? 125 : fighter.kind === 'chomper' ? 30 : 175;
          const direction = d > desired ? 1 : d < desired * .68 ? -1 : 0;
          const acceleration = (fighter.kind === 'runner' ? .4 : fighter.kind === 'spider' ? .32 : .25) * (fighter.snared > 0 ? .2 : 1);
          fighter.vx += dx / d * direction * acceleration;
          fighter.vy += dy / d * direction * acceleration;
          fighter.vx *= fighter.kind === 'runner' ? .92 : .88; fighter.vy *= fighter.kind === 'runner' ? .92 : .88;
          const maxSpeed = fighter.kind === 'mite' ? 2.3 : fighter.kind === 'runner' ? 2.8 : fighter.kind === 'spider' ? 2.1 : 1.8, speed = Math.hypot(fighter.vx, fighter.vy);
          if (speed > maxSpeed) { fighter.vx *= maxSpeed / speed; fighter.vy *= maxSpeed / speed; }
          fighter.x += fighter.vx; fighter.y += fighter.vy;
          if ((fighter.kind === 'mite' || fighter.kind === 'runner') && --fighter.cd <= 0 && d < 240) {
            fighter.dash = fighter.kind === 'runner' ? 12 : 8;
            fighter.vx = dx / d * (fighter.kind === 'runner' ? 8 : 6);
            fighter.vy = dy / d * (fighter.kind === 'runner' ? 8 : 6);
            fighter.cd = fighter.kind === 'runner' ? 100 : 110;
          } else if ((fighter.kind === 'wisp' || fighter.kind === 'centipede') && --fighter.cd <= 0 &&
              d < (fighter.kind === 'centipede' ? Math.hypot(W, H) : 420)) {
            const speed = fighter.kind === 'centipede' ? 3.5 : 4;
            fire(fighter, target.point, speed, 6);
            if (fighter.model && fighter.model.arenaAttack) fighter.model.arenaAttack(target.point.x, target.point.y, target.fighter);
            fighter.cd = fighter.kind === 'centipede' ? 90 : 92;
          } else if ((fighter.kind === 'spider' || fighter.kind === 'chomper') &&
              d < (fighter.kind === 'spider' ? Math.hypot(W, H) : 48) && --fighter.cd <= 0) {
            if (fighter.model && fighter.model.arenaAttack) fighter.model.arenaAttack(target.point.x, target.point.y, target.fighter);
            damage(target.fighter); fighter.cd = 35;
          }
        }
        if (fighter.team === 'monsters' && usesPlatforms(fighter) &&
            fighter.x >= arenaFloor.l && fighter.x <= arenaFloor.r &&
            fighter.y >= arenaFloor.t && fighter.vy >= 0) {
          fighter.y = arenaFloor.t;
          fighter.vy = 0;
          fighter.ground = true;
        }
        const arachne = fighter.kind === 'boss' && !fighter.theme;
        const minX = arachne ? Math.min(140, W * .4) : fighter.theme ? 60 : 20;
        const maxX = W - minX;
        const minY = arachne ? Math.min(104, H * .35) : enemyTop;
        const maxY = arachne ? H - minY : enemyBottom;
        fighter.x = Math.max(minX, Math.min(maxX, fighter.x));
        fighter.y = Math.max(minY, Math.min(maxY, fighter.y));
        if (fighter.model) {
          fighter.model.setArenaTarget(fighter.x, fighter.y);
          fighter.model.update();
          applyModelEffects(fighter);
          if (fighter.kind === 'boss') {
            const p = fighter.model.arenaPosition();
            fighter.x = p.x; fighter.y = p.y;
          }
        }
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        if (!updateShot(shots[i])) shots.splice(i, 1);
      }
    },
    draw(now) {
      for (const shot of shots) {
        x.save(); x.shadowColor = shot.color; x.shadowBlur = 10;
        if (shot.trail) for (let i = 0; i < shot.trail.length; i++) { x.globalAlpha = (i + 1) / (shot.trail.length + 2) * .35; x.fillStyle = shot.color; x.beginPath(); x.arc(shot.trail[i].x, shot.trail[i].y, shot.radius * (i + 1) / (shot.trail.length + 1), 0, TAU); x.fill(); }
        x.globalAlpha = 1;
        if (shot.type === 'arrow') { x.translate(shot.x, shot.y); x.rotate(Math.atan2(shot.vy, shot.vx)); x.strokeStyle = '#e6edf0'; x.lineWidth = 2; x.beginPath(); line(-10, 0, 6, 0); x.stroke(); x.fillStyle = '#e6edf0'; x.beginPath(); x.moveTo(8, 0); x.lineTo(3, -3); x.lineTo(3, 3); x.closePath(); x.fill(); x.fillStyle = '#ff9f43'; x.fillRect(-11, -2, 4, 4); }
        else if (shot.type === 'mallet') { x.translate(shot.x, shot.y); x.rotate(fr * .3); x.fillStyle = '#7a4a1e'; x.fillRect(-9, -1.5, 18, 3); x.fillStyle = '#9aa4b0'; x.fillRect(4, -6, 8, 12); }
        else { x.fillStyle = shot.color; x.beginPath(); x.arc(shot.x, shot.y, shot.radius, 0, TAU); x.fill(); }
        x.restore();
      }
      for (const fighter of fighters) {
        if (fighter.active === false) continue;
        if (fighter.hp <= 0) continue;
        if (fighter.fig) {
          x.save(); if (fighter.inv > 0 && fr % 4 < 2) x.globalAlpha = .35;
          const w0 = fighter.fig.position(); x.save(); x.globalAlpha *= .25; x.fillStyle = '#000'; x.beginPath(); x.ellipse(w0.x, w0.y + 2, 14, 4, 0, 0, TAU); x.fill(); x.restore();
          fighter.fig.draw(); x.restore(); drawHealth(fighter); continue;
        }
        if (fighter.model) {
          x.save(); if (fighter.inv > 0 && fr % 4 < 2) x.globalAlpha = .35;
          fighter.model.draw(now); x.restore(); drawHealth(fighter); continue;
        }
        if (fighter.theme) { x.save(); x.translate(fighter.x, fighter.y); if (fighter.inv > 0 && fr % 4 < 2) x.globalAlpha = .55; drawBoss(fighter, now); x.restore(); drawHealth(fighter); continue; }
        if (MON.has(fighter.kind)) { x.save(); x.translate(fighter.x, fighter.y); if (fighter.inv > 0 && fr % 4 < 2) x.globalAlpha = .55; drawMon(fighter, now); x.restore(); drawHealth(fighter); continue; }
        x.save(); x.translate(fighter.x, fighter.y);
        if (fighter.kind === 'mite' && fighter.dash > 0) {
          x.globalAlpha = .35; x.fillStyle = fighter.color; x.fillRect(-28, -12, 18, 8); x.globalAlpha = 1;
        }
        if (fighter.kind === 'mite') {
          const bob = Math.sin(now / 75 + fighter.x) * 2, leg = Math.sin(now / 45 + fighter.x) * 3;
          x.translate(0, bob);
          x.strokeStyle = '#526522'; x.lineWidth = 2; x.lineCap = 'round';
          for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
            const sy = -7 + i * 5, swing = leg * (i % 2 ? -1 : 1);
            x.beginPath(); x.moveTo(side * 5, sy); x.lineTo(side * (11 + swing), sy + 3); x.lineTo(side * (14 + swing), sy + 7); x.stroke();
          }
          x.shadowColor = '#b3e34a'; x.shadowBlur = 8; x.fillStyle = '#526b25';
          x.beginPath(); x.ellipse(0, -9, 10, 11, 0, 0, TAU); x.fill(); x.shadowBlur = 0;
          x.fillStyle = '#91b936'; x.beginPath(); x.moveTo(-10, -11); x.lineTo(-6, -22); x.lineTo(0, -26); x.lineTo(7, -21); x.lineTo(11, -11); x.lineTo(5, -5); x.lineTo(-6, -5); x.closePath(); x.fill();
          x.strokeStyle = '#d7f579'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, -24); x.lineTo(-3, -14); x.lineTo(0, -10); x.lineTo(4, -19); x.stroke();
          x.fillStyle = '#26351a'; x.fillRect(-5, -17, 3, 4); x.fillRect(3, -17, 3, 4);
          x.fillStyle = '#faffc4'; x.fillRect(-5, -17, 1.5, 1.5); x.fillRect(3, -17, 1.5, 1.5);
          x.strokeStyle = '#d5ef76'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-4, -22); x.lineTo(-8, -28); x.moveTo(4, -22); x.lineTo(8, -28); x.stroke();
          x.fillStyle = '#e4f78b'; x.beginPath(); x.moveTo(-8, -28); x.lineTo(-11, -30); x.lineTo(-7, -31); x.fill(); x.beginPath(); x.moveTo(8, -28); x.lineTo(11, -30); x.lineTo(7, -31); x.fill();
          for (const side of [-1, 1]) {
            x.fillStyle = '#d5ef76'; x.beginPath(); x.moveTo(side * 7, -7); x.lineTo(side * 15, -12); x.lineTo(side * 11, -3); x.closePath(); x.fill();
          }
        } else if (fighter.kind === 'wisp') {
          const pulse = .8 + Math.sin(now / 100) * .2, drift = Math.sin(now / 70) * 3;
          x.save(); x.translate(0, drift); x.globalCompositeOperation = 'lighter';
          x.shadowColor = '#a779ff'; x.shadowBlur = 18 * pulse;
          const glow = x.createRadialGradient(0, -14, 2, 0, -14, 24);
          glow.addColorStop(0, '#fff'); glow.addColorStop(.24, '#dfc7ff'); glow.addColorStop(.65, '#a779ff'); glow.addColorStop(1, 'rgba(86,45,160,0)');
          x.fillStyle = glow; x.beginPath(); x.arc(0, -14, 24, 0, TAU); x.fill();
          x.fillStyle = '#b98cff'; x.beginPath(); x.moveTo(0, -29); x.bezierCurveTo(14, -21, 14, -8, 8, -2);
          x.quadraticCurveTo(4, 4, 1, -3); x.quadraticCurveTo(-3, 5, -7, -2); x.bezierCurveTo(-15, -11, -11, -23, 0, -29); x.fill();
          x.strokeStyle = 'rgba(236,220,255,.9)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(0, -14, 16, 20, Math.sin(now / 160) * .25, 0, TAU); x.stroke();
          x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 8;
          x.beginPath(); x.ellipse(-4, -16, 2.5, 4, -.15, 0, TAU); x.fill();
          x.beginPath(); x.ellipse(4, -16, 2.5, 4, .15, 0, TAU); x.fill();
          x.fillStyle = '#6040a8'; x.fillRect(-4, -10, 2, 3); x.fillRect(3, -10, 2, 3);
          x.globalAlpha = .8;
          for (let i = 0; i < 3; i++) {
            const a = now / 420 + i * TAU / 3, px = Math.cos(a) * 19, py = -14 + Math.sin(a) * 19;
            x.fillStyle = i === 1 ? '#fff' : '#d8bcff'; x.beginPath(); x.arc(px, py, i === 1 ? 2 : 1.5, 0, TAU); x.fill();
          }
          x.restore();
        }
        x.restore();
        drawHealth(fighter);
      }
      x.save(); x.textAlign = 'center'; x.font = 'bold 14px system-ui,sans-serif';
      x.fillStyle = '#fff'; x.shadowColor = phase === 'boss' ? boss.color : '#37c9ef'; x.shadowBlur = 8;
      const stage = phase === 'boss' ? 'BOSS' : phase === 'intermission' ? 'NEXT ROUND' : waveSets[(round - 1) % waveSets.length].name;
      x.fillText('ROUND ' + round + ' - ' + stage, W / 2, 22);
      x.restore();
      for (let i = floaters.length - 1; i >= 0; i--) {
        const fl = floaters[i]; fl.y -= fl.big ? .35 : .7; fl.l -= fl.big ? .012 : .022;
        if (fl.l <= 0) { floaters.splice(i, 1); continue; }
        x.save(); x.globalAlpha = Math.min(1, fl.l); x.textAlign = 'center'; x.font = fl.big ? 'bold 18px system-ui,sans-serif' : 'bold 13px system-ui,sans-serif';
        x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.7)'; x.strokeText(fl.t, fl.x, fl.y); x.fillStyle = fl.c; x.fillText(fl.t, fl.x, fl.y); x.restore();
      }
      const bt = fr - bannerFr;
      if (bt < 120) {
        x.save(); x.globalAlpha = Math.max(0, bt < 20 ? bt / 20 : bt > 90 ? (120 - bt) / 30 : 1); x.textAlign = 'center';
        x.font = 'bold 34px system-ui,sans-serif'; x.fillStyle = '#fff'; x.shadowColor = '#37c9ef'; x.shadowBlur = 18; x.fillText('ROUND ' + round, W / 2, H * .3);
        x.font = 'bold 18px system-ui,sans-serif'; x.shadowBlur = 10; x.fillStyle = '#9fe9ff'; x.fillText(waveSets[(round - 1) % waveSets.length].name.toUpperCase(), W / 2, H * .3 + 28);
        x.restore();
      }
      if (fr < powerUntil) {
        x.save(); x.textAlign = 'center'; x.font = 'bold 13px system-ui,sans-serif'; x.fillStyle = '#7fb2ff'; x.shadowColor = '#2a3cff'; x.shadowBlur = 10;
        x.fillText('POWER PELLET - catch the Phantoms!', W / 2, 42); x.restore();
      }
    }
  };
}

const KINDS = ['centipede', 'spider', 'ember', 'zip', 'chomp', 'gang', 'ship', 'tank', 'miner', 'arena'];
const make = () => {
  const k = species === 'random' ? KINDS[R() * KINDS.length | 0] : species;
  return k === 'arena' ? arena() : k === 'ship' ? starship() : k === 'tank' ? tank() : k === 'miner' ? miner() : k === 'spider' ? spider() : k === 'ember' ? ember() : k === 'zip' ? zip() : k === 'chomp' ? chomp() : SCOL[k] ? gang([k]) : k === 'gang' ? gang(['orange', 'red', 'green', 'yellow', 'blue']) : centipede();
};

// ---------- loop ----------
function size() {
  W = innerWidth; H = innerHeight; D = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * D; cv.height = H * D; cv.style.width = W + 'px'; cv.style.height = H + 'px'; x.setTransform(D, 0, 0, D, 0, 0); makeLedges();
}
const mv = e => { tx = e.clientX; ty = e.clientY; last = lastInputAt = performance.now(); };
const pd = e => { mv(e); ring(tx, ty, 90, C.c); crit && crit.click && crit.click(tx, ty); };
const mt = e => { const t = e.touches[0]; if (t) { tx = t.clientX; ty = t.clientY; last = lastInputAt = performance.now(); } };
const sc = () => {
  platT = 0;
  if (performance.now() > autoScrollUntil) last = lastInputAt = performance.now();
};

function start() { if (on) return; on = true; try { startInner(); console.log('[Crawlers] started'); } catch (e) { console.error('[Crawlers] failed to start', e); } }
function startInner() {
  host = document.createElement('div');
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  const sr = host.attachShadow({ mode: 'closed' });
  cv = document.createElement('canvas'); cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none';
  sr.append(cv); x = cv.getContext('2d'); document.documentElement.append(host); size();
  tx = W / 2; ty = H / 2; crit = make();
  lastInputAt = lastProgressAt = lastAutoScrollAt = performance.now();
  observedXp = xp;
  addEventListener('resize', size); addEventListener('scroll', sc, { passive: true, capture: true });
  addEventListener('pointermove', mv, { passive: true });
  addEventListener('pointerdown', pd, { passive: true, capture: true });
  addEventListener('touchstart', mt, { passive: true }); addEventListener('touchmove', mt, { passive: true });
  raf = requestAnimationFrame(f);
}
function stop() {
  if (!on) return; on = false; cancelAnimationFrame(raf); host && host.remove(); restoreAll();
  removeEventListener('resize', size); removeEventListener('scroll', sc, true); removeEventListener('pointermove', mv);
  removeEventListener('pointerdown', pd, true);
  removeEventListener('touchstart', mt); removeEventListener('touchmove', mt);
}

function f(now) {
  if (!on) return; raf = requestAnimationFrame(f);
  if (paused || document.hidden) return;
  fr++;
  if (fr % 300 === 0) spans = spans.filter(s => s.isConnected);
  if (crit.needsPlats && now - platT > 700) { buildPlats(); platT = now; }
  if (now - last > 3000) { tx = W / 2 + Math.sin(now / 1700) * W * .38; ty = H / 2 + Math.cos(now / 1300) * H * .36; }
  const ox = scrollX, oy = scrollY;
  boost *= .95; crit.update(now);
  if (xp !== observedXp) { observedXp = xp; lastProgressAt = now; }
  const pageHeight = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
  const maxScroll = Math.max(0, pageHeight - innerHeight);
  if (debris.length < 3 && now - lastInputAt > 5000 && now - lastProgressAt > 6500 &&
      now - lastAutoScrollAt > 4500 && scrollY < maxScroll - 2) {
    const distance = Math.min(Math.max(160, H * .55), maxScroll - scrollY);
    autoScrollUntil = now + 1400;
    autoScrollCueUntil = now + 1400;
    lastAutoScrollAt = now;
    window.scrollBy({ top: distance, behavior: 'smooth' });
    ring(W / 2, H - 34, 54, C.c);
    burst(W / 2, H - 34, 14, C.c, .08);
  }
  if (fr % 30 === 0 && infected.length) updateInfected(now);
  const pts = crit.pts(), hd = pts[0], sux = debris.length >= 5; let sucking = false, canEat = now - lastEatAt >= (crit.reel ? 1100 : 1200);
  if (fr % 300 == 0) hitVisual(hd.x, hd.y);
  x.clearRect(0, 0, W, H);
  threads = threads.filter(t => { const age = now - t.b; if (age > 6000) return false; x.globalAlpha = .45 * (1 - age / 6000); x.strokeStyle = t.c; x.lineWidth = .8; x.beginPath(); line(t.x1 - ox, t.y1 - oy, t.x2 - ox, t.y2 - oy); x.stroke(); return true; });
  traps = traps.filter(t => { t.l -= .018; if (t.l <= 0) return false; x.save(); x.globalAlpha = t.l; x.strokeStyle = C.w; x.lineWidth = 1; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line(t.x, t.y, t.x + Math.cos(a) * 130, t.y + Math.sin(a) * 130); } for (let r = 30; r <= 130; r += 25) { for (let i = 0; i < 8; i++) { const a = i * TAU / 8, b = a + TAU / 8; line(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, t.x + Math.cos(b) * r, t.y + Math.sin(b) * r); } } x.stroke(); x.restore(); return true; });
  webs = webs.filter(z => {
    if (!z.s.isConnected) return false; z.l++;
    const b = z.s.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, sx = z.p.x, sy = z.p.y;
    x.save(); x.strokeStyle = C.w; x.globalAlpha = .85; x.lineWidth = 1; x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo((sx + cx) / 2 + Math.sin(z.l * .6) * 10, (sy + cy) / 2 + Math.cos(z.l * .6) * 10, cx, cy);
    line(b.left, b.top, b.right, b.bottom); line(b.right, b.top, b.left, b.bottom); x.rect(b.left - 1, b.top - 1, b.width + 2, b.height + 2); x.stroke(); x.restore();
    if (z.l >= 90 && canEat) {
      if (!wipe(z.s, 'label', { pull: true, col: C.w, vx: 0, vy: 0 })) return true;
      lastEatAt = now; canEat = false;
      return false;
    }
    return true;
  });
  bridges = bridges.filter(br => {
    if (!br.a.isConnected || !br.b.isConnected) return false;
    br.l++; const A = br.a.getBoundingClientRect(), B = br.b.getBoundingClientRect(), ax = A.left + A.width / 2, ay = A.top + A.height / 2, bx = B.left + B.width / 2, by = B.top + B.height / 2;
    x.save(); x.strokeStyle = C.c; x.shadowColor = C.c; x.shadowBlur = 8;
    if (br.l < 16) { x.lineWidth = 1.6; for (const q of [[ax, ay], [bx, by]]) { x.beginPath(); x.moveTo(br.src.x, br.src.y); for (let i = 1; i < 6; i++) { const t = i / 6; x.lineTo(br.src.x + (q[0] - br.src.x) * t + (R() - .5) * 22, br.src.y + (q[1] - br.src.y) * t + (R() - .5) * 22); } x.lineTo(q[0], q[1]); x.stroke(); } }
    x.globalAlpha = .75; x.lineWidth = 1; x.beginPath(); line(ax, ay, bx, by); x.stroke(); x.fillStyle = C.c; x.fillRect(ax - 3, ay - 3, 6, 6); x.fillRect(bx - 3, by - 3, 6, 6);
    x.globalAlpha = 1; x.fillStyle = '#fff';
    for (const p of br.pulses) { p.p += p.d * .014; if (p.p >= 1 || p.p <= 0) { p.p = Math.max(0, Math.min(1, p.p)); p.d *= -1; swapPair(br); } x.beginPath(); x.arc(ax + (bx - ax) * p.p, ay + (by - ay) * p.p, 3, 0, TAU); x.fill(); }
    x.restore();
    if (br.l > 900) { delete br.a.dataset.b; delete br.b.dataset.b; return false; }
    return true;
  });
  temps = temps.filter(t => --t.life > 0);
  // NOTE: Platform visual debug rendering removed so platforms remain completely invisible!
  debris = debris.filter(d => {
    const age = now - d.b; if (age > (d.k === 'label' ? 4000 : 9000)) return false;
    let sx = d.px - ox, sy = d.py - oy;
    if (d.pull) { d.px += (hd.x + ox - d.px) * d.pull; d.py += (hd.y + oy - d.py) * d.pull; x.save(); x.globalAlpha = .5; x.strokeStyle = C.w; x.lineWidth = 1; x.beginPath(); line(sx, sy, hd.x, hd.y); x.stroke(); x.restore(); }
    else {
      const dx = hd.x - sx, dy = hd.y - sy, dd = Math.hypot(dx, dy) || 1;
      if (crit.vac && (dd < 260 || sux)) {
        const k = sux ? .3 : .2 + (260 - dd) / 260 * .6; d.vx += dx / dd * k; d.vy += dy / dd * k; sucking = true;
        const sp = Math.hypot(d.vx, d.vy); if (sp > 7) { d.vx *= 7 / sp; d.vy *= 7 / sp; }
        x.save(); x.globalAlpha = .18; x.strokeStyle = C.c; x.lineWidth = 1; x.beginPath(); line(sx, sy, hd.x, hd.y); x.stroke(); x.restore();
      } else if (crit.mag && dd < crit.mag) {
        const k = .5 + (crit.mag - dd) / crit.mag * 1.2; d.vx += dx / dd * k; d.vy += dy / dd * k;
        const sp = Math.hypot(d.vx, d.vy); if (sp > 10) { d.vx *= 10 / sp; d.vy *= 10 / sp; }
      }
    }
    const er = crit.eat != null ? crit.eat : 26;
    if (er && canEat && fr % 2 == 0) for (const p of pts) if ((p.x - sx) ** 2 + (p.y - sy) ** 2 < er * er) { lastEatAt = now; canEat = false; burst(sx, sy, 10, d.c); xp += 2; crit.got && crit.got(d); return false; }
    if (d.g) { d.vy += d.g; if (d.vy > 0) for (const p of plats) if (d.px - ox > p.l && d.px - ox < p.r && sy <= p.t + 2 && sy + d.vy >= p.t) { d.vy *= -.45; d.vx *= .7; break; } }
    if (d.g || Math.abs(d.vx) + Math.abs(d.vy) > .05) { d.px += d.vx; d.py += d.vy; d.vx *= d.g ? .99 : .93; if (!d.g) d.vy *= .93; d.rot += d.vr; d.vr *= .93; }
    sx = d.px - ox; sy = d.py - oy; if (sx < -150 || sx > W + 50 || sy < -40 || sy > H + 60) return true;
    x.save(); x.translate(sx, sy);
    const fade = d.k === 'label' ? (age > 2600 ? Math.max(0, 1 - (age - 2600) / 1400) : 1) : (age > 7000 ? Math.max(0, 1 - (age - 7000) / 2000) : 1); x.globalAlpha = fade;
    if (d.k === 'ring') { x.strokeStyle = C.y; x.lineWidth = 2.5; x.beginPath(); x.arc(0, 0, 6, 0, TAU); x.stroke(); }
    else if (d.k === 'coin') { x.fillStyle = C.y; x.beginPath(); x.ellipse(0, 0, 4 + Math.abs(Math.sin(now / 150)) * 2, 6, 0, 0, TAU); x.fill(); x.strokeStyle = '#a07800'; x.lineWidth = 1; x.stroke(); }
    else if (d.k === 'px') { x.fillStyle = d.c; x.fillRect(-3, -3, 6, 6); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 1; x.strokeRect(-3, -3, 6, 6); }
    else if (d.k === 'dot') { x.fillStyle = C.y; x.beginPath(); x.arc(0, 0, 3, 0, TAU); x.fill(); }
    else { x.rotate(d.rot); x.font = d.font; x.textBaseline = 'middle'; x.fillStyle = 'rgba(0,0,0,.75)'; x.fillRect(0, -d.h / 2, d.w, d.h); x.strokeStyle = d.c; x.lineWidth = 1; x.strokeRect(0, -d.h / 2, d.w, d.h); x.fillStyle = d.c; x.fillText(d.t, 4, 0); }
    x.restore(); return true;
  });
  rings = rings.filter(r => { r.r += (r.m - r.r) * .18; r.l -= .04; if (r.l <= 0) return false; x.globalAlpha = r.l; x.strokeStyle = r.c; x.lineWidth = 2; x.beginPath(); x.arc(r.x, r.y, r.r, 0, TAU); x.stroke(); return true; });
  if (sucking) { x.globalAlpha = .35; x.strokeStyle = C.c; x.lineWidth = 1.5; x.beginPath(); x.arc(hd.x, hd.y, 34 + Math.sin(now / 80) * 5, 0, TAU); x.stroke(); x.globalAlpha = 1; }
  x.globalCompositeOperation = 'lighter';
  parts = parts.filter(p => { p.vy += p.g || 0; p.x += p.vx; p.y += p.vy; p.vx *= .93; p.vy *= p.g ? 1 : .93; p.l -= .03; if (p.l <= 0) return false; x.globalAlpha = p.l; x.fillStyle = p.c; x.fillRect(p.x, p.y, 2.5, 2.5); return true; });
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  if (now - last < 4000) { x.globalAlpha = .55; x.strokeStyle = '#9aa7b4'; x.lineWidth = 1; x.beginPath(); x.arc(tx, ty, 24, 0, TAU); x.stroke(); x.globalAlpha = 1; }
  if (now < autoScrollCueUntil) {
    x.save(); x.globalAlpha = Math.min(1, (autoScrollCueUntil - now) / 350);
    x.fillStyle = C.c; x.shadowColor = C.c; x.shadowBlur = 12;
    x.font = 'bold 12px system-ui,sans-serif'; x.textAlign = 'center';
    x.fillText('DIVING FOR MORE', W / 2, H - 20);
    x.beginPath(); x.moveTo(W / 2 - 5, H - 38); x.lineTo(W / 2, H - 32); x.lineTo(W / 2 + 5, H - 38); x.strokeStyle = C.c; x.lineWidth = 2; x.stroke();
    x.restore();
  }
  if (crit.tiered) { const T = tierOf(xp); x.save(); x.translate(hd.x, hd.y); x.scale(T.s, T.s); x.translate(-hd.x, -hd.y); crit.draw(now); x.restore(); x.globalAlpha = .85; x.fillStyle = T.c; x.font = '11px system-ui,sans-serif'; x.fillText(T.n, hd.x + 18, hd.y - 20); x.globalAlpha = 1; }
  else crit.draw(now);
}

const store = (api.storage && (api.storage.sync || api.storage.local)) || null;
if (store) {
  try { store.get({ on: true, paused: false, reducedEffects: false, species: 'random', power: 'random' }).then(v => { species = v.species; power = v.power || 'random'; paused = v.paused === true; reducedEffects = v.reducedEffects === true; if (v.on) start(); }).catch(e => { console.error('[Crawlers] settings could not be loaded', e); start(); }); } catch (e) { console.error('[Crawlers] settings could not be loaded', e); start(); }
  try {
    api.storage.onChanged.addListener(c => {
      if (c.species) { species = c.species.newValue; if (on) { crit = make(); plats = []; platT = 0; } }
      if (c.power) power = c.power.newValue || 'random';
      if (c.paused) paused = c.paused.newValue === true;
      if (c.reducedEffects) reducedEffects = c.reducedEffects.newValue === true;
      if (c.reset) restoreAll();
      if (c.on) c.on.newValue ? start() : stop();
    });
  } catch (e) { console.error('[Crawlers] settings listener could not be registered', e); }
} else start();
})();