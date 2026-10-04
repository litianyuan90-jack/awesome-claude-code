// 泉州：船队泊在城外海面，岸上的城墙和城门紧闭。阴天。
import { THREE, LOOKS, rng } from '../film/kit.js';
import { coastWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';
import { addHouses, createFlagPole } from '../film/props.js';
import { cityWall } from './_lib.js';

export default {
  setup() {
    const W = coastWorld({ name: '泉州', seed: 27, sea: 'harbor', wind: 1.4, bay: { width: 700, depth: 40 }, flat: 260, beach: [2.4, 40],
      hills: { h: 140, hVar: 80, run: 360 }, palette: 'quay',
      trees: { count: 7000, color: '#3a5230', scale: [5, 10], minY: 8, maxSlope: 1.6, clear: (x, y, z) => y < 9 } });
    const sz = (x) => W.coast.shore(x);
    // wall along the shore, 40 m inland, in short straight pieces so it follows the curve
    for (const xs of [[-360, -240, -150, -60], [60, 150, 240, 360]]) for (let i = 0; i < xs.length - 1; i++) {
      const a = [xs[i], sz(xs[i]) - 40], b = [xs[i + 1], sz(xs[i + 1]) - 40];
      W.scene.add(cityWall({ a, b, h: 12, y: (x, z) => W.H(x, z), tower: false }));
    }
    // the sea gate: closed, with its tower, on the middle piece
    W.scene.add(cityWall({ a: [-60, sz(-60) - 40], b: [60, sz(60) - 40], h: 12, thick: 10, y: (x, z) => W.H(x, z), gate: 0 }));
    addHouses(W.scene, 120, (i, r) => { const x = -330 + (i % 20) * 34 + (r() - 0.5) * 8, d = 80 + Math.floor(i / 20) * 26 + r() * 6; const [px, pz] = W.coast.inland(x, d); return [px, W.H(px, pz), pz, Math.PI]; }, { wall: '#5a4e42', roof: '#2a2a2c' });
    const flag = createFlagPole(10, '#3a3a3a', 3, 1.8);
    { const [fx, fz] = W.coast.inland(30, 44); flag.position.set(fx, W.H(fx, fz) + 22, fz); W.scene.add(flag); }
    const fleet = createFleet(W.scene, 18, { length: 56, masts: 3, seed: 2 });
    const r = rng(5);
    const berth = [...Array(18)].map((_, i) => ({ x: -380 + (i % 6) * 150 + (r() - 0.5) * 50, z: sz(0) + 230 + Math.floor(i / 6) * 150 + (r() - 0.5) * 40, sc: 0.7 + r() * 0.25 }));
    return { worlds: [W], W, fleet, berth, flag, gz: sz(0) - 40 };
  },
  shots: {
    gate({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.overcast, sunDir: [0.3, 0.5, 0.8], fog: ['#8d9294', 0.0011] }, new THREE.Vector3(0, 0, S.gz));
      S.fleet.furl(1);
      S.fleet.pose(t, (i) => ({ x: S.berth[i].x, z: S.berth[i].z, heading: Math.PI + 0.3 + (i % 3) * 0.1, scale: S.berth[i].sc, moving: false }), { sea: W });
      S.flag.userData.update(t, 0.6);
      W.track(k, { pos: [[0, [70, 20, S.gz + 300]], [1, [50, 17, S.gz + 240]]], at: [[0, [0, 16, S.gz]], [1, [0, 16, S.gz]]] }, 38);
      return { world: W, post: { exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, sat: 0.7 } };
    },
  },
};
