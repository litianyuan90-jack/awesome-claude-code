// 1644 北京：黄昏的宫殿，空无一人的广场，远处几柱烟 → 煤山：山顶小亭，一棵老树，暮色里的剪影。
import { THREE, LOOKS, fx, makeWorld, makeNoise, smooth } from '../film/kit.js';
import { PALETTES } from '../film/worlds.js';
import { createBuilding } from '../film/figures.js';
import { cityWall } from './_lib.js';

const GROUND = { ...PALETTES.dry, grass: '#5a5246', grass2: '#625a4c', sand: '#6a6152' };

function tree(h = 9) {
  const g = new THREE.Group(), bark = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: 1 }), leaf = new THREE.MeshStandardMaterial({ color: '#2c3324', roughness: 1, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, h * 0.55, 7), bark); trunk.position.y = h * 0.27; trunk.rotation.z = 0.08; g.add(trunk);
  for (const [x, y, z, r] of [[0.6, 0.62, 0, 2.6], [-1.5, 0.72, 0.6, 2.2], [1.8, 0.78, -0.5, 2.0], [0, 0.9, 0.4, 2.4], [-0.6, 0.66, -1.4, 2.0]]) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leaf); b.position.set(x, y * h, z); b.scale.y = 0.75; g.add(b);
  }
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 3.4, 5), bark); arm.position.set(1.4, h * 0.5, 0); arm.rotation.z = -1.1; g.add(arm);
  g.traverse((o) => (o.castShadow = true));
  return g;
}

export default {
  setup() {
    // palace courtyard
    const P = makeWorld({ name: '紫禁城', heightFn: () => 0, size: [1600, 1600], seg: [10, 10], palette: GROUND, detail: 0.5 });
    const hall = createBuilding({ w: 64, d: 30, wallH: 13, roofH: 10, wall: '#6e231b', roof: '#a8802e', stories: 2, base: { w: 76, h: 7, d: 42, color: '#cfc8b8' } });
    hall.position.set(0, 0, -120); P.scene.add(hall);
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
      const b = createBuilding({ w: 34, d: 12, wallH: 6, roofH: 4.6, wall: '#62221a', roof: '#9a7a32' });
      b.position.set(sx * 90, 0, -80 + i * 46); b.rotation.y = Math.PI / 2; P.scene.add(b);
    }
    P.scene.add(cityWall({ a: [-140, 80], b: [140, 80], h: 10, thick: 8, gate: 12, color: '#6a2a20' }));
    const smoke = fx.smoke([[-520, 10, -900], [380, 10, -1100], [900, 10, -700]], { count: 360, size: 40, rise: 120, opacity: 0.4, wind: 1.2 });
    P.scene.add(smoke);

    // Jingshan: a small steep hill with a pavilion on top and a lone tree on the east slope
    const n = makeNoise(16);
    const H = (x, z) => 62 * Math.exp(-(x * x + z * z) / (2 * 70 * 70)) + 22 * Math.exp(-((x - 120) ** 2 + z * z) / (2 * 60 * 60)) + n.fbm(x * 0.02, z * 0.02, 3) * 1.5;
    const J = makeWorld({ name: '煤山', heightFn: H, size: [1400, 1400], seg: [280, 280], palette: PALETTES.green });
    const pav = createBuilding({ w: 9, d: 9, wallH: 3.2, roofH: 3.6, wall: '#5c2219', roof: '#2e3030' });
    pav.position.set(0, H(0, 0) - 0.5, 0); J.scene.add(pav);
    const t1 = tree(10); t1.position.set(38, H(38, 18) - 0.3, 18); J.scene.add(t1);
    return { worlds: [P, J], P, J, smoke, H };
  },
  shots: {
    palace({ t, k, S }) {
      const { P } = S;
      P.tick(t); S.smoke.userData.update(t);
      P.look({ ...LOOKS.dusk, sunDir: [-0.7, 0.1, 0.5], fog: ['#6a5248', 0.0011], hemi: 0.5 }, new THREE.Vector3(0, 0, -100));
      P.track(k, { pos: [[0, [0, 9, 170]], [1, [0, 12, 120]]], at: [[0, [0, 18, -120]], [1, [0, 20, -120]]] }, 42);
      return { world: P, post: { exposure: 1.05, bloom: 0.55, bloomThreshold: 0.8, sat: 0.72 } };
    },
    // low, against the last light: the hill, the pavilion, the tree
    hill({ t, k, S }) {
      const { J } = S;
      J.tick(t);
      J.look({ ...LOOKS.dusk, sunDir: [0.2, 0.04, -1], glow: 0.9, fog: ['#5e4a46', 0.0016], hemi: 0.4 });
      J.track(k, { pos: [[0, [120, 40, 300]], [1, [110, 44, 270]]], at: [[0, [30, 56, 0]], [1, [32, 57, 0]]] }, 30);
      return { world: J, post: { exposure: 1.0, bloom: 0.6, bloomThreshold: 0.75, sat: 0.7 } };
    },
  },
};
