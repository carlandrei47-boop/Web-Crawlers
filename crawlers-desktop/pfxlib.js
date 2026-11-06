/* PixelFX (MIT) bundle: Copyright (c) 2026 Patch and Hugo Duprez. See NOTICE in the pixelfx repo. */
globalThis.PFXLIB = (() => {
const __defs = {
"fx/critters/slime.js": function(__r, __exports){
const { fit, clamp, wrap, smooth, seg, ease, lerp, rng, cycle, sparkle, TAU } = __r("core/index.js");
const { Grid, shift, curve, spring, toss, lnoise } = __r("fx/critters/_lib.js");
const meta = {
name: "Slime",
desc: "A glossy slime hops in place: it squashes to wind up, stretches into the jump, rounds out in the air, splats down flinging droplets that creep back, then wobbles and blinks.",
tags: ["critter", "slime", "monster", "hop", "goo", "loop"],
size: [112, 88],
origin: [56, 72],
duration: 1.8,
loop: true,
fps: 30,
bg: "ground",
options: { palette: ["#061412", "#0b2f2b", "#12594a", "#1f8f4f", "#47c752", "#a6f06a", "#f0ffd2"], hop: 24, seed: 1 },
};
const GRID = new Grid(-30, -64, 60, 66);
const D = meta.duration, T_SQ = 0.5, T_UP = 0.84, T_LIFT = 0.9, T_LAND = 1.44, SNAP = 0.965;
const W0 = 30, H0 = 22, VC = 0.4, G = 640, NDROP = 12;
function pose(t, hop) {
const age = wrap(t - T_LAND, D);
let s, by = 0, lean = 0, round = 0.1, q = -1;
if (t >= T_LIFT && t < T_LAND) {
q = (t - T_LIFT) / (T_LAND - T_LIFT);
by = -hop * 4 * q * (1 - q);
s = curve(q, [[0, 0.36], [0.4, 0.02], [0.55, -0.05], [0.85, 0.08], [1, 0.16]]);
round = 0.1 + 0.8 * smooth(0, 0.16, q) * (1 - smooth(0.86, 1, q));
} else if (t >= T_UP && t < T_LIFT) s = lerp(-0.3, 0.36, ease.outCubic(seg(t, T_UP, T_LIFT)));
else if (t >= T_SQ && t < T_UP) {
const u = seg(t, T_SQ, T_UP);
s = -0.3 * ease.inOutSine(u) + 0.018 * Math.sin(t * TAU * 16) * smooth(0.55, 1, u);
} else {
s = age < 0.06 ? -0.46 : -0.46 * spring(age - 0.06, 2.1, 4.6);
lean = 0.07 * Math.exp(-age * 4) * Math.sin(age * TAU * 1.9);
if (t < T_SQ) s += 0.02 * Math.sin((t / T_SQ) * TAU);
}
return { s, by, lean, round, q, age, W: W0 / Math.sqrt(1 + s), H: H0 * (1 + s) };
}
function halfW(v, P) {
if (v < 0 || v > 1) return -1;
const { W, H, round } = P;
if (v >= VC) {
const q = (v - VC) / (1 - VC);
return (W / 2) * Math.sqrt(1 - q * q);
}
const q = (VC - v) / VC, hb = v * H, rc = 3;
let hw = (W / 2) * Math.sqrt(Math.max(0, 1 - round * q * q));
if (hb < rc) hw -= rc - Math.sqrt(rc * rc - (rc - hb) ** 2);
return hw;
}
const inside = (P, x, y) => {
const v = (P.by - 1 - y) / P.H, hw = halfW(v, P);
return hw >= 0 && Math.abs(x - P.lean * v * P.H) <= hw;
};
function body(g, C, P) {
const yb = P.by - 1, half = P.W / 2 + 3;
const cx = P.lean * 0.45 * P.H, cy = yb - P.H * 0.5, lx = cx - P.W * 0.24, ly = cy - P.H * 0.36;
const lit = (x, y, k) => inside(P, lx + (x - lx) / k, ly + (y - ly) / k);
g.clear();
g.shade(-half, yb - P.H - 1, half, yb, (x, y, o) => {
if (!inside(P, x, y)) return 0;
o.t = 1;
o.a = 0.92;
let i = lit(x, y, 0.42) ? 5 : lit(x, y, 0.7) ? 4 : 3;
const v = (yb - y) / P.H;
if (v < 0.3 && inside(P, x, y + 1.4)) i = !inside(P, x, y + 2.4) ? 5 : v < 0.2 ? 4 : i;
if (!inside(P, x + 2, y + 2.4)) (i = 2), (o.a = 1);
const ang = Math.atan2(y - cy, (x - cx) * (P.H / P.W));
if (!inside(P, x - 1.6, y - 1.6) && inside(P, x - 0.7, y - 0.7) && ang > -2.75 && ang < -1.55) (i = ang > -2.45 && ang < -1.8 ? 6 : 5), (o.a = 1);
if (i === 2 && inside(P, x + 1, y + 1.2) && !inside(P, x + 2, y + 2.4) && ang > 0.3 && ang < 1.5) i = 4;
return C[i];
});
const hx = Math.round(cx - P.W * 0.27), hy = Math.round(cy - P.H * 0.14);
if (inside(P, hx - 1, hy) && inside(P, hx + 1, hy + 1)) g.set(hx, hy, C[6]), g.set(hx, hy + 1, C[5]);
}
function face(g, C, P, t) {
const yb = P.by - 1, ev = 0.47, ey = Math.round(yb - P.H * ev), ex = Math.max(3, Math.round(P.W * 0.16)), xc = Math.round(P.lean * ev * P.H);
const air = P.q >= 0, shut = P.age < 0.16 && !air, blink = t > 0.22 && t < 0.29;
const wind = t >= T_SQ && t < T_LIFT ? seg(t, T_SQ, T_UP) : 0, look = air ? (P.q < 0.45 ? -1 : P.q > 0.7 ? 1 : 0) : 0;
const eh = clamp(Math.round(4 * (1 + P.s * 0.8) - wind * 2 + (air && P.q < 0.6 ? 1 : 0)), 1, 5);
for (const side of [-1, 1]) {
const x = xc + side * ex - (side > 0 ? 1 : 0);
if (shut) {
const a = side < 0 ? 0 : 1, b = 1 - a;
g.set(x + a, ey - 1, C[0]); g.set(x + b, ey, C[0]); g.set(x + a, ey + 1, C[0]);
continue;
}
if (blink) {
g.set(x, ey + 1, C[0]); g.set(x + 1, ey + 1, C[0]);
continue;
}
const top = ey + 2 - eh + look;
for (let k = 0; k < eh; k++) g.set(x, top + k, C[0]), g.set(x + 1, top + k, C[0]);
g.set(x + (look > 0 ? 1 : 0), top + (look > 0 ? 1 : 0), C[6]);
if (eh >= 4) g.set(x + 1, top + eh - 1, C[2]);
}
const my = Math.round(yb - P.H * 0.31);
if (air && P.q < 0.75) g.set(xc, my, C[0]), g.set(xc - 1, my, C[0]), g.set(xc, my + 1, C[1]), g.set(xc - 1, my + 1, C[1]);
else if (!shut) g.set(xc, my, C[1]), g.set(xc - 1, my, C[1]);
}
const POP = 0.4;
function bubbleIn(g, C, P, t) {
if (t > POP) return;
const v = lerp(0.18, 0.86, ease.inQuad(t / POP)), hw = halfW(v, P), x = P.lean * v * P.H - hw * lerp(0.35, 0.05, t / POP), y = P.by - 1 - v * P.H;
g.set(x, y, C[6]); g.set(x + 1, y, C[5]); g.set(x, y + 1, C[5]); g.set(x + 1, y + 1, C[4]);
}
function droplet(i, o, age) {
const r = rng(o.seed, i, 7), a = -Math.PI / 2 + r.range(-1.2, 1.2), sp = r.range(60, 118), size = r.chance(0.35) ? 1 : r.chance(0.7) ? 2 : 3;
const fa = a + Math.PI / 2, x0 = Math.sin(fa) * 21, y0 = -1 - Math.cos(fa) * 12.5;
const f = toss(x0, y0, Math.cos(a) * sp * 0.75, Math.sin(a) * sp, age, G, -1);
f.size = size;
if (f.landed) {
const home = Math.sign(f.lx || 1) * (W0 / 2 - 2), dur = Math.min(0.55, 0.22 + Math.abs(f.lx - home) / 60), u = seg(age - f.at - 0.14, 0, dur);
f.x = lerp(f.lx, home, ease.inOutSine(u));
f.k = 1 - u;
f.gone = u >= 1;
f.splat = clamp(1 - (age - f.at) / 0.14);
}
return f;
}
function puddleR(t, P) {
if (P.q >= 0) return (W0 / Math.sqrt(1.36) / 2 + 3) * (1 - 0.22 * P.q);
return P.W / 2 + 3 + 9 * Math.exp(-P.age * 5) * (1 - Math.exp(-P.age * 40)) * (t >= T_LAND || t < T_SQ ? 1 : 0);
}
function draw(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t, o.hop), yb = P.by - 1, age = P.age;
const g = GRID;
body(g, C, P);
face(g, C, P, t);
bubbleIn(g, C, P, t);
g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 && y < yb - P.H * 0.5 ? C[1] : C[0]));
g.draw(p);
if (t >= POP && t < POP + 0.16) {
const k = (t - POP) / 0.16, x = P.lean * P.H - halfW(0.86, P) * 0.05, y = yb - P.H - 0.5;
for (let a = 0; a < TAU; a += 0.6) p.dot(x + Math.cos(a) * (1 + k * 3), y + Math.sin(a) * (1 + k * 3) * 0.7, C[6], 1.2 - k);
for (const s of [-1, 1]) p.dot(x + s * (1 + k * 4), y - 1 - k * 6 + k * k * 4, C[5], 1.3 - k);
p.glow(x, y, 6, C[5], 0.4 * (1 - k));
}
for (let i = 0; i < NDROP; i++) {
const f = droplet(i, o, age);
if (f.landed || inside(P, f.x, f.y)) continue;
const sv = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / sv, uy = f.vy / sv, L = Math.min(2.5, sv / 50);
p.line(f.x - ux * L, f.y - uy * L, f.x, f.y, C[3]);
if (f.size >= 2) p.px(f.x - 1, f.y, C[4]), p.px(f.x - 1, f.y + 1, C[3]), p.px(f.x, f.y + 1, C[2]);
if (f.size >= 3) p.px(f.x + 1, f.y, C[3]), p.px(f.x - 1, f.y - 1, C[4]), p.px(f.x, f.y - 1, C[5]);
p.px(f.x, f.y, f.size >= 2 ? C[6] : C[5]);
p.glow(f.x, f.y, 5 + f.size, C[4], 0.32);
}
cycle(t, D, 7, o.seed * 13 + 1, (r) => r.range(1.2, 1.8), (ag, L, r, i) => {
const k = ag / L, x = r.range(-24, 24) + Math.sin(ag * 2.1 + i * 1.7) * 3, y = -2 - r.range(9, 17) * ag - 5 * ag * ag;
const a = Math.min(1, k * 4) * Math.min(1, (1 - k) * 2.5), tw = 0.6 + 0.4 * Math.sin(ag * 7 + i * 2.3), big = r.chance(0.35);
p.dot(x, y, tw > 0.8 ? C[6] : C[5], a);
if (big) p.dot(x + 1, y, C[5], a), p.dot(x, y + 1, C[4], a), p.dot(x + 1, y + 1, C[4], a * 0.6);
p.glow(x, y, big ? 9 : 6, C[5], (big ? 0.45 : 0.32) * a * tw);
});
for (const [t0, dx] of DRIPS) {
const a2 = wrap(t - t0, D);
if (a2 > 0.6) continue;
const P0 = pose(t0, o.hop), f = toss(dx, P0.by - 0.5, 0, 12, a2, G, -1);
if (!f.landed) p.px(dx, f.y, C[5]), p.px(dx, f.y - 1, C[4]), p.glow(dx, f.y, 4, C[4], 0.3);
else if (a2 - f.at < 0.14) {
const k = (a2 - f.at) / 0.14;
for (const s2 of [-1, 1]) p.dot(dx + s2 * (1 + k * 3), -2 - k * 3 + k * k * 3, C[5], 1.2 - k);
}
}
if (P.q > 0.4 && P.q < 0.64) {
const k = Math.sin(Math.PI * seg(P.q, 0.4, 0.64));
sparkle(p, P.lean * 0.8 * P.H - P.W * 0.21, yb - P.H * 0.8, 1 + 2.5 * k, C[6], C[5], 0.5 * k);
}
const cx = P.lean * P.H * 0.4, cy = yb - P.H * 0.45, near = clamp(1 + P.by / (o.hop * 1.1));
const R = puddleR(t, P), br = 0.9 + 0.1 * Math.sin((t / D) * TAU * 2);
p.glow(cx * 0.5, -14, 64, C[3], 0.3 * br);
p.glow(cx, cy, 30 + P.W * 0.3, C[4], 0.2);
p.glow(cx, cy + 3, 14, C[5], 0.16);
p.glow(0, -2, R * 1.3 + 6, C[4], 0.12 + 0.08 * near);
if (t >= T_LAND || t < T_SQ) p.glow(0, -3, 40, C[5], 0.42 * Math.exp(-age * 9));
}
const DRIPS = [[1.02, -4], [1.18, 3]];
function drawBack(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t, o.hop), age = P.age;
const R = puddleR(t, P), hp = Math.min(2.4, 0.9 + R * 0.06);
for (let x = Math.floor(-R); x <= Math.ceil(R); x++) {
const d = Math.abs(x + 0.5) / R;
if (d > 1) continue;
const top = -1 - Math.round(Math.sqrt(1 - d * d) * hp);
for (let y = top; y <= 0; y++) {
let c = y === top ? C[5] : y === 0 ? C[2] : C[4];
if (d > 0.88) c = y === top ? C[4] : C[3];
if (y === top && d < 0.88) {
const n = lnoise(t, D, 7, x * 0.18, 3) + lnoise(t, D, 4, x * 0.07, 4) * 0.6;
if (n > 0.55) c = C[6];
} else if (y === top + 1 && d < 0.8 && lnoise(t, D, 3, x * 0.12, 5) > 0.3) c = C[5];
p.px(x, y, c);
}
if (d > 0.96) p.px(x, top - 1, C[1]);
}
cycle(t, D, 4, o.seed * 17 + 3, (r) => r.range(0.45, 0.75), (ag, L, r) => {
const x = r.range(-0.85, 0.85) * R, k = ag / L, rb = r.range(1.4, 2.6) * (0.3 + 0.7 * ease.outCubic(Math.min(1, k * 1.25)));
if (Math.abs(x) < P.W / 2 + 1 && P.q < 0) return;
const sy = -1 - Math.round(Math.sqrt(Math.max(0, 1 - (x / R) ** 2)) * hp);
if (k < 0.85) {
for (let y = Math.floor(sy - rb); y <= sy; y++)
for (let xx = Math.floor(x - rb - 1); xx <= Math.ceil(x + rb + 1); xx++) {
const dx = xx + 0.5 - x, dy = y + 0.5 - sy, dd = Math.hypot(dx, dy);
if (dd > rb + 0.5) continue;
if (dd > rb - 0.7) p.px(xx, y, dx < 0 && dy < -rb * 0.3 ? C[6] : C[4]);
else p.blend(xx, y, C[5], 0.3);
}
p.glow(x, sy - rb * 0.5, rb * 2 + 3, C[5], 0.2);
} else {
const q = (k - 0.85) / 0.15;
for (const [dx, dy] of [[1, 0], [-1, 0], [0.6, -0.7], [-0.6, -0.7], [0, -1]]) p.dot(x + dx * (2 + 3 * q), sy + dy * (2 + 3 * q), C[6], 1.2 - q);
}
});
for (let i = 0; i < NDROP; i++) {
const f = droplet(i, o, age);
if (!f.landed || f.gone) continue;
const x = Math.round(f.x), w = f.size + (f.splat > 0 ? 1 : 0);
for (let j = 0; j < w; j++) p.px(x - (w >> 1) + j, -1, j === 0 ? C[5] : C[4]);
if (f.size >= 2 && f.splat <= 0) p.px(x, -2, C[5]), p.px(x - 1, -2, C[4]);
p.px(x, 0, C[3]);
const dir = Math.sign(f.lx - f.x);
for (let j = 1; j < Math.min(8, Math.abs(f.lx - f.x)); j++) p.dot(x + dir * j, 0, C[2], 0.7 - j * 0.08);
p.glow(x, -1, 5, C[4], 0.25 * f.k + 0.1);
}
if (t >= T_LIFT && t < SNAP) {
const bot = P.by - 1, u = (t - T_LIFT) / (SNAP - T_LIFT);
for (let y = Math.floor(bot); y < 0; y++) {
const m = Math.sin(((y - bot) / -bot) * Math.PI);
p.px(-1, y, C[4]);
if (m * u < 0.45) p.px(0, y, C[3]);
}
} else if (t >= SNAP && t < SNAP + 0.3) {
const a2 = t - SNAP, ys = pose(SNAP, o.hop).by - 1, f = toss(-1, ys * 0.45, 0, 0, a2, G * 1.3, -2);
if (!f.landed) p.px(-1, f.y, C[5]), p.px(-1, f.y - 1, C[3]);
const nub = 3 * (1 - a2 / 0.12);
for (let j = 0; j < nub; j++) p.px(-1, P.by + j, j === 0 ? C[3] : C[4]);
}
}
__exports.meta = meta; __exports.draw = draw; __exports.drawBack = drawBack;
},
"core/index.js": function(__r, __exports){
Object.assign(__exports, __r("core/math.js"));
Object.assign(__exports, __r("core/color.js"));
Object.assign(__exports, __r("core/particles.js"));
Object.assign(__exports, __r("core/shapes.js"));
{ const __m = __r("core/sim.js"); __exports.Particles = __m.Particles; __exports.Bits = __m.Bits; __exports.Lights = __m.Lights; __exports.Blazes = __m.Blazes; __exports.P = __m.P; __exports.PF = __m.PF; __exports.B = __m.B; __exports.GRAVITY = __m.GRAVITY; __exports.FIRE_RAMP = __m.FIRE_RAMP; __exports.SMOKE_RAMP = __m.SMOKE_RAMP; __exports.sparkle = __m.sparkle; __exports.flare = __m.flare; __exports.band = __m.band; __exports.crystal = __m.crystal; }
{ const __m = __r("core/painter.js"); __exports.Painter = __m.Painter; }
{ const __m = __r("core/font.js"); __exports.FONTS = __m.FONTS; __exports.textWidth = __m.textWidth; }
{ const __m = __r("core/fx.js"); __exports.createFrame = __m.createFrame; __exports.clearFrame = __m.clearFrame; __exports.createFx = __m.createFx; __exports.composite = __m.composite; __exports.painterFor = __m.painterFor; __exports.resolveOptions = __m.resolveOptions; }
},
"core/math.js": function(__r, __exports){
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, x) => (b === a ? 0 : (x - a) / (b - a));
const remap = (x, a0, a1, b0, b1) => lerp(b0, b1, invLerp(a0, a1, x));
const fract = (x) => x - Math.floor(x);
const wrap = (x, m) => ((x % m) + m) % m;
const seg = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
const smooth = (e0, e1, x) => {
const t = seg(x, e0, e1);
return t * t * (3 - 2 * t);
};
const bump = (t, t0, t1) => (t <= t0 || t >= t1 ? 0 : Math.sin(Math.PI * seg(t, t0, t1)));
const pingpong = (x) => 1 - Math.abs(wrap(x, 2) - 1);
const dist = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);
const angleTo = (x0, y0, x1, y1) => Math.atan2(y1 - y0, x1 - x0);
const ease = {
linear: (t) => t,
inQuad: (t) => t * t,
outQuad: (t) => 1 - (1 - t) * (1 - t),
inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
inCubic: (t) => t * t * t,
outCubic: (t) => 1 - Math.pow(1 - t, 3),
inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
inQuart: (t) => t * t * t * t,
outQuart: (t) => 1 - Math.pow(1 - t, 4),
inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
outSine: (t) => Math.sin((t * Math.PI) / 2),
inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
inBack: (t, s = 1.70158) => (t <= 0 ? 0 : t >= 1 ? 1 : (s + 1) * t * t * t - s * t * t),
outBack: (t, s = 1.70158) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2)),
outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
outBounce: (t) => {
const n = 7.5625, d = 2.75;
if (t < 1 / d) return n * t * t;
if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
return n * (t -= 2.625 / d) * t + 0.984375;
},
};
function hash(...ns) {
let h = 0x9e3779b9;
for (const n of ns) {
h = Math.imul(h ^ (n | 0), 0x85ebca6b);
h ^= h >>> 13;
h = Math.imul(h, 0xc2b2ae35);
h ^= h >>> 16;
}
return h >>> 0;
}
const rand = (...ns) => hash(...ns) / 4294967296;
class Rng {
constructor(seed = 1) {
this.s = seed >>> 0 || 1;
}
next() {
let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
range(a, b) {
return a + (b - a) * this.next();
}
int(a, b) {
return Math.floor(this.range(a, b + 1));
}
chance(p) {
return this.next() < p;
}
sign() {
return this.next() < 0.5 ? -1 : 1;
}
pick(list) {
return list[Math.floor(this.next() * list.length)];
}
gauss() {
return (this.next() + this.next() + this.next() + this.next() - 2) * 1.732;
}
}
const rng = (...ns) => new Rng(hash(...ns));
function noise(x, seed = 0) {
const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
return lerp(rand(i, seed), rand(i + 1, seed), u) * 2 - 1;
}
function noise2(x, y, seed = 0) {
const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
const a = rand(ix, iy, seed), b = rand(ix + 1, iy, seed), c = rand(ix, iy + 1, seed), d = rand(ix + 1, iy + 1, seed);
return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}
function fbm(x, y, seed = 0, octaves = 3) {
let s = 0, a = 0.5, n = 0;
for (let o = 0; o < octaves; o++) {
s += noise2(x, y, seed + o * 101) * a;
n += a;
x *= 2.03;
y *= 2.03;
a *= 0.5;
}
return s / n;
}
function tileNoise(x, y, px = 0, py = 0, seed = 0) {
const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
const x0 = px ? wrap(ix, px) : ix, x1 = px ? wrap(ix + 1, px) : ix + 1;
const y0 = py ? wrap(iy, py) : iy, y1 = py ? wrap(iy + 1, py) : iy + 1;
const a = rand(x0, y0, seed), b = rand(x1, y0, seed), c = rand(x0, y1, seed), d = rand(x1, y1, seed);
return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}
function tileFbm(x, y, px = 0, py = 0, seed = 0, octaves = 3) {
let s = 0, a = 0.5, n = 0, k = 1;
for (let o = 0; o < octaves; o++) {
s += tileNoise(x * k, y * k, px * k, py * k, seed + o * 101) * a;
n += a;
a *= 0.5;
k *= 2;
}
return s / n;
}
function loopNoise(phase, radius = 1, seed = 0) {
const a = phase * TAU;
return noise2(Math.cos(a) * radius + 50, Math.sin(a) * radius + 50, seed);
}
__exports.TAU = TAU; __exports.clamp = clamp; __exports.lerp = lerp; __exports.invLerp = invLerp; __exports.remap = remap; __exports.fract = fract; __exports.wrap = wrap; __exports.seg = seg; __exports.smooth = smooth; __exports.bump = bump; __exports.pingpong = pingpong; __exports.dist = dist; __exports.angleTo = angleTo; __exports.ease = ease; __exports.hash = hash; __exports.rand = rand; __exports.Rng = Rng; __exports.rng = rng; __exports.noise = noise; __exports.noise2 = noise2; __exports.fbm = fbm; __exports.tileNoise = tileNoise; __exports.tileFbm = tileFbm; __exports.loopNoise = loopNoise;
},
"core/color.js": function(__r, __exports){
const { clamp } = __r("core/math.js");
const rgb = (r, g, b) => (255 << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);
const red = (c) => c & 255;
const green = (c) => (c >>> 8) & 255;
const blue = (c) => (c >>> 16) & 255;
function hex(h) {
if (typeof h === "number") return h;
let s = h.replace("#", "");
if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
const v = parseInt(s.slice(0, 6), 16);
return rgb((v >> 16) & 255, (v >> 8) & 255, v & 255);
}
const toHex = (c) => "#" + [red(c), green(c), blue(c)].map((v) => v.toString(16).padStart(2, "0")).join("");
function mix(a, b, t) {
t = clamp(t);
return rgb(red(a) + (red(b) - red(a)) * t, green(a) + (green(b) - green(a)) * t, blue(a) + (blue(b) - blue(a)) * t);
}
const scale = (c, k) => rgb(Math.min(255, red(c) * k), Math.min(255, green(c) * k), Math.min(255, blue(c) * k));
const luma = (c) => (0.299 * red(c) + 0.587 * green(c) + 0.114 * blue(c)) / 255;
const ramp = (list) => list.map(hex);
function fit(r, n) {
r = r.map(hex);
if (r.length === n) return r;
return Array.from({ length: n }, (_, i) => r[Math.round((i * (r.length - 1)) / Math.max(1, n - 1))]);
}
const at = (r, t) => r[clamp(Math.floor(t * r.length), 0, r.length - 1)];
function blend(r, t) {
const x = clamp(t) * (r.length - 1), i = Math.min(r.length - 2, Math.floor(x));
return mix(r[i], r[i + 1], x - i);
}
const PAL = {
fire: ["#1f0b10", "#4a1118", "#8c1d1c", "#cc3a1a", "#f2701f", "#ffae35", "#ffe27a", "#fff8d6"],
ember: ["#1a0a0e", "#3d1012", "#701a14", "#a8301a", "#e0561e", "#ff8a2a", "#ffc46a"],
lava: ["#14060a", "#380a10", "#6e1210", "#ac2410", "#e8501a", "#ff8c2a", "#ffd25a"],
smoke: ["#0e0c12", "#1d1a22", "#2e2a35", "#433e4b", "#5c5664", "#7b7484", "#a39cab"],
dust: ["#1c1610", "#33281c", "#4f3f2c", "#6e5a40", "#927a58", "#b89f78", "#dcc8a2"],
ice: ["#0c1430", "#162c5c", "#1f4f94", "#2f7fcc", "#58b4ec", "#9bdcff", "#d8f4ff", "#ffffff"],
water: ["#081830", "#0e2e5a", "#14508c", "#1c76bc", "#36a2e0", "#78ccf4", "#c4ecff", "#ffffff"],
electric: ["#0a0f2e", "#172a78", "#2550d0", "#3f8cff", "#7cc8ff", "#c8f0ff", "#ffffff"],
volt: ["#24160a", "#5e3a0c", "#a8680f", "#e8a218", "#ffd23c", "#fff08a", "#ffffff"],
poison: ["#0d1a0c", "#173a14", "#265e18", "#3f8a1e", "#6cb82a", "#a8e04a", "#e0ff8a"],
holy: ["#2a1c08", "#5a3e10", "#9a6c18", "#d8a428", "#ffd84a", "#fff09a", "#fffbe6", "#ffffff"],
heal: ["#08201a", "#0f3f2c", "#17663e", "#24924e", "#3ec466", "#7ee88a", "#c8ffc4", "#ffffff"],
arcane: ["#140a26", "#2b1252", "#481c88", "#6b2cc0", "#9a48ec", "#c684ff", "#ecc8ff", "#ffffff"],
shadow: ["#050308", "#0f0a18", "#1c1230", "#2c1a4a", "#432468", "#5e3290", "#8048b8", "#a970e0"],
blood: ["#14040a", "#3a0a14", "#6a101c", "#a01824", "#d42a30", "#ff5a50", "#ff9a8a"],
earth: ["#140e0a", "#2a1e14", "#47321e", "#69492a", "#8e6638", "#b88a52", "#dcb47c"],
stone: ["#0e0e12", "#1c1c24", "#2c2c38", "#42424f", "#5c5c6b", "#7d7d8c", "#a4a4b2", "#d0d0da"],
gold: ["#1e1206", "#4a2c08", "#86520c", "#c48412", "#f0b424", "#ffe066", "#fff6c4", "#ffffff"],
leaf: ["#0c1a0e", "#163418", "#225224", "#357530", "#4f9a3a", "#7cc048", "#b4e070", "#e4ffb0"],
wood: ["#160c06", "#2e1a0c", "#4a2c14", "#6a421e", "#8e5c2c", "#b47c40", "#d8a464"],
metal: ["#0c0e14", "#1c2230", "#2e3648", "#4a5468", "#6e7a90", "#9aa6ba", "#d0d8e6", "#ffffff"],
bone: ["#1a1814", "#3a352c", "#5e5648", "#8a806c", "#b8ad96", "#e4dcc8", "#fffaf0"],
neon: ["#1a0516", "#3d0a33", "#701560", "#b0228f", "#f53cd1", "#ff86e6", "#ffd2f6", "#ffffff"],
cyber: ["#041418", "#08303a", "#0c5260", "#108088", "#18b4b0", "#4ce8d8", "#b4fff0", "#ffffff"],
matrix: ["#020a04", "#05200c", "#0a3c16", "#106624", "#1a9a34", "#3cd650", "#a4ffa8", "#e8ffe8"],
candy: ["#ff4a5a", "#ff9a2a", "#ffe03c", "#5ad84a", "#3cc8ff", "#7a6cff", "#f53cd1"],
night: ["#07060d", "#0c0a18", "#131026", "#1b1734", "#241f44", "#2f2956"],
};
const RAMP = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, ramp(v)]));
const WHITE = hex("#ffffff");
const BLACK = hex("#000000");
const INK = hex("#0b0a10");
const PATCH = hex("#f53cd1");
__exports.rgb = rgb; __exports.red = red; __exports.green = green; __exports.blue = blue; __exports.hex = hex; __exports.toHex = toHex; __exports.mix = mix; __exports.scale = scale; __exports.luma = luma; __exports.ramp = ramp; __exports.fit = fit; __exports.at = at; __exports.blend = blend; __exports.PAL = PAL; __exports.RAMP = RAMP; __exports.WHITE = WHITE; __exports.BLACK = BLACK; __exports.INK = INK; __exports.PATCH = PATCH;
},
"core/particles.js": function(__r, __exports){
const { rng, clamp } = __r("core/math.js");
function fly(x, y, vx, vy, t, g = 0, drag = 0) {
if (drag <= 0) return [x + vx * t, y + vy * t + 0.5 * g * t * t];
const f = (1 - Math.exp(-drag * t)) / drag, vt = g / drag;
return [x + vx * f, y + vt * t + (vy - vt) * f];
}
function flyV(vx, vy, t, g = 0, drag = 0) {
if (drag <= 0) return [vx, vy + g * t];
const e = Math.exp(-drag * t), vt = g / drag;
return [vx * e, vt + (vy - vt) * e];
}
function burst(n, seed, fn) {
for (let i = 0; i < n; i++) fn(rng(seed, i), i);
}
function cycle(t, period, count, seed, life, fn) {
for (let i = 0; i < count; i++) {
const g = rng(seed, i, 911);
const born = g.next() * period;
const L = typeof life === "function" ? life(g) : life;
let age = (((t - born) % period) + period) % period;
for (; age < L; age += period) fn(age, L, rng(seed, i), i);
}
}
function stream(t, t0, t1, rate, seed, life, fn) {
const n = Math.floor((Math.min(t, t1) - t0) * rate);
for (let i = 0; i <= n; i++) {
const born = t0 + i / rate, g = rng(seed, i, 911), L = typeof life === "function" ? life(g) : life;
const age = t - born;
if (age >= 0 && age < L) fn(age, L, rng(seed, i), i);
}
}
class Particles {
constructor() {
this.list = [];
}
add(p) {
p.age = 0;
p.g ??= 0;
p.drag ??= 0;
this.list.push(p);
return p;
}
update(dt) {
for (let i = this.list.length - 1; i >= 0; i--) {
const p = this.list[i];
if ((p.age += dt) >= p.life) {
this.list.splice(i, 1);
continue;
}
p.vx -= p.vx * p.drag * dt;
p.vy += p.g * dt - p.vy * p.drag * dt;
p.x += p.vx * dt;
p.y += p.vy * dt;
if (p.ground !== undefined && p.y > p.ground) {
p.y = p.ground;
p.vy = -Math.abs(p.vy) * (p.bounce ?? 0.3);
p.vx *= 0.7;
}
}
}
static k(p) {
return clamp(1 - p.age / p.life);
}
}
__exports.fly = fly; __exports.flyV = flyV; __exports.burst = burst; __exports.cycle = cycle; __exports.stream = stream; __exports.Particles = Particles;
},
"core/shapes.js": function(__r, __exports){
const { TAU } = __r("core/math.js");
function bolt(r, x0, y0, x1, y1, { jag = 0.22, depth = 5 } = {}) {
let pts = [[x0, y0], [x1, y1]];
for (let d = 0; d < depth; d++) {
const next = [pts[0]];
for (let i = 1; i < pts.length; i++) {
const [ax, ay] = pts[i - 1], [bx, by] = pts[i], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
const off = (r.next() * 2 - 1) * jag * L;
next.push([(ax + bx) / 2 + (-dy / (L || 1)) * off, (ay + by) / 2 + (dx / (L || 1)) * off], pts[i]);
}
pts = next;
}
return pts;
}
function forks(r, path, { count = 3, len = 20, jag = 0.3, spread = 0.9 } = {}) {
const out = [];
for (let k = 0; k < count; k++) {
const i = 1 + Math.floor(r.next() * (path.length - 2)), [x, y] = path[i], [px, py] = path[i - 1];
const a = Math.atan2(y - py, x - px) + (r.next() < 0.5 ? -1 : 1) * spread * (0.4 + 0.6 * r.next());
const l = len * (0.4 + 0.6 * r.next());
out.push(bolt(r, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, { jag, depth: 3 }));
}
return out;
}
function star(cx, cy, r0, r1, n = 5, rot = -Math.PI / 2) {
const pts = [];
for (let i = 0; i < n * 2; i++) {
const a = rot + (i * Math.PI) / n, r = i % 2 ? r0 : r1;
pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
}
return pts;
}
function ngon(cx, cy, r, n = 6, rot = 0) {
return Array.from({ length: n }, (_, i) => [cx + Math.cos(rot + (i * TAU) / n) * r, cy + Math.sin(rot + (i * TAU) / n) * r]);
}
function trail(pos, t, n, dt) {
const out = [];
for (let i = 0; i < n; i++) out.push(pos(Math.max(0, t - i * dt)));
return out;
}
__exports.bolt = bolt; __exports.forks = forks; __exports.star = star; __exports.ngon = ngon; __exports.trail = trail;
},
"core/sim.js": function(__r, __exports){
const { Rng, clamp, TAU } = __r("core/math.js");
const { hex, scale, mix, rgb, WHITE } = __r("core/color.js");
const GRAVITY = 950; // px/s²
const CROSS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const HOT = ["#fff3a6", "#ffe26b", "#ff8a2a", "#f2561d"].map(hex);
const FIRE_RAMP = ["#ffffff", "#fff3a6", "#ffe26b", "#ffc23d", "#ff8a2a", "#f2561d", "#c9281f", "#8a1f17", "#4a1712"].map(hex);
const SMOKE_RAMP = ["#7b6f72", "#5d5660", "#433d48", "#2b2630", "#1a171e"].map(hex);
const rampAt = (r, t) => r[Math.min(r.length - 1, Math.max(0, Math.floor(t * r.length)))];
const P = { SPARK: 0, MOTE: 1, STREAK: 2, FLAKE: 3, VAPOUR: 4, DUST: 5, STAR: 6, EMBER: 7, SMOKE: 8, FIRE: 9, BRAND: 10, GRIT: 11 };
const PF = { SMOKES: 1, BIG: 2, BACK: 4 };
const SOFT = new Set([P.VAPOUR, P.DUST, P.SMOKE]);
class Particles {
constructor(opts = {}) {
this.R = opts.rng ?? new Rng(opts.seed ?? 1);
this.list = [];
this.t = 0;
this.ground = opts.ground ?? (() => Infinity);
this.sparks = (opts.sparks ?? HOT).map(hex);
this.haze = opts.haze === undefined ? null : hex(opts.haze);
this.onLand = opts.onLand ?? null; // (x, y) when a BRAND hits the floor
}
spawn(k, x, y, vx, vy, life, col = WHITE, size = 1, delay = 0, flag = 0) {
this.list.push({ k, x, y, vx, vy, life, max: life, col: col ? hex(col) : 0, size, seed: this.R.next() * 100, delay, flag });
}
get count() {
return this.list.length;
}
update(dt) {
this.t += dt;
const R = this.R, t = this.t;
for (let i = this.list.length - 1; i >= 0; i--) {
const p = this.list[i];
if (p.delay > 0) {
p.delay -= dt;
continue;
}
if ((p.life -= dt) <= 0) {
if (p.k === P.FIRE && p.flag & PF.SMOKES) {
const big = p.flag & PF.BIG;
this.spawn(P.SMOKE, p.x, p.y, p.vx * 0.6, p.vy * 0.6 - 6, big ? R.range(1.3, 2.3) : R.range(0.8, 1.4), 0, p.size * (big ? 0.85 : 0.7), 0, big ? PF.BIG : 0);
}
this.list.splice(i, 1);
continue;
}
switch (p.k) {
case P.FIRE:
p.vy -= 95 * dt;
p.vx += Math.sin(t * 17 + p.seed) * 30 * dt;
p.vx -= p.vx * 5 * dt;
p.vy -= p.vy * 3.2 * dt;
break;
case P.GRIT: {
p.vy += GRAVITY * dt;
p.vx -= p.vx * 0.8 * dt;
const g = this.ground(p.x), ny = p.y + p.vy * dt;
p.x += p.vx * dt;
if (p.vy > 0 && p.y <= g && ny >= g) {
p.y = g - 0.25;
if (p.vy > 130 && R.chance(0.4)) (p.vy = -p.vy * 0.25), (p.vx = p.vx * 0.5 + R.range(-10, 10));
else (p.vx = p.vy = 0), (p.life = Math.min(p.life, 0.5));
} else p.y = ny;
continue;
}
case P.BRAND: {
p.vy += GRAVITY * 0.8 * dt;
p.vx -= p.vx * 0.9 * dt;
if (R.chance(0.9 * Math.min(1, dt * 60))) this.spawn(P.FIRE, p.x, p.y, p.vx * 0.1 + R.range(-7, 7), p.vy * 0.1 - 10, R.range(0.16, 0.32), 0, R.range(0.9, 1.7) * (0.5 + (p.life / p.max) * 0.6), 0, R.chance(0.4) ? PF.SMOKES : 0);
const g = this.ground(p.x), ny = p.y + p.vy * dt;
p.x += p.vx * dt;
if (p.vy > 0 && p.y <= g && ny >= g) {
this.onLand?.(p.x, g);
this.list.splice(i, 1);
} else p.y = ny;
continue;
}
case P.SPARK: {
p.vy += GRAVITY * 0.45 * dt;
p.vx -= p.vx * 2.2 * dt;
p.vy -= p.vy * 2.2 * dt;
const g = this.ground(p.x), ny = p.y + p.vy * dt;
p.x += p.vx * dt;
if (p.vy > 0 && p.y <= g && ny >= g) (p.vy = -p.vy * 0.45), (p.vx *= 0.7), (p.y = g - 0.25);
else p.y = ny;
continue;
}
case P.STREAK: (p.vx += p.vx * 3 * dt), (p.vy += p.vy * 3 * dt); break;
case P.FLAKE:
p.vx -= p.vx * 2.2 * dt;
p.vy -= p.vy * 2.2 * dt - 35 * dt;
p.x += Math.sin(this.t * 2.5 + p.seed) * 7 * dt;
break;
case P.EMBER:
p.vy += (-30 + Math.sin(t * 3 + p.seed) * 20) * dt;
p.vx += Math.cos(t * 2.3 + p.seed) * 45 * dt;
p.vx -= p.vx * 1.6 * dt;
p.vy -= p.vy * 1.6 * dt;
break;
case P.SMOKE: {
const big = p.flag & PF.BIG;
p.vy -= (big ? 23 : 16) * dt;
p.vx += Math.sin(t * 1.3 + p.seed) * 8 * dt;
p.vx -= p.vx * 1.6 * dt;
p.vy -= p.vy * 1.2 * dt;
break;
}
case P.MOTE: p.vx -= p.vx * 0.6 * dt; p.vy -= p.vy * 0.6 * dt; break;
default: {
const drag = SOFT.has(p.k) ? 4 : 1.6;
p.vx -= p.vx * drag * dt;
p.vy -= p.vy * drag * dt + 5 * dt;
}
}
p.x += p.vx * dt;
p.y += p.vy * dt;
}
}
draw(p, layer) {
for (const q of this.list) {
if (q.delay > 0) continue;
if (layer && (SOFT.has(q.k) || q.flag & PF.BACK ? "back" : "front") !== layer) continue;
const k = q.life / q.max, x = q.x, y = q.y, sp = Math.hypot(q.vx, q.vy) || 1, ux = q.vx / sp, uy = q.vy / sp;
switch (q.k) {
case P.SPARK: {
const S = this.sparks, head = k > 0.6 ? S[0] : k > 0.3 ? S[1] : S[2], len = Math.min(9, 1 + sp * 0.022);
p.line(x - ux * len, y - uy * len, x - ux * len * 0.4, y - uy * len * 0.4, k > 0.5 ? head : S[S.length - 1]);
p.line(x - ux * len * 0.45, y - uy * len * 0.45, x, y, head);
p.glow(x, y, 3, head, 0.45 * k);
break;
}
case P.MOTE: {
const len = Math.min(16, 0.5 + sp * 0.026) * q.size, a = k < 0.35 ? k / 0.35 : 1;
p.line(x - ux * len, y - uy * len, x - ux * len * 0.35, y - uy * len * 0.35, scale(q.col, 0.55), a);
p.line(x - ux * len * 0.4, y - uy * len * 0.4, x, y, q.col, a);
p.glow(x, y, 2.5 + q.size, q.col, 0.4 * k);
break;
}
case P.STREAK: {
const L = clamp(sp / 30, 1, 7);
for (let d = L; d >= 0; d -= 0.5) p.dot(x - ux * d, y - uy * d, d < 1 ? WHITE : d < L * 0.5 ? q.col : scale(q.col, 0.6), d < L * 0.5 ? 1 : 1.2 - d / L);
p.glow(x, y, 4, q.col, 0.4);
break;
}
case P.FLAKE: {
const a = Math.min(1, k * 3);
p.dot(x, y, q.col, a);
if (q.size > 1.3) for (const [dx, dy] of CROSS) p.dot(x + dx, y + dy, scale(q.col, 0.8), a * 0.8);
break;
}
case P.VAPOUR: {
const r = q.size * (0.6 + (1 - k) * 0.9);
p.disc(x, y, r, q.col, Math.pow(k, 1.3) * 0.45);
if (this.haze) p.glow(x, y, r * 1.8, this.haze, 0.16 * k);
break;
}
case P.DUST: p.disc(x, y, q.size * (0.6 + (1 - k) * 0.9), q.col, Math.pow(k, 1.3) * 0.7); break;
case P.SMOKE: {
const age = 1 - k, big = q.flag & PF.BIG;
const r = q.size * (0.65 + Math.min(1, age * 2.5) * 0.45 + age * (big ? 0.5 : 0.4));
const a = Math.min(1, age * 12) * Math.min(1, k * 2.4) * (big ? 0.7 : 0.58);
const c = q.col ? mix(q.col, rampAt(SMOKE_RAMP, age), age) : rampAt(SMOKE_RAMP, age * 1.05);
p.disc(x, y, r, c, a * 0.45);
p.disc(x + r * 0.05, y + r * 0.06, r * 0.74, c, a * 0.62);
if (age < 0.5) p.disc(x - r * 0.22, y - r * 0.3, r * 0.5, mix(c, WHITE, 0.12), a * 0.4 * (1 - age * 2));
break;
}
case P.FIRE: {
const age = 1 - k, heat = Math.min(0.999, Math.pow(age, 0.62) + (q.seed % 1) * 0.1), F = FIRE_RAMP, n = F.length;
const idx = Math.min(n - 2, Math.floor(heat * (n - 1)));
const r = q.size * (0.55 + 0.45 * Math.min(1, age * 7)) * (1 - age * 0.55), c = F[idx];
if (idx >= n - 2) p.disc(x, y, r, c, Math.min(1, k * 3) * 0.85);
else {
p.circle(x, y, r, F[Math.min(n - 1, idx + 2)]);
p.circle(x - r * 0.16, y - r * 0.22, r * 0.78, c);
if (r > 1.6) p.circle(x, y - r * 0.9, r * 0.42, c);
if (idx <= 3 && r > 1.8) p.circle(x - r * 0.28, y - r * 0.34, r * 0.36, F[Math.max(0, idx - 1)]);
if (idx < 6) p.glow(x, y, r * 2.4 + 2, c, 0.18 * k);
}
break;
}
case P.BRAND:
p.circle(x, y, 1.6, HOT[3]);
p.px(x, y, Math.sin(this.t * 40 + q.seed) > 0 ? HOT[0] : HOT[1]);
p.px(x + 1, y, HOT[1]);
p.glow(x, y, 7, HOT[2], 0.45);
break;
case P.GRIT:
if (k > 0.25 || k * 4 > 0.5) {
p.px(x, y, q.col);
if (q.size >= 2) p.px(x + 1, y, q.col), p.px(x, y + 1, scale(q.col, 0.8)), p.px(x + 1, y + 1, scale(q.col, 0.7));
}
break;
case P.EMBER: {
const c = k > 0.6 ? this.sparks[0] : k > 0.3 ? this.sparks[1] : this.sparks[2];
if (k < 0.25 && Math.sin(this.t * 40 + q.seed) < 0) break;
p.px(x, y, c);
if (q.size > 1.5) p.px(x, y + 1, this.sparks[this.sparks.length - 1]);
p.glow(x, y, 3 + q.size, c, 0.35 * k);
break;
}
default: {
const tw = 0.6 + 0.4 * Math.sin(this.t * (8 + (q.seed % 5)) + q.seed);
if (q.size < 1) {
if (tw * k > 0.25) p.px(x, y, tw > 0.8 ? WHITE : q.col);
p.glow(x, y, 3, q.col, 0.4 * k * tw);
break;
}
sparkle(p, x, y, q.size * tw * Math.min(1, k * 3), q.col, scale(q.col, 0.75), 0.5 * k * tw);
}
}
}
}
}
class Blazes {
constructor(ps) {
this.ps = ps;
this.list = [];
}
add(x, y, life, power) {
this.list.push({ x, y, life, max: life, acc: this.ps.R.next(), power });
}
get count() {
return this.list.length;
}
update(dt) {
const ps = this.ps, R = ps.R;
for (let i = this.list.length - 1; i >= 0; i--) {
const b = this.list[i];
if ((b.life -= dt) <= 0) {
this.list.splice(i, 1);
continue;
}
const k = b.life / b.max, intensity = b.power * (k > 0.7 ? 1 : 0.35 + (k / 0.7) * 0.65);
for (b.acc += dt * (6 + 16 * intensity); b.acc > 1; b.acc--) {
const s = R.range(1.2, 2.8) * intensity;
ps.spawn(P.FIRE, b.x + R.range(-1.5, 1.5), b.y - s * 0.6, R.range(-6, 6), R.range(-30, -12), R.range(0.28, 0.6), 0, s, 0, PF.BACK | (R.chance(0.3) ? PF.SMOKES : 0));
if (R.chance(0.06)) ps.spawn(P.EMBER, b.x, b.y - 1.5, R.range(-15, 15), R.range(-45, -15), R.range(0.6, 1.4), HOT[2], 1, 0, PF.BACK);
}
}
}
drawBack(p) {
for (const b of this.list) {
const k = b.life / b.max;
p.px(b.x, b.y, k > 0.4 ? (Math.sin(b.life * 31 + b.x) > 0 ? HOT[1] : HOT[2]) : HOT[3]);
p.glow(b.x, b.y, 6 + 5 * k * b.power, HOT[2], 0.3 * k * b.power);
}
}
}
const B = { SHARD: 0, CHUNK: 1, DRIP: 2 };
class Bits {
constructor(opts = {}) {
this.list = [];
this.ground = opts.ground ?? (() => Infinity);
}
add(b) {
const life = b.life ?? 1;
this.list.push({ kind: B.SHARD, vx: 0, vy: 0, a: 0, va: 0, s: 1, c: WHITE, g: 1, drag: 0, bounce: 0, rest: false, ...b, life, max: life });
}
get count() {
return this.list.length;
}
update(dt) {
for (let i = this.list.length - 1; i >= 0; i--) {
const b = this.list[i];
if ((b.life -= dt) <= 0) {
this.list.splice(i, 1);
continue;
}
if (b.rest) continue;
b.vy += GRAVITY * b.g * dt;
b.vx -= b.vx * b.drag * dt;
b.vy -= b.vy * b.drag * dt;
b.x += b.vx * dt;
b.y += b.vy * dt;
b.a += b.va * dt;
const floor = this.ground(b.x), sp = b.vy;
if (b.g <= 0 || b.y < floor || sp <= 0) continue;
b.y = floor - 0.01;
if (b.kind === B.DRIP) b.life = 0;
else if (b.bounce > 0 && sp > 70) (b.vy = -sp * b.bounce), (b.vx *= 0.7), (b.va *= 0.6);
else (b.rest = true), (b.vx = b.vy = 0);
}
}
draw(p) {
for (const b of this.list) {
const a = Math.min(1, b.life / 0.4), ca = Math.cos(b.a), sa = Math.sin(b.a);
if (b.kind === B.SHARD) {
for (let d = -b.s / 2; d <= b.s / 2; d += 0.5) p.dot(b.x + ca * d, b.y + sa * d, d > b.s / 2 - 0.6 ? WHITE : hex(b.c), a);
} else if (b.kind === B.DRIP) {
p.dot(b.x, b.y, hex(b.c), a);
p.dot(b.x, b.y - 1, hex(b.c), a * 0.5);
} else {
const R = (b.ramp ?? ["#1c2030", "#3a4a66", "#6e86a8", "#a8c0dc", "#e8f2ff"]).map(hex), n = R.length;
const x = Math.round(b.x), y = Math.round(b.y), r = Math.ceil(b.s) + 1;
for (let py = -r; py <= r; py++)
for (let px = -r; px <= r; px++) {
const u = (px + 0.5) * ca + (py + 0.5) * sa, v = -(px + 0.5) * sa + (py + 0.5) * ca;
const d = Math.abs(u) / b.s + Math.abs(v) / (b.s * 0.62);
if (d > 1.3) continue;
p.dot(x + px, y + py, d > 1 ? R[0] : v < 0 ? (u < 0 ? R[n - 1] : R[n - 2]) : u < 0 ? R[n - 3] : R[Math.max(1, n - 4)], a);
}
}
}
}
}
class Lights {
constructor() {
this.list = [];
}
add(x, y, r, color, k, life) {
this.list.push({ x, y, r, color: hex(color), k, life, max: life });
}
update(dt) {
for (let i = this.list.length - 1; i >= 0; i--) if ((this.list[i].life -= dt) <= 0) this.list.splice(i, 1);
}
draw(p) {
for (const l of this.list) {
const k = l.life / l.max;
p.glow(l.x, l.y, l.r * (0.55 + 0.45 * k), l.color, l.k * k * k);
}
}
}
function sparkle(p, x, y, arm, c, tip = c, k = 0.6) {
const n = Math.round(arm);
if (n < 1) return;
const X = Math.floor(x), Y = Math.floor(y);
for (let d = 1; d <= n; d++) {
const cc = d > n * 0.6 ? tip : c;
for (const [dx, dy] of CROSS) p.px(X + dx * d, Y + dy * d, cc);
}
if (n >= 3) for (const [dx, dy] of DIAG) p.px(X + dx, Y + dy, c);
if (n >= 6) for (const [dx, dy] of DIAG) p.px(X + dx * 2, Y + dy * 2, tip);
p.px(X, Y, WHITE);
p.glow(x, y, 4 + n * 2, c, k);
}
function flare(p, x, y, L, k, ramp) {
if (L < 1) return;
const R = ramp.map(hex), n = R.length;
for (let i = 0; i < 8; i++) {
const an = (i * Math.PI) / 4, len = i % 4 === 0 ? L : i % 2 === 0 ? L * 0.6 : L * 0.3, ca = Math.cos(an), sa = Math.sin(an);
for (let d = 0; d <= len; d += 0.5) {
const u = d / len;
p.dot(x + ca * d, y + sa * d, u < 0.35 ? WHITE : u < 0.7 ? R[n - 2] : R[n - 3], u < 0.6 ? 1 : k * 1.5 * (1 - u) + 0.2);
}
}
}
function band(p, cx, cy, r, sy, th, k, ramp, keep = () => true, hot = false) {
if (r <= 0 || k <= 0) return;
const R = ramp.map(hex), n = R.length;
for (let j = 0, m = Math.ceil(r * TAU * 1.2); j < m; j++) {
const ang = (j / m) * TAU, ca = Math.cos(ang), sa = Math.sin(ang);
if (!keep(ang)) continue;
for (let o = th; o >= 0; o -= 0.5) {
const u = o / th, c = u < 0.15 ? (hot ? WHITE : R[n - 1]) : u < 0.4 ? R[n - 2] : u < 0.7 ? R[n - 3] : R[n - 4];
p.dot(cx + ca * (r - o), cy + sa * (r - o) * sy, c, k * (u < 0.4 ? 1.2 : 1.15 - u));
}
}
}
function crystal(p, x, base, h, w, lean, ramp, opts = {}) {
if (h < 1.5) return;
const R = ramp.map(hex), n = R.length, C = (i) => R[Math.max(0, n - 1 - i)];
const a = opts.a ?? 1, top = base - h, ridge0 = x - w * 0.14, glint = opts.glint ?? -1;
const inside = (px, py) => {
const u = (base - (py + 0.5)) / h;
return u >= 0 && u <= 1 && Math.abs(px + 0.5 - (x + lean * u)) <= (w / 2) * (1 - u) + 0.35;
};
for (let py = Math.floor(top) - 1; py < Math.ceil(base); py++)
for (let px = Math.floor(x - w / 2 - Math.abs(lean) - 2); px <= Math.ceil(x + w / 2 + Math.abs(lean) + 2); px++) {
if (!inside(px, py)) {
if (inside(px - 1, py) || inside(px + 1, py) || inside(px, py + 1) || (inside(px, py - 1) && py < base - 1)) p.dot(px, py, R[0], a);
continue;
}
if (opts.white) {
p.dot(px, py, WHITE, a);
continue;
}
const u = (base - (py + 0.5)) / h, rx = ridge0 + (x + lean - ridge0) * u, c = x + lean * u, hw = (w / 2) * (1 - u) + 0.35, fx = px + 0.5;
let col = u > 0.9 ? WHITE : Math.abs(fx - rx) < 0.55 ? C(1)
: fx < rx ? (fx - (c - hw) < 1 ? C(1) : (fx - (c - hw)) / Math.max(1, rx - (c - hw)) > 0.55 ? C(2) : C(3))
: c + hw - fx < 1.2 ? C(Math.min(n - 2, 6)) : (fx - rx) / Math.max(1, c + hw - rx) > 0.5 ? C(5) : C(4);
if (glint >= 0 && fx <= rx + 0.6) {
const g = Math.abs(u - glint);
if (g < 0.05) col = WHITE;
else if (g < 0.1) col = C(1);
}
p.dot(px, py, col, a);
}
}
__exports.GRAVITY = GRAVITY; __exports.FIRE_RAMP = FIRE_RAMP; __exports.SMOKE_RAMP = SMOKE_RAMP; __exports.P = P; __exports.PF = PF; __exports.Particles = Particles; __exports.Blazes = Blazes; __exports.B = B; __exports.Bits = Bits; __exports.Lights = Lights; __exports.sparkle = sparkle; __exports.flare = flare; __exports.band = band; __exports.crystal = crystal;
},
"core/painter.js": function(__r, __exports){
const { clamp } = __r("core/math.js");
const { hex } = __r("core/color.js");
const { rasterText, textWidth, FONTS } = __r("core/font.js");
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const OUT = { c: 0, a: 1, l: 0, k: 0 };
const sprites = new WeakMap();
const call = (v, ...args) => (typeof v === "function" ? v(...args) : v);
class Painter {
constructor(frame) {
this.frame = frame;
this.reset();
}
reset() {
const f = this.frame;
this.w = f.w; this.h = f.h; this.ox = f.ox | 0; this.oy = f.oy | 0; this.C = f.color; this.L = f.light;
this.tx = 0; this.ty = 0; this.fx = 1; this.cs = 1; this.sn = 0;
this.fade = 1; this.lightK = 1; this.layer = "front";
return this;
}
place(x, y, flip = false, angle = 0) {
this.tx = x; this.ty = y; this.fx = flip ? -1 : 1; this.cs = Math.cos(angle); this.sn = Math.sin(angle);
return this;
}
toX(x, y) { return this.tx + x * this.fx * this.cs - y * this.sn; }
toY(x, y) { return this.ty + x * this.fx * this.sn + y * this.cs; }
fromX(sx, sy) { const dx = sx - this.tx, dy = sy - this.ty; return (dx * this.cs + dy * this.sn) * this.fx; }
fromY(sx, sy) { const dx = sx - this.tx, dy = sy - this.ty; return -dx * this.sn + dy * this.cs; }
cellX(x, y) { return Math.floor(this.toX(Math.floor(x) + 0.5, Math.floor(y) + 0.5)); }
cellY(x, y) { return Math.floor(this.toY(Math.floor(x) + 0.5, Math.floor(y) + 0.5)); }
put(sx, sy, c, a = 1) {
if (!c) return;
a *= this.fade;
if (a < 1 && a <= BAYER[((sy & 3) << 2) | (sx & 3)]) return;
const x = sx - this.ox, y = sy - this.oy;
if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
this.C[y * this.w + x] = c;
}
add(sx, sy, c, k = 1) {
k *= this.fade * this.lightK;
if (k <= 0.004) return;
const x = sx - this.ox, y = sy - this.oy;
if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
const i = y * this.w + x, d = this.L[i];
const r = Math.min(255, (d & 255) + (c & 255) * k) | 0;
const g = Math.min(255, ((d >>> 8) & 255) + ((c >>> 8) & 255) * k) | 0;
const b = Math.min(255, ((d >>> 16) & 255) + ((c >>> 16) & 255) * k) | 0;
this.L[i] = (255 << 24) | (b << 16) | (g << 8) | r;
}
blendPx(sx, sy, c, a) {
a *= this.fade;
if (!c || a <= 0.004) return;
const x = sx - this.ox, y = sy - this.oy;
if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
const i = y * this.w + x, d = this.C[i], da = (d >>> 24) / 255, oa = a + da * (1 - a), k = a / oa;
const ch = (s) => ((((c >>> s) & 255) * k + ((d >>> s) & 255) * (1 - k)) & 255);
this.C[i] = (((oa * 255) & 255) << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
blend(x, y, c, a) { this.blendPx(this.cellX(x, y), this.cellY(x, y), c, a); }
disc(cx, cy, r, c, a) {
if (r < 0.5) return this.blend(cx, cy, call(c, 0, 0), call(a, 0, 0));
this.each(cx - r, cy - r, cx + r, cy + r, (x, y, sx, sy) => {
const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
if (d2 > r * r) return;
const d = Math.sqrt(d2) / r, ang = Math.atan2(dy, dx);
this.blendPx(sx, sy, call(c, d, ang), call(a, d, ang));
});
}
get(x, y) {
const sx = this.cellX(x, y) - this.ox, sy = this.cellY(x, y) - this.oy;
return sx < 0 || sy < 0 || sx >= this.w || sy >= this.h ? 0 : this.C[sy * this.w + sx];
}
px(x, y, c) { this.put(this.cellX(x, y), this.cellY(x, y), c, 1); }
dot(x, y, c, a = 1) { if (a > 0) this.put(this.cellX(x, y), this.cellY(x, y), c, a); }
light(x, y, c, k = 1) { this.add(this.cellX(x, y), this.cellY(x, y), c, k); }
each(x0, y0, x1, y1, fn) {
let ax = Infinity, bx = -Infinity, ay = Infinity, by = -Infinity;
for (let k = 0; k < 4; k++) {
const x = k & 1 ? x1 : x0, y = k & 2 ? y1 : y0, sx = this.toX(x, y), sy = this.toY(x, y);
if (sx < ax) ax = sx; if (sx > bx) bx = sx; if (sy < ay) ay = sy; if (sy > by) by = sy;
}
const sx0 = Math.max(Math.floor(ax), this.ox), sx1 = Math.min(Math.ceil(bx), this.ox + this.w - 1);
const sy0 = Math.max(Math.floor(ay), this.oy), sy1 = Math.min(Math.ceil(by), this.oy + this.h - 1);
for (let sy = sy0; sy <= sy1; sy++)
for (let sx = sx0; sx <= sx1; sx++) {
const cx = sx + 0.5, cy = sy + 0.5;
fn(this.fromX(cx, cy), this.fromY(cx, cy), sx, sy);
}
}
shade(x0, y0, x1, y1, fn) {
const o = OUT;
this.each(x0, y0, x1, y1, (lx, ly, sx, sy) => {
o.c = 0; o.a = 1; o.l = 0; o.k = 0;
const c = fn(lx, ly, o) || o.c;
if (c) this.put(sx, sy, c, o.a);
if (o.k > 0) this.add(sx, sy, o.l || c, o.k);
});
}
line(x0, y0, x1, y1, c, a = 1) {
let sx = this.cellX(x0, y0), sy = this.cellY(x0, y0);
const ex = this.cellX(x1, y1), ey = this.cellY(x1, y1);
const dx = Math.abs(ex - sx), dy = -Math.abs(ey - sy), stepx = sx < ex ? 1 : -1, stepy = sy < ey ? 1 : -1;
const n = Math.max(dx, -dy) || 1, fc = typeof c === "function", fa = typeof a === "function";
let err = dx + dy, i = 0;
for (;;) {
const u = i++ / n;
this.put(sx, sy, fc ? c(u) : c, fa ? a(u) : a);
if (sx === ex && sy === ey) break;
const e2 = 2 * err;
if (e2 >= dy) { err += dy; sx += stepx; }
if (e2 <= dx) { err += dx; sy += stepy; }
}
}
polyline(pts, c, a = 1) {
for (let i = 1; i < pts.length; i++) this.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, a);
}
beam(x0, y0, x1, y1, width, c, a = 1) {
const r = width / 2, dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1e-9;
this.shade(Math.min(x0, x1) - r, Math.min(y0, y1) - r, Math.max(x0, x1) + r, Math.max(y0, y1) + r, (x, y, o) => {
const u = clamp(((x - x0) * dx + (y - y0) * dy) / L2), px = x0 + dx * u - x, py = y0 + dy * u - y;
const d2 = px * px + py * py;
if (d2 > r * r) return;
const v = Math.sqrt(d2) / r;
o.c = call(c, u, v);
o.a = call(a, u, v);
});
}
circle(cx, cy, r, c, a = 1) {
if (r < 0.6) return this.dot(cx, cy, call(c, 0, 0), call(a, 0, 0));
this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
if (d2 > r * r) return;
const d = Math.sqrt(d2) / r, ang = Math.atan2(dy, dx);
o.c = call(c, d, ang);
o.a = call(a, d, ang);
});
}
ellipse(cx, cy, rx, ry, c, a = 1) {
if (rx <= 0 || ry <= 0) return;
this.shade(cx - rx, cy - ry, cx + rx, cy + ry, (x, y, o) => {
const dx = (x - cx) / rx, dy = (y - cy) / ry, d2 = dx * dx + dy * dy;
if (d2 > 1) return;
const d = Math.sqrt(d2), ang = Math.atan2(dy, dx);
o.c = call(c, d, ang);
o.a = call(a, d, ang);
});
}
ring(cx, cy, r, w, c, a = 1) {
const r0 = Math.max(0, r - w);
this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
if (d2 > r * r || d2 < r0 * r0) return;
const v = w > 0 ? (Math.sqrt(d2) - r0) / (r - r0 || 1) : 1, ang = Math.atan2(dy, dx);
o.c = call(c, v, ang);
o.a = call(a, v, ang);
});
}
arc(cx, cy, r, w, a0, a1, c, a = 1) {
const span = a1 - a0, wf = typeof w === "function";
this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
if (d > r) return;
let ang = Math.atan2(dy, dx) - a0;
ang -= Math.floor(ang / (Math.PI * 2)) * Math.PI * 2;
if (ang > span) return;
const u = ang / span, ww = wf ? w(u) : w;
if (ww <= 0 || d < r - ww) return;
const v = (d - (r - ww)) / ww;
o.c = call(c, u, v);
o.a = call(a, u, v);
});
}
rect(x, y, w, h, c, a = 1) {
if (this.sn === 0) {
const X0 = Math.round(x), Y0 = Math.round(y), X1 = Math.round(x + w), Y1 = Math.round(y + h);
for (let yy = Y0; yy < Y1; yy++) for (let xx = X0; xx < X1; xx++) this.put(this.cellX(xx, yy), this.cellY(xx, yy), c, a);
return;
}
this.shade(x, y, x + w, y + h, (lx, ly, o) => {
if (lx < x || ly < y || lx >= x + w || ly >= y + h) return;
o.c = c; o.a = a;
});
}
poly(pts, c, a = 1) {
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
const n = pts.length;
this.shade(x0, y0, x1, y1, (x, y, o) => {
let inside = false;
for (let i = 0, j = n - 1; i < n; j = i++) {
const [xi, yi] = pts[i], [xj, yj] = pts[j];
if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
}
if (!inside) return;
o.c = call(c, x, y);
o.a = call(a, x, y);
});
}
tri(x0, y0, x1, y1, x2, y2, c, a = 1) { this.poly([[x0, y0], [x1, y1], [x2, y2]], c, a); }
glow(x, y, r, c, k = 0.5) {
if (r < 1 || k <= 0.004) return;
const cx = this.toX(x, y), cy = this.toY(x, y);
const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r), y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
for (let sy = y0; sy <= y1; sy++) {
const dy = (sy + 0.5 - cy) / r;
for (let sx = x0; sx <= x1; sx++) {
const dx = (sx + 0.5 - cx) / r, d = dx * dx + dy * dy;
if (d >= 1) continue;
const f = 1 - Math.sqrt(d);
this.add(sx, sy, c, f * f * k);
}
}
}
glowLine(x0, y0, x1, y1, r, c, k = 0.5) {
if (r < 1 || k <= 0.004) return;
const ax = this.toX(x0, y0), ay = this.toY(x0, y0), bx = this.toX(x1, y1), by = this.toY(x1, y1);
const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9;
const X0 = Math.floor(Math.min(ax, bx) - r), X1 = Math.ceil(Math.max(ax, bx) + r);
const Y0 = Math.floor(Math.min(ay, by) - r), Y1 = Math.ceil(Math.max(ay, by) + r);
for (let sy = Y0; sy <= Y1; sy++)
for (let sx = X0; sx <= X1; sx++) {
const px = sx + 0.5, py = sy + 0.5, u = clamp(((px - ax) * dx + (py - ay) * dy) / L2);
const ex = ax + dx * u - px, ey = ay + dy * u - py, d = Math.sqrt(ex * ex + ey * ey) / r;
if (d >= 1) continue;
const f = 1 - d;
this.add(sx, sy, c, f * f * k);
}
}
glowRing(x, y, R, r, c, k = 0.5) {
if (r < 1 || k <= 0.004) return;
const cx = this.toX(x, y), cy = this.toY(x, y), E = R + r;
for (let sy = Math.floor(cy - E); sy <= Math.ceil(cy + E); sy++)
for (let sx = Math.floor(cx - E); sx <= Math.ceil(cx + E); sx++) {
const d = Math.abs(Math.hypot(sx + 0.5 - cx, sy + 0.5 - cy) - R) / r;
if (d >= 1) continue;
const f = 1 - d;
this.add(sx, sy, c, f * f * k);
}
}
sprite(rows, pal, x, y, opts = {}) {
let s = sprites.get(rows);
if (!s) sprites.set(rows, (s = rows.map((r) => [...r])));
const k = opts.scale ?? 1, a = opts.a ?? 1, W = s[0]?.length ?? 0, cache = {};
for (let r = 0; r < s.length; r++)
for (let q = 0; q < s[r].length; q++) {
const ch = s[r][q];
if (ch === "." || ch === " ") continue;
let c = opts.tint;
if (c === undefined) {
c = cache[ch];
if (c === undefined) c = cache[ch] = pal[ch] === undefined ? 0 : hex(pal[ch]);
}
if (!c) continue;
const col = opts.flip ? W - 1 - q : q, row = opts.flipY ? s.length - 1 - r : r;
if (k === 1) this.dot(x + col, y + row, c, a);
else this.rect(x + col * k, y + row * k, k, k, c, a);
}
}
text(str, x, y, c, opts = {}) {
const font = opts.font ?? "mini", k = opts.scale ?? 1, a = opts.a ?? 1, w = textWidth(str, font) * k;
const left = Math.round(opts.align === "center" ? x - w / 2 : opts.align === "right" ? x - w : x), top = Math.round(y);
const ol = opts.outline, sh = opts.shadow;
if (ol !== undefined) rasterText(str, font, (gx, gy) => this.rect(left + gx * k - 1, top + gy * k - 1, k + 2, k + 2, ol, a));
if (sh !== undefined) rasterText(str, font, (gx, gy) => this.rect(left + gx * k + 1, top + gy * k + 1, k, k, sh, a));
rasterText(str, font, (gx, gy) => this.rect(left + gx * k, top + gy * k, k, k, call(c, gx, gy), a));
}
measure(str, opts = {}) {
const k = opts.scale ?? 1;
return [textWidth(str, opts.font ?? "mini") * k, FONTS[opts.font ?? "mini"].h * k];
}
mask(m, x, y, c, a = 1) {
for (let my = 0; my < m.h; my++)
for (let mx = 0; mx < m.w; mx++) if (m.data[my * m.w + mx]) this.dot(x + mx, y + my, call(c, mx, my), call(a, mx, my));
}
outline(m, x, y, c, a = 1) {
const at = (mx, my) => mx >= 0 && my >= 0 && mx < m.w && my < m.h && m.data[my * m.w + mx];
for (let my = -1; my <= m.h; my++)
for (let mx = -1; mx <= m.w; mx++)
if (!at(mx, my) && (at(mx - 1, my) || at(mx + 1, my) || at(mx, my - 1) || at(mx, my + 1)))
this.dot(x + mx, y + my, call(c, mx, my), call(a, mx, my));
}
}
__exports.Painter = Painter;
},
"core/font.js": function(__r, __exports){
const MINI = {
A: ".#.|#.#|###|#.#|#.#", B: "##.|#.#|##.|#.#|##.", C: ".##|#..|#..|#..|.##", D: "##.|#.#|#.#|#.#|##.",
E: "###|#..|##.|#..|###", F: "###|#..|##.|#..|#..", G: ".##|#..|#.#|#.#|.##", H: "#.#|#.#|###|#.#|#.#",
I: "###|.#.|.#.|.#.|###", J: "..#|..#|..#|#.#|.#.", K: "#.#|#.#|##.|#.#|#.#", L: "#..|#..|#..|#..|###",
M: "#.#|###|###|#.#|#.#", N: "##.|#.#|#.#|#.#|#.#", O: ".#.|#.#|#.#|#.#|.#.", P: "##.|#.#|##.|#..|#..",
Q: ".#.|#.#|#.#|##.|.##", R: "##.|#.#|##.|#.#|#.#", S: ".##|#..|.#.|..#|##.", T: "###|.#.|.#.|.#.|.#.",
U: "#.#|#.#|#.#|#.#|###", V: "#.#|#.#|#.#|#.#|.#.", W: "#.#|#.#|###|###|#.#", X: "#.#|#.#|.#.|#.#|#.#",
Y: "#.#|#.#|.#.|.#.|.#.", Z: "###|..#|.#.|#..|###",
0: "###|#.#|#.#|#.#|###", 1: ".#.|##.|.#.|.#.|###", 2: "##.|..#|.#.|#..|###", 3: "##.|..#|.#.|..#|##.",
4: "#.#|#.#|###|..#|..#", 5: "###|#..|##.|..#|##.", 6: ".##|#..|###|#.#|###", 7: "###|..#|.#.|.#.|.#.",
8: "###|#.#|###|#.#|###", 9: "###|#.#|###|..#|##.",
"+": "...|.#.|###|.#.|...", "-": "...|...|###|...|...", "!": "#|#|#|.|#", "?": "##.|..#|.#.|...|.#.",
".": ".|.|.|.|#", ",": "..|..|..|.#|#.", ":": ".|#|.|#|.", "/": "..#|..#|.#.|#..|#..",
"%": "#.#|..#|.#.|#..|#.#", x: "...|#.#|.#.|#.#|...", "*": "#.#|.#.|#.#|...|...", "'": "#|#|.|.|.",
"(": ".#|#.|#.|#.|.#", ")": "#.|.#|.#|.#|#.", "<": "..#|.#.|#..|.#.|..#", ">": "#..|.#.|..#|.#.|#..",
"=": "...|###|...|###|...", _: "...|...|...|...|###", "#": "#.#|###|#.#|###|#.#",
};
const BIG = {
A: ".###.|#...#|#...#|#####|#...#|#...#|#...#", B: "####.|#...#|#...#|####.|#...#|#...#|####.",
C: ".###.|#...#|#....|#....|#....|#...#|.###.", D: "####.|#...#|#...#|#...#|#...#|#...#|####.",
E: "#####|#....|#....|####.|#....|#....|#####", F: "#####|#....|#....|####.|#....|#....|#....",
G: ".###.|#...#|#....|#.###|#...#|#...#|.####", H: "#...#|#...#|#...#|#####|#...#|#...#|#...#",
I: "###|.#.|.#.|.#.|.#.|.#.|###", J: "..###|...#.|...#.|...#.|...#.|#..#.|.##..",
K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#", L: "#....|#....|#....|#....|#....|#....|#####",
M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#", N: "#...#|#...#|##..#|#.#.#|#..##|#...#|#...#",
O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.", P: "####.|#...#|#...#|####.|#....|#....|#....",
Q: ".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#", R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#",
S: ".####|#....|#....|.###.|....#|....#|####.", T: "#####|..#..|..#..|..#..|..#..|..#..|..#..",
U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.", V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",
W: "#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.", X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
Y: "#...#|#...#|.#.#.|..#..|..#..|..#..|..#..", Z: "#####|....#|...#.|..#..|.#...|#....|#####",
0: ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.", 1: ".#.|##.|.#.|.#.|.#.|.#.|###",
2: ".###.|#...#|....#|...#.|..#..|.#...|#####", 3: "#####|...#.|..#..|...#.|....#|#...#|.###.",
4: "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.", 5: "#####|#....|####.|....#|....#|#...#|.###.",
6: "..##.|.#...|#....|####.|#...#|#...#|.###.", 7: "#####|....#|...#.|..#..|.#...|.#...|.#...",
8: ".###.|#...#|#...#|.###.|#...#|#...#|.###.", 9: ".###.|#...#|#...#|.####|....#|...#.|.##..",
"!": "#|#|#|#|#|.|#", "?": ".###.|#...#|....#|...#.|..#..|.....|..#..", "+": ".....|..#..|..#..|#####|..#..|..#..|.....",
"-": "....|....|....|####|....|....|....", ".": ".|.|.|.|.|.|#", ",": "..|..|..|..|..|.#|#.", ":": ".|.|#|.|.|#|.",
"/": "....#|....#|...#.|..#..|.#...|#....|#....", "%": "##...|##..#|...#.|..#..|.#...|#..##|...##",
x: ".....|.....|#...#|.#.#.|..#..|.#.#.|#...#", "*": ".....|..#..|#.#.#|.###.|#.#.#|..#..|.....", "'": "#|#|.|.|.|.|.",
"<": "...#|..#.|.#..|#...|.#..|..#.|...#", ">": "#...|.#..|..#.|...#|..#.|.#..|#...", "=": "....|....|####|....|####|....|....",
"(": "..#|.#.|#..|#..|#..|.#.|..#", ")": "#..|.#.|..#|..#|..#|.#.|#..", "#": ".#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.",
};
function build(table, h) {
const out = {};
for (const [ch, src] of Object.entries(table)) {
const rows = src.split("|");
out[ch] = { w: rows[0].length, rows: rows.map((r) => [...r].map((c) => c === "#")) };
if (rows.length !== h) throw new Error(`glyph ${ch} has ${rows.length} rows, expected ${h}`);
}
return out;
}
const FONTS = {
mini: { h: 5, space: 2, gap: 1, glyphs: build(MINI, 5) },
big: { h: 7, space: 3, gap: 1, glyphs: build(BIG, 7) },
};
function textWidth(str, font = "mini") {
const F = FONTS[font];
let w = 0;
for (const ch of String(str)) {
const g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()];
w += (g ? g.w : F.space) + F.gap;
}
return Math.max(0, w - F.gap);
}
function rasterText(str, font, plot) {
const F = FONTS[font];
let x = 0;
for (const ch of String(str)) {
const g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()];
if (!g) {
x += F.space + F.gap;
continue;
}
for (let r = 0; r < F.h; r++) for (let c = 0; c < g.w; c++) if (g.rows[r][c]) plot(x + c, r);
x += g.w + F.gap;
}
}
__exports.FONTS = FONTS; __exports.textWidth = textWidth; __exports.rasterText = rasterText;
},
"core/fx.js": function(__r, __exports){
const { Painter } = __r("core/painter.js");
const { clamp } = __r("core/math.js");
const { stockActor } = __r("core/actor.js");
const { fit, toHex } = __r("core/color.js");
function createFrame(w, h, ox = 0, oy = 0) {
return { w, h, ox, oy, color: new Uint32Array(w * h), light: new Uint32Array(w * h) };
}
function clearFrame(f) {
f.color.fill(0);
f.light.fill(0);
return f;
}
const painters = new WeakMap();
function painterFor(frame) {
let p = painters.get(frame);
if (!p) painters.set(frame, (p = new Painter(frame)));
return p.reset();
}
const FADE = 0.3;
const isRamp = (v) => Array.isArray(v) && v.length > 0 && v.every((c) => typeof c === "number" || /^#[0-9a-f]{3,8}$/i.test(c));
function resolveOptions(meta, o = {}) {
const opts = { ...(meta.options ?? {}), ...o };
for (const [k, def] of Object.entries(meta.options ?? {}))
if (isRamp(def) && isRamp(o[k]) && o[k].length !== def.length) opts[k] = fit(o[k], def.length).map(toHex);
if (meta.actor && !opts.actor) opts.actor = stockActor(meta.actor === 2 ? 2 : 1);
return opts;
}
function createFx(mod, o = {}) {
const meta = mod.meta ?? {};
const opts = resolveOptions(meta, o);
const impl = mod.create ? mod.create(opts) : mod;
const D = meta.duration ?? 1;
let t = 0, stopAt = Infinity;
return {
meta,
options: opts,
get t() {
return t;
},
update(dt) {
t += dt;
if (!impl.update) return;
const n = Math.max(1, Math.ceil(dt * 120 - 1e-9));
for (let i = 0; i < n; i++) impl.update(dt / n, opts);
},
draw(frame, layer) {
const p = painterFor(frame);
p.place(opts.x ?? 0, opts.y ?? 0, !!opts.flip, opts.angle ?? 0);
p.fade = stopAt === Infinity ? 1 : clamp(1 - (t - stopAt) / FADE);
p.lightK = opts.light ?? 1;
const tt = meta.loop ? t % D : Math.min(t, D);
if (layer !== "front" && impl.drawBack) {
p.layer = "back";
impl.drawBack(p, tt, opts);
}
if (layer !== "back") {
p.layer = "front";
impl.draw(p, tt, opts);
}
},
stop() {
if (stopAt === Infinity) stopAt = t;
},
done() {
return t - stopAt >= FADE || (!meta.loop && t >= D);
},
};
}
function composite(f, out, bg = null, lightK = 1) {
const n = f.w * f.h, C = f.color, L = f.light, flat = typeof bg === "number";
for (let i = 0; i < n; i++) {
const c = C[i], l = L[i] & 0xffffff;
let r, g, b, a;
const ca = c >>> 24;
if (ca === 255) {
r = c & 255; g = (c >>> 8) & 255; b = (c >>> 16) & 255; a = 255;
} else if (bg === null) {
r = c & 255; g = (c >>> 8) & 255; b = (c >>> 16) & 255; a = ca;
} else {
const k = flat ? bg : bg[i], f = ca / 255;
r = (c & 255) * f + (k & 255) * (1 - f); g = ((c >>> 8) & 255) * f + ((k >>> 8) & 255) * (1 - f);
b = ((c >>> 16) & 255) * f + ((k >>> 16) & 255) * (1 - f); a = 255;
}
if (l) {
const lr = (l & 255) * lightK, lg = ((l >>> 8) & 255) * lightK, lb = ((l >>> 16) & 255) * lightK;
if (a < 255) {
const pa = a / 255, pr = r * pa + lr, pg = g * pa + lg, pb = b * pa + lb;
const na = Math.min(1, Math.max(pa, Math.max(lr, lg, lb) / 255));
if (na > 0) { r = Math.min(255, pr / na); g = Math.min(255, pg / na); b = Math.min(255, pb / na); a = na * 255; }
} else {
r = Math.min(255, r + lr); g = Math.min(255, g + lg); b = Math.min(255, b + lb);
}
}
const j = i * 4;
out[j] = r; out[j + 1] = g; out[j + 2] = b; out[j + 3] = a;
}
return out;
}
__exports.createFrame = createFrame; __exports.clearFrame = clearFrame; __exports.painterFor = painterFor; __exports.resolveOptions = resolveOptions; __exports.createFx = createFx; __exports.composite = composite;
},
"core/actor.js": function(__r, __exports){
const { hex } = __r("core/color.js");
const HERO = [
"....kkkkk...",
"..kkhhhhhk..",
".khhhhhhhhk.",
".khhhhhhhhhk",
".khhssssshhk",
".khsessesshk",
".khsessesshk",
"..ksssssssk.",
"...kkSSSkk..",
"..kttttttk..",
".kttTttTttk.",
".ksttTTttsk.",
".kstttttttk.",
"..kbbbbbbk..",
"..kppkkppk..",
"..kppk.kppk.",
"..kppk.kppk.",
"..koook.kook",
"..kkkkk.kkkk",
];
const HERO_PAL = {
k: "#17121f", h: "#7a4128", s: "#f3c49d", S: "#c98b6c", e: "#17121f",
t: "#5f6f94", T: "#46536f", b: "#8a5a32", p: "#38334a", o: "#6a4030",
H: "#a35d34", w: "#ffffff", m: "#a3564a", g: "#e8c060", L: "#7f90b6", O: "#8f5a3f", P: "#4b4560",
c: "#f53cd1", C: "#ff8fe6", D: "#a31f8a",
};
const DUMMY_PAL = {
k: "#0e0c14", A: "#e4e6ec", B: "#b6b9c3", C: "#868995", D: "#5c5e6a", E: "#6e707c", F: "#4b4d58", G: "#34353f", J: "#2a2b33", m: "#f53cd1",
};
const HERO2 = [
"...........kkk..........",
"..........kAABk.........",
".........kAAABJk........",
".........kABBJJk........",
".........kBBBJCDk.......",
".........kBCJDDDk.......",
".........kkJJJDk........",
".......kkkkABBJCkk......",
"......kAABCJBCCCkDk.....",
"......kABBCJCCCmDkDk....",
"......kBBCDDJCDDDkDk....",
"......kABCDJDDDDDkk.....",
".....kAABDkDDDDJkk......",
".....kABCDkDDJJGkk......",
".....kABCkJJJGGGkk......",
"....kJJCDkFFFGGGk.......",
"....kAJJDkJJJGGGk.......",
"....kJCJJkABBJGGk.......",
".....kJCCkBBCDJJJk......",
".....kCCCJBBCDJJDk......",
".....kCCCDJCCDkJDDk.....",
"......kCDDJBCDkDDDk.....",
".......kDJJJCDkDDDkk....",
".......kJBCJCDkDDDkk....",
".......kBDJBCDkCDDkk....",
"........kJJBCDkCDDk.....",
"........kBBBCDkCCDDk....",
"........kBBBCDkCCDDk....",
".........kBBCDkJDDDk....",
"........kBJJJJkCJJJk....",
"........kBBCCDkCCDDk....",
"........kBBCDDkCDDk.....",
"........kBBCDkCCDDk.....",
"........kBCCDkCCDDk.....",
"........kBCDDkCDDDk.....",
".......kJBCJkkkDJkkkk...",
".......kAJJAAAAkCCCCCk..",
"........kkkkkkkkkkkkk...",
];
function maskOf(rows, k = 1) {
const h = rows.length * k, w = rows[0].length * k, data = new Uint8Array(w * h);
rows.forEach((r, y) => [...r].forEach((ch, x) => {
if (ch === ".") return;
for (let j = 0; j < k * k; j++) data[(y * k + ((j / k) | 0)) * w + x * k + (j % k)] = 1;
}));
return { w, h, data };
}
const MASKS = { 1: maskOf(HERO, 1), 2: maskOf(HERO2, 1) };
const SPRITES = { 1: HERO, 2: HERO2 };
function pixelsOf(rows, pal) {
const w = rows[0].length, data = new Uint32Array(w * rows.length);
rows.forEach((r, y) => [...r].forEach((ch, x) => (data[y * w + x] = ch === "." ? 0 : hex(pal[ch]))));
return data;
}
const PIXELS = { 1: pixelsOf(HERO, HERO_PAL), 2: pixelsOf(HERO2, DUMMY_PAL) };
function stockActor(k = 1) {
k = k === 2 ? 2 : 1;
const m = MASKS[k], x = -Math.floor(m.w / 2), y = -m.h;
return { mask: m, pixels: PIXELS[k], x, y, w: m.w, h: m.h, k, head: [0, y], chest: [0, k === 2 ? -26 : y + 11], ...(k === 2 ? { eyes: [[13, 3], [15, 3]] } : {}) };
}
function drawActor(p, actor = stockActor(), a = 1) {
if (a > 0) p.sprite(SPRITES[actor.k === 2 ? 2 : 1], actor.k === 2 ? DUMMY_PAL : HERO_PAL, actor.x, actor.y, { a });
}
const actorAlphaOf = (mod, t, o) => (typeof mod.actorAlpha === "function" ? mod.actorAlpha(t, o) : 1);
__exports.HERO = HERO; __exports.HERO2 = HERO2; __exports.HERO_PAL = HERO_PAL; __exports.DUMMY_PAL = DUMMY_PAL; __exports.stockActor = stockActor; __exports.drawActor = drawActor; __exports.actorAlphaOf = actorAlphaOf;
},
"fx/critters/_lib.js": function(__r, __exports){
const { Particles, Rng, hex, clamp, wrap, tileNoise, TAU, WHITE } = __r("core/index.js");
const shift = (t, D, seed = 1) => wrap(t + (seed - 1) * 0.618 * D, D);
function curve(x, list) {
if (x <= list[0][0]) return list[0][1];
for (let i = 1; i < list.length; i++) {
const [x0, v0] = list[i - 1], [x1, v1] = list[i];
if (x <= x1) {
const u = (x - x0) / (x1 - x0 || 1);
return v0 + (v1 - v0) * u * u * (3 - 2 * u);
}
}
return list[list.length - 1][1];
}
const lnoise = (t, D, F, off = 0, seed = 0) => tileNoise((t / D) * F + off, 0.5, F, 0, seed);
const spring = (age, hz, damp) => (age < 0 ? 0 : Math.exp(-age * damp) * Math.cos(age * hz * TAU));
function toss(x, y, vx, vy, age, g, floor = 0) {
const tl = g > 0 ? (-vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * (floor - y)))) / g : Infinity;
if (age < tl) return { x: x + vx * age, y: y + vy * age + 0.5 * g * age * age, vx, vy: vy + g * age, landed: false, at: tl, lx: x + vx * tl };
return { x: x + vx * tl, y: floor, vx: 0, vy: 0, landed: true, at: tl, lx: x + vx * tl };
}
class Grid {
constructor(x0, y0, w, h) {
this.x0 = Math.floor(x0); this.y0 = Math.floor(y0); this.w = w; this.h = h;
this.c = new Uint32Array(w * h);
this.a = new Float32Array(w * h);
this.tag = new Uint8Array(w * h);
this.o = { a: 1, t: 0 };
}
idx(x, y) {
const ix = Math.floor(x) - this.x0, iy = Math.floor(y) - this.y0;
return ix < 0 || iy < 0 || ix >= this.w || iy >= this.h ? -1 : iy * this.w + ix;
}
set(x, y, c, a = 1, tag = 0) {
const i = this.idx(x, y);
if (i >= 0 && c) (this.c[i] = c), (this.a[i] = a), (this.tag[i] = tag);
}
get(x, y) {
const i = this.idx(x, y);
return i < 0 ? 0 : this.c[i];
}
tagAt(x, y) {
const i = this.idx(x, y);
return i < 0 ? 0 : this.tag[i];
}
erase(x, y) {
const i = this.idx(x, y);
if (i >= 0) this.c[i] = 0;
}
shade(x0, y0, x1, y1, fn) {
const o = this.o;
for (let y = Math.floor(y0); y <= Math.floor(y1); y++)
for (let x = Math.floor(x0); x <= Math.floor(x1); x++) {
o.a = 1; o.t = 0;
const c = fn(x + 0.5, y + 0.5, o);
if (c) this.set(x, y, c, o.a, o.t);
}
}
ellipse(cx, cy, rx, ry, c, a = 1) {
if (rx <= 0 || ry <= 0) return;
this.shade(cx - rx, cy - ry, cx + rx, cy + ry, (x, y, o) => {
const nx = (x - cx) / rx, ny = (y - cy) / ry;
if (nx * nx + ny * ny > 1) return 0;
o.a = a;
return typeof c === "function" ? c(nx, ny) : c;
});
}
line(x0, y0, x1, y1, c, a = 1) {
const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, typeof c === "function" ? c(i / n) : c, a);
}
tube(pts, r, c, a = 1) {
for (let k = 1; k < pts.length; k++) {
const [ax, ay] = pts[k - 1], [bx, by] = pts[k], L = Math.max(1, Math.hypot(bx - ax, by - ay));
for (let s = 0; s <= L; s += 0.5) {
const u = (k - 1 + s / L) / (pts.length - 1), rr = typeof r === "function" ? r(u) : r;
const x = ax + ((bx - ax) * s) / L, y = ay + ((by - ay) * s) / L;
if (rr < 0.75) {
this.set(x, y, typeof c === "function" ? c(u, 0) : c, a);
continue;
}
this.shade(x - rr, y - rr, x + rr, y + rr, (px, py, o) => {
const d = Math.hypot(px - x, py - y) / rr;
o.a = a;
return d > 1 ? 0 : typeof c === "function" ? c(u, d) : c;
});
}
}
}
poly(pts, c, a = 1) {
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
for (const [x, y] of pts) (x0 = Math.min(x0, x)), (x1 = Math.max(x1, x)), (y0 = Math.min(y0, y)), (y1 = Math.max(y1, y));
const n = pts.length;
this.shade(x0, y0, x1, y1, (x, y, o) => {
let inside = false;
for (let i = 0, j = n - 1; i < n; j = i++) {
const [xi, yi] = pts[i], [xj, yj] = pts[j];
if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
}
o.a = a;
return inside ? (typeof c === "function" ? c(x, y) : c) : 0;
});
}
sprite(rows, pal, X, Y, { ax = 0, ay = 0, sx = 1, sy = 1, rot = 0, flip = false } = {}) {
const H = rows.length, W = rows[0].length, cache = {};
const col = (ch) => (ch in cache ? cache[ch] : (cache[ch] = pal[ch] === undefined ? 0 : hex(pal[ch])));
if (sx === 1 && sy === 1 && rot === 0) {
for (let r = 0; r < H; r++)
for (let q = 0; q < W; q++) {
const ch = rows[r][flip ? W - 1 - q : q];
if (ch === "." || ch === " ") continue;
const c = col(ch);
if (c) this.set(Math.round(X - (flip ? W - 1 - ax : ax)) + q, Math.round(Y - ay) + r, c);
}
return;
}
const cs = Math.cos(rot), sn = Math.sin(rot);
const R = Math.hypot(Math.max(ax, W - ax) * Math.abs(sx), Math.max(ay, H - ay) * Math.abs(sy)) + 1;
this.shade(X - R, Y - R, X + R, Y + R, (x, y) => {
const dx = x - X, dy = y - Y, u = (dx * cs + dy * sn) / sx, v = (-dx * sn + dy * cs) / sy;
let q = Math.floor(ax + u), r = Math.floor(ay + v);
if (q < 0 || r < 0 || q >= W || r >= H) return 0;
if (flip) q = W - 1 - q;
const ch = rows[r][q];
return ch === "." || ch === " " ? 0 : col(ch);
});
}
depths(max = 4) {
const { w, h, c } = this, d = new Uint8Array(w * h), q = [];
for (let i = 0; i < w * h; i++) {
if (!c[i]) continue;
const x = i % w, y = (i / w) | 0;
if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !c[i - 1] || !c[i + 1] || !c[i - w] || !c[i + w]) (d[i] = 1), q.push(i);
}
for (let k = 0; k < q.length; k++) {
const i = q[k], v = d[i];
if (v >= max) continue;
for (const j of [i - 1, i + 1, i - w, i + w]) if (j >= 0 && j < w * h && c[j] && !d[j]) (d[j] = v + 1), q.push(j);
}
for (let i = 0; i < w * h; i++) if (c[i] && !d[i]) d[i] = max;
this.d = d;
return d;
}
depth(x, y) {
const i = this.idx(x, y);
return i < 0 || !this.d ? 0 : this.d[i];
}
outline(c, a = 1) {
const src = this.c.slice(), w = this.w, h = this.h, fn = typeof c === "function";
for (let y = 0; y < h; y++)
for (let x = 0; x < w; x++) {
const i = y * w + x;
if (src[i]) continue;
const l = x > 0 && src[i - 1], r = x < w - 1 && src[i + 1], u = y > 0 && src[i - w], d = y < h - 1 && src[i + w];
if (!(l || r || u || d)) continue;
const col = fn ? c(this.x0 + x, this.y0 + y, (l ? 1 : 0) - (r ? 1 : 0), (u ? 1 : 0) - (d ? 1 : 0)) : c;
if (col) (this.c[i] = col), (this.a[i] = a), (this.tag[i] = 255);
}
}
recolor(fn) {
for (let i = 0; i < this.w * this.h; i++) {
if (!this.c[i]) continue;
this.c[i] = fn(this.x0 + (i % this.w), this.y0 + ((i / this.w) | 0), this.c[i], this.a[i], this.tag[i]) || 0;
}
}
draw(p, fade = 1, dx = 0, dy = 0) {
const X = this.x0 + Math.round(dx), Y = this.y0 + Math.round(dy);
for (let y = 0; y < this.h; y++)
for (let x = 0; x < this.w; x++) {
const i = y * this.w + x, c = this.c[i];
if (!c) continue;
const a = this.a[i];
if (a >= 0.999) p.dot(X + x, Y + y, c, fade);
else p.blend(X + x, Y + y, c, a * fade);
}
}
clear() {
this.c.fill(0);
this.tag.fill(0);
this.d = null;
return this;
}
}
class Swarm {
constructor(opts = {}) {
this.ps = new Particles({ rng: new Rng(1), ...opts });
}
begin(t) {
this.ps.list.length = 0;
this.ps.t = t;
return this;
}
add(k, x, y, vx, vy, age, life, col = WHITE, size = 1, flag = 0, seed = 0) {
if (age < 0 || age >= life) return;
this.ps.list.push({ k, x, y, vx, vy, life: life - age, max: life, col: col ? hex(col) : 0, size, seed, delay: 0, flag });
}
draw(p, layer) {
this.ps.draw(p, layer);
}
}
const LAYERS = [[1, 1, 6], [0.76, 0.86, 4], [0.54, 0.68, 2], [0.3, 0.42, 0]];
function tongue(p, x, y, h, w, sx, t, D, n, heat, only = -1) {
if (h < 1) return;
const F1 = Math.max(1, Math.round(9 * D)), F2 = Math.max(1, Math.round(4 * D));
for (let li = 0; li < LAYERS.length; li++) {
if (only >= 0 && li !== only) continue;
const [lw, lh, ri] = LAYERS[li];
const H = h * lh, col = heat[ri];
for (let r = 0; r <= H; r++) {
const u = r / Math.max(1, H);
const half = w * lw * Math.pow(1 - u, 0.85) * Math.min(1, (r + 1.5) / 3.5) + lnoise(t, D, F1, r * 0.45, n) * 0.5;
const cx = x + sx * u * u * lh + lnoise(t, D, F2, r * 0.2, n + 7) * u * 1.1;
if (half < 0.3) continue;
for (let px = Math.round(cx - half); px <= Math.round(cx + half); px++) p.px(px, Math.round(y - r), col);
}
}
}
function firePuff(p, x, y, k, size, seed, heat) {
const age = 1 - k, n = heat.length, hot = Math.min(0.999, Math.pow(age, 0.62) + (seed % 1) * 0.1);
const idx = Math.min(n - 2, Math.floor(hot * (n - 1)));
const r = size * (0.55 + 0.45 * Math.min(1, age * 7)) * (1 - age * 0.55), c = heat[idx];
if (idx >= n - 2) return p.disc(x, y, r, c, Math.min(1, k * 3) * 0.85);
p.circle(x, y, r, heat[Math.min(n - 1, idx + 2)]);
p.circle(x - r * 0.16, y - r * 0.22, r * 0.78, c);
if (r > 1.6) p.circle(x, y - r * 0.9, r * 0.42, c);
if (idx <= 3 && r > 1.8) p.circle(x - r * 0.28, y - r * 0.34, r * 0.36, heat[Math.max(0, idx - 1)]);
if (idx < 6) p.glow(x, y, r * 2.4 + 2, c, 0.18 * k);
}
function bubble(p, cx, cy, r, cols, a = 1, wob = 0) {
const [HI, LIT, RIM, SHADE] = cols;
if (r < 0.9) return p.dot(cx, cy, r < 0.7 ? RIM : LIT, a);
if (r < 1.5) {
const px = Math.floor(cx), py = Math.floor(cy);
p.dot(px, py, HI, a); p.dot(px + 1, py, LIT, a); p.dot(px, py + 1, RIM, a); p.dot(px + 1, py + 1, SHADE, a);
p.glow(cx + 0.5, cy + 0.5, 3, LIT, 0.12 * a);
return;
}
const rx = r * (1 + wob), ry = r * (1 - wob);
for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = Math.sqrt(dx * dx + dy * dy) * r;
if (d > r + 0.5) continue;
const l = (-dx - dy) / Math.SQRT2 / Math.max(0.01, d / r);
if (d > r - 0.6) p.dot(x, y, l > 0.45 ? LIT : l < -0.55 ? SHADE : RIM, a);
}
const hx = Math.round(cx - rx * 0.45), hy = Math.round(cy - ry * 0.45);
p.dot(hx, hy, HI, a);
if (r >= 2.5) p.dot(hx + 1, hy, LIT, a), p.dot(hx, hy + 1, LIT, a);
if (r >= 2) p.dot(Math.round(cx + rx * 0.5), Math.round(cy + ry * 0.5), LIT, a);
p.glow(cx, cy, r * 2.4 + 2, RIM, 0.14 * a);
}
function shadow(p, cx, cy, rx, ry, c, a) {
if (rx <= 0 || ry <= 0 || a <= 0) return;
for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
if (d < 1) p.blend(x, y, c, a * (1 - d) ** 0.7);
}
}
function bounce(x, y, vx, vy, age, g, floor = 0, e = 0.45) {
let hops = 0;
for (; hops < 6; hops++) {
const f = toss(x, y, vx, vy, age, g, floor);
if (!f.landed) return { x: f.x, y: f.y, vx: f.vx, vy: f.vy, hops, rest: false };
const vl = vy + g * f.at;
age -= f.at;
x = f.lx; y = floor - 0.01; vx *= 0.7; vy = -vl * e;
if (Math.abs(vy) < 25) break;
}
return { x, y: floor - 0.25, vx: 0, vy: 0, hops, rest: true };
}
__exports.shift = shift; __exports.curve = curve; __exports.lnoise = lnoise; __exports.spring = spring; __exports.toss = toss; __exports.Grid = Grid; __exports.Swarm = Swarm; __exports.tongue = tongue; __exports.firePuff = firePuff; __exports.bubble = bubble; __exports.shadow = shadow; __exports.bounce = bounce;
},
"fx/critters/eyeball.js": function(__r, __exports){
const { fit, hex, mix, clamp, wrap, lerp, ease, rng, TAU } = __r("core/index.js");
const { Grid, shift, shadow, curve } = __r("fx/critters/_lib.js");
const meta = {
name: "Eyeball",
desc: "A bloodshot eyeball floats in its fleshy lids: its glowing iris snaps from one look to the next, it blinks, and its nerve sways behind it as it bobs.",
tags: ["critter", "eyeball", "eye", "monster", "spooky", "float", "loop"],
size: [96, 108],
origin: [48, 100],
duration: 3.2,
loop: true,
fps: 30,
bg: "ground",
options: {
palette: ["#2a1420", "#6a3040", "#b07078", "#dcbcb4", "#f4e9de", "#ffffff"],
flesh: ["#1e0c16", "#4a1a2c", "#7c2c40", "#b04a58", "#e07a80"],
iris: ["#0c2a14", "#1f6a2a", "#3fae3a", "#9be05a", "#e8ffb0"],
hover: 48,
seed: 1,
},
};
const D = meta.duration, GRID = new Grid(-18, -18, 36, 38), NERVE = new Grid(-20, -70, 40, 64), R = 13, VEIN = hex("#c42a3a");
const LOOKS = [[0, 0, 0], [0.55, 4.2, -1.2], [1.15, -4.4, 0.8], [1.95, 1.2, 3.4], [2.5, -2, -3.4], [3.0, 0, 0]];
function look(t) {
let i = LOOKS.length - 1;
while (i > 0 && t < LOOKS[i][0]) i--;
const [t0, x1, y1] = LOOKS[i], [, x0, y0] = LOOKS[(i + LOOKS.length - 1) % LOOKS.length], u = ease.outBack(clamp((t - t0) / 0.08), 2.2);
return [lerp(x0, x1, u), lerp(y0, y1, u)];
}
const lid = (t) => (t > 1.74 && t < 1.92 ? Math.sin(Math.PI * ((t - 1.74) / 0.18)) : 0);
function at(t, hover) {
const a = (t / D) * TAU;
return { x: 1.5 * Math.sin(a), y: -hover - 3 * Math.sin(2 * a + 0.4) };
}
function veins(seed) {
const out = [], r = rng(seed, 77);
for (let i = 0; i < 7; i++) {
let a = (i / 7) * TAU + r.range(-0.3, 0.3), d = R - 0.5;
const pts = [[Math.cos(a) * d, Math.sin(a) * d]];
for (let k = 0; k < 4; k++) {
a += r.range(-0.35, 0.35);
d -= r.range(1.2, 2.1);
pts.push([Math.cos(a) * d, Math.sin(a) * d]);
}
out.push(pts);
}
return out;
}
function eye(g, C, Fl, I, t, seed) {
g.clear();
const [lx, ly] = look(t), L = lid(t), V = veins(seed);
const lit = (x, y, k) => Math.hypot(-4 + (x + 4) / k, -4.5 + (y + 4.5) / k) <= R;
g.shade(-R, -R, R, R, (x, y) => {
const d = Math.hypot(x, y);
if (d > R) return 0;
if (!(Math.hypot(x + 2, y + 2.2) <= R)) return C[2];
return lit(x, y, 0.5) ? C[5] : lit(x, y, 0.8) ? C[4] : C[3];
});
for (const pts of V) {
const sh = pts.map(([x, y]) => [x + lx * 0.35 * (1 - Math.hypot(x, y) / R), y + ly * 0.35 * (1 - Math.hypot(x, y) / R)]);
for (let k = 1; k < sh.length; k++) g.line(sh[k - 1][0], sh[k - 1][1], sh[k][0], sh[k][1], k < 2 ? VEIN : mix(VEIN, C[3], 0.45));
}
const off = Math.hypot(lx, ly), fx = 1 - 0.32 * (Math.abs(lx) / R) ** 1.4 * 3, fy = 1 - 0.32 * (Math.abs(ly) / R) ** 1.4 * 3;
const ir = 6.4, pr = 2 + 0.4 * Math.sin((t / D) * TAU * 2);
g.shade(lx - ir - 1, ly - ir - 1, lx + ir + 1, ly + ir + 1, (x, y) => {
const dx = (x - lx) / (ir * fx), dy = (y - ly) / (ir * fy), d = Math.hypot(dx, dy);
if (d > 1 || Math.hypot(x, y) > R - 0.5) return 0;
const pd = Math.hypot((x - lx) / fx, (y - ly) / fy);
if (pd < pr) return C[0];
if (d > 0.86) return I[0];
const ang = Math.atan2(dy, dx), streak = Math.sin(ang * 9 + d * 4) > 0.5;
if (d < 0.5) return streak ? I[4] : I[3];
if (d < 0.7) return streak ? I[3] : I[2];
return streak ? I[2] : I[1];
});
if (L < 0.5) g.set(-4, -5, C[5]), g.set(-3, -5, C[5]), g.set(-4, -4, C[5]), g.set(1, -2, C[5]);
const up = lerp(-R + 3, R * 0.42, L), dn = lerp(R - 2.2, R * 0.42, L);
const flit = (x, y, k) => Math.hypot(-4 + (x + 4) / k, -5 + (y + 5) / k) <= R + 0.6;
g.shade(-R - 1, -R - 1, R + 1, R + 1, (x, y) => {
const d = Math.hypot(x, y);
if (d > R + 0.6) return 0;
const ue = up + 1.8 * (x / R) ** 2, de = dn - 1.4 * (x / R) ** 2;
const tone = !(Math.hypot(x + 2, y + 2.2) <= R + 0.6) ? Fl[1] : flit(x, y, 0.55) ? Fl[4] : flit(x, y, 0.85) ? Fl[3] : Fl[2];
if (y < ue) return y > ue - 1.2 ? Fl[0] : tone;
if (y > de) return y < de + 1.1 ? Fl[0] : tone === Fl[4] ? Fl[3] : tone;
return 0;
});
g.outline(C[0]);
}
function draw(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 6), Fl = fit(o.flesh, 5), I = fit(o.iris, 5), S = at(t, o.hover);
const ng = NERVE.clear();
for (let s = 0; s <= 20; s += 0.5) {
const B = at(t - s * 0.035, o.hover), sw = 2.6 * (s / 20) ** 1.3 * Math.sin((t / D) * TAU * 2 - s * 0.16), r = lerp(2, 0.6, s / 20);
const cx = B.x + 1 + sw, cy = B.y + R - 2 + s;
ng.shade(cx - r - 1, cy - 1, cx + r + 1, cy + 1, (x, y) => {
const v = (x - cx) / Math.max(0.6, r);
if (Math.abs(v) > 1 || Math.abs(y - cy) > 0.5) return 0;
return v < -0.35 ? Fl[4] : v < 0.4 ? Fl[3] : Fl[2];
});
}
ng.outline(Fl[0]);
ng.draw(p);
const g = GRID;
eye(g, C, Fl, I, t, o.seed);
g.draw(p, 1, S.x, S.y);
const [lx, ly] = look(t), snap = Math.max(...LOOKS.map(([t0]) => Math.max(0, 1 - Math.abs(wrap(t - t0 + D / 2, D) - D / 2) / 0.2)));
const open = 1 - lid(t);
p.glow(S.x + lx, S.y + ly, 15, I[3], (0.5 + 0.3 * snap) * open);
p.glow(S.x + lx, S.y + ly, 5, I[4], 0.4 * open);
p.glow(S.x, S.y, 50, I[1], 0.3);
for (let i = 0; i < 8; i++) {
const sp = (i % 2 ? 1 : -1) * (i % 3 ? 1 : 2), a0 = (i * TAU) / 8, rr = 19 + (i % 3) * 2;
let prev = null;
for (let k = 5; k >= 0; k--) {
const a = (t / D) * TAU * sp + a0 - sp * k * 0.035, z = Math.sin(a), x = S.x + Math.cos(a) * rr, y = S.y + z * 5 - Math.cos(a) * 3;
if (z < 0 && Math.hypot(x - S.x, y - S.y) < R + 1) {
prev = null;
continue;
}
if (prev && k > 0) p.line(prev[0], prev[1], x, y, I[2], 0.4 + (5 - k) * 0.12);
if (k === 0) p.px(x, y, z > 0 ? I[4] : I[3]), p.glow(x, y, 5, I[3], 0.45);
prev = [x, y];
}
}
}
function drawBack(p, time, o) {
const t = shift(time, D, o.seed), I = fit(o.iris, 5), S = at(t, o.hover);
shadow(p, S.x, 0, 10, 1.5, hex("#0d0a12"), 0.5);
for (let x = -26; x <= 26; x += 6) p.glow(S.x + x, -1, 18, I[2], 0.15 * (1 - Math.abs(x) / 34));
}
__exports.meta = meta; __exports.draw = draw; __exports.drawBack = drawBack;
},
"fx/critters/bat.js": function(__r, __exports){
const { fit, hex, mix, clamp, wrap, lerp, sparkle, cycle, TAU } = __r("core/index.js");
const { Grid, shift } = __r("fx/critters/_lib.js");
const meta = {
name: "Bat",
desc: "A bat flaps in four snappy wing frames along a figure-eight, its body lifting on each downbeat, moonlight on its wing bones, red eyes glowing and glinting.",
tags: ["critter", "bat", "night", "flying", "spooky", "loop"],
size: [112, 80],
origin: [56, 40],
duration: 2.4,
loop: true,
fps: 30,
bg: "sky",
options: { palette: ["#0c0912", "#1f1629", "#382645", "#5b3f66", "#866089", "#b88fb0", "#e8cfe0"], eyes: ["#8a1020", "#ff3b30", "#ffb04a", "#fff0c0"], seed: 1 },
};
const D = meta.duration, FLAPS = 6, GRID = new Grid(-24, -22, 48, 40);
const FRAMES = [
{ arm: -58, al: 8, f: [-112, -76, -38], fl: [9, 11, 9], lift: 1 },
{ arm: -18, al: 9, f: [-40, -12, 16], fl: [10, 11, 9], lift: 0 },
{ arm: 28, al: 8, f: [50, 72, 94], fl: [9, 10, 8], lift: -2 },
{ arm: -42, al: 6, f: [-66, -38, -10], fl: [7, 8, 6], lift: -1 },
];
const rad = (d) => (d * Math.PI) / 180;
function at(t) {
const a = (t / D) * TAU;
return { x: 22 * Math.sin(a), y: 7 * Math.sin(2 * a), vx: Math.cos(a) };
}
const frameAt = (t) => Math.floor(wrap((t / D) * FLAPS, 1) * 4) % 4;
function wingPts(F, s) {
const sh = [s * 2.5, -2], ar = rad(F.arm), wr = [sh[0] + s * Math.cos(ar) * F.al, sh[1] + Math.sin(ar) * F.al];
const tips = F.f.map((d, i) => [wr[0] + s * Math.cos(rad(d)) * F.fl[i], wr[1] + Math.sin(rad(d)) * F.fl[i]]);
const pull = (a, b, k) => [lerp((a[0] + b[0]) / 2, wr[0], k), lerp((a[1] + b[1]) / 2, wr[1], k)];
const hip = [s * 2, 3.5];
return { sh, wr, tips, hip, poly: [sh, wr, tips[0], pull(tips[0], tips[1], 0.22), tips[1], pull(tips[1], tips[2], 0.22), tips[2], pull(tips[2], hip, 0.38), hip] };
}
function bat(g, C, E, F, t) {
g.clear();
for (const s of [-1, 1]) {
const w = wingPts(F, s), lead = (x, y) => {
const [ax, ay] = w.wr, [bx, by] = w.tips[0], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
return Math.abs(((x - ax) * dy - (y - ay) * dx) / L);
};
g.poly(w.poly, (x, y) => {
const near = Math.hypot(x - w.sh[0], y - w.sh[1]);
if (lead(x, y) < 1.2 && F.arm < 20) return C[3];
return near < 4.5 ? C[1] : C[2];
});
g.line(w.sh[0], w.sh[1], w.wr[0], w.wr[1], C[4]);
for (const tip of w.tips) g.line(w.wr[0], w.wr[1], tip[0], tip[1], (u) => (u < 0.6 ? C[4] : C[3]));
g.set(w.wr[0], w.wr[1] - 1, C[5]);
}
g.ellipse(0, 0.5, 3.8, 4.8, (nx, ny) => (nx * -0.6 + ny * -0.8 > 0.45 ? C[4] : nx * 0.6 + ny * 0.8 > 0.55 ? C[2] : ny > 0.1 && Math.abs(nx) < 0.5 ? C[4] : C[3]));
for (const s of [-1, 1]) {
g.poly([[s * 0.6, -3.5], [s * 3.6, -9.5], [s * 3.8, -3]], s < 0 ? C[4] : C[3]);
g.line(s * 2.6, -4, s * 3.2, -7.5, C[5]);
}
g.set(-2, -1, E[1]); g.set(1, -1, E[1]);
g.set(-1, 0, C[1]); g.set(0, 0, C[1]);
g.set(-1, 1, C[6]); g.set(0, 1, C[6]);
g.set(-2, 5, C[3]); g.set(1, 5, C[3]);
g.outline(C[0]);
}
function draw(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), E = fit(o.eyes, 4), S = at(t), fi = frameAt(t), F = FRAMES[fi];
const X = Math.round(S.x), Y = Math.round(S.y + F.lift);
for (let k = 2; k <= 16; k++) {
const A = at(t - (k - 1) * 0.022), B2 = at(t - k * 0.022), u = 1 - k / 17;
for (const ex of [-1.5, 1.5]) p.glowLine(A.x + ex, A.y - 0.5, B2.x + ex, B2.y - 0.5, 2.6, E[1], 0.16 * u);
}
cycle(t, D, 9, o.seed * 11 + 1, D, (age, L, r) => {
const x = r.range(-50, 50) + Math.sin(age * 1.1 + r.next() * 6) * 3, y = r.range(-34, 34) + age * r.range(-2, 3);
const tw = Math.sin(age * 2.6 + r.next() * 6), a = Math.min(1, age * 2, (L - age) * 2) * (0.4 + 0.5 * tw);
p.dot(x, y, tw > 0.7 ? C[6] : C[5], a);
if (tw > 0.5) p.glow(x, y, 3, C[5], 0.2 * a);
});
const g = GRID;
if (fi === 2) {
bat(g, C, E, FRAMES[1], t);
g.recolor((x, y, c) => mix(c, C[4], 0.35));
g.a.fill(0.35);
g.draw(p, 1, X, Y - FRAMES[1].lift + F.lift);
}
bat(g, C, E, F, t);
g.draw(p, 1, X, Y);
p.glow(X - 3, Y - 6, 10, C[5], 0.12);
for (const ex of [-1.5, 1.5]) p.glow(X + ex, Y - 0.5, 7, E[1], 0.6), p.glow(X + ex, Y - 0.5, 2.5, E[2], 0.5);
p.glow(X, Y, 22, E[0], 0.25);
for (const g0 of [0.3, 1.5]) {
const k = (wrap(t - g0, D)) / 0.24;
if (k < 1) sparkle(p, X - 2, Y - 1, 1 + 2.5 * Math.sin(Math.PI * k), E[3], E[2], 0.4 * Math.sin(Math.PI * k));
}
}
__exports.meta = meta; __exports.draw = draw;
},
"fx/critters/ghost.js": function(__r, __exports){
const { fit, clamp, wrap, lerp, rng, cycle, TAU } = __r("core/index.js");
const { Grid, shift, shadow } = __r("fx/critters/_lib.js");
const meta = {
name: "Ghost",
desc: "A sheet ghost bobs over the floor: its scalloped hem ripples and trails its drift, little arms flutter, it glances about and blinks, motes trickle off its hem.",
tags: ["critter", "ghost", "spirit", "undead", "spooky", "float", "loop"],
size: [96, 100],
origin: [48, 90],
duration: 2.4,
loop: true,
fps: 30,
bg: "ground",
options: { palette: ["#10142a", "#232c52", "#3e4f86", "#6b84bb", "#a3b8e2", "#d8e4ff", "#ffffff"], hover: 14, seed: 1 },
};
const D = meta.duration, GRID = new Grid(-20, -40, 40, 46), R = 10.5;
function at(t, hover) {
const a = (t / D) * TAU;
return { x: 4 * Math.sin(a), y: -hover - 3 * Math.sin(2 * a + 0.8) };
}
function halfW(h) {
const top = 2 * R + 9;
if (h > top || h < -1) return -1;
if (h > top - R) return Math.sqrt(Math.max(0, R * R - (h - (top - R)) ** 2));
return lerp(R + 2.2, R, (h / (top - R)) ** 0.7);
}
function sheet(g, C, t, o, lagX) {
g.clear();
const top = 2 * R + 9, ph = (t / D) * TAU * 2, NL = 4, HW = R + 2.2, LW = (2 * HW) / NL;
const off = (h) => lagX * (1 - clamp(h / top)) ** 1.4;
const lobe = (X) => {
const j = clamp(Math.floor((X + HW) / LW), 0, NL - 1), c = -HW + (j + 0.5) * LW, u = (X - c) / (LW / 2);
return { j, u, d: (2.2 + 1.1 * Math.sin(ph - j * 1.5)) * Math.sqrt(Math.max(0, 1 - u * u)) };
};
const inside = (x, y) => {
const h = -y, X = x - off(h);
if (h < 0 && -h > lobe(X).d) return false;
const hw = halfW(Math.max(0, h));
return hw >= 0 && Math.abs(X) <= hw;
};
const arm = (x, y) => {
for (const s of [-1, 1]) {
const ax = s * (R + 1.2) + off(13), ay = -13 + 1.6 * Math.sin(ph + s * 1.3);
if (((x - ax) / 3) ** 2 + ((y - ay) / 2.2) ** 2 <= 1) return true;
}
return false;
};
const any = (x, y) => inside(x, y) || arm(x, y);
const lx = -9, ly = -top - 1;
const lit = (x, y, k) => any(lx + (x - lx) / k, ly + (y - ly) / k);
g.shade(-19, -top - 2, 19, 5, (x, y, o2) => {
if (!any(x, y)) return 0;
const h = -y, X = x - off(h);
let i = lit(x, y, 0.62) ? 5 : 4;
if (!any(x + 2.4, y + 1.8)) i = 3;
if (!any(x + 1.2, y + 1) && X > 2) i = 2;
if (h > top - R - 2 && X < 1 && !any(x - 1.5, y - 1.5) && any(x - 0.6, y - 0.6)) i = 6;
if (h < 1) {
const L = lobe(X);
if (L.u > 0.1 || -h > L.d - 1.2) i = Math.min(i, 3);
}
if (h < 7 && h >= -0.5) {
for (let j = 1; j < NL; j++) {
const cx = -HW + j * LW + 0.6 * Math.sin(ph - j), w = (7 - h) * 0.09;
if (Math.abs(X - cx) <= w + 0.3) i = Math.min(i, 3);
else if (cx - X > w + 0.3 && cx - X < w + 1.3 && i === 4) i = 5;
}
}
o2.a = h < 2 ? 0.86 : 0.95;
return C[i];
});
return { inside, off, top };
}
function draw(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = at(t, o.hover), lagX = at(t - 0.3, o.hover).x - S.x;
const g = GRID;
const sh = sheet(g, C, t, o, lagX), top = sh.top;
const look = wrap(t, D) < 0.7 ? 0 : wrap(t, D) < 1.3 ? 1 : wrap(t, D) < 1.9 ? -1 : 0, blink = wrap(t, D) > 1.95 && wrap(t, D) < 2.03;
const ey = -top + R - 1, mo = 0.5 + 0.5 * Math.sin((t / D) * TAU * 2);
for (const s of [-1, 1]) {
const ex = s * 4 - (s > 0 ? 1 : 0) + look;
if (blink) g.set(ex, ey + 2, C[1]), g.set(ex + 1, ey + 2, C[1]);
else {
for (let k = 0; k < 4; k++) g.set(ex, ey + k, C[0]), g.set(ex + 1, ey + k, C[0]);
g.set(ex + (look < 0 ? 0 : 1), ey, C[2]);
}
}
const my = ey + 6;
g.set(look - 1, my, C[1]); g.set(look, my, C[1]);
if (mo > 0.4) g.set(look - 1, my + 1, C[0]), g.set(look, my + 1, C[0]);
g.outline((x, y, nx, ny) => (ny > 0 ? C[2] : C[1]), 0.95);
g.draw(p, 1, S.x, S.y);
cycle(t, D, 12, o.seed * 3 + 1, (r) => r.range(1, 1.7), (age, L, r, i) => {
const S0 = at(wrap(t - age, D), o.hover), k = age / L, x0 = S0.x + r.range(-10, 10), y0 = S0.y + 1.5;
const x = x0 + Math.sin(age * 2.2 + i) * 2.4, y = y0 + r.range(5, 11) * age - 3 * age * age;
const a = Math.min(1, k * 6) * Math.min(1, (1 - k) * 2.2), tw = 0.6 + 0.4 * Math.sin(age * 8 + i * 1.7);
p.dot(x, y, tw > 0.8 ? C[6] : C[5], a);
if (r.chance(0.3)) p.dot(x, y - 1, C[4], a * 0.7);
p.glow(x, y, 7, C[4], 0.42 * a * tw);
});
p.glow(S.x, S.y - top * 0.55, 54, C[3], 0.3);
p.glow(S.x - 3, S.y - top * 0.72, 14, C[5], 0.12);
}
function drawBack(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = at(t, o.hover), hgt = clamp((-S.y - 8) / 16);
shadow(p, S.x, 0, 11 - 3 * hgt, 1.6, C[0], 0.55 - 0.2 * hgt);
for (let x = -24; x <= 24; x += 6) p.glow(S.x + x, -1, 16, C[4], 0.14 * (1 - Math.abs(x) / 34) * (1 - 0.4 * hgt));
}
__exports.meta = meta; __exports.draw = draw; __exports.drawBack = drawBack;
},
"fx/critters/wisp.js": function(__r, __exports){
const { fit, clamp, wrap, lerp, cycle, fly, P, TAU } = __r("core/index.js");
const { Swarm, shift, lnoise, tongue, firePuff, shadow } = __r("fx/critters/_lib.js");
const meta = {
name: "Wisp",
desc: "A will-o'-the-wisp loops a figure-eight over the floor: a little soul-flame with a face, its flame tail licking up and streaming behind, shedding puffs and sparks.",
tags: ["critter", "wisp", "spirit", "flame", "magic", "flying", "loop"],
size: [128, 104],
origin: [64, 96],
duration: 3.2,
loop: true,
fps: 30,
bg: "ground",
options: { palette: ["#0a1f2e", "#0f3d52", "#14707e", "#1fa8a8", "#4fe0c8", "#a8fff0", "#ffffff"], hover: 36, seed: 1 },
};
const D = meta.duration, SWARM = new Swarm();
function at(t, hover) {
const a = (t / D) * TAU;
return { x: 34 * Math.sin(a), y: -hover - 10 * Math.sin(2 * a), vx: ((34 * TAU) / D) * Math.cos(a), vy: ((-20 * TAU) / D) * Math.cos(2 * a) };
}
function draw(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = at(t, o.hover);
const heat = [C[6], C[6], C[5], C[5], C[4], C[4], C[3], C[3], C[3]];
const lean = clamp(-S.vx / 80, -0.9, 0.9), stretch = clamp(S.vy / 120, -0.3, 0.4), X = S.x, Y = S.y;
cycle(t, D, 30, o.seed * 7 + 1, (r) => r.range(0.3, 0.6), (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), [x, y] = fly(S0.x + r.range(-3, 3), S0.y - r.range(0, 4), r.range(-8, 8), -r.range(6, 16), age, -40, 2.5);
firePuff(p, x, y, 1 - age / L, r.range(1.2, 2.6), r.next() * 100, heat);
});
const tails = [[-3.5, 13, 2.5, 3], [3.5, 14, 2.5, 7], [0, 20, 3.2, 11]];
for (let li = 0; li < 4; li++)
for (const [dx, h, w, n] of tails) {
const hh = (h + 0.25 * h * lnoise(t, D, 9, n, 5)) * (1 + stretch);
tongue(p, X + dx, Y - 2, hh, w, lnoise(t, D, 6, n, 40) * 1.5 + lean * hh * 0.9, t, D, n, heat, li);
}
const R = 7.5;
p.shade(X - R - 2, Y - R - 2, X + R + 2, Y + R + 2, (x, y, out) => {
const dx = x - X, dy = y - Y, ang = Math.atan2(dy, dx), rr = R + 0.7 * lnoise(t, D, 16, ang * 1.6 + 10, 3) + (dy > 0 ? -0.6 : 0);
const d = Math.hypot(dx, dy) / rr;
if (d > 1) return 0;
return d < 0.42 ? C[6] : d < 0.68 ? C[5] : d < 0.88 ? C[4] : C[3];
});
const look = Math.round(clamp(S.vx / 60, -1, 1)), blink = wrap(t, D) > 2.2 && wrap(t, D) < 2.28;
for (const s of [-1, 1]) {
const ex = Math.round(X) + s * 2 - (s > 0 ? 0 : 1) + look, ey = Math.round(Y) - 1;
if (blink) p.px(ex, ey + 1, C[1]), p.px(ex + 1, ey + 1, C[1]);
else {
for (let k = 0; k < 3; k++) p.px(ex, ey + k, C[1]), p.px(ex + 1, ey + k, C[1]);
p.px(ex + (look > 0 ? 1 : 0), ey, C[6]);
}
}
p.px(Math.round(X) + look, Math.round(Y) + 3, C[2]); p.px(Math.round(X) - 1 + look, Math.round(Y) + 3, C[2]);
const sw = SWARM.begin(t);
sw.ps.sparks = [C[6], C[5], C[4], C[3]];
cycle(t, D, 26, o.seed * 7 + 2, (r) => r.range(0.8, 1.6), (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), s = r.next() * 100, [x, y] = fly(S0.x + r.range(-5, 5), S0.y - r.range(4, 12), r.range(-20, 20), -r.range(20, 45), age, -15, 1.6);
sw.add(P.EMBER, x + Math.sin(age * 2.3 + s) * 3 * Math.min(1, age), y, 0, 0, age, L, C[4], r.chance(0.3) ? 2 : 1, 0, s);
});
sw.draw(p);
const fl = 0.85 + 0.15 * lnoise(t, D, 22, 0, 9);
p.glow(X + lean * 3, Y - 6, 46 * fl, C[4], 0.38);
p.glow(X, Y - 1, 13, C[5], 0.35 * fl);
}
function drawBack(p, time, o) {
const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = at(t, o.hover), near = clamp(1 - (-S.y - 24) / 30);
shadow(p, S.x, 0, 7, 1.2, C[0], 0.4);
for (let x = -24; x <= 24; x += 6) p.glow(S.x + x, -1, 16, C[4], (0.08 + 0.1 * near) * (1 - Math.abs(x) / 32));
}
__exports.meta = meta; __exports.draw = draw; __exports.drawBack = drawBack;
},
"fx/critters/flying-skull.js": function(__r, __exports){
const { fit, hex, mix, clamp, wrap, lerp, rand, rng, cycle, fly, P, PF, TAU } = __r("core/index.js");
const { Grid, Swarm, shift, lnoise, tongue, firePuff, shadow, bounce } = __r("fx/critters/_lib.js");
const meta = {
name: "Flying skull",
desc: "A cracked bone skull bobs in the air, jaw chattering, eyes burning, a fire roaring off its crown that sheds flame puffs, embers and smoke and throws warm light.",
tags: ["critter", "skull", "undead", "fire", "flying", "monster", "loop"],
size: [96, 132],
origin: [48, 120],
duration: 2.4,
loop: true,
fps: 30,
bg: "ground",
options: {
palette: ["#4a1712", "#8a1f17", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"],
bone: ["#1a1114", "#3e2b2a", "#6b5144", "#9e8467", "#cdb892", "#efe2bf", "#fffaea"],
hover: 40,
floor: true,
seed: 1,
},
};
const D = meta.duration, GRID = new Grid(-14, -20, 28, 40), SOCKET = hex("#120a0c");
const SWARM = new Swarm();
function at(t, hover) {
const a = (t / D) * TAU;
return {
x: 3 * Math.sin(a),
y: -hover + 3 * Math.sin(2 * a + 0.5),
vx: (3 * TAU * Math.cos(a)) / D,
vy: (6 * TAU * Math.cos(2 * a + 0.5)) / D,
};
}
function jaw(t) {
const ch = Math.max(0, Math.sin((t / D) * TAU * 22)), b1 = burst(t, 0.15, 0.75), b2 = burst(t, 1.3, 1.95);
const gape = burst(t, 1.95, 2.3);
return Math.round(Math.max(ch * 2.4 * Math.max(b1, b2), gape * 3.4));
}
const burst = (t, a, b) => (t <= a || t >= b ? 0 : Math.sin(Math.PI * ((t - a) / (b - a))) ** 0.5);
const flick = (t) => 0.74 + 0.16 * lnoise(t, D, 18, 0, 1) + 0.1 * lnoise(t, D, 46, 0, 2);
const inCranium = (x, y) => (x / 11) ** 2 + ((y + 6) / 10.5) ** 2 <= 1;
const inFace = (x, y) => y >= -3 && y <= 6.5 && Math.abs(x) <= lerp(10.2, 7.2, (y + 3) / 9.5);
const inSkull = (x, y) => inCranium(x, y) || inFace(x, y);
const browY = (x) => -6.6 + (8.5 - Math.abs(x)) * 0.3;
const inSocket = (x, y) => ((Math.abs(x) - 5.1) / 3.3) ** 2 + ((y + 2.9) / 3.3) ** 2 <= 1 && y > browY(x);
const NOSE = [[-1, 1], [0, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [-2, 3], [1, 3]];
const CRACK = [[4, -16], [4, -15], [5, -14], [5, -13], [4, -12], [5, -11], [6, -10], [6, -9]];
const topY = (x) => -6 - 10.5 * Math.sqrt(Math.max(0, 1 - (x / 11) ** 2));
function skull(g, B, F, open, t) {
const warm = mix(B[6], F[6], 0.45), rim = mix(B[5], F[5], 0.3);
const lx = -4, ly = -15, lit = (x, y, k) => inSkull(lx + (x - lx) / k, ly + (y - ly) / k);
g.clear();
g.shade(-12, -17, 12, 8, (x, y, o) => {
if (!inSkull(x, y)) return 0;
let c = lit(x, y, 0.45) ? B[5] : lit(x, y, 0.74) ? B[4] : B[3];
if (Math.abs(x) > 8.2 && y > -7 && y < -1) c = x < 0 ? B[3] : B[2];
if (!inSkull(x + 2, y + 2.2) || (x > 0 && !inSkull(x + 2.6, y))) c = B[2];
if (!inSkull(x + 1, y + 1.2) && y > 2) c = B[1];
if (!inSkull(x, y - 1.5)) c = Math.abs(x) < 7 ? warm : rim;
else if (!inSkull(x, y - 2.5) && Math.abs(x) < 6) c = rim;
if (y > browY(x) - 1.2 && y < browY(x) + 0.4 && Math.abs(x) > 1.6 && Math.abs(x) < 8.6) c = x < 0 ? B[4] : B[3];
if (Math.abs(x) > 6.2 && Math.abs(x) < 9.2 && y > 0 && y < 2) c = x < 0 ? B[5] : B[3];
if (y > 6) {
if (Math.abs(x) > 6.4) return 0;
const cx = Math.floor(x), gap = cx === -6 || cx === -3 || cx === 2 || cx === 5;
c = gap ? B[1] : y < 7 ? (x < 0 ? B[5] : B[4]) : cx === -1 || cx === 0 ? B[3] : B[4];
}
return c;
});
g.shade(-9, -7, 9, 1, (x, y) => {
if (!inSocket(x, y)) return 0;
if (!inSocket(x, y + 1.3)) return mix(B[2], F[4], 0.55);
return SOCKET;
});
for (const [x, y] of NOSE) g.set(x, y, y === 3 ? B[1] : SOCKET);
g.set(-1, 3, B[2]); g.set(0, 3, B[2]);
for (const [x, y] of CRACK) g.set(x, y, B[1]), g.set(x - 1, y, B[5]);
g.set(7, -7, B[1]); g.set(8, -6, B[1]);
const jy = 8 + open;
g.shade(-8, 4, 8, jy + 6, (x, y) => {
const ax = Math.abs(x);
if (ax > 6.6 && ax < 8.1 && y > 4 && y < jy + 2) return x < 0 ? B[3] : B[2];
if (y < jy || y > jy + 5.5) return 0;
const v = y - jy, hw = 7.4 - v * 0.45 - (v > 4 ? (v - 4) * 1.2 : 0);
if (ax > hw) return 0;
if (v < 1.5) {
if (ax > 6) return x < 0 ? B[4] : B[3];
const cx = Math.floor(x), gap = cx === -5 || cx === -2 || cx === 1 || cx === 4;
return gap ? B[1] : v < 1 ? B[5] : B[4];
}
return !inJaw(x + 1.6, y + 1.6, jy) ? B[1] : v < 2.5 ? (x < 0 ? B[4] : B[3]) : B[3];
});
if (open > 0) for (let y = 8; y < jy; y++) for (let x = -6; x <= 5; x++) g.set(x, y, y === jy - 1 ? mix(SOCKET, F[3], 0.5) : SOCKET);
g.outline((x, y, nx, ny) => (ny < 0 ? mix(B[0], F[1], 0.75) : B[0]));
}
function inJaw(x, y, jy) {
const v = y - jy, hw = 7.4 - v * 0.45 - (v > 4 ? (v - 4) * 1.2 : 0);
return v >= 0 && v <= 5.5 && Math.abs(x) <= hw;
}
function crown(seed) {
const out = [];
for (let x = -10; x <= 10; x += 2) out.push({ x, h: 13 + 13 * (1 - (x / 11) ** 2), w: 2.3 + rand(x + 20, seed, 3) * 0.8, n: 37 + x * 3 + seed * 11, front: false });
for (const s of [-1, 1]) out.push({ x: s * 11, y: -5, h: 10, w: 1.8, n: 61 + s * 13 + seed * 5, front: false });
for (let x = -5; x <= 5; x += 2.5) out.push({ x, h: 5 + 3 * rand(x * 4 + 20, seed, 5), w: 1.6, n: 91 + x * 5 + seed * 7, front: true });
return out;
}
function height(f, t, k) {
const leap = Math.max(0, lnoise(t, D, 6, f.n * 3.1, 70) - 0.55) * 1.6;
return (f.h + 0.25 * f.h * lnoise(t, D, 8, f.n * 1.7, 5) + f.h * leap) * (0.9 + 0.1 * k);
}
function draw(p, time, o) {
const t = shift(time, D, o.seed), F = fit(o.palette, 9), heat = [...F].reverse(), B = fit(o.bone, 7);
const S = at(t, o.hover), k = flick(t), lean = clamp(-S.vx / 60, -0.8, 0.8), stretch = clamp(S.vy / 90, -0.3, 0.45);
const tongues = crown(o.seed).sort((a, b) => Math.abs(b.x) - Math.abs(a.x));
const X = Math.round(S.x), Y = Math.round(S.y);
const lick = (f) => lnoise(t, D, 5, f.n, 40) * 2 + lean * height(f, t, k) * 0.9 - clamp(f.x * 0.25, -2, 2);
for (let li = 0; li < 4; li++)
for (const f of tongues) if (!f.front) tongue(p, X + f.x, Y + (f.y ?? topY(f.x) + 3), height(f, t, k) * (1 + stretch), f.w * (1 - 0.25 * Math.abs(lean)), lick(f), t, D, f.n, heat, li);
particles(p, t, o, heat, F, true);
const g = GRID;
skull(g, B, F, jaw(t), t);
g.draw(p, 1, X, Y);
for (const s of [-1, 1]) {
const ex = X + s * 5.1 - 0.5, ey = Y - 2.4, fl = 0.75 + 0.25 * lnoise(t, D, 30, s * 9, 12);
p.px(ex, ey, heat[0]); p.px(ex + 1, ey, heat[1]); p.px(ex, ey + 1, heat[2]); p.px(ex + 1, ey + 1, heat[3]);
if (fl > 0.8) p.px(ex, ey - 1, heat[3]), p.px(ex + 1, ey - 1, heat[5]);
p.glow(ex + 1, ey + 1, 6, F[5], 0.45 * fl);
p.glow(ex + 1, ey + 0.5, 3, F[7], 0.5 * fl);
}
const open = jaw(t);
if (open > 0) p.glow(X, Y + 8 + open * 0.5, 4 + open * 2, F[5], 0.25 * open);
for (let i = 0; i < 9; i++) {
const r = rng(o.seed, i, 21), born = 1.98 + i * 0.03, age = wrap(t - born, D), L = r.range(0.25, 0.45);
if (age >= L) continue;
const S0 = at(born, o.hover), [x, y] = fly(S0.x + r.range(-3, 3), S0.y + 11, r.range(-22, 22), r.range(40, 75), age, -70, 3.5);
firePuff(p, x, y, 1 - age / L, r.range(1.1, 2), r.next() * 100, heat);
}
for (let li = 0; li < 4; li++)
for (const f of tongues) if (f.front) tongue(p, X + f.x, Y + topY(f.x) + 1.5, height(f, t, k) * (1 + stretch), f.w, lick(f) * 0.6, t, D, f.n, heat, li);
particles(p, t, o, heat, F, false);
const br = 0.92 + 0.08 * Math.sin((t / D) * TAU * 2);
p.glow(X + lean * 4, Y - 20, 74 * br * (0.9 + 0.1 * k), mix(F[4], F[5], 0.5), 0.48 * k);
p.glow(X, Y - 21, 24, F[6], 0.3 * k);
p.glow(X, Y - 15, 9, F[8], 0.16 * k);
}
function particles(p, t, o, heat, F, back) {
const sw = SWARM.begin(t);
sw.ps.sparks = [F[7], F[6], F[4], F[2]];
if (back) {
cycle(t, D, 15, o.seed * 7 + 1, (r) => r.range(1.7, 2.5), (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), x0 = S0.x + r.range(-6, 6), y0 = S0.y - 22 - r.range(0, 8);
const [x, y] = fly(x0, y0, r.range(-5, 5), -r.range(16, 26), age, -12, 1.2);
sw.add(P.SMOKE, x + Math.sin(age * 1.3 + r.next() * 6) * 3 * age, y, 0, 0, age, L, mix(hex("#5b5566"), F[2], 0.3), r.range(2.8, 4.4), PF.BIG);
});
sw.draw(p);
return;
}
cycle(t, D, 40, o.seed * 7 + 2, (r) => r.range(0.18, 0.36), (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), side = r.chance(0.3), a = side ? r.sign() * r.range(0.9, 1.45) : r.range(-0.8, 0.8);
const x0 = S0.x + Math.sin(a) * 10.5, y0 = S0.y - 6 - Math.cos(a) * 10 - (side ? 0 : r.range(2, 10));
const [x, y] = fly(x0, y0, r.range(-6, 6) + Math.sin(a) * 6, -r.range(18, 34), age, -95, 3.2);
firePuff(p, x + Math.sin(age * 17 + r.next() * 6) * 0.8, y, 1 - age / L, r.range(1, 2.2), r.next() * 100, heat);
});
cycle(t, D, 18, o.seed * 7 + 3, 0.26, (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), fx = r.range(-10, 10), x0 = S0.x + fx, y0 = S0.y + topY(fx) - r.range(4, 16) * (1 - Math.abs(fx) / 14);
const kk = 1 - age / L, x = x0 + r.range(-3, 3) * age, y = y0 - r.range(12, 20) * age, rr = r.range(0.9, 1.7) * (0.4 + 0.6 * kk);
p.circle(x, y, rr + 0.6, kk > 0.5 ? heat[5] : heat[6]);
if (kk > 0.35) p.circle(x, y - 0.3, rr * 0.6, kk > 0.7 ? heat[2] : heat[4]);
});
cycle(t, D, 24, o.seed * 7 + 4, (r) => r.range(1, 2.4), (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), x0 = S0.x + r.range(-11, 11), y0 = S0.y - r.range(6, 24), s = r.next() * 100;
const [x, y] = fly(x0, y0, r.range(-22, 22), -r.range(25, 70), age, -20, 1.6);
sw.add(P.EMBER, x + Math.sin(age * 2.3 + s) * 4 * Math.min(1, age), y, 0, 0, age, L, F[4], r.chance(0.3) ? 2 : 1, 0, s);
});
if (o.floor)
cycle(t, D, 5, o.seed * 7 + 5, (r) => r.range(0.9, 1.4), (age, L, r) => {
const S0 = at(wrap(t - age, D), o.hover), b = bounce(S0.x + r.range(-6, 6), S0.y - r.range(10, 18), r.range(-28, 28), -r.range(50, 110), age, 430, -0.5, 0.42);
sw.add(P.SPARK, b.x, b.y, b.rest ? 0.1 : b.vx, b.rest ? 0 : b.vy, age, L, 0, 1, 0, r.next() * 100);
});
sw.draw(p);
}
function drawBack(p, time, o) {
if (!o.floor) return;
const t = shift(time, D, o.seed), F = fit(o.palette, 9), S = at(t, o.hover), k = flick(t);
shadow(p, S.x, 0, 9, 1.6, hex("#0d0a12"), 0.6);
for (let x = -30; x <= 30; x += 6) p.glow(S.x + x, -1, 20, mix(F[4], F[5], 0.5), 0.15 * k * (1 - Math.abs(x) / 40));
}
__exports.meta = meta; __exports.draw = draw; __exports.drawBack = drawBack;
},
"fx/explosions/small-explosion.js": function(__r, __exports){
const { Particles, Bits, Lights, Blazes, P, PF, B, Rng, fit, band, clamp, smooth, ease, rand, TAU, WHITE, hex, mix, scale, rgb } = __r("core/index.js");
const meta = {
name: "Explosion",
desc: "A ground blast: a white flash and shock rings, fire that cools into a rolling smoke column, sparks, burning brands that land and keep burning, tumbling rocks and a glowing scorch.",
tags: ["explosion", "fire", "smoke", "debris", "impact", "one-shot"],
size: [300, 240],
origin: [150, 196],
duration: 5.4,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#4a1712", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"], stone: "#4a3f69", size: 1, seed: 7 },
};
const SOOT = hex("#0d0a12"), SOOT2 = hex("#17121d"), OUTLINE = hex("#1a1422"), WARM = rgb(255, 176, 96);
function stone(c) {
c = hex(c);
return { light: mix(scale(c, 1.35), WHITE, 0.08), body: c, shade: scale(c, 0.64), dust: mix(scale(c, 1.2), rgb(150, 140, 150), 0.3) };
}
function scorch(p, F, t, rx0, cool, fade) {
if (fade <= 0) return;
const rx = rx0 * Math.min(1, t / 0.08), ry = 4, heat = [...F].reverse();
for (let y = 0; y <= 2; y++)
for (let x = Math.floor(-rx); x <= Math.ceil(rx); x++) {
const dx = (x + 0.5) / rx, dy = (y + 0.5) / ry, d = Math.sqrt(dx * dx + dy * dy);
if (d > 1) continue;
const k = rand(x * 31 + y, 3), T = Math.pow(clamp(1 - t / cool), 1.4) * (1.25 - d) - k * 0.35;
if (T > 0.06) {
const c = heat[Math.min(heat.length - 1, Math.floor((1 - Math.min(1, T)) * (heat.length - 1)))];
p.dot(x, y, c, fade);
if ((x & 3) === 0) p.glow(x + 0.5, y, 6, c, 0.18 * T * fade);
} else p.dot(x, y, d < 0.5 ? SOOT : SOOT2, (d < 0.95 - k * 0.3 ? 1 : 1 - d) * fade);
}
}
function rock(p, b, st) {
const r = 0.6 + b.s * 0.75, fade = Math.min(1, b.life / 0.5), lx = Math.cos(b.a) * r * 0.4, ly = Math.sin(b.a) * r * 0.4;
p.shade(b.x - r - 1, b.y - r - 1, b.x + r + 1, b.y + r + 1, (x, y, out) => {
const dx = x - b.x, dy = y - b.y, d = Math.hypot(dx * 1.15, dy);
if (d > r + 0.9) return;
const lit = dx * lx + dy * ly;
out.c = d > r ? OUTLINE : lit < -0.4 ? st.light : lit > 0.6 ? st.shade : st.body;
out.a = fade;
});
}
function create(o) {
const F = fit(o.palette, 8), S = o.size, RAD = 18 * S, POWER = 0.9 * Math.pow(S, 0.8), EARTH = 1.6, st = stone(o.stone);
const R = new Rng(o.seed), floor = () => 0;
let blazes;
const ps = new Particles({ rng: R, ground: floor, sparks: [F[6], F[5], F[3], F[2]], onLand: (x, y) => blazes.add(x, y - 0.25, R.range(0.9, 1.5), R.range(0.55, 0.85)) });
blazes = new Blazes(ps);
const rocks = new Bits({ ground: floor }), lights = new Lights(), flashes = [], rings = [];
const Y = -RAD * 0.3;
let t = 0;
flashes.push({ r: RAD * 1.05, life: 0.06, max: 0.06 });
rings.push({ r0: RAD * 0.45, r1: RAD * 2.7, life: 0.34, max: 0.34, thick: 3, c: F[5] }, { r0: RAD * 0.3, r1: RAD * 1.6, life: 0.22, max: 0.22, thick: 1.8, c: F[3] });
lights.add(0, Y, RAD * 3.4, WARM, 0.6 * POWER, 0.7);
lights.add(0, Y, RAD * 1.6, WHITE, 0.6, 0.08);
for (let i = 0; i < 5; i++) ps.spawn(P.FIRE, R.range(-2.5, 2.5), Y + R.range(-2.5, 2.5), R.range(-20, 20), R.range(-40, -10), R.range(0.18, 0.3), 0, R.range(RAD * 0.4, RAD * 0.55));
for (let i = 0; i < Math.round(28 * POWER); i++) {
const a = R.range(0, TAU), d = R.range(0, RAD * 0.55), sp = R.range(40, 210) * POWER;
ps.spawn(P.FIRE, Math.cos(a) * d, Y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.8 - 40, R.range(0.55, 1.15), 0, R.range(RAD * 0.22, RAD * 0.46), 0, R.chance(0.45) ? PF.SMOKES | PF.BIG : 0);
}
for (let i = 0; i < 5; i++) {
const a = R.range(0, TAU), d = R.range(RAD * 0.1, RAD * 0.5);
ps.spawn(P.SMOKE, Math.cos(a) * d, Y + Math.sin(a) * d, Math.cos(a) * 30, Math.sin(a) * 20 - 30, R.range(0.9, 1.5), rgb(34, 29, 38), R.range(RAD * 0.15, RAD * 0.26), R.range(0.06, 0.2), PF.BIG);
}
for (let i = 0; i < 5; i++) ps.spawn(P.FIRE, R.range(-RAD * 0.25, RAD * 0.25), Y, R.range(-12, 12), R.range(-180, -100), R.range(0.8, 1.3), 0, R.range(RAD * 0.24, RAD * 0.36), R.range(0, 0.1), R.chance(0.6) ? PF.SMOKES | PF.BIG : 0);
for (let i = 0; i < Math.round(10 * POWER); i++) {
const a = R.range(0, TAU), d = R.range(0, RAD * 0.7), sp = R.range(15, 100);
ps.spawn(P.SMOKE, Math.cos(a) * d, Y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.6 - 35, R.range(1.8, 2.8), 0, R.range(RAD * 0.26, RAD * 0.44), R.range(0.12, 0.45), PF.BIG);
}
for (let i = 0; i < Math.round(80 * POWER); i++) {
const a = R.range(0, TAU), sp = R.range(140, 380) * POWER;
ps.spawn(P.SPARK, 0, Y, Math.cos(a) * sp, Math.sin(a) * sp - 70, R.range(0.18, 0.6));
}
for (let i = 0; i < Math.round(40 * POWER); i++) {
const a = R.range(0, TAU), sp = R.range(30, 150);
ps.spawn(P.EMBER, Math.cos(a) * RAD * 0.4, Y + Math.sin(a) * RAD * 0.4, Math.cos(a) * sp, Math.sin(a) * sp - 75, R.range(1.2, 2.6), F[3]);
}
for (let i = 0; i < Math.round(R.range(9, 14) * Math.max(0, POWER - 0.55)); i++) {
const a = -Math.PI / 2 + R.range(-1.35, 1.35), sp = R.range(170, 330);
ps.spawn(P.BRAND, 0, Y, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.7, 1.3));
}
for (let i = 0; i < Math.round(RAD * 0.5); i++) {
const s = R.sign();
ps.spawn(P.SMOKE, s * R.range(0, RAD * 0.6), -R.range(1, 5 + RAD * 0.04), s * R.range(3, 9.5) * RAD, -R.range(2, 15), R.range(1.1, 2.0), st.dust, R.range(4, 7) + RAD / 6, R.range(0, 0.06), PF.BIG);
}
for (let i = 0; i < 26 * Math.min(1.5, S); i++)
rocks.add({ kind: B.CHUNK, x: R.range(-0.4, 0.4) * RAD, y: -3, vx: R.range(-9, 9) * RAD * 0.25, vy: -R.range(7, 16) * RAD * 0.9, g: 1, drag: 0.4, bounce: 0.3, life: R.range(1.8, 2.6), a: R.range(0, TAU), va: R.range(-16, 16), s: R.int(1, 3) });
for (let i = 0; i < Math.round(EARTH * RAD * 4); i++) {
const u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.5, sp = R.range(5, 15) * RAD * (1 - 0.45 * Math.abs(u));
ps.spawn(P.GRIT, u * 0.25 * RAD, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1.2, 2.2), R.pick([st.light, st.body, st.body, st.shade]), R.chance(0.45) ? 2 : 1);
}
for (let i = 0; i < Math.round(EARTH * 12); i++)
ps.spawn(P.SMOKE, R.range(-0.3, 0.3) * RAD, -R.range(2, RAD * 0.6), R.range(-15, 15), -R.range(60, 190) * EARTH * 0.6, R.range(1.6, 2.6), st.dust, R.range(5, 9) * Math.sqrt(S) + RAD / 7, R.range(0, 0.15), PF.BIG);
return {
update(dt) {
t += dt;
for (const a of [flashes, rings]) for (let i = a.length - 1; i >= 0; i--) if ((a[i].life -= dt) <= 0) a.splice(i, 1);
rocks.update(dt);
for (const b of rocks.list)
if (b.rest && !b.dusted) {
b.dusted = true;
for (let i = 0; i < 3; i++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(10, 55) * 0.6, -R.range(2, 22), R.range(0.3, 0.65), st.dust, R.range(1.3, 2.8));
}
blazes.update(dt);
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
scorch(p, F, t, 22 * S, 1.2 + RAD / 14, 1 - smooth(meta.duration - 1.2, meta.duration - 0.2, t));
ps.draw(p, "back");
blazes.drawBack(p);
const k = t / 0.5;
if (k < 1) band(p, 0, 0.5, 80 * S * ease.outCubic(k), 0.16, Math.max(1, (2 + RAD / 9) * (1 - k)), 1.15 - k, [st.body, st.light, F[3], F[6]], (g) => Math.sin(g) < 0);
},
draw(p) {
const k = t / 0.5;
if (k < 1) band(p, 0, 0.5, 80 * S * ease.outCubic(k), 0.16, Math.max(1, (2 + RAD / 9) * (1 - k)), 1.15 - k, [st.body, st.light, F[3], F[6]], (g) => Math.sin(g) >= 0);
for (const b of rocks.list) rock(p, b, st);
ps.draw(p, "front");
for (const f of flashes) {
const k2 = f.life / f.max, r = f.r * (0.8 + 0.2 * k2);
p.circle(0, Y, r + 1.2, F[2]);
p.circle(0, Y, r, k2 > 0.45 ? F[6] : F[5]);
p.circle(0, Y, r * 0.6, k2 > 0.45 ? WHITE : F[6]);
}
for (const r of rings) {
const k2 = r.life / r.max, e = 1 - Math.pow(k2, 3);
p.ring(0, Y, r.r0 + (r.r1 - r.r0) * e, Math.max(1, r.thick * k2 + 0.4), r.c, Math.min(1, k2 * 1.6));
}
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/explosions/big-explosion.js": function(__r, __exports){
const { Particles, Bits, Lights, Blazes, P, PF, B, Rng, fit, band, flare, smooth, ease, TAU, WHITE, hex, mix } = __r("core/index.js");
const { stone, fireRamp, heatRamp, drawPs, draft, cull, scorch, rock, dome, glowDome, pool, trail, Plume, Column } = __r("fx/explosions/_lib.js");
const meta = {
name: "Big explosion",
desc: "A huge ground blast in three beats: a white dome, a rolling fireball that climbs into a mushrooming smoke column, heavy rocks, and fires left burning.",
tags: ["explosion", "fire", "smoke", "debris", "mushroom", "big", "ground", "one-shot"],
size: [360, 300],
origin: [180, 262],
duration: 7.2,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#4a1712", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"], stone: "#4a3f69", seed: 11 },
};
const RAD = 30, POWER = 1.45, EARTH = 1.6;
const SM = ["#83777f", "#6e6470", "#575060", "#3f3947", "#29242f"].map(hex);
const BLASTS = [
{ t: 0, x: 0, y: -9, rad: RAD, power: POWER, main: true },
{ t: 0.13, x: -17, y: -30, rad: 17, power: 0.9 },
{ t: 0.25, x: 15, y: -46, rad: 15, power: 0.8 },
];
function create(o) {
const F = fit(o.palette, 8), FR = fireRamp(F), HR = heatRamp(FR), st = stone(o.stone), R = new Rng(o.seed), floor = () => 0, WARM = mix(F[3], F[6], 0.45);
const [W, H] = meta.size, [OX, OY] = meta.origin, X0 = -OX + 3, X1 = W - OX - 3, Y0 = -OY + 3, Y1 = H - OY - 3;
let blazes;
const ps = new Particles({ rng: R, ground: floor, sparks: [F[6], F[5], F[3], F[2]], onLand: (x, y) => blazes.add(x, y - 0.25, R.range(3, 4.4), R.range(0.7, 1.25)) });
blazes = new Blazes(ps);
const rocks = new Bits({ ground: floor }), lights = new Lights(), flashes = [], rings = [];
const plume = new Plume(R, {
x: 0, y: -34, rise: 118, tau: 1.25, drift: 4, tube: [9, 21], ring: [2, 19], grow: 1.0, n: 42, size: [6, 11], swell: 0.9,
spin: 2.6, spinTau: 1.7, heat: 1.2, cool: 0.42, under: 0.5, tilt: 0.22, squash: 0.72, fade: [4.4, 6.4], spread: 22,
});
const column = new Column(R, { w: 5, foot: 18, speed: 85, size: [7, 11], n: 28, sway: 2.5 });
const top = () => { const S = plume.shape(); return S.y + S.tube * 0.45; };
let t = 0, next = 0;
const blast = ({ x, y, rad, power, main }) => {
if (!main) flashes.push({ x, y, r: rad * 1.05, life: 0.06, max: 0.06 });
if (!main) rings.push({ x, y, r0: rad * 0.45, r1: rad * 2.7, life: 0.36, max: 0.36, thick: 3, c: F[5] }, { x, y, r0: rad * 0.3, r1: rad * 1.6, life: 0.24, max: 0.24, thick: 1.8, c: F[3] });
lights.add(x, main ? y - 24 : y, main ? 72 : rad * 3.4, WARM, 0.6 * power, 0.8);
lights.add(x, main ? y - 12 : y, main ? 44 : rad * 1.6, WHITE, 0.6, 0.1);
const down = main ? 0.25 : Math.PI; // a ground blast throws nothing into the floor
for (let i = 0; i < 5; i++) ps.spawn(P.FIRE, x + R.range(-2.5, 2.5), y + R.range(-2.5, 2.5), R.range(-20, 20), R.range(-40, -10), R.range(0.18, 0.3), 0, R.range(rad * 0.4, rad * 0.55));
for (let i = 0; i < Math.round(26 * power); i++) {
const a = main ? R.range(-Math.PI - down, down) : R.range(0, TAU), d = R.range(0, rad * 0.55), sp = R.range(40, 200) * power;
ps.spawn(P.FIRE, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.8 - 40, R.range(0.55, 1.15), 0, R.range(rad * 0.22, rad * 0.46), 0, R.chance(0.45) ? PF.SMOKES | PF.BIG : 0);
}
for (let i = 0; i < 5; i++) {
const a = R.range(-Math.PI, 0), d = R.range(rad * 0.1, rad * 0.5);
ps.spawn(P.SMOKE, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * 30, Math.sin(a) * 20 - 30, R.range(0.9, 1.5), hex("#221d26"), R.range(rad * 0.15, rad * 0.26), R.range(0.06, 0.2), PF.BIG);
}
for (let i = 0; i < Math.round(8 * power); i++) {
const a = R.range(-Math.PI, 0), d = R.range(0, rad * 0.7), sp = R.range(15, 90);
ps.spawn(P.SMOKE, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.6 - 35, R.range(1.8, 2.8), 0, R.range(rad * 0.26, rad * 0.4), R.range(0.12, 0.45), PF.BIG);
}
for (let i = 0; i < Math.round(80 * power); i++) {
const a = R.range(0, TAU), sp = R.range(170, main ? 470 : 380);
ps.spawn(P.SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp - 70, R.range(0.2, 0.65));
}
for (let i = 0; i < Math.round(30 * power); i++) {
const a = R.range(0, TAU), sp = R.range(30, 150);
ps.spawn(P.EMBER, x + Math.cos(a) * rad * 0.4, y + Math.sin(a) * rad * 0.4, Math.cos(a) * sp, Math.sin(a) * sp - 75, R.range(1.4, 3), F[3]);
}
if (!main) return;
for (let i = 0; i < 14; i++) {
const a = -Math.PI / 2 + R.range(-1.3, 1.3), sp = R.range(160, 340);
ps.spawn(P.BRAND, x, y, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.8, 1.5));
}
for (let i = 0; i < 18; i++) {
const s = R.sign();
ps.spawn(P.SMOKE, s * R.range(0, RAD * 0.6), -R.range(1, 6), s * R.range(3, 9) * RAD, -R.range(2, 15), R.range(1.3, 2.2), st.dust, R.range(8, 12), R.range(0, 0.06), PF.BIG);
}
for (let i = 0; i < Math.round(EARTH * 12); i++)
ps.spawn(P.SMOKE, R.range(-0.3, 0.3) * RAD, -R.range(2, RAD * 0.6), R.range(-15, 15), -R.range(60, 190) * EARTH * 0.6, R.range(1.6, 2.6), st.dust, R.range(8, 12), R.range(0, 0.15), PF.BIG);
for (let i = 0; i < Math.round(EARTH * RAD * 4); i++) {
const u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.55, sp = R.range(5, 15) * RAD * (1 - 0.45 * Math.abs(u));
ps.spawn(P.GRIT, u * 0.25 * RAD, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1.4, 2.4), R.pick([st.light, st.body, st.body, st.shade]), R.chance(0.45) ? 2 : 1);
}
for (let i = 0; i < 26; i++) {
const big = i < 10, hot = R.chance(0.45), sx = R.sign();
rocks.add({ kind: B.CHUNK, x: R.range(-0.4, 0.4) * RAD, y: -4, vx: sx * R.range(30, big ? 120 : 150), vy: -R.range(big ? 280 : 320, big ? 480 : 560), g: 1, drag: 0.3, bounce: 0.3, life: R.range(3.6, 5), a: R.range(0, TAU), va: R.range(-14, 14), s: big ? R.range(2.6, 3.8) : R.range(1.2, 2.4), heat: hot ? R.range(0.6, 1) : 0 });
}
};
return {
update(dt) {
t += dt;
while (next < BLASTS.length && t >= BLASTS[next].t) blast(BLASTS[next++]);
if (t > 0.08) plume.update(dt);
const S = plume.shape(), k = 1 - smooth(2.2, 3.1, t);
if (t > 0.2 && t < 3.1) {
if (R.chance(8 * k * dt)) ps.spawn(P.SMOKE, R.range(-10, 10), -R.range(1, 6), R.range(-8, 8), -R.range(40, 80), R.range(1.5, 2.3), st.dust, R.range(5, 8), 0, PF.BIG);
if (t < 1.5 && R.chance(16 * dt)) ps.spawn(P.FIRE, R.range(-6, 6), -R.range(4, 14), R.range(-10, 10), -R.range(90, 150), R.range(0.5, 0.8), 0, R.range(4, 7.5), 0, R.chance(0.5) ? PF.SMOKES | PF.BIG : 0);
if (t > 0.45 && R.chance(12 * k * dt)) {
const s = R.sign();
ps.spawn(P.SMOKE, s * R.range(40, 120), -R.range(1, 4), -s * R.range(10, 30), -R.range(0, 5), R.range(1.3, 1.9), st.dust, R.range(3.5, 5.5), 0, PF.BIG);
}
}
if (t > 0.3 && t < 3 && R.chance(10 * plume.hot() * dt)) {
const a = R.range(0, TAU);
ps.spawn(P.EMBER, S.x + Math.cos(a) * (S.ring + S.tube), S.y + Math.sin(a) * S.tube * 0.5, Math.cos(a) * R.range(40, 90), -R.range(10, 60), R.range(1.2, 2.4), F[3]);
}
if (t > 1.4 && t < 4.6 && R.chance(7 * dt)) ps.spawn(P.FLAKE, S.x + R.range(-1, 1) * (S.ring + S.tube), S.y + S.tube * 0.6, R.range(-6, 6), R.range(0, 10), R.range(2, 3), R.pick([SM[1], SM[2], F[2]]), R.range(0.6, 1.2));
column.update(dt, top(), t > 0.22 && t < 2.5 ? 1 : 0);
draft(ps, dt, { x: 0, top: S.y + S.tube * 0.4, w: 9 + 7 * Math.min(1, t), up: 170, pull: 130, low: 12, reach: 130, k: 1 - smooth(2.5, 3.8, t) });
for (const a of [flashes, rings]) for (let i = a.length - 1; i >= 0; i--) if ((a[i].life -= dt) <= 0) a.splice(i, 1);
for (const b of rocks.list) b.pvy = b.vy;
rocks.update(dt);
for (let i = rocks.list.length - 1; i >= 0; i--) {
const b = rocks.list[i];
if (b.x < X0 + 4 || b.x > X1 - 4) {
rocks.list.splice(i, 1);
continue;
}
if (b.heat > 0) {
b.heat = Math.max(0, b.heat - dt * 0.3);
if (!b.rest && b.heat > 0.25) {
(b.pts ??= []).push({ x: b.x, y: b.y, t });
if (R.chance(14 * dt)) ps.spawn(P.FIRE, b.x, b.y, b.vx * 0.1, b.vy * 0.1 - 8, R.range(0.16, 0.3), 0, R.range(1.2, 2.2));
} else if (b.rest && R.chance(3 * b.heat * dt)) ps.spawn(P.SMOKE, b.x, b.y - 1, R.range(-3, 3), -R.range(5, 12), R.range(0.8, 1.4), 0, R.range(1.6, 2.6));
}
const landed = (b.pvy > 0 && b.vy <= 0) || (b.rest && !b.dusted);
if (landed && b.pvy > 60) {
for (let j = 0; j < 2 + Math.round(b.s); j++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(10, 50), -R.range(2, 20), R.range(0.3, 0.7), st.dust, R.range(1.3, 1 + b.s));
if (b.heat > 0.5 && !b.dusted) blazes.add(b.x, -0.25, R.range(1.2, 2.2), 0.45);
}
if (b.rest) b.dusted = true;
if (b.pts) while (b.pts.length && t - b.pts[0].t > 0.45) b.pts.shift();
}
blazes.update(dt);
ps.update(dt);
cull(ps, X0, Y0, X1, Y1);
lights.update(dt);
},
drawBack(p) {
scorch(p, HR, t, 52, 3.4, 1 - smooth(meta.duration - 1.6, meta.duration - 0.3, t), 3);
const k = t / 0.6;
if (k < 1) band(p, 0, 0.5, 132 * ease.outCubic(k), 0.16, Math.max(1, 6 * (1 - k)), 1.15 - k, [st.body, st.light, F[3], F[6]], (g) => Math.sin(g) < 0);
drawPs(p, ps, "back", FR);
column.draw(p, top(), FR, SM, 1 - t / 1.4, plume.hot());
plume.draw(p, FR, SM);
blazes.drawBack(p);
},
draw(p) {
const k = t / 0.6;
if (k < 1) band(p, 0, 0.5, 132 * ease.outCubic(k), 0.16, Math.max(1, 6 * (1 - k)), 1.15 - k, [st.body, st.light, F[3], F[6]], (g) => Math.sin(g) >= 0);
if (t < 0.04) {
dome(p, F, 0, 44, 1);
p.glow(0, -30, 68, WHITE, 0.6);
} else if (t < 0.11) dome(p, F, 0, 38 - (t - 0.04) * 120, 1 - (t - 0.04) / 0.07);
for (const b of rocks.list) {
if (b.pts) trail(p, b.pts, t, FR, SM, 0.45, 0.6 + b.s * 0.3, b.heat);
rock(p, b, st, FR);
}
drawPs(p, ps, "front", FR);
if (t < 0.24) flare(p, 0, -14, 70 * Math.pow(1 - t / 0.24, 1.4), 1 - t / 0.24, F);
if (t < 0.5) {
const u = t / 0.5, r = 34 + 80 * ease.outCubic(u);
p.ring(0, 0, r, Math.max(1, 3 * (1 - u) + 0.5), u < 0.3 ? F[6] : u < 0.6 ? F[5] : F[3], (v, a) => (Math.sin(a) > 0 ? 0 : Math.min(1, (1 - u) * 1.6)));
glowDome(p, 0, 0, r, 6, F[4], 0.35 * (1 - u));
}
for (const f of flashes) {
const k2 = f.life / f.max, r = f.r * (0.8 + 0.2 * k2);
p.circle(f.x, f.y, r + 1.2, F[2]);
p.circle(f.x, f.y, r, k2 > 0.45 ? F[6] : F[5]);
p.circle(f.x, f.y, r * 0.6, k2 > 0.45 ? WHITE : F[6]);
}
for (const r of rings) {
const k2 = r.life / r.max, e = 1 - Math.pow(k2, 3);
p.ring(r.x, r.y, r.r0 + (r.r1 - r.r0) * e, Math.max(1, r.thick * k2 + 0.4), r.c, Math.min(1, k2 * 1.6));
}
const hot = plume.hot(), flash = Math.max(0, 1 - t / 0.9);
pool(p, 0, 1, 150, 22, F[3], 0.24 * hot + 0.5 * flash * flash);
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/explosions/_lib.js": function(__r, __exports){
const { P, PF, clamp, smooth, rand, TAU, WHITE, hex, mix, scale, rgb } = __r("core/index.js");
const OUTLINE = hex("#1a1422"), SOOT = hex("#0d0a12"), SOOT2 = hex("#17121d");
function stone(c) {
c = hex(c);
return { light: mix(scale(c, 1.35), WHITE, 0.08), body: c, shade: scale(c, 0.64), dust: mix(scale(c, 1.2), rgb(150, 140, 150), 0.3) };
}
const fireRamp = (F) => [F[7], F[6], F[5], F[4], F[3], F[2], F[1], mix(F[1], F[0], 0.5), F[0]];
function fireBall(p, q, FR) {
const k = q.life / q.max, age = 1 - k, n = FR.length, x = q.x, y = q.y;
const heat = Math.min(0.999, Math.pow(age, 0.62) + (q.seed % 1) * 0.1), idx = Math.min(n - 2, Math.floor(heat * (n - 1)));
const r = q.size * (0.55 + 0.45 * Math.min(1, age * 7)) * (1 - age * 0.55), c = FR[idx];
if (idx >= n - 2) return p.disc(x, y, r, c, Math.min(1, k * 3) * 0.85);
p.circle(x, y, r, FR[Math.min(n - 1, idx + (idx <= 2 ? 3 : 2))]);
p.circle(x - r * 0.16, y - r * 0.22, r * 0.78, c);
if (r > 1.6) p.circle(x, y - r * 0.9, r * 0.42, c);
if (idx <= 3 && r > 1.8) p.circle(x - r * 0.28, y - r * 0.34, r * 0.36, FR[Math.max(0, idx - 1)]);
if (idx < 6) p.glow(x, y, r * 2.4 + 2, c, 0.18 * k);
}
function drawPs(p, ps, layer, FR) {
const all = ps.list, fires = [], rest = [];
for (const q of all) (q.k === P.FIRE ? fires : rest).push(q);
const back = layer === "back";
if (!back) for (const q of fires) if (q.delay <= 0 && !(q.flag & PF.BACK)) fireBall(p, q, FR);
ps.list = rest;
ps.draw(p, layer);
ps.list = all;
if (back) for (const q of fires) if (q.delay <= 0 && q.flag & PF.BACK) fireBall(p, q, FR);
}
const LIFTS = new Set([P.SMOKE, P.DUST, P.FIRE, P.EMBER, P.VAPOUR]);
function draft(ps, dt, { x = 0, top = -Infinity, w = 12, up = 150, squeeze = 4, pull = 0, low = 10, reach = 100, k = 1 }) {
if (k <= 0) return;
for (const q of ps.list) {
if (q.delay > 0 || !LIFTS.has(q.k) || q.y < top) continue;
const dx = q.x - x, ax = Math.abs(dx), u = ax / w;
if (u < 1) {
const f = (1 - u * u) * k;
q.vy -= up * f * dt;
q.vx -= dx * squeeze * f * dt;
}
if (pull && q.y > -low && ax > w * 0.4 && ax < reach) q.vx -= Math.sign(dx) * pull * k * (1 - ax / reach) * dt;
}
}
function cull(ps, x0, y0, x1, y1) {
const L = ps.list;
for (let i = L.length - 1; i >= 0; i--) {
const q = L[i];
if (q.x < x0 || q.x > x1 || q.y < y0 || q.y > y1) L.splice(i, 1);
}
}
const SOFT = new Set([P.SMOKE, P.DUST, P.VAPOUR]);
function fadeEdges(ps, x0, x1, w = 30, y1 = Infinity) {
const L = ps.list;
for (let i = L.length - 1; i >= 0; i--) {
const q = L[i];
if (!SOFT.has(q.k)) continue;
const r = q.size * 1.65, e = Math.min((Math.min(q.x - x0, x1 - q.x) - r) / w, (y1 - q.y - r) / 6);
if (e <= 0) L.splice(i, 1);
else if (e < 1) q.life = Math.min(q.life, q.max * 0.42 * e);
}
}
function pool(p, x, y, rx, ry, c, k) {
if (k <= 0.004 || rx < 1 || ry < 0.5) return;
p.shade(x - rx, y - ry, x + rx, y + ry, (px, py, out) => {
const dx = (px - x) / rx, dy = (py - y) / ry, d = dx * dx + dy * dy;
if (d >= 1) return;
const f = 1 - Math.sqrt(d);
out.l = c;
out.k = f * f * k;
});
}
function haze(p, x, y, rx, ry, c, a) {
if (rx < 0.5 || ry < 0.5) return;
const fc = typeof c === "function", fa = typeof a === "function";
p.each(x - rx, y - ry, x + rx, y + ry, (lx, ly, sx, sy) => {
const dx = (lx - x) / rx, dy = (ly - y) / ry, d2 = dx * dx + dy * dy;
if (d2 > 1) return;
const d = Math.sqrt(d2);
p.blendPx(sx, sy, fc ? c(d) : c, fa ? a(d) : a);
});
}
const heatRamp = (FR) => [...FR.slice(0, 8), mix(FR[8], SOOT, 0.3), mix(FR[8], SOOT, 0.65)];
function scorch(p, HR, t, rx0, cool, fade, rows = 3) {
if (fade <= 0) return;
const rx = rx0 * Math.min(1, t / 0.08), ry = rows + 1.5, n = HR.length;
for (let y = 0; y < rows; y++)
for (let x = Math.floor(-rx); x <= Math.ceil(rx); x++) {
const dx = (x + 0.5) / rx, dy = (y + 0.5) / ry, d = Math.sqrt(dx * dx + dy * dy);
if (d > 1) continue;
const k = rand(x * 31 + y, 3), T = Math.pow(clamp(1 - t / cool), 1.4) * (1.25 - d) - k * 0.35;
const crack = k > 0.88 && d < 0.85 ? Math.pow(clamp(1 - t / (cool * 2)), 1.2) * (1.15 - d) * 0.8 : 0, H = Math.max(T, crack);
if (H > 0.06) {
const c = HR[Math.min(n - 1, Math.floor((1 - Math.min(1, H)) * (n - 1)))];
p.dot(x, y, c, fade);
if ((x & 3) === 0 || crack > T) p.glow(x + 0.5, y, 6, c, 0.18 * H * fade);
} else p.dot(x, y, d < 0.5 ? SOOT : SOOT2, (d < 0.95 - k * 0.3 ? 1 : 1 - d) * fade);
}
}
function rock(p, b, st, FR) {
const r = 0.6 + b.s * 0.75, fade = Math.min(1, b.life / 0.5), lx = Math.cos(b.a) * r * 0.4, ly = Math.sin(b.a) * r * 0.4, heat = b.heat ?? 0;
p.shade(b.x - r - 1, b.y - r - 1, b.x + r + 1, b.y + r + 1, (x, y, out) => {
const dx = x - b.x, dy = y - b.y, d = Math.hypot(dx * 1.15, dy);
if (d > r + 0.9) return;
out.a = fade;
if (d > r) return OUTLINE;
const lit = dx * lx + dy * ly;
if (heat > 0.08) {
const g = heat * (1.1 - d / (r + 0.5)) + (lit > 0.3 ? heat * 0.45 : 0);
if (g > 0.5) return FR[g > 1 ? 1 : g > 0.8 ? 2 : g > 0.62 ? 3 : 4];
if (g > 0.32) return FR[5];
}
return lit < -0.4 ? st.light : lit > 0.6 ? st.shade : st.body;
});
if (heat > 0.05) p.glow(b.x, b.y, r * 2 + 3, FR[3], 0.32 * heat * fade);
}
function glowDome(p, x, y, R, w, c, k, box = [-Infinity, -Infinity, Infinity, Infinity]) {
if (k <= 0.004 || w < 1) return;
p.shade(Math.max(box[0], x - R - w), Math.max(box[1], y - R - w), Math.min(box[2], x + R + w), Math.min(box[3], y + 0.5), (px, py, out) => {
const d = Math.abs(Math.hypot(px - x, py - y) - R) / w;
if (d >= 1) return;
out.l = c;
out.k = (1 - d) * (1 - d) * k;
});
}
function trail(p, pts, t, FR, SM, life = 0.5, w = 1, heat = 1) {
let lx = NaN, ly = NaN;
for (let i = pts.length - 1; i >= 0; i--) {
const q = pts[i], age = (t - q.t) / life;
if (age >= 1) break;
if (Math.hypot(q.x - lx, q.y - ly) < 1.6) continue;
lx = q.x;
ly = q.y;
const r = w * (0.7 + age * 2.6);
if (age < 0.12 * heat) p.circle(q.x, q.y - age * 6, r * 0.8, FR[age < 0.05 ? 3 : 5]);
else p.disc(q.x, q.y - age * 6, r, SM[Math.min(SM.length - 1, 1 + Math.floor(age * 3))], 0.55 * (1 - age));
}
}
function drawDirt(p, ps, layer) {
const all = ps.list, grit = [], rest = [];
for (const q of all) (q.k === P.GRIT ? grit : rest).push(q);
ps.list = rest;
ps.draw(p, layer);
ps.list = all;
if (layer === "back") return;
for (const q of grit) {
if (q.delay > 0) continue;
const k = q.life / q.max, sp = Math.hypot(q.vx, q.vy);
if (k < 0.25 && k * 4 < 0.5) continue;
if (sp > 140) {
const L = Math.min(5, sp * 0.012), ux = q.vx / sp, uy = q.vy / sp;
p.line(q.x - ux * L, q.y - uy * L, q.x, q.y, (u) => (u < 0.5 ? scale(q.col, 0.7) : q.col));
} else {
p.px(q.x, q.y, q.col);
if (q.size >= 2) p.px(q.x + 1, q.y, q.col), p.px(q.x, q.y + 1, scale(q.col, 0.8)), p.px(q.x + 1, q.y + 1, scale(q.col, 0.7));
}
}
}
function crater(p, E, x, r, k, a = 1) {
if (k <= 0 || a <= 0) return;
const n = E.length, rx = r * k, ry = Math.max(1.5, r * 0.17 * k);
for (let py = -1; py <= Math.ceil(ry) + 1; py++)
for (let px = Math.floor(-rx - 1); px <= Math.ceil(rx + 1); px++) {
const dx = (px + 0.5) / rx, dy = (py + 0.5 - ry * 0.35) / ry, d = Math.sqrt(dx * dx + dy * dy);
if (d > 1.08) continue;
const c = d > 0.92 ? (dy < 0 ? E[n - 2] : E[2]) : dy < -0.2 ? E[0] : dy < 0.35 ? E[1] : E[2];
p.dot(x + px, py, c, a);
}
for (const s of [-1, 1])
for (let i = 0; i < 9; i++) {
const u = i / 8, h = Math.round(Math.sin(Math.PI * u) * 2.2 * k + (rand(i, s > 0 ? 3 : 4) < 0.4 ? 1 : 0) * k);
const hx = x + s * (rx * 0.82 + u * r * 0.55);
for (let j = 0; j <= h; j++) p.dot(hx, -j, j === h ? E[n - 2] : j === h - 1 ? E[3] : E[2], a);
}
for (let i = 0; i < 26; i++) {
const s = rand(i, 7) < 0.5 ? -1 : 1, d = rx * (1.05 + rand(i, 8) * 1.4), y = Math.round(rand(i, 9) * 3) - 1;
if (rand(i, 10) < k) p.dot(x + s * d, y, rand(i, 11) < 0.5 ? E[3] : E[2], a);
}
}
function dome(p, F, x, r, k) {
const e = 1.4 / r;
p.shade(x - r - 1.5, -r - 1.5, x + r + 1.5, 0.5, (px, py) => {
const d = Math.hypot(px - x, py) / r;
if (d > 1 + e) return;
return d > 1 ? F[2] : d > 0.8 ? (k > 0.45 ? F[6] : F[5]) : d > 0.5 ? (k > 0.45 ? WHITE : F[6]) : k > 0.2 ? WHITE : F[6];
});
}
function lobe(p, x, y, r, FR, SM, fire, glow, a, z = 0, dark = 0, style = 0) {
if (r < 0.7 || a <= 0.01) return;
const n = FR.length, m = SM.length, back = z < -0.35 ? 1 : 0, rim = 1 - Math.min(0.35, 1.6 / r), seam = 1 - Math.min(0.3, 1.3 / r);
const D = (i) => SM[Math.min(m - 1, i + back + dark)], soft = 0.55 + 0.4 * (1 - Math.min(1, a));
const px = (lx, ly, sx, sy) => {
const dx = (lx - x) / r, dy = (ly - y) / r, d2 = dx * dx + dy * dy;
if (d2 > 1) return;
const d = Math.sqrt(d2), nz = Math.sqrt(1 - d2), sky = -0.5 * dx - 0.66 * dy + 0.56 * nz;
const v = fire * (1.32 - 0.78 * d) + 0.14 * sky * fire;
let c, k = 0, solid = false;
if (v > 0.44) {
let i = Math.min(n - 3, Math.max(0, Math.floor((1.3 - v) * (n - 1) * 0.78)));
if (d > seam) i = Math.min(6, Math.max(4, i + 2));
else if (d > seam - 0.22) i = Math.min(n - 3, i + 1);
c = FR[i];
k = 0.05 * fire;
solid = true;
} else if (style) {
const lam = -0.42 * dx - 0.78 * dy + 0.46 * nz;
if (lam > 0.66 && d > 0.4) c = D(0);
else if (lam > 0.16) c = D(1);
else if (lam > -0.3) c = D(2);
else {
c = D(lam < -0.64 ? 4 : 3);
const g = glow * (0.6 + 0.4 * dy);
if (g > 0.55) (c = FR[g > 0.8 ? 5 : 6]), (k = 0.08 * g);
else if (g > 0.34) c = mix(c, FR[6], 0.6);
else if (g > 0.16) c = mix(c, FR[7], 0.45);
}
} else {
const g = glow * (0.82 * dy + 0.3 * nz);
if (g > 0.45) (c = FR[g > 0.66 ? 4 : 5]), (k = 0.1 * glow);
else if (g > 0.3) c = FR[6];
else if (g > 0.2) c = FR[7];
else {
const s = sky * 0.5 + 0.5;
c = D(s > 0.8 ? 0 : s > 0.62 ? 1 : s > 0.42 ? 2 : s > 0.22 ? 3 : 4);
}
}
p.blendPx(sx, sy, c, solid || d <= rim ? a : a * soft);
if (k > 0) p.add(sx, sy, c, k);
};
if (p.sn !== 0 || p.cs !== 1) return p.each(x - r, y - r, x + r, y + r, px);
const ax = p.tx + (x - r) * p.fx, bx = p.tx + (x + r) * p.fx;
const sx0 = Math.max(p.ox, Math.floor(Math.min(ax, bx))), sx1 = Math.min(p.ox + p.w - 1, Math.ceil(Math.max(ax, bx)));
const sy0 = Math.max(p.oy, Math.floor(p.ty + y - r)), sy1 = Math.min(p.oy + p.h - 1, Math.ceil(p.ty + y + r));
for (let sy = sy0; sy <= sy1; sy++) {
const ly = sy + 0.5 - p.ty, q = (ly - y) / r;
if (q * q >= 1) continue;
const hw = r * Math.sqrt(1 - q * q), cx = p.tx + x * p.fx;
for (let sx = Math.max(sx0, Math.floor(cx - hw - 0.5)), e = Math.min(sx1, Math.ceil(cx + hw)); sx <= e; sx++) px((sx + 0.5 - p.tx) * p.fx, ly, sx, sy);
}
}
class Plume {
constructor(R, o = {}) {
this.o = o = {
x: 0, y: -20, rise: 100, tau: 1.2, drift: 4, tube: [8, 20], ring: [1, 18], grow: 0.9, n: 40, size: [5, 10], swell: 0.5,
spin: 2.4, spinTau: 1.6, heat: 1.15, cool: 0.45, under: 0.5, tilt: 0.2, squash: 0.7, fade: [4, 6], glow: 1, spread: 10,
style: 0, inner: false, hollow: false, fray: null, ...o,
};
this.R = R;
this.t = 0;
this.roll = 0;
this.onFray = null;
this.lobes = Array.from({ length: o.n }, (_, i) => ({
th: TAU * ((i * 0.618034 + R.range(-0.08, 0.08)) % 1), ph: (TAU * (i + R.range(-0.35, 0.35))) / o.n,
j: R.range(-0.55, 0.12), s: R.range(o.size[0], o.size[1]), h: R.range(-0.22, 0.08), dx: R.range(-1, 1), dy: R.range(-1, 0.4),
f: R.range(-0.9, 0.5), gv: R.range(0.55, 1.15),
}));
}
shape(t = this.t) {
const o = this.o, u = Math.max(0, t), g = 1 - Math.exp(-u / o.grow);
return { x: o.x, y: o.y - o.rise * (1 - Math.exp(-u / o.tau)) - o.drift * u, tube: o.tube[0] + (o.tube[1] - o.tube[0]) * g, ring: o.ring[0] + (o.ring[1] - o.ring[0]) * g, g };
}
hot(t = this.t) {
return clamp(this.o.heat - this.o.cool * t + 0.3);
}
ember(t = this.t) {
return clamp((this.o.heat - this.o.cool * t + 1) / 1.1);
}
lobesAt(t) {
const o = this.o, S = this.shape(t), base = o.heat - o.cool * t, span = S.ring + S.tube || 1, list = [];
for (const q of this.lobes) {
const fade = 1 - smooth(o.fade[0] + q.f, o.fade[1] + q.f * 0.5, t), loose = Math.pow(smooth(o.fade[0] - 1.8 + q.f, o.fade[1], t), 1.5) * o.spread;
if (fade <= 0) continue;
const th = q.th - this.roll, rt = S.tube * (1 + q.j), rho = S.ring + rt * Math.cos(th), up = Math.sin(th);
const X = rho * Math.cos(q.ph), Z = rho * Math.sin(q.ph);
const heat = base + q.h - 0.18 * Math.max(0, Math.cos(th)) * clamp(t * 2) + o.under * Math.max(0, -up) * clamp(base + 0.6);
const r = q.s * (0.5 + 0.5 * S.g) * (1 + o.swell * clamp(1 - heat)) * (1 + 0.35 * (1 - fade));
list.push({ x: S.x + X + q.dx * loose, y: S.y - rt * up * o.squash + Z * o.tilt + q.dy * loose, z: Z / span, up, out: Math.cos(th), heat, q, fade, r, d: Math.hypot(X, Z) / span, c: 1 - Math.min(1, Math.abs(X) / span) });
}
return list.sort((a, b) => a.z - b.z);
}
update(dt) {
const o = this.o;
this.t += dt;
this.roll += o.spin * (0.12 + 0.88 * Math.exp(-this.t / o.spinTau)) * dt;
if (o.fray && this.onFray && this.t > o.fray[0] && this.t < (o.fray[2] ?? Infinity)) {
const S = this.shape(), k = o.fray[1] * dt * smooth(o.fray[0], o.fray[0] + 1, this.t);
for (const e of this.lobesAt(this.t)) {
if (e.out < 0.2 || !this.R.chance(k * e.fade)) continue;
const ux = e.x - S.x, uy = e.y - S.y, l = Math.hypot(ux, uy) || 1;
this.onFray(e.x + (ux / l) * e.r * 0.6, e.y + (uy / l) * e.r * 0.6, e.r, ux / l, uy / l);
}
}
}
draw(p, FR, SM, { mid } = {}) {
const o = this.o, t = this.t;
if (t >= o.fade[1] + 0.5) return;
const S = this.shape(t), base = o.heat - o.cool * t, span = S.ring + S.tube || 1, list = this.lobesAt(t), age = clamp(t / o.fade[1]);
const E = this.ember(t), reach = 0.3 + 1.15 * E;
let drawn = false;
for (const e of list) {
if (!drawn && e.z >= 0 && mid) (drawn = true), mid();
const h = e.heat, fade = e.fade, fire = clamp((h - 0.2) / 0.75);
const glow = o.inner
? E * clamp((reach - e.d) / 0.45) * (0.45 + 0.55 * Math.max(0, -e.up)) * e.q.gv * o.glow
: clamp((base + 0.45) / 0.85) * o.glow * (0.4 + 0.35 * Math.max(0, -e.up) + 0.4 * e.c) * e.q.gv;
lobe(p, e.x, e.y, e.r, FR, SM, fire, glow, fade * (0.82 + 0.18 * fire), e.z, (age > 0.72 ? 1 : 0) + (o.hollow && e.up < -0.35 ? 1 : 0), o.style);
if (fire > 0.25) p.glow(e.x, e.y, e.r * 1.25 + 2, FR[2], 0.07 * fire);
}
if (!drawn && mid) mid();
const hot = this.hot(t);
if (hot > 0) p.glow(S.x, S.y, span * 1.8 + 14, FR[3], 0.32 * hot * o.glow);
if (o.inner && E > 0.05) p.glow(S.x, S.y + S.tube * 0.3, span * (0.5 + 0.7 * E) + 8, FR[4], 0.22 * E * E);
}
}
class Column {
constructor(R, o = {}) {
this.R = R;
this.o = o = { w: 7, foot: 16, speed: 70, size: [5, 8], n: 18, sway: 2.5, fade: 0.5, style: 0, ...o };
this.t = 0;
this.lobes = [];
this.acc = 0;
}
spawn(y) {
const R = this.R, o = this.o;
this.lobes.push({ y, x: R.range(-1, 1), s: R.range(o.size[0], o.size[1]), ph: R.range(0, TAU), a: 0, v: R.range(0.8, 1.2) });
}
update(dt, top, feed) {
const o = this.o, L = Math.max(10, -top);
this.t += dt;
if (feed > 0) for (this.acc += dt * feed * o.n * (o.speed / L); this.acc > 1; this.acc--) this.spawn(-1);
for (let i = this.lobes.length - 1; i >= 0; i--) {
const b = this.lobes[i], u = clamp(-b.y / L);
b.y -= o.speed * b.v * (0.45 + 0.55 * Math.min(1, -b.y / 24)) * dt;
b.a = Math.min(1, b.a + dt * 4);
if (b.y < top || (feed <= 0 && (b.a -= dt * (2 - u)) <= 0)) this.lobes.splice(i, 1);
}
}
draw(p, top, FR, SM, fire, glow) {
const o = this.o, L = Math.max(10, -top);
const list = [...this.lobes].sort((a, b) => a.y - b.y);
for (const b of list) {
const u = clamp(-b.y / L), foot = Math.pow(1 - u, 4), w = o.w + o.foot * foot;
const x = b.x * w * 0.45 + Math.sin(this.t * 1.7 + b.ph + u * 3) * o.sway * u;
const r = b.s * (0.75 + 0.5 * foot + 0.35 * u) * Math.min(1, b.a * 1.5);
const end = 1 - smooth(0.85, 1, u);
lobe(p, x, b.y - r * 0.3 * foot, r, FR, SM, clamp(fire * (1.1 - u * 0.9)), glow * smooth(0.55, 1, u), Math.min(1, b.a) * end * 0.9, 0, u > 0.5 ? 0 : 1, o.style);
}
}
}
__exports.OUTLINE = OUTLINE; __exports.stone = stone; __exports.fireRamp = fireRamp; __exports.fireBall = fireBall; __exports.drawPs = drawPs; __exports.draft = draft; __exports.cull = cull; __exports.fadeEdges = fadeEdges; __exports.pool = pool; __exports.haze = haze; __exports.heatRamp = heatRamp; __exports.scorch = scorch; __exports.rock = rock; __exports.glowDome = glowDome; __exports.trail = trail; __exports.drawDirt = drawDirt; __exports.crater = crater; __exports.dome = dome; __exports.lobe = lobe; __exports.Plume = Plume; __exports.Column = Column;
},
"fx/explosions/cartoon-pow.js": function(__r, __exports){
const { Particles, P, Rng, fit, sparkle, clamp, smooth, ease, rand, TAU, WHITE, hex } = __r("core/index.js");
const { cull } = __r("fx/explosions/_lib.js");
const meta = {
name: "Cartoon POW",
desc: "A comic-book hit: a jagged two-tone burst star slams in with a shake and boiling edges, POW! drops in letter by letter, action lines fly, then it all snaps away.",
tags: ["cartoon", "comic", "pow", "hit", "impact", "text", "one-shot"],
size: [184, 144],
origin: [92, 72],
duration: 1.05,
loop: false,
fps: 30,
bg: "dark",
options: { palette: ["#1a0e14", "#6e1a12", "#c8361a", "#f47a24", "#ffc23c", "#fff07a", "#ffffff"], text: "POW!", seed: 5 },
};
const N = 14, IN = 0.05, GO = 0.66, END = 0.8;
function create(o) {
const C = fit(o.palette, 7), R = new Rng(o.seed), INK = C[0];
const ps = new Particles({ rng: R, sparks: [C[6], C[5], C[4], C[3]] });
const spikes = Array.from({ length: N * 2 }, (_, i) => ({ r: i % 2 ? R.range(0.5, 0.6) : R.range(0.85, 1.05), j: R.next() * 100 }));
const lines = Array.from({ length: 16 }, (_, i) => ({ a: ((i + R.range(0.2, 0.8)) / 16) * TAU, r: R.range(0.92, 1.08), L: R.range(10, 17), t0: R.range(0, 0.06) }));
let t = 0, popped = false, burst = false;
return {
update(dt) {
t += dt;
if (!burst && t >= IN) {
burst = true;
for (let i = 0; i < 22; i++) {
const a = R.range(0, TAU), sp = R.range(180, 360);
ps.spawn(P.SPARK, Math.cos(a) * 14, Math.sin(a) * 10, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.12, 0.3));
}
}
if (!popped && t >= GO) {
popped = true;
for (let i = 0; i < 14; i++) {
const a = R.range(0, TAU), sp = R.range(60, 150);
ps.spawn(P.STAR, Math.cos(a) * 26, Math.sin(a) * 18, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.25, 0.42), R.pick([C[6], C[5], C[4]]), R.range(1.2, 2.4));
}
}
ps.update(dt);
cull(ps, -meta.origin[0] + 3, -meta.origin[1] + 3, meta.size[0] - meta.origin[0] - 3, meta.size[1] - meta.origin[1] - 3);
},
draw(p) {
const k = clamp(t / IN);
const s = t < IN ? 0.25 + 0.95 * ease.outCubic(k) : t < GO ? 1 + 0.18 * Math.exp(-(t - IN) * 18) * Math.cos((t - IN) * 40) : 1 - ease.inBack(clamp((t - GO) / (END - GO)), 2);
const shake = t < 0.3 ? (1 - t / 0.3) * 2.2 : 0, sx = Math.round(Math.sin(t * 97) * shake), sy = Math.round(Math.cos(t * 83) * shake);
if (s > 0.02) {
const boil = Math.floor(t * 12), outer = 50 * s, rot = -0.1 + (t > GO ? (t - GO) * 3 : 0), M = N * 2;
const rad = spikes.map((q, i) => q.r * (1 + (rand(i, boil, 7) - 0.5) * 0.08));
p.shade(sx - outer - 4, sy - outer - 4, sx + outer + 4, sy + outer + 4, (x, y) => {
const dx = x - sx, dy = (y - sy) / 0.82, d = Math.hypot(dx, dy);
let u = (((Math.atan2(dy, dx) - rot) / TAU) % 1 + 1) % 1 * M;
const i = Math.floor(u) % M, f = u - Math.floor(u), r = rad[i] + (rad[(i + 1) % M] - rad[i]) * f, e = d / r;
if (e > outer + 2.5) return;
if (e > outer) return INK;
if (e > outer * 0.66 + 2) return dx * 0.6 + dy * 0.8 > outer * 0.25 && (Math.floor(x) + Math.floor(y) * 2) % 4 === 0 && Math.floor(y) % 2 === 0 ? C[4] : C[5];
if (e > outer * 0.66) return INK;
return e > outer * 0.44 ? C[3] : C[4];
});
p.glow(sx, sy, outer * 1.3, C[5], 0.3 * Math.min(1, s));
}
for (const q of lines) {
const u = (t - IN - q.t0) / 0.32;
if (u <= 0 || u >= 1) continue;
const r0 = (46 + 22 * ease.outCubic(u)) * q.r, L = q.L * 0.7 * (1 - u), ca = Math.cos(q.a), sa = Math.sin(q.a) * 0.82;
p.line(ca * r0, sa * r0, ca * (r0 + L), sa * (r0 + L), (v) => (v < 0.5 ? WHITE : C[5]));
}
const ru = (t - IN) / 0.24;
if (ru > 0 && ru < 1) p.ring(0, 0, 30 + 34 * ease.outCubic(ru), Math.max(1, 2.5 * (1 - ru)), ru < 0.4 ? WHITE : C[5], 1.1 - ru);
const word = String(o.text ?? "POW!"), scale = 3, widths = [...word].map((ch) => p.measure(ch, { font: "big", scale })[0]);
let x = -(widths.reduce((a, w) => a + w + scale, -scale)) / 2;
[...word].forEach((ch, i) => {
const u = (t - IN - 0.04 - i * 0.05) / 0.12, away = clamp((t - GO) / (END - GO - 0.04));
if (u > 0 && away < 1) {
const drop = (1 - ease.outBack(clamp(u), 2.4)) * -14, y = Math.round(-11 + drop - i * 1.5 + sy + away * 6);
const lx = Math.round(x + sx), a = 1 - away;
for (let d = 4; d >= 1; d--) p.text(ch, lx + d, y + d, d >= 3 ? INK : C[1], { font: "big", scale, a, outline: d === 4 ? INK : undefined });
for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) p.text(ch, lx + ox, y + oy, INK, { font: "big", scale, a });
p.text(ch, lx, y, (gx, gy) => (gy < 4 ? C[6] : gy < 6 ? C[5] : C[4]), { font: "big", scale, a });
}
x += widths[i] + scale;
});
ps.draw(p);
if (t > IN && t < IN + 0.12) sparkle(p, sx + 34, sy - 22, 6 * (1 - (t - IN) / 0.12), C[6], C[5], 0.6);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/explosions/dirt-explosion.js": function(__r, __exports){
const { Particles, Bits, Lights, P, PF, B, Rng, fit, band, smooth, ease, TAU, WHITE, hex, mix, rgb } = __r("core/index.js");
const { drawDirt, crater, rock, dome, pool, cull, fadeEdges } = __r("fx/explosions/_lib.js");
const meta = {
name: "Dirt explosion",
desc: "A buried charge goes off: a flash under the floor, a V of dirt clods and grit thrown high, a brown dust plume that billows and settles, and a crater left behind.",
tags: ["explosion", "dirt", "earth", "dust", "debris", "ground", "one-shot"],
size: [260, 240],
origin: [130, 206],
duration: 3.6,
loop: false,
fps: 30,
bg: "ground",
options: {
palette: ["#1c1610", "#33281c", "#4f3f2c", "#6e5a40", "#927a58", "#b89f78", "#dcc8a2"],
fire: ["#4a1712", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"],
seed: 3,
},
};
function create(o) {
const E = fit(o.palette, 7), F = fit(o.fire, 8), R = new Rng(o.seed), floor = () => 0;
const [W, H] = meta.size, [OX, OY] = meta.origin, X0 = -OX + 3, X1 = W - OX - 3, Y0 = -OY + 3, Y1 = H - OY - 3;
const clod = { light: E[5], body: E[3], shade: E[2] }, DUST = mix(E[4], rgb(150, 140, 150), 0.2), SOIL = mix(E[3], rgb(90, 80, 90), 0.2), DARK = mix(E[2], rgb(60, 52, 60), 0.3);
const ps = new Particles({ rng: R, ground: floor, sparks: [F[6], F[5], F[3], F[2]] }), lights = new Lights();
const clods = new Bits({ ground: floor });
let t = 0;
lights.add(0, -10, 56, F[4], 0.7, 0.22);
lights.add(0, -4, 26, WHITE, 0.6, 0.06);
for (let i = 0; i < 14; i++) {
const a = -Math.PI / 2 + R.range(-0.7, 0.7), sp = R.range(160, 320);
ps.spawn(P.SPARK, 0, -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.15, 0.35));
}
for (let i = 0; i < 300; i++) {
const side = R.sign(), a = -Math.PI / 2 + side * R.range(0.05, 0.62), sp = R.range(150, 470) * (1 - 0.3 * Math.abs(a + Math.PI / 2));
ps.spawn(P.GRIT, R.range(-4, 4), -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1.2, 2.2), R.pick([E[1], E[2], E[2], E[3], E[3], E[4], E[5]]), R.chance(0.45) ? 2 : 1, R.range(0, 0.06));
}
for (let i = 0; i < 30; i++) {
const side = R.sign(), a = -Math.PI / 2 + side * R.range(0.1, 0.6), sp = R.range(200, 430);
clods.add({ kind: B.CHUNK, x: R.range(-5, 5), y: -2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1, drag: 0.35, bounce: 0.25, life: R.range(2.2, 3), a: R.range(0, TAU), va: R.range(-12, 12), s: i < 12 ? R.range(2.6, 3.8) : R.range(1.4, 2.4) });
}
for (let i = 0; i < 22; i++)
ps.spawn(P.SMOKE, R.range(-7, 7), -R.range(2, 12), R.range(-25, 25), -R.range(70, 180), R.range(1.8, 2.6), R.chance(0.6) ? SOIL : DUST, R.range(9, 14), R.range(0, 0.14), PF.BIG);
for (let i = 0; i < 14; i++) {
const side = R.sign(), a = -Math.PI / 2 + side * R.range(0.35, 0.6), sp = R.range(110, 210);
ps.spawn(P.SMOKE, side * R.range(2, 8), -R.range(2, 8), Math.cos(a) * sp, Math.sin(a) * sp, R.range(1.6, 2.4), R.chance(0.5) ? SOIL : DUST, R.range(8, 12), R.range(0.02, 0.1), PF.BIG);
}
for (let i = 0; i < 16; i++) {
const s = R.sign();
ps.spawn(P.SMOKE, s * R.range(4, 16), -R.range(1, 5), s * R.range(70, 200), -R.range(2, 12), R.range(1.4, 2.2), DUST, R.range(6, 9), R.range(0.02, 0.1), PF.BIG);
}
for (let i = 0; i < 8; i++) ps.spawn(P.SMOKE, R.range(-8, 8), -R.range(2, 8), R.range(-40, 40), -R.range(40, 110), R.range(1.2, 1.8), DARK, R.range(6, 9), R.range(0, 0.05));
return {
update(dt) {
t += dt;
for (const b of clods.list) b.pvy = b.vy;
clods.update(dt);
for (let i = clods.list.length - 1; i >= 0; i--) {
const b = clods.list[i];
if (b.x < X0 + 4 || b.x > X1 - 4) {
clods.list.splice(i, 1);
continue;
}
const landed = (b.pvy > 0 && b.vy <= 0) || (b.rest && !b.thud);
if (!landed || b.pvy < 80) {
if (b.rest) b.thud = true;
continue;
}
b.thud = b.rest;
for (let j = 0; j < 2 + Math.round(b.s); j++) ps.spawn(P.DUST, b.x + R.range(-2, 2), -0.5, R.sign() * R.range(15, 55), -R.range(4, 22), R.range(0.35, 0.7), DUST, R.range(1.6, 1.2 + b.s));
for (let j = 0; j < Math.round(b.s * 3); j++) ps.spawn(P.GRIT, b.x, -1, R.range(-70, 70), -R.range(40, 140), R.range(0.8, 1.4), R.pick([E[2], E[3], E[4]]), 1);
if (b.s > 2.2 && b.pvy > 200) b.s *= 0.6;
}
ps.update(dt);
cull(ps, X0, Y0, X1, Y1);
fadeEdges(ps, X0, X1, 24, Y1);
lights.update(dt);
},
drawBack(p) {
crater(p, E, 0, 28, ease.outCubic(Math.min(1, t / 0.12)), 1 - smooth(meta.duration - 0.7, meta.duration - 0.1, t));
const k = t / 0.45;
if (k < 1) band(p, 0, 0.5, 90 * ease.outCubic(k), 0.16, Math.max(1, 3 * (1 - k)), 1.1 - k, [E[2], E[4], E[5], E[6]], (g) => Math.sin(g) < 0);
drawDirt(p, ps, "back");
},
draw(p) {
const k = t / 0.45;
if (k < 1) band(p, 0, 0.5, 90 * ease.outCubic(k), 0.16, Math.max(1, 3 * (1 - k)), 1.1 - k, [E[2], E[4], E[5], E[6]], (g) => Math.sin(g) >= 0);
if (t < 0.09) dome(p, F, 0, 15 * (1 - t * 3), 1 - t / 0.09);
for (const b of clods.list) rock(p, b, clod, F);
drawDirt(p, ps, "front");
pool(p, 0, 1, 60, 10, F[3], 0.5 * Math.max(0, 1 - t / 0.3));
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/explosions/smoke-bomb.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, flare, clamp, smooth, TAU, WHITE, hex } = __r("core/index.js");
const { lobe, cull, fadeEdges, pool, OUTLINE } = __r("fx/explosions/_lib.js");
const meta = {
name: "Smoke bomb",
desc: "A round canister clinks down, fuse sparking, and pops: thick grey-violet smoke gushes out, rolls along the floor, billows into a cloud that hides all, then thins to wisps.",
tags: ["smoke", "smoke-bomb", "ninja", "vanish", "escape", "ground", "one-shot"],
size: [260, 176],
origin: [130, 156],
duration: 5,
loop: false,
fps: 30,
bg: "ground",
options: {
palette: ["#0e0b14", "#1e1828", "#30283e", "#463c58", "#62567a", "#867a9e", "#aea4c4"],
canister: ["#16121e", "#2a2434", "#443c52", "#686078", "#9c94ac"],
sparks: ["#fff3a6", "#ffe26b", "#ff8a2a", "#f2561d"],
seed: 3,
},
};
const POP = 0.95, R0 = 4, BAND = [hex("#3a1418"), hex("#7a2a24"), hex("#b84a34")];
const GRIT = [hex("#5a4f6b"), hex("#3e3650"), hex("#776c88")];
function step(c, dt, hit) {
if (c.rest) return;
c.vy += 900 * dt;
c.x += c.vx * dt;
c.y += c.vy * dt;
if (c.y >= -R0 && c.vy > 0) {
c.y = -R0;
if (c.vy > 80) {
hit?.(c.x, c.vy);
c.vy = -c.vy * 0.38;
c.vx *= 0.78;
} else c.vy = 0;
}
if (c.vy === 0 && c.y >= -R0 - 0.01) {
c.vx -= c.vx * 3 * dt;
if (Math.abs(c.vx) < 2) (c.vx = 0), (c.rest = true);
}
c.a += (c.vy === 0 ? c.vx / R0 : c.va) * dt;
}
function create(o) {
const C = fit(o.palette, 7), K = fit(o.canister, 5), R = new Rng(o.seed), floor = () => 0;
const SM = [C[5], C[4], C[3], C[2], C[1]];
const [W, H] = meta.size, [OX, OY] = meta.origin, X0 = -OX + 3, X1 = W - OX - 3, Y0 = -OY + 3, Y1 = H - OY - 3;
const ps = new Particles({ rng: R, ground: floor, sparks: o.sparks }), lights = new Lights();
const start = { x: -70, y: -60, vx: 125, vy: -80, va: 7, a: 0, rest: false };
const sim = { ...start };
for (let i = 0; i < 2400 && !sim.rest; i++) step(sim, 1 / 240);
const can = { ...start, x: start.x - sim.x };
const N = 52, lobes = Array.from({ length: N }, (_, i) => {
const kind = [0, 0, 1, 1, 2, 3][i % 6], side = R.sign();
const ang = kind === 0 || kind === 3 ? (side > 0 ? -R.range(0, 0.25) : Math.PI + R.range(0, 0.25)) : -Math.PI / 2 + R.range(-0.6, 0.6);
const sp = [R.range(70, 170), R.range(0, 25), R.range(45, 95), R.range(20, 60)][kind];
const r1 = [R.range(12, 17), R.range(16, 22), R.range(13, 18), R.range(14, 19)][kind];
const t0 = kind === 3 ? POP + R.range(0.45, 1.5) : POP + 0.6 * Math.pow(i / (N - 1), 1.6) + R.range(0, 0.03);
return { kind, t0, vx: Math.cos(ang) * sp, vh: -Math.sin(ang) * sp, d: R.range(-1, 1), r0: R.range(5, 8), r1, f: R.range(-0.45, 0.4), wob: R.range(0, TAU), on: false, x: 0, h: 0, age: 0 };
});
let t = 0, popped = false;
const fuseTip = () => [can.x + Math.sin(can.a) * (R0 + 2.5), can.y - Math.cos(can.a) * (R0 + 2.5)];
const radius = (b) => (b.r0 + (b.r1 - b.r0) * (1 - Math.exp(-b.age / 0.28))) * (1 + 0.05 * Math.sin(t * 3 + b.wob)) * (1 + 0.35 * thin(b));
const thin = (b) => smooth(2.5 + b.f, 3.9 + b.f * 0.6, t);
return {
update(dt) {
t += dt;
step(can, dt, (x, sp) => {
for (let i = 0; i < 3; i++) ps.spawn(P.SPARK, x, -1, R.range(-70, 70), -R.range(40, 110), R.range(0.06, 0.14));
for (let i = 0; i < 3; i++) ps.spawn(P.DUST, x + R.range(-2, 2), -0.5, R.sign() * R.range(10, 40), -R.range(4, 14), R.range(0.3, 0.55), GRIT[2], R.range(1.4, 2.4));
});
if (t < POP) {
const [fx, fy] = fuseTip(), hurry = smooth(POP - 0.4, POP, t);
if (R.chance((26 + 50 * hurry) * dt)) ps.spawn(P.SPARK, fx, fy, R.range(-50, 50), -R.range(30, 100), R.range(0.08, 0.18));
if (R.chance(8 * dt)) ps.spawn(P.VAPOUR, fx, fy - 1, R.range(-4, 4), -R.range(10, 18), R.range(0.5, 0.8), C[5], R.range(1, 1.8));
} else if (!popped) {
popped = true;
lights.add(can.x, -9, 64, C[6], 0.75, 0.22);
lights.add(can.x, -5, 22, WHITE, 0.7, 0.06);
for (let i = 0; i < 30; i++) {
const a = R.range(-Math.PI - 0.35, 0.35), sp = R.range(120, 300);
ps.spawn(P.SPARK, can.x, -5, Math.cos(a) * sp, Math.sin(a) * sp - 40, R.range(0.15, 0.4));
}
for (let i = 0; i < 26; i++) {
const u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.9, sp = R.range(80, 220) * (1 - 0.35 * Math.abs(u));
ps.spawn(P.GRIT, can.x + u * 4, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.9, 1.6), R.pick(GRIT), R.chance(0.35) ? 2 : 1);
}
Object.assign(can, { vy: -95, vx: R.range(-25, 25), va: R.sign() * 9, rest: false });
}
const wind = 6 * smooth(1.8, 3.2, t);
for (const b of lobes) {
if (!b.on) {
if (t < b.t0) continue;
(b.on = true), (b.x = can.x + R.range(-2, 2)), (b.h = 1);
}
b.age += dt;
b.vx -= b.vx * 2.4 * dt;
b.vh += [14 * smooth(0.7, 1.6, b.age), 3 + 9 * smooth(0.8, 1.8, b.age), 6 + 12 * smooth(0.3, 1.4, b.age), 10 * smooth(0.8, 1.6, b.age)][b.kind] * dt;
b.vh -= b.vh * 1.6 * dt;
b.x += (b.vx + wind) * dt;
b.h = Math.max(0, b.h + b.vh * dt);
const k = thin(b);
if (k > 0.12 && k < 0.85 && R.chance(1.8 * dt)) {
const r = radius(b), life = Math.min(R.range(1, 1.6), meta.duration - 0.15 - t);
if (life > 0.3) ps.spawn(P.VAPOUR, b.x + R.range(-r, r) * 0.5, -(b.h + r * 1.4), wind + R.range(-6, 10), -R.range(8, 20), life, C[4], r * R.range(0.3, 0.45));
}
}
if (t > POP + 0.5 && t < 4.1 && R.chance(4 * dt)) ps.spawn(P.VAPOUR, can.x, can.y - 3, R.range(-3, 3), -R.range(8, 16), R.range(0.6, 0.9), C[4], R.range(1.5, 2.5));
ps.update(dt);
cull(ps, X0, Y0, X1, Y1);
fadeEdges(ps, X0, X1, 20, Y1);
lights.update(dt);
},
drawBack(p) {
ps.draw(p, "back");
clouds(p, true);
},
draw(p) {
const fade = 1 - smooth(4.3, 4.8, t);
if (fade > 0) drawCanister(p, K, can, t < POP, fade);
if (t < POP) {
const [fx, fy] = fuseTip();
p.px(fx, fy, Math.sin(t * 50) > 0 ? WHITE : hex(o.sparks[1]));
p.glow(fx, fy, 6, hex(o.sparks[2]), 0.45 + 0.2 * Math.sin(t * 37));
}
clouds(p, false);
ps.draw(p, "front");
const u = t - POP;
if (u >= 0 && u < 0.067) {
p.circle(can.x, -5, 6.5, C[5]);
p.circle(can.x, -5, 4.5, WHITE);
}
if (u >= 0 && u < 0.16) flare(p, can.x, -5, 22 * (1 - u / 0.16), 1 - u / 0.16, [C[3], C[4], C[5], C[6]]);
if (u >= 0 && u < 0.35) pool(p, can.x, 1, 50, 8, C[6], 0.5 * (1 - u / 0.35));
lights.draw(p);
},
};
function clouds(p, back) {
const on = lobes.filter((b) => b.on);
if (!on.length) return;
let top = 0;
for (const b of on) top = Math.min(top, -(b.h + radius(b) * 1.92));
for (const b of on.filter((b) => b.d < -0.35 === back).sort((a, b) => a.d - b.d)) {
const r = radius(b), y = -(b.h + r * 0.92) + b.d * 2.5, k = thin(b);
const a = Math.min(1, b.age / 0.05) * Math.pow(1 - k, 1.4) * 0.97 * (1 - smooth(-OY + 34, -OY + 6, y - r));
if (a <= 0.01) continue;
const shade = (y - top) / Math.max(20, -top) > 0.55 ? 1 : 0;
lobe(p, b.x, y, r, SM, SM, 0, 0, a, b.d, Math.min(2, shade + (k > 0.6 ? 1 : 0)), 1);
}
}
}
function drawCanister(p, K, c, live, a) {
const ca = Math.cos(c.a), sa = Math.sin(c.a);
p.shade(c.x - R0 - 2, c.y - R0 - 2, c.x + R0 + 2, c.y + R0 + 2, (px, py, out) => {
const dx = px - c.x, dy = py - c.y, d = Math.hypot(dx, dy);
if (d > R0 + 1) return;
out.a = a;
if (d > R0) return OUTLINE;
const v = -dx * sa + dy * ca, lit = -(dx * 0.6 + dy * 0.8) / R0;
if (Math.abs(v) < 0.9) return BAND[lit > 0.3 ? 2 : lit > -0.4 ? 1 : 0];
if (d < R0 * 0.5 && lit > 0.45) return K[4];
return K[lit > 0.5 ? 3 : lit > 0 ? 2 : lit > -0.5 ? 1 : 0];
});
const cx = c.x + sa * R0, cy = c.y - ca * R0;
if (live) p.line(cx, cy, cx + sa * 2.5, cy - ca * 2.5, hex("#8a6a48"), a);
else p.dot(cx, cy, K[0], a);
}
__exports.meta = meta; __exports.create = create;
},
"fx/fire/fireball.js": function(__r, __exports){
const { fit, mix, hex, clamp, WHITE, TAU } = __r("core/index.js");
const { noiseFor, pnoise, hotFirst, flameBlade, firePuff, smokePuff, spark, ember, drift, looped, LAYERS } = __r("fx/fire/_lib.js");
const meta = {
name: "Fireball",
desc: "A fireball flying right: a churning white-hot head with a corona of flame, a long torn tail of flame puffs cooling into smoke, embers shed behind.",
tags: ["fire", "fireball", "projectile", "magic", "directional", "loop"],
size: [136, 56],
origin: [112, 28],
duration: 1.2,
loop: true,
fps: 30,
bg: "dark",
options: {
palette: ["#4a1712", "#8a1f17", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"],
radius: 5,
speed: 120,
seed: 5,
},
};
const D = meta.duration, NL = noiseFor(D), SMOKE1 = hex("#5b5566");
const BODY = [[30, 4.2, 0], [23, 4.4, -1.6], [22, 4.4, 1.6], [15, 4.6, 0]];
const CORONA = [[-1.3, 6, 1.1], [-1.8, 8, 1.2], [-2.3, 7, 1.1], [1.3, 6, 1.1], [1.8, 8, 1.2], [2.3, 7, 1.1]];
function head(p, H, t, R0, S, hx, hy) {
const ph = t / D;
p.shade(hx - R0 * 2.4, hy - R0 * 1.7, hx + R0 * 1.5, hy + R0 * 1.7, (x, y, out) => {
x -= hx;
y -= hy;
const d = Math.hypot(x, y), th = Math.atan2(y, x), back = Math.max(0, -Math.cos(th)), a = th / TAU;
const bump = 0.55 * pnoise(a * 9 + ph * 9, 9, S) + 0.35 * pnoise(a * 5 - ph * 10, 5, S + 1);
const rim = R0 * (1 + 0.55 * back * back) + bump;
if (d > rim) return;
const swirl = pnoise(a * 5 - ph * 10 + d * 0.45, 5, S + 2);
const h = 1 - d / rim + 0.26 * swirl + 0.1 * (1 - back);
if (rim - d < 1 && back < 0.3) return h > 0.3 ? H[3] : H[5];
return h > 0.74 ? H[0] : h > 0.58 ? H[1] : h > 0.42 ? H[2] : h > 0.27 ? H[4] : h > 0.13 ? H[5] : H[6];
});
}
function draw(p, t, o) {
const F = fit(o.palette, 9), H = hotFirst(F), S = o.seed, R0 = o.radius, V = o.speed;
const N = (rate, seed = 0, off = 0) => NL(t, rate, seed, off);
const GLOW = mix(mix(H[3], H[4], 0.5), WHITE, 0.25), SMOKE = mix(SMOKE1, H[6], 0.3), SPARKS = [H[1], H[2], H[4], H[5]], EMB = [H[1], H[2], H[4], H[6]];
const hx = N(3, S + 50) * 0.5, hy = N(2.5, S + 51) * 0.7;
const fire = [], smoke = [];
looped(t, D, 130, S + 100, (r) => {
const fl = r.range(0.22, 0.55), sm = r.chance(0.55), x = -r.range(2, 24);
return { x, y: r.range(-1, 1) * (R0 - 0.1 * -x), v: V * r.range(0.3, 0.6), vy: r.range(-16, 16), fl, sm, sl: r.range(0.25, 0.45), s: r.range(1.3, 2.9), f: r.next() * 0.5 + 0.5 * (-x / 24), life: fl + (sm ? 0.45 : 0) };
}, (q, age) => {
const ta = Math.min(age, q.fl), [wx, y, wvx, vy] = drift(0, q.y, q.v, q.vy, ta, 0, -70, 4.5, 3);
const x = q.x + wx - V * ta;
if (age < q.fl) return fire.push([age, x, y, q]);
if (!q.sm || age - q.fl > q.sl) return;
const sa = age - q.fl, [sx, sy] = drift(x, y, wvx - V, vy * 0.6 - 6, sa, V * 2, -30, 2, 1.2);
smoke.push([sa, sx, sy, q]);
});
for (const [sa, x, y, q] of smoke) smokePuff(p, x, y, 1 - sa / q.sl, q.s * 0.9, SMOKE);
fire.sort((a, b) => b[0] - a[0]);
for (const [age, x, y, q] of fire) {
const u = age / q.fl;
firePuff(p, x, y, 1 - u, q.s * (1 + 1.3 * u), q.f, H, 0.07, -0.86, -0.5);
}
BODY.forEach(([len, w, dy], i) => {
const n = (S * 5 + i) * 17, L = len * (0.82 + 0.25 * N(4, n)) * (1 + 0.3 * Math.max(0, N(2.4, n + 3)));
flameBlade(p, hx + 1, hy + dy * 0.5, -1, dy * 0.02, L, w * R0 / 5, N(3, n + 5) * 3 + dy, N, n, H, LAYERS, 0.5, 1.1 + L * 0.05);
});
CORONA.forEach(([a, len, w], i) => {
const n = (S * 5 + i + 20) * 17, L = len * (0.7 + 0.4 * (0.5 + 0.5 * N(6, n))), ox = Math.cos(a) * R0 * 0.85, oy = Math.sin(a) * R0 * 0.85;
const dx = Math.cos(a) * 0.55 - 1, dy = Math.sin(a) * 0.55, l = Math.hypot(dx, dy);
flameBlade(p, hx + ox, hy + oy, dx / l, dy / l, L, w, -Math.sign(a) * 1.5, N, n, H, LAYERS);
});
head(p, H, t, R0, S, hx, hy);
looped(t, D, 26, S + 200, (r) => ({ a: r.range(-2.4, 2.4), v: r.range(30, 70), life: r.range(0.08, 0.18) }), (q, age) => {
const ca = Math.cos(q.a), sa = Math.sin(q.a), d = R0 * 0.9 + q.v * age, x = hx + ca * d - V * 0.4 * age, y = hy + sa * d;
const k = 1 - age / q.life, L = 1 + 2 * k;
p.line(x - ca * L + V * 0.02, y - sa * L, x, y, k > 0.5 ? H[1] : H[3]);
p.glow(x, y, 3, H[2], 0.4 * k);
});
looped(t, D, 30, S + 300, (r) => ({ x: -r.range(2, 16), y: r.range(-3, 3), v: V * r.range(0.3, 0.8), vy: r.range(-20, 20), life: r.range(0.25, 0.55), big: r.chance(0.25), ph: r.range(0, 6.3) }), (q, age) => {
const [wx, y, wvx, vy] = drift(0, q.y, q.v, q.vy, age, 0, 50, 3, 2);
const x = q.x + wx - V * age, k = 1 - age / q.life;
if (q.big) ember(p, x, y, k, 2, EMB, age * 40 + q.ph);
else spark(p, x, y, wvx - V, vy, k, SPARKS);
});
const fl = 0.85 + 0.15 * N(9, S + 7);
p.glowLine(hx - 6, hy, -50, -2, 12, GLOW, 0.2 * fl);
p.glow(hx - 2, hy, 42, GLOW, 0.42 * fl);
p.glow(hx, hy, 13, H[1], 0.3 * fl);
}
__exports.meta = meta; __exports.draw = draw;
},
"fx/fire/_lib.js": function(__r, __exports){
const { rand, rng, wrap, noise, mix, hex, clamp, WHITE, SMOKE_RAMP, P, PF } = __r("core/index.js");
function pnoise(x, period, seed = 0) {
const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
const a = rand(wrap(i, period), seed), b = rand(wrap(i + 1, period), seed);
return (a + (b - a) * u) * 2 - 1;
}
function noiseFor(D) {
if (!D) return (tt, rate, seed = 0, off = 0) => noise(tt * rate + off, seed);
return (tt, rate, seed = 0, off = 0) => {
const P = Math.max(1, Math.round(rate * D));
return pnoise((tt / D) * P + off, P, seed);
};
}
function looped(t, D, count, seed, make, draw) {
for (let i = 0; i < count; i++) {
const r = rng(seed, i), born = r.next() * D, q = make(r, i);
for (let age = wrap(t - born, D); age < q.life; age += D) draw(q, age, i);
}
}
const flicker = (N, s = 0) => 0.74 + 0.16 * N(7.3, 1 + s) + 0.1 * N(19, 2 + s);
const hotFirst = (F) => [...F].reverse();
const LAYERS = [[1, 1, 6], [0.76, 0.86, 4], [0.54, 0.68, 2], [0.3, 0.42, 0]];
const BIG_LAYERS = [[1, 1, 6], [0.8, 0.9, 5], [0.62, 0.78, 4], [0.44, 0.6, 3], [0.26, 0.4, 1], [0.12, 0.22, 0]];
const BACK_LAYERS = [[1, 1, 7], [0.76, 0.86, 5], [0.54, 0.68, 3], [0.3, 0.42, 2]];
function flameTongue(p, x, y, h, w, sx, N, n, H, layers = LAYERS, jit = 0.5, wob = 1.1) {
if (h < 1) return;
for (const [lw, lh, ri] of layers) {
const L = h * lh, c = H[ri];
for (let r = 0; r <= L; r++) {
const u = r / Math.max(1, L);
const half = w * lw * Math.pow(1 - u, 0.85) * Math.min(1, (r + 1.5) / 3.5) + N(9, n, r * 0.45) * jit;
if (half < 0.3) continue;
const cx = x + sx * u * u * lh + N(4, n + 7, r * 0.2) * u * wob, Y = Math.round(y - r);
for (let px = Math.round(cx - half), x1 = Math.round(cx + half); px <= x1; px++) p.px(px, Y, c);
}
}
}
function flameBlade(p, x, y, ux, uy, len, w, bend, N, n, H, layers = LAYERS, jit = 0.5, wob = 1.1) {
if (len < 1) return;
const nx = -uy, ny = ux;
for (const [lw, lh, ri] of layers) {
const L = len * lh, c = H[ri];
for (let r = 0; r <= L; r += 0.5) {
const u = r / Math.max(1, L);
const half = w * lw * Math.pow(1 - u, 0.85) * Math.min(1, (r + 1.5) / 3.5) + N(9, n, r * 0.45) * jit;
if (half < 0.3) continue;
const off = bend * u * u * lh + N(4, n + 7, r * 0.2) * u * wob, cx = x + ux * r + nx * off, cy = y + uy * r + ny * off;
for (let q = -half; q <= half; q += 0.5) p.px(cx + nx * q, cy + ny * q, c);
}
}
}
function solid(p, x, y, r, c) {
if (r < 0.6) return p.px(x, y, c);
const cx = p.toX(x, y), cy = p.toY(x, y), r2 = r * r;
for (let sy = Math.floor(cy - r); sy <= Math.ceil(cy + r); sy++) {
const dy = sy + 0.5 - cy, s2 = r2 - dy * dy;
if (s2 < 0) continue;
const s = Math.sqrt(s2);
for (let sx = Math.ceil(cx - s - 0.5); sx <= Math.floor(cx + s - 0.5); sx++) p.put(sx, sy, c, 1);
}
}
function soft(p, x, y, r, c, a) {
if (a <= 0.004) return;
if (r < 0.5) return p.blend(x, y, c, a);
const cx = p.toX(x, y), cy = p.toY(x, y), r2 = r * r;
for (let sy = Math.floor(cy - r); sy <= Math.ceil(cy + r); sy++) {
const dy = sy + 0.5 - cy, s2 = r2 - dy * dy;
if (s2 < 0) continue;
const s = Math.sqrt(s2);
for (let sx = Math.ceil(cx - s - 0.5); sx <= Math.floor(cx + s - 0.5); sx++) p.blendPx(sx, sy, c, a);
}
}
function firePuff(p, x, y, k, size, frac, H, glowK = 0.18, tx = 0, ty = -1) {
const age = 1 - k, n = H.length, heat = Math.min(0.999, Math.pow(age, 0.62) + frac * 0.1);
const idx = Math.min(n - 2, Math.floor(heat * (n - 1)));
const r = size * (0.55 + 0.45 * Math.min(1, age * 7)) * (1 - age * 0.55), c = H[idx];
if (idx >= n - 2) return soft(p, x, y, r, c, Math.min(1, k * 3) * 0.85);
solid(p, x, y, r, H[Math.min(n - 1, idx + 2)]);
if (r > 1.6 && ty > -0.99) solid(p, x + tx * r * 1.5, y + ty * r * 1.5, r * 0.3, H[Math.min(n - 1, idx + 1)]);
solid(p, x - r * 0.16, y - r * 0.22, r * 0.78, c);
if (r > 1.6) solid(p, x + tx * r * 0.9, y + ty * r * 0.9, r * 0.42, c);
if (idx <= 3 && r > 1.8) solid(p, x - r * 0.28, y - r * 0.34, r * 0.36, H[Math.max(0, idx - 1)]);
if (idx < 6) p.glow(x, y, r * 2.4 + 2, c, glowK * k);
}
function lick(p, x, y, k, s, H) {
const r = s * (0.4 + 0.6 * k);
solid(p, x, y, r + 0.6, k > 0.5 ? H[5] : H[6]);
if (k > 0.35) solid(p, x, y - 0.3, r * 0.6, k > 0.7 ? H[2] : H[4]);
}
const rampAt = (r, t) => r[Math.min(r.length - 1, Math.max(0, Math.floor(t * r.length)))];
function smokePuff(p, x, y, k, size, col = 0, big = false, aMul = 1) {
const age = 1 - k;
const r = size * (0.65 + Math.min(1, age * 2.5) * 0.45 + age * (big ? 0.5 : 0.4));
const a = Math.min(1, age * 12) * Math.min(1, k * 2.4) * (big ? 0.7 : 0.58) * aMul;
const c = col ? mix(col, rampAt(SMOKE_RAMP, age), age) : rampAt(SMOKE_RAMP, age * 1.05);
soft(p, x, y, r, c, a * 0.45);
soft(p, x + r * 0.05, y + r * 0.06, r * 0.74, c, a * 0.62);
if (age < 0.5) soft(p, x - r * 0.22, y - r * 0.3, r * 0.5, mix(c, WHITE, 0.12), a * 0.4 * (1 - age * 2));
}
function ember(p, x, y, k, size, cols, ph) {
if (k < 0.25 && Math.sin(ph) < 0) return;
const c = k > 0.6 ? cols[0] : k > 0.3 ? cols[1] : cols[2];
if (size >= 2) {
const rim = k > 0.45 ? cols[2] : cols[3];
p.px(x - 1, y, rim), p.px(x + 1, y, rim), p.px(x, y - 1, rim), p.px(x, y + 1, rim);
p.px(x, y, c);
p.glow(x, y, 8, c, 0.4 * k);
return;
}
p.px(x, y, c);
if (size > 1.4) p.px(x, y + 1, cols[3]);
p.glow(x, y, 3 + size, c, 0.35 * k);
}
function spark(p, x, y, vx, vy, k, cols) {
const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, len = Math.min(9, 1 + sp * 0.022);
const head = k > 0.6 ? cols[0] : k > 0.3 ? cols[1] : cols[2];
p.line(x - ux * len, y - uy * len, x - ux * len * 0.4, y - uy * len * 0.4, k > 0.5 ? head : cols[cols.length - 1]);
p.line(x - ux * len * 0.45, y - uy * len * 0.45, x, y, head);
p.glow(x, y, 3, head, 0.45 * k);
}
function along(x, v, a, k, t) {
if (k <= 0) return [x + v * t + 0.5 * a * t * t, v + a * t];
const e = Math.exp(-k * t), vt = a / k;
return [x + vt * t + ((v - vt) * (1 - e)) / k, vt + (v - vt) * e];
}
function drift(x, y, vx, vy, t, ax, ay, kx, ky) {
const X = along(x, vx, ax, kx, t), Y = along(y, vy, ay, ky, t);
return [X[0], Y[0], X[1], Y[1]];
}
function sparkAt(x, y, vx, vy, t, floor = 0, g = 427, k = 2.2) {
let s = [x, y, vx, vy], left = t;
for (let b = 0; b < 3; b++) {
const e = drift(s[0], s[1], s[2], s[3], left, 0, g, k, k);
if (e[1] < floor || s[1] >= floor) return e;
let lo = 0, hi = left;
for (let i = 0; i < 16; i++) {
const m = (lo + hi) / 2;
if (drift(s[0], s[1], s[2], s[3], m, 0, g, k, k)[1] < floor) lo = m;
else hi = m;
}
const c = drift(s[0], s[1], s[2], s[3], hi, 0, g, k, k);
s = [c[0], floor - 0.25, c[2] * 0.7, -Math.abs(c[3]) * 0.45];
left -= hi;
}
const e = drift(s[0], s[1], s[2], s[3], left, 0, g, k, k);
return e[1] < floor ? e : [e[0], floor - 0.25, e[2], 0];
}
function floorLight(p, x, y, rx, ry, c, k) {
if (k <= 0.004 || rx < 1 || ry < 0.5) return;
p.shade(x - rx, y - ry, x + rx, y + ry, (px, py, out) => {
const dx = (px - x) / rx, dy = (py - y) / ry, d = dx * dx + dy * dy;
if (d >= 1) return;
const f = 1 - Math.sqrt(d);
out.l = c;
out.k = f * f * k;
});
}
function simDraw(p, ps, H, layer) {
const all = ps.list, rest = [], fire = [];
for (const q of all) (q.k === P.FIRE ? fire : rest).push(q);
const puffs = (back) => {
for (const q of fire) if (q.delay <= 0 && !!(q.flag & PF.BACK) === back) firePuff(p, q.x, q.y, q.life / q.max, q.size, q.seed % 1, H);
};
ps.list = rest;
if (layer !== "front") ps.draw(p, "back"), puffs(true);
if (layer !== "back") puffs(false), ps.draw(p, "front");
ps.list = all;
}
const SMOKE1 = hex("#5b5566");
function burn(p, t, T, o) {
const { H, D, NL, S } = o, HC = o.height, X = o.x ?? 0, Y = o.y ?? 0, W = o.spread ?? 6, G = o.glow ?? 1;
const N = (rate, seed = 0, off = 0) => NL(t, rate, seed, off);
const fla = (tt) => 0.74 + 0.16 * NL(tt, 7.3, S + 1) + 0.1 * NL(tt, 19, S + 2), fl = fla(t);
const SMOKE = mix(SMOKE1, H[6], 0.25), EMB = [H[1], H[2], H[4], H[6]], GLOW = mix(mix(H[3], H[4], 0.5), WHITE, 0.25);
const R = rng(S, 77), count = (rate) => Math.round(rate * D);
const TT = T.map(([dx, dy, h, w, back], i) => ({ dx: dx + R.range(-0.3, 0.3), y: dy, h: 2 + HC * h * R.range(0.92, 1.08), w: w * R.range(0.92, 1.08), back, env: h, n: (S * 7 + i) * 13 }));
const lean = (tt) => NL(tt, 0.67, S + 90) * (o.lean ?? 0.1);
const height = (i, tt) => {
const { h, n } = TT[i], leap = Math.max(0, NL(tt, 2.6, n + 70) - 0.55) * 1.4;
return (h + 0.25 * h * NL(tt, 3.3, n) + h * leap) * (0.9 + 0.1 * fla(tt));
};
const sweep = (i, tt, h) => NL(tt, 2.2, TT[i].n + 40) * (1 + h * 0.08) + lean(tt) * h * 0.9 - clamp(TT[i].dx * 0.3, -2.5, 2.5);
const tip = (i, tt) => {
const h = height(i, tt);
return [X + TT[i].dx + sweep(i, tt, h) * 0.85, Y + TT[i].y - h * 0.88 + 3, h];
};
const tongueAt = (i) => {
const { dx, y, w, n, back } = TT[i], h = height(i, t);
flameTongue(p, X + dx, Y + y, h, w, sweep(i, t, h), N, n, H, back ? BACK_LAYERS : w > 2.2 ? BIG_LAYERS : LAYERS, 0.5, 1.1 + h * 0.04);
};
looped(t, D, count(o.smoke ?? 12), S + 300, (r) => ({ x: r.range(-W, W) * 0.7, y: -HC * 0.8 - r.range(0, 6), vx: r.range(-2, 2), vy: -r.range(10, 17), life: r.range(...(o.smokeLife ?? [1.6, 2.6])), s: r.range(0.7, 1.1) * (o.smokeSize ?? 3) }), (q, age) => {
const [x, y] = drift(q.x, q.y, q.vx, q.vy, age, o.wind ?? 3, -20, 1.6, 1);
smokePuff(p, X + x + NL(t - age, 0.8, S + 60) * (1.5 + 2.5 * age), Y + y, 1 - age / q.life, q.s, SMOKE);
});
const puffs = [];
looped(t, D, TT.length * count(o.puffs ?? 8), S + 200, (r, j) => {
const i = j % TT.length, fire = r.range(0.14, 0.3), smokes = r.chance(0.45);
return { i, fire, smokes, sl: r.range(0.8, 1.4), ox: r.range(-1, 1), oy: r.range(0, 4), vx: r.range(-4, 4), vy: -r.range(15, 30), s: r.range(0.8, 1.6) * (0.8 + 0.6 * TT[i].env), f: r.next(), life: fire + (smokes ? 1.4 : 0) };
}, (q, age) => {
const [tx, ty] = tip(q.i, t - age);
const [x, y, vx, vy] = drift(tx + q.ox, ty + q.oy, q.vx, q.vy, Math.min(age, q.fire), 0, -95, 5, 3.2);
if (age < q.fire) return puffs.push([x, y, 1 - age / q.fire, q.s, q.f]);
if (age - q.fire > q.sl) return;
const [sx, sy] = drift(x, y, vx * 0.6, vy * 0.6 - 6, age - q.fire, o.wind ?? 3, -16, 1.6, 1.2);
smokePuff(p, sx, sy, 1 - (age - q.fire) / q.sl, q.s * 0.7, 0);
});
for (let i = 0; i < TT.length; i++) if (TT[i].back) tongueAt(i);
for (let i = 0; i < TT.length; i++) if (!TT[i].back) tongueAt(i);
o.mid?.(fl);
looped(t, D, TT.length * count(o.licks ?? 4), S + 220, (r, j) => ({ i: j % TT.length, vx: r.range(-3, 3), vy: -r.range(12, 22), s: r.range(0.9, 1.6) * (0.8 + 0.5 * TT[j % TT.length].env), life: 0.26 }), (q, age) => {
const [tx, ty] = tip(q.i, t - age);
lick(p, tx + q.vx * age, ty - 2 + q.vy * age, 1 - age / q.life, q.s, H);
});
for (const [x, y, k, s, f] of puffs) firePuff(p, x, y, k, s, f, H);
looped(t, D, count(o.embers ?? 8), S + 500, (r) => ({ x: r.range(-W, W), y: -r.range(HC * 0.3, HC * 0.8), vx: r.range(-15, 15), vy: -r.range(25, 60), life: r.range(1.1, 2.4), s: r.chance(0.15) ? 2 : r.range(1, 1.6), a: r.range(0, 6.3), b: r.range(0, 6.3) }), (q, age) => {
const [x, y] = drift(q.x, q.y, q.vx, q.vy, age, 0, -30, 1.6, 1.6);
ember(p, X + x + 7 * (Math.sin(age * 2.3 + q.a) - Math.sin(q.a)), Y + y + 2 * (Math.sin(age * 3 + q.b) - Math.sin(q.b)), 1 - age / q.life, q.s, EMB, age * 40 + q.a);
});
if (G > 0) {
const R1 = o.glowR ?? 46, lx = X + lean(t) * 12;
p.glow(lx, Y - HC * 0.35, R1 * 1.5, GLOW, 0.22 * fl * G);
p.glow(lx, Y - HC * 0.75, R1, GLOW, 0.34 * fl * G);
p.glow(X, Y - HC * 0.2, R1 * 0.32, H[2], 0.2 * fl * G);
p.glow(X, Y - 2, 8, H[0], 0.14 * fl * G);
}
return { tip, fl };
}
__exports.pnoise = pnoise; __exports.noiseFor = noiseFor; __exports.looped = looped; __exports.flicker = flicker; __exports.hotFirst = hotFirst; __exports.LAYERS = LAYERS; __exports.BIG_LAYERS = BIG_LAYERS; __exports.BACK_LAYERS = BACK_LAYERS; __exports.flameTongue = flameTongue; __exports.flameBlade = flameBlade; __exports.solid = solid; __exports.soft = soft; __exports.firePuff = firePuff; __exports.lick = lick; __exports.smokePuff = smokePuff; __exports.ember = ember; __exports.spark = spark; __exports.drift = drift; __exports.sparkAt = sparkAt; __exports.floorLight = floorLight; __exports.simDraw = simDraw; __exports.burn = burn;
},
"fx/fire/fire-breath.js": function(__r, __exports){
const { fit, mix, hex, clamp, WHITE } = __r("core/index.js");
const { noiseFor, hotFirst, flameBlade, flameTongue, firePuff, smokePuff, spark, ember, drift, looped, LAYERS, BACK_LAYERS } = __r("fx/fire/_lib.js");
const meta = {
name: "Fire breath",
desc: "A roaring cone of fire streaming right from the mouth: white-hot at the lips, billowing out and cooling to red and smoke at its edges, sparks thrown out ahead.",
tags: ["fire", "breath", "dragon", "stream", "cone", "directional", "loop"],
size: [160, 116],
origin: [12, 72],
duration: 1.5,
loop: true,
fps: 30,
bg: "dark",
options: {
palette: ["#4a1712", "#8a1f17", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"],
spread: 0.24,
speed: 320,
seed: 6,
},
};
const D = meta.duration, NL = noiseFor(D), SMOKE1 = hex("#5b5566");
const COOL_LAYERS = [[1, 1, 7], [0.72, 0.82, 6], [0.44, 0.58, 5]];
const JET = [[42, 4.2, 0], [32, 3.8, -0.08], [30, 3.8, 0.08], [20, 4.6, 0]];
function draw(p, t, o) {
const F = fit(o.palette, 9), H = hotFirst(F), S = o.seed, A = o.spread, V = o.speed;
const N = (rate, seed = 0, off = 0) => NL(t, rate, seed, off);
const GLOW = mix(mix(H[3], H[4], 0.5), WHITE, 0.25), SMOKE = mix(SMOKE1, H[6], 0.3), SPARKS = [H[1], H[2], H[4], H[5]], EMB = [H[1], H[2], H[4], H[6]];
const roar = (tt) => 0.85 + 0.15 * NL(tt, 3, S + 1), sway = (tt) => NL(tt, 1.3, S + 2) * 0.05;
const fire = [], smoke = [];
looped(t, D, 260, S + 100, (r) => {
const e = r.range(-1, 1), fl = r.range(0.42, 0.8) * (1 - 0.3 * Math.abs(e)), sm = r.chance(0.2 + 0.4 * Math.abs(e));
return { e, sp: r.range(0.75, 1.1), fl, sm, sl: r.range(0.5, 0.85), s: r.range(3, 5.2), f: r.next(), ox: r.range(4, 10), life: fl + (sm ? 0.85 : 0) };
}, (q, age) => {
const tb = t - age, a = q.e * A + sway(tb) - 0.04, v = V * q.sp * roar(tb);
const ta = Math.min(age, q.fl), [x, y, vx, vy] = drift(q.ox, q.e * 1.5, Math.cos(a) * v, Math.sin(a) * v, ta, 0, -100, 2, 2.4);
if (age < q.fl) return fire.push([age, x, y, q]);
if (!q.sm || age - q.fl > q.sl) return;
const sa = age - q.fl, [sx, sy] = drift(x, y, vx * 0.5, vy * 0.6 - 8, sa, 0, -26, 1.8, 1.2);
smoke.push([sa, sx, sy, q]);
});
for (const [sa, x, y, q] of smoke) smokePuff(p, x, y, 1 - sa / q.sl, q.s * 1.1, SMOKE, true, 0.7);
fire.sort((a, b) => b[0] - a[0]);
for (const [age, x, y, q] of fire) {
const u = age / q.fl, edge = Math.abs(q.e), size = q.s * (0.75 + 1.6 * u);
const heat = Math.min(0.999, Math.pow(u, 1.5) * (0.85 + 0.2 * edge) + 0.3 * edge * edge);
const tear = clamp((u - 0.32) / 0.2);
firePuff(p, x, y, 1 - heat, size * (1 - 0.55 * tear), q.f, H, 0.1, -0.5, -0.86);
if (tear > 0) {
const n = Math.floor(q.f * 1e5), h = size * (1.5 + 0.5 * N(4, n)) * (1.2 - heat * 0.6) * tear;
flameTongue(p, x, y + size * 0.3, h, size * 0.5 * (1.1 - heat * 0.5), -h * 0.4 + N(2.5, n + 1) * 2, N, n, H, heat < 0.45 ? LAYERS : heat < 0.72 ? BACK_LAYERS : COOL_LAYERS);
}
}
for (let i = 0; i < 6; i++) {
const n = (S * 3 + i) * 19, side = i % 2 ? 1 : -1, d = 18 + (i >> 1) * 16 + N(2, n) * 4, L = (9 + 5 * (0.5 + 0.5 * N(5, n + 1))) * (1 - d / 120);
const ex = d, ey = side * d * A * 0.85 - d * 0.06;
flameBlade(p, ex, ey, 0.75, side * 0.45 - 0.48, L, 1.6 + L * 0.08, -side * 3, N, n, H, LAYERS);
}
looped(t, D, 70, S + 250, (r) => ({ e: r.range(-0.6, 0.6), v: r.range(330, 470), life: r.range(0.12, 0.26), l: r.range(4, 9) }), (q, age) => {
const a = q.e * A - 0.03, [x, y, vx, vy] = drift(6, q.e * 2, Math.cos(a) * q.v, Math.sin(a) * q.v, age, 0, -60, 2, 2);
const sp = Math.hypot(vx, vy), k = 1 - age / q.life, L = q.l * (sp / 400);
p.line(x - (vx / sp) * L, y - (vy / sp) * L, x, y, (u) => (u > 0.6 ? (k > 0.5 ? H[0] : H[1]) : k > 0.5 ? H[2] : H[3]));
});
JET.forEach(([len, w, a], i) => {
const n = (S * 5 + i) * 17, L = len * roar(t) * (0.85 + 0.2 * N(5, n)), aa = a + sway(t);
flameBlade(p, 0, 0, Math.cos(aa), Math.sin(aa), L, w, N(3, n + 3) * 3, N, n, H, LAYERS, 0.5, 1.5);
});
looped(t, D, 40, S + 300, (r) => ({ d: r.range(4, 60), e: r.range(-1, 1), v: r.range(140, 280), life: r.range(0.25, 0.55) }), (q, age) => {
const a = q.e * A * 1.8 - 0.12, [x, y, vx, vy] = drift(q.d, q.e * q.d * A, Math.cos(a) * q.v, Math.sin(a) * q.v - 30, age, 0, 190, 2, 2);
spark(p, x, y, vx, vy, 1 - age / q.life, SPARKS);
});
looped(t, D, 18, S + 400, (r) => ({ x: r.range(50, 100), y: r.range(-14, 6), vx: r.range(10, 40), vy: -r.range(20, 50), life: r.range(0.8, 1.4), s: r.chance(0.2) ? 2 : 1, ph: r.range(0, 6.3) }), (q, age) => {
const [x, y] = drift(q.x, q.y, q.vx, q.vy, age, 0, -30, 1.6, 1.6);
ember(p, x + 5 * (Math.sin(age * 2.3 + q.ph) - Math.sin(q.ph)), y, 1 - age / q.life, q.s, EMB, age * 40 + q.ph);
});
const k = roar(t);
p.glow(3, 0, 34 * k, GLOW, 0.75 * k);
p.glow(3, 0, 10, H[0], 0.55);
for (let d = 10; d < 126; d += 8) p.glow(d, -d * 0.1, 10 + d * 0.2, GLOW, 0.32 * k * (1 - d / 150));
p.glow(64, -12, 96, GLOW, 0.16 * k);
}
__exports.meta = meta; __exports.draw = draw;
},
"fx/fire/flame-pillar.js": function(__r, __exports){
const { Particles, Bits, Lights, P, PF, B, Rng, fit, band, clamp, smooth, ease, noise, rand, TAU, WHITE, hex, mix, scale, rgb } = __r("core/index.js");
const { hotFirst, flameTongue, simDraw, floorLight, LAYERS } = __r("fx/fire/_lib.js");
const meta = {
name: "Flame pillar",
desc: "The floor cracks and glows, a column of fire erupts white-hot and roars, spewing embers and shedding flame, then collapses into rolling smoke.",
tags: ["fire", "pillar", "eruption", "spell", "ground", "one-shot"],
size: [184, 256],
origin: [92, 232],
duration: 5,
loop: false,
fps: 30,
bg: "ground",
options: {
palette: ["#4a1712", "#8a1f17", "#c9281f", "#f2561d", "#ff8a2a", "#ffc23d", "#ffe26b", "#fff3a6", "#ffffff"],
stone: "#4a3f69",
height: 140,
seed: 5,
},
};
const ERUPT = 0.55, RISE = 0.12, FALL = 1.95, GONE = 2.45, SOOT = hex("#0d0a12"), OUTLINE = hex("#1a1422"), WARM = rgb(255, 176, 96);
function stone(c) {
c = hex(c);
return { light: mix(scale(c, 1.35), WHITE, 0.08), body: c, shade: scale(c, 0.64), dust: mix(scale(c, 1.2), rgb(150, 140, 150), 0.3) };
}
function rock(p, b, st) {
const r = 0.6 + b.s * 0.75, fade = Math.min(1, b.life / 0.5), lx = Math.cos(b.a) * r * 0.4, ly = Math.sin(b.a) * r * 0.4;
p.shade(b.x - r - 1, b.y - r - 1, b.x + r + 1, b.y + r + 1, (x, y, out) => {
const dx = x - b.x, dy = y - b.y, d = Math.hypot(dx * 1.15, dy);
if (d > r + 0.9) return;
const lit = dx * lx + dy * ly;
out.c = d > r ? OUTLINE : lit < -0.4 ? st.light : lit > 0.6 ? st.shade : st.body;
out.a = fade;
});
}
function create(o) {
const F = fit(o.palette, 9), H = hotFirst(F), HMAX = o.height, st = stone(o.stone), R = new Rng(o.seed), floor = () => 0;
const ps = new Particles({ rng: R, ground: floor, sparks: [H[1], H[2], H[4], H[5]] });
const bits = new Bits({ ground: floor }), lights = new Lights();
const GLOW = mix(mix(H[3], H[4], 0.5), WHITE, 0.25), S = o.seed * 13;
const cracks = [];
const crack = (x, y, a, len, t0, w) => {
const pts = [[x, y]];
for (let d = 0; d < len; d += 2) (a += R.range(-0.55, 0.55)), (x += Math.cos(a) * 2), (y += Math.sin(a) * 0.76), pts.push([x, y]);
cracks.push({ pts, t0, grow: R.range(0.22, 0.36), w });
return pts;
};
for (let i = 0; i < 9; i++) {
const a = (i / 9) * TAU + R.range(-0.25, 0.25), pts = crack(R.range(-1, 1), R.range(-0.3, 0.3), a, R.range(20, 40), R.range(0, 0.16), 1);
const j = 3 + R.int(0, pts.length - 6);
if (pts.length > 8) crack(pts[j][0], pts[j][1], a + R.sign() * R.range(0.5, 1), R.range(6, 14), 0.18 + R.range(0, 0.15), 0);
}
const strands = Array.from({ length: 7 }, (_, i) => ({ o: (rand(i, S, 1) - 0.5) * 1.4, w: 0.05 + rand(i, S, 2) * 0.06, f: 1 + rand(i, S, 3) * 2 }));
let t = 0, erupted = false, fell = false;
const height = (tt) => (tt < ERUPT ? 0 : tt < ERUPT + RISE ? HMAX * ease.outCubic((tt - ERUPT) / RISE) : tt < FALL ? HMAX * (1 + 0.05 * noise(tt * 3, S)) : HMAX * (1 - ease.inQuad(clamp((tt - FALL) / (GONE - FALL)))));
const width = (tt) => (tt < ERUPT ? 0 : tt < FALL ? 12 * (1 + 0.45 * Math.exp(-(tt - ERUPT) * 7)) * (0.94 + 0.06 * noise(tt * 9, S + 1)) : 12 * (1 - smooth(FALL, GONE, tt)) + 1.5 * (1 - smooth(GONE - 0.1, GONE, tt)));
const heat = (tt) => smooth(0, ERUPT, tt) * 0.75 + 0.25 * smooth(ERUPT - 0.05, ERUPT + 0.1, tt) - smooth(GONE - 0.3, meta.duration - 0.6, tt) * 1.05;
function column(p) {
const h = height(t), w0 = width(t);
if (h < 1 || w0 < 0.3) return;
if (t < FALL + 0.25) {
const k = clamp(w0 / 12), NZ = (rate, seed, off) => noise(t * rate + off, seed);
for (let i = 0; i < 5; i++) {
const n = (S + i) * 17, dx = (i - 2) * w0 * 0.4, th = (12 + 12 * (0.5 + 0.5 * noise(t * 3.3 + i, n))) * k * (i === 2 ? 1.2 : i % 4 === 0 ? 0.6 : 0.9);
flameTongue(p, dx + noise(t * 2, n + 2) * 1.5, -h + 12, th, 3.4 * k * (i % 4 === 0 ? 0.7 : 1), -dx * 0.3 + noise(t * 2.2, n + 1) * 3, NZ, n, H, LAYERS);
}
}
const lvlC = [H[0], H[1], H[2], H[3], H[4], H[5], H[6], H[7]];
for (let y = 0; y >= -h; y--) {
const v = -y / h, cx = noise(-y * 0.04 + t * 1.6, S + 2) * 1.6 * v;
const foot = 1 + 0.7 * Math.max(0, 1 - -y / 12) ** 2, top = 1 - smooth(0.82, 1, v) * 0.7;
const wl = w0 * foot * top * (1 + 0.65 * Math.max(0, noise(y * 0.2 + t * 8, S + 3)) ** 1.5), wr = w0 * foot * top * (1 + 0.65 * Math.max(0, noise(y * 0.2 + t * 8, S + 4)) ** 1.5);
const pulse = ((-y * 0.032 + t * 3.6) % 1) < 0.09 ? 1 : 0;
for (let x = Math.floor(cx - wl * 1.15); x <= Math.ceil(cx + wr * 1.15); x++) {
const dx = x + 0.5 - cx, q = Math.abs(dx) / (dx < 0 ? wl : wr);
if (q > 1.15) continue;
let lvl = q < 0.12 ? 0 : q < 0.26 ? 1 : q < 0.42 ? 2 : q < 0.56 ? 3 : q < 0.7 ? 4 : q < 0.84 ? 5 : q < 0.96 ? 6 : 7;
for (const s of strands) if (Math.abs(dx / w0 - s.o - 0.06 * Math.sin(t * s.f * 3 + s.o * 9)) < s.w) lvl = Math.max(0, lvl - 1);
lvl = Math.max(0, lvl - pulse);
if (lvl === 7 && rand(x, y, Math.floor(t * 20)) < 0.5) continue;
p.px(x, y, lvlC[lvl]);
}
if (y % 12 === 0) p.glow(cx, y, w0 * 2.4 + 8, GLOW, 0.28 * clamp(w0 / 12));
}
p.glow(0, -h * 0.45, 92, GLOW, 0.3 * clamp(w0 / 12));
}
function cracksDraw(p) {
const k = heat(t);
if (k <= -0.05) return;
for (const c of cracks) {
const n = Math.floor(c.pts.length * clamp((t - c.t0) / c.grow));
for (let i = 1; i < n; i++) {
const u = i / c.pts.length, hot = k * (1 - 0.45 * u), [x0, y0] = c.pts[i - 1], [x1, y1] = c.pts[i];
if (hot < 0) {
const a = 1 + hot * 3;
if (a > 0) p.line(x0, y0, x1, y1, SOOT, a);
continue;
}
const col = hot > 0.85 ? H[1] : hot > 0.65 ? H[2] : hot > 0.45 ? H[4] : hot > 0.25 ? H[5] : hot > 0.1 ? H[6] : H[7];
if (c.w && i < c.pts.length * 0.5 && hot > 0.2) p.line(x0, y0 + 1, x1, y1 + 1, hot > 0.6 ? H[5] : H[6]), p.line(x0, y0 - 1, x1, y1 - 1, H[7]);
p.line(x0, y0, x1, y1, col);
if (i % 2 === 0) p.glow(x1, y1, 5 + 7 * hot, GLOW, 0.3 * hot);
}
}
if (k > 0) floorLight(p, 0, 0.5, 44, 8, GLOW, 0.35 * k);
}
return {
update(dt) {
t += dt;
if (t < ERUPT && R.chance(0.6 * dt * 60 * smooth(0.15, ERUPT, t))) ps.spawn(P.FIRE, R.range(-5, 5), -1, R.range(-6, 6), -R.range(20, 45), R.range(0.15, 0.3), 0, R.range(1, 2.2));
if (t < ERUPT && R.chance(0.5 * dt * 60 * smooth(0, ERUPT, t))) {
const c = R.pick(cracks), i = R.int(0, Math.floor(c.pts.length * clamp((t - c.t0) / c.grow)) - 1);
if (i >= 0) {
const [x, y] = c.pts[i];
if (R.chance(0.5)) ps.spawn(P.FIRE, x, y - 1, R.range(-5, 5), -R.range(15, 35), R.range(0.15, 0.3), 0, R.range(0.8, 1.6));
else ps.spawn(P.EMBER, x, y - 1, R.range(-15, 15), -R.range(30, 70), R.range(0.5, 1), H[3], 1);
}
}
if (!erupted && t >= ERUPT) {
erupted = true;
lights.add(0, -40, 90, WARM, 0.7, 0.6);
lights.add(0, -8, 44, WHITE, 0.7, 0.1);
for (let i = 0; i < 70; i++) {
const a = -Math.PI / 2 + R.range(-1.1, 1.1), sp = R.range(100, 260);
ps.spawn(P.SPARK, R.range(-4, 4), -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.25, 0.7));
}
for (let i = 0; i < 18; i++) bits.add({ kind: B.CHUNK, x: R.range(-6, 6), y: -2, vx: R.range(-110, 110), vy: -R.range(150, 330), g: 1, drag: 0.4, bounce: 0.3, life: R.range(1.6, 2.4), a: R.range(0, TAU), va: R.range(-16, 16), s: R.int(1, 3) });
for (let i = 0; i < 60; i++) {
const a = -Math.PI / 2 + R.range(-0.9, 0.9), sp = R.range(80, 260);
ps.spawn(P.GRIT, R.range(-5, 5), -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 1.8), R.pick([st.light, st.body, st.body, st.shade]), R.chance(0.4) ? 2 : 1);
}
for (let i = 0; i < 14; i++) {
const s = R.sign();
ps.spawn(P.SMOKE, s * R.range(2, 10), -R.range(1, 4), s * R.range(40, 110), -R.range(2, 10), R.range(1, 1.8), st.dust, R.range(4, 7), R.range(0, 0.06), PF.BIG);
}
}
const h = height(t), w = width(t);
if (t > ERUPT && t < GONE && h > 4) {
if (R.chance(0.9 * dt * 60)) {
const s = R.sign(), y = -R.range(4, h * 0.9);
ps.spawn(P.FIRE, s * w * R.range(0.7, 1.1), y, s * R.range(15, 40), -R.range(30, 70), R.range(0.25, 0.5), 0, R.range(1.6, 3.2), 0, R.chance(0.35) ? PF.SMOKES : 0);
}
if (R.chance(0.7 * dt * 60)) ps.spawn(P.FIRE, R.range(-w, w), -h + R.range(0, 6), R.range(-20, 20), -R.range(30, 80), R.range(0.35, 0.7), 0, R.range(3, 5.5), 0, R.chance(0.6) ? PF.SMOKES | (t < FALL - 0.3 ? PF.BIG : 0) : 0);
if (t < FALL && R.chance(0.5 * dt * 60)) ps.spawn(P.EMBER, R.range(-w, w) * 0.6, -h + 4, R.range(-60, 60), -R.range(50, 110), R.range(0.7, 1.3), H[3], R.chance(0.2) ? 2 : 1);
}
if (t >= FALL && !fell) fell = true;
if (fell && t < GONE - 0.1 && R.chance(1.6 * dt * 60)) ps.spawn(P.FIRE, R.range(-w - 2, w + 2), -h - R.range(0, 8), R.range(-30, 30), -R.range(10, 50), R.range(0.4, 0.75), 0, R.range(3.5, 6.5), 0, PF.SMOKES);
bits.update(dt);
for (const b of bits.list)
if (b.rest && !b.dusted) {
b.dusted = true;
for (let i = 0; i < 3; i++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(8, 35), -R.range(2, 18), R.range(0.3, 0.6), st.dust, R.range(1.3, 2.6));
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
cracksDraw(p);
simDraw(p, ps, H, "back");
const k = (t - ERUPT) / 0.45;
if (k > 0 && k < 1) band(p, 0, 0.5, 84 * ease.outCubic(k), 0.18, Math.max(1, 4 * (1 - k)), 1.15 - k, [st.body, st.light, H[4], H[1]], (g) => Math.sin(g) < 0);
},
draw(p) {
column(p);
for (const b of bits.list) rock(p, b, st);
simDraw(p, ps, H, "front");
const k = (t - ERUPT) / 0.45;
if (k > 0 && k < 1) band(p, 0, 0.5, 84 * ease.outCubic(k), 0.18, Math.max(1, 4 * (1 - k)), 1.15 - k, [st.body, st.light, H[4], H[1]], (g) => Math.sin(g) >= 0, k < 0.15);
const f = (t - ERUPT) / 0.08;
if (f > 0 && f < 1) {
p.ellipse(0, -2, 16 * (1 - f * 0.3), 6, H[2]);
p.ellipse(0, -3, 11 * (1 - f * 0.3), 4, f < 0.5 ? WHITE : H[1]);
}
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/impacts/hit-spark.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, WHITE } = __r("core/index.js");
const meta = {
name: "Hit spark",
desc: "The everyday hit: a sharp, lopsided cross flare with one long ray along the blow round a white diamond core, then a cone of sparks and hot chips that fall and bounce.",
tags: ["impact", "hit", "spark", "combat", "directional", "one-shot"],
size: [136, 80],
origin: [44, 64],
duration: 0.5,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#4a1712", "#c9281f", "#f2561d", "#ff8a2a", "#ffe26b", "#fff3a6", "#ffffff"], height: 20, aim: 0.1, seed: 4 },
};
function ray(p, x, y, a, L, w, C, from = 0) {
const c = Math.cos(a), s = Math.sin(a);
for (let d = from * L; d <= L; d += 0.5) {
const u = d / L, hw = w * Math.pow(1 - u, 1.6);
const col = u < 0.3 ? WHITE : u < 0.62 ? C[5] : u < 0.88 ? C[4] : C[3];
p.px(x + c * d, y + s * d, col);
if (hw > 0.45) for (let o = 0.5; o <= hw; o += 0.5) for (const e of [-o, o]) p.px(x + c * d - s * e, y + s * d + c * e, u < 0.3 && o < 1 ? C[5] : C[4]);
}
}
function diamond(p, x, y, r, C) {
for (let dy = -r - 1; dy <= r + 1; dy++)
for (let dx = -r - 1; dx <= r + 1; dx++) {
const m = Math.abs(dx) + Math.abs(dy);
if (m <= r) p.px(x + dx, y + dy, WHITE);
else if (m === r + 1) p.px(x + dx, y + dy, C[3]);
}
}
function create(o) {
const C = fit(o.palette, 7), R = new Rng(o.seed), X = 0, Y = -o.height, A = o.aim, floor = () => 0;
const ps = new Particles({ rng: R, ground: floor, sparks: [C[6], C[5], C[4], C[2]] });
const lights = new Lights();
const tilt = R.range(-0.08, 0.08);
const rays = [
{ a: A + tilt, L: R.range(33, 37), w: 2.2 },
{ a: A + Math.PI + tilt, L: R.range(8, 10), w: 2.2 },
{ a: A - Math.PI / 2 + tilt, L: R.range(15, 18), w: 2.6 },
{ a: A + Math.PI / 2 + tilt, L: R.range(10, 12), w: 2.3 },
{ a: A - Math.PI / 4 + tilt, L: R.range(5, 7), w: 1 },
];
lights.add(X, Y, 38, C[4], 0.35, 0.18);
lights.add(X + Math.cos(A) * 10, Y + Math.sin(A) * 10, 22, C[5], 0.45, 0.1);
lights.add(X, -2, 26, C[3], 0.22, 0.22);
for (let i = 0; i < 9; i++) {
const a = A + R.range(-0.6, 0.6) - 0.15, v = R.range(170, 360);
ps.spawn(P.SPARK, X + 1, Y, Math.cos(a) * v, Math.sin(a) * v - 40, R.range(0.25, 0.45), WHITE, 1, i > 6 ? R.range(0.01, 0.03) : 0);
}
for (let i = 0; i < 6; i++) {
const a = A + R.range(-1.1, 0.5) - 0.3, v = R.range(70, 170);
ps.spawn(P.GRIT, X + 1, Y, Math.cos(a) * v, Math.sin(a) * v - R.range(30, 80), R.range(0.35, 0.45), R.pick([C[5], C[4], C[4], C[3]]), 1);
}
let t = 0;
return {
update(dt) {
t += dt;
ps.update(dt);
lights.update(dt);
},
draw(p) {
ps.draw(p);
if (t < 0.025) {
for (const r of rays) ray(p, X, Y, r.a, r.L, r.w, C);
diamond(p, X, Y, 4, C);
} else if (t < 0.058) {
for (const r of rays) ray(p, X, Y, r.a, r.L * 1.2, r.w * 0.55, C, 0.12);
diamond(p, X, Y, 3, C);
} else if (t < 0.092) {
const r = rays[0];
ray(p, X, Y, r.a, r.L * 1.3, 0.6, [C[0], C[1], C[2], C[3], C[3], C[4]], 0.4);
}
const pop = Math.exp(-t / 0.045);
if (pop > 0.02) {
p.glow(X, Y, 22, C[4], 0.3 * pop);
p.glow(X, Y, 7, WHITE, 0.15 * pop);
p.glowLine(X, Y, X + Math.cos(A) * 26, Y + Math.sin(A) * 26, 4, C[5], 0.25 * pop);
}
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/impacts/blunt-hit.js": function(__r, __exports){
const { Bits, Lights, B, Rng, fit, clamp, ease, TAU, WHITE, mix, hex } = __r("core/index.js");
const { stone, rock, rockShape } = __r("fx/impacts/_lib.js");
const meta = {
name: "Blunt hit",
desc: "A heavy, soft thud: a white-hot lumpy blob cools to cream in a warm pool of light, inked wedges jab out and snap back, a squashed ring of dust puffs swells and drifts, clods drop.",
tags: ["impact", "hit", "blunt", "punch", "club", "thump", "dust", "comic", "one-shot"],
size: [128, 88],
origin: [64, 72],
duration: 0.9,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#1d1620", "#4a3a3c", "#7d6a66", "#b09c90", "#dccab4", "#f6ead2", "#ffffff"], warm: "#ffc98a", dust: "#b7a8a6", clod: "#6e5a5a", height: 22, seed: 9 },
};
const lump = (r, a, ph) => r * (1 + 0.15 * Math.sin(5 * a + ph) + 0.08 * Math.sin(9 * a + ph * 2.3));
function create(o) {
const C = fit(o.palette, 7), R = new Rng(o.seed), X = 0, Y = -o.height, PH = R.range(0, TAU), floor = () => 0;
const WARM = hex(o.warm), DUST = hex(o.dust), st = stone(o.clod);
const lights = new Lights(), bits = new Bits({ ground: floor });
lights.add(X, Y, 48, WARM, 0.6, 0.4);
lights.add(X, Y, 16, WHITE, 0.6, 0.07);
lights.add(X, -2, 36, WARM, 0.25, 0.4);
const wedges = Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * TAU + R.range(-0.2, 0.2), len: R.range(6, 15), w: R.range(3.2, 5), r0: R.range(13, 16), t0: R.range(0.015, 0.04), out: R.range(0.04, 0.06), back: R.range(0.09, 0.14) }));
const puffs = Array.from({ length: 30 }, (_, i) => {
const a = (i / 30) * TAU + R.range(-0.12, 0.12), side = Math.abs(Math.cos(a)), v = R.range(40, 140) * (0.6 + 0.5 * side);
return { x: X + Math.cos(a) * 9, y: Y + Math.sin(a) * 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5, r: R.range(2.4, 6.2) * (0.75 + 0.35 * side), life: R.range(0.35, 0.85), max: 0, t0: R.range(0.03, 0.1), lift: R.range(4, 16) };
});
for (let i = 0; i < 5; i++)
puffs.push({ x: X + R.range(-6, 6), y: Y - R.range(3, 6), vx: R.range(-30, 30), vy: -R.range(20, 45), r: R.range(3.5, 5.5), life: R.range(0.6, 0.85), max: 0, t0: R.range(0.05, 0.1), lift: R.range(14, 24) });
for (const q of puffs) q.max = q.life;
for (let i = 0; i < 5; i++) {
const s = R.sign(), a = -Math.PI / 2 + s * R.range(0.5, 1.3), v = R.range(70, 140);
bits.add({ kind: B.CHUNK, x: X + s * R.range(4, 8), y: Y + R.range(-3, 3), vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 1, drag: 0.6, bounce: 0.28, life: R.range(0.65, 0.85), a: R.range(0, TAU), va: s * R.range(8, 16), s: R.chance(0.4) ? 2 : 1, pts: rockShape(R), pvy: 0 });
}
const kicks = [];
let t = 0;
return {
update(dt) {
t += dt;
for (const q of puffs) {
if (t < q.t0) continue;
q.life -= dt;
q.vx -= q.vx * 4.5 * dt;
q.vy -= q.vy * 4.5 * dt + (q.lift ?? 6) * dt; // they slow, and lift a little as they thin
q.x += q.vx * dt;
q.y += q.vy * dt;
}
for (const b of bits.list) b.pvy = b.vy;
bits.update(dt);
for (const b of bits.list)
if (b.pvy > 60 && b.vy <= 0) {
for (let i = 0; i < 2; i++) kicks.push({ x: b.x, y: -1, vx: R.sign() * R.range(8, 22), vy: -R.range(3, 10), r: R.range(1.2, 2), life: 0.4, max: 0.4, t0: 0 });
b.pvy = 0;
}
for (const q of kicks) {
q.life -= dt;
q.vx -= q.vx * 4 * dt;
q.vy -= q.vy * 4 * dt;
q.x += q.vx * dt;
q.y += q.vy * dt;
}
lights.update(dt);
},
draw(p) {
for (const q of [...puffs, ...kicks]) {
const k = q.life / q.max;
if (t < q.t0 || k <= 0) continue;
const r = q.r * (0.7 + (1 - k) * 0.85), a = Math.pow(k, 1.25) * Math.min(1, (t - q.t0) / 0.03), c = mix(DUST, WARM, clamp(1 - (t - 0.03) / 0.25) * 0.55);
p.disc(q.x, q.y, r, c, (d) => 0.58 * a * (1 - d * d * 0.75));
p.disc(q.x - r * 0.22, q.y - r * 0.32, r * 0.58, mix(c, WHITE, 0.55), (d) => 0.48 * a * (1 - d * d));
}
for (const b of bits.list) rock(p, b, st);
if (t < 0.058) {
const f = t < 0.025 ? 0 : 1, R0 = f ? 13.5 : 11.5;
p.shade(X - R0 * 1.4, Y - R0 * 1.4, X + R0 * 1.4, Y + R0 * 1.4, (x, y) => {
const dx = x - X, dy = (y - Y) * (f ? 1.25 : 1.1), d = Math.hypot(dx, dy), ro = lump(R0, Math.atan2(dy, dx), PH + f * 0.6);
if (d > ro) return;
const q = d / ro;
return f === 0 ? (q < 0.55 ? WHITE : q < 0.86 ? C[5] : C[4]) : q < 0.3 ? WHITE : q < 0.72 ? C[5] : q < 0.9 ? C[4] : C[3];
});
}
for (const w of wedges) {
const u = t - w.t0;
if (u < 0 || u > w.out + w.back) continue;
const s = u < w.out ? ease.outCubic(u / w.out) : 1 - ease.inQuad((u - w.out) / w.back), L = w.len * s;
if (L < 1.5) continue;
const ca = Math.cos(w.a), sa = Math.sin(w.a), r0 = w.r0 + 2 * s, hw = (w.w * (0.6 + 0.4 * s)) / 2;
const tip = [X + ca * r0, Y + sa * r0], end = [X + ca * (r0 + L), Y + sa * (r0 + L)], n = [-sa * hw, ca * hw];
const wedge = (g) => [[tip[0] - ca * g, tip[1] - sa * g], [end[0] + n[0] * (1 + g * 0.45) + ca * g, end[1] + n[1] * (1 + g * 0.45) + sa * g], [end[0] - n[0] * (1 + g * 0.45) + ca * g, end[1] - n[1] * (1 + g * 0.45) + sa * g]];
p.poly(wedge(1), C[1]);
p.poly(wedge(0), u < w.out + 0.02 ? WHITE : C[5]);
}
const pop = Math.exp(-t / 0.06);
if (pop > 0.02) p.glow(X, Y, 28, WARM, 0.5 * pop);
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/impacts/_lib.js": function(__r, __exports){
const { clamp, rand, TAU, hex, mix, scale, rgb, WHITE } = __r("core/index.js");
const SOOT = hex("#0d0a12");
const OUTLINE = hex("#1a1422");
const LIGHT = Math.atan2(-1, -1); // light comes from the top left
function stone(c) {
c = hex(c);
return { light: mix(scale(c, 1.35), WHITE, 0.08), body: c, shade: scale(c, 0.64), dust: mix(scale(c, 1.2), rgb(150, 140, 150), 0.3), lip: mix(scale(c, 1.55), WHITE, 0.12) };
}
function spikes(R, n, aim, { len = [7, 10], w = [1.5, 2.1], fwd = 1.8, back = 0.6, jag = 1, jit = 0.18 } = {}) {
return Array.from({ length: n }, (_, i) => {
const a = aim + (i / n) * TAU + R.range(-jit, jit), cb = Math.cos(a - aim);
const L = R.range(len[0], len[1]) * (1 + fwd * Math.pow(Math.max(0, cb), 3) + back * Math.pow(Math.max(0, -cb), 3)) * (i % 2 ? jag : 1);
return { a, len: L, w: R.range(w[0], w[1]) * (i % 2 ? Math.sqrt(jag) : 1) };
});
}
function star(p, x, y, list, sc, th, [rim, body, inner, core], a = 1, heart = 2.4) {
for (let pass = 0; pass < 3; pass++)
for (const s of list) {
const c = Math.cos(s.a), sn = Math.sin(s.a), L = s.len * sc;
for (let d = 0; d <= L; d += 0.5) {
if (pass === 2 && d > L * 0.55) break;
const hw0 = s.w * th * (1 - d / L) * Math.min(1, 0.5 + d / 3);
const hw = pass === 0 ? hw0 + 0.8 : pass === 1 ? hw0 : hw0 * 0.45;
const col = pass === 0 ? rim : pass === 1 ? (d < L * 0.35 ? inner : body) : core;
for (let o = -hw; o <= hw; o += 0.5) p.dot(x + c * d - sn * o, y + sn * d + c * o, col, a);
}
}
const r = heart * sc * Math.sqrt(th);
p.circle(x, y, r + 0.8, inner, a);
p.circle(x, y, r, core, a);
}
function brokenRing(p, x, y, r, th, segs, brk, c, c2 = c, k = 1, sy = 1, maxY = Infinity) {
if (r <= 0 || k <= 0) return;
const full = TAU / segs.length;
for (const s of segs) {
const span = full * (1 - s.gap * brk) + 0.02, rr = r * (1 + s.dr * brk), m = Math.max(4, Math.ceil(rr * span * 1.8));
for (let j = 0; j <= m; j++) {
const u = j / m, ang = s.a + (u - 0.5) * span, w = Math.max(0.5, th * (s.w ?? 1) * (1 - brk * Math.pow(Math.abs(2 * u - 1), 1.6)));
const ca = Math.cos(ang), sa = Math.sin(ang);
for (let o = -w / 2; o <= w / 2 + 0.01; o += 0.5) if (y + sa * (rr + o) * sy < maxY) p.dot(x + ca * (rr + o), y + sa * (rr + o) * sy, o > -0.26 ? c : c2, k);
}
}
}
function walk(R, x, y, a, L, { jit = 0.55, steer = 0.45, step = [2, 4], maxY = Infinity, d0 = 0 } = {}) {
const pts = [[x, y, d0]];
let d = 0, cur = a;
while (d < L - 0.01) {
const s = Math.min(L - d, R.range(step[0], step[1]));
cur += R.range(-jit, jit) + (a - cur) * steer;
x += Math.cos(cur) * s;
y = clamp(y + Math.sin(cur) * s, 0.5, maxY);
d += s;
pts.push([x, y, d0 + d]);
}
return pts;
}
function makeCracks(R, n, { len = [14, 40], dive = 0.85, maxY = 22, forks = 0.5, x0 = [1, 5] } = {}) {
const out = [];
for (let i = 0; i < n; i++) {
const side = i % 2 ? 1 : -1, dip = 0.06 + Math.pow(R.next(), 1.7) * dive, L = R.range(len[0], len[1]) * (1 - (0.5 * dip) / (dive + 0.06));
const a = side > 0 ? dip : Math.PI - dip, pts = walk(R, side * R.range(x0[0], x0[1]), R.range(0.5, 1.5), a, L, { maxY });
const c = { pts, len: L, t0: R.range(0, 0.035), kids: [] };
for (let j = 2; j < pts.length - 1; j++)
if (R.chance(forks * 0.4)) {
const [fx, fy, fd] = pts[j];
c.kids.push(walk(R, fx, fy, a + R.sign() * R.range(0.45, 1), R.range(3, 9) * (1 - (0.5 * j) / pts.length), { maxY, d0: fd, jit: 0.7, step: [1.5, 3] }));
}
out.push(c);
}
return out;
}
function drawCracks(p, cracks, g, heat, hot, dark, lip, k = 1) {
if (k <= 0) return;
const col = (d) => {
const h = heat(d);
return h > 0.75 ? hot[0] : h > 0.5 ? hot[1] : h > 0.3 ? hot[2] : h > 0.12 ? hot[3] : dark;
};
for (const c of cracks) {
const G = g(c);
if (G <= 0) continue;
for (const path of [c.pts, ...c.kids]) {
for (let i = 1; i < path.length; i++) {
const [x0, y0, d0] = path[i - 1], [x1, y1, d1] = path[i];
if (d0 >= G) break;
const f = d1 > G ? (G - d0) / (d1 - d0) : 1, ex = x0 + (x1 - x0) * f, ey = y0 + (y1 - y0) * f;
p.line(x0, y0 + 1, ex, ey + 1, lip, (u) => (rand(Math.round(x0 + (ex - x0) * u), Math.round(y0 + (ey - y0) * u), 5) < 0.3 ? k * 0.8 : 0));
p.line(x0, y0, ex, ey, (u) => col(d0 + (d1 - d0) * f * u), k);
const h = heat(d0);
if (h > 0.12) p.glow((x0 + ex) / 2, (y0 + ey) / 2, 4 + h * 4, hot[2], 0.22 * h * k);
}
}
}
}
function frontCrescent(p, x, dir, h, w, cols, k = 1) {
if (h < 1 || w < 0.3 || k <= 0) return;
const ry = h * 0.8, cy = -h * 0.2, rx = Math.max(2, h * 0.55);
const x0 = dir > 0 ? x - rx - w - 1 : x - 1, x1 = dir > 0 ? x + 1 : x + rx + w + 1;
p.shade(x0, -h - 1, x1, 0, (px, py, out) => {
if (py > 0) return;
const ey = (py - cy) / ry;
if (ey <= -1 || ey >= 1) return;
const e2 = 1 - ey * ey, edge = rx * Math.sqrt(e2) - rx, wt = w * Math.pow(e2, 0.45), q = (edge - (px - x) * dir) / Math.max(0.5, wt);
if (q < 0 || q > 1) return;
out.c = q < 0.28 ? cols[0] : q < 0.62 ? cols[1] : cols[2];
out.a = k * (ey < -0.8 ? 0.7 : 1) * (q > 0.7 ? 1.25 - q * 0.8 : 1);
});
}
function dustRing(p, cx, cy, r, w, k, c, { sy = 1, ph = 0, brk = 0, lit = 0.35, maxY = Infinity, half = 0 } = {}) {
if (k <= 0.01 || r <= 0) return;
const W = w * 1.6, lite = mix(c, WHITE, lit);
for (let y = Math.floor(cy - (r + W) * sy) - 1; y <= Math.min(maxY - 1, Math.ceil(cy + (r + W) * sy) + 1); y++)
for (let x = Math.floor(cx - r - W) - 1; x <= Math.ceil(cx + r + W) + 1; x++) {
const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) / sy, d = Math.hypot(dx, dy), g = Math.atan2(dy, dx);
if ((half < 0 && dy >= 0) || (half > 0 && dy < 0)) continue;
const lumpy = 0.6 + 0.3 * Math.sin(5 * g + ph) + 0.18 * Math.sin(11 * g + ph * 2.1) + 0.12 * Math.sin(17 * g + ph * 0.7);
const wt = w * lumpy, off = Math.abs(d - r - w * 0.25 * Math.sin(7 * g + ph));
if (off >= wt) continue;
const tear = brk > 0 ? clamp((0.55 + 0.45 * Math.sin(6 * g + ph * 1.7) - brk) / 0.25) : 1;
const a = k * (1 - Math.pow(off / wt, 2)) * tear;
if (a > 0.01) p.blend(x, y, dy < 0 && d > r - wt * 0.3 ? lite : c, a);
}
}
const rockShape = (R, n = 6) => Array.from({ length: n }, () => R.range(0.7, 1.12));
function rock(p, b, st) {
const r = 0.75 + b.s * 0.8, n = b.pts.length, fade = Math.min(1, b.life / 0.5), ca = Math.cos(b.a), sa = Math.sin(b.a);
p.shade(b.x - r - 2, b.y - r - 2, b.x + r + 2, b.y + r + 2, (x, y, out) => {
const dx = x - b.x, dy = y - b.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, d = Math.hypot(u, v);
let ang = Math.atan2(v, u);
if (ang < 0) ang += TAU;
const f = (ang / TAU) * n, i = Math.floor(f) % n, w = f - Math.floor(f), edge = r * (b.pts[i] * (1 - w) + b.pts[(i + 1) % n] * w);
if (d > edge + 0.85) return;
out.a = fade;
if (d > edge) return OUTLINE;
const lit = Math.cos(((i + 0.5) / n) * TAU + b.a - LIGHT);
if (d < edge * 0.42) return lit > 0.55 ? st.light : st.body;
return lit > 0.35 ? st.light : lit < -0.4 ? st.shade : st.body;
});
}
__exports.SOOT = SOOT; __exports.OUTLINE = OUTLINE; __exports.stone = stone; __exports.spikes = spikes; __exports.star = star; __exports.brokenRing = brokenRing; __exports.makeCracks = makeCracks; __exports.drawCracks = drawCracks; __exports.frontCrescent = frontCrescent; __exports.dustRing = dustRing; __exports.rockShape = rockShape; __exports.rock = rock;
},
"fx/impacts/ground-slam.js": function(__r, __exports){
const { Particles, Bits, Lights, P, PF, B, Rng, fit, band, clamp, smooth, ease, TAU, WHITE, mix } = __r("core/index.js");
const { stone, star, makeCracks, drawCracks, frontCrescent, rock, rockShape, SOOT } = __r("fx/impacts/_lib.js");
const meta = {
name: "Ground slam",
desc: "Something lands hard: the floor flashes and cracks, two crescent shock waves race out along it, a dust wave and a tall dust cloud rise, rocks erupt, bounce and settle.",
tags: ["impact", "ground", "slam", "shockwave", "quake", "rocks", "dust", "one-shot"],
size: [288, 208],
origin: [144, 164],
duration: 3.2,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#2a1712", "#5e2c1c", "#a4502a", "#e8893a", "#ffc764", "#fff0b4", "#ffffff"], stone: "#4a3f69", reach: 104, seed: 5 },
};
const WAVE = 0.6; // seconds for the shock fronts to run out
function crater(p, st, hot, C, k) {
for (let x = -12; x <= 11; x++) {
const q = Math.abs(x + 0.5) / 12, dep = Math.round(2.6 * (1 - q * q));
if (q < 0.84) {
for (let y = 0; y < dep; y++) p.dot(x, y, SOOT, k);
p.dot(x, dep, hot > 0.5 ? C[5] : hot > 0.2 ? C[4] : st.lip, k);
} else {
p.dot(x, -1, q > 0.93 ? st.light : st.lip, k);
if (q < 0.9) p.dot(x, -2, st.light, k * 0.8);
}
}
}
function create(o) {
const C = fit(o.palette, 7), st = stone(o.stone), REACH = o.reach, R = new Rng(o.seed), floor = () => 0, D = meta.duration;
const ps = new Particles({ rng: R, ground: floor, sparks: [C[6], C[5], C[4], C[3]] });
const bits = new Bits({ ground: floor }), lights = new Lights(), HOT = [WHITE, C[5], C[4], C[3]];
const dustLit = mix(st.dust, WHITE, 0.2), cracks = makeCracks(R, 10, { len: [22, 58], dive: 0.55, maxY: 22, forks: 0.7, x0: [2, 9] });
const front = (t) => 7 + (REACH - 7) * ease.outCubic(clamp((t - 0.015) / WAVE));
const heat = (t) => Math.pow(clamp(1 - t / 0.8), 1.4);
const crest = (u) => [6 + 28 * Math.pow(1 - u, 0.75), 1.5 + 5 * Math.pow(1 - u, 0.9)]; // a front's height and thickness
const burst = [
{ a: -0.07, len: R.range(34, 40), w: 1.9 }, { a: Math.PI + 0.07, len: R.range(34, 40), w: 1.9 },
{ a: -0.42 + R.range(-0.08, 0.08), len: R.range(15, 20), w: 1.5 }, { a: -Math.PI + 0.42 + R.range(-0.08, 0.08), len: R.range(15, 20), w: 1.5 },
{ a: -Math.PI / 2 + R.range(-0.15, 0.15), len: R.range(18, 24), w: 1.7 },
{ a: -1.05 + R.range(-0.1, 0.1), len: R.range(10, 14), w: 1.2 }, { a: -Math.PI + 1.05 + R.range(-0.1, 0.1), len: R.range(10, 14), w: 1.2 },
];
const embers = [];
for (const c of cracks)
for (const [x, y, d] of c.pts) if (d > 3 && d < 32 && R.chance(0.25)) embers.push({ x, y, d, life: R.range(0.8, 2.2), ph: R.range(0, TAU) });
lights.add(0, -12, 96, C[4], 0.6, 0.6);
lights.add(0, -4, 50, WHITE, 0.9, 0.14);
for (let i = 0; i < 56; i++) {
const low = i < 14, s = R.sign(), a = low ? (s > 0 ? -R.range(0.04, 0.6) : Math.PI + R.range(0.04, 0.6)) : -Math.PI / 2 + R.range(-1.15, 1.15);
const sp = low ? R.range(150, 380) : R.range(200, 500);
ps.spawn(P.SPARK, R.range(-4, 4), -1, Math.cos(a) * sp, Math.sin(a) * sp, low ? R.range(0.2, 0.5) : R.range(0.25, 0.65), WHITE, 1, low ? 0 : R.range(0, 0.05));
}
for (let i = 0; i < 20; i++) {
const s = i < 3 ? 4 : R.int(1, 3), a = -Math.PI / 2 + R.range(-0.5, 0.5), sp = s > 3 ? R.range(110, 190) : R.range(170, 380) * (s > 2 ? 0.8 : 1);
bits.add({ kind: B.CHUNK, x: R.range(-7, 7), y: -2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1, drag: 0.4, bounce: 0.38, life: R.range(1.9, 2.7), a: R.range(0, TAU), va: R.range(-14, 14), s, pts: rockShape(R), pvy: 0 });
}
for (let i = 0; i < 110; i++) {
const u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.65, sp = R.range(110, 380) * (1 - 0.35 * Math.abs(u));
ps.spawn(P.GRIT, u * 6, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 2.2), R.pick([st.light, st.body, st.body, st.shade, st.shade, st.lip]), R.chance(0.35) ? 2 : 1);
}
for (let i = 0; i < 28; i++) {
const core = i < 14, s = R.sign();
ps.spawn(P.SMOKE, core ? R.range(-5, 5) : s * R.range(4, 12), -R.range(2, 10), core ? R.range(-12, 12) : s * R.range(14, 38), -R.range(50, 130) * (core ? 1 : R.range(0.3, 0.6)), R.range(1.9, 2.7), R.chance(0.35) ? dustLit : st.dust, core ? R.range(4.5, 9) : R.range(4, 7.5), R.range(0.02, 0.22), PF.BIG);
}
for (let i = 0; i < 10; i++) {
const s = R.sign();
ps.spawn(P.SMOKE, s * R.range(2, 14), -R.range(2, 6), s * R.range(20, 70), -R.range(4, 20), R.range(1.4, 2.3), st.dust, R.range(6, 9), R.range(0, 0.08), PF.BIG);
}
for (let i = 0; i < 26; i++)
ps.spawn(P.FLAKE, R.range(-22, 22), -R.range(14, 80), R.range(-12, 12), R.range(-10, 4), R.range(1.2, 2), R.chance(0.5) ? st.lip : dustLit, R.range(0.5, 1.2), R.range(0.25, 1));
let t = 0;
const acc = [R.next(), R.next()];
const ring = (p, back) => {
const u = clamp((t - 0.015) / (WAVE + 0.1));
if (t < 0.015 || u >= 0.9) return;
band(p, 0, 0.5, front(t) + 1, 0.16, Math.max(1, 4 * Math.pow(1 - u, 0.8)), u < 0.55 ? 1.1 : (0.9 - u) / 0.35,
u < 0.35 ? [C[3], C[4], C[5], C[6]] : [st.body, st.light, C[4], C[5]], (g) => Math.sin(g) < 0 === back, t < 0.09);
};
const fronts = (p) => {
const u = clamp((t - 0.03) / (WAVE + 0.16));
if (t < 0.03 || u >= 1) return;
const fr = front(t), [h, w] = crest(u), k = u < 0.7 ? 1 : (1 - u) / 0.3;
const cols = u < 0.14 ? [WHITE, C[6], C[5]] : u < 0.34 ? [C[6], C[5], C[4]] : u < 0.55 ? [C[5], C[4], st.lip] : [st.lip, st.light, st.dust];
for (const s of [-1, 1]) {
frontCrescent(p, s * fr, s, h, w, cols, k);
p.glow(s * fr, -h * 0.3, 8 + h * 0.7, C[4], 0.5 * (1 - u) * k);
}
};
return {
update(dt) {
t += dt;
const u = clamp((t - 0.015) / WAVE);
if (u > 0 && u < 1) {
const fr = front(t), [h] = crest(u);
for (let k = 0; k < 2; k++) {
const s = k ? 1 : -1;
for (acc[k] += dt * 120 * (1 - u * 0.7); acc[k] > 1; acc[k]--) {
ps.spawn(P.SMOKE, s * (fr - R.range(1, 7)), -R.range(0.5, 3), s * R.range(15, 70) * (1 - u), -R.range(2, 12), R.range(1, 2.1), R.chance(0.3) ? dustLit : st.dust, R.range(2.5, 6.5) * (1 - 0.4 * u), 0, PF.BIG);
if (R.chance(0.5)) ps.spawn(P.DUST, s * (fr - R.range(0, 3)), -R.range(0.3, 0.9) * h, s * R.range(-15, 25), -R.range(8, 35), R.range(0.3, 0.6), R.chance(0.5) ? dustLit : st.dust, R.range(1.2, 2.4));
if (R.chance(0.4)) ps.spawn(P.GRIT, s * fr, -1, s * R.range(10, 60), -R.range(40, 140) * (1 - u), R.range(0.5, 1), R.pick([st.light, st.body, st.lip]), 1);
if (u < 0.45 && R.chance(0.2)) ps.spawn(P.SPARK, s * fr, -1, s * R.range(60, 200), -R.range(30, 160), R.range(0.12, 0.3));
}
}
}
for (const b of bits.list) b.pvy = b.vy;
bits.update(dt);
for (const b of bits.list)
if (b.pvy > 70 && b.vy <= 0) {
const n = b.pvy > 200 ? 3 : 2;
for (let i = 0; i < n; i++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(8, 35), -R.range(2, 16), R.range(0.3, 0.65), st.dust, R.range(1.3, 2.4) * (0.7 + b.s * 0.25));
b.pvy = 0;
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
const fade = 1 - smooth(D - 0.9, D - 0.15, t), H = heat(t);
if (t > 0.02) crater(p, st, H, C, fade);
drawCracks(p, cracks, (c) => c.len * ease.outCubic(clamp((t - c.t0) / 0.1)), (d) => H * clamp(1.2 - d / 40), HOT, SOOT, st.light, fade);
for (const e of embers) {
const k = 1 - (t - 0.1) / e.life;
if (t < 0.1 || k <= 0) continue;
const f = 0.6 + 0.4 * Math.sin(t * 23 + e.ph);
p.px(e.x, e.y, k * f > 0.55 ? C[5] : k * f > 0.25 ? C[4] : C[3]);
p.glow(e.x, e.y, 4, C[4], 0.35 * k * f);
}
ring(p, true);
ps.draw(p, "back");
},
draw(p) {
ring(p, false);
fronts(p);
for (const b of bits.list) rock(p, b, st);
ps.draw(p, "front");
if (t < 0.035) {
p.ellipse(0, 0, 30, 4.5, (d) => (d > 0.8 ? C[4] : d > 0.5 ? C[6] : WHITE));
star(p, 0, -1, burst, 1, 1, [C[4], C[6], WHITE, WHITE]);
} else if (t < 0.07) star(p, 0, -1, burst, 1.25, 0.5, [C[3], C[5], C[6], WHITE]);
if (t < 0.14) p.glowLine(-80, 0, 80, 0, 10, C[5], 0.55 * (1 - t / 0.14));
const H = heat(t);
if (H > 0) p.glow(0, 1, 46, C[4], 0.35 * H);
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/lightning/lightning-strike.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, sparkle, clamp, smooth, ease, rand, rng, TAU, WHITE, hex, mix } = __r("core/index.js");
const { VOLT, PLASMA, SOOT, SOOT2, zigzag, bend, stroke, crackle, trace, scorch, heat } = __r("fx/lightning/_lib.js");
const meta = {
name: "Lightning strike",
desc: "A targeted strike: a sigil charges on the floor, the scene darkens, a thick bolt slams into it, arcs race out along the cracks it splits, the channel crumbles to a scorch.",
tags: ["lightning", "electric", "strike", "spell", "target", "impact", "ground", "one-shot"],
size: [240, 264],
origin: [120, 228],
duration: 3,
loop: false,
fps: 30,
bg: "ground",
options: { palette: VOLT, sparks: PLASMA, seed: 5 },
};
const W = 120, TOP = -224, RX = 28, SY = 0.22, REACH = 52, LEAD0 = 0.48, STEPS = 9, MEET = -30;
const STROKES = [{ t: 0.76, k: 1 }, { t: 1.04, k: 0.8 }, { t: 1.26, k: 0.55 }];
const FLICK = [1, 0.72, 0.3, 0.95, 0.5, 0.8, 0.22];
const level = (a) => (a < 0 ? 0 : FLICK[Math.floor(a * 30 + 1e-4)] ?? 0);
const NIGHT = hex("#04030a"), DUST = hex("#6e6382"), ASH = hex("#5b5566"), STONE = ["#655b7a", "#4a4263", "#342d45"].map(hex);
const S1 = STROKES[0].t;
function cracks(R) {
const out = [];
const grow = (x, y, a, len, w, d, depth) => {
const pts = [[x, y, d]];
for (let s = 0; s < len; s += 1.5) {
a += R.range(-0.32, 0.32);
x += Math.cos(a) * 1.5;
y = clamp(y + Math.sin(a) * 0.45, 0, 5);
d += 1.5;
pts.push([x, y, d]);
if (depth < 2 && s > 3 && R.chance(0.09)) grow(x, y, a + R.sign() * R.range(0.5, 1.2), (len - s) * R.range(0.3, 0.6), w * 0.6, d, depth + 1);
}
out.push({ pts, w });
};
for (let i = 0; i < 6; i++) grow(R.range(-1, 1), R.range(0, 1), i % 2 ? R.range(-0.5, 0.7) : Math.PI + R.range(-0.7, 0.5), REACH * R.range(0.55, 1), 1, 0, 0);
return out;
}
function sigil(p, t, C, k, near) {
const reveal = clamp(t / 0.22), spin = t * 0.8, burnt = t > S1 ? t - S1 : -1;
if (burnt > 0.45) return;
const a0 = burnt < 0 ? 1 : burnt < 0.07 ? 1 : 1 - (burnt - 0.07) / 0.38, hot = burnt >= 0 && burnt < 0.07;
const on = (a) => Math.sin(a) >= 0 === near;
const from = (a) => Math.abs((((a - Math.PI / 2) % TAU) + TAU + Math.PI) % TAU - Math.PI) / Math.PI;
for (let i = 0; i < 22; i++) {
const a = (i / 22) * TAU + spin;
if (!on(a) || from(a) > reveal) continue;
for (const da of [0, 0.06, 0.12]) {
const x = Math.cos(a + da) * RX, y = Math.sin(a + da) * RX * SY;
p.dot(x, y, hot ? WHITE : near ? (k > 0.7 ? C[6] : C[5]) : k > 0.7 ? C[4] : C[3], a0);
if (near) p.dot(x, y + 1, hot ? C[6] : C[2], a0);
}
if (i % 3 === 0) p.glow(Math.cos(a) * RX, Math.sin(a) * RX * SY, 5, C[4], 0.3 * k * a0);
}
for (let j = 0; j < 4; j++) {
const a = spin * -0.5 + (j * TAU) / 4 + Math.PI / 4;
if (!on(a) || reveal < 1) continue;
p.line(Math.cos(a) * (RX - 5), Math.sin(a) * (RX - 5) * SY, Math.cos(a) * (RX + 5), Math.sin(a) * (RX + 5) * SY, hot ? WHITE : near ? C[6] : C[4], a0);
}
if (t > 0.3)
for (let a = 0; a < TAU; a += 0.09) {
if (!on(a)) continue;
p.dot(Math.cos(a) * 14, Math.sin(a) * 14 * SY, hot ? WHITE : near ? C[4] : C[2], a0 * clamp((t - 0.3) / 0.12));
}
if (near && burnt < 0) {
const pulse = 0.6 + 0.4 * Math.sin(t * (10 + 30 * k));
p.px(0, 0, k > 0.5 ? WHITE : C[6]);
for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1]]) p.px(dx, dy, C[5]);
p.glow(0, -1, 10 + 10 * k, C[5], 0.3 + 0.4 * k * pulse);
}
}
function keep(b) {
const paths = [];
for (const q of b.paths) {
const pts = [];
for (const pt of q.pts) {
if (Math.abs(pt[0]) > W - 5 || pt[1] > -3 || pt[1] < TOP + 6) break;
pts.push(pt);
}
if (q.w >= 1 || pts.length > 3) paths.push({ w: q.w, pts: q.w >= 1 ? q.pts : pts });
}
return { paths };
}
function create(o) {
const C = fit(o.palette, 8), R = new Rng(o.seed), floor = () => 0;
const ps = new Particles({ rng: R, ground: floor, sparks: o.sparks }), hot = new Particles({ rng: R, ground: floor }), lights = new Lights();
const X0 = R.range(8, 18) * (R.chance(0.5) ? 1 : -1);
const main = keep(zigzag(R, X0, TOP, 0, -1, 0.17, 0.5)), trunk = main.paths[0].pts;
const drift = (dx) => (x, y) => [x + dx * Math.sin((Math.PI * y) / TOP), y];
const bolts = [main, bend({ paths: [{ pts: trunk, w: 1 }] }, drift(1.5)), bend({ paths: [{ pts: trunk, w: 1 }] }, drift(3))];
const chan = (i) => bolts[i].paths[0].pts, last = STROKES[STROKES.length - 1], end = chan(STROKES.length - 1);
const tree = cracks(R);
const gone = end.map(([, y], i) => last.t + 0.25 + 0.75 * (0.55 * rand(o.seed, i, 5) + 0.45 * (1 - y / TOP)));
let t = 0, struck = -1;
const now = () => {
for (let i = STROKES.length - 1; i >= 0; i--) if (t >= STROKES[i].t) return { i, s: STROKES[i], a: t - STROKES[i].t, k: level(t - STROKES[i].t) * STROKES[i].k };
return null;
};
const charge = () => clamp(t / S1) ** 1.5;
const heatAt = () => (struck < 0 ? 0 : Math.max(...STROKES.slice(0, struck + 1).map((s) => s.k * Math.pow(clamp(1 - (t - s.t) / 1.6), 1.4))));
return {
update(dt) {
t += dt;
for (const [i, s] of STROKES.entries()) {
if (struck >= i || t < s.t) continue;
struck = i;
const k = s.k;
lights.add(0, -50, 120, C[4], 0.55 * k, 0.4);
lights.add(0, -3, 24, WHITE, 0.5 * k, 0.1);
for (let j = 0; j < Math.round(44 * k); j++) {
const a = -Math.PI / 2 + R.range(-1.3, 1.3), sp = R.range(110, 320) * (0.65 + 0.35 * k);
ps.spawn(P.SPARK, R.range(-1.5, 1.5), -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.2, 0.55));
}
for (let j = 0; j < Math.round(12 * k); j++) {
const a = -Math.PI / 2 + R.range(-1.2, 1.2), sp = R.range(70, 220);
hot.spawn(P.SPARK, R.range(-2, 2), -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.5, 1));
}
for (let j = 0; j < Math.round(5 * k); j++) hot.spawn(P.EMBER, R.range(-4, 4), -2, R.range(-25, 25), -R.range(30, 80), R.range(0.8, 1.5));
for (let j = 0; j < Math.round(18 * k); j++) {
const a = -Math.PI / 2 + R.range(-1.1, 1.1), sp = R.range(50, 190);
ps.spawn(P.GRIT, R.range(-3, 3), -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 1.5), R.pick(STONE), R.chance(0.35) ? 2 : 1);
}
for (let j = 0; j < 8; j++) ps.spawn(P.DUST, R.range(-3, 3), -1, R.sign() * R.range(30, 110), -R.range(4, 24), R.range(0.4, 0.8), DUST, R.range(1.5, 3));
for (let j = 0; j < Math.round(4 * k); j++) ps.spawn(P.SMOKE, R.range(-8, 8), -4, R.range(-10, 10), -R.range(10, 25), R.range(1.1, 1.6), mix(ASH, C[2], 0.3), R.range(3, 6), R.range(0.05, 0.25));
}
if (struck >= 0 && t < 1.7 && R.chance(6 * dt)) ps.spawn(P.SMOKE, R.range(-8, 8), -2, R.range(-4, 4), -R.range(9, 17), R.range(1, 1.3), 0, R.range(2, 3.5));
for (let i = 0; i < gone.length - 1; i++)
if (gone[i] <= t && gone[i] > t - dt && rand(o.seed, i, 6) < 0.5) {
const [x, y] = end[i];
ps.spawn(P.MOTE, x, y, R.range(-8, 8), R.range(6, 22), R.range(0.4, 0.8), R.chance(0.5) ? C[5] : C[4], R.range(0.5, 0.9));
}
ps.update(dt);
hot.update(dt);
lights.update(dt);
},
drawBack(p) {
const dark = 0.5 * smooth(0.46, 0.66, t) * (1 - smooth(S1 - 0.01, S1 + 0.02, t));
if (dark > 0.01)
for (let y = -228; y < 36; y++)
for (let x = -W; x < W; x++) {
const d = Math.hypot(x / W, (y + 96) / 132), a = dark * (1 - smooth(0.55, 1, d));
if (a > 0.01) p.blend(x + 0.5, y + 0.5, NIGHT, a);
}
sigil(p, t, C, charge(), false);
if (struck >= 0) {
const s = now(), front = REACH * ease.outCubic(clamp((t - S1) / 0.35)), T0 = heatAt(), fade = 1 - smooth(2.3, 2.95, t);
const elec = s.a < 0.14 ? s.s.k * (1 - s.a / 0.14) : 0;
for (const br of tree)
for (const [x, y, d] of br.pts) {
if (d > front) break;
const q = d / REACH, n = rand(Math.round(x * 2), Math.round(y * 2), 9), fresh = d > front - 6 && front < REACH;
const T = T0 * (1.15 - q) * (br.w < 1 ? 0.8 : 1) - n * 0.25, c = fresh || (elec > 0.3 && n < 0.85) ? (q < 0.5 ? WHITE : C[6]) : heat(T) || SOOT2;
p.dot(x, y + 1, SOOT, fade);
p.dot(x, y, c, fade);
if (br.w >= 1 && d < 9) p.dot(x, y + 2, SOOT, fade);
if ((fresh || elec > 0.3) && (Math.round(d) & 3) === 0) p.glow(x, y, 7, C[5], 0.4);
else if (T > 0.2 && (Math.round(d) & 3) === 0) p.glow(x, y, 5, c, 0.2 * T);
}
scorch(p, 0, 0, 12, T0, fade);
if (T0 > 0) p.glow(0, -2, 34, heat(0.55), 0.3 * T0);
}
ps.draw(p, "back");
hot.draw(p, "back");
},
draw(p) {
const s = now(), f = Math.floor(t * 30 + 1e-4), k = charge();
sigil(p, t, C, k, true);
if (t > 0.15 && t < S1) {
const r = rng(o.seed, 61, f);
for (let i = 0; i < Math.round(1 + 4 * k); i++) {
const a = r.range(0, TAU), x = Math.cos(a) * RX, y = Math.sin(a) * RX * SY;
crackle(p, zigzag(r, x, y, x + r.range(-2.5, 2.5), y - r.range(4, 9) * (0.6 + k), 0.45, 0.3), 0.45 + 0.4 * k, C, 0.3);
}
p.glow(0, -2, 36, C[4], 0.12 + 0.3 * k);
}
if (t >= LEAD0 && t < S1) {
const u = clamp((t - LEAD0) / (S1 - LEAD0)), st = Math.min(STEPS, Math.floor(u * STEPS) + 1), fresh = 1 - ((u * STEPS) % 1);
const reach = TOP + (MEET - TOP) * Math.pow(st / STEPS, 1.2), prev = TOP + (MEET - TOP) * Math.pow((st - 1) / STEPS, 1.2);
for (const q of main.paths) {
const tk = q.w >= 1;
for (let i = 0; i < q.pts.length - 1; i++) {
const [ax, ay] = q.pts[i], [bx, by] = q.pts[i + 1];
if (by > reach) {
if (ay <= reach && i > 0) (p.px(ax, ay, WHITE), p.glow(ax, ay, 7, C[5], 0.5 * fresh + 0.15));
break;
}
const young = by > prev;
p.line(ax, ay, bx, by, young ? (fresh > 0.4 ? (tk ? C[6] : C[5]) : C[4]) : tk ? C[3] : C[2]);
if (i % 4 === 0 && ay > TOP + 14) p.glow(ax, ay, young ? 8 : 5, C[4], young ? 0.3 * fresh + 0.1 : 0.12);
}
}
if (t > 0.62) {
const h = -MEET * ease.outQuad((t - 0.62) / (S1 - 0.62)), r = rng(o.seed, 77, f);
const b = zigzag(r, 0, -1, r.range(-2, 2), -Math.max(3, h), 0.3, 0.3), tip = b.paths[0].pts.at(-1);
crackle(p, b, 0.85, C, 0.45);
p.px(tip[0], tip[1], WHITE);
p.glow(tip[0], tip[1], 9, C[5], 0.5);
}
}
const next = STROKES.find((q) => q.t > t);
if (next && next !== STROKES[0] && t > next.t - 0.06) {
const tr = chan(STROKES.indexOf(next)), u = (t - (next.t - 0.06)) / 0.06, i1 = Math.floor(u * tr.length);
trace(p, tr, C[3], 1);
trace(p, tr, C[6], 1, i1 - 18, i1);
for (let i = Math.max(0, i1 - 18); i < Math.min(tr.length, i1); i += 4) if (tr[i][1] > TOP + 14) p.glow(tr[i][0], tr[i][1], 9, C[4], 0.35);
} else if (s && s.k > 0) {
const hero = s.i === 0 && s.a < 1 / 30;
stroke(p, bolts[s.i], s.k, C, s.i === 0 ? 1.5 : 1.2, { hero, core: s.k > 0.6 ? (hero ? 1.2 : 0.8) : 0, minY: TOP + 14 });
const r = 4.5 * s.k;
p.circle(0, -1, r + 1.5, C[2]);
p.circle(0, -1, r + 0.5, C[5]);
p.circle(0, -1, r * 0.65, WHITE);
if (s.a < 0.07) sparkle(p, 0, -2, Math.round(12 * s.k * (1 - s.a / 0.07)), C[6], C[4], 0.25);
p.glow(0, -16, 96, C[3], 0.42 * s.k);
p.glow(0, -3, 22, C[5], 0.3 * s.k);
if (hero) p.glow(X0 * 0.5, -110, 170, C[3], 0.3);
} else if (s) {
const crumble = s.i === STROKES.length - 1, cool = clamp((s.a - 0.23) / 0.45), tr = chan(s.i);
for (let i = 0; i < tr.length - 1; i++) {
if (crumble && t >= gone[i]) continue;
const h = crumble ? 1 - clamp((t - last.t - 0.23) / (gone[i] - last.t - 0.23)) : 1 - cool;
p.line(tr[i][0], tr[i][1], tr[i + 1][0], tr[i + 1][1], h > 0.7 ? C[5] : h > 0.4 ? C[4] : h > 0.15 ? C[3] : C[2]);
if (i % 6 === 0 && h > 0.3 && tr[i][1] > TOP + 14) p.glow(tr[i][0], tr[i][1], 6, C[4], 0.15 * h);
}
}
if (s && s.a < 0.4) {
const r = rng(o.seed, 91, f), run = s.i === 0 ? REACH * ease.outCubic(clamp(s.a / 0.35)) : REACH * clamp(s.a / 0.22);
for (const br of tree) {
if (br.w < 1 || r.next() < 0.3) continue;
const i1 = br.pts.findIndex(([, , d]) => d > run), j1 = i1 < 0 ? br.pts.length : i1, j0 = Math.max(0, j1 - r.int(7, 13));
const pts = br.pts.slice(j0, j1).map(([x, y]) => [x + r.range(-0.6, 0.6), y - 1.5 - r.range(0, 2.5)]);
if (pts.length > 1) crackle(p, { paths: [{ pts, w: 1 }] }, 0.9 * (1 - s.a / 0.4) + 0.1, C, 0.35);
}
}
ps.draw(p, "front");
hot.draw(p, "front");
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/lightning/_lib.js": function(__r, __exports){
const { clamp, rand, rng, hash, Rng, GRAVITY, FIRE_RAMP, SMOKE_RAMP, hex, mix } = __r("core/index.js");
const VOLT = ["#120a33", "#2a1b78", "#4630c0", "#5a62f0", "#58a6ff", "#9ed8ff", "#e4f6ff", "#ffffff"];
const PLASMA = ["#ffffff", "#c8f8ff", "#7ff3ff", "#1ab8e6"];
const SOOT = hex("#110c16"), SOOT2 = hex("#1c1522");
function zigzag(R, x0, y0, x1, y1, jag = 0.32, forks = 0.35, w = 1, depth = 0) {
const out = { paths: [] }, L = Math.hypot(x1 - x0, y1 - y0);
let pts = [[x0, y0], [x1, y1]], off = L * jag;
while (pts.length < 2 + L / 3) {
const nxt = [pts[0]];
for (let i = 0; i < pts.length - 1; i++) {
const [ax, ay] = pts[i], [bx, by] = pts[i + 1], l = Math.hypot(bx - ax, by - ay) || 1, o = R.range(-off, off);
nxt.push([(ax + bx) / 2 + (-(by - ay) / l) * o, (ay + by) / 2 + ((bx - ax) / l) * o], [bx, by]);
}
pts = nxt;
off *= 0.52;
}
out.paths.push({ pts, w });
if (depth < 2)
for (let i = 2; i < pts.length - 3; i++)
if (R.chance(forks / (1 + depth) / Math.max(4, pts.length / 6))) {
const [ax, ay] = pts[i], [bx, by] = pts[Math.min(pts.length - 1, i + 3)];
const a = Math.atan2(by - ay, bx - ax) + R.sign() * R.range(0.35, 0.9), l = (L - (i / pts.length) * L) * R.range(0.25, 0.55);
out.paths.push(...zigzag(R, ax, ay, ax + Math.cos(a) * l, ay + Math.sin(a) * l, jag * 1.1, forks, w * 0.55, depth + 1).paths);
}
return out;
}
function bowed(R, x0, y0, x1, y1, bow, jag = 0.22, forks = 0.4) {
const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
const mx = (x0 + x1) / 2 + nx * bow + R.range(-2, 2), my = (y0 + y1) / 2 + ny * bow;
const a = zigzag(R, x0, y0, mx, my, jag, forks), b = zigzag(R, mx, my, x1, y1, jag, forks);
return { paths: [{ pts: [...a.paths[0].pts, ...b.paths[0].pts.slice(1)], w: 1 }, ...a.paths.slice(1), ...b.paths.slice(1)] };
}
function bend(b, fn) {
return { paths: b.paths.map((q) => ({ w: q.w, pts: q.pts.map(([x, y]) => fn(x, y)) })) };
}
const N = 1024, HALF = 512, GRID = new Uint8Array(N * N), HIT = [];
function mark(x, y, lvl) {
const X = Math.floor(x) + HALF, Y = Math.floor(y) + HALF;
if (X < 0 || Y < 0 || X >= N || Y >= N) return;
const i = Y * N + X, v = GRID[i];
if (!v) HIT.push(i);
if (lvl > v) GRID[i] = lvl;
}
function stamp(x, y, r, lvl) {
if (r <= 0.5) return mark(Math.round(x), Math.round(y), lvl);
const r2 = r * r;
for (let py = Math.floor(y - r); py <= Math.ceil(y + r); py++) {
const dy = py + 0.5 - y;
for (let px = Math.floor(x - r); px <= Math.ceil(x + r); px++) {
const dx = px + 0.5 - x;
if (dx * dx + dy * dy <= r2) mark(px, py, lvl);
}
}
}
function flush(p, cols, alphas) {
for (const i of HIT) {
const v = GRID[i];
GRID[i] = 0;
const x = (i % N) - HALF, y = ((i / N) | 0) - HALF, a = alphas ? alphas[v - 1] : 1;
if (a >= 1) p.px(x, y, cols[v - 1]);
else if (a > 0) p.dot(x, y, cols[v - 1], a);
}
HIT.length = 0;
}
const walk = (pts, fn) => {
for (let i = 0; i < pts.length - 1; i++) {
const [ax, ay] = pts[i], [bx, by] = pts[i + 1], l = Math.max(1, Math.hypot(bx - ax, by - ay));
for (let d = 0; d <= l; d += 0.5) fn(ax + ((bx - ax) * d) / l, ay + ((by - ay) * d) / l, i);
}
};
function stroke(p, b, k, C, s = 1, o = {}) {
if (k <= 0.02) return;
const lk = o.light ?? 0.5;
for (const q of b.paths) {
const trunk = q.w >= 1;
if (!trunk && k < 0.5) continue;
const rh = (trunk ? (k > 0.6 ? 2.1 : 1.6) : 1.1) * s, rb = (trunk ? (k > 0.6 ? 1.3 : 0.8) : 0.5) * s;
const pts = o.upTo !== undefined && trunk ? q.pts.slice(0, Math.max(2, Math.ceil(q.pts.length * o.upTo))) : q.pts;
walk(pts, (x, y) => {
stamp(x, y, rh, 1);
stamp(x, y, rb, trunk ? 3 : 2);
if (trunk && k > 0.3) o.core ? stamp(x, y, o.core, 4) : mark(x, y, 4);
});
for (let i = 0; i < pts.length - 1; i += 3) if (o.minY === undefined || pts[i][1] > o.minY) p.glow(pts[i][0], pts[i][1], (trunk ? 14 : 7) * s, C[4], lk * k * q.w);
}
const a = o.a ?? 1;
flush(p, o.hero ? [C[3], C[6], C[7], C[7]] : [C[2], C[4], C[5], C[7]], [a, a, a, a]);
}
function crackle(p, b, k, C, glowK = 0.5, a = 1) {
if (k <= 0.02) return;
for (const q of b.paths) {
const thick = q.w >= 1;
walk(q.pts, (x, y) => {
if (k > 0.45 && thick) for (const [dx, dy] of CROSS) mark(x + dx * 1.5, y + dy * 1.5, 1);
if (k > 0.25 && (thick || q.w > 0.4)) (mark(x + 1, y, 2), mark(x, y + 1, 2));
mark(x, y, thick && k > 0.3 ? 4 : 3);
});
for (let i = 0; i < q.pts.length - 1; i += 3) p.glow(q.pts[i][0], q.pts[i][1], (thick ? 9 : 5) * (0.5 + k * 0.5), C[4], glowK * k * q.w);
}
flush(p, [C[3], C[5], C[5], C[7]], [Math.min(1, (k - 0.45) * 1.6) * a, a, a, a]);
}
const CROSS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function trace(p, pts, c, a = 1, from = 0, to = pts.length - 1) {
for (let i = Math.max(0, from); i < Math.min(to, pts.length - 1); i++) p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c, a);
}
function scorch(p, cx, cy, rx, T0, fade = 1, ry = Math.max(2.5, rx * 0.12)) {
if (fade <= 0) return;
for (let y = Math.floor(cy); y <= cy + ry; y++)
for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = Math.sqrt(dx * dx + dy * dy);
if (d > 1) continue;
const n = rand(x, y, 41), T = T0 * (1.25 - d) - n * 0.35;
if (T > 0.06) {
const c = FIRE_RAMP[Math.min(FIRE_RAMP.length - 1, Math.floor((1 - Math.min(1, T)) * (FIRE_RAMP.length - 1)))];
p.dot(x, y, c, fade);
if ((x & 3) === 0) p.glow(x + 0.5, y, 6, c, 0.18 * T * fade);
} else p.dot(x, y, d < 0.5 ? SOOT : SOOT2, (d < 0.95 - n * 0.3 ? 1 : 1 - d) * fade);
}
}
const heat = (T) => (T > 0.06 ? FIRE_RAMP[Math.min(FIRE_RAMP.length - 1, Math.floor((1 - Math.min(1, T)) * (FIRE_RAMP.length - 1)))] : 0);
function flight(x, y, vx, vy, age, { g = 0.45, drag = 2.2, floor = Infinity, bounce = 0.45 } = {}) {
const dt = 1 / 120;
for (let s = 0; s < age; s += dt) {
const h = Math.min(dt, age - s);
vy += GRAVITY * g * h;
vx -= vx * drag * h;
vy -= vy * drag * h;
const ny = y + vy * h;
x += vx * h;
if (vy > 0 && y <= floor && ny >= floor) (vy = -vy * bounce), (vx *= 0.7), (y = floor - 0.25);
else y = ny;
}
return [x, y, vx, vy];
}
function spark(p, x, y, vx, vy, k, S) {
const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, head = k > 0.6 ? S[0] : k > 0.3 ? S[1] : S[2], len = Math.min(9, 1 + sp * 0.022);
p.line(x - ux * len, y - uy * len, x - ux * len * 0.4, y - uy * len * 0.4, k > 0.5 ? head : S[S.length - 1]);
p.line(x - ux * len * 0.45, y - uy * len * 0.45, x, y, head);
p.glow(x, y, 3, head, 0.45 * k);
}
function puff(p, x, y, size, u, c) {
const k = 1 - u, r = size * (0.65 + Math.min(1, u * 2.5) * 0.45 + u * 0.4), a = Math.min(1, u * 12) * Math.min(1, k * 2.4) * 0.58;
if (a <= 0.01) return;
const col = mix(c, SMOKE_RAMP[Math.min(SMOKE_RAMP.length - 1, Math.floor(u * SMOKE_RAMP.length))], u);
p.disc(x, y, r, col, a * 0.45);
p.disc(x + r * 0.05, y + r * 0.06, r * 0.74, col, a * 0.62);
if (u < 0.5) p.disc(x - r * 0.22, y - r * 0.3, r * 0.5, mix(col, hex("#ffffff"), 0.12), a * 0.4 * (1 - u * 2));
}
const frameRng = (seed, f, salt = 0) => rng(seed, salt, f);
__exports.rand = rand; __exports.rng = rng; __exports.hash = hash; __exports.Rng = Rng; __exports.clamp = clamp; __exports.VOLT = VOLT; __exports.PLASMA = PLASMA; __exports.SOOT = SOOT; __exports.zigzag = zigzag; __exports.bowed = bowed; __exports.bend = bend; __exports.stroke = stroke; __exports.crackle = crackle; __exports.trace = trace; __exports.scorch = scorch; __exports.heat = heat; __exports.flight = flight; __exports.spark = spark; __exports.puff = puff; __exports.frameRng = frameRng;
},
"fx/lightning/zap-hit.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, clamp, smooth, rng, TAU, WHITE, hex, mix } = __r("core/index.js");
const { VOLT, zigzag, stroke, crackle } = __r("fx/lightning/_lib.js");
const meta = {
name: "Zap hit",
desc: "A contact zap: an arc snaps in from the left, the hit point overloads into a knot of tiny crackling zigzags, a fern of burn marks glows outward, sparks jink away, ozone puffs.",
tags: ["lightning", "electric", "hit", "impact", "combat", "directional", "one-shot"],
size: [144, 112],
origin: [76, 56],
duration: 0.9,
loop: false,
fps: 30,
bg: "dark",
options: { palette: VOLT, seed: 3 },
};
const SNAP = 0.05, ASH = hex("#6a6680");
function fern(R) {
const out = [];
const grow = (x, y, a, len, w, d, depth) => {
const pts = [[x, y, d]];
let side = R.sign();
for (let s = 0; s < len; s += 1.4) {
a += R.range(-0.3, 0.3);
x += Math.cos(a) * 1.4;
y += Math.sin(a) * 1.4;
d += 1.4;
pts.push([x, y, d]);
if (depth < 2 && s > 2 && R.chance(0.24)) {
side = -side;
grow(x, y, a + side * R.range(0.55, 1.05), (len - s) * R.range(0.3, 0.55), w * 0.6, d, depth + 1);
}
}
out.push({ pts, w });
};
for (let i = 0; i < 6; i++) grow(0, 0, (i / 6) * TAU + R.range(-0.35, 0.35), R.range(18, 32), 1, 0, 0);
return out;
}
function create(o) {
const C = fit(o.palette, 8), R = new Rng(o.seed), ps = new Particles({ rng: R }), lights = new Lights();
const tree = fern(R), Y0 = R.range(-14, 6);
const kinked = Array.from({ length: 16 }, () => {
const a = R.range(-1.2, 1.2) + (R.chance(0.7) ? 0 : Math.PI), sp = R.range(130, 250);
return { x: 0, y: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: R.range(0.2, 0.36), age: -SNAP, next: R.range(0.02, 0.05), trail: [] };
});
let t = 0, hit = false;
return {
update(dt) {
t += dt;
if (!hit && t >= SNAP) {
hit = true;
lights.add(0, 0, 60, C[4], 0.7, 0.3);
lights.add(0, 0, 14, WHITE, 0.5, 0.07);
for (let i = 0; i < 3; i++) ps.spawn(P.SMOKE, R.range(-3, 5), R.range(-4, 2), R.range(-5, 8), -R.range(8, 16), R.range(0.55, 0.75), mix(ASH, C[4], 0.3), R.range(2.5, 3.8), R.range(0.08, 0.16));
}
for (const s of kinked) {
if ((s.age += dt) < 0 || s.age >= s.life) continue;
if ((s.next -= dt) <= 0) {
s.next = R.range(0.025, 0.055);
const sp = Math.hypot(s.vx, s.vy), a = Math.atan2(s.vy, s.vx) + R.sign() * R.range(0.6, 1.3);
s.vx = Math.cos(a) * sp;
s.vy = Math.sin(a) * sp;
s.trail.push([s.x, s.y]);
if (s.trail.length > 4) s.trail.shift();
}
s.vx -= s.vx * 3 * dt;
s.vy -= s.vy * 3 * dt - 140 * dt;
s.x += s.vx * dt;
s.y += s.vy * dt;
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
if (t < SNAP) return;
const cool = smooth(0.45, 0.85, t), fade = 1 - smooth(0.78, 0.88, t);
for (const br of tree)
for (let i = 1; i < br.pts.length; i++) {
const [x0, y0] = br.pts[i - 1], [x, y, d] = br.pts[i], age = t - SNAP - d / 260;
if (age < 0) break;
const k = Math.exp(-age / 0.22) - cool * 0.3, c = k > 0.75 ? WHITE : k > 0.45 ? C[6] : k > 0.25 ? C[5] : k > 0.1 ? C[4] : k > -0.05 ? C[2] : C[1];
p.line(x0, y0, x, y, c, fade);
if (br.w >= 1 && d < 9) p.line(x0 + 1, y0, x + 1, y, k > 0.45 ? C[5] : C[2], fade);
if ((i & 3) === 0 && k > 0) p.glow(x, y, 5, C[5], 0.35 * k * fade);
}
ps.draw(p, "back");
},
draw(p) {
const f = Math.floor(t * 30 + 1e-4);
if (t < 0.32) {
const r = rng(o.seed, 2, f), b = zigzag(r, -66, Y0, 0, 0, 0.22, 0.35), u = clamp(t / SNAP);
const k = t < SNAP ? 1 : t < 0.2 ? (f % 2 ? 0.7 : 1) : 0.55 * (1 - (t - 0.2) / 0.12);
stroke(p, u < 1 ? { paths: [b.paths[0]] } : b, k, C, t < SNAP + 0.034 ? 0.95 : 0.7, { upTo: u, hero: t >= SNAP && t < SNAP + 0.034 });
if (u < 1) {
const tp = b.paths[0].pts, [hx, hy] = tp[Math.floor(u * (tp.length - 1))];
p.circle(hx, hy, 2, WHITE);
p.glow(hx, hy, 14, C[5], 0.6);
}
}
if (t >= SNAP && t < 0.45) {
const a = (t - SNAP) / 0.4, r = rng(o.seed, 5, f), R0 = 8 * (1 - a * 0.6), m = Math.round(11 * (1 - a * 0.5));
for (let i = 0; i < m; i++) {
const ang = r.range(0, TAU), d0 = r.range(0.5, R0 * 0.5), ang2 = ang + r.range(-1.2, 1.2), d1 = r.range(R0 * 0.55, R0);
crackle(p, zigzag(r, Math.cos(ang) * d0, Math.sin(ang) * d0, Math.cos(ang2) * d1, Math.sin(ang2) * d1, 0.5, 0), 0.75 * (1 - a) + 0.25, C, 0.25);
}
p.circle(0, 0, 3 * (1 - a) + 1, C[5]);
p.circle(0, 0, 2 * (1 - a) + 0.5, WHITE);
p.glow(0, 0, 20, C[4], 0.55 * (1 - a));
if (t < SNAP + 0.07) p.glow(0, 0, 9, WHITE, 0.4);
}
for (const s of kinked) {
if (s.age < 0 || s.age >= s.life) continue;
const k = 1 - s.age / s.life, path = [...s.trail, [s.x, s.y]];
for (let i = 0; i < path.length - 1; i++) p.line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], i === path.length - 2 ? (k > 0.5 ? WHITE : C[6]) : k > 0.5 ? C[5] : C[4], 0.6 + 0.4 * (i / path.length));
p.px(s.x, s.y, k > 0.4 ? WHITE : C[5]);
p.glow(s.x, s.y, 4, C[5], 0.4 * k);
}
if (t >= SNAP) p.glow(0, 0, 40 * Math.max(0, 1 - t / 0.85), C[3], 0.45 * Math.exp(-(t - SNAP) * 5) * (f % 2 ? 0.7 : 1));
ps.draw(p, "front");
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/lightning/spark-arc.js": function(__r, __exports){
const { fit, clamp, rng, TAU, WHITE, hex, mix, ease } = __r("core/index.js");
const { VOLT, PLASMA, bowed, stroke, crackle, zigzag, flight, spark, puff, heat } = __r("fx/lightning/_lib.js");
const meta = {
name: "Spark arc",
desc: "A climbing arc between two rods: it strikes white at their narrow foot, climbs on rising heat as it stretches and bows, sputters and snaps at the top, then strikes again.",
tags: ["lightning", "electric", "arc", "jacobs-ladder", "machine", "prop", "loop"],
size: [124, 120],
origin: [62, 108],
duration: 2,
loop: true,
fps: 30,
bg: "ground",
options: { palette: VOLT, sparks: PLASMA, seed: 2 },
};
const FPS = 30, N = 60, P = 2, SNAP = 1.42, H = 58, STEEL = ["#151823", "#262c3b", "#3d4558", "#5f6a82", "#8f9bb2", "#d2daea"].map(hex);
const CERAMIC = ["#4b4458", "#857d96", "#c9c1d6", "#efe9f6"].map(hex), ASH = hex("#6a6478");
const rodAt = (s, h) => [s * (4.5 + (h / 60) * 19.5), -9 - h];
const height = (t) => 1.5 + H * Math.pow(clamp(t / SNAP), 1.35);
function draw(p, t, o) {
const C = fit(o.palette, 8), S = o.sparks.map(hex), f = Math.floor(t * FPS + 1e-6) % N, r = rng(o.seed, 1, f);
const climbing = t < SNAP, h = height(t), u = clamp(t / SNAP), a = t - SNAP;
p.glow(0, -14, 50, C[3], climbing ? 0.2 + 0.15 * (1 - u) : 0.06);
p.rect(-18, -3, 36, 3, STEEL[1]);
p.line(-18, -3, 17, -3, STEEL[3]);
for (const s of [-1, 1])
for (let y = -9; y < -3; y++) {
const rib = (y & 1) === 0;
for (let x = 2; x <= 6; x++) p.px(s * x - (s < 0 ? 1 : 0), y, rib ? CERAMIC[x < 4 ? 3 : x < 6 ? 2 : 1] : CERAMIC[x < 5 ? 1 : 0]);
}
for (const s of [-1, 1]) {
for (let hh = 0; hh <= 60; hh += 0.5) {
const [x, y] = rodAt(s, hh), tp = SNAP * Math.pow(clamp((hh - 1.5) / H), 1 / 1.35), age = t >= tp ? t - tp : t - tp + P;
const hot = hh > H + 2 ? 0 : Math.exp(-age / 0.26), c = heat(hot * 1.05 - 0.12);
p.px(x, y, c || (s < 0 ? STEEL[4] : STEEL[3]));
p.px(x + s, y, c && hot > 0.35 ? heat(hot * 0.6) || STEEL[2] : s < 0 ? STEEL[2] : STEEL[1]);
if (hot > 0.3 && (Math.round(hh * 2) & 3) === 0) p.glow(x, y, 5, c || C[4], 0.25 * hot);
}
const [tx, ty] = rodAt(s, 60);
p.circle(tx + s * 0.5, ty, 1.6, STEEL[4]);
p.px(tx + s * 0.5 - 0.5, ty - 1, STEEL[5]);
}
if (climbing) {
const [xl, yl] = rodAt(-1, h), [xr, yr] = rodAt(1, h), k0 = t < 1 / FPS ? 1 : 1 - 0.22 * u, sput = u > 0.88 && r.next() < 0.25 ? 0.4 : 1;
const k = k0 * sput * (0.82 + 0.18 * r.next()), bow = -(1.5 + 13 * u * u) * (0.8 + 0.4 * r.next());
stroke(p, bowed(r, xl, yl, xr, yr, bow, 0.18 + 0.12 * u, 0.12 + 0.25 * u), k, C, t < 1 / FPS ? 0.95 : 0.8, { hero: t < 1 / FPS, light: 0.7 });
p.glowLine(xl, yl + bow * 0.5, xr, yr + bow * 0.5, 12, C[4], 0.22 * k);
for (const [x, y] of [[xl, yl], [xr, yr]]) {
p.circle(x, y, 1.8 + 0.6 * k, C[5]);
p.px(x, y, WHITE);
p.glow(x, y, 12, C[5], 0.55 * k);
}
if (t < 0.1) p.glow(0, -11, 26, C[6], 0.45 * (1 - t / 0.1));
} else if (a < 2 / FPS) {
const [xl, yl] = rodAt(-1, H + 1.5), [xr, yr] = rodAt(1, H + 1.5);
for (const [x0, y0, s] of [[xl, yl, 1], [xr, yr, -1]]) crackle(p, zigzag(r, x0, y0, x0 + s * r.range(5, 9), y0 - r.range(2, 6), 0.4, 0.3), 0.7, C, 0.4);
p.glow(0, yl - 8, 30, C[4], 0.5);
} else if (t > P - 0.16) {
if (r.next() < 0.7) crackle(p, zigzag(r, -4.5, -10.5 - r.range(0, 2), 4.5, -10.5 - r.range(0, 2), 0.5, 0), 0.4 + 0.3 * r.next(), C, 0.35);
}
for (let j = 0; j < 3; j++) {
const born = ((j + 1) / 3.2) * SNAP, age = (((t - born) % P) + P) % P, life = 1;
if (age >= life) continue;
const y0 = -9 - height(born) - 6;
puff(p, (j % 2 ? 3 : -3) + Math.sin(age * 3 + j) * 2, y0 - age * 20, 1.8 + j * 0.3, age / life, mix(ASH, C[5], 0.3));
}
const burst = (t0, n, salt, from) => {
const age = (((t - t0) % P) + P) % P;
for (let j = 0; j < n; j++) {
const q = rng(o.seed, salt, j), life = q.range(0.25, 0.6);
if (age >= life) continue;
const [x0, y0, a0, spread, sp0, sp1] = from(q, j), ang = a0 + q.range(-spread, spread), sp = q.range(sp0, sp1);
const [x, y, vx, vy] = flight(x0, y0, Math.cos(ang) * sp, Math.sin(ang) * sp, age, { floor: 0 });
spark(p, x, y, vx, vy, 1 - age / life, S);
}
};
burst(0, 12, 11, (q, j) => [...rodAt(j % 2 ? 1 : -1, 1.5), -Math.PI / 2 + (j % 2 ? 0.6 : -0.6), 1, 60, 170]);
burst(SNAP, 14, 12, (q, j) => [rodAt(1, H)[0] * q.range(-0.8, 0.8), -9 - H - 6, -Math.PI / 2, 1.3, 50, 160]);
for (const [k, tt] of [[0, 0.45], [1, 0.8], [2, 1.15]]) burst(tt, 2, 20 + k, (q, j) => [...rodAt(j % 2 ? 1 : -1, height(tt)), Math.PI / 2, 0.5, 5, 30]);
if (climbing || a < 0.25) p.glow(0, -9 - h - 3, 26, C[4], climbing ? 0.25 : 0.4 * (1 - a / 0.25));
}
__exports.meta = meta; __exports.draw = draw;
},
"fx/ice/ice-shatter.js": function(__r, __exports){
const { Particles, Bits, Lights, P, B, Rng, fit, sparkle, flare, clamp, smooth, seg, ease, rand, TAU, WHITE } = __r("core/index.js");
const { Panes, endBy, inPoly, centroid, splitPoly, fractures, drawFractures } = __r("fx/ice/_lib.js");
const meta = {
name: "Ice shatter",
desc: "A block of ice takes a hit from the left: it jolts, cracks race over its faces, it flashes white and bursts into chunks that tumble, bounce and skid off in a roll of ice dust.",
tags: ["ice", "shatter", "break", "destroy", "impact", "directional", "one-shot"],
size: [224, 112],
origin: [68, 90],
duration: 2.8,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#151a3d", "#212f6b", "#2c58aa", "#3a8bd8", "#62c8f4", "#a6ecff", "#dcfbff", "#ffffff"], seed: 6 },
};
const HIT = 0.26, CRACK2 = 0.4, SHIVER = 0.54, FLASH = 0.62, BURST = 0.68;
const FRONT = [[-16, 0], [-16, -28], [12, -28], [12, 0]];
const TOP = [[-16, -28], [-8, -34], [20, -34], [12, -28]];
const SIDE = [[12, 0], [12, -28], [20, -34], [20, -6]];
const SIL = [[-16, 0], [-16, -28], [-8, -34], [20, -34], [20, -6], [12, 0]];
const HIT_AT = [-16, -15];
const PLANE = [[-16, -21], [-5, -28], [3, -13], [-16, -9]]; // a fracture plane inside, lighter
const SHADE = [[5, -28], [12, -28], [12, -10]]; // the far corner in shadow
function create(o) {
const C = fit(o.palette, 8), R = new Rng(o.seed), floor = () => 0;
const ps = new Particles({ rng: R, ground: floor, sparks: [C[7], C[6], C[5], C[4]], haze: C[5] });
const bits = new Bits({ ground: floor }), lights = new Lights(), scuffs = [];
const splinter = (x, y, vx, n) => {
for (let i = 0; i < n; i++) bits.add({ kind: B.SHARD, x: x + R.range(-2, 2), y: y - 1, vx: vx * 0.6 + R.range(-35, 45), vy: -R.range(30, 100), g: 0.8, drag: 0.6, bounce: 0.35, life: R.range(0.4, 0.8), a: R.range(0, TAU), va: R.range(-18, 18), s: R.range(1.2, 2.4), c: C[R.int(4, 7)] });
};
const panes = new Panes({
ground: floor,
onLand: (q, x, y, v) => {
if (v < 100) return;
ps.spawn(P.VAPOUR, x, y - 1, q.vx * 0.3 + R.range(-15, 15), -R.range(2, 10), R.range(0.4, 0.7), C[6], R.range(1.6, 2.8));
splinter(x, y, q.vx, 2);
if (R.chance(0.3)) ps.spawn(P.STAR, x, y - 3, 0, -5, R.range(0.2, 0.4), WHITE, R.range(0.8, 1.6));
},
onSkid: (q, x) => {
if (R.chance(0.5)) scuffs.push({ x: Math.round(x + R.range(-1, 1)), t: 0 });
},
onCrumble: (q) => {
splinter(q.x, 0, q.vx, 3);
ps.spawn(P.VAPOUR, q.x, -1, R.range(-10, 14), -R.range(2, 6), R.range(0.4, 0.7), C[6], R.range(1.2, 2));
},
});
const veins = [], bubbles = [];
for (let k = 0; k < 3; k++) {
let x = R.range(-12, 8), y = R.range(-24, -6), a = R.range(0, TAU);
for (let i = 0; i < 9; i++) {
a += R.range(-0.6, 0.6);
x += Math.cos(a) * 1.5;
y += Math.sin(a) * 1.2;
if (x < -14 || x > 10 || y < -26 || y > -2) break;
veins.push([Math.floor(x), Math.floor(y)]);
}
}
for (let k = 0; k < 5; k++) bubbles.push([R.int(-12, 8), R.int(-23, -4), R.chance(0.4) ? 1 : 0]);
const inside = (x, y) => inPoly(SIL, x, y);
const cracks = fractures(R, inside, HIT_AT[0] + 1, HIT_AT[1], 4, { len: 8, a0: -0.9, spread: 1.9 });
const cracks2 = fractures(R, inside, HIT_AT[0] + 1, HIT_AT[1], 6, { len: 18, a0: -1.3, spread: 2.7, fork: 0.16 });
let t = 0, struck = false, burst = false, wave2 = false, white = false;
const jolt = () => (t >= HIT && t < HIT + 0.05 ? 2 : t >= HIT + 0.05 && t < HIT + 0.12 ? 1 : t >= SHIVER && t < FLASH ? (Math.floor(t * 40) % 2 ? 1 : 0) : 0);
const drawBlock = (p) => {
if (t >= BURST) return;
const jx = jolt(), wh = t >= FLASH, sweep = -40 + 70 * seg(t, 0.04, 0.3);
const sh = (pts) => pts.map(([x, y]) => [x + jx, y]);
p.poly(sh([[-17, 1], [-17, -28.5], [-8.3, -35.2], [21, -35.2], [21, -5.6], [12.5, 1]]), C[0]);
if (wh) {
p.poly(sh(SIL), WHITE);
return;
}
p.poly(sh(FRONT), (x, y) => {
const lx = x - jx, d = lx + y * 0.8;
if (Math.abs(d - sweep) < 1.3 && y < -6) return WHITE;
if (y < -9 && (Math.abs(d + 21) < 1.1 || Math.abs(d + 16.5) < 0.6)) return C[6];
if (((Math.abs(lx + 7.5) < 0.5 && y < -6) || (Math.abs(y + 5.5) < 0.5 && lx > -8)) && (Math.floor(lx) + Math.floor(y)) % 2 === 0) return C[5];
if (inPoly(PLANE, lx, y)) return y < -25.5 ? C[6] : C[5];
if (inPoly(SHADE, lx, y)) return C[3];
return y < -25.5 ? C[5] : y < -8 ? C[4] : y < -2.5 ? C[3] : C[2];
});
p.poly(sh(TOP), (x, y) => (y > -29.5 ? C[7] : y < -32.5 ? C[5] : rand(Math.floor(x), Math.floor(y), 3) < 0.08 ? C[7] : C[6]));
p.poly(sh(SIDE), (x, y) => {
const lx = x - jx;
return lx < 13.5 ? C[3] : Math.abs(lx - 16.5) < 0.6 && y < -8 ? C[3] : y > (lx - 12) * -0.75 - 3 ? C[1] : C[2];
});
for (const [x, y] of veins) p.px(x + jx, y, C[5]);
for (const [x, y, big] of bubbles) {
p.px(x + jx, y, C[6]);
if (big) p.px(x + jx + 1, y, C[5]), p.px(x + jx, y + 1, C[5]);
}
const E = (a, b, c) => p.line(a[0] + jx, a[1], b[0] + jx, b[1], c);
E([-16, -28], [12, -28], WHITE);
E([-16, -28], [-8, -34], C[6]);
E([-8, -34], [20, -34], C[5]);
E([12, -28], [20, -34], C[7]);
E([-16, -1], [-16, -28], C[5]);
E([12, -1], [12, -28], C[6]);
E([20, -6], [20, -34], C[3]);
E([13, -1], [20, -6], C[1]);
if (t >= HIT) drawFractures(p, cracks, (t - HIT) * 170, C, { ox: jx });
if (t >= CRACK2) drawFractures(p, cracks2, (t - CRACK2) * 200, C, { ox: jx });
};
const drawFloor = (p) => {
const out = 1 - smooth(BURST + 0.6, BURST + 1.5, t);
if (out > 0)
for (let x = -22; x <= 26; x++) {
const d = Math.abs(x - 2) / 24, h = rand(x, 41), a = out * clamp((1.1 - d) / 0.25);
if (a <= 0) continue;
p.dot(x, 0, h < 0.35 ? WHITE : C[6], a);
if (h < 0.4 && (x < -16 || x > 20)) p.dot(x, -1, C[5], a);
for (let j = 1; j <= 1 + Math.round(rand(x, 7) * 3 * (1 - d)); j++) p.dot(x, j, j < 2 ? C[5] : C[4], a * (1 - j / 5));
}
for (const s of scuffs) {
const a = 1 - s.t / 0.9;
if (a > 0) p.dot(s.x, 0, s.t < 0.15 ? WHITE : C[6], a), p.dot(s.x, 1, C[4], a * 0.6);
}
};
const explode = () => {
const chop = (pts, max, depth) => {
const c = centroid(pts);
return c.area < max || depth > 4 ? [pts] : splitPoly(pts, c.x + R.range(-1, 1), c.y + R.range(-1, 1), R.range(0, Math.PI)).flatMap((q) => chop(q, max, depth + 1));
};
for (const [face, tone, max] of [[FRONT, 0.6, 46], [TOP, 1, 40], [SIDE, 0.3, 46]])
for (const part of chop(face, max, 0)) {
const m = centroid(part), dx = m.x - HIT_AT[0], dy = m.y - HIT_AT[1], d = Math.hypot(dx, dy) || 1, sp = R.range(50, 150) * (0.7 + 0.3 * (1 - d / 40));
panes.add({
pts: part.map(([x, y]) => [x - m.x, y - m.y]), x: m.x, y: m.y, vx: (dx / d) * sp * 0.9 + R.range(40, 110), vy: (dy / d) * sp * 0.4 - R.range(60, 200),
a: 0, va: R.range(-10, 10), f: R.range(-0.9, 0.9), vf: R.range(-7, 7), tone, lit: tone, g: 0.9, drag: 0.5, bounce: 0.38, solid: true, brittle: 3, crumble: R.range(0.25, 0.6), life: R.range(1.5, 1.9),
});
}
for (let i = 0; i < 46; i++) {
const x = R.range(-15, 19), y = -R.range(1, 33), dx = x - HIT_AT[0], dy = y - HIT_AT[1], d = Math.hypot(dx, dy) || 1, sp = R.range(60, 200);
if (!inside(x, y)) continue;
bits.add({ kind: R.chance(0.15) ? B.CHUNK : B.SHARD, x, y, vx: (dx / d) * sp * 0.8 + R.range(20, 90), vy: (dy / d) * sp * 0.4 - R.range(60, 240), g: 0.85, drag: 0.6, bounce: 0.32, life: R.range(0.8, 1.4), a: R.range(0, TAU), va: R.range(-22, 22), s: R.range(1.2, 3.4), c: C[R.int(4, 7)], ramp: [C[1], C[3], C[4], C[6], C[7]] });
}
for (let i = 0; i < 9; i++) ps.spawn(P.VAPOUR, R.range(-6, 18), -R.range(1, 6), R.range(10, 130), -R.range(2, 12), R.range(0.6, 1.1), C[6], R.range(2.2, 3.8));
for (let i = 0; i < 5; i++) ps.spawn(P.DUST, R.range(-6, 16), -R.range(1, 4), R.range(30, 110), -R.range(2, 8), R.range(0.5, 0.9), C[5], R.range(1.6, 2.8));
for (let i = 0; i < 4; i++) ps.spawn(P.VAPOUR, R.range(-8, 18), -R.range(8, 28), R.range(-10, 50), -R.range(8, 24), R.range(0.6, 1), C[6], R.range(2.6, 4));
for (let i = 0; i < 16; i++) {
const a = R.range(-Math.PI * 0.9, -0.1), sp = R.range(40, 140);
ps.spawn(P.FLAKE, R.range(-8, 16), -R.range(6, 28), Math.cos(a) * sp + 20, Math.sin(a) * sp, R.range(1, 1.6), R.chance(0.6) ? WHITE : C[6], R.range(0.5, 1.6));
}
for (let i = 0; i < 7; i++) ps.spawn(P.STAR, R.range(-14, 40), -R.range(4, 40), R.range(-8, 16), -R.range(4, 16), R.range(0.4, 0.8), R.chance(0.5) ? WHITE : C[6], R.range(1, 2.4));
lights.add(2, -17, 64, WHITE, 0.85, 0.14);
lights.add(16, -18, 86, C[4], 0.5, 0.55);
};
return {
update(dt) {
t += dt;
if (!struck && t >= HIT) {
struck = true;
lights.add(HIT_AT[0], HIT_AT[1], 24, WHITE, 0.6, 0.08);
lights.add(HIT_AT[0] + 6, HIT_AT[1], 40, C[5], 0.4, 0.3);
for (let i = 0; i < 12; i++) {
const a = Math.PI + R.range(-0.9, 0.9), sp = R.range(50, 120);
ps.spawn(P.SPARK, HIT_AT[0] - 1, HIT_AT[1], Math.cos(a) * sp, Math.sin(a) * sp - 40, R.range(0.15, 0.4));
}
for (let i = 0; i < 6; i++) {
const a = Math.PI + R.range(-1, 0.8), sp = R.range(40, 100);
bits.add({ kind: B.SHARD, x: HIT_AT[0] - 1, y: HIT_AT[1] + R.range(-2, 2), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, g: 0.85, drag: 0.6, bounce: 0.3, life: R.range(0.5, 0.9), a: R.range(0, TAU), va: R.range(-20, 20), s: R.range(1.2, 2.4), c: C[R.int(5, 7)] });
}
}
if (!wave2 && t >= CRACK2) {
wave2 = true;
lights.add(0, -16, 36, C[6], 0.35, 0.15);
for (let i = 0; i < 3; i++) bits.add({ kind: B.SHARD, x: R.range(-14, 18), y: -R.range(4, 30), vx: R.range(-30, 30), vy: -R.range(10, 50), g: 0.85, drag: 0.6, bounce: 0.3, life: R.range(0.4, 0.7), a: R.range(0, TAU), va: R.range(-20, 20), s: R.range(1, 2), c: C[R.int(5, 7)] });
}
if (!white && t >= FLASH) {
white = true;
lights.add(2, -17, 44, WHITE, 0.7, 0.08);
}
if (!burst && t >= BURST) {
burst = true;
explode();
}
if (burst && t < BURST + 1 && R.chance(0.08) && bits.list.length) {
const b = R.pick(bits.list);
ps.spawn(P.STAR, b.x, b.y - 1, 0, -3, R.range(0.2, 0.4), R.chance(0.5) ? WHITE : C[6], R.range(0.6, 1.5));
}
for (let i = scuffs.length - 1; i >= 0; i--) if ((scuffs[i].t += dt) > 0.9) scuffs.splice(i, 1);
ps.update(dt);
bits.update(dt);
panes.update(dt);
lights.update(dt);
endBy(t, meta.duration, ps, bits, panes);
},
drawBack(p) {
drawFloor(p);
ps.draw(p, "back");
},
draw(p) {
drawBlock(p);
const h = t - HIT;
if (h >= 0 && h < 0.2) {
sparkle(p, HIT_AT[0] - 1, HIT_AT[1], 9 * ease.outBack(Math.min(1, h / 0.04)) * (1 - h / 0.2), C[6], C[4], 0.7);
if (h < 0.08) flare(p, HIT_AT[0] - 1, HIT_AT[1], 14 * (1 - h / 0.08), 1 - h / 0.08, C);
}
const k = 1 - smooth(BURST, BURST + 0.4, t), crk = smooth(HIT, FLASH, t);
if (k > 0) {
p.glow(2, -17, 34, C[4], (0.16 + 0.22 * crk) * k);
p.glow(2, -2, 30, C[4], 0.14 * k);
}
if (t >= FLASH && t < BURST + 0.12) flare(p, 2, -17, 26 * (1 - clamp((t - FLASH) / 0.18)), 1 - clamp((t - FLASH) / 0.18), C);
panes.draw(p, C);
bits.draw(p);
ps.draw(p, "front");
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/ice/_lib.js": function(__r, __exports){
const { GRAVITY, clamp, luma, TAU, WHITE } = __r("core/index.js");
function inPoly(pts, x, y) {
let inside = false;
for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
const [xi, yi] = pts[i], [xj, yj] = pts[j];
if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
}
return inside;
}
function centroid(pts) {
let a = 0, cx = 0, cy = 0;
for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
const [x0, y0] = pts[j], [x1, y1] = pts[i], k = x0 * y1 - x1 * y0;
a += k;
cx += (x0 + x1) * k;
cy += (y0 + y1) * k;
}
if (Math.abs(a) < 1e-6) {
const n = pts.length;
return { x: pts.reduce((s, q) => s + q[0], 0) / n, y: pts.reduce((s, q) => s + q[1], 0) / n, area: 0 };
}
return { x: cx / (3 * a), y: cy / (3 * a), area: Math.abs(a) / 2 };
}
function splitPoly(pts, x, y, a) {
const nx = -Math.sin(a), ny = Math.cos(a), side = (q) => (q[0] - x) * nx + (q[1] - y) * ny, L = [], Rt = [];
for (let i = 0; i < pts.length; i++) {
const p = pts[i], q = pts[(i + 1) % pts.length], sp = side(p), sq = side(q);
(sp >= 0 ? L : Rt).push(p);
if (sp >= 0 !== sq >= 0) {
const u = sp / (sp - sq), m = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
L.push(m);
Rt.push(m);
}
}
return [L, Rt].filter((s) => s.length >= 3);
}
function iceOf(c, C) {
const n = C.length, l = luma(c);
return C[clamp(Math.round(((l < 0.12 ? 2 : 2 + l * 5.2) * (n - 1)) / 7), 1, n - 1)];
}
function glassPoly(p, pts, c, a) {
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
for (const [x, y] of pts) (x0 = Math.min(x0, x)), (x1 = Math.max(x1, x)), (y0 = Math.min(y0, y)), (y1 = Math.max(y1, y));
for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) if (inPoly(pts, x + 0.5, y + 0.5)) p.blend(x, y, c, a);
}
class Panes {
constructor(opts = {}) {
this.list = [];
this.ground = opts.ground ?? (() => Infinity);
this.onLand = opts.onLand ?? null;
this.onCrumble = opts.onCrumble ?? null;
this.onSkid = opts.onSkid ?? null;
}
add(q) {
const life = q.life ?? 1;
this.list.push({ vx: 0, vy: 0, a: 0, va: 0, f: 0, vf: 0, lit: 0.6, g: 1, drag: 0.3, bounce: 0.35, rest: false, brittle: false, ...q, life, max: life });
}
get count() {
return this.list.length;
}
corners(q) {
const ca = Math.cos(q.a), sa = Math.sin(q.a), k = Math.cos(q.f);
return q.pts.map(([x, y]) => {
const yy = y * k;
return [q.x + x * ca - yy * sa, q.y + x * sa + yy * ca];
});
}
seat(q) {
let low = -Infinity;
for (const c of this.corners(q)) low = Math.max(low, c[1]);
return low;
}
update(dt) {
for (let i = this.list.length - 1; i >= 0; i--) {
const q = this.list[i];
if ((q.life -= dt) <= 0) {
this.list.splice(i, 1);
continue;
}
const floor = this.ground(q.x) - 0.5;
if (q.rest && q.crumble !== undefined && (q.restT = (q.restT ?? 0) + dt) > q.crumble) {
this.onCrumble?.(q);
this.list.splice(i, 1);
continue;
}
if (q.rest) {
if (Math.abs(q.vx) > 8) this.onSkid?.(q, q.x, floor + 0.5);
q.x += q.vx * dt;
q.vx -= q.vx * 7 * dt;
q.a += q.va * dt;
q.va -= q.va * 9 * dt;
q.vf -= q.vf * 9 * dt;
q.f += q.vf * dt;
q.y -= this.seat(q) - floor;
continue;
}
q.vy += GRAVITY * q.g * dt;
q.vx -= q.vx * q.drag * dt;
q.vy -= q.vy * q.drag * dt;
q.x += q.vx * dt;
q.y += q.vy * dt;
q.a += q.va * dt;
q.f += q.vf * dt;
const low = this.seat(q);
if (q.g <= 0 || low < floor || q.vy <= 0) continue;
q.y -= low - floor;
if (q.vy > 70) (q.hits = (q.hits ?? 0) + 1), this.onLand?.(q, q.x, floor + 0.5, q.vy);
if (q.brittle && q.vy > 70 && q.hits >= q.brittle) {
this.list.splice(i, 1);
continue;
}
if (q.vy > 70 && q.bounce > 0) {
q.vy = -q.vy * q.bounce;
q.vx *= 0.75;
q.va *= 0.6;
q.vf *= 0.5;
} else {
q.rest = true;
q.vy = 0;
}
}
}
draw(p, C) {
const n = C.length;
for (const q of this.list) {
const a = Math.min(1, q.life / 0.35), pts = this.corners(q), k = Math.cos(q.f), face = Math.abs(k);
const lv = q.lit * (0.35 + 0.65 * face), flash = face > 0.97 && !q.rest;
if (face > 0.25) {
if (q.solid && q.tone !== undefined) {
p.poly(pts, flash ? C[n - 1] : C[clamp(Math.round(1 + q.tone * 5 * (0.6 + 0.4 * face)), 1, n - 2)], a);
} else if (q.solid) {
const rr = q.ridge ?? -Math.PI / 2, cr = Math.cos(rr), sr = Math.sin(rr), ca = Math.cos(q.a), sa = Math.sin(q.a);
const rx = cr * ca - sr * k * sa, ry = cr * sa + sr * k * ca;
let nx = -ry, ny = rx;
if (nx * -0.55 + ny * -0.84 < 0) (nx = -nx), (ny = -ny);
const lit = flash ? C[n - 1] : C[clamp(Math.round(3 + lv * 3), 3, n - 2)], deep = C[clamp(Math.round(1 + lv * 2), 1, 3)];
p.poly(pts, (x, y) => {
const d = (x - q.x) * nx + (y - q.y) * ny;
return d > 0.6 ? lit : d > -0.6 ? C[n - 2] : deep;
}, a);
} else glassPoly(p, pts, flash ? C[n - 1] : C[clamp(Math.round(3 + lv * 3), 3, n - 2)], (0.3 + 0.35 * lv + (flash ? 0.3 : 0)) * a);
}
let cx = 0, cy = 0, top = 0;
for (const [x, y] of pts) (cx += x), (cy += y);
cx /= pts.length;
cy /= pts.length;
for (let i = 0; i < pts.length; i++) {
const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
let nx = y1 - y0, ny = x0 - x1;
if (nx * ((x0 + x1) / 2 - cx) + ny * ((y0 + y1) / 2 - cy) < 0) (nx = -nx), (ny = -ny);
const l = Math.hypot(nx, ny) || 1, lit = (-nx * 0.55 - ny * 0.84) / l;
p.line(x0, y0, x1, y1, face < 0.25 || lit > 0.35 ? C[n - 1] : lit > -0.25 ? C[n - 2] : q.solid ? C[1] : C[Math.max(2, n - 4)], a);
if (pts[i][1] < pts[top][1]) top = i;
}
if (face > 0.7) p.dot(pts[top][0], pts[top][1], WHITE, a);
p.glow(cx, cy, 5, C[n - 3], (flash ? 0.5 : 0.14) * a);
}
}
}
function blade(p, bx, by, tx, ty, w, C, opts = {}) {
const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy);
if (L < 1.5 || w < 0.5) return;
const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, a = opts.a ?? 1, dim = opts.dim ?? 0, jag = opts.jag ?? -1, glint = opts.glint ?? -1;
const K = (i) => C[clamp(i - dim, 0, C.length - 1)], hw = w / 2;
const left = (u) => hw * (1 - u) + 0.35, right = (u) => hw * (1 - u) * (jag >= 0 && u > jag ? 0.55 : 1) + 0.35, ridge = (u) => -w * 0.12 * (1 - u);
const pad = hw + 2;
p.shade(Math.min(bx, tx) - pad, Math.min(by, ty) - pad, Math.max(bx, tx) + pad, Math.max(by, ty), (x, y, o) => {
const rx = x - bx, ry = y - by, u = (rx * ux + ry * uy) / L, s = rx * nx + ry * ny;
if (u < 0) return;
const l = left(Math.min(u, 1)), r = right(Math.min(u, 1));
if (u > 1 || s < -l || s > r) {
const over = u > 1 ? (u - 1) * L : 0, out = Math.max(over, s < -l ? -l - s : s - r);
if (out < 1 && u < 1 + 1 / L) {
o.c = K(0);
o.a = a;
}
return;
}
o.a = a;
if (opts.white) return (o.c = WHITE);
const rd = ridge(u);
let c;
if (u > 0.88) c = WHITE;
else if (Math.abs(s - rd) < 0.55) c = K(6);
else if (s < rd) c = s + l < 1 ? K(6) : (s + l) / Math.max(1, rd + l) > 0.55 ? K(5) : K(4);
else c = r - s < 1.1 ? K(1) : (s - rd) / Math.max(1, r - rd) > 0.5 ? K(2) : K(3);
if (jag >= 0 && Math.abs(u - jag) * L < 0.8 && s > rd) c = K(6);
else if (s < rd && c !== K(6) && ((Math.floor(x) * 73856093) ^ (Math.floor(y) * 19349663)) % 997 < 30) c = K(7);
if (glint >= 0 && s <= rd + 0.6) {
const g = Math.abs(u - glint) * L;
if (g < 0.8) c = WHITE;
else if (g < 1.8) c = K(6);
}
o.c = c;
});
}
function flakeDesign(R) {
const n = R.int(1, 3), branches = [];
for (let i = 0; i < n; i++) branches.push([0.38 + (0.4 * (i + R.range(0.2, 0.8))) / n, R.range(0.24, 0.36) * (1 - i * 0.15)]);
return { branches, plate: R.chance(0.45), fork: R.chance(0.45) };
}
function snowflake(p, x, y, r, rot, d, C, opts = {}) {
const n = C.length, a = opts.a ?? 1, hot = opts.hot ?? 0;
rot = Math.round(rot / (Math.PI / 18)) * (Math.PI / 18); // turn in 10 degree ticks, like sprite frames
if (r < 1.2) {
p.dot(x, y, WHITE, a);
return;
}
if (r < 2.6) {
const pose = Math.floor(((rot % (Math.PI / 3)) + Math.PI / 3) / (Math.PI / 6)) % 2;
const pts = pose ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [-1, -1], [1, -1], [-1, 1]];
for (const [dx, dy] of pts) p.dot(x + dx, y + dy, hot > 0.5 ? WHITE : C[n - 3], a);
p.dot(x, y, WHITE, a);
p.glow(x, y, 4, C[n - 3], 0.2 * a);
return;
}
const arm = hot > 0.5 ? WHITE : C[n - 2], br = hot > 0.5 ? C[n - 2] : C[n - 3], big = r >= 7;
const branches = r < 4 ? [] : big ? d.branches.slice(0, 2) : [[0.58, 0.36]];
for (let k = 0; k < 6; k++) {
const g = rot + (k * TAU) / 6, ca = Math.cos(g), sa = Math.sin(g);
p.line(x, y, x + ca * r, y + sa * r, arm, a);
for (const [u, l] of branches) {
const bx = x + ca * r * u, by = y + sa * r * u, bl = Math.max(1, r * l);
for (const s of [-1, 1]) p.line(bx, by, bx + Math.cos(g + (s * Math.PI) / 3) * bl, by + Math.sin(g + (s * Math.PI) / 3) * bl, br, a);
}
if (d.fork && big && !d.plate)
for (const s of [-1, 1]) p.dot(x + ca * r + Math.cos(g + s * 0.9) * 1.2, y + sa * r + Math.sin(g + s * 0.9) * 1.2, br, a);
p.dot(x + ca * r, y + sa * r, WHITE, a);
}
if (d.plate && big) {
const q = r * 0.34;
for (let k = 0; k < 6; k++) {
const g0 = rot + Math.PI / 6 + (k * TAU) / 6, g1 = g0 + TAU / 6;
p.line(x + Math.cos(g0) * q, y + Math.sin(g0) * q, x + Math.cos(g1) * q, y + Math.sin(g1) * q, C[n - 3], a);
}
}
p.px(x, y, WHITE);
p.glow(x, y, 3 + r * 1.2, C[n - 4], (0.14 + 0.35 * hot) * a);
if (hot > 0.3) p.glow(x, y, 2 + r * 0.5, WHITE, 0.3 * hot * a);
}
function endBy(t, D, ...systems) {
const left = Math.max(0.001, D - 0.05 - t);
for (const sys of systems) for (const q of sys.list) if (q.life > left) q.life = left;
}
function fractures(R, inside, x, y, n, opts = {}) {
const out = [], step = opts.step ?? [1.6, 2.6], len = opts.len ?? 18, fork = opts.fork ?? 0.16, a0 = opts.a0 ?? R.range(0, TAU), spread = opts.spread ?? TAU;
const walk = (x, y, d, a, len, depth) => {
const pts = [[x, y, d]];
for (let s = 0; s < len; s++) {
a += R.range(-0.55, 0.55);
const st = R.range(step[0], step[1]), nx = x + Math.cos(a) * st, ny = y + Math.sin(a) * st;
if (!inside(nx, ny)) break;
(x = nx), (y = ny), (d += st);
pts.push([x, y, d]);
if (depth < 2 && pts.length > 2 && R.chance(fork)) walk(x, y, d, a + R.sign() * R.range(0.6, 1.2), Math.ceil(len * 0.5), depth + 1);
}
if (pts.length > 1) out.push(pts);
};
for (let i = 0; i < n; i++) walk(x, y, 0, a0 + (i / n) * spread + R.range(-0.3, 0.3) * Math.min(1, spread / TAU), len, 0);
return out;
}
function drawFractures(p, cracks, reach, C, opts = {}) {
const n = C.length, ox = opts.ox ?? 0, oy = opts.oy ?? 0, hot = opts.hot ?? true, a = opts.a ?? 1;
const seg = (pts, i) => {
const [x0, y0, d0] = pts[i - 1], [x1, y1, d1] = pts[i];
if (d0 >= reach) return null;
const u = Math.min(1, (reach - d0) / Math.max(0.01, d1 - d0));
return [x0 + ox, y0 + oy, x0 + ox + (x1 - x0) * u, y0 + oy + (y1 - y0) * u, reach - d1 < 3];
};
for (const pts of cracks)
for (let i = 1; i < pts.length; i++) {
const s = seg(pts, i);
if (!s) break;
p.line(s[0], s[1] + 1, s[2], s[3] + 1, C[Math.min(2, n - 1)], a);
}
for (const pts of cracks)
for (let i = 1; i < pts.length; i++) {
const s = seg(pts, i);
if (!s) break;
const tip = hot && s[4];
p.line(s[0], s[1], s[2], s[3], tip ? WHITE : C[n - 2], a);
if (tip) p.glow(s[2], s[3], 5, C[n - 3], 0.5 * a);
else if (i % 2) p.glow(s[2], s[3], 3, C[n - 3], 0.18 * a);
}
}
__exports.inPoly = inPoly; __exports.centroid = centroid; __exports.splitPoly = splitPoly; __exports.iceOf = iceOf; __exports.glassPoly = glassPoly; __exports.Panes = Panes; __exports.blade = blade; __exports.flakeDesign = flakeDesign; __exports.snowflake = snowflake; __exports.endBy = endBy; __exports.fractures = fractures; __exports.drawFractures = drawFractures;
},
"fx/ice/ice-crystal.js": function(__r, __exports){
const { fit, cycle, sparkle, clamp, TAU, WHITE } = __r("core/index.js");
const meta = {
name: "Ice crystal",
desc: "A floating ice crystal turning slowly in its own cold light: its facets brighten and darken as they turn, glints flash on them, frost motes circle it.",
tags: ["ice", "crystal", "gem", "pickup", "float", "magic", "loop"],
size: [96, 100],
origin: [48, 92],
duration: 3,
loop: true,
fps: 30,
bg: "ground",
options: { palette: ["#151a3d", "#212f6b", "#2c58aa", "#3a8bd8", "#62c8f4", "#a6ecff", "#dcfbff", "#ffffff"], height: 34, seed: 21 },
};
const TIP = 0.28; // how far it leans toward us, so the upper facets show
const LIGHT = norm([-0.55, -0.75, -0.45]); // toward the light: upper left, in front
function norm([x, y, z]) {
const l = Math.hypot(x, y, z) || 1;
return [x / l, y / l, z / l];
}
function crystalFaces(th, R) {
const ct = Math.cos(TIP), st = Math.sin(TIP);
const P = (x, y, z) => [x, y * ct - z * st, y * st + z * ct]; // tip toward the viewer (z toward us is negative)
const ring = (y) => Array.from({ length: 6 }, (_, k) => P(Math.cos(th + (k * TAU) / 6) * R, y, Math.sin(th + (k * TAU) / 6) * R));
const top = ring(-R * 0.45), bot = ring(R * 0.45), A = P(0, -R * 2.2, 0), Z = P(0, R * 1.7, 0);
const faces = [];
for (let k = 0; k < 6; k++) {
const j = (k + 1) % 6;
faces.push([A, top[j], top[k]], [top[k], top[j], bot[j], bot[k]], [bot[k], bot[j], Z]);
}
const out = [];
for (const f of faces) {
const [a, b, c] = f, u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
let n = norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
const cx = f.reduce((s, q) => s + q[0], 0) / f.length, cy = f.reduce((s, q) => s + q[1], 0) / f.length, cz = f.reduce((s, q) => s + q[2], 0) / f.length;
if (n[0] * cx + n[1] * cy + n[2] * cz < 0) n = n.map((q) => -q); // outward
if (n[2] >= -0.02) continue; // facing away
const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
const h = norm([LIGHT[0], LIGHT[1], LIGHT[2] - 1]), spec = Math.max(0, n[0] * h[0] + n[1] * h[1] + n[2] * h[2]);
out.push({ pts: f.map((q) => [q[0], q[1]]), lit, spec, cx, cy });
}
return out;
}
function hullOf(pts) {
const P = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const lo = [], hi = [];
for (const q of P) {
while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
lo.push(q);
}
for (const q of P.reverse()) {
while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
hi.push(q);
}
return lo.slice(0, -1).concat(hi.slice(0, -1));
}
function drawBack(p, t, o) {
const C = fit(o.palette, 8), ph = t / meta.duration, bob = Math.sin(TAU * ph) * 2.5, Y = -o.height + bob;
const s = 1 - bob / 12, rx = 11 * s;
for (let x = Math.floor(-rx); x <= rx; x++) {
const f = 1 - (x / rx) ** 2;
p.blend(x + 0.5, 0, C[0], 0.65 * f);
if (Math.abs(x) < rx * 0.6) p.blend(x + 0.5, 1, C[0], 0.4 * f);
}
p.glow(0, -1, 24, C[4], 0.2 + 0.05 * Math.sin(TAU * ph * 2));
motes(p, C, t, o, Y, false);
}
function motes(p, C, t, o, Y, front) {
const D = meta.duration;
cycle(t, D, 16, o.seed, (g) => g.range(1.6, 2.6), (age, life, r, i) => {
const th = r.range(0, TAU) + age * r.range(1.6, 2.6), R = r.range(14, 22), y = Y + r.range(-14, 12) - age * r.range(3, 7), s = Math.sin(th), k = age / life;
if (s >= 0 !== front) return;
const x = Math.cos(th) * R, yy = y + s * R * 0.3, a = Math.min(1, age / 0.2) * (k > 0.75 ? (1 - k) / 0.25 : 1);
if (front) {
p.dot(x, yy, i % 4 === 0 ? WHITE : C[6], a);
if (i % 4 === 0) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p.dot(x + dx, yy + dy, C[5], a);
p.glow(x, yy, 4, C[5], 0.3 * a);
} else p.dot(x, yy, C[4], a * 0.9);
});
}
function draw(p, t, o) {
const C = fit(o.palette, 8), ph = t / meta.duration, bob = Math.sin(TAU * ph) * 2.5, Y = -o.height + bob, R = 8;
p.glow(0, Y, 34, C[3], 0.26);
p.glow(0, Y, 14, C[5], 0.18 + 0.08 * Math.sin(TAU * ph * 3));
const faces = crystalFaces((TAU / 6) * ph, R);
const hull = hullOf(faces.flatMap((f) => f.pts));
let mx = 0, my = 0;
for (const [x, y] of hull) (mx += x), (my += y);
(mx /= hull.length), (my /= hull.length);
p.poly(hull.map(([x, y]) => { const d = Math.hypot(x - mx, y - my) || 1; return [x + ((x - mx) / d) * 1.2, y + Y + ((y - my) / d) * 1.2]; }), C[1]);
for (const f of faces) {
const c = f.spec > 0.985 ? WHITE : C[clamp(Math.round(1 + Math.pow(f.lit, 1.4) * 6.6), 1, 7)];
p.poly(f.pts.map(([x, y]) => [x, y + Y]), c);
}
for (const f of faces)
for (let i = 0; i < f.pts.length; i++) {
const [x0, y0] = f.pts[i], [x1, y1] = f.pts[(i + 1) % f.pts.length];
p.line(x0, y0 + Y, x1, y1 + Y, f.lit > 0.6 ? C[7] : f.lit > 0.3 ? C[6] : C[4]);
}
for (const f of faces) if (f.spec > 0.96) sparkle(p, f.cx, f.cy + Y, Math.round(2 + (f.spec - 0.96) * 150), C[6], C[4], 0.5);
const g = (ph * 2) % 1;
if (g < 0.12) sparkle(p, 0, Y - R * 2.2 * Math.cos(TIP), Math.round(5 * Math.sin((g / 0.12) * Math.PI)), C[6], C[4], 0.6);
motes(p, C, t, o, Y, true);
}
__exports.meta = meta; __exports.drawBack = drawBack; __exports.draw = draw;
},
"fx/spawn/poof.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, flare, clamp, smooth, ease, TAU, WHITE, hex } = __r("core/index.js");
const meta = {
name: "Poof",
desc: "A cartoon death poof: a white pop, a ring of soft round smoke balls bursting out between speed lines, little stars spinning off, and the cloud lifting and thinning away.",
tags: ["spawn", "death", "despawn", "smoke", "poof", "cartoon", "one-shot"],
size: [112, 92],
origin: [56, 80],
duration: 1.6,
loop: false,
fps: 30,
bg: "ground",
options: {
palette: ["#2a2440", "#5e5878", "#9a94b4", "#cdc8e0", "#f2f0fa", "#ffffff"],
stars: ["#ffd84a", "#fff3a6", "#ffffff"],
seed: 21,
},
};
const CY = -17;
function create(o) {
const C = fit(o.palette, 6), S = fit(o.stars, 3), R = new Rng(o.seed), floor = () => 0;
const ps = new Particles({ rng: R, ground: floor, sparks: [WHITE, S[1], S[0], C[2]] }), lights = new Lights();
const balls = [], lines = [];
const ring = 9;
for (let i = 0; i < ring; i++) {
const a = (i / ring) * TAU + R.range(-0.2, 0.2), sp = R.range(95, 140), r = R.range(5, 7);
balls.push({ x: Math.cos(a) * 3, y: CY + Math.sin(a) * 3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8 - 12, r0: r * 0.5, r1: r, life: R.range(0.7, 1.05), delay: R.range(0, 0.03) });
}
for (let i = 0; i < 5; i++) {
const a = R.range(0, TAU), sp = R.range(20, 60);
balls.push({ x: Math.cos(a) * 2, y: CY + Math.sin(a) * 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 16, r0: 4, r1: R.range(6.5, 8.5), life: R.range(0.85, 1.2), delay: R.range(0.02, 0.06) });
}
for (let i = 0; i < 7; i++) {
const a = R.range(0, TAU), sp = R.range(170, 240), r = R.range(2.2, 3.6);
balls.push({ x: Math.cos(a) * 4, y: CY + Math.sin(a) * 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.75 - 10, r0: r * 0.6, r1: r, life: R.range(0.32, 0.5), delay: R.range(0.01, 0.04) });
}
for (const b of balls) b.max = b.life;
for (let i = 0; i < 12; i++) {
const a = (i / 12) * TAU + R.range(-0.12, 0.12) + 0.13, sa = Math.sin(a);
lines.push({ a, r1: Math.min(R.range(24, 34), sa > 0.1 ? (-2 - CY) / sa : 99), d: R.range(0, 0.04) });
}
for (let i = 0; i < 7; i++) {
const a = R.range(-Math.PI, 0.3), sp = R.range(70, 125);
ps.spawn(P.STAR, Math.cos(a) * 6, CY + Math.sin(a) * 6, Math.cos(a) * sp, Math.sin(a) * sp - 30, R.range(0.55, 0.95), R.pick([S[2], S[1], S[1], S[0]]), R.range(1.3, 2.4), R.range(0.02, 0.1));
}
for (let i = 0; i < 10; i++) {
const a = R.range(0, TAU), sp = R.range(40, 110);
ps.spawn(P.STAR, Math.cos(a) * 5, CY + Math.sin(a) * 5, Math.cos(a) * sp, Math.sin(a) * sp - 20, R.range(0.3, 0.6), R.pick([WHITE, S[1]]), 0.6, R.range(0, 0.08));
}
for (let i = 0; i < 6; i++) {
const s = R.sign();
ps.spawn(P.DUST, s * R.range(1, 6), -1, s * R.range(25, 70), -R.range(2, 10), R.range(0.4, 0.7), C[2], R.range(1.6, 3), R.range(0.02, 0.08));
}
lights.add(0, CY, 46, C[4], 0.8, 0.4);
lights.add(0, CY, 22, WHITE, 0.8, 0.1);
let t = 0;
const radius = (b) => {
const age = b.max - b.life, u = age / b.max;
const grow = b.r0 + (b.r1 - b.r0) * ease.outBack(clamp(age / 0.22), 2), breathe = 1 + 0.06 * Math.sin(age * 14 + b.r1);
return grow * breathe * (u < 0.62 ? 1 : 1 - ease.inBack(clamp((u - 0.62) / 0.38), 1.4));
};
const drawBall = (p, b, layer) => {
const age = b.max - b.life, r = radius(b), a = Math.min(1, age * 20), lit = age < 0.12;
if (r < 0.6) return;
const hy = (b.y - CY + 6) / 14, lo = hy > 0.4, hi = hy < -0.3;
if (layer === "shade") p.disc(b.x + r * 0.16, b.y + r * 0.2, r, lit ? C[3] : lo ? C[1] : C[2], 0.8 * a);
else if (layer === "body") p.disc(b.x - r * 0.06, b.y - r * 0.08, r * 0.86, lit ? C[4] : lo ? C[2] : C[3], 0.88 * a);
else if (!lo || lit) {
p.disc(b.x - r * 0.28, b.y - r * 0.34, r * 0.42, lit || hi ? WHITE : C[4], 0.85 * a);
if (age < 0.25) p.disc(b.x - r * 0.3, b.y - r * 0.38, r * 0.2, WHITE, 0.9 * a * (1 - age / 0.25));
}
};
return {
update(dt) {
t += dt;
for (let i = balls.length - 1; i >= 0; i--) {
const b = balls[i];
if (b.delay > 0) {
b.delay -= dt;
continue;
}
if ((b.life -= dt) <= 0) {
if (b.r1 > 4) ps.spawn(P.STAR, b.x, b.y, 0, -8, 0.22, WHITE, 0.6);
balls.splice(i, 1);
continue;
}
b.vx -= b.vx * 7 * dt;
b.vy -= b.vy * 7 * dt + 30 * dt;
b.x += b.vx * dt;
b.y = Math.min(b.y + b.vy * dt, -radius(b) * 0.7);
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
const s = 1 - smooth(0.1, 0.9, t);
if (s > 0) p.glow(0, -1, 26, C[4], 0.25 * s);
ps.draw(p, "back");
},
draw(p) {
const live = balls.filter((b) => b.delay <= 0);
for (const layer of ["shade", "body", "cap"]) for (const b of live) drawBall(p, b, layer);
if (t < 0.07) {
const k = t / 0.07;
p.circle(0, CY, 9 + 3 * k, C[4]);
p.circle(0, CY, 7 + 3 * k, WHITE);
flare(p, 0, CY, 20 * (1 - k * 0.5), 1 - k, C);
}
const rk = (t - 0.03) / 0.2;
if (rk > 0 && rk < 1) p.ring(0, CY, 8 + 18 * ease.outCubic(rk), Math.max(1, 2.5 * (1 - rk)), rk < 0.3 ? WHITE : C[4], 1.1 - rk);
for (const l of lines) {
const u = (t - l.d) / 0.2;
if (u <= 0 || u >= 1) continue;
const head = 8 + (l.r1 - 8) * ease.outExpo(clamp(u / 0.6)), tail = 8 + (l.r1 - 8) * ease.inCubic(u), ca = Math.cos(l.a), sa = Math.sin(l.a);
p.line(ca * tail, CY + sa * tail, ca * head, CY + sa * head, (v) => (v > 0.6 ? WHITE : C[4]));
p.glowLine(ca * tail, CY + sa * tail, ca * head, CY + sa * head, 3, C[4], 0.25);
}
ps.draw(p, "front");
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/spawn/spawn-portal.js": function(__r, __exports){
const { Particles, Bits, Lights, P, PF, B, Rng, fit, band, sparkle, flare, clamp, smooth, ease, noise, TAU, WHITE, hex, mix } = __r("core/index.js");
const meta = {
name: "Spawn portal",
desc: "A rift tears open on the floor and swirls, belches violet smoke and sparks, spits a fountain of wisps up out of itself, then twists shut with a pop.",
tags: ["spawn", "portal", "summon", "rift", "arcane", "smoke", "ground", "one-shot"],
size: [208, 150],
origin: [104, 122],
duration: 3.8,
loop: false,
fps: 30,
bg: "ground",
options: {
palette: ["#12081f", "#2a0f4d", "#481b8c", "#7330d0", "#a35cff", "#cf9bff", "#f1dcff", "#ffffff"],
width: 28,
seed: 6,
},
};
const OPEN = 0.3, BELCH = [0.52, 0.76], BURST = 1.0, SHUT = 1.9, POP = 2.22, SY = 0.34;
const VOID = hex("#06030b"), FUME = hex("#3a3046"), STONE = ["#1a1424", "#2b2639", "#4a4263", "#6c6488", "#9a91b4"].map(hex), DUST = hex("#5a5070");
function radius(t, RX) {
if (t < OPEN) return RX * ease.outBack(clamp(t / OPEN), 2.2);
if (t < SHUT) return RX * (1 + 0.035 * Math.sin(t * 9) + 0.1 * Math.exp(-((t - BURST - 0.05) ** 2) / 0.006));
const k = clamp((t - SHUT) / (POP - SHUT));
return RX * (k < 0.35 ? 1 + 0.1 * Math.sin((k / 0.35) * Math.PI * 0.5) : 1.1 * (1 - Math.pow((k - 0.35) / 0.65, 1.6)));
}
const spinAt = (t) => t * 2.4 + 1.5 * smooth(BURST - 0.1, BURST + 0.3, t) + 10 * Math.pow(clamp((t - SHUT) / (POP - SHUT)), 2.2);
const lipAt = (th, spin) => 1 + 0.05 * noise(th * 3 + spin * 0.6, 5) + 0.035 * noise(th * 8 - spin * 1.3, 9);
function hole(p, C, rx, spin, heat, wind = 2.3) {
if (rx < 1) return;
const ry = rx * SY;
p.shade(-rx - 2, -ry - 2, rx + 2, ry + 2, (x, y, out) => {
const u = x / rx, v = y / ry, q = Math.hypot(u, v), th = Math.atan2(v, u), lip = lipAt(th, spin);
if (q > lip) return;
const w = q / lip;
out.c = v < 0 && w > 0.72 ? (w > 0.86 ? C[2] : C[1]) : w > 0.55 ? C[0] : VOID;
});
const n = Math.max(40, Math.round(rx * 5));
for (let i = 0; i < 3; i++)
for (let j = 0; j <= n; j++) {
const q = 0.14 + 0.82 * (j / n), th = spin + (i * TAU) / 3 - wind * Math.log(q), lip = lipAt(th, spin);
const x = Math.cos(th) * q * lip * rx, y = Math.sin(th) * q * lip * ry;
const c = q > 0.8 ? (heat > 1.1 ? WHITE : C[6]) : q > 0.55 ? C[5] : q > 0.32 ? C[4] : C[3];
p.dot(x, y, c, q > 0.3 ? 1 : q / 0.3);
if (q > 0.4 && j % 2 === 0) {
const t2 = th - 0.32, x2 = Math.cos(t2) * q * 0.94 * lip * rx, y2 = Math.sin(t2) * q * 0.94 * lip * ry;
p.dot(x2, y2, q > 0.7 ? C[4] : C[3], 0.85);
}
}
p.glow(0, 0, rx * 0.45, C[3], 0.35 * heat);
}
function lip(p, C, rx, spin, heat, near) {
if (rx < 1) return;
const ry = rx * SY, n = Math.ceil(rx * 7);
for (let j = 0; j < n; j++) {
const th = (j / n) * TAU, s = Math.sin(th);
if ((s >= 0) !== near) continue;
const l = lipAt(th, spin), x = Math.cos(th) * rx * l, y = s * ry * l, f = noise(th * 9 + spin * 3, 13);
p.dot(Math.cos(th) * (rx * l + 1.2), s * (ry * l + 1), C[1]);
p.dot(x, y, near ? (f > -0.3 || heat > 1.1 ? WHITE : C[6]) : f > 0.2 ? C[6] : C[5]);
if (j % 6 === 0) p.glow(x, y, 7, C[5], (near ? 0.3 : 0.2) * Math.min(1.4, heat));
}
}
function create(o) {
const C = fit(o.palette, 8), RX = o.width, R = new Rng(o.seed), floor = () => 0;
const SM = [mix(C[4], FUME, 0.4), mix(C[3], FUME, 0.3), mix(C[5], FUME, 0.55)];
const ps = new Particles({ rng: R, ground: floor, sparks: [C[7], C[6], C[5], C[3]] });
const rocks = new Bits({ ground: floor }), lights = new Lights();
const swirl = [], wisps = [], rings = [];
const done = {};
let t = 0;
const addSwirl = (r0) => swirl.push({ a: R.range(0, TAU), r: r0, w: R.range(2.2, 4), in: R.range(0.3, 0.7), c: R.pick([WHITE, C[6], C[6], C[5]]) });
const pull = () => {
const a = R.range(Math.PI * 1.03, Math.PI * 1.97), D = R.range(40, 86), T = R.range(0.24, 0.42);
const x = Math.cos(a) * D * 1.08, y = Math.sin(a) * D * 0.85, l = Math.hypot(x, y), v = (0.6 * l) / (1 - Math.exp(-0.6 * T));
ps.spawn(P.MOTE, x, y, (-x / l) * v, (-y / l) * v, T, R.pick([WHITE, C[6], C[5], C[5], C[4]]), R.range(1, 1.7));
};
const puff = (n, big, sp) => {
for (let i = 0; i < n; i++) {
const a = R.range(0, TAU), d = R.range(0, 0.55) * RX;
ps.spawn(P.SMOKE, Math.cos(a) * d, Math.sin(a) * d * SY - 2, R.range(-1, 1) * sp * 0.6, -R.range(0.4, 1) * sp, R.range(1.2, 2.2) * (big ? 1.15 : 0.8), R.pick(SM), R.range(2.8, 4.6) * (big ? 1.15 : 0.9), big ? R.range(0, 0.3) : R.range(0, 0.1), big ? PF.BIG : 0);
}
};
const sparks = (n, up, spread) => {
for (let i = 0; i < n; i++) {
const a = -Math.PI / 2 + R.range(-spread, spread), sp = R.range(0.5, 1) * up;
ps.spawn(P.SPARK, R.range(-0.5, 0.5) * RX, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.35, 0.8));
}
};
const once = (k, at) => !done[k] && t >= at && (done[k] = true);
return {
update(dt) {
t += dt;
const shutting = t > SHUT && t < POP;
if ((t < OPEN + 0.15 || shutting) && R.chance(0.55)) {
const s = R.sign(), D = R.range(RX * 1.3, RX * 2.4), T = R.range(0.18, 0.3), v = (D * 3) / (Math.exp(3 * T) - 1);
ps.spawn(P.STREAK, s * D, -R.range(0, 3), -s * v, R.range(-2, 2), T, R.chance(0.5) ? C[6] : C[5]);
}
if (t > 0.1 && t < POP - 0.1 && R.chance(shutting ? 0.85 : t < BURST ? 0.55 : 0.1)) pull();
if (t < POP && t > 0.12 && R.chance(shutting ? 0.5 : 0.25)) addSwirl(R.range(1.1, 1.5));
if (once("open", OPEN * 0.7)) {
lights.add(0, -8, 50, C[4], 0.75, 0.45);
rings.push({ t0: t, life: 0.42, r0: RX * 0.8, r1: RX * 1.9, th: 2.5, hot: true });
for (let i = 0; i < 8; i++) ps.spawn(P.DUST, R.sign() * R.range(0.7, 1.1) * RX, -1, R.sign() * R.range(10, 45), -R.range(4, 14), R.range(0.4, 0.7), DUST, R.range(1.5, 3));
}
if (once("b0", BELCH[0])) puff(6, false, 34), sparks(8, 210, 0.55), lights.add(0, -6, 44, C[4], 0.6, 0.3);
if (once("b1", BELCH[1])) puff(8, false, 40), sparks(12, 240, 0.6), lights.add(0, -6, 48, C[4], 0.65, 0.3);
if (once("burst", BURST)) {
lights.add(0, -26, 74, C[4], 1, 0.75);
lights.add(0, -10, 40, WHITE, 0.85, 0.14);
rings.push({ t0: t, life: 0.55, r0: RX * 1.0, r1: RX * 2.5, th: 3.5, hot: true }, { t0: t + 0.06, life: 0.45, r0: RX * 0.8, r1: RX * 1.8, th: 2, hot: false });
puff(18, true, 70);
sparks(34, 400, 0.8);
for (let i = 0; i < 5; i++) {
const a = -Math.PI / 2 + (i - 2) * 0.27 + R.range(-0.08, 0.08), sp = R.range(185, 235);
wisps.push({ x: R.range(-4, 4), y: -2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: R.range(0.75, 1.0), max: 1, tr: [], acc: 0, ph: R.range(0, TAU) });
}
for (let i = 0; i < 12; i++)
rocks.add({ kind: B.CHUNK, x: R.sign() * R.range(0.75, 1.05) * RX, y: -1, vx: R.range(-100, 100), vy: -R.range(150, 280), g: 1, drag: 0.4, bounce: 0.3, life: R.range(1.3, 1.9), a: R.range(0, TAU), va: R.range(-14, 14), s: R.range(1, 2.4), ramp: STONE });
for (let i = 0; i < 14; i++) ps.spawn(P.STAR, R.range(-0.8, 0.8) * RX, -R.range(4, 34), R.range(-30, 30), -R.range(10, 60), R.range(0.5, 1.1), R.pick([WHITE, C[6], C[5]]), R.range(0.8, 2));
}
if (t > OPEN && t < SHUT && R.chance(0.16)) puff(1, false, 22);
if (t > OPEN && t < SHUT + 0.1 && R.chance(0.06)) sparks(1, 160, 0.4);
if (once("pop", POP)) {
lights.add(0, -4, 50, C[4], 0.95, 0.5);
lights.add(0, -2, 28, WHITE, 0.9, 0.12);
rings.push({ t0: t, life: 0.35, r0: 2, r1: RX * 1.9, th: 2.5, hot: true });
for (let i = 0; i < 18; i++) {
const a = R.range(-Math.PI, 0), sp = R.range(90, 270);
ps.spawn(P.SPARK, 0, -1, Math.cos(a) * sp, Math.sin(a) * sp * 0.8, R.range(0.25, 0.6));
}
for (let i = 0; i < 9; i++) {
const a = R.range(0, TAU), sp = R.range(30, 95);
ps.spawn(P.STAR, 0, -2, Math.cos(a) * sp, Math.sin(a) * sp * 0.5 - 20, R.range(0.4, 0.9), R.pick([WHITE, C[6]]), R.range(0.8, 1.8));
}
for (let i = 0; i < 6; i++) ps.spawn(P.SMOKE, R.range(-6, 6), -R.range(1, 4), R.range(-34, 34), -R.range(10, 30), R.range(0.8, 1.3), SM[2], R.range(2.5, 4.5));
for (let i = 0; i < 14; i++) ps.spawn(P.STAR, R.range(-1, 1) * RX * 0.9, -R.range(0.5, 2), R.range(-4, 4), -R.range(0, 4), R.range(0.6, 1.4), R.pick([C[6], C[5], C[5]]), R.range(0.4, 0.9), R.range(0, 0.25));
}
for (let i = swirl.length - 1; i >= 0; i--) {
const s = swirl[i], k = shutting ? 2.4 : 1;
s.a += s.w * k * dt * (1.4 / Math.max(0.3, s.r));
s.r -= s.in * k * dt;
if (s.r < 0.25 || t > POP) swirl.splice(i, 1);
}
for (let i = wisps.length - 1; i >= 0; i--) {
const w = wisps[i];
w.tr.unshift([w.x, w.y]);
if (w.tr.length > 12) w.tr.pop();
if ((w.life -= dt) <= 0 || (w.vy > 0 && w.y > -2)) {
for (let j = 0; j < 8; j++) {
const a = R.range(0, TAU), sp = R.range(30, 120);
ps.spawn(P.SPARK, w.x, w.y, Math.cos(a) * sp + w.vx * 0.2, Math.sin(a) * sp + w.vy * 0.2, R.range(0.2, 0.5));
}
ps.spawn(P.STAR, w.x, w.y, 0, -6, 0.45, WHITE, 2.4);
lights.add(w.x, w.y, 24, C[5], 0.65, 0.25);
wisps.splice(i, 1);
continue;
}
w.vy += 360 * dt;
w.vx += Math.sin((w.max - w.life) * 16 + w.ph) * 160 * dt;
w.vx -= w.vx * 1.1 * dt;
w.vy -= w.vy * 1.1 * dt;
w.x += w.vx * dt;
w.y += w.vy * dt;
for (w.acc += dt; w.acc > 0.03; w.acc -= 0.03) ps.spawn(P.SMOKE, w.x, w.y, w.vx * 0.05, w.vy * 0.05 - 4, R.range(0.6, 1), SM[0], R.range(1.5, 2.4));
if (R.chance(0.3)) ps.spawn(P.MOTE, w.x, w.y, -w.vx * 0.2 + R.range(-15, 15), -w.vy * 0.2 + R.range(-15, 15), R.range(0.2, 0.4), C[6], 0.6);
}
for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t0 > rings[i].life) rings.splice(i, 1);
rocks.update(dt);
for (const b of rocks.list)
if (b.rest && !b.dusted) {
b.dusted = true;
for (let i = 0; i < 2; i++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(6, 30), -R.range(2, 12), R.range(0.3, 0.6), DUST, R.range(1.2, 2.4));
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
const rx = radius(t, RX), spin = spinAt(t), heat = 0.85 + 0.15 * Math.sin(t * 7) + 0.6 * Math.exp(-((t - BURST) ** 2) / 0.01);
if (t < POP) {
p.glow(0, -4, rx * 1.8 + 10, C[4], 0.32 * clamp(rx / RX));
p.glowLine(0, -2, 0, -44, rx * 0.7 + 6, C[4], 0.16 * clamp(rx / RX));
}
if (t < OPEN * 0.6) {
const k = t / (OPEN * 0.6), L = RX * 1.1 * ease.outCubic(k);
p.line(-L, 0, L, 0, (u) => (Math.abs(u - 0.5) < 0.3 ? WHITE : C[6]));
p.glowLine(-L, 0, L, 0, 7, C[5], 0.6);
}
if (t > OPEN * 0.35 && t < POP) {
hole(p, C, rx, spin, heat + 0.4 * smooth(SHUT, POP, t), 2.3 + 2.6 * smooth(SHUT, POP - 0.05, t));
lip(p, C, rx, spin, heat, false);
}
for (const r of rings) ring(p, C, r, t, false);
drawSwirl(p, false);
ps.draw(p, "back");
},
draw(p) {
const rx = radius(t, RX), spin = spinAt(t), heat = 0.85 + 0.15 * Math.sin(t * 7) + 0.6 * Math.exp(-((t - BURST) ** 2) / 0.01);
if (t > OPEN * 0.35 && t < POP) lip(p, C, rx, spin, heat, true);
for (const r of rings) ring(p, C, r, t, true);
drawSwirl(p, true);
const b = t - BURST;
if (b > 0 && b < 0.45) {
const k = b / 0.45, top = -84 * ease.outExpo(clamp(b / 0.14)), bot = -1 - 60 * ease.inQuad(k), w0 = RX * 0.55 * (1 - k * 0.8);
p.shade(-w0 - 1, top, w0 + 1, bot, (x, y, out) => {
const u = (y - bot) / (top - bot), half = w0 * Math.pow(1 - u, 0.8) * (0.85 + 0.15 * Math.sin(y * 0.7 + t * 40));
const d = Math.abs(x) / Math.max(0.5, half);
if (d > 1) return;
out.c = d < 0.35 ? WHITE : d < 0.7 ? C[6] : C[5];
});
p.glowLine(0, bot, 0, top, w0 + 12, C[5], 0.55 * (1 - k));
if (b < 0.14) flare(p, 0, -4, 36 * (1 - b / 0.14), 1 - b / 0.14, C);
}
const q = t - POP;
if (q > -0.08 && q < 0.25) sparkle(p, 0, -1, Math.round((q < 0 ? 4 : 12) * (1 - clamp(q / 0.25))), WHITE, C[5], 0.7 * (1 - clamp(q / 0.25)));
rocks.draw(p);
for (const w of wisps) {
const k = w.life / w.max;
for (let i = 1; i < w.tr.length; i++) {
const [x0, y0] = w.tr[i - 1], [x1, y1] = w.tr[i], u = i / w.tr.length;
p.line(x0, y0, x1, y1, u < 0.25 ? WHITE : u < 0.55 ? C[6] : C[4], 1.15 - u);
if (u < 0.35) p.line(x0 + 1, y0, x1 + 1, y1, C[5], 1);
}
p.circle(w.x, w.y, 2, C[5]);
p.circle(w.x, w.y, 1.2, C[6]);
p.px(w.x, w.y, WHITE);
p.glow(w.x, w.y, 12, C[5], 0.5 * k + 0.2);
}
ps.draw(p, "front");
lights.draw(p);
},
};
function drawSwirl(p, near) {
const rx = radius(t, RX);
for (const s of swirl) {
for (let j = 0; j < 3; j++) {
const a = s.a - j * 0.08 * (1.4 / Math.max(0.3, s.r)), x = Math.cos(a) * s.r * rx, y = Math.sin(a) * s.r * rx * SY;
if ((Math.sin(a) >= 0) !== near) continue;
p.dot(x, y - 0.5, j ? C[5] : s.c, j ? 0.9 - j * 0.3 : 1);
if (!j) p.glow(x, y, 3, C[5], 0.35);
}
}
}
}
function ring(p, C, r, t, near) {
const k = (t - r.t0) / r.life;
if (k < 0 || k >= 1) return;
band(p, 0, 0, r.r0 + (r.r1 - r.r0) * ease.outCubic(k), SY * 0.62, Math.max(1, r.th * (1 - k)), 1.15 - k, C, (g) => (Math.sin(g) >= 0) === near, r.hot && k < 0.15);
}
__exports.meta = meta; __exports.create = create;
},
"fx/pickups/collect-burst.js": function(__r, __exports){
const { Lights, Rng, fit, clamp, ease, TAU, WHITE } = __r("core/index.js");
const { glint } = __r("fx/pickups/_lib.js");
const meta = {
name: "Collect burst",
desc: "The moment of pickup: a white flash and a cross of light, a thin ring snapping out ahead of a softer one, twinkles thrown wide on curving paths that brake, hang and wink out.",
tags: ["pickup", "collect", "burst", "sparkle", "reward", "one-shot"],
size: [112, 108],
origin: [56, 94],
duration: 1.35,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#1a0516", "#3d0a33", "#701560", "#b0228f", "#f53cd1", "#ff86e6", "#ffd2f6", "#ffffff"], seed: 3 },
};
const CY = -30;
function create(o) {
const C = fit(o.palette, 8), R = new Rng(o.seed), lights = new Lights();
lights.add(0, CY, 36, C[5], 0.85, 0.32);
lights.add(0, CY, 14, WHITE, 0.75, 0.08);
const stars = Array.from({ length: 14 }, (_, i) => {
const a = (i / 14) * TAU + R.range(-0.2, 0.2), sp = R.range(145, 225) * (i % 3 === 0 ? 1.12 : 0.85);
return { x: 0, y: CY, a, sp, turn: (i % 2 ? 1 : -1) * R.range(2.5, 5), life: R.range(0.75, 1.15), age: 0, size: i % 3 === 0 ? 2.6 : R.range(1.2, 2), tr: [], c: i % 4 === 0 ? WHITE : i % 2 ? C[6] : C[5], ph: R.range(0, TAU) };
});
const motes = Array.from({ length: 7 }, () => ({ x: R.range(-8, 8), y: CY + R.range(-4, 6), vy: -R.range(12, 30), life: R.range(0.5, 0.9), d: R.range(0.05, 0.25), w: R.range(0, TAU) }));
let t = 0;
return {
update(dt) {
t += dt;
for (const s of stars) {
if (s.age > s.life) continue;
s.age += dt;
s.tr.unshift([s.x, s.y]);
if (s.tr.length > 4) s.tr.pop();
s.a += s.turn * dt * Math.max(0, 1 - s.age * 1.5);
s.sp -= s.sp * 4.3 * dt;
s.x += Math.cos(s.a) * s.sp * dt;
s.y += Math.sin(s.a) * s.sp * dt + 6 * s.age * dt;
if (s.y > -2) (s.y = -2), (s.a = -Math.abs(s.a)), (s.sp *= 0.5);
}
lights.update(dt);
},
draw(p) {
if (t < 0.07) p.circle(0, CY, 5.5 * (1 - t / 0.07) + 1, WHITE);
if (t < 0.16) {
const k = 1 - t / 0.16, L = 26 * ease.outCubic(Math.min(1, t / 0.03 + 0.4)) * k;
for (const [dx, dy, l] of [[1, 0, 1], [-1, 0, 1], [0, 1, 0.6], [0, -1, 0.6]])
p.line(0, CY, dx * L * l, CY + dy * L * l, (u) => (u < 0.3 ? WHITE : u < 0.65 ? C[6] : C[5]), (u) => (u < 0.5 ? 1 : (1 - u) * 2) * (0.5 + k));
p.glow(0, CY, 20 * k + 4, C[5], 0.6 * k);
}
const u1 = t / 0.32;
if (u1 < 1) {
const r = 3 + 23 * ease.outExpo(u1);
p.ring(0, CY, r, 1, u1 < 0.3 ? WHITE : C[6], 1.3 - u1 * 1.2);
p.glowRing(0, CY, r, 4, C[5], 0.4 * (1 - u1));
}
const u2 = (t - 0.04) / 0.5;
if (u2 > 0 && u2 < 1) {
const r = 2 + 16 * ease.outCubic(u2);
p.ring(0, CY, r, Math.max(1, 2.6 * (1 - u2)), C[5], 1 - u2);
}
for (const s of stars) {
if (s.age > s.life) continue;
const k = 1 - s.age / s.life, tw = 0.65 + 0.35 * Math.sin(s.age * 26 + s.ph);
s.tr.forEach(([x, y], i) => i > 0 && p.dot(x, y, i < 2 ? C[5] : C[4], (1 - i / 4) * k * 1.4));
if (k < 0.3 && Math.sin(s.age * 40 + s.ph) < 0) continue;
glint(p, s.x, s.y, Math.round(s.size * tw * Math.min(1, k * 2.5)), s.c, 0.45 * k);
}
for (const m of motes) {
const a = t - m.d;
if (a < 0 || a > m.life) continue;
const k = 1 - a / m.life, x = m.x + Math.sin(a * 6 + m.w) * 1.5, y = m.y + m.vy * a;
p.dot(x, y, k > 0.5 ? C[6] : C[5], k * 1.5);
p.glow(x + 0.5, y + 0.5, 3, C[5], 0.3 * k);
}
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/pickups/_lib.js": function(__r, __exports){
const { createFrame, Painter, TAU, WHITE, hex, ramp, scale, rand } = __r("core/index.js");
function fit(palette, n = 8) {
const r = ramp(palette);
if (!r.length) return Array(n).fill(WHITE);
if (r.length >= n - 1) {
while (r.length < n) r.push(r[r.length - 1]);
return r;
}
return Array.from({ length: n }, (_, i) => r[Math.round((i * (r.length - 1)) / (n - 1))]);
}
class Layer {
constructor(w = 64, h = 64) {
this.f = createFrame(w, h);
this.q = new Painter(this.f);
this.tmp = new Uint32Array(w * h);
}
begin(x0, y0) {
const f = this.f;
f.ox = Math.floor(x0);
f.oy = Math.floor(y0);
f.color.fill(0);
f.light.fill(0);
return this.q.reset().place(0, 0);
}
idx(x, y) {
const f = this.f, i = Math.floor(x) - f.ox, j = Math.floor(y) - f.oy;
return i < 0 || j < 0 || i >= f.w || j >= f.h ? -1 : j * f.w + i;
}
get(x, y) {
const i = this.idx(x, y);
return i < 0 ? 0 : this.f.color[i];
}
set(x, y, c) {
const i = this.idx(x, y);
if (i >= 0) this.f.color[i] = c;
}
fill(x0, y0, x1, y1, fn) {
for (let y = Math.floor(y0); y <= y1; y++)
for (let x = Math.floor(x0); x <= x1; x++) {
const c = fn(x + 0.5, y + 0.5);
if (c) this.set(x, y, c);
}
}
outline(c, corners = false) {
const f = this.f, C = f.color, T = this.tmp, w = f.w, h = f.h;
T.fill(0);
for (let j = 0; j < h; j++)
for (let i = 0; i < w; i++) {
const k = j * w + i;
if (C[k]) continue;
let n = (i > 0 && C[k - 1]) || (i < w - 1 && C[k + 1]) || (j > 0 && C[k - w]) || (j < h - 1 && C[k + w]);
if (!n && corners) n = (i > 0 && j > 0 && C[k - w - 1]) || (i < w - 1 && j > 0 && C[k - w + 1]) || (i > 0 && j < h - 1 && C[k + w - 1]) || (i < w - 1 && j < h - 1 && C[k + w + 1]);
if (n) T[k] = typeof c === "function" ? c(i + f.ox, j + f.oy, n) : c;
}
for (let k = 0; k < w * h; k++) if (T[k]) C[k] = T[k];
return this;
}
map(fn) {
const f = this.f, C = f.color;
for (let k = 0; k < C.length; k++) if (C[k]) C[k] = fn((k % f.w) + f.ox, Math.floor(k / f.w) + f.oy, C[k]) || C[k];
return this;
}
draw(p, dx = 0, dy = 0, a = 1, clip = null) {
const f = this.f, C = f.color;
for (let k = 0; k < C.length; k++) {
if (!C[k]) continue;
const x = (k % f.w) + f.ox + dx;
if (clip && (x < clip[0] || x >= clip[1])) continue;
p.dot(x, Math.floor(k / f.w) + f.oy + dy, C[k], a);
}
return this;
}
}
const SHADOW = hex("#100e17");
function shadow(p, x, rx, k = 1) {
if (rx < 1) return;
for (let row = 0; row < 2; row++) {
const w = rx - row * 2;
for (let i = Math.floor(x - w); i < Math.ceil(x + w); i++) {
const e = Math.abs(i + 0.5 - x) / w;
if (e <= 1) p.dot(i, row, SHADOW, row ? k : k * (e < 0.8 ? 1 : 0.5));
}
}
}
function twinkle(p, x, y, s, c, mid = c, core = WHITE) {
s = Math.round(s);
if (s <= 0) return;
for (let d = 1; d <= s - 1; d++) {
const k = d < s / 2 ? mid : c;
p.px(x + d, y, k), p.px(x - d, y, k), p.px(x, y + d, k), p.px(x, y - d, k);
}
if (s >= 4) p.px(x + 1, y + 1, c), p.px(x - 1, y - 1, c), p.px(x + 1, y - 1, c), p.px(x - 1, y + 1, c);
p.px(x, y, core);
}
const bob = (ph, amp, n = 1, off = 0) => -amp * Math.sin((ph * n + off) * TAU);
function pillow(L, x0, y0, x1, y1, sdf, color, { bevel = 3, light = [-0.5, -0.6, 0.62], clip = null } = {}) {
L.fill(x0, y0, x1, y1, (x, y) => {
const d = sdf(x, y);
if (d > 0 || (clip && clip(x, y))) return 0;
const e = -d;
let gx = sdf(x + 0.5, y) - sdf(x - 0.5, y), gy = sdf(x, y + 0.5) - sdf(x, y - 0.5);
const gl = Math.hypot(gx, gy) || 1;
gx /= gl;
gy /= gl;
const k = Math.max(0, 1 - e / bevel) * 1.25, sn = Math.sin(k), cs = Math.cos(k);
return color(gx * sn * light[0] + gy * sn * light[1] + cs * light[2], e, x, y);
});
}
function heartSdf(x, y, cx, cy, w, h = w) {
const S = w / 1.14, X = (x - cx) / S, Y = -(y - cy) / (h / 1.14) + 0.12;
const q = X * X + Y * Y - 1, f = q * q * q - X * X * Y * Y * Y;
const gx = 6 * X * q * q - 2 * X * Y * Y * Y, gy = 6 * Y * q * q - 3 * X * X * Y * Y;
return (f / Math.max(Math.hypot(gx, gy), 0.6)) * S;
}
const INK = hex("#0b0814");
function blobShadow(p, x, rx, k = 1, y = 0) {
if (rx < 0.8 || k <= 0) return;
for (let i = Math.floor(x - rx); i <= Math.ceil(x + rx); i++) {
const u = Math.abs(i + 0.5 - x) / rx;
if (u > 1) continue;
const a = k * (1 - u * u);
p.dot(i, y, INK, a * 1.1);
if (u < 0.6) p.dot(i, y + 1, INK, a * 0.6);
}
}
function glint(p, x, y, arm, c, k = 0.4, tip = scale(c, 0.8)) {
const n = Math.round(arm), X = Math.floor(x), Y = Math.floor(y);
if (n < 0) return;
for (let d = 1; d <= n; d++) {
const cc = d === n && n > 1 ? tip : c;
p.px(X + d, Y, cc), p.px(X - d, Y, cc), p.px(X, Y + d, cc), p.px(X, Y - d, cc);
}
p.px(X, Y, n > 0 ? WHITE : c);
p.glow(X + 0.5, Y + 0.5, 3 + n * 2.5, c, k);
}
function pool(p, x, y, rx, ry, c, k) {
if (k <= 0.004 || rx < 1) return;
p.shade(x - rx, y - ry, x + rx, y + ry, (px, py, out) => {
const dx = (px - x) / rx, dy = (py - y) / ry, d = dx * dx + dy * dy;
if (d >= 1) return;
const f = 1 - Math.sqrt(d);
out.l = c;
out.k = f * f * k;
});
}
function coin(L, p, x, y, r, ax, spin, C, white = false, a = 1, snap = true) {
const X = snap ? Math.round(x) : x, Y = snap ? Math.round(y) : y, cs = Math.cos(spin), sn = Math.sin(spin);
const b = Math.max(0.5, r * Math.abs(cs)), th = 1.2 * sn * Math.sign(cs || 1), ca = Math.cos(ax), sa = Math.sin(ax);
const face = Math.abs(cs), R = Math.ceil(r) + 2;
L.begin(Math.floor(X) - R, Math.floor(Y) - R);
L.fill(Math.floor(X) - R, Math.floor(Y) - R, Math.floor(X) + R, Math.floor(Y) + R, (px, py) => {
const dx = px - X, dy = py - Y, u = dx * ca + dy * sa, w = -dx * sa + dy * ca;
const ef = Math.hypot(u / r, w / b), er = Math.hypot(u / r, (w - th) / b);
if (white && (ef <= 1 || er <= 1)) return WHITE;
if (ef <= 1) {
const lit = -(dx * 0.62 + dy * 0.78) / Math.max(1, Math.hypot(dx, dy)), dim = face < 0.45 ? 1 : 0;
if (b < 1.1) return lit > 0 ? C[6] : C[4];
if (ef > 0.72) return C[(lit > 0.3 ? 6 : lit > -0.35 ? 5 : 3) - dim];
if (b > 2.2 && ef > 0.42) return C[(lit > 0.2 ? 4 : 5) - dim];
if (face > 0.6 && lit > 0.5) return C[7];
return C[5 - dim];
}
if (er <= 1) return Math.abs(w - th) < Math.abs(w) ? C[2] : C[3];
return 0;
});
L.outline(C[1]).draw(p, 0, 0, a);
}
function gemlet(L, p, x, y, r, ang, G, white = false, a = 1) {
const X = Math.round(x), Y = Math.round(y), ca = Math.cos(ang), sa = Math.sin(ang), n = G.length, R = Math.ceil(r * 1.4) + 2;
const ct = r * 0.75, tw = r * 0.5, pv = r * 1.3;
L.begin(X - R, Y - R);
L.fill(X - R, Y - R, X + R - 1, Y + R - 1, (px, py) => {
const dx = px - X, dy = py - Y, u = dx * ca + dy * sa, w = -dx * sa + dy * ca;
let facet;
if (w < 0) {
if (w < -ct || Math.abs(u) > r - ((-w) / ct) * (r - tw)) return 0;
facet = w < -ct * 0.45 && Math.abs(u) < tw * 0.95 ? 0 : u < 0 ? 1 : 2;
} else {
if (w > pv || Math.abs(u) > r * (1 - w / pv)) return 0;
facet = Math.abs(u) < 0.5 ? 4 : u < 0 ? 3 : 5;
}
if (white) return WHITE;
const N = [[0, -1], [-0.7, -0.7], [0.7, -0.7], [-0.6, 0.8], [0, 1], [0.6, 0.8]][facet];
const nx = N[0] * ca - N[1] * sa, ny = N[0] * sa + N[1] * ca, l = -(nx * 0.62 + ny * 0.78);
if (facet === 0 && l > 0.3 && u < 0) return WHITE;
return l > 0.6 ? G[n - 1] : l > 0.2 ? G[n - 2] : l > -0.2 ? G[n - 3] : l > -0.6 ? G[n - 4] : G[n - 5];
});
L.outline(G[0]).draw(p, 0, 0, a);
}
function brilliant({ r = 7.5, crown = 3.6, table = 0.52, pavilion = 8, girdle = 0.8, n = 8 } = {}) {
const planes = [{ n: [0, 1, 0], d: crown + girdle / 2, kind: 0 }];
const cs = Math.atan2(crown, r * (1 - table)), ps = Math.atan2(pavilion, r);
for (let i = 0; i < n * 2; i++) {
const a = (i * Math.PI) / n, half = i % 2;
const c = half ? Math.min(1.45, cs + 0.22) : cs, pv = half ? ps - 0.1 : ps;
planes.push({ n: [Math.sin(c) * Math.cos(a), Math.cos(c), Math.sin(c) * Math.sin(a)], d: r * Math.sin(c) * (half ? 1.012 : 1) + (girdle / 2) * Math.cos(c), kind: half ? 2 : 1 });
planes.push({ n: [Math.cos(a), 0, Math.sin(a)], d: r * (half ? 1.0 : 1.0), kind: 3 });
planes.push({ n: [Math.sin(pv) * Math.cos(a), -Math.cos(pv), Math.sin(pv) * Math.sin(a)], d: r * Math.sin(pv) * (half ? 1.03 : 1) + (girdle / 2) * Math.cos(pv), kind: half ? 5 : 4 });
}
return { planes, r, top: crown + girdle / 2, bottom: pavilion + girdle / 2 };
}
function prism({ r = 4.6, half = 5.5, top = 7.5, bottom = 6, n = 6 } = {}) {
const planes = [], ct = Math.atan2(top, r), cb = Math.atan2(bottom, r);
for (let i = 0; i < n; i++) {
const a = (i * TAU) / n;
planes.push({ n: [Math.cos(a), 0, Math.sin(a)], d: r, kind: 6 });
planes.push({ n: [Math.sin(ct) * Math.cos(a), Math.cos(ct), Math.sin(ct) * Math.sin(a)], d: Math.sin(ct) * r + Math.cos(ct) * half, kind: 7 });
planes.push({ n: [Math.sin(cb) * Math.cos(a), -Math.cos(cb), Math.sin(cb) * Math.sin(a)], d: Math.sin(cb) * r + Math.cos(cb) * half, kind: 8 });
}
return { planes, r: r / Math.cos(Math.PI / n), top: half + top, bottom: half + bottom };
}
function drawGem(L, p, g, x, y, spin, C, { tilt = 0.32, white = false, a = 1, edges = true, gain = 1 } = {}) {
const cs = Math.cos(spin), sn = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt);
const P = g.planes.map((q) => ({ n: [q.n[0] * cs - q.n[2] * sn, q.n[1], q.n[0] * sn + q.n[2] * cs], d: q.d, kind: q.kind }));
const Lx = -0.55, Ly = 0.72, Lz = 0.42, D = [0, -st, -ct], V = [0, st, ct];
const Hl = Math.hypot(Lx + V[0], Ly + V[1], Lz + V[2]), H = [(Lx + V[0]) / Hl, (Ly + V[1]) / Hl, (Lz + V[2]) / Hl];
const X = Math.round(x), Y = Math.round(y), R = Math.ceil(g.r) + 2, top = Math.ceil(g.top + 2), bot = Math.ceil(g.bottom + 2);
let best = -1, bx = X, by = Y;
const ids = new Map();
L.begin(X - R, Y - top);
L.fill(X - R, Y - top, X + R, Y + bot, (px, py) => {
const sx = px - X, sy = -(py - Y);
const o = [sx, sy * ct, -sy * st];
let t0 = -1e9, t1 = 1e9, hit = null;
for (const q of P) {
const nd = q.n[0] * D[0] + q.n[1] * D[1] + q.n[2] * D[2], no = q.n[0] * o[0] + q.n[1] * o[1] + q.n[2] * o[2];
if (Math.abs(nd) < 1e-6) {
if (no > q.d) return 0;
continue;
}
const tt = (q.d - no) / nd;
if (nd < 0) {
if (tt > t0) (t0 = tt), (hit = q);
} else if (tt < t1) t1 = tt;
}
if (!hit || t0 > t1) return 0;
if (white) return WHITE;
ids.set((Math.floor(px) + 500) * 1000 + Math.floor(py) + 500, P.indexOf(hit));
const n = hit.n, pav = hit.kind === 4 || hit.kind === 5 || hit.kind === 8;
const m = pav ? [n[0], -n[1] * 0.6, n[2]] : n, ml = Math.hypot(m[0], m[1], m[2]);
const lam = Math.max(0, (m[0] * Lx + m[1] * Ly + m[2] * Lz) / ml), spec = Math.pow(Math.max(0, (m[0] * H[0] + m[1] * H[1] + m[2] * H[2]) / ml), 18);
let b = pav ? 0.02 + 0.72 * Math.pow(lam, 2.4) : hit.kind === 3 ? 0.12 + 0.4 * lam : 0.04 + 0.66 * Math.pow(lam, 1.8);
if (hit.kind === 6) b = 0.16 + 0.66 * Math.pow(Math.max(0, (n[0] * Lx + n[2] * Lz) / Math.hypot(Lx, Lz)), 1.3);
else if (hit.kind === 7) b = 0.22 + 0.62 * Math.pow(lam, 1.2);
else if (hit.kind === 9) b = 0.62 + 0.25 * lam;
else if (hit.kind === 10) b = 0.3 + 0.5 * lam + (rand(Math.floor(px - X), Math.floor(py - Y), 43) - 0.5) * 0.08;
if (hit.kind !== 9) b *= gain;
if (hit.kind === 0) b -= 0.04;
const s = b + spec * 0.6;
if (s > best) (best = s), (bx = px), (by = py);
if (spec > 0.8) return pav ? C[6] : WHITE;
return C[Math.max(1, Math.min(6, Math.round(1 + s * 5.6)))];
});
if (!white && edges) {
const out = [];
for (const [key, id] of ids) {
const kx = Math.floor(key / 1000), ky = key - kx * 1000, x = kx - 500, y = ky - 500, r = ids.get(key + 1000), d = ids.get(key + 1);
if ((r !== undefined && r !== id) || (d !== undefined && d !== id)) {
const c = L.get(x, y) >>> 0, i = C.findIndex((k) => k >>> 0 === c), pav = [4, 5, 8].includes(P[id].kind);
if (i > 0) out.push([x, y, pav ? C[Math.max(1, i - 1)] : C[Math.min(7, i + 1)]]);
}
}
for (const [x, y, c] of out) L.set(x, y, c);
}
L.outline(C[0]).draw(p, 0, 0, a);
return { x: bx, y: by, k: best };
}
function coin3d(L, p, x, y, r, th, theta, C, { a = 1, white = false } = {}) {
const ct = Math.cos(theta), st = Math.sin(theta), sg = ct < 0 ? -1 : 1, act = Math.abs(ct), ast = Math.abs(st);
const xc = (th / 2) * st * sg, nfx = st * sg, Lx = -0.55, Ly = 0.45, Lz = 0.7, Ln = Math.hypot(Lx, Ly, Lz);
const lam = (nfx * Lx + act * Lz) / Ln, Hx = Lx / Ln, Hz = Lz / Ln + 1, Hn = Math.hypot(Hx, Hz);
const base = Math.max(2, Math.min(5, Math.round(2 + lam * 3.2)));
const X = Math.round(x), Y = Math.round(y), B = Math.ceil(r + th) + 2;
let flash = 0;
L.begin(X - B, Y - B);
L.fill(X - B, Y - B, X + B, Y + B, (px, py) => {
const sx = px - X, sy = -(py - Y);
if (Math.abs(sy) > r) return 0;
const s = Math.sqrt(1 - (sy / r) ** 2), hw = r * s * act, xr = -(st < 0 ? -1 : 1) * s * r * ct, rw = (th / 2) * ast;
if (white && (Math.abs(sx - xc) <= hw || Math.abs(sx - xr) <= rw + 0.05)) return WHITE;
if (Math.abs(sx - xc) <= hw && act > 0.08) {
const fx = (sx - xc) / act, fy = sy, d = Math.hypot(fx, fy) / r;
const tx = nfx + (fx / r) * 0.3 * act, sp = Math.pow(Math.max(0, (tx * Hx + act * Hz) / Hn / Math.hypot(tx, act)), 130);
flash = Math.max(flash, sp);
const lit = (-fx * 0.6 + fy * 0.8) / Math.max(0.5, Math.hypot(fx, fy));
let k;
if (d > 0.76) k = base + (lit > 0.75 ? 2 : lit > 0.3 ? 1 : lit < -0.35 ? -1 : 0);
else {
const q = (Math.abs(fx) + Math.abs(fy)) / (r * 0.52);
k = q >= 1 ? base - 1 : q < 0.45 ? base + 1 : fx <= 0 && fy >= 0 ? base + 1 : fx > 0 && fy < 0 ? base - 2 : base;
}
if (sp > 0.5) return sp > 0.8 ? WHITE : C[Math.min(7, k + 2)];
return C[Math.max(2, Math.min(6, k))];
}
if (Math.abs(sx - xr) <= rw + 0.05) {
const cphi = xr < 0 ? -s : s, n = [cphi * ct, sy / r, -cphi * st], l = (n[0] * Lx + n[1] * Ly + n[2] * Lz) / Ln;
const groove = Math.floor((Math.asin(sy / r) + Math.PI) * 9) % 2;
const edge = Math.abs(sx - xr) > rw - 0.6 && Math.sign(sx - xr) === Math.sign(xc - xr);
return C[Math.max(1, Math.min(6, Math.round(2.6 + l * 2.6) - groove + (edge ? 1 : 0)))];
}
return 0;
});
L.outline(C[1]).draw(p, 0, 0, a);
return flash;
}
__exports.fit = fit; __exports.Layer = Layer; __exports.shadow = shadow; __exports.twinkle = twinkle; __exports.bob = bob; __exports.pillow = pillow; __exports.heartSdf = heartSdf; __exports.blobShadow = blobShadow; __exports.glint = glint; __exports.pool = pool; __exports.coin = coin; __exports.gemlet = gemlet; __exports.brilliant = brilliant; __exports.prism = prism; __exports.drawGem = drawGem; __exports.coin3d = coin3d;
},
"fx/pickups/coin-spin.js": function(__r, __exports){
const { fit, rand, TAU, WHITE, scale } = __r("core/index.js");
const { Layer, coin3d, glint, blobShadow } = __r("fx/pickups/_lib.js");
const meta = {
name: "Coin spin",
desc: "A thick gold coin turning on its edge: an embossed star face, a reeded rim showing as it goes edge-on, a flash sweeping the face, bobbing over its shadow.",
tags: ["pickup", "coin", "gold", "money", "loop"],
size: [56, 56],
origin: [28, 48],
duration: 1.6,
loop: true,
fps: 30,
bg: "ground",
options: { palette: ["#1e1206", "#4a2c08", "#86520c", "#c48412", "#f0b424", "#ffe066", "#fff6c4", "#ffffff"], seed: 3 },
};
const L = new Layer(32, 32), R = 7, TH = 3, HOVER = 17;
function drawBack(p, t, o) {
const T = meta.duration, ph = t / T, th = ph * TAU, y = -HOVER - 2 * Math.sin(ph * TAU);
blobShadow(p, 0, 2.5 + 4.5 * Math.abs(Math.cos(th)) + 1.5 * Math.abs(Math.sin(th)), 0.85 - (-y - HOVER + 2) * 0.06);
}
function draw(p, t, o) {
const C = fit(o.palette, 8), T = meta.duration, ph = t / T, th = ph * TAU, y = -HOVER - 2 * Math.sin(ph * TAU);
const facing = Math.abs(Math.cos(th));
p.glow(0, y, 20, C[4], 0.3 + 0.12 * facing);
const flash = coin3d(L, p, 0, y, R, TH, th, C);
p.glow(-1, y - 1, 12, C[6], 0.35 * flash);
if (flash > 0.3) glint(p, -4, y - 4, 1 + 3.2 * flash, C[6], 0.5 * flash);
for (let i = 0; i < 5; i++) {
const life = 0.35, age = (((t - (i / 5) * T - rand(i, o.seed, 3) * 0.08) % T) + T) % T;
if (age > life) continue;
const a = rand(i, o.seed, 1) * TAU + i * 2.1, d = 10 + rand(i, o.seed, 2) * 5, k = Math.sin((age / life) * Math.PI);
glint(p, Math.cos(a) * d, y + Math.sin(a) * d * 0.85 - age * 8, Math.round(2 * k), i % 2 ? C[6] : WHITE, 0.35 * k);
}
}
__exports.meta = meta; __exports.drawBack = drawBack; __exports.draw = draw;
},
"fx/pickups/power-star.js": function(__r, __exports){
const { fit, clamp, rand, fly, TAU, WHITE, hex } = __r("core/index.js");
const { Layer, glint, blobShadow } = __r("fx/pickups/_lib.js");
const meta = {
name: "Power star",
desc: "A fat bevelled star rocks side to side and swells on each beat, rays of light turning slowly behind it, sparks spinning off its points.",
tags: ["pickup", "star", "power-up", "invincible", "bonus", "loop"],
size: [88, 84],
origin: [44, 76],
duration: 1.6,
loop: true,
fps: 30,
bg: "ground",
options: { palette: ["#2a1604", "#5e3208", "#a05c0c", "#e09414", "#ffc626", "#ffe866", "#fff8c4", "#ffffff"], seed: 9 },
};
const L = new Layer(44, 44), HOVER = 25, RO = 11.5, RI = 5.2, INK = hex("#1a0e04");
const BEATS = [0.25, 0.75], RAYS = 10, LA = Math.atan2(-0.8, -0.6);
const swell = (ph) => {
let s = 0;
for (const b of BEATS) {
const u = (((ph - b) % 1) + 1) % 1;
s += Math.exp(-u * 14) * (1 - u * 2.5 > 0 ? 1 : 0);
}
return s;
};
function star(p, C, cx, cy, rot, sc) {
L.begin(Math.floor(cx) - 21, Math.floor(cy) - 21);
L.fill(Math.floor(cx) - 21, Math.floor(cy) - 21, Math.floor(cx) + 20, Math.floor(cy) + 20, (px, py) => {
const dx = (px - cx) / sc, dy = (py - cy) / sc, r = Math.hypot(dx, dy);
if (r > RO + 0.5) return 0;
let a = Math.atan2(dy, dx) - rot + Math.PI / 2;
a = ((a % TAU) + TAU) % TAU;
const k = Math.floor(a / (Math.PI / 5)), half = k % 2, tip = (Math.floor(k / 2) + half) * ((2 * Math.PI) / 5);
const tA = tip - Math.PI / 2 + rot, iA = tA + (half ? -1 : 1) * (Math.PI / 5);
const tx = Math.cos(tA) * RO, ty = Math.sin(tA) * RO, ix = Math.cos(iA) * RI, iy = Math.sin(iA) * RI;
const ex = ix - tx, ey = iy - ty, side = (dx - tx) * ey - (dy - ty) * ex, cside = -tx * ey + ty * ex;
if (side * cside < 0) return 0;
const n = tA + (half ? -1 : 1) * (Math.PI / 2), l = Math.cos(n - LA), ridge = Math.abs(Math.sin(Math.atan2(dy, dx) - tA)) * r < 0.6;
if (r < 1.2) return WHITE;
const toLight = Math.cos(tA - LA);
if (ridge) return toLight > 0.3 ? WHITE : toLight > -0.4 ? C[6] : C[5];
return C[l > 0.6 ? 6 : l > 0.15 ? 5 : l > -0.35 ? 4 : l > -0.75 ? 3 : 2];
});
L.outline(INK).draw(p);
}
function drawBack(p, t, o) {
const C = fit(o.palette, 8), ph = t / meta.duration, y = -HOVER - 1.5 * Math.sin(ph * TAU * 2), sw = swell(ph);
blobShadow(p, 0, 9 + 2 * sw, 0.7);
const spin = ph * ((TAU / RAYS) * 2);
for (let i = 0; i < RAYS; i++) {
const a = spin + (i * TAU) / RAYS, len = (i % 2 ? 22 : 34) * (1 + 0.18 * sw), ca = Math.cos(a), sa = Math.sin(a), w = i % 2 ? 0.06 : 0.09;
p.shade(-len - 2, y - len - 2, len + 2, y + len + 2, (x, yy, out) => {
const rx = x, ry = yy - y, d = rx * ca + ry * sa;
if (d < 8 || d > len) return;
const q = Math.abs(rx * sa - ry * ca), hw = 0.5 + d * w;
if (q > hw + 1.5) return;
out.l = q < hw * 0.5 ? C[6] : C[5];
out.k = (0.32 + 0.22 * sw) * (q < hw ? 1 : 1 - (q - hw) / 1.5) * Math.pow(1 - d / len, 1.2) * Math.min(1, (d - 8) / 4);
});
if (i % 2 === 0) {
const d0 = RO + 3, d1 = Math.min(len * 0.88, sa > 0.05 ? (-2 - y) / sa : Infinity);
if (d1 > d0) p.line(ca * d0, y + sa * d0, ca * d1, y + sa * d1, (u) => (u < 0.35 ? C[6] : C[5]), (u) => (u < 0.5 ? 1 : 1.6 - u * 1.4) * (0.75 + 0.35 * sw));
}
}
}
function draw(p, t, o) {
const C = fit(o.palette, 8), ph = t / meta.duration, y = -HOVER - 1.5 * Math.sin(ph * TAU * 2), sw = swell(ph);
const rot = 0.22 * Math.sin(ph * TAU), sc = 1 + 0.13 * sw;
p.glowRing(0, y, RO * sc + 3, 13, C[4], 0.32 + 0.25 * sw);
p.glow(0, y, 6, C[6], 0.12 + 0.2 * sw);
star(p, C, 0, y, rot, sc);
for (const b of BEATS) {
const age = ((((ph - b) % 1) + 1) % 1) * meta.duration;
if (age > 0.45) continue;
for (let i = 0; i < 5; i++) {
const a = rot + (i * TAU) / 5 - Math.PI / 2, sp = 70 + rand(i, b * 10, 3) * 30, tan = 35;
const vx = Math.cos(a) * sp - Math.sin(a) * tan, vy = Math.sin(a) * sp + Math.cos(a) * tan;
const [x, yy] = fly(Math.cos(a) * RO * sc, y + Math.sin(a) * RO * sc, vx, vy, age, 60, 4), k = 1 - age / 0.45;
glint(p, x, yy, Math.round(2 * k), k > 0.5 ? WHITE : C[6], 0.45 * k);
}
}
const f = Math.floor(ph * 24);
for (let i = 0; i < 18; i++) {
if (rand(f + i * 3, i, o.seed) > 0.32) continue;
const a = rand(i, 1, o.seed) * TAU, d = 13 + rand(i, 2, o.seed) * 20, sy = y + Math.sin(a) * d * 0.85;
if (sy < -2) p.px(Math.cos(a) * d, sy, rand(f, i, 5) < 0.5 ? WHITE : C[6]);
}
for (let i = 0; i < 4; i++) {
const life = 0.3, age = (((t - ((i + 0.3) / 4) * meta.duration) % meta.duration) + meta.duration) % meta.duration;
if (age > life) continue;
const a = rand(i, 7, o.seed) * TAU, d = 15 + rand(i, 8, o.seed) * 12, k = Math.sin((age / life) * Math.PI);
glint(p, Math.cos(a) * d, y + Math.sin(a) * d * 0.85, Math.round(2.5 * k), i % 2 ? C[6] : WHITE, 0.4 * k);
}
const g = ((ph + 0.1) % 0.5) / 0.5;
if (g < 0.14) glint(p, -2 + rot * 4, y - 6, 3 * Math.sin((g / 0.14) * Math.PI), WHITE, 0.5);
}
__exports.meta = meta; __exports.drawBack = drawBack; __exports.draw = draw;
},
"fx/ui/level-up.js": function(__r, __exports){
const { Particles, Lights, P, PF, Rng, fit, band, flare, sparkle, clamp, seg, smooth, ease, noise2, fract, rand, scale, TAU, WHITE, READY } = __r("core/index.js");
const { spell, drawWord, tintActor, lightActor, haloActor } = __r("fx/ui/_lib.js");
const meta = {
name: "Level up",
desc: "Gold gathers at the feet and bursts up as a pillar of light round the hero; rings climb it, LEVEL UP! drops in letter by letter, a shine sweeps it, sparkles twinkle.",
tags: ["ui", "level", "reward", "text", "light", "one-shot"],
size: [176, 138],
origin: [88, 114],
duration: 3.2,
loop: false,
fps: 30,
bg: "ground",
actor: 2,
options: { palette: ["#2a1405", "#5c3008", "#9a5a0e", "#d48e18", "#f5b92c", "#ffde5e", "#fff4bc", "#ffffff"], text: "LEVEL UP!", seed: 5 },
};
const COIL = { turn: 0.9, crouch: 7, lean: 2, fx: -6, fy: -13, bx: 7, by: -13, ffx: -5, fbx: 6 };
const LEAP = { turn: 1.1, y: -16, crouch: -1, fx: -6, fy: -45, bx: 7, by: -44, ffx: -2, ffy: -8, fbx: 5, fby: -3, toeB: true };
const PUMP = { turn: 0.9, crouch: 0, fx: -6, fy: -45, bx: 9, by: -15, ffx: -3, fbx: 4 };
const act = {
onBody: true,
follow: 0,
poses: [
[-0.3, READY],
[0.28, COIL],
[0.3, LEAP, "snap"],
[0.46, { ...LEAP, y: -19 }],
[0.72, { ...LEAP, y: 0, ffy: -4, fby: -4 }, "in"],
[0.74, { ...COIL, crouch: 5 }, "snap"],
[0.95, PUMP, "out"],
[1.2, { ...PUMP, crouch: 1, fy: -43 }],
[1.45, PUMP],
[2.3, { ...PUMP, fy: -41 }],
[2.8, READY],
[3.2, READY],
],
hits: [{ t: 0.28, stop: 0.05, shake: 0.14, amp: 2 }],
dust: [{ t: 0.3, x: 0, n: 7 }, { t: 0.74, x: 0, n: 6 }],
};
const REL = 0.28, RET = 1.02, GONE = 1.34, TOP = 100, TY = -68, DROP = 0.5, STAG = 0.05, LANDED = 1.06, SHINE = 1.24, EXIT = 2.3;
const STRANDS = Array.from({ length: 9 }, (_, i) => ({ x: (i / 8 - 0.5) * 1.5 + (rand(i, 1) - 0.5) * 0.16, sp: 170 + rand(i, 2) * 170, per: 10 + rand(i, 3) * 16, duty: 0.3 + rand(i, 4) * 0.35, ph: rand(i, 5), lvl: rand(i, 6) < 0.35 ? 1 : 2, end: 0.5 + rand(i, 7) * 0.42 }));
const widthAt = (t) => (t < REL ? 0 : 12 * (1 + 0.4 * Math.exp(-(t - REL) * 10)) * (1 - 0.82 * smooth(RET - 0.12, RET + 0.16, t)));
function column(p, C, t) {
const a = t - REL;
if (a < 0 || t > GONE) return;
const top = -TOP * ease.outExpo(clamp(a / 0.12)), bot = -TOP * ease.inCubic(seg(t, RET, GONE)), W = widthAt(t), k = 1 - smooth(RET, GONE, t);
p.glowLine(0, top, 0, Math.min(bot, -34), W * 1.6 + 6, C[5], 0.2 * k + 0.06);
p.glowLine(0, top, 0, Math.min(bot, -40), 5, WHITE, 0.18 * k);
if (a < 0.04) {
for (let y = Math.floor(top); y < bot; y++) {
const wr = W * 0.55 * (1 - 0.3 * (-y / TOP));
for (let x = Math.floor(-wr); x <= Math.ceil(wr); x++) p.dot(x, y, Math.abs(x + 0.5) < wr - 1.5 ? WHITE : C[6], clamp((y + TOP) / 20) * 1.5);
}
return;
}
for (let y = Math.ceil(top); y < Math.ceil(bot); y++) {
const h = -y / TOP, fade = clamp((y + TOP) / 16) * (t < RET ? 1 : clamp((bot - y) / 10)), head = y - top < 3 && a < 0.16;
const wr = W * (1 - 0.3 * h) + 0.9 * noise2(y * 0.2, t * 12, 3);
for (const s of [-1, 1]) {
const run = fract(y * 0.06 + t * 3.4 + (s > 0 ? 0.5 : 0)) < 0.78, xw = s * wr;
p.dot(xw, y, head ? WHITE : run ? C[6] : C[5], fade * 1.4);
p.dot(xw + s, y, C[4], fade * (run ? 0.5 : 0.25));
if (run) p.dot(xw - s, y, C[5], fade * 1.2);
}
p.dot(0, y, WHITE, fade * 1.6);
p.dot(-1, y, noise2(y * 0.3, t * 14, 5) > -0.2 ? WHITE : C[6], fade * 1.3);
if (noise2(y * 0.25, t * 9, 8) > 0.25) p.dot(1, y, C[6], fade * 1.2);
for (const S of STRANDS) {
if (h > S.end) continue;
const ph = fract((y + t * S.sp) / S.per + S.ph);
if (ph > S.duty) continue;
const u = ph / S.duty;
p.px(S.x * wr, y, head || u < 0.2 ? WHITE : u < 0.65 ? C[7 - S.lvl] : C[6 - S.lvl]);
}
}
}
function plate(p, C, t, k) {
if (k <= 0.02) return;
const rx = 9 + 9 * k + Math.sin(t * 9), ry = 2.2;
p.shade(-rx, -ry, rx, ry, (x, y, o) => {
const dx = x / rx, dy = y / ry, d = Math.sqrt(dx * dx + dy * dy);
if (d > 1) return;
const u = d / Math.max(0.05, k);
o.c = u < 0.3 ? WHITE : u < 0.55 ? C[6] : u < 0.8 ? C[5] : C[4];
o.a = d < 0.6 * k ? 1 : k * (1 - d) * 2.2;
});
p.glow(0, -1, rx * 2.2, C[4], 0.35 * k);
}
function rays(p, C, t, k, cx, cy) {
if (k <= 0.02) return;
for (let i = 0; i < 20; i++) {
const an = (i / 20) * TAU + 0.08, ca = Math.cos(an), sa = Math.sin(an), long = i % 2 === 0;
if (Math.abs(sa) < 0.4) continue;
const r0 = 1 / Math.sqrt((ca / 52) ** 2 + (sa / 12) ** 2) + 2 * k, len = (long ? 15 + 7 * rand(i, 9) : 7 + 4 * rand(i, 8)) * k;
if (len < 1) continue;
const sh = 0.75 + 0.25 * Math.sin(t * 7 + i * 2.1), x0 = cx + ca * r0, y0 = cy + sa * r0;
p.line(x0, y0, x0 + ca * len, y0 + sa * len, (u) => (u < 0.3 ? C[7] : u < 0.6 ? C[6] : C[5]), (u) => sh * (u < 0.55 ? 1.3 : (1.3 * (1 - u)) / 0.45));
}
}
function create(o) {
const C = fit(o.palette, 8), R = new Rng(o.seed), A = o.actor, SHADOW = scale(C[0], 0.5);
const ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], C[3]] }), lights = new Lights();
const spawn = (k, x, y, vx, vy, life, ...rest) => ps.spawn(k, x, y, vx, vy, Math.min(life, meta.duration - 0.05 - t), ...rest);
const word = spell(o.text), BASE = TY + 14, X0 = -word.w;
const lets = word.letters.filter((L) => L.g).map((L, i) => ({ g: L.g, w: L.w, cx: X0 + (L.x + L.w / 2) * 2, born: DROP + i * STAG, pop: EXIT + i * 0.04, off: -18, v: 60, sq: 0, flash: 0, on: false, landed: false, rest: false, burst: false }));
const right = X0 + word.w * 2;
const sats = Array.from({ length: 8 }, (_, i) => {
const s = i % 2 ? 1 : -1, x = s * R.range(20, 60), y = TY + 7 + (Math.abs(x) < 50 ? R.sign() * R.range(11, 18) : R.range(-14, 14));
return { x, y, t0: SHINE - 0.1 + i * 0.13 + R.range(0, 0.05), dur: R.range(0.32, 0.5), L: R.range(3, 6) };
});
const halos = [];
let t = 0, released = false, nextHalo = REL + 0.03, gather = 0;
const rush = [];
const drawRush = (p, back) => {
for (const m of rush) {
if (m.back !== back) continue;
const sp = Math.hypot(m.vx, m.vy), ux = m.vx / sp, uy = m.vy / sp, L = m.len;
p.line(m.x - ux * L, m.y - uy * L, m.x - ux * L * 0.4, m.y - uy * L * 0.4, m.c);
p.line(m.x - ux * L * 0.35, m.y - uy * L * 0.35, m.x, m.y, WHITE);
p.glow(m.x, m.y, 4, C[5], 0.25);
}
};
return {
update(dt) {
t += dt;
for (gather += t < REL ? dt * 420 : 0; gather >= 1; gather--) {
const kind = R.next(), sp = R.range(140, 250) * (1 + t * 2);
let x, y, tx, ty;
if (kind < 0.42) {
const an = R.range(0, TAU), D = R.range(22, 70);
(x = Math.cos(an) * D), (y = -1 - Math.abs(Math.sin(an)) * D * 0.1), (tx = Math.cos(an) * 3), (ty = -1);
} else if (kind < 0.84) {
const an = R.range(0, TAU), D = R.range(34, 64);
(x = Math.cos(an) * D), (y = Math.min(-3, -20 + Math.sin(an) * D * 0.85)), (tx = Math.cos(an) * 11), (ty = -20 + Math.sin(an) * 14);
} else {
if (t < REL * 0.4) continue;
(x = R.range(-9, 9)), (y = -1), (tx = x * 0.7), (ty = -R.range(26, 44));
}
const dx = tx - x, dy = ty - y, l = Math.hypot(dx, dy) || 1;
rush.push({ x, y, vx: (dx / l) * sp, vy: (dy / l) * sp, life: Math.min(l / sp, REL + 0.06 - t), len: R.range(5, 9), c: R.chance(0.45) ? C[6] : C[5], back: kind > 0.84 && R.chance(0.5) });
}
for (let i = rush.length - 1; i >= 0; i--) {
const m = rush[i];
if ((m.life -= dt) <= 0) rush.splice(i, 1);
else (m.x += m.vx * dt), (m.y += m.vy * dt);
}
if (t < REL && R.chance(0.12)) spawn(P.STAR, R.range(-30, 30), -R.range(0, 3), 0, -R.range(10, 30), R.range(0.3, 0.5), C[6], 0.6);
if (!released && t >= REL) {
released = true;
lights.add(0, -24, 90, C[5], 0.6, 0.7);
lights.add(0, -8, 40, WHITE, 0.6, 0.12);
for (let i = 0; i < 22; i++) {
const an = (i / 22) * TAU + R.range(-0.12, 0.12), sp = R.range(260, 460);
const y0 = -18 + Math.sin(an) * 8, vy = Math.sin(an) * sp * 0.8, life = Math.min(R.range(0.1, 0.2), vy > 0 ? -y0 / vy : vy < 0 ? (y0 + 104) / -vy : 1, 78 / Math.abs(Math.cos(an) * sp));
spawn(P.MOTE, Math.cos(an) * 6, y0, Math.cos(an) * sp, vy, life, R.chance(0.4) ? C[7] : C[6], 1, 0, an > 0.3 && an < Math.PI - 0.3 ? PF.BACK : 0);
}
for (let i = 0; i < 26; i++) {
const an = -Math.PI / 2 + R.range(-1.3, 1.3), sp = R.range(120, 290);
spawn(P.SPARK, R.range(-5, 5), -2, Math.cos(an) * sp, Math.sin(an) * sp, R.range(0.35, 0.8));
}
for (let i = 0; i < 16; i++)
spawn(P.STAR, R.range(-10, 10), R.range(-36, -4), R.range(-30, 30), -R.range(15, 60), R.range(0.6, 1.3), R.pick([C[7], C[6], C[5]]), R.chance(0.35) ? R.range(1.5, 2.6) : R.range(0.4, 0.9), 0, R.chance(0.4) ? PF.BACK : 0);
}
const W = widthAt(t);
if (t >= nextHalo && t < RET - 0.1) halos.push(t), (nextHalo += 0.16);
if (t > REL && t < RET + 0.1 && R.chance(0.5)) {
const s = R.sign();
const y = R.range(-4, -60), vy = -R.range(140, 260);
spawn(P.MOTE, s * R.range(0.75, 1.6) * W, y, 0, vy, Math.min(R.range(0.16, 0.32), (y + 96) / -vy), R.chance(0.5) ? C[7] : C[6], R.range(0.6, 1), 0, R.chance(0.5) ? PF.BACK : 0);
}
if (t > REL && t < 2.4 && R.chance(0.14 * (1 - seg(t, 1.6, 2.4)))) {
spawn(P.EMBER, R.range(-20, 20), -R.range(1, 30), R.range(-15, 15), -R.range(20, 55), R.range(0.8, 1.6), C[5], R.range(1, 2), 0, R.chance(0.4) ? PF.BACK : 0);
}
if (A && t > REL + 0.1 && t < 2.2 && R.chance(0.09)) {
const m = A.mask;
for (let n = 0; n < 12; n++) {
const i = R.int(0, m.w - 1), j = R.int(0, m.h - 1);
if (!m.data[j * m.w + i]) continue;
spawn(P.STAR, A.x + i + 0.5, A.y + j + 0.5, R.range(-8, 8), -R.range(14, 34), R.range(0.6, 1.1), R.pick([C[7], C[6], C[5]]), R.chance(0.2) ? 1.5 : 0.6, 0, R.chance(0.5) ? PF.BACK : 0);
break;
}
}
if (t > 1.0 && t < 2.5 && R.chance(0.13)) {
const up = R.chance(0.6), x = up ? R.range(-58, 58) : R.range(-20, 20), y = up ? TY + 7 + R.range(-16, 16) : R.range(-44, -6);
spawn(P.STAR, x, y, R.range(-6, 6), -R.range(4, 14), R.range(0.4, 0.8), R.pick([C[7], C[6], C[6], C[5]]), R.chance(0.3) ? R.range(1.5, 2.4) : 0.6, 0, R.chance(0.3) ? PF.BACK : 0);
}
for (const L of lets) {
if (t < L.born) continue;
L.on = true;
if (!L.rest) {
L.v += 1700 * dt;
L.off += L.v * dt;
if (L.off >= 0 && L.v > 0) {
L.off = 0;
if (L.v > 110) {
L.sq = 1;
if (!L.landed) {
L.landed = true;
L.flash = 1;
lights.add(L.cx, BASE - 7, 18, C[5], 0.55, 0.25);
for (const s of [-1, 1]) spawn(P.STAR, L.cx + s * L.w, BASE - R.range(0, 3), s * R.range(15, 40), -R.range(5, 25), R.range(0.25, 0.45), C[6], R.range(0.5, 1.2));
}
L.v = -L.v * 0.3;
} else (L.v = 0), (L.rest = true);
}
}
L.sq = Math.max(0, L.sq - dt / 0.1);
L.flash = Math.max(0, L.flash - dt / 0.12);
if (!L.burst && t >= L.pop + 0.06) {
L.burst = true;
for (let i = 0; i < 3; i++) {
const an = R.range(0, TAU), sp = R.range(20, 55);
spawn(P.STAR, L.cx + R.range(-3, 3), BASE - 7 + R.range(-4, 4), Math.cos(an) * sp, Math.sin(an) * sp - 15, R.range(0.3, 0.6), R.pick([C[7], C[6]]), i ? 0.6 : R.range(1.2, 2));
}
}
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
rays(p, C, t, ease.outExpo(seg(t, LANDED, LANDED + 0.2)) * (1 - ease.inQuad(seg(t, EXIT - 0.15, EXIT + 0.1))), 0, TY + 7);
if (t < REL) {
const k = seg(t, 0.02, REL);
band(p, 0, 0, 4 + 52 * (1 - ease.inQuad(k)), 0.2, 1.5, k * 1.1, C, (g) => Math.sin(g) < 0);
}
for (const [d, r1, th] of [[0, 72, 4], [0.08, 46, 2.5]]) {
const k = (t - REL - d) / 0.55;
if (k > 0 && k < 1) band(p, 0, 0, 5 + r1 * ease.outCubic(k), 0.2, Math.max(1, th * (1 - k)), 1.15 - k, C, (g) => Math.sin(g) < 0, k < 0.15);
}
for (const h0 of halos) {
const k = (t - h0) / 0.6;
if (k > 0 && k < 1) band(p, 0, -2 - 72 * ease.outQuad(k), (widthAt(t) * 1.45 + 4) * (1 - 0.4 * k), 0.3, 1.5, (1 - k) * 1.4, C, (g) => Math.sin(g) < 0, k < 0.12);
}
column(p, C, t);
plate(p, C, t, t < REL ? 0.55 * seg(t, 0.05, REL) : 1 - smooth(RET - 0.1, GONE + 0.2, t));
ps.draw(p, "back");
drawRush(p, true);
},
draw(p) {
if (t < REL) {
const k = seg(t, 0.02, REL);
band(p, 0, 0, 4 + 52 * (1 - ease.inQuad(k)), 0.2, 1.5, k * 1.1, C, (g) => Math.sin(g) >= 0);
}
for (const [d, r1, th] of [[0, 72, 4], [0.08, 46, 2.5]]) {
const k = (t - REL - d) / 0.55;
if (k > 0 && k < 1) band(p, 0, 0, 5 + r1 * ease.outCubic(k), 0.2, Math.max(1, th * (1 - k)), 1.15 - k, C, (g) => Math.sin(g) >= 0, k < 0.15);
}
for (const h0 of halos) {
const k = (t - h0) / 0.6;
if (k > 0 && k < 1) band(p, 0, -2 - 72 * ease.outQuad(k), (widthAt(t) * 1.45 + 4) * (1 - 0.4 * k), 0.3, 1.5, (1 - k) * 1.4, C, (g) => Math.sin(g) >= 0, k < 0.12);
}
const lit = smooth(REL - 0.02, REL + 0.04, t) * (1 - smooth(RET, 2.5, t));
tintActor(p, A, t < REL ? 0 : t < REL + 0.06 ? 1 : Math.exp(-(t - REL - 0.06) / 0.07), [C[4], C[5], C[6]]);
lightActor(p, A, C[5], 0.1 * seg(t, 0.05, REL) * (1 - lit) + 0.06 * lit, 0.6 * lit, t);
haloActor(p, A, C[5], 0.85 * lit * (1 - smooth(RET, GONE + 0.3, t)) + 0.3 * lit, t);
if (t < REL) {
const k = seg(t, 0.05, REL), beat = 1 + 0.4 * Math.exp(-((t - REL * 0.6) ** 2) / 0.001);
sparkle(p, 0, -2, (1 + 4 * k * k) * beat, C[6], C[5], 0.3 + 0.4 * k);
} else if (t < REL + 0.22) {
const a = (t - REL) / 0.22;
flare(p, 0, -4, 28 * Math.pow(1 - a, 1.5), 1 - a, C);
p.glow(0, -16, 48, WHITE, 0.3 * (1 - a));
}
ps.draw(p, "front");
drawRush(p, false);
const items = [], done = (t - LANDED) / 0.12;
for (const L of lets) {
if (!L.on) continue;
let sx = 2, sy = 2, flash = L.flash;
if (!L.landed && L.v > 150) (sx = 1.8), (sy = 2.3);
if (L.sq > 0) (sx = 2 * (1 + 0.22 * L.sq)), (sy = 2 * (1 - 0.22 * L.sq));
const pu = (t - L.pop) / 0.07, hop = seg(t, L.pop - 0.1, L.pop);
if (pu >= 1) continue;
if (hop > 0 && pu <= 0) (sx = 2 * (1 - 0.1 * hop)), (sy = 2 * (1 + 0.15 * hop));
if (pu > 0) (sx = sy = 2 * (1 + 0.3 * pu)), (flash = 1);
flash = Math.max(flash, done > 0 && done < 1 ? 1 - done : 0);
const h = 7 * sy, w = L.w * sx;
items.push({ g: L.g, x: L.cx - w / 2, y: BASE + L.off - h - 3 * ease.outQuad(hop), sx, sy, a: clamp((t - L.born) / 0.05), flash });
}
const sh = seg(t, SHINE, SHINE + 0.34), shine = sh > 0 && sh < 1 ? X0 - 14 + (right - X0 + 30) * ease.inOutSine(sh) : null;
drawWord(p, items, { fill: [C[3], C[4], C[5], C[6]], edge: WHITE, under: C[2], outline: C[0], shadow: SHADOW, shine, shineY: TY, glint: C[6] });
if (shine !== null && shine > X0 && shine < right) p.glowLine(shine, TY, shine + 8.4, BASE, 9, C[6], 0.3);
const hold = smooth(0.9, 1.2, t) * (1 - smooth(EXIT, EXIT + 0.4, t));
if (hold > 0) p.glow(0, TY + 7, 50, C[5], 0.22 * hold + (done > 0 && done < 1 ? 0.3 * (1 - done) : 0));
for (const L of lets) {
const u = (t - L.pop - 0.07) / 0.16;
if (u > 0 && u < 1) sparkle(p, L.cx, BASE - 7, 6 * (1 - u) * (1 - u), C[6], C[5], 0.5);
}
const g = (t - SHINE - 0.3) / 0.26;
if (g > 0 && g < 1) sparkle(p, right - 2, TY + 1, 7 * Math.sin(g * Math.PI), C[6], C[5], 0.6);
for (const s of sats) {
const u = (t - s.t0) / s.dur;
if (u > 0 && u < 1) sparkle(p, s.x, s.y, s.L * Math.pow(Math.sin(u * Math.PI), 0.7), C[6], C[5], 0.5);
}
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.act = act; __exports.create = create;
},
"fx/ui/_lib.js": function(__r, __exports){
const { FONTS, WHITE, luma, noise, mix } = __r("core/index.js");
function spell(str, font = "big") {
const F = FONTS[font], letters = [];
let x = 0;
for (const ch of String(str)) {
const g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()] ?? null;
const w = g ? g.w : F.space;
letters.push({ ch, g, x, w, h: F.h });
x += w + F.gap;
}
return { letters, w: Math.max(0, x - F.gap), h: F.h };
}
let ids = new Int16Array(4096), edges = new Uint8Array(4096);
function drawWord(p, items, st) {
if (!items.length) return;
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
for (const it of items) {
const h = it.g.rows.length * it.sy, w = it.g.w * it.sx, sl = Math.abs(it.slant ?? 0) * it.g.rows.length;
x0 = Math.min(x0, it.x - sl); x1 = Math.max(x1, it.x + w + sl);
y0 = Math.min(y0, it.y); y1 = Math.max(y1, it.y + h);
}
const ow = st.ow ?? 1;
x0 = Math.floor(x0) - 1 - ow; y0 = Math.floor(y0) - 1 - ow; x1 = Math.ceil(x1) + 2 + ow; y1 = Math.ceil(y1) + 3 + ow;
const W = x1 - x0, H = y1 - y0;
if (W * H > ids.length) (ids = new Int16Array(W * H * 2)), (edges = new Uint8Array(W * H * 2));
ids.fill(0, 0, W * H);
items.forEach((it, k) => {
const g = it.g, gh = g.rows.length, h = gh * it.sy, bot = it.y + h, sl = it.slant ?? 0;
for (let py = Math.floor(it.y); py < Math.ceil(bot); py++) {
const gy = Math.floor((py + 0.5 - it.y) / it.sy);
if (gy < 0 || gy >= gh) continue;
const shift = Math.round(((bot - py - 0.5) / it.sy) * sl);
const ry = py + 0.5 - it.y - gy * it.sy, row = g.rows[gy];
for (let px = Math.floor(it.x + shift) - 1; px <= Math.ceil(it.x + shift + g.w * it.sx); px++) {
const fx = px + 0.5 - it.x - shift, gx = Math.floor(fx / it.sx);
if (gx < 0 || gx >= g.w || !row[gx]) continue;
const i = (py - y0) * W + (px - x0);
if (i < 0 || i >= W * H) continue;
ids[i] = k + 1;
const rx = fx - gx * it.sx, up = gy > 0 ? g.rows[gy - 1] : null, dn = gy < gh - 1 ? g.rows[gy + 1] : null;
const open = (r) => !r || (!r[gx] && !r[gx - 1] && !r[gx + 1]);
edges[i] = (ry < 1 && open(up) ? 1 : 0) | (ry >= it.sy - 1 && open(dn) ? 2 : 0) | (rx < 1 && !(gx > 0 && row[gx - 1]) ? 4 : 0);
}
}
});
const at = (x, y) => (x < x0 || y < y0 || x >= x1 || y >= y1 ? 0 : ids[(y - y0) * W + (x - x0)]);
const F = st.fill, nF = F.length, shine = st.shine, glint = st.glint ?? WHITE, sy0 = st.shineY ?? y0;
for (let y = y0; y < y1; y++)
for (let x = x0; x < x1; x++) {
const id = at(x, y);
if (id) {
const it = items[id - 1], v = (y + 0.5 - it.y) / (it.g.rows.length * it.sy);
let i = Math.min(nF - 1, Math.max(0, Math.floor((1 - v) * nF)));
let c = F[i];
const e = edges[(y - y0) * W + (x - x0)];
if (e & 1) c = st.edge ?? F[nF - 1];
else if (e & 2) c = st.under ?? F[0];
else if (e & 4 && i < nF - 1) c = F[i + 1];
if (shine !== undefined && shine !== null) {
const d = Math.abs(x + 0.5 - (y + 0.5 - sy0) * 0.6 - shine);
if (d < 1.1) c = WHITE;
else if (d < 2.4) c = glint;
}
if (it.flash > 0.6 || (it.flash > 0.25 && v < 0.5)) c = WHITE;
p.dot(x, y, c, it.a ?? 1);
continue;
}
let n = 0;
for (let dy = -ow; dy <= ow && !n; dy++) for (let dx = -ow; dx <= ow && !n; dx++) if (ow < 2 || Math.abs(dx) + Math.abs(dy) < 4) n = at(x + dx, y + dy);
if (n) {
p.dot(x, y, st.outline, items[n - 1].a ?? 1);
continue;
}
const s = at(x - ow, y - 1 - ow) || at(x + 1 - ow, y - 1 - ow) || at(x - ow, y - ow);
if (s && st.shadow) p.dot(x, y, st.shadow, (items[s - 1].a ?? 1) * 0.9);
}
}
function tintActor(p, A, k, ramp) {
if (!A || k <= 0.12) return;
const m = A.mask, pix = A.pixels, cut = k > 0.6 ? 0 : k > 0.3 ? 0.22 : 0.5;
for (let j = 0; j < m.h; j++)
for (let i = 0; i < m.w; i++) {
const q = j * m.w + i;
if (!m.data[q]) continue;
const l = pix ? luma(pix[q]) : 0.6;
if (l < cut) continue;
p.px(A.x + i, A.y + j, l > 0.5 ? (k > 0.8 ? WHITE : ramp[2]) : l > 0.22 ? ramp[1] : ramp[0]);
}
}
function lightActor(p, A, c, k, rim = 0, t = 0) {
if (!A || (k <= 0.01 && rim <= 0.01)) return;
const m = A.mask, pix = A.pixels, has = (i, j) => i >= 0 && j >= 0 && i < m.w && j < m.h && m.data[j * m.w + i];
for (let j = 0; j < m.h; j++)
for (let i = 0; i < m.w; i++) {
if (!m.data[j * m.w + i]) continue;
if (k > 0.01) p.light(A.x + i, A.y + j, c, k * (1.1 - (0.5 * j) / m.h));
if (rim <= 0.01 || !has(i - 1, j) || !has(i + 1, j) || !has(i, j - 1)) continue;
if (has(i - 2, j) && has(i + 2, j) && has(i, j - 2)) continue;
const f = rim * (0.75 + 0.35 * noise(j * 0.6 - t * 8, i * 3));
if (f > 0.25) p.px(A.x + i, A.y + j, mix(pix ? pix[j * m.w + i] || c : c, c, Math.min(0.85, f)));
}
}
function haloActor(p, A, c, k, t = 0) {
if (!A || k <= 0.02) return;
p.outline(A.mask, A.x, A.y, c, (mx, my) => k * (0.75 + 0.45 * noise(my * 0.45 - t * 7, mx * 3)));
}
function panel(p, x, y, w, h, col, { r = 3, a = 1, shine = null } = {}) {
if (w < 2 || h < 2) return;
const X1 = x + w, Y1 = y + h;
p.shade(x, y, X1, Y1, (px, py, o) => {
const cx = Math.max(x + r - px, 0, px - (X1 - r)), cy = Math.max(y + r - py, 0, py - (Y1 - r));
const e = cx > 0 && cy > 0 ? r - Math.hypot(cx, cy) : Math.min(px - x, X1 - px, py - y, Y1 - py);
if (e < 0) return;
o.a = a;
if (e < 1) return col.outline;
if (py - y < 2) return col.rim;
if (Y1 - py < 2) return col.low;
if (shine !== null) {
const d = Math.abs(px - (py - y) * 0.6 - shine);
if (d < 1.3) return WHITE;
if (d < 3) return col.rim;
}
return py - y < h * 0.45 ? col.top : col.body;
});
}
const HEART = [
"..kkk...kkk..",
".khhok.khook.",
"khwhookoooomk",
"khwoooooooomk",
"khoooooooommk",
"kooooooooomdk",
".kooooooomdk.",
"..kooooomdk..",
"...kooomdk...",
"....komdk....",
".....kdk.....",
"......k......",
];
const heartPal = (C) => ({ k: C[0], w: WHITE, h: C[5], o: C[4], m: C[3], d: C[2] });
function shake(t, amp, t0 = 0, len = 0.3, seed = 1, hz = 32) {
if (t < t0 || t > t0 + len) return [0, 0];
const k = 1 - (t - t0) / len;
return [Math.round(noise(t * hz, seed) * amp * k * 1.7), Math.round(noise(t * hz, seed + 7) * amp * k * 1.3)];
}
__exports.spell = spell; __exports.drawWord = drawWord; __exports.tintActor = tintActor; __exports.lightActor = lightActor; __exports.haloActor = haloActor; __exports.panel = panel; __exports.HEART = HEART; __exports.heartPal = heartPal; __exports.shake = shake;
},
"fx/melee/sword-slash.js": function(__r, __exports){
const { Particles, P, Rng, fit, sparkle, clamp, smooth, ease, TAU, READY } = __r("core/index.js");
const meta = {
name: "Sword slash",
desc: "A tilted crescent whips round in two frames, cools from white to deep blue as it trails off, glints at the tip and throws sparks.",
tags: ["melee", "slash", "sword", "combat", "directional", "one-shot"],
size: [136, 104],
origin: [44, 92],
duration: 0.75,
loop: false,
fps: 30,
bg: "ground",
actor: 2,
options: {
palette: ["#212f6b", "#2c58aa", "#3a8bd8", "#62c8f4", "#b8c9e8", "#e8f1ff", "#ffffff"],
sparks: ["#fff3a6", "#ffe26b", "#ff8a2a", "#f2561d"],
radius: 42,
seed: 2,
},
};
const GUARD = { ...READY, weapon: "sword", fx: 12, fy: -21, sa: -0.85 };
const WIND = { ...GUARD, x: -8, crouch: 4, lean: -4, fx: -7, fy: -35, sa: -2.65, bx: 9, by: -25, armsFront: true, ffx: 9, fbx: -8 };
const CUT = { ...GUARD, x: 0, crouch: 2, lean: 3, fx: 16, fy: -37, sa: -1.45, bx: -7, by: -24, ffx: 11, fbx: -10, ghost: 1 };
const DOWN = { ...GUARD, x: 2, crouch: 5, lean: 5, fx: 20, fy: -21, sa: 0.62, bx: -9, by: -24, ffx: 13, fbx: -10, toeB: true };
const act = {
target: { x: 58 },
poses: [
[-0.55, { ...GUARD, x: -8 }],
[-0.3, WIND],
[-0.08, { ...WIND, crouch: 5, lean: -5 }],
[0, CUT, "snap"],
[0.06, DOWN, "snap"],
[0.3, { ...DOWN, x: 3, crouch: 6 }],
[0.58, { ...GUARD, x: 1, crouch: 3, fx: 15, fy: -21, sa: 0.1, bx: -5, by: -21, ffx: 9, fbx: -7 }],
[0.86, { ...GUARD, x: -8 }],
],
hits: [{ t: 0.06, stop: 0.14, shake: 0.18, amp: 2, push: 2.8, straw: 18 }],
dust: [{ t: 0.06, x: 16, n: 7, dir: 1 }, { t: 0.06, x: -11, n: 4, dir: -1 }],
};
function onArc(s, r, a) {
const lx = Math.cos(a) * r, ly = Math.sin(a) * r * s.sy, c = Math.cos(s.rot), n = Math.sin(s.rot);
return [s.cx + lx * c - ly * n, s.cy + lx * n + ly * c];
}
function crescent(p, s, ta, L, W, age) {
if (Math.abs(L) < 0.02 || W < 0.3) return;
const R = s.ramp, n = R.length, dir = Math.sign(L), span = Math.abs(L), c = Math.cos(s.rot), sn = Math.sin(s.rot), B = s.R + 2;
p.shade(s.cx - B, s.cy - B, s.cx + B, s.cy + B, (x, y, out) => {
const dx = x - s.cx, dy = y - s.cy, lx = dx * c + dy * sn, ly = (-dx * sn + dy * c) / s.sy, r = Math.hypot(lx, ly);
if (r > s.R + 0.5 || r < s.R - W - 1) return;
let u = (dir * (Math.atan2(ly, lx) - ta)) % TAU;
if (u < 0) u += TAU;
if (u > span) return;
const v = u / span, w = W * Math.pow(Math.sin(Math.PI * Math.pow(v, 2.2)), 0.6);
if (w < 0.35) return;
const q = (s.R - r) / w;
if (q < 0 || q > 1) return;
const ci = q < 0.22 && age < 0.5 ? 0 : Math.round(q * (n - 1) * 0.75 + age * 2.4 - v * 0.8 + 0.4);
out.c = R[n - 1 - clamp(ci, 0, n - 1)];
out.a = Math.min(1, v / 0.4);
});
for (let u = 0; u <= span; u += 0.3) {
const [x, y] = onArc(s, s.R - W * 0.4, ta + dir * u);
p.glow(x, y, 5 + W, R[n - 3], 0.22 * (1 - age) * (u / span));
}
}
function drawSlash(p, s, t) {
const u = t - s.t0;
if (u < 0) return;
const span = s.a1 - s.a0, head = ease.outExpo(clamp(u / s.sweep)), tail = smooth(s.sweep + s.hold, s.sweep + s.hold + s.trail, u);
const age = clamp(u / (s.sweep + s.hold + s.trail));
if (tail < 1) crescent(p, s, s.a0 + span * tail, span * (head - tail), s.W * (1 - tail * 0.55), age);
const th = 0.7 * (1 - clamp((u - s.sweep - s.hold) / (s.trail + 0.2)));
if (tail > 0.02 && th > 0)
for (let k = 0; k <= tail; k += 0.6 / (Math.abs(span) * s.R)) {
const [x, y] = onArc(s, s.R - 0.5, s.a0 + span * k);
p.dot(x, y, s.ramp[1], th * (0.4 + 0.6 * k));
}
}
function tipOf(s) {
const [x, y] = onArc(s, s.R - s.W * 0.3, s.a1), [x2, y2] = onArc(s, s.R - s.W * 0.3, s.a1 + Math.sign(s.a1 - s.a0) * 0.05);
const l = Math.hypot(x2 - x, y2 - y) || 1;
return { x, y, dx: (x2 - x) / l, dy: (y2 - y) / l };
}
function create(o) {
const C = fit(o.palette, 7), Rg = new Rng(o.seed), ps = new Particles({ rng: Rg, ground: () => 0, sparks: o.sparks });
const R0 = o.radius, a0 = -2.55, a1 = 0.95;
const A = { cx: 6, cy: -26, R: R0, sy: 0.6, rot: -0.38, a0, a1, W: 12, t0: 0, sweep: 0.06, hold: 0.06, trail: 0.24, ramp: C };
const E = { ...A, R: R0 * (33 / 42), W: R0 * (4.5 / 42), a0: a0 + (a1 - a0) * 0.1, a1: a1 - (a1 - a0) * (0.15 / 3.5), t0: 0.017, hold: 0.03, trail: 0.2, ramp: C.slice(0, 6) };
const tip = tipOf(A);
let t = 0, landed = false;
return {
update(dt) {
t += dt;
if (!landed && t >= A.sweep) {
landed = true;
for (let i = 0; i < 10; i++) {
const a = Math.atan2(tip.dy, tip.dx) + Rg.range(-0.5, 0.5), sp = Rg.range(150, 400);
ps.spawn(P.SPARK, tip.x, tip.y, Math.cos(a) * sp, Math.sin(a) * sp, Rg.range(0.12, 0.35));
}
for (let i = 0; i < 16; i++) {
const a = a0 + (a1 - a0) * Rg.range(0.3, 1), [x, y] = onArc(A, A.R, a);
const ox = x - A.cx, oy = y - A.cy, l = Math.hypot(ox, oy) || 1, sp = Rg.range(30, 100);
ps.spawn(P.MOTE, x, y, (ox / l) * sp, (oy / l) * sp - 10, Rg.range(0.25, 0.55), C[4 + Rg.int(0, 1)], 0.6);
}
}
ps.update(dt);
},
draw(p) {
drawSlash(p, E, t);
drawSlash(p, A, t);
const g = t - A.sweep * 0.6;
if (g > 0 && g < 0.22) sparkle(p, tip.x, tip.y, 9 * ease.outBack(Math.min(1, g / 0.05)) * (1 - g / 0.22), C[5], C[3], 0.6);
if (t < 0.3) {
const [x, y] = onArc(A, A.R - 4, A.a0 + (A.a1 - A.a0) * ease.outExpo(clamp(t / A.sweep)));
p.glow(x, y, 40, C[3], 0.5 * (1 - t / 0.3));
}
ps.draw(p);
},
};
}
__exports.meta = meta; __exports.act = act; __exports.create = create;
},
"fx/melee/double-slash.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, sparkle, flare, clamp, ease, WHITE, READY } = __r("core/index.js");
const { through, slash, slashEnd, shavings, sliver } = __r("fx/melee/_lib.js");
const meta = {
name: "Double slash",
desc: "A down cut, then an up cut that crosses it: the moment the X closes both strokes flash white, the crossing bursts with light and sparks, and a dotted X lingers.",
tags: ["melee", "slash", "combo", "sword", "cross", "combat", "directional", "one-shot"],
size: [164, 108],
origin: [44, 92],
duration: 0.8,
loop: false,
fps: 30,
bg: "ground",
actor: 2,
options: {
palette: ["#2a0a22", "#5e1238", "#a01f4e", "#e0386a", "#ff86a6", "#ffd2dd", "#ffffff"],
sparks: ["#fff3a6", "#ffe26b", "#ff8a2a", "#f2561d"],
seed: 6,
},
};
const STANCE = { ...READY, weapon: "sword", fx: 12, fy: -21, sa: -0.85 };
const HIGH = { ...STANCE, x: -7, crouch: 4, lean: -4, fx: -7, fy: -35, sa: -2.65, bx: 9, by: -25, armsFront: true, ffx: 9, fbx: -8 };
const LOW = { ...STANCE, x: 3, crouch: 6, lean: 6, fx: 22, fy: -20, sa: 0.62, bx: -8, by: -24, ffx: 13, fbx: -10, toeB: true };
const act = {
target: { x: 62 },
poses: [
[-0.42, { ...STANCE, x: -7 }],
[-0.18, HIGH],
[-0.04, { ...HIGH, crouch: 5 }],
[0, { ...STANCE, x: 0, crouch: 2, lean: 3, fx: 16, fy: -37, sa: -1.45, bx: -7, by: -24, ffx: 11, fbx: -9, ghost: 1 }, "snap"],
[0.06, LOW, "snap"],
[0.14, { ...LOW, x: 4, crouch: 6, lean: 5, fx: 20, fy: -17, sa: 0.85, ghost: 1 }],
[0.17, { ...LOW, x: 5, crouch: 3, lean: 5, fx: 22, fy: -28, sa: 0.1, by: -18, toeB: true, ghost: 1 }, "snap"],
[0.21, { ...LOW, x: 6, crouch: 1, lean: 6, fx: 19, fy: -37, sa: -0.95, by: -18, ffx: 13, fby: -6 }, "snap"],
[0.5, { ...LOW, x: 6, crouch: 3, lean: 3, fx: 18, fy: -36, sa: -1.05, by: -19, ffx: 12 }],
[0.92, { ...STANCE, x: -7 }],
],
hits: [
{ t: 0.06, stop: 0.05, shake: 0.08, amp: 1, push: 1.4, straw: 8 },
{ t: 0.16, stop: 0.14, shake: 0.2, amp: 2, push: 2.8, straw: 18, y: -28 },
],
dust: [{ t: 0.06, x: 16, n: 5, dir: 1 }, { t: 0.17, x: -8, n: 4, dir: -1 }],
};
const UP = 0.14; // the second cut starts
const R0 = 62;
const cut = (x, y, th, dir, span, extra) => through(x, y, th, dir, R0, span, 0.55, extra);
function create(o) {
const C = fit(o.palette, 7), Rg = new Rng(o.seed), ps = new Particles({ rng: Rg, ground: () => 0, sparks: o.sparks }), lights = new Lights();
const X = 34, Y = -23;
const down = cut(X, Y, 0.72, 1, 0.84, { W: 10, t0: 0, sweep: 0.06, hold: 0.07, trail: 0.24, ramp: C, lens: true });
const up = cut(X, Y, -0.66, -1, 0.84, { W: 11, t0: UP, sweep: 0.06, hold: 0.06, trail: 0.26, ramp: C, lens: true });
const ends = [slashEnd(down), slashEnd(up)], slivers = [-2.4, -1.1, 0.2, 1.6].map((a) => ({ a: a + Rg.range(-0.2, 0.2), r: Rg.range(5, 8), v: Rg.range(70, 120), arc: Rg.range(0.4, 0.7) }));
const CLOSE = UP + 0.012;
let t = 0, cut1 = false, cut2 = false, closed = false;
return {
update(dt) {
t += dt;
if (!cut1 && t >= down.sweep) {
cut1 = true;
shavings(ps, Rg, down, 10, [C[4], C[5]]);
for (let i = 0; i < 6; i++) {
const a = Math.atan2(ends[0].dy, ends[0].dx) + Rg.range(-0.5, 0.5), sp = Rg.range(120, 300);
ps.spawn(P.SPARK, ends[0].x, ends[0].y, Math.cos(a) * sp, Math.sin(a) * sp, Rg.range(0.12, 0.3));
}
}
if (!closed && t >= CLOSE) {
closed = true;
lights.add(X, Y, 56, C[3], 0.45, 0.4);
lights.add(X, Y, 18, WHITE, 0.6, 0.08);
for (let i = 0; i < 18; i++) {
const a = Rg.range(-Math.PI, Math.PI) * 0.8, sp = Rg.range(140, 360);
ps.spawn(P.SPARK, X, Y, Math.cos(a) * sp, Math.sin(a) * sp - 40, Rg.range(0.14, 0.4));
}
for (let i = 0; i < 5; i++) ps.spawn(P.STAR, X + Rg.range(-14, 14), Y + Rg.range(-12, 12), 0, -4, Rg.range(0.2, 0.4), Rg.chance(0.5) ? C[5] : WHITE, Rg.range(1, 2.2), Rg.range(0.05, 0.2));
}
if (!cut2 && t >= UP + up.sweep) {
cut2 = true;
shavings(ps, Rg, up, 12, [C[4], C[5]]);
}
ps.update(dt);
lights.update(dt);
},
draw(p) {
const flash = t >= CLOSE && t < CLOSE + 0.07 ? 1 : 0;
down.hot = up.hot = flash;
slash(p, down, t);
slash(p, up, t);
for (const [s, e] of [[down, ends[0]], [up, ends[1]]]) {
const g = t - s.t0 - s.sweep * 0.6;
if (g > 0 && g < 0.2) sparkle(p, e.x, e.y, 7 * ease.outBack(Math.min(1, g / 0.05)) * (1 - g / 0.2), C[5], C[3], 0.5);
}
const q = t - CLOSE;
if (q >= 0 && q < 0.26) {
const k = q / 0.26;
flare(p, X, Y, 22 * Math.pow(1 - k, 1.4), 1 - k, C);
p.glow(X, Y, 34, C[4], 0.35 * (1 - k));
}
if (q >= 0.03 && q < 0.15) {
const k = (q - 0.03) / 0.12;
for (const s of slivers) sliver(p, X, Y, s.a, s.r + s.v * (q - 0.03), s.arc * (1 - 0.4 * k), k < 0.4 ? C[6] : k < 0.7 ? C[5] : C[4], 1 - k);
}
for (const s of [down, up]) {
const u = t - s.t0;
if (u <= 0 || u >= 0.25) continue;
const e = slashEnd({ ...s, span: s.span * ease.outExpo(clamp(u / s.sweep)) });
p.glow(e.x, e.y, 40, C[3], 0.5 * (1 - u / 0.25));
}
ps.draw(p);
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.act = act; __exports.create = create;
},
"fx/melee/_lib.js": function(__r, __exports){
const { P, clamp, smooth, ease, hex, mix, scale, rgb, WHITE, TAU } = __r("core/index.js");
const swing = (o) => ({ cx: 0, cy: 0, R: 30, sy: 1, rot: 0, a0: 0, dir: 1, k: 0, ...o });
function through(x, y, th, dir, R, span, at = 0.55, extra = {}) {
const a = th - (dir * Math.PI) / 2;
return swing({ cx: x - Math.cos(a) * R, cy: y - Math.sin(a) * R, R, sy: 1, rot: 0, a0: a - dir * span * at, dir, span, ...extra });
}
function onSwing(s, r, u) {
const a = s.a0 + s.dir * u, lx = Math.cos(a) * r, ly = Math.sin(a) * r * s.sy - s.k * (s.R - r), c = Math.cos(s.rot), n = Math.sin(s.rot);
return [s.cx + lx * c - ly * n, s.cy + lx * n + ly * c];
}
function travel(s, u) {
const [x0, y0] = onSwing(s, s.R, u), [x1, y1] = onSwing(s, s.R, u + 0.01), l = Math.hypot(x1 - x0, y1 - y0) || 1;
return { x: x0, y: y0, dx: (x1 - x0) / l, dy: (y1 - y0) / l, a: s.a0 + s.dir * u };
}
function plane(s, x, y) {
const c = Math.cos(s.rot), n = Math.sin(s.rot), dx = x - s.cx, dy = y - s.cy, lx = dx * c + dy * n, ly = -dx * n + dy * c;
if (!s.k) return [Math.hypot(lx, ly / s.sy), Math.atan2(ly / s.sy, lx)];
const m = ly + s.k * s.R, A = s.sy * s.sy - s.k * s.k, B = 2 * m * s.k, Cc = lx * lx * s.sy * s.sy + m * m;
const r = (-B + Math.sqrt(B * B + 4 * A * Cc)) / (2 * A);
return [r, Math.atan2((m - s.k * r) / s.sy, lx)];
}
function smear(p, s, u0, u1, wMax, fn, half = 0, pad = 1) {
if (u1 - u0 < 0.005) return;
const c = Math.cos(s.rot), n = Math.sin(s.rot), A = s.R + pad + 1, Bn = A * s.sy + s.k * (wMax + 2);
const hx = Math.hypot(A * c, Bn * n) + 1, hy = Math.hypot(A * n, Bn * c) + 1, rIn = s.R - wMax - 1;
const over = Math.abs(n) * A + s.k * (wMax + 2) + 2, y0 = half > 0 ? s.cy - over : s.cy - hy, y1 = half < 0 ? s.cy + over : s.cy + hy;
p.shade(s.cx - hx, y0, s.cx + hx, y1, (x, y, out) => {
const [r, a] = plane(s, x, y);
if (r > s.R + pad || r < rIn) return;
if (half && (Math.sin(a) < 0 ? -1 : 1) !== half) return;
let u = (s.dir * (a - s.a0)) % TAU;
if (u < 0) u += TAU;
while (u < u0) u += TAU;
if (u > u1) return;
return fn(u, r, out, a);
});
}
function trace(p, s, r, u0, u1, c, a, half = 0, step = 0.6) {
const du = step / Math.max(4, r);
for (let u = u0; u <= u1; u += du) {
const g = s.a0 + s.dir * u;
if (half && (Math.sin(g) < 0 ? -1 : 1) !== half) continue;
const [x, y] = onSwing(s, r, u), k = typeof a === "function" ? a(u) : a;
if (k > 0) p.dot(x, y, typeof c === "function" ? c(u) : c, k);
}
}
function glowAlong(p, s, r, u0, u1, rad, c, k, half = 0, step = 0.35) {
for (let u = u0; u <= u1; u += step) {
const g = s.a0 + s.dir * u;
if (half && (Math.sin(g) < 0 ? -1 : 1) !== half) continue;
const [x, y] = onSwing(s, r, u), kk = typeof k === "function" ? k(u) : k;
if (kk > 0.004) p.glow(x, y, rad, c, kk);
}
}
function slash(p, s, t, half = 0) {
const u = t - s.t0;
if (u < 0) return;
const R = s.ramp, n = R.length, life = s.sweep + s.hold + s.trail, hot = s.hot ?? 0;
const head = ease.outExpo(clamp(u / s.sweep)), tail = smooth(s.sweep + s.hold, life, u), age = clamp(u / life);
const U = s.span * head, T = s.span * tail, W = s.W * (1 - tail * 0.55);
if (tail < 1 && U - T > 0.01) {
smear(p, s, T, U, W, (uu, r, out) => {
const v = (uu - T) / (U - T), w = W * Math.pow(Math.sin(Math.PI * Math.pow(v, s.lens ? 1 : 2.2)), s.lens ? 0.75 : 0.6);
if (w < 0.35) return;
const q = (s.R - r) / w;
if (q < 0 || q > 1) return;
const ci = (q < 0.22 && age < 0.5) || q < hot * 0.7 ? 0 : Math.round(q * (n - 1) * 0.75 + age * 2.4 - v * 0.8 + 0.4 - hot * 3);
out.c = R[n - 1 - clamp(ci, 0, n - 1)];
out.a = Math.min(1, v / (s.lens ? 0.1 : 0.4));
}, half);
glowAlong(p, s, s.R - W * 0.4, T, U, 5 + W, R[n - 3], (uu) => (0.22 + hot * 0.3) * (1 - age) * ((uu - T) / (U - T)), half, 0.3);
}
const th = 0.7 * (1 - clamp((u - s.sweep - s.hold) / (s.trail + 0.2)));
if (tail > 0.02 && th > 0) trace(p, s, s.R - 0.5, 0, T, R[2], (uu) => th * (0.4 + 0.6 * uu / s.span), half);
}
const slashEnd = (s) => travel({ ...s, R: s.R - s.W * 0.3 }, s.span);
function shavings(ps, R, s, n, colors, from = 0.3) {
for (let i = 0; i < n; i++) {
const [x, y] = onSwing(s, s.R, s.span * R.range(from, 1)), ox = x - s.cx, oy = y - s.cy, l = Math.hypot(ox, oy) || 1, sp = R.range(30, 100);
ps.spawn(P.MOTE, x, y, (ox / l) * sp, Math.min(25, (oy / l) * sp) - 10, R.range(0.25, 0.55), R.pick(colors), 0.6);
}
}
function stone(c) {
c = hex(c);
return { light: mix(scale(c, 1.35), WHITE, 0.08), body: c, shade: scale(c, 0.64), dust: mix(scale(c, 1.2), rgb(150, 140, 150), 0.3), dark: scale(c, 0.42) };
}
const OUTLINE = hex("#1a1422");
function rock(p, b, st) {
const r = 0.6 + b.s * 0.75, fade = Math.min(1, b.life / 0.5), lx = Math.cos(b.a) * r * 0.4, ly = Math.sin(b.a) * r * 0.4;
p.shade(b.x - r - 1, b.y - r - 1, b.x + r + 1, b.y + r + 1, (x, y, out) => {
const dx = x - b.x, dy = y - b.y, d = Math.hypot(dx * 1.15, dy);
if (d > r + 0.9) return;
const lit = dx * lx + dy * ly;
out.c = d > r ? OUTLINE : lit < -0.4 ? st.light : lit > 0.6 ? st.shade : st.body;
out.a = fade;
});
}
function cracks(R, x0, n, reach, depth = 7, bias = 0.3) {
const out = [];
for (let i = 0; i < n; i++) {
const side = R.chance(0.5 + bias * 0.5) ? 1 : -1, L = reach * R.range(0.45, 1) * (i < 2 ? 1 : 0.7), pts = [[x0 + side * R.range(0, 1.5), 0]];
let x = pts[0][0], y = 0;
while (Math.abs(x - x0) < L && y < depth) {
x += side * R.range(1.5, 3.5);
y = Math.min(depth, Math.max(0, y + R.range(-0.6, 1.6) * (Math.abs(x - x0) > 3 ? 1 : 0.3)));
pts.push([Math.round(x), Math.round(y)]);
if (R.chance(0.18) && pts.length > 3 && y < depth - 2) {
const f = [[Math.round(x), Math.round(y)]];
let fx = x, fy = y;
for (let j = R.int(1, 3); j > 0; j--) (fx += side * R.range(1, 3)), (fy += R.range(0.8, 2)), f.push([Math.round(fx), Math.round(Math.min(depth + 1, fy))]);
out.push({ pts: f, at: Math.abs(x - x0) / reach, fork: true });
}
}
out.push({ pts, at: 0, fork: false });
}
return out;
}
function star(p, x, y, spikes, sc, th, core, body, inner, rim) {
for (const pass of [0, 1, 2])
for (const s of spikes) {
const c = Math.cos(s.a), sn = Math.sin(s.a), L = s.len * sc;
for (let d = 0; d <= L; d += 0.5) {
const hw0 = s.w * th * (1 - d / L) * Math.min(1, 0.5 + d / 3), hw = pass === 0 ? hw0 + 0.8 : pass === 1 ? hw0 : hw0 * 0.45;
if (pass === 2 && d > L * 0.55) break;
for (let o = -hw; o <= hw; o += 0.5) p.px(x + c * d - sn * o, y + sn * d + c * o, pass === 0 ? rim : pass === 1 ? (d < L * 0.35 ? inner : body) : core);
}
}
const r = 2.4 * sc * Math.sqrt(th);
p.circle(x, y, r + 0.8, inner);
p.circle(x, y, r, core);
}
function sliver(p, x, y, a, r, arc, c, k) {
const n = Math.ceil(r * arc * 2.2);
for (let j = 0; j <= n; j++) {
const u = j / n - 0.5, th = a + u * arc, w = 1.4 * (1 - Math.abs(u) * 2);
for (let o = -w * 0.5; o <= w * 0.5 + 0.01; o += 0.5) p.dot(x + Math.cos(th) * (r + o), y + Math.sin(th) * (r + o), c, k);
}
}
function along(pts, len, fn) {
let d = 0;
for (let i = 1; i < pts.length && d < len; i++) {
const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], l = Math.hypot(x1 - x0, y1 - y0), f = Math.min(1, (len - d) / l);
fn(x0, y0, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, d);
d += l;
}
}
__exports.swing = swing; __exports.through = through; __exports.onSwing = onSwing; __exports.travel = travel; __exports.plane = plane; __exports.smear = smear; __exports.trace = trace; __exports.glowAlong = glowAlong; __exports.slash = slash; __exports.slashEnd = slashEnd; __exports.shavings = shavings; __exports.stone = stone; __exports.rock = rock; __exports.cracks = cracks; __exports.star = star; __exports.sliver = sliver; __exports.along = along;
},
"fx/melee/spin-slash.js": function(__r, __exports){
const { Particles, Lights, P, PF, Rng, fit, sparkle, clamp, smooth, ease, rand, TAU, WHITE, READY } = __r("core/index.js");
const { swing, onSwing, travel, smear, trace, glowAlong } = __r("fx/melee/_lib.js");
const meta = {
name: "Spin slash",
desc: "The blade whirls once round the waist on a tilted plane, behind the body and back in front; the closed ring flares white, dissolves into a dotted trace and throws sparks.",
tags: ["melee", "slash", "spin", "sword", "aoe", "combat", "one-shot"],
size: [208, 104],
origin: [104, 84],
duration: 0.8,
loop: false,
fps: 30,
bg: "ground",
actor: 2,
options: {
palette: ["#16224a", "#1f4a86", "#2a7fc0", "#48b8ec", "#9fe2ff", "#e2f7ff", "#ffffff"],
sparks: ["#fff3a6", "#ffe26b", "#ff8a2a", "#f2561d"],
radius: 46,
seed: 3,
},
};
const STANCE = { ...READY, weapon: "sword", fx: 12, fy: -21, sa: -0.85 };
const WOUND = { ...STANCE, crouch: 6, lean: -2, yaw: 1.1, fx: 13, fy: -20, sa: 0.3, bx: 6, by: -24, ffx: 8, fbx: -8 };
const WIDE = { ...STANCE, crouch: 5, lean: 3, fx: 21, fy: -21, sa: 0.05, bx: -9, by: -23, ffx: 11, fbx: -11 };
const act = {
target: { x: 60 },
poses: [
[-0.46, STANCE],
[-0.2, WOUND],
[-0.02, { ...WOUND, crouch: 7, yaw: 1.3 }],
[0, { ...WIDE, sa: -0.1, ghost: 1 }, "snap"],
[0.05, { ...WIDE, yaw: -1.57, ghost: 1 }, "snap"],
[0.09, { ...WIDE, yaw: -3.14, ghost: 1 }, "snap"],
[0.13, { ...WIDE, yaw: -4.71, ghost: 1 }, "snap"],
[0.17, WIDE, "snap"],
[0.56, { ...WIDE, crouch: 4, lean: 2 }],
[0.92, STANCE],
],
hits: [{ t: 0.17, stop: 0.12, shake: 0.16, amp: 2, push: 2.4, straw: 16 }],
dust: [{ t: 0, x: 0, n: 6 }, { t: 0.17, x: 12, n: 6, dir: 1 }],
};
const SW = 0.17; // the edge goes once round
const FLARE = 0.3; // the closed ring flares and dissolves
const turn = (t) => 1 - Math.pow(1 - clamp(t / SW), 1.6); // fraction of the turn the edge has made
const passedAt = (f) => SW * (1 - Math.pow(1 - clamp(f), 1 / 1.6)); // when the edge passed fraction f
function create(o) {
const C = fit(o.palette, 7), n = C.length, Rg = new Rng(o.seed), R0 = o.radius;
const ps = new Particles({ rng: Rg, ground: () => 0, sparks: o.sparks }), lights = new Lights();
const A = swing({ cx: 0, cy: -17, R: R0, sy: 0.27, rot: -0.1, a0: 0.5, dir: -1, k: 0.15 });
const E = { ...A, R: R0 * 0.8, k: 0.1 };
const W = 16, WE = 5;
const DIM = [C[0], C[0], C[1], C[2], C[3], C[4], C[5]];
let t = 0, closed = false, lastU = 0;
const body = (p, s, w0, lag, half, rim) => {
const U = TAU * turn(t - lag), ramp = half < 0 ? DIM : C;
if (U < 0.02 || t - lag > SW + 0.02) return;
smear(p, s, 0, U, w0, (u, r, out) => {
const age = t - lag - passedAt(u / TAU), lead = U - u;
const w = w0 * Math.pow(clamp(lead / 0.85), 0.5) * (0.3 + 0.7 * Math.exp(-age / 0.075)) * Math.pow(clamp(u / 1.3), 0.7);
if (w < 0.45) return;
const q = (s.R - r) / w;
if (q < 0 || q > 1) return;
const ci = rim && q < 0.26 && age < 0.06 ? 0 : Math.round(q * (n - 1) * 0.7 + age * 13 + (rim ? 0.4 : 1.4));
out.c = ramp[n - 1 - clamp(ci, 0, n - 1)];
out.a = Math.min(1, u / 1.1 + 0.2);
}, half);
};
const ring = (p, half) => {
body(p, E, WE, 0.025, half, false);
body(p, A, W, 0, half, true);
if (t < SW + 0.04) glowAlong(p, A, A.R - 5, 0, TAU * turn(t), 14, C[3], (u) => (half < 0 ? 0.2 : 0.3) * Math.exp(-(t - passedAt(u / TAU)) / 0.08), half);
if (t < SW) return;
const f = (t - SW) / FLARE, ramp = half < 0 ? DIM : C;
if (f < 1) {
const R = A.R + 6 * ease.outCubic(f), th = f < 0.13 ? 9 : Math.max(1, 6 * Math.pow(1 - f, 1.5) + 0.5), S = { ...A, R };
const step = f < 0.13 ? 6 : f < 0.3 ? 5 : f < 0.55 ? 4 : 3;
smear(p, S, 0, TAU, th, (u, r, out) => {
const q = (R - r) / th;
if (q < 0 || q > 1) return;
out.c = f < 0.13 ? (q < 0.6 ? WHITE : ramp[5]) : q < 0.45 ? ramp[step] : ramp[step - 1];
out.a = f < 0.4 ? 1 : 1.3 - f;
}, half);
glowAlong(p, S, R - 2, 0, TAU, 14, C[4], 0.32 * (1 - f) * (1 - f), half);
}
const k = 1 - clamp((t - SW - 0.06) / 0.4);
if (k > 0) trace(p, A, A.R - 0.5, 0, TAU, ramp[4], (u) => clamp(k * 1.5 - rand(Math.floor(u * 30), 5) * 0.8) * 0.95, half);
};
return {
update(dt) {
t += dt;
const U = TAU * turn(t);
if (t < SW) {
for (let u = lastU; u < U; u += 0.3) {
const tr = travel(A, u), ox = tr.x - A.cx, oy = tr.y - A.cy, l = Math.hypot(ox, oy) || 1, sp = Rg.range(40, 120);
ps.spawn(P.MOTE, tr.x, tr.y, tr.dx * sp + (ox / l) * sp * 0.35, tr.dy * sp * 0.6 - Rg.range(5, 30), Rg.range(0.22, 0.45), C[4 + Rg.int(0, 1)], 0.55, 0, Math.sin(tr.a) < 0 ? PF.BACK : 0);
}
lastU = U;
}
if (!closed && t >= SW) {
closed = true;
lights.add(A.cx, A.cy + 4, 90, C[3], 0.4, 0.4);
const end = travel(A, TAU);
for (let i = 0; i < 9; i++) {
const a = Math.atan2(end.dy, end.dx) + Rg.range(-0.45, 0.35), sp = Rg.range(160, 360);
ps.spawn(P.SPARK, end.x, end.y, Math.cos(a) * sp, Math.sin(a) * sp - Rg.range(20, 70), Rg.range(0.14, 0.36));
}
for (let i = 0; i < 16; i++) {
const u = Rg.range(0, TAU), tr = travel(A, u), sp = Rg.range(110, 260);
ps.spawn(P.SPARK, tr.x, tr.y, tr.dx * sp, tr.dy * sp - Rg.range(20, 80), Rg.range(0.12, 0.32), 0, 1, 0, Math.sin(tr.a) < 0 ? PF.BACK : 0);
}
for (let i = 0; i < 6; i++) {
const u = Rg.range(0, TAU), [x, y] = onSwing(A, A.R + Rg.range(-1, 3), u);
ps.spawn(P.STAR, x, y, 0, -Rg.range(2, 8), Rg.range(0.25, 0.5), Rg.chance(0.5) ? C[5] : WHITE, Rg.range(1.2, 2.6), Rg.range(0.04, 0.16), Math.sin(A.a0 + A.dir * u) < 0 ? PF.BACK : 0);
}
}
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
ring(p, -1);
ps.draw(p, "back");
},
draw(p) {
ring(p, 1);
if (t < 0.06) {
const [x, y] = onSwing(A, A.R - 3, 0);
sparkle(p, x, y, 7 * (1 - t / 0.06), C[5], C[3], 0.5);
}
const g = t - SW * 0.85, tip = onSwing(A, A.R - 3, TAU);
if (g > 0 && g < 0.24) sparkle(p, tip[0], tip[1], 10 * ease.outBack(Math.min(1, g / 0.05)) * (1 - g / 0.24), C[5], C[3], 0.6);
if (t < SW + 0.05) {
const U = TAU * turn(t), [x, y] = onSwing(A, A.R - 5, U), far = Math.sin(A.a0 + A.dir * U) < 0;
p.glow(x, y, far ? 26 : 38, C[3], (far ? 0.3 : 0.5) * (1 - smooth(SW - 0.04, SW + 0.05, t)));
}
ps.draw(p, "front");
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.act = act; __exports.create = create;
},
"fx/nature/poison-cloud.js": function(__r, __exports){
const { cycle, fit, rng, smooth, clamp, TAU, WHITE, tileNoise } = __r("core/index.js");
const meta = {
name: "Poison cloud",
desc: "A miasma hugging the floor: ragged sheets of gas lit yellow-green from within, fading to violet, creep out in tongues that curl over at their tips; plumes twist up as ribbons.",
tags: ["nature", "poison", "gas", "cloud", "miasma", "toxic", "area", "ground", "loop"],
size: [256, 100],
origin: [128, 86],
duration: 4,
loop: true,
fps: 30,
bg: "ground",
options: {
palette: ["#0e0816", "#24123a", "#3e2056", "#5a3a62", "#6a6a3a", "#96aa30", "#cce040", "#f4ffa0"],
spread: 1,
seed: 3,
},
};
const D = meta.duration;
const SHEETS = [
{ h: 36, e: 0.84, a: 0.46, dim: 2, flow: 4, n: 2, back: true },
{ h: 26, e: 0.96, a: 0.5, dim: 1, flow: 8, n: 2, back: true },
{ h: 16, e: 1.04, a: 0.56, dim: 0, flow: 8, n: 3, back: false },
];
function tongues(sh, si, E, ph) {
const out = [];
for (const s of [-1, 1])
for (let i = 0; i < sh.n; i++) {
const q = (ph + i / sh.n + si * 0.17 + (s > 0 ? 0.5 / sh.n : 0)) % 1;
out.push({ s, q, x: s * E * (0.3 + 0.82 * q), h: sh.h * (0.75 - 0.45 * q) });
}
return out;
}
function height(sh, si, E, x, ph, T, seed) {
const ax = Math.abs(x), env = 1 - smooth(0.5, 1, ax / (E * sh.e)), r = tileNoise(ax * 0.07 - ph * sh.flow, si * 3.7, sh.flow, 0, seed + si);
let h = sh.h * env * (0.55 + 0.45 * r);
for (const g of T) {
const behind = g.s * (g.x - x);
if (behind < -1.5 || behind > 30) continue;
h = Math.max(h, g.h * Math.sqrt(Math.max(0, 1 - behind / 30)) * smooth(-1.5, 1.5, behind) * (1 - smooth(0.75, 1, g.q)));
}
return h;
}
function sheet(p, C, sh, si, E, t, seed) {
const ph = t / D, T = tongues(sh, si, E, ph), d = sh.dim, X = Math.ceil(E * 1.25);
for (let x = -X; x <= X; x++) {
const H = height(sh, si, E, x + 0.5, ph, T, seed);
if (H < 0.6) continue;
const top = -Math.round(H);
for (let y = top; y <= 1; y++) {
const v = clamp(-y / H), streak = 0.7 + 0.3 * tileNoise(x * 0.05 - ph * sh.flow * Math.sign(x || 1), y * 0.55, sh.flow, 0, seed + 9 + si);
const lv = v - (streak - 0.7) * 0.6, c = y === top ? C[Math.max(1, 4 - d)] : lv < 0.16 ? C[6 - d] : lv < 0.42 ? C[5 - d] : lv < 0.68 ? C[4 - d] : C[Math.max(1, 3 - d)];
p.blend(x, y, c, sh.a * (y === top ? 0.65 : (0.6 + 0.4 * (1 - v)) * streak));
}
}
for (const g of T) {
const k = Math.sin(Math.PI * g.q);
if (k < 0.15 || g.h < 4) continue;
const r = 1.8 + g.h * 0.22, cx = g.x - g.s * r * 0.6, cy = -g.h * 0.72, spin = -g.s * g.q * TAU * 2.2;
for (let a = 0; a < 4.6; a += 0.1) {
const rr = r * (1 - a * 0.12), px = cx + g.s * Math.cos(spin + a) * rr, py = cy + Math.sin(spin + a) * rr, w = 1.6 * (1 - a / 6);
for (let o = -w; o <= w; o += 0.8) {
const qx = px + g.s * Math.cos(spin + a) * o, qy = py + Math.sin(spin + a) * o;
p.blend(qx, qy, o > w * 0.4 ? C[5 - d] : C[4 - d], sh.a * 0.75 * k * (1 - a / 5.5));
}
}
}
}
function plumes(p, C, E, t, seed) {
cycle(t, D, 5, seed, (g) => g.range(2.4, 3.2), (age, L, R) => {
const u = age / L, x0 = R.range(-0.55, 0.55) * E, rise = R.range(13, 19), len = R.range(34, 48), ph = R.range(0, TAU), amp = R.range(3, 5);
const head = 14 + rise * age, tail = Math.max(10, head - len), fade = smooth(0, 0.15, u) * (1 - smooth(0.5, 1, u));
for (let h = tail; h <= head; h += 0.7) {
const s = (h - tail) / Math.max(1, head - tail), tw = Math.cos(h * 0.22 + age * 2.4 + ph), w = 0.6 + 2.2 * Math.abs(tw) * (1 - s * 0.5);
const x = x0 + amp * Math.sin(h * 0.12 + age + ph) * (0.4 + s), a = fade * Math.sin(Math.PI * Math.min(1, s * 1.2)) * 0.32;
for (let o = -w; o <= w; o += 1) p.blend(x + o, -h, tw > 0 ? (Math.abs(o) < w * 0.5 ? C[6] : C[5]) : Math.abs(o) < w * 0.5 ? C[3] : C[2], a);
}
});
}
function specks(p, C, E, t, seed) {
cycle(t, D, 30, seed, (g) => g.range(1.5, 2.6), (age, L, R) => {
const u = age / L, s = R.sign(), x = s * (R.range(0.05, 0.7) * E + age * R.range(6, 14)), y = -R.range(2, 20) - Math.sin(age * R.range(1.5, 3) + R.next() * TAU) * 2;
const a = Math.min(1, u * 5) * Math.min(1, (1 - u) * 3) * (0.6 + 0.4 * Math.sin(age * R.range(6, 10) + R.next() * TAU));
if (a < 0.1) return;
p.dot(x, y, a > 0.7 ? C[7] : C[6], a * 1.3);
p.glow(x, y, 4, C[6], 0.3 * a);
});
}
function drawBack(p, t, o) {
const C = fit(o.palette, 8), E = 96 * o.spread, pulse = 0.85 + 0.15 * Math.sin((TAU * t * 2) / D);
for (let x = -E; x <= E; x += 22) p.glow(x, -3, 30, C[5], 0.14 * pulse * (1 - Math.abs(x) / (E * 1.3)));
for (let i = 0; i < 6; i++) {
const R = rng(o.seed, i, 7), x = Math.sin((TAU * t) / D + R.range(0, TAU)) * E * R.range(0.2, 0.7) + R.range(-0.3, 0.3) * E, k = 0.6 + 0.4 * Math.sin((TAU * t * 3) / D + i);
p.glow(x, -R.range(4, 10), R.range(14, 22), C[6], 0.2 * k);
}
SHEETS.forEach((sh, i) => sh.back && sheet(p, C, sh, i, E, t, o.seed));
}
function draw(p, t, o) {
const C = fit(o.palette, 8), E = 96 * o.spread;
plumes(p, C, E, t, o.seed * 7 + 2);
SHEETS.forEach((sh, i) => !sh.back && sheet(p, C, sh, i, E, t, o.seed));
specks(p, C, E, t, o.seed * 11 + 5);
p.glow(0, -6, E * 0.9, C[5], 0.1);
}
__exports.meta = meta; __exports.drawBack = drawBack; __exports.draw = draw;
},
"fx/nature/acid-splash.js": function(__r, __exports){
const { Particles, Lights, P, Rng, fit, sparkle, clamp, smooth, ease, noise, rand, TAU, WHITE, mix, hex } = __r("core/index.js");
const { Drops } = __r("fx/nature/_lib.js");
const meta = {
name: "Acid splash",
desc: "A gob of acid bursts into a crown and spatters; it eats a glowing, smoking pit into the floor and boils down into it, spitting bright beads, pale steam curling off.",
tags: ["nature", "acid", "poison", "splash", "liquid", "ground", "one-shot"],
size: [184, 116],
origin: [92, 100],
duration: 2.8,
loop: false,
fps: 30,
bg: "ground",
options: { palette: ["#0e140a", "#1c3010", "#2c5214", "#457e18", "#6aae1c", "#a0dc2a", "#dcff6a", "#f8ffd0"], seed: 6 },
};
const HIT = 0.3, Y0 = -62, V0 = 60, SPREAD = 0.4, DRY = 0.7, GONE = 2.2, W = 30, PIT = 5;
function wisp(p, q, t, col) {
const age = t - q.t0, u = age / q.life;
if (u < 0 || u >= 1) return;
const head = q.rise * age, tail = Math.max(0, head - q.len), fade = smooth(0, 0.15, u) * (1 - smooth(0.4, 1, u));
for (let h = tail; h <= head; h += 0.5) {
const s = (h - tail) / Math.max(1, head - tail), x = q.x + q.amp * Math.sin(h * q.k + q.ph) * (0.2 + s) + q.drift * age;
p.blend(x, q.y - h, col, fade * Math.sin(Math.PI * s) * 0.42);
}
}
function create(o) {
const C = fit(o.palette, 8), R = new Rng(o.seed), floor = () => 0;
const SCORCH = mix(C[0], hex("#140f0c"), 0.6), BURNT = mix(C[1], hex("#2a1a10"), 0.6), STEAM = mix(C[7], hex("#e8ece6"), 0.75);
const ps = new Particles({ rng: R, ground: floor, sparks: [C[7], C[6], C[5], C[4]] });
const drops = new Drops(floor), lights = new Lights(), stains = [], wisps = [], pops = [];
const spikes = Array.from({ length: 13 }, (_, i) => ({ a: (i / 13) * TAU + R.range(-0.18, 0.18), h: R.range(4, 10), r: R.range(0.85, 1.12), shed: false }));
const rag = Array.from({ length: 80 }, (_, i) => rand(i, o.seed, 5) - 0.5);
let t = 0, hit = false;
const pw = () => W * ease.outCubic(clamp((t - HIT) / SPREAD)) * 1.02;
const pitD = () => PIT * ease.outCubic(clamp((t - HIT) / 1.1));
const depth = (x) => {
const w = pw(), d = Math.abs(x) / Math.max(1, w);
return d >= 1 ? -1 : pitD() * Math.sqrt(1 - d * d) + rag[(Math.round(x) + 200) % 80] * 0.9;
};
const level = () => (t < HIT ? 0 : -1.6 + (PIT + 1.6) * ease.inQuad(smooth(DRY, GONE, t)));
const width = () => {
const L = level(), w = pw();
return L <= 0 ? w : w * Math.sqrt(Math.max(0, 1 - (L / Math.max(0.1, pitD())) ** 2));
};
const heat = () => smooth(HIT, HIT + 0.3, t) * (1 - smooth(GONE - 0.3, GONE + 0.25, t));
const gobY = () => Y0 + V0 * t + 0.5 * 950 * t * t;
const crownR = () => 4 + 11 * ease.outCubic(clamp((t - HIT) / 0.16));
const crownH = () => 5 * Math.sin(Math.PI * clamp((t - HIT) / 0.26));
const spikeK = () => {
const u = clamp((t - HIT - 0.015) / 0.26);
return Math.sin(Math.PI * Math.pow(u, 0.6));
};
const tipOf = (s) => {
const r = crownR() * s.r, h = crownH(), sn = Math.sin(s.a), sh = s.h * spikeK();
const bx = Math.cos(s.a) * r, by = sn * r * 0.3 - h * (0.75 + 0.25 * Math.abs(sn));
return [bx, by, bx + Math.cos(s.a) * sh * 0.55, by - sh];
};
const steam = (x, y, big) => wisps.push({ x, y, t0: t, life: Math.min(R.range(0.5, 0.9) * (big ? 1.3 : 1), meta.duration - 0.05 - t), rise: R.range(22, 32), len: R.range(5, 10) * (big ? 1.4 : 1), amp: R.range(1, 2.5), k: R.range(0.35, 0.6), ph: R.range(0, TAU), drift: R.range(-4, 4) });
const crown = (p, back) => {
if (t < HIT || t > HIT + 0.27) return;
const r = crownR(), h = crownH(), ry = r * 0.3;
for (let x = Math.floor(-r); x <= Math.ceil(r); x++) {
const c = (x + 0.5) / r;
if (Math.abs(c) > 1) continue;
const e = Math.sqrt(1 - c * c), yb = (back ? -ry : ry) * e, hh = h * (0.75 + 0.25 * e);
for (let y = Math.floor(yb - hh); y <= Math.round(yb); y++) {
const rim = y === Math.floor(yb - hh);
if (rim) p.px(x, y, back ? C[5] : c < 0.1 ? C[7] : C[6]);
else p.blend(x, y, C[(c < -0.25 ? 5 : c > 0.45 ? 3 : 4) - (back ? 1 : 0)], back ? 0.55 : 0.7);
}
}
for (const s of spikes) {
if (Math.sin(s.a) < 0 !== back) continue;
const [bx, by, tx, ty] = tipOf(s);
p.line(bx, by, tx, ty, back ? C[4] : C[6]);
p.line(bx + 1, by, (bx + tx) / 2 + 0.5, (by + ty) / 2, back ? C[3] : C[5]);
if (!s.shed) p.px(tx, ty - 1, back ? C[5] : C[7]), p.px(tx + 1, ty - 1, C[5]);
}
};
return {
update(dt) {
t += dt;
const f = Math.min(1, dt * 120), w = width();
if (!hit && t >= HIT) {
hit = true;
lights.add(0, -4, 28, WHITE, 0.6, 0.08);
lights.add(0, -10, 56, C[5], 0.5, 0.6);
for (let i = 0; i < 26; i++) {
const a = -Math.PI / 2 + R.range(-1.35, 1.35), sp = R.range(60, 250);
drops.add(R.range(-3, 3), -2, Math.cos(a) * sp, Math.sin(a) * sp, R.chance(0.3) ? 2 : 1);
}
for (let i = 0; i < 10; i++) {
const a = -Math.PI / 2 + R.range(-1.2, 1.2), sp = R.range(120, 260);
ps.spawn(P.SPARK, 0, -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.12, 0.3));
}
for (let i = 0; i < 5; i++) steam(R.range(-10, 10), -R.range(2, 6), true);
}
if (hit)
for (const s of spikes)
if (!s.shed && t > HIT + 0.09) {
s.shed = true;
const [, , tx, ty] = tipOf(s);
drops.add(tx, ty - 1, Math.cos(s.a) * R.range(30, 80), -R.range(50, 130), R.chance(0.4) ? 2 : 1);
}
drops.update(dt, (d) => {
if (Math.abs(d.x) > pw()) stains.push({ x: d.x, t0: t, w: d.s * 0.8 + R.range(0.3, 1.2) });
if (t < GONE) steam(d.x, -1, false);
});
const lv = level(), w2 = width();
if (t > HIT + 0.15 && t < GONE && w2 > 2) {
if (R.chance(0.3 * f)) {
const x = R.range(-0.85, 0.85) * w2, y = Math.min(lv, depth(x)) - 1;
pops.push({ x, y, t0: t });
for (let j = 0; j < R.int(1, 3); j++) drops.add(x, Math.min(y - 1, -1), R.range(-40, 40), -R.range(50, 110), 1);
}
if (R.chance(0.14 * f)) steam(R.range(-0.9, 0.9) * w2, Math.min(lv, 0) - 1, R.chance(0.25));
}
if (t > GONE - 0.2 && t < meta.duration - 0.5 && R.chance(0.08 * f)) steam(R.range(-0.7, 0.7) * pw(), 0, false);
for (let i = pops.length - 1; i >= 0; i--) if (t - pops[i].t0 > 0.1) pops.splice(i, 1);
for (let i = wisps.length - 1; i >= 0; i--) if (t - wisps[i].t0 > wisps[i].life) wisps.splice(i, 1);
ps.update(dt);
lights.update(dt);
},
drawBack(p) {
const fade = 1 - smooth(meta.duration - 0.6, meta.duration - 0.08, t), hk = heat(), w = pw(), lv = level();
for (const s of stains) {
const age = t - s.t0, k = 1 - smooth(1, 1.8, age), c = age < 0.15 ? C[7] : age < 0.5 ? C[6] : age < 0.9 ? C[4] : BURNT;
for (let x = Math.floor(s.x - s.w); x <= Math.ceil(s.x + s.w); x++) p.dot(x, 0, Math.abs(x - s.x) < s.w * 0.5 ? SCORCH : c, k * fade);
if (age < 0.5) p.glow(s.x, -1, 5, C[5], 0.3 * (1 - age / 0.5));
}
crown(p, true);
if (t > HIT && w > 1) {
for (let x = Math.floor(-w) - 1; x <= Math.ceil(w) + 1; x++) {
const dp = depth(x + 0.5);
if (dp < 0) continue;
const bottom = Math.max(0, Math.round(dp)), edge = Math.abs(x + 0.5) / w > 0.88;
for (let y = 0; y <= bottom; y++) p.dot(x, y, y === bottom ? (hk > 0.5 ? C[6] : hk > 0.15 ? C[4] : BURNT) : SCORCH, fade);
p.dot(x, bottom + 1, hk > 0.5 ? C[5] : hk > 0.15 ? C[3] : SCORCH, fade * 0.8);
if (edge) p.dot(x, -1, hk > 0.4 ? C[7] : hk > 0.1 ? C[5] : BURNT, fade);
}
for (const sd of [-1, 1]) p.glow(sd * w, -1, 8, C[6], 0.45 * hk);
if (t < GONE)
for (let x = Math.floor(-w); x <= Math.ceil(w); x++) {
const dp = depth(x + 0.5);
if (dp < 0) continue;
const d = Math.abs(x + 0.5) / w, dome = lv < 0 ? Math.round(lv * Math.sqrt(Math.max(0, 1 - d * d))) : Math.round(lv), bottom = Math.round(dp);
if (dome > bottom) continue;
const n = noise(x * 0.25 - t * 2.4, 3) + noise(x * 0.1 + t * 1.4, 5) * 0.6;
for (let y = dome; y <= bottom; y++) p.px(x, y, y === dome ? (n > 0.7 ? C[7] : C[6]) : y === dome + 1 ? (n > 0.2 ? C[5] : C[4]) : y >= bottom ? C[3] : C[4]);
}
p.glow(0, -6, w * 1.4 + 10, C[4], 0.3 * hk * (0.85 + 0.15 * Math.sin(t * 9)));
p.glow(0, 1, w * 0.9, C[6], 0.2 * hk);
}
ps.draw(p, "back");
},
draw(p) {
if (t < HIT) {
const y = gobY(), v = V0 + 950 * t, st = 1 + v * 0.0022, rx = 2.6 / Math.sqrt(st), ry = 2.8 * st;
p.shade(-rx - 1, y - ry - 4, rx + 1, y + ry + 1, (x, yy, out) => {
const dx = x / rx, dy = (yy - y) / ry, tail = dy < 0 && Math.abs(x) < rx * (1 + dy * 0.9) + 0.4 && dy > -1.7;
const d = dx * dx + dy * dy;
if (d > 1.25 && !tail) return;
out.c = d > 1 && !tail ? C[2] : dx < -0.2 && dy < -0.1 ? C[7] : dy > 0.45 ? C[4] : C[5];
});
p.px(-1, y - ry * 0.3, WHITE);
for (let i = 1; i <= 3; i++) p.dot(0, y - ry - 2 - i * 4, C[5], 1 - i * 0.25);
p.glow(0, y, 10, C[5], 0.45);
}
crown(p, false);
const e = t - HIT;
if (e >= 0 && e < 0.07) {
const k = 1 - e / 0.07;
p.ellipse(0, -2, 6 + 6 * (1 - k), 2.5, k > 0.5 ? WHITE : C[7]);
sparkle(p, 0, -4, 8 * k, C[7], C[6], 0.6);
}
for (const q of pops) {
const k = (t - q.t0) / 0.1;
p.px(q.x, q.y, WHITE);
for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1]]) p.dot(q.x + dx * (1 + k * 2), q.y + dy * (1 + k * 2), C[7], 1 - k);
p.glow(q.x, q.y, 4, C[6], 0.4 * (1 - k));
}
for (const q of wisps) wisp(p, q, t, STEAM);
drops.draw(p, C);
ps.draw(p, "front");
lights.draw(p);
},
};
}
__exports.meta = meta; __exports.create = create;
},
"fx/nature/_lib.js": function(__r, __exports){
const { TAU, WHITE, GRAVITY, rand, clamp } = __r("core/index.js");
function stoneShape(R, n = R.int(5, 7)) {
const pts = [], a0 = R.range(0, TAU), squash = R.range(0.7, 1);
for (let i = 0; i < n; i++) {
const a = a0 + ((i + R.range(-0.28, 0.28)) * TAU) / n, r = R.range(0.72, 1.12);
pts.push([Math.cos(a) * r, Math.sin(a) * r * squash]);
}
return pts;
}
const LX = -0.6, LY = -0.8;
const inPoly = (V, x, y) => {
let inside = false;
for (let i = 0, j = V.length - 1; i < V.length; j = i++) {
const [xi, yi] = V[i], [xj, yj] = V[j];
if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
}
return inside;
};
const MASK = new Uint8Array(64 * 64), FACE = new Int8Array(64 * 64), ROWS = 400, RL = new Float32Array(ROWS), RR = new Float32Array(ROWS), RU = new Float32Array(ROWS);
function drawRock(p, x, y, s, a, pts, S, alpha = 1, white = false) {
const n = S.length, top = n - 2, ca = Math.cos(a), sa = Math.sin(a);
if (s < 1.4) {
p.dot(x, y, S[top - 1], alpha);
p.dot(x + 1, y, S[top - 3], alpha);
return;
}
const V = pts.map(([u, v]) => [(u * ca - v * sa) * s, (u * sa + v * ca) * s]);
const ang = V.map(([vx, vy]) => Math.atan2(vy, vx));
const lit = V.map(([ax, ay], i) => {
const [bx, by] = V[(i + 1) % V.length], ex = bx - ax, ey = by - ay, l = Math.hypot(ex, ey) || 1;
let nx = ey / l, ny = -ex / l;
if (nx * (ax + bx) + ny * (ay + by) < 0) (nx = -nx), (ny = -ny);
return nx * LX + ny * LY;
});
const X0 = Math.floor(x) - Math.ceil(s * 1.25) - 1, Y0 = Math.floor(y) - Math.ceil(s * 1.25) - 1, N = Math.min(62, 2 * Math.ceil(s * 1.25) + 3);
for (let j = 0; j < N; j++)
for (let i = 0; i < N; i++) {
const dx = X0 + i + 0.5 - x, dy = Y0 + j + 0.5 - y, k = j * 64 + i;
MASK[k] = inPoly(V, dx, dy) ? 1 : 0;
if (!MASK[k]) continue;
const g = Math.atan2(dy, dx);
let f = 0;
for (let q = 0; q < ang.length; q++) {
const a0 = ang[q], a1 = ang[(q + 1) % ang.length];
let d = (g - a0) % TAU, span = (a1 - a0) % TAU;
if (d < 0) d += TAU;
if (span < 0) span += TAU;
if (d <= span) {
f = q;
break;
}
}
FACE[k] = f;
}
const at = (i, j) => i >= 0 && j >= 0 && i < N && j < N && MASK[j * 64 + i] === 1;
for (let j = -1; j <= N; j++)
for (let i = -1; i <= N; i++) {
const X = X0 + i, Y = Y0 + j;
if (!at(i, j)) {
if (at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1)) p.dot(X, Y, S[0], alpha);
continue;
}
if (white) {
p.dot(X, Y, WHITE, alpha);
continue;
}
const L = lit[FACE[j * 64 + i]], edge = !at(i - 1, j) || !at(i + 1, j) || !at(i, j - 1) || !at(i, j + 1);
let c = L > 0.55 ? S[top] : L > 0.15 ? S[top - 1] : L > -0.3 ? S[top - 2] : S[top - 3];
if (edge) c = L > 0.3 ? S[top + 1] : L < -0.2 ? S[Math.max(1, top - 4)] : c;
p.dot(X, Y, c, alpha);
}
}
function drawSpike(p, x, base, h, w, lean, sp, S, opts = {}) {
if (h < 1.5) return;
const a = opts.a ?? 1, white = opts.white, glint = opts.glint ?? -1, clip = opts.clip ?? 1, floorY = opts.floor ?? Infinity;
const hw = (u, side) => {
let v = (w / 2) * Math.pow(Math.max(0, 1 - u), 0.85) + 0.3;
for (const n of sp.notches) if (n.side === side && u > n.u && u < n.u + 0.07) v -= n.d * (1 - u * 0.5);
return Math.max(0, v);
};
const half = opts.half ?? 0, Y0 = Math.floor(base - h) - 2, NR = Math.min(ROWS, Math.ceil(base) - Y0 + 2);
for (let k = 0; k < NR; k++) {
const u = (base - (Y0 + k + 0.5)) / h;
RU[k] = u;
if (u < 0 || u > 1 || Y0 + k + 0.5 > floorY) (RL[k] = Infinity), (RR[k] = -Infinity);
else (RL[k] = x + lean * u - hw(u, -1)), (RR[k] = x + lean * u + hw(u, 1));
}
const inside = (px, py) => {
const k = py - Y0, fx = px + 0.5;
if (k < 0 || k >= NR || fx < RL[k] || fx > RR[k]) return false;
if (clip < 1 && RU[k] > clip + (rand(px, 77) - 0.5) * 0.07) return false;
if (!half) return true;
const q = ((fx - RL[k]) / Math.max(0.5, RR[k] - RL[k])) * 2 - 1;
return half < 0 ? q < -0.18 : q >= -0.18;
};
const X0 = Math.floor(x - w / 2 - Math.abs(lean) - 2), X1 = Math.ceil(x + w / 2 + Math.abs(lean) + 2);
for (let py = Math.floor(base - h) - 1; py < Math.ceil(base); py++)
for (let px = X0; px <= X1; px++) {
if (!inside(px, py)) {
if (py + 0.5 <= floorY && (inside(px - 1, py) || inside(px + 1, py) || inside(px, py + 1) || (inside(px, py - 1) && py < base - 1))) p.dot(px, py, S[0], a);
continue;
}
if (white) {
p.dot(px, py, WHITE, a);
continue;
}
const k0 = py - Y0, u = RU[k0], c = x + lean * u, l = RL[k0], r = RR[k0], fx = px + 0.5;
let band = 0, st = false;
for (const s of sp.strata) {
const d = u * h - s * h - sp.slope * (fx - c);
if (d > 0) band++;
if (Math.abs(d) < 0.5) st = true;
}
const jog = (rand(band, sp.seed) - 0.5) * 0.3, q = ((fx - l) / Math.max(0.5, r - l)) * 2 - 1, qr = -0.18 + jog;
let i;
if (u > 0.93) i = q < qr + 0.3 ? 7 : 5;
else if (Math.abs(q - qr) < Math.max(0.09, 0.55 / Math.max(1, r - l))) i = 7;
else if (q < qr) i = fx - l < 1 ? 7 : q < -0.5 + jog ? 6 : 5;
else i = r - fx < 1 ? 3 : q < 0.38 + jog ? 4 : 2;
if (st && i < 7) i -= 1;
const fleck = rand(px * 7 + 3, py * 13 + 5);
if (fleck < 0.035) i = q < qr ? 7 : i - 1;
else if (fleck > 0.965) i -= 1;
if (glint >= 0 && q < qr + 0.1) {
const g = Math.abs(u - glint);
if (g < 0.035) i = 8;
else if (g < 0.07) i = Math.max(i, 7);
}
p.dot(px, py, i >= 8 ? WHITE : S[clamp(i, 0, S.length - 1)], a);
}
if (opts.cracks && opts.crack > 0)
for (const path of opts.cracks) {
const m = Math.max(1, Math.floor(path.length * opts.crack));
for (let k = 1; k < m; k++) {
const [u0, v0] = path[k - 1], [u1, v1] = path[k];
const P = ([u, v]) => [x + lean * u + v * hw(u, v < 0 ? -1 : 1), base - u * h];
const [ax, ay] = P([u0, v0]), [bx, by] = P([u1, v1]);
if (u1 > clip) break;
if (!inside(Math.floor(ax), Math.floor(ay)) || !inside(Math.floor(bx), Math.floor(by))) continue;
const hot = opts.heat ?? 0, Gl = opts.glowRamp;
if (hot > 0.05 && Gl) {
p.line(ax + 1, ay, bx + 1, by, S[0], a);
p.line(ax, ay, bx, by, hot > 0.7 ? Gl[4] : hot > 0.4 ? Gl[3] : hot > 0.2 ? Gl[2] : Gl[1], a);
if (k % 2 === 0) p.glow(bx, by, 7, Gl[2], 0.35 * hot);
} else {
p.line(ax, ay, bx, by, S[0], a);
p.dot(bx + 1, by - 1, S[6], a * 0.7);
}
}
}
}
function spikeLook(R) {
const notches = [], strata = [];
for (let i = 0, n = R.int(3, 5); i < n; i++) notches.push({ u: R.range(0.1, 0.8), side: R.sign(), d: R.range(0.8, 1.8) });
for (let i = 0, n = R.int(2, 4); i < n; i++) strata.push(R.range(0.12, 0.8));
return { notches, strata, slope: R.range(-0.25, 0.25), seed: R.int(1, 9999) };
}
function spikeCrack(R, u0, v0, dir) {
const pts = [[u0, v0]];
let u = u0, v = v0;
for (let i = 0; i < 9; i++) {
u += R.range(0.03, 0.08);
v += dir * R.range(0.05, 0.28) + R.range(-0.12, 0.12);
if (u > 0.95 || Math.abs(v) > 1) break;
pts.push([u, v]);
}
return pts;
}
function floorCrack(R, side, len) {
const pts = [[0, 0]];
for (let x = 0; Math.abs(x) < len; ) {
x += side * R.range(2, 5);
pts.push([x, R.int(0, 2)]);
}
return pts;
}
function drawLeaf(p, x, y, len, wid, ang, fl, pal, alpha = 1) {
const ca = Math.cos(ang), sa = Math.sin(ang), sq = Math.cos(fl), w = Math.max(0.55, Math.abs(sq) * wid), under = sq < 0;
const R = Math.ceil(len / 2 + 2), X = Math.round(x), Y = Math.round(y);
const inside = (i, j) => {
const u = (i + 0.5) * ca + (j + 0.5) * sa + len / 2, v = -(i + 0.5) * sa + (j + 0.5) * ca;
if (u < 0 || u > len) return 0;
const half = w * Math.pow(Math.sin((Math.PI * u) / len), 0.75);
return Math.abs(v) <= half ? (v < 0 ? 1 : 2) : 0;
};
for (let j = -R; j <= R; j++)
for (let i = -R; i <= R; i++) {
const s = inside(i, j);
if (!s) {
if (inside(i - 1, j) || inside(i + 1, j) || inside(i, j - 1) || inside(i, j + 1)) p.dot(X + i, Y + j, pal[0], alpha);
continue;
}
const u = (i + 0.5) * ca + (j + 0.5) * sa + len / 2, v = -(i + 0.5) * sa + (j + 0.5) * ca;
const rib = Math.abs(v) < 0.5 && u > len * 0.12 && u < len * 0.88 && w > 1.2;
p.dot(X + i, Y + j, rib ? pal[1] : (s === 1) !== under ? pal[3] : pal[2], alpha);
}
p.dot(X - ca * (len / 2 + 1), Y - sa * (len / 2 + 1), pal[1], alpha);
}
class Drops {
constructor(ground = () => 0) {
this.list = [];
this.ground = ground;
}
add(x, y, vx, vy, s = 1, delay = 0) {
this.list.push({ x, y, vx, vy, s, delay });
}
update(dt, onLand) {
for (let i = this.list.length - 1; i >= 0; i--) {
const d = this.list[i];
if (d.delay > 0) {
d.delay -= dt;
continue;
}
const drag = 0.6 / d.s, py = d.y;
d.vy += GRAVITY * dt;
d.vx -= d.vx * drag * dt;
d.vy -= d.vy * drag * 0.5 * dt;
d.x += d.vx * dt;
d.y += d.vy * dt;
const g = this.ground(d.x);
if (d.vy > 0 && py <= g && d.y >= g) {
onLand?.(d, g);
this.list.splice(i, 1);
}
}
}
draw(p, C) {
const n = C.length;
for (const d of this.list) {
if (d.delay > 0) continue;
const sp = Math.hypot(d.vx, d.vy) || 1, ux = d.vx / sp, uy = d.vy / sp, len = Math.min(5, 0.5 + sp * 0.012);
p.line(d.x - ux * len, d.y - uy * len, d.x - ux, d.y - uy, C[n - 4]);
p.px(d.x, d.y, C[n - 1]);
if (d.s > 1) p.px(d.x - ux, d.y - uy, C[n - 2]), p.px(d.x + 1, d.y, C[n - 3]);
p.glow(d.x, d.y, 3 + d.s * 1.5, C[n - 2], 0.3);
}
}
}
function gasPuff(p, x, y, r, a, belly, body, cap, hi = 0) {
if (a < 0.02 || r < 0.6) return;
p.disc(x + r * 0.06, y + r * 0.28, r * 0.9, belly, a * 0.55);
p.disc(x, y, r, body, a * 0.45);
p.disc(x + r * 0.03, y - r * 0.02, r * 0.76, body, a * 0.5);
p.disc(x - r * 0.2, y - r * 0.34, r * 0.52, cap, a * 0.45);
if (hi) p.disc(x - r * 0.3, y - r * 0.55, r * 0.26, hi, a * 0.32);
}
function bubble(p, x, y, r, c1, c2, fill, a = 1, dome = false) {
const R = Math.ceil(r) + 1, X = Math.round(x), Y = Math.round(y);
for (let j = -R; j <= (dome ? 0 : R); j++)
for (let i = -R; i <= R; i++) {
const d = Math.hypot(i, j);
if (d > r + 0.45) continue;
if (d > r - 0.6) p.dot(X + i, Y + j, i < 0 && j < -r * 0.2 ? c1 : c2, a);
else p.blend(X + i, Y + j, fill, 0.3 * a);
}
if (r >= 1.5) p.dot(X - Math.round(r * 0.45), Y - Math.round(r * 0.5), WHITE, a);
}
class Gas {
constructor() {
this.list = [];
this.n = 0;
}
add(t, x, y, vx, vy, r0, r1, end, rise = 0) {
this.list.push({ x, y, vx, vy, r0, r1, t0: t, end, rise, seed: (this.n++ * 37.7) % 100 });
}
prune(t) {
for (let i = this.list.length - 1; i >= 0; i--) if (t > this.list[i].end) this.list.splice(i, 1);
}
at(q, t) {
const age = t - q.t0, e = 1 - Math.exp(-age * 2.2), sw = Math.min(1, age);
const x = q.x + (q.vx / 2.2) * e + Math.sin(t * 1.7 + q.seed) * 2.5 * sw, y = q.y + (q.vy / 2.2) * e - q.rise * age + Math.sin(t * 1.3 + q.seed * 2) * 1.5 * sw;
const u = clamp(age / Math.max(0.01, q.end - q.t0)), r = q.r0 + (q.r1 - q.r0) * (1 - Math.pow(1 - Math.min(1, age / 1.2), 3));
return { x, y, r, a: clamp(age / 0.15) * (1 - clamp((u - 0.4) / 0.6)), u };
}
draw(p, t, belly, body, cap, hi = 0, k = 1, glow = 0) {
for (const q of this.list) {
const g = this.at(q, t);
if (g.a <= 0.02) continue;
gasPuff(p, g.x, g.y, g.r, g.a * k, belly, body, cap, g.u < 0.5 ? hi : 0);
if (glow && g.r > 4) p.glow(g.x, g.y, g.r * 1.6, glow, 0.07 * g.a * k);
}
}
}
__exports.stoneShape = stoneShape; __exports.drawRock = drawRock; __exports.drawSpike = drawSpike; __exports.spikeLook = spikeLook; __exports.spikeCrack = spikeCrack; __exports.floorCrack = floorCrack; __exports.drawLeaf = drawLeaf; __exports.Drops = Drops; __exports.gasPuff = gasPuff; __exports.bubble = bubble; __exports.Gas = Gas;
},
};
const __cache = {};
const __r = id => { if (__cache[id]) return __cache[id]; const e = __cache[id] = {}; __defs[id](__r, e); return e; };
const fx = {};
fx["critters/slime"] = __r("fx/critters/slime.js");
fx["critters/eyeball"] = __r("fx/critters/eyeball.js");
fx["critters/bat"] = __r("fx/critters/bat.js");
fx["critters/ghost"] = __r("fx/critters/ghost.js");
fx["critters/wisp"] = __r("fx/critters/wisp.js");
fx["critters/flying-skull"] = __r("fx/critters/flying-skull.js");
fx["explosions/small-explosion"] = __r("fx/explosions/small-explosion.js");
fx["explosions/big-explosion"] = __r("fx/explosions/big-explosion.js");
fx["explosions/cartoon-pow"] = __r("fx/explosions/cartoon-pow.js");
fx["explosions/dirt-explosion"] = __r("fx/explosions/dirt-explosion.js");
fx["explosions/smoke-bomb"] = __r("fx/explosions/smoke-bomb.js");
fx["fire/fireball"] = __r("fx/fire/fireball.js");
fx["fire/fire-breath"] = __r("fx/fire/fire-breath.js");
fx["fire/flame-pillar"] = __r("fx/fire/flame-pillar.js");
fx["impacts/hit-spark"] = __r("fx/impacts/hit-spark.js");
fx["impacts/blunt-hit"] = __r("fx/impacts/blunt-hit.js");
fx["impacts/ground-slam"] = __r("fx/impacts/ground-slam.js");
fx["lightning/lightning-strike"] = __r("fx/lightning/lightning-strike.js");
fx["lightning/zap-hit"] = __r("fx/lightning/zap-hit.js");
fx["lightning/spark-arc"] = __r("fx/lightning/spark-arc.js");
fx["ice/ice-shatter"] = __r("fx/ice/ice-shatter.js");
fx["ice/ice-crystal"] = __r("fx/ice/ice-crystal.js");
fx["spawn/poof"] = __r("fx/spawn/poof.js");
fx["spawn/spawn-portal"] = __r("fx/spawn/spawn-portal.js");
fx["pickups/collect-burst"] = __r("fx/pickups/collect-burst.js");
fx["pickups/coin-spin"] = __r("fx/pickups/coin-spin.js");
fx["pickups/power-star"] = __r("fx/pickups/power-star.js");
fx["ui/level-up"] = __r("fx/ui/level-up.js");
fx["melee/sword-slash"] = __r("fx/melee/sword-slash.js");
fx["melee/double-slash"] = __r("fx/melee/double-slash.js");
fx["melee/spin-slash"] = __r("fx/melee/spin-slash.js");
fx["nature/poison-cloud"] = __r("fx/nature/poison-cloud.js");
fx["nature/acid-splash"] = __r("fx/nature/acid-splash.js");
return { core: __r("core/index.js"), fx };
})();
