// 福州即位：清晨的殿前广场，百官成列面向大殿；镜头从队列后缓缓推向殿门。
import { THREE, LOOKS, createCrowd, fx } from '../film/kit.js';
import { flatWorld } from '../film/worlds.js';
import { createFlagPole } from '../film/props.js';
import { createBuilding } from '../film/figures.js';
import { OFFICIAL } from './_lib.js';

const GROUND = { grass: '#6d665a', grass2: '#746c60', rock: '#7a7266', rock2: '#80786a', sand: '#6f675b' };

export default {
  setup() {
    const W = flatWorld({ name: '福州', size: [1400, 1400], palette: GROUND });
    const hall = createBuilding({ w: 44, d: 20, wallH: 9, roofH: 7.5, wall: '#6e2a1f', roof: '#2b2c2f', stories: 2, base: { w: 52, h: 3.2, d: 28, color: '#8c867a' } });
    hall.position.set(0, 0, -70); W.scene.add(hall);
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {                  // side halls
      const b = createBuilding({ w: 26, d: 11, wallH: 5.5, roofH: 4, wall: '#5e2a20', roof: '#2a2b2e' });
      b.position.set(sx * 62, 0, -30 + i * 38); b.rotation.y = Math.PI / 2; W.scene.add(b);
    }
    // officials in ranks facing the hall (-z)
    createCrowd(W.scene, 150, (i, r) => [((i % 15) - 7) * 3.2 + (r() - 0.5) * 0.3, 0, -20 + Math.floor(i / 15) * 4.2 + (r() - 0.5) * 0.3, Math.PI + (r() - 0.5) * 0.08], { seed: 11, pitch: 0.06, figure: OFFICIAL });
    const flags = [];
    for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) {
      const f = createFlagPole(12, '#c9a23f', 2.4, 4.0); f.position.set(sx * 34, 0, -40 + i * 16); f.rotation.y = sx > 0 ? Math.PI : 0; W.scene.add(f); flags.push(f);
    }
    const mist = fx.mist([0, 2, -20], [260, 2, 220], { count: 120, opacity: 0.12 });
    W.scene.add(mist);
    return { worlds: [W], W, flags, mist };
  },
  shots: {
    court({ t, k, S }) {
      const { W } = S;
      W.tick(t); S.mist.userData.update(t);
      W.look({ ...LOOKS.morning, sunDir: [0.5, 0.35, 0.8], fog: ['#b7b6ac', 0.0022] }, new THREE.Vector3(0, 0, -40));
      S.flags.forEach((f) => f.userData.update(t, 0.35));
      W.track(k, { pos: [[0, [6, 9, 40]], [1, [4, 8, 24]]], at: [[0, [0, 9, -70]], [1, [0, 10, -70]]] }, 40);
      return { world: W, post: { exposure: 1.05, bloom: 0.45, bloomThreshold: 0.85, sat: 0.8 } };
    },
  },
};
