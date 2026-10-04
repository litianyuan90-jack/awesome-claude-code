// 海上朝廷：灰色的天，船队沿着海岸往西（-x）缓缓行进。
import { LOOKS } from '../film/kit.js';
import { seaWorld } from '../film/worlds.js';
import { createFleet, formation } from '../film/sea.js';

const SPEED = 2.6, HD = -Math.PI / 2;

export default {
  setup() {
    const W = seaWorld({ name: '南海', wind: -1.2, sea: { deep: '#132a35', shallow: '#3a5e62', foam: 0.3, amp: 0.8, chop: 1 } });
    const fleet = createFleet(W.scene, 36, { length: 54, masts: 3, seed: 7 });
    const slots = formation(36, { cols: 4, gapX: 150, gapZ: 180, seed: 13, scale: [0.6, 0.95] });
    return { worlds: [W], W, fleet, slots };
  },
  shots: {
    fleet({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.seaDay, top: '#4c5864', horizon: '#a9b0b0', cloud: 0.8, cloudColor: '#9aa0a2', fog: ['#9fa7a8', 0.0004], sun: 1.4, sunDir: [0.5, 0.45, 0.6], hemi: 0.8 });
      const x0 = -SPEED * t;
      S.fleet.furl(0);
      S.fleet.pose(t, (i) => { const [ac, al, sc] = S.slots[i]; return { x: x0 - al, z: ac, heading: HD, scale: sc }; }, { sea: W });
      W.track(k, { pos: [[0, [x0 + 900, 45, 520]], [1, [x0 + 820, 60, 480]]], at: [[0, [x0 + 250, 8, 0]], [1, [x0 + 200, 6, 0]]] }, 42, (x) => x);
      return { world: W, post: { exposure: 1.0, bloom: 0.4, bloomThreshold: 0.88, sat: 0.72 } };
    },
  },
};
