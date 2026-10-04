// 崖山：黄昏里几艘点灯的船（端宗病逝）→ 一字连营：上百艘船并排连成一线，背后是大山。
import { THREE, LOOKS } from '../film/kit.js';
import { seaWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';
import { yashanWorld, poseLine } from './_lib.js';

export default {
  setup() {
    const D = seaWorld({ name: '暮海', wind: -2.0, sea: { deep: '#0e1d27', shallow: '#304a52', foam: 0.15, amp: 0.5, chop: 0.8 } });
    const few = createFleet(D.scene, 7, { length: 52, masts: 3, seed: 4, lanterns: true });
    const Y = yashanWorld();
    return { worlds: [D, Y.W], D, few, ...Y };
  },
  shots: {
    dusk({ t, k, S }) {
      const { D } = S;
      D.tick(t); D.look({ ...LOOKS.seaDusk, sunDir: [-0.4, 0.02, -1], glow: 0.5, fog: ['#5c4846', 0.0006], hemi: 0.3 });
      S.few.furl(1); S.few.lamps(0.8);
      S.few.pose(t, (i) => ({ x: -200 + i * 70 + (i % 2) * 20, z: -420 - (i % 3) * 90, heading: 0.4 + i * 0.13, scale: 0.75, moving: false }), { sea: D });
      D.track(k, { pos: [[0, [40, 9, 140]], [1, [30, 12, 180]]], at: [[0, [0, 8, -500]], [1, [0, 10, -500]]] }, 38);
      return { world: D, post: { exposure: 1.05, bloom: 0.85, bloomThreshold: 0.62, sat: 0.8 } };
    },
    // looking along the line from its eastern end: hulls recede into the haze, the hill behind
    chain({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.afternoon, sunDir: [0.4, 0.4, 0.8], fog: ['#8f948e', 0.0006] }, new THREE.Vector3(1200, 0, S.shoreZ + 170));
      S.song.furl(1); S.song.lamps(0); S.yuan.hide();
      poseLine(S, t);
      const ex = 1550, lz = S.shoreZ + 170;
      W.track(k, { pos: [[0, [ex + 60, 70, lz + 230]], [1, [ex + 20, 95, lz + 260]]], at: [[0, [ex - 520, 0, lz - 20]], [1, [ex - 620, 0, lz - 30]]] }, 40);
      return { world: W, post: { exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, sat: 0.75 } };
    },
  },
};
