// Shared pieces for this film: a city wall with a gate tower, and the Yashan bay (shared by three frames).
import { THREE, rng } from '../film/kit.js';
import { coastWorld } from '../film/worlds.js';
import { createFleet } from '../film/sea.js';
import { createBuilding } from '../film/figures.js';

export const ROBE = { uniform: '#4a3e34', gear: '#2e261e', wrap: '#5a4c3c', rifle: false, pack: false, robe: true, hat: 'none' };
export const OFFICIAL = { uniform: '#5a2a22', gear: '#2e261e', wrap: '#3a2c24', rifle: false, pack: false, robe: true, hat: 'cap' };

// A straight rammed-earth wall from a to b ([x, z]); gate = gap width at the middle (0 = closed).
// y(x, z) gives the ground height. Returns the group; userData.top = wall-top height above ground.
export function cityWall({ a, b, h = 11, thick = 9, gate = 0, y = () => 0, color = '#4c4740', tower = true }) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 1 });
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, rot = -Math.atan2(dz, dx);
  const seg = 24, n = Math.ceil(L / seg);
  for (let i = 0; i < n; i++) {
    const s0 = i * seg, s1 = Math.min(L, s0 + seg), sm = (s0 + s1) / 2;
    if (gate && Math.abs(sm - L / 2) < gate / 2 + seg / 2 && Math.abs(sm - L / 2) < gate / 2) continue;
    const x = a[0] + ux * sm, z = a[1] + uz * sm, gy = y(x, z);
    const m = new THREE.Mesh(new THREE.BoxGeometry(s1 - s0 + 0.2, h + 4, thick), mat);
    m.position.set(x, gy + h / 2 - 2, z); m.rotation.y = rot; m.castShadow = m.receiveShadow = true; g.add(m);
    for (let c = 0; c < 4; c++) {                                  // crenels on the outer edge
      const cm = new THREE.Mesh(new THREE.BoxGeometry(3, 1.6, 1.2), mat);
      const sx = s0 + 3 + c * 6;
      cm.position.set(a[0] + ux * sx - uz * (thick / 2 - 0.6), gy + h + 0.8, a[1] + uz * sx + ux * (thick / 2 - 0.6)); cm.rotation.y = rot; g.add(cm);
    }
  }
  if (tower) {
    const x = a[0] + ux * L / 2, z = a[1] + uz * L / 2, gy = y(x, z);
    if (gate) {                                                   // lintel over the open gate
      const lt = new THREE.Mesh(new THREE.BoxGeometry(gate + 2, 4, thick + 1), mat);
      lt.position.set(x, gy + h - 2, z); lt.rotation.y = rot; g.add(lt);
    } else {
      const door = new THREE.Mesh(new THREE.BoxGeometry(8, 7.5, thick + 0.6), new THREE.MeshStandardMaterial({ color: '#2a1a12', roughness: 0.9 }));
      door.position.set(x, gy + 3.7, z); door.rotation.y = rot; g.add(door);
    }
    const tw = createBuilding({ w: 30, d: thick + 3, wallH: 5.5, roofH: 4.2, wall: '#5e2c22', roof: '#25262a', stories: 2 });
    tw.position.set(x, gy + h, z); tw.rotation.y = rot; g.add(tw);
  }
  g.userData.top = h;
  return g;
}

// ── 崖山: the bay. Land (with the hill) towards -z, sea towards +z. The Song line lies along x, a little offshore.
export const LINE_N = 200, LINE_GAP = 15;
export function yashanWorld({ seed = 1279 } = {}) {
  const W = coastWorld({ name: '崖山', seed, sea: { deep: '#14303a', shallow: '#3d6a66', foam: 0.12, amp: 0.35, chop: 0.8 }, wind: 1.1,
    bay: { width: 900, depth: 60 }, beach: [2.0, 35], flat: 40, hills: { h: 260, hVar: 120, run: 260, ridge: 0.9 }, size: [4800, 3400], palette: 'green',
    trees: { count: 16000, color: '#2f4a2c', scale: [6, 12], minY: 6, maxSlope: 1.8 } });
  const shoreZ = W.coast.shore(0);
  const song = createFleet(W.scene, LINE_N, { length: 52, masts: 3, seed: 3, lanterns: true });
  const r = rng(77);
  // 一字阵: hulls side by side, bows to the sea
  const line = [...Array(LINE_N)].map((_, i) => ({ x: (i - LINE_N / 2) * LINE_GAP + (r() - 0.5) * 2, z: shoreZ + 170 + (r() - 0.5) * 6, sc: 0.62 + r() * 0.12, hd: (r() - 0.5) * 0.05 }));
  const yuan = createFleet(W.scene, 60, { length: 56, masts: 3, seed: 9, sail: '#4a3a30' });
  return { W, song, line, yuan, shoreZ };
}
export function poseLine(S, t, { y = 0 } = {}) {
  S.song.pose(t, (i) => ({ x: S.line[i].x, z: S.line[i].z, heading: S.line[i].hd, scale: S.line[i].sc, moving: false }), { sea: S.W });
}
