// 崖山之战：元军船从外海压进来，宋军船阵里火起烟起 → 空荡荡的海面，烟还在飘。远景，不出现人。
import { THREE, LOOKS, fx, hash1 } from '../film/kit.js';
import { seaWorld } from '../film/worlds.js';
import { yashanWorld, poseLine, LINE_N, LINE_GAP } from './_lib.js';

export default {
  setup() {
    const Y = yashanWorld();
    const lz = Y.shoreZ + 170;
    const pts = [...Array(14)].map((_, i) => [(-90 + i * 13 + hash1(i) * 6) * LINE_GAP / 1.0, 4, lz + (hash1(i + 9) - 0.5) * 10]);
    const fire = fx.fire(pts, { count: 2200, size: 22, originJitter: [14, 3, 10], rise: 18 });
    const smoke = fx.smoke(pts.map(([x, y, z]) => [x, y + 10, z]), { count: 700, size: 55, rise: 90, opacity: 0.6, wind: 2.5 });
    Y.W.scene.add(fire, smoke);
    const glow = new THREE.PointLight('#ff8a3a', 0, 900, 1.4); glow.position.set(0, 30, lz); Y.W.scene.add(glow);

    const E = seaWorld({ name: '空海', wind: -1.6, sea: { deep: '#111c22', shallow: '#33464a', foam: 0.15, amp: 0.6, chop: 0.8 } });
    return { worlds: [Y.W, E], ...Y, fire, smoke, glow, E, lz };
  },
  shots: {
    attack({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.dusk, sunDir: [-0.6, 0.12, 0.6], fog: ['#5a4a44', 0.0007], hemi: 0.45 }, new THREE.Vector3(0, 0, S.lz));
      S.song.furl(1); S.song.lamps(0);
      poseLine(S, t);
      S.yuan.furl(0);
      S.yuan.pose(t, (i) => {
        const a = (i - 30) / 30, x = a * 1500, z = S.lz + 700 - lt * 40 - (1 - Math.abs(a)) * 120;
        return { x, z, heading: Math.PI + a * 0.25, scale: 0.75 };
      }, { sea: W });
      S.fire.visible = S.smoke.visible = true; S.fire.userData.update(t); S.smoke.userData.update(t);
      S.glow.intensity = 1200 * (0.8 + 0.3 * hash1(Math.floor(t * 14)));
      W.track(k, { pos: [[0, [520, 120, S.lz + 620]], [1, [440, 100, S.lz + 540]]], at: [[0, [-120, 10, S.lz]], [1, [-150, 10, S.lz]]] }, 42);
      return { world: W, post: { exposure: 1.05, bloom: 0.8, bloomThreshold: 0.62, sat: 0.75 } };
    },
    // the sea afterwards: grey water, drifting smoke, nothing else
    sea({ t, k, S }) {
      const { E } = S;
      E.tick(t); E.look({ ...LOOKS.seaDusk, sunDir: [-0.3, 0.03, -1], glow: 0.35, cloud: 0.8, cloudColor: '#4e4448', fog: ['#5a4c4c', 0.0006], hemi: 0.3, waterLight: 0.6 });
      E.track(k, { pos: [[0, [0, 6, 300]], [1, [0, 10, 340]]], at: [[0, [40, 6, -600]], [1, [40, 9, -600]]] }, 36);
      return { world: E, post: { exposure: 0.95, bloom: 0.5, bloomThreshold: 0.8, sat: 0.6 } };
    },
  },
};
