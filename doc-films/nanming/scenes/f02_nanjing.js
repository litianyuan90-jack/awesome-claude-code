// 南京：晨雾里的长江，江边一段城墙和城楼，几条船泊在岸边。
import { THREE, LOOKS, fx, rng } from '../film/kit.js';
import { riverWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';
import { cityWall } from './_lib.js';

const BANK = -330;

export default {
  setup() {
    const W = riverWorld({ name: '长江', seed: 21, halfWidth: 330, waterHalfWidth: 440, bed: [-6, 4], bank: [3, 10],
      water: { speed: 0.6, deep: '#2b3a37', shallow: '#56675e', foam: 0.04, amp: 0.4 },
      shelfW: (s, side) => (side < 0 ? 260 : 60), shelfH: 3, wall: { h: 70, hVar: 50, run: 420 }, size: [2800, 3600], palette: 'green',
      trees: { count: 8000, color: '#3a5232', scale: [5, 10], minY: 4, clear: (x) => x < BANK && x > -720 } });
    W.scene.add(cityWall({ a: [BANK - 80, -700], b: [BANK - 80, 400], h: 14, thick: 10, y: (x, z) => W.H(x, z), gate: 0 }));
    const boats = createFleet(W.scene, 10, { length: 34, masts: 1, seed: 6 });
    const r = rng(4);
    const berth = [...Array(10)].map((_, i) => ({ x: BANK + 40 + r() * 120, z: -500 + i * 95 + (r() - 0.5) * 30, sc: 0.7 + r() * 0.3 }));
    const mist = fx.mist([-100, 3, -150], [500, 3, 900], { count: 260, opacity: 0.18 });
    W.scene.add(mist);
    return { worlds: [W], W, boats, berth, mist };
  },
  shots: {
    river({ t, k, S }) {
      const { W } = S;
      W.tick(t); S.mist.userData.update(t);
      W.look({ ...LOOKS.morning, sunDir: [0.7, 0.25, 0.5], fog: ['#b9bcb6', 0.0012] }, new THREE.Vector3(BANK, 0, -150));
      S.boats.furl(1);
      S.boats.pose(t, (i) => ({ x: S.berth[i].x, z: S.berth[i].z, heading: 0.05 + i * 0.02, scale: S.berth[i].sc, moving: false }), { y: 0.25, sway: 0.2 });
      W.track(k, { pos: [[0, [BANK + 260, 26, 260]], [1, [BANK + 230, 30, 200]]], at: [[0, [BANK - 70, 12, -260]], [1, [BANK - 75, 12, -300]]] }, 40);
      return { world: W, post: { exposure: 1.05, bloom: 0.4, bloomThreshold: 0.85, sat: 0.75 } };
    },
  },
};
