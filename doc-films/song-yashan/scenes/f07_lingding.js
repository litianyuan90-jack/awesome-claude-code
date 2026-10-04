// 零丁洋：元军船队（深色帆）南下 → 船舱里，一盏油灯，桌上铺开的纸（笔迹不可读）。
import { THREE, LOOKS, rng } from '../film/kit.js';
import { seaWorld, tabletop } from '../film/worlds.js';
import { createFleet, formation } from '../film/sea.js';
import { createOilLamp, createPaper, paperGround } from '../film/props.js';

const SPEED = 3.0;

export default {
  setup() {
    const W = seaWorld({ name: '零丁洋', wind: 2.4, sea: { deep: '#102530', shallow: '#36575c', foam: 0.35, amp: 0.9, chop: 1 } });
    const fleet = createFleet(W.scene, 44, { length: 56, masts: 3, seed: 9, sail: '#4a3a30' });
    const slots = formation(44, { cols: 5, gapX: 140, gapZ: 170, seed: 31, scale: [0.65, 1] });

    const T = tabletop({ wood: '#3a2614' });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 3.5, 6), new THREE.MeshStandardMaterial({ color: '#21180f', side: THREE.BackSide, roughness: 1 }));
    walls.position.y = 1.0; T.scene.add(walls);
    T.scene.add(new THREE.AmbientLight('#3a3028', 0.7));
    const lamp = createOilLamp({ at: [-0.42, 0, -0.18], intensity: 2.2 }); T.scene.add(lamp);
    // a sheet with columns of brush marks — no readable characters
    const paper = createPaper({ w: 0.9, px: [1400, 1000], rotZ: -0.08, draw: (g, w, h) => {
      paperGround(g, w, h, { tone: '#d6c8a6', seed: 3 });
      const r = rng(19);
      for (let c = 0; c < 8; c++) {
        const x = w - 150 - c * 145;
        for (let y = 110; y < h - 140 - (c === 7 ? 400 : 0); y += 100) {
          g.fillStyle = `rgba(30,22,16,${0.55 + r() * 0.35})`;
          for (let s = 0; s < 4; s++) { g.save(); g.translate(x + (r() - 0.5) * 40, y + (r() - 0.5) * 30); g.rotate((r() - 0.5) * 1.2); g.fillRect(-28 + r() * 10, -6, 34 + r() * 26, 8 + r() * 6); g.restore(); }
        }
      }
    } });
    paper.position.set(0.05, 0.012, 0.02); T.scene.add(paper);
    return { worlds: [W, T], W, fleet, slots, T, lamp };
  },
  shots: {
    fleet({ t, k, S }) {
      const { W } = S;
      W.tick(t); W.look({ ...LOOKS.seaDawn, top: '#3a4656', horizon: '#b49a86', glow: 0.35, cloud: 0.7, fog: ['#a08c7e', 0.0004], sunDir: [-0.2, 0.12, -1] });
      const z0 = -SPEED * t;
      S.fleet.furl(0);
      S.fleet.pose(t, (i) => { const [ac, al, sc] = S.slots[i]; return { x: ac, z: z0 - 300 - al, heading: Math.PI, scale: sc }; }, { sea: W });
      W.track(k, { pos: [[0, [-160, 16, z0 + 260]], [1, [-120, 30, z0 + 300]]], at: [[0, [40, 12, z0 - 600]], [1, [30, 8, z0 - 700]]] }, 42, (x) => x);
      return { world: W, post: { exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, sat: 0.75 } };
    },
    desk({ t, k, S }) {
      S.lamp.userData.update(t);
      S.T.track(k, { pos: [[0, [0.15, 0.95, 0.75]], [1, [0.08, 0.75, 0.55]]], at: [[0, [0.0, 0, -0.02]], [1, [0.02, 0, -0.02]]] }, 34);
      return { world: S.T, post: { exposure: 1.1, bloom: 0.55, bloomThreshold: 0.8, sat: 0.85, vignette: 0.75 } };
    },
  },
};
