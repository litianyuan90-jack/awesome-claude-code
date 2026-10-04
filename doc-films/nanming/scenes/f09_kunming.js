// 终章：暮色里的大江上，一条孤船慢慢渡过 → 滇池的黄昏，湖面空空，岸边一棵树。
import { THREE, LOOKS, fx } from '../film/kit.js';
import { riverWorld, lakeWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';

function tree(h = 9) {
  const g = new THREE.Group(), bark = new THREE.MeshStandardMaterial({ color: '#241a12', roughness: 1 }), leaf = new THREE.MeshStandardMaterial({ color: '#28301f', roughness: 1, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, h * 0.6, 7), bark); trunk.position.y = h * 0.3; trunk.rotation.z = -0.12; g.add(trunk);
  for (const [x, y, z, r] of [[-0.8, 0.7, 0, 2.4], [1.2, 0.78, 0.4, 2.0], [0, 0.9, -0.6, 2.2]]) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leaf); b.position.set(x, y * h, z); b.scale.y = 0.7; g.add(b); }
  return g;
}

export default {
  setup() {
    const R = riverWorld({ name: '伊洛瓦底江', seed: 88, halfWidth: 260, waterHalfWidth: 340, water: { speed: 0.5, deep: '#2a2c2a', shallow: '#5a5448', foam: 0.03, amp: 0.3 },
      wall: { h: 90, hVar: 60, run: 400 }, size: [2600, 3000], palette: 'lush', trees: { count: 12000, color: '#2a3a26', scale: [6, 12], minY: 4 } });
    const boat = createFleet(R.scene, 1, { length: 30, masts: 1, seed: 2, lanterns: true });
    const sx0 = 30;
    const L = lakeWorld({ name: '滇池', seed: 92, radius: 420, squash: 1.6, hills: { h: 260, hVar: 100, run: 300 }, palette: 'green', size: [3000, 2400],
      trees: { count: 9000, color: '#2e3e2a', scale: [5, 10], minY: 4, clear: (x, y, z) => Math.abs(x - sx0) < 40 && z < -380 } });
    const [sx, sz] = L.lake.shore(-Math.PI * 0.5, 14);
    const t1 = tree(12); t1.position.set(sx + 30, L.H(sx + 30, sz - 6), sz - 6); L.scene.add(t1);
    const mist = null;
    return { worlds: [R, L], R, boat, L, mist, shore: [sx, sz] };
  },
  shots: {
    river({ t, lt, k, S }) {
      const { R } = S;
      R.tick(t); R.look({ ...LOOKS.dusk, sunDir: [-0.8, 0.06, -0.4], fog: ['#5a4842', 0.0012], hemi: 0.4 });
      S.boat.furl(1); S.boat.lamps(1);
      S.boat.pose(t, () => ({ x: -180 + lt * 4, z: -40, heading: Math.PI / 2, scale: 1 }), { y: 0.25, sway: 0.2 });
      R.track(k, { pos: [[0, [-40, 18, 320]], [1, [-20, 20, 300]]], at: [[0, [-160, 3, -40]], [1, [-140, 3, -40]]] }, 38);
      return { world: R, post: { exposure: 1.05, bloom: 0.8, bloomThreshold: 0.65, sat: 0.7 } };
    },
    lake({ t, k, S }) {
      const { L } = S;
      L.tick(t);
      L.look({ ...LOOKS.dusk, sunDir: [0.1, 0.03, -1], glow: 0.8, fog: ['#5e4c4a', 0.0009], hemi: 0.35, waterLight: 0.8 });
      const [sx, sz] = S.shore;
      L.track(k, { pos: [[0, [sx + 70, 8, sz + 330]], [1, [sx + 60, 9, sz + 290]]], at: [[0, [sx + 30, 14, sz - 20]], [1, [sx + 30, 14, sz - 20]]] }, 34);
      return { world: L, post: { exposure: 1.0, bloom: 0.6, bloomThreshold: 0.75, sat: 0.65 } };
    },
  },
};
