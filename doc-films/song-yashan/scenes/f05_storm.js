// 井澳飓风：暗天、大浪、暴雨，船队被吹散，几道闪电照亮海面。
import { THREE, LOOKS, fx, hash1, smooth } from '../film/kit.js';
import { seaWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';

const STORM = { ...LOOKS.overcast, top: '#1f252b', horizon: '#3e464b', bottom: '#1a1d20', cloud: 0.95, cloudColor: '#2c3236', fog: ['#363e43', 0.0011], sun: 0.6, sunDir: [0.3, 0.6, 0.6], hemi: 0.55, waterLight: 0.6 };

export default {
  setup() {
    const W = seaWorld({ name: '井澳', wind: 0.9, sea: { deep: '#0d1c22', shallow: '#2c4446', foam: 0.95, amp: 2.4, chop: 1.6 } });
    const fleet = createFleet(W.scene, 16, { length: 52, masts: 3, seed: 11 });
    const rain = fx.rain({ count: 9000, wind: 1.4, opacity: 0.5 });
    W.scene.add(rain);
    return { worlds: [W], W, fleet, rain };
  },
  shots: {
    storm({ t, lt, k, cue, S }) {
      const { W } = S;
      W.tick(t);
      // lightning: two flashes, the first as the ships capsize, the second as the emperor falls
      const fl = (t0) => Math.max(0, 1 - Math.abs(lt - t0) / 0.12) * (0.6 + 0.4 * hash1(Math.floor(lt * 30)));
      const f = Math.max(fl(cue(1) + 0.3), fl(cue(2) + 0.2));
      W.look({ ...STORM, hemi: STORM.hemi + 2.6 * f, sun: STORM.sun + 2 * f, top: f > 0.2 ? '#6c7682' : STORM.top });
      S.fleet.furl(0.6);
      S.fleet.pose(t, (i) => {
        const a = hash1(i * 3.1) * 6.28, d = 70 + hash1(i * 7.7) * 380 + lt * 6;          // scattering outward
        return { x: Math.cos(a) * d, z: -300 + Math.sin(a) * d * 0.7, heading: a + 1.6 + Math.sin(t * 0.7 + i) * 0.4, scale: 0.65 + hash1(i) * 0.25 };
      }, { sea: W, sway: 2.2 });
      W.track(k, { pos: [[0, [0, 22, 420]], [1, [-30, 30, 380]]], at: [[0, [0, 6, -260]], [1, [-20, 4, -300]]] }, 44);
      S.rain.position.copy(W.camera.position).add(new THREE.Vector3(0, -10, -60));
      S.rain.userData.update(t);
      return { world: W, post: { exposure: 1.1 + 0.6 * f, bloom: 0.4, bloomThreshold: 0.85, sat: 0.55 } };
    },
  },
};
