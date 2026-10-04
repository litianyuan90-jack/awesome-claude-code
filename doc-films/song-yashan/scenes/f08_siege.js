// 断水：高处看海湾——宋军一字阵贴着山，元军的船在外海横成一道线；再贴近看：船阵一动不动。
import { THREE, LOOKS } from '../film/kit.js';
import { yashanWorld, poseLine, LINE_N, LINE_GAP } from './_lib.js';

export default {
  setup() {
    const Y = yashanWorld();
    return { worlds: [Y.W], ...Y };
  },
  shots: {
    block({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.overcast, sunDir: [0.3, 0.6, 0.7], fog: ['#8b9294', 0.00045] }, new THREE.Vector3(0, 0, S.shoreZ + 300));
      S.song.furl(1); S.song.lamps(0);
      poseLine(S, t);
      // the Yuan line closes across the mouth of the bay
      S.yuan.furl(0.3);
      S.yuan.pose(t, (i) => ({ x: (i - 30) * 52, z: S.shoreZ + 900 - 60 * Math.max(0, 1 - lt / 3), heading: Math.PI, scale: 0.75, moving: lt < 3 }), { sea: W });
      W.track(k, { pos: [[0, [0, 420, S.shoreZ + 1700]], [1, [0, 380, S.shoreZ + 1560]]], at: [[0, [0, 0, S.shoreZ + 420]], [1, [0, 0, S.shoreZ + 400]]] }, 42);
      return { world: W, post: { exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, sat: 0.65 } };
    },
    // low along the hulls: nothing moves
    thirst({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.overcast, sunDir: [0.4, 0.5, 0.7], fog: ['#8b9294', 0.0012], hemi: 0.9 }, new THREE.Vector3(0, 0, S.shoreZ + 170));
      S.song.furl(1); S.song.lamps(0);
      poseLine(S, t);
      S.yuan.pose(t, (i) => ({ x: (i - 30) * 52, z: S.shoreZ + 840, heading: Math.PI, scale: 0.75, moving: false }), { sea: W });
      const lz = S.shoreZ + 170;
      W.track(k, { pos: [[0, [180, 14, lz + 120]], [1, [150, 13, lz + 110]]], at: [[0, [-80, 6, lz]], [1, [-120, 6, lz]]] }, 40);
      return { world: W, post: { exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, sat: 0.6 } };
    },
  },
};
