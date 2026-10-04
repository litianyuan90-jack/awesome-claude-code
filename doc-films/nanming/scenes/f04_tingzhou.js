// 汀州：雨夜的山谷，几支火把沿着溪边的小路往山里走。远景，不近看人。
import { THREE, LOOKS, fx, createColumn, polyPath } from '../film/kit.js';
import { valleyWorld } from '../film/worlds.js';
import { ROBE } from './_lib.js';

export default {
  setup() {
    const W = valleyWorld({ name: '汀州', seed: 33, floorHalf: 60, wall: { h: 320, hVar: 120, run: 200 }, palette: 'green',
      trees: { count: 14000, color: '#2a3c26', scale: [6, 12], minY: 6, maxY: 400, clear: (x, y, z) => x > 250 && Math.abs(z - 20 * Math.sin(x / 200)) < 120 } });
    const C = W.valley.center;
    const path = polyPath([...Array(12)].map((_, i) => { const x = -300 + i * 50; return [x, C(x) - 28 + Math.sin(i) * 6]; }), W.H, 0.05);
    const col = createColumn(W.scene, 14, { torches: true, figure: ROBE, scale: 1 });
    const rain = fx.rain({ count: 8000, wind: 0.5, opacity: 0.45 });
    const mist = fx.mist([0, 30, 0], [500, 20, 200], { count: 180, opacity: 0.18, colA: '#4a5250', colB: '#5a6260' });
    W.scene.add(rain, mist);
    return { worlds: [W], W, path, col, rain, mist };
  },
  shots: {
    rain({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); S.mist.userData.update(t);
      W.look({ ...LOOKS.night, top: '#141a20', horizon: '#2a3238', fog: ['#2a3338', 0.0008], hemi: 1.1, sun: 0.9 });
      S.col.pose(t, S.path, { head: 0.55 + lt * 1.2 / S.path.meters, spacing: 3.4, lanes: 1, speed: 6, pitch: 0.25 });
      const C = W.valley.center;
      W.track(k, { pos: [[0, [190, 20, C(190) - 10]], [1, [170, 22, C(170) - 10]]], at: [[0, [-20, 5, C(-20) - 25]], [1, [-50, 5, C(-50) - 25]]] }, 40);
      S.rain.position.copy(W.camera.position).add(new THREE.Vector3(0, -10, -60));
      S.rain.userData.update(t);
      return { world: W, post: { exposure: 1.5, bloom: 1.0, bloomThreshold: 0.55, sat: 0.6 } };
    },
  },
};
