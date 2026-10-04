// 东渡：清晨的海峡，一支大船队迎着日出向东（-z 为东方，太阳在前）；镜头从船队侧后升起。
import { LOOKS } from '../film/kit.js';
import { seaWorld } from '../film/worlds.js';
import { createFleet, formation } from '../film/sea.js';
import { createFlagPole } from '../film/props.js';

const SPEED = 3.0;

export default {
  setup() {
    const W = seaWorld({ name: '台湾海峡', wind: -1.6, sea: { deep: '#0d2735', shallow: '#2a6470', foam: 0.4, amp: 0.9, chop: 1 } });
    const fleet = createFleet(W.scene, 56, { length: 60, masts: 3, seed: 21 });
    const slots = formation(56, { cols: 6, gapX: 150, gapZ: 180, seed: 17, scale: [0.65, 1] });
    return { worlds: [W], W, fleet, slots };
  },
  shots: {
    fleet({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.seaDawn, sunDir: [0.35, 0.09, -1] });
      const z0 = -900 - SPEED * t;
      S.fleet.furl(0);
      S.fleet.pose(t, (i) => { const [ac, al, sc] = S.slots[i]; return { x: -ac, z: z0 - al, heading: Math.PI, scale: sc }; }, { sea: W });
      W.track(k, { pos: [[0, [-120, 20, z0 + 900]], [1, [-60, 110, z0 + 1080]]], at: [[0, [80, 14, z0 + 200]], [1, [80, 0, z0]]] }, 42);
      return { world: W, post: { exposure: 1.0, bloom: 0.5, bloomThreshold: 0.84, sat: 0.92 } };
    },
  },
};
