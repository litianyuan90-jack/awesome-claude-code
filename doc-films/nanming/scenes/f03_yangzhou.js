// 扬州 1645：夜里，城楼起火，城外炮火（只用火光表现，不出现人）→ 天亮后：城上的烟还没散。
import { THREE, LOOKS, fx, hash1, createBlasts } from '../film/kit.js';
import { flatWorld } from '../film/worlds.js';
import { addHouses } from '../film/props.js';
import { cityWall } from './_lib.js';

const GROUND = { grass: '#2c2a24', grass2: '#33302a', rock: '#3a362e', rock2: '#403b33', sand: '#36322a' };

export default {
  setup() {
    const W = flatWorld({ name: '扬州', size: [2400, 2400], palette: GROUND });
    W.scene.add(cityWall({ a: [-360, 0], b: [360, 0], h: 13, thick: 10, gate: 0 }));
    W.scene.add(cityWall({ a: [-360, 0], b: [-360, -600], tower: false, h: 13 }));
    W.scene.add(cityWall({ a: [360, 0], b: [360, -600], tower: false, h: 13 }));
    addHouses(W.scene, 200, (i, r) => [-330 + (i % 20) * 34 + (r() - 0.5) * 8, 0, -40 - Math.floor(i / 20) * 30 - r() * 8, r() * 0.15], { wall: '#3a3631', roof: '#1c1e20' });
    // the gate tower burns; a second fire further along the wall
    const firePts = [[0, 22, 0], [-8, 20, 2], [9, 21, -1], [-150, 14, 2], [190, 14, 1]];
    const fire = fx.fire(firePts, { count: 1800, size: 9, originJitter: [5, 2, 3], rise: 14 });
    const embers = fx.embers(firePts, { count: 260 });
    const smoke = fx.smoke(firePts.map(([x, y, z]) => [x, y + 12, z]), { count: 520, size: 34, rise: 110, opacity: 0.55, wind: 1.4 });
    W.scene.add(fire, embers, smoke);
    const glow = new THREE.PointLight('#ff8a3a', 0, 500, 1.5); glow.position.set(0, 30, 30); W.scene.add(glow);
    const blasts = createBlasts(W.scene, 6);
    const haze = fx.smoke([[-200, 20, -300], [100, 20, -400], [260, 20, -200]], { count: 300, size: 70, rise: 80, opacity: 0.35, wind: 1.0, colA: '#4a4642', colB: '#7a7672' });
    W.scene.add(haze);
    return { worlds: [W], W, fire, embers, smoke, glow, blasts, haze };
  },
  shots: {
    siege({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.night, fog: ['#1e1814', 0.0014], hemi: 0.45, ember: '#2a1206' });
      S.haze.visible = false;
      S.fire.visible = S.embers.visible = S.smoke.visible = true;
      S.fire.userData.update(t); S.embers.userData.update(t); S.smoke.userData.update(t);
      S.glow.intensity = 900 * (0.8 + 0.3 * hash1(Math.floor(t * 16)));
      // impacts on the wall face, spaced through the shot
      S.blasts.update(lt, [0.3, 1.1, 1.9, 2.5].map((t0, i) => ({ t0, pos: new THREE.Vector3(-260 + i * 150 + hash1(i) * 40, 6 + hash1(i + 3) * 6, 8), size: 6, water: false })));
      W.track(k, { pos: [[0, [120, 30, 300]], [1, [100, 26, 250]]], at: [[0, [-20, 14, 0]], [1, [-10, 15, 0]]] }, 40);
      return { world: W, post: { exposure: 1.2, bloom: 0.9, bloomThreshold: 0.6, sat: 0.8 } };
    },
    after({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.overcast, top: '#4c4c4c', horizon: '#8a8682', fog: ['#7a7672', 0.0016], sun: 0.7, hemi: 0.9 });
      S.fire.visible = S.embers.visible = false; S.glow.intensity = 0;
      S.blasts.update(0, []);
      S.smoke.visible = true; S.smoke.userData.update(t);
      S.haze.visible = true; S.haze.userData.update(t);
      W.track(k, { pos: [[0, [-200, 45, 380]], [1, [-180, 55, 420]]], at: [[0, [0, 20, -100]], [1, [0, 30, -120]]] }, 42);
      return { world: W, post: { exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, sat: 0.45 } };
    },
  },
};
