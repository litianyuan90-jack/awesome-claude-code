// 肇庆，西江：黄昏，几条船逆流向西。
import { THREE, LOOKS, rng } from '../film/kit.js';
import { riverWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';

export default {
  setup() {
    const W = riverWorld({ name: '西江', seed: 46, axis: 'x', halfWidth: 170, waterHalfWidth: 240, center: (s) => 60 * Math.sin(s / 600),
      water: { speed: 0.8, deep: '#2a3430', shallow: '#56604f', foam: 0.05, amp: 0.4 }, wall: { h: 220, hVar: 120, run: 230, ridge: 0.9 }, size: [3200, 2200], palette: 'lush',
      trees: { count: 16000, color: '#2f4a2a', scale: [5, 11], minY: 5 } });
    const boats = createFleet(W.scene, 7, { length: 40, masts: 2, seed: 12, lanterns: true });
    const r = rng(9);
    const lane = [...Array(7)].map((_, i) => ({ dx: i * 90 + r() * 30, dz: (r() - 0.5) * 90, sc: 0.7 + r() * 0.3 }));
    return { worlds: [W], W, boats, lane };
  },
  shots: {
    boats({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t);
      W.look({ ...LOOKS.golden, sunDir: [-0.85, 0.1, 0.3], fog: ['#a88864', 0.0011], hemi: 0.5 });
      S.boats.furl(0); S.boats.lamps(0.6);
      const x0 = 100 - 2.2 * lt;
      S.boats.pose(t, (i) => { const L = S.lane[i]; const x = x0 + L.dx; return { x, z: 60 * Math.sin(x / 600) + L.dz, heading: -Math.PI / 2, scale: L.sc }; }, { y: 0.25, sway: 0.3 });
      W.track(k, { pos: [[0, [560, 30, 60 * Math.sin(560 / 600) + 70]], [1, [520, 34, 60 * Math.sin(520 / 600) + 70]]], at: [[0, [100, 8, 40]], [1, [60, 8, 40]]] }, 40);
      return { world: W, post: { exposure: 1.0, bloom: 0.55, bloomThreshold: 0.8, sat: 0.85 } };
    },
  },
};
