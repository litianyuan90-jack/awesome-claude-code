// 临安，1276 年 2 月的夜：城外远处是连片的营火；投降前夜，一小队人举着火把从城门悄悄出城。
import { THREE, LOOKS, fx, hash1, createColumn, polyPath } from '../film/kit.js';
import { flatWorld } from '../film/worlds.js';
import { addHouses } from '../film/props.js';
import { cityWall, ROBE } from './_lib.js';

const GROUND = { grass: '#24251f', grass2: '#2a2a22', rock: '#33302a', rock2: '#3a3630', sand: '#2e2b25' };

export default {
  setup() {
    const W = flatWorld({ name: '临安', size: [2600, 2600], palette: GROUND });
    W.scene.add(cityWall({ a: [-420, 0], b: [420, 0], gate: 10 }));
    W.scene.add(cityWall({ a: [-420, 0], b: [-420, -700], tower: false }));
    W.scene.add(cityWall({ a: [420, 0], b: [420, -700], tower: false }));
    addHouses(W.scene, 240, (i, r) => [-390 + (i % 24) * 33 + (r() - 0.5) * 8, 0, -40 - Math.floor(i / 24) * 30 - r() * 8, r() * 0.15], { wall: '#3a3631', roof: '#1c1e20' });
    // camp fires far out on the plain (the army is shown only as fire)
    const camps = [];
    for (let i = 0; i < 46; i++) camps.push([-900 + hash1(i) * 1800, 0.5, 260 + hash1(i + 50) * 520]);
    const fires = fx.fire(camps, { count: 1600, size: 12, originJitter: [12, 1, 12], rise: 8 });
    W.scene.add(fires);
    // lanterns along the wall top
    const lan = fx.fire([...Array(14)].map((_, i) => [-390 + i * 60, 12, 5]), { count: 160, size: 1.4, originJitter: [0.3, 0.2, 0.3], rise: 1.5, spread: 0.3 });
    W.scene.add(lan);
    const gateLight = new THREE.PointLight('#ffb35a', 0, 120, 1.6); gateLight.position.set(0, 9, 12); W.scene.add(gateLight);
    const col = createColumn(W.scene, 9, { torches: true, figure: ROBE });
    const path = polyPath([[0, -40], [0, 4], [-8, 50], [-60, 130], [-150, 240]], () => 0, 0.05);
    return { worlds: [W], W, fires, lan, gateLight, col, path };
  },
  shots: {
    // high over the plain: the dark city, and the camp fires all round it
    city({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.moon, fog: ['#1c2534', 0.0009], hemi: 0.75, sun: 1.1 });
      S.col.hide(); S.gateLight.intensity = 0;
      S.fires.visible = true; S.fires.userData.update(t);
      S.lan.visible = true; S.lan.userData.update(t);
      W.track(k, { pos: [[0, [180, 110, 900]], [1, [140, 95, 780]]], at: [[0, [0, 0, -40]], [1, [0, 0, -60]]] }, 40);
      return { world: W, post: { exposure: 1.25, bloom: 0.95, bloomThreshold: 0.55, sat: 0.8 } };
    },
    // at the gate: a few torches slip out into the dark
    gate({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.moon, fog: ['#1c2534', 0.0014], hemi: 0.7, sun: 0.9 });
      S.fires.visible = true; S.fires.userData.update(t);
      S.lan.visible = true; S.lan.userData.update(t);
      S.gateLight.intensity = 120 * (0.85 + 0.25 * hash1(Math.floor(t * 16)));
      S.col.pose(t, S.path, { head: 0.18 + lt * 1.3 / S.path.meters, spacing: 2.6, lanes: 1, speed: 7, pitch: 0.15 });
      W.track(k, { pos: [[0, [38, 7, 70]], [1, [30, 6, 85]]], at: [[0, [-6, 4, 0]], [1, [-14, 3, 30]]] }, 40);
      return { world: W, post: { exposure: 1.3, bloom: 1.0, bloomThreshold: 0.55, sat: 0.8 } };
    },
  },
};
