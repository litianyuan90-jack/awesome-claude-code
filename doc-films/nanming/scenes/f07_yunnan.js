// 入缅：雨雾里的南方密林山谷，一小队人沿溪向西南走去，越走越远。
import { THREE, LOOKS, fx, createColumn, polyPath } from '../film/kit.js';
import { valleyWorld } from '../film/worlds.js';
import { ROBE } from './_lib.js';

export default {
  setup() {
    const W = valleyWorld({ name: '滇西', seed: 71, floorHalf: 80, wall: { h: 420, hVar: 160, run: 240 }, palette: 'lush', snowLine: 9999,
      trees: [{ count: 18000, color: '#264a2a', scale: [7, 14], minY: 5, maxY: 600, clear: (x, y, z) => x > 280 && Math.abs(z - 20 * Math.sin(x / 200)) < 140 }, { shape: 'palm', count: 900, scale: [7, 11], minY: 3, maxY: 30 }] });
    const C = W.valley.center;
    const path = polyPath([...Array(14)].map((_, i) => { const x = 200 - i * 45; return [x, C(x) + 30]; }), W.H, 0.05);
    const col = createColumn(W.scene, 30, { figure: ROBE });
    const rain = fx.rain({ count: 6000, wind: 0.3, opacity: 0.35 });
    const mist = fx.mist([0, 40, 0], [700, 30, 300], { count: 260, opacity: 0.24 });
    W.scene.add(rain, mist);
    return { worlds: [W], W, path, col, rain, mist };
  },
  shots: {
    jungle({ t, lt, k, S }) {
      const { W } = S;
      W.tick(t); S.mist.userData.update(t);
      W.look({ ...LOOKS.overcast, top: '#5c6266', horizon: '#9aa09c', fog: ['#8e9692', 0.0024], hemi: 1.0, sun: 0.7 });
      S.col.pose(t, S.path, { head: 0.42 + lt * 1.2 / S.path.meters, spacing: 3.0, lanes: 1, speed: 6, pitch: 0.2 });
      const C = W.valley.center;
      W.track(k, { pos: [[0, [430, 40, C(430)]], [1, [410, 46, C(410)]]], at: [[0, [0, 10, C(0) + 25]], [1, [-40, 8, C(-40) + 25]]] }, 40);
      S.rain.position.copy(W.camera.position).add(new THREE.Vector3(0, -10, -60));
      S.rain.userData.update(t);
      return { world: W, post: { exposure: 1.05, bloom: 0.35, bloomThreshold: 0.9, sat: 0.6 } };
    },
  },
};
