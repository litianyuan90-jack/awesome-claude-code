// 桂林：新地形——平地上拔起的一座座喀斯特孤峰，河从峰林间穿过；清晨薄雾里，一支打着旗的队伍沿河行军。
import { THREE, LOOKS, fx, makeWorld, makeNoise, hash1, lerp, smooth, createColumn, polyPath } from '../film/kit.js';
import { WATERS } from '../film/worlds.js';
import { createFlagPole } from '../film/props.js';

const KARST = { grass: '#4f6a3a', grass2: '#5a7442', rock: '#6f7468', rock2: '#868a7c', sand: '#8a8268', snow: '#ffffff' };
const ARMY = { uniform: '#5a3326', gear: '#2e241c', wrap: '#4a3a2c', rifle: false, pack: false, robe: false, hat: 'conical', hatColor: '#3a2e24' };

// tower peaks on a jittered grid: steep sides, rounded tops, a few twin peaks
function karstHeight(seed) {
  const n = makeNoise(seed), G = 150, cells = new Map();
  for (let gx = -14; gx <= 14; gx++) for (let gz = -12; gz <= 12; gz++) {
    const id = gx * 131 + gz * 17 + seed;
    if (hash1(id) < 0.18) continue;
    const x = gx * G + (hash1(id + 1) - 0.5) * G * 0.8, z = gz * G + (hash1(id + 2) - 0.5) * G * 0.8;
    if (Math.abs(z - 40 * Math.sin(x / 300)) < 110) continue;               // keep the river valley clear
    cells.set(gx + ',' + gz, [x, z, 70 + hash1(id + 3) * 150, 34 + hash1(id + 4) * 30]);
  }
  const river = (x) => 40 * Math.sin(x / 300);
  const H = (x, z) => {
    let y = 1.5 + n.fbm(x * 0.006, z * 0.006, 3) * 2;
    const dr = Math.abs(z - river(x));
    if (dr < 40) y = lerp(-1.2, y, smooth((dr - 18) / 22));
    const cx = Math.round(x / G), cz = Math.round(z / G);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const pk = cells.get((cx + i) + ',' + (cz + j)); if (!pk) continue;
      const [px, pz, h, r] = pk, d = Math.hypot(x - px, z - pz) / r;
      if (d < 1.6) y = Math.max(y, h * Math.pow(Math.max(0, 1 - Math.pow(d / 1.35, 2.6)), 0.55) * (0.9 + 0.2 * n.fbm(x * 0.03, z * 0.03, 2)));
    }
    return y;
  };
  return { H, river };
}

export default {
  setup() {
    const { H, river } = karstHeight(52);
    const W = makeWorld({ name: '桂林', heightFn: H, size: [3000, 2600], seg: [600, 520], palette: KARST,
      water: { size: [3000, 90], seg: [300, 12], flow: [1, 0], ...WATERS.calm, deep: '#2c4a44', shallow: '#5c8278', y: 0, amp: 0.2 } });
    const path = polyPath([...Array(14)].map((_, i) => { const x = -420 + i * 60; return [x, river(x) - 34]; }), H, 0.05);
    const col = createColumn(W.scene, 160, { figure: ARMY });
    const flags = [];
    for (let i = 0; i < 8; i++) { const f = createFlagPole(6.5, i % 3 ? '#b3261e' : '#c9a23f', 2.4, 1.4); W.scene.add(f); flags.push(f); }
    const mist = fx.mist([0, 18, 0], [1100, 14, 700], { count: 320, opacity: 0.22, colA: '#d8dcd6', colB: '#e8ebe6' });
    W.scene.add(mist);
    return { worlds: [W], W, H, path, col, flags, mist };
  },
  shots: {
    karst({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); S.mist.userData.update(t);
      W.look({ ...LOOKS.morning, sunDir: [0.6, 0.3, 0.7], fog: ['#c3c8c2', 0.0011], hemi: 1.0 }, new THREE.Vector3(-100, 0, -30));
      const head = 0.85 + lt * 1.4 / S.path.meters;
      S.col.pose(t, S.path, { head, spacing: 2.4, lanes: 3, laneGap: 1.2, speed: 6.5, pitch: 0.12 });
      // banners carried along the column
      S.flags.forEach((f, i) => { const p = S.path(head - (6 + i * 16) * 2.4 / S.path.meters); f.position.set(p.x + 2, p.y, p.z); f.userData.update(t + i, 0.7); });
      const rz = (x) => 40 * Math.sin(x / 300);
      W.track(k, { pos: [[0, [330, 46, rz(330) + 10]], [1, [290, 42, rz(290) + 10]]], at: [[0, [-120, 26, rz(-120) - 20]], [1, [-160, 24, rz(-160) - 20]]] }, 40);
      return { world: W, post: { exposure: 1.05, bloom: 0.4, bloomThreshold: 0.85, sat: 0.85 } };
    },
  },
};
