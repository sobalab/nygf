import type { FlowerType } from '../../types/catalog'

/**
 * Botanical archetypes for the hero's generative specimen — 3D point clouds with
 * per-point surface normals. Each archetype emits points (petals sampled as 3D
 * surfaces, volumetric blooms, 3D stems/leaves) via `ctx.emit(pos, normal, hex)`;
 * `flowerSketch.ts` rotates them, perspective-projects, depth-sorts, and lights
 * each point (lambert against a fixed source) so the flower has highlights and
 * shadow and reads as a dimensional, lifelike specimen as it turns.
 *
 * Space: y is up. Stem base near y=-1.05, blooms around y=+0.5, x/z within ~±0.7.
 * Normals point out of the surface (used for shading). Petals also carry a
 * base→tip brightness gradient. Colours echo the catalog swatches, tuned to read
 * as ink on the light plate; pale species use a warm-grey ink.
 */

export const STEM_INK = '#5E6B47'

export interface Point3 {
  x: number
  y: number
  z: number
  nx: number
  ny: number
  nz: number
  r: number
  g: number
  b: number
}

type Vec3 = [number, number, number]

export interface DrawCtx {
  rnd: () => number
  range: (a: number, b: number) => number
  pick: <T>(arr: T[]) => T
  chance: (p: number) => boolean
  ink: string
  /** Emit a point: world position, surface normal, colour hex, optional brightness. */
  emit: (pos: Vec3, normal: Vec3, hex: string, shade?: number) => void
}

const TWO_PI = Math.PI * 2

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
function norm(a: Vec3): Vec3 {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

// --- shared 3D primitives ----------------------------------------------------

/** Curved stem (a thin cylinder of points) from the base up to `top`, + leaves. */
function stem(c: DrawCtx, top: Vec3) {
  const base: Vec3 = [0, -1.05, 0]
  const mid: Vec3 = [(base[0] + top[0]) * 0.5 + c.range(-0.05, 0.05), (base[1] + top[1]) * 0.5, (base[2] + top[2]) * 0.5]
  const n = 90
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const cx = (1 - t) * (1 - t) * base[0] + 2 * (1 - t) * t * mid[0] + t * t * top[0]
    const cy = (1 - t) * (1 - t) * base[1] + 2 * (1 - t) * t * mid[1] + t * t * top[1]
    const cz = (1 - t) * (1 - t) * base[2] + 2 * (1 - t) * t * mid[2] + t * t * top[2]
    // a few points around the stem's circumference so it reads as a lit cylinder
    const ring = 3
    for (let k = 0; k < ring; k++) {
      const a = (k / ring) * TWO_PI + t * 4
      const dx = Math.cos(a) * 0.016
      const dz = Math.sin(a) * 0.016
      c.emit([cx + dx, cy, cz + dz], [dx, 0.15, dz], STEM_INK, 0.9)
    }
  }
  const leaves = c.chance(0.6) ? 2 : 1
  for (let i = 0; i < leaves; i++) {
    const t = c.range(0.3, 0.6)
    const at: Vec3 = [base[0] + (top[0] - base[0]) * t, base[1] + (top[1] - base[1]) * t, base[2] + (top[2] - base[2]) * t]
    leaf(c, at, c.range(0, TWO_PI), c.range(0.28, 0.42))
  }
}

/** A tapered leaf blade angled outward and slightly down from `at`. */
function leaf(c: DrawCtx, at: Vec3, theta: number, len: number) {
  const dir: Vec3 = norm([Math.cos(theta), -0.3, Math.sin(theta)])
  const side: Vec3 = norm([-Math.sin(theta), 0, Math.cos(theta)])
  const face = norm(cross(dir, side))
  const count = 46
  for (let k = 0; k < count; k++) {
    const u = c.rnd()
    const halfW = len * 0.17 * Math.sin(Math.PI * (0.1 + 0.9 * u)) * (1 - 0.2 * u)
    const v = (c.rnd() * 2 - 1) * halfW
    const cup = 0.05 * Math.sin(u * Math.PI)
    const pos = add(add(add(at, scale(dir, u * len)), scale(side, v)), scale(face, cup))
    const nrm = norm(add(face, scale(side, -(v / (halfW || 1)) * 0.3)))
    c.emit(pos, nrm, STEM_INK, 0.82 + 0.3 * u)
  }
}

/**
 * A petal sampled as a 3D surface with a fuller, rounded profile, cupped across
 * its width, carrying a base→tip brightness gradient. `curl` bends it up (+) or
 * recurves the tip (−). `phi` is elevation, `theta` the angle around the stem.
 */
function petal(
  c: DrawCtx,
  center: Vec3,
  theta: number,
  phi: number,
  len: number,
  wid: number,
  curl: number,
  hex: string,
  count = 40,
) {
  const dir: Vec3 = [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)]
  const side: Vec3 = [-Math.sin(theta), 0, Math.cos(theta)]
  const face = norm(cross(dir, side))
  for (let k = 0; k < count; k++) {
    const u = c.rnd()
    const halfW = wid * Math.pow(Math.sin(Math.PI * (0.08 + 0.92 * u)), 0.7) * (1 - 0.12 * u)
    const v = (c.rnd() * 2 - 1) * halfW
    const bend = curl * Math.sin(u * Math.PI * 0.9)
    const pos = add(add(add(center, scale(dir, u * len)), scale(side, v)), scale(face, bend))
    // cupped normal: tilt toward the petal centreline across the width
    const nrm = norm(add(face, scale(side, -(v / (halfW || 1e-3)) * 0.32)))
    c.emit(pos, nrm, hex, 0.72 + 0.44 * u)
  }
}

/** Points on a (possibly squashed) sphere surface; normals point outward. */
function shell(c: DrawCtx, center: Vec3, radius: number, yScale: number, hex: string, count: number) {
  for (let k = 0; k < count; k++) {
    const u = c.rnd() * 2 - 1
    const t = c.rnd() * TWO_PI
    const rr = Math.sqrt(1 - u * u)
    const dir: Vec3 = [rr * Math.cos(t), u * yScale, rr * Math.sin(t)]
    const pos = add(center, [dir[0] * radius, dir[1] * radius, dir[2] * radius])
    c.emit(pos, dir, hex, 0.8 + 0.3 * (u * 0.5 + 0.5))
  }
}

/** A line of points (a spike / needle) from `base` along `dir`; normal = dir. */
function spike(c: DrawCtx, base: Vec3, dir: Vec3, len: number, hex: string, count = 7) {
  const d = norm(dir)
  for (let k = 0; k < count; k++) {
    const u = k / (count - 1)
    c.emit([base[0] + d[0] * len * u, base[1] + d[1] * len * u, base[2] + d[2] * len * u], d, hex, 0.8 + 0.35 * u)
  }
}

// --- archetypes --------------------------------------------------------------

const BLOOM_Y = 0.5

const carnation: Archetype = {
  id: 'carnation',
  type: 'carnation',
  label: 'Carnation',
  inks: ['#A23B3B', '#C24A4A', '#D9739A', '#B23A54'],
  draw: (c) => {
    const center: Vec3 = [0, BLOOM_Y, 0]
    stem(c, [0, BLOOM_Y - 0.12, 0])
    const rings = 6
    for (let r = 0; r < rings; r++) {
      const t = r / (rings - 1)
      const phi = 1.25 - t * 1.1
      const count = 6 + r * 4
      const len = 0.28 + t * 0.16
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * TWO_PI + c.range(-0.25, 0.25) + r * 1.3
        petal(c, center, theta, phi + c.range(-0.12, 0.12), len, 0.13, 0.08 - t * 0.16, c.ink, 34)
      }
    }
  },
}

const gerbera: Archetype = {
  id: 'gerbera',
  type: 'seasonal',
  label: 'Gerbera',
  inks: ['#D8A21F', '#C97A3D', '#D98A2B'],
  draw: (c) => {
    const center: Vec3 = [0, BLOOM_Y, 0]
    stem(c, [0, BLOOM_Y - 0.08, 0])
    for (let ring = 0; ring < 2; ring++) {
      const count = 26
      const phi = 0.34 - ring * 0.06 // shallow bowl so it reads from above
      const len = 0.46 - ring * 0.08
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * TWO_PI + ring * (Math.PI / count)
        petal(c, center, theta, phi + c.range(-0.03, 0.03), len, 0.055, 0.06, c.ink, 26)
      }
    }
    shell(c, center, 0.12, 0.35, '#6B4A1E', 150) // dotted disc
  },
}

const rose: Archetype = {
  id: 'rose',
  type: 'rose',
  label: 'Rose',
  inks: ['#A23B3B', '#C05A6E', '#B23A54'],
  draw: (c) => {
    const center: Vec3 = [0, BLOOM_Y, 0]
    stem(c, [0, BLOOM_Y - 0.14, 0])
    const petals = 46
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < petals; i++) {
      const t = i / petals
      const theta = i * golden
      const phi = 1.4 - t * 1.2
      const len = 0.15 + t * 0.15
      petal(c, center, theta, phi, len, 0.12, 0.16 - t * 0.26, c.ink, 30)
    }
  },
}

const thistle: Archetype = {
  id: 'thistle',
  type: 'tropical',
  label: 'Eryngium',
  inks: ['#6E6FB0', '#8A7FC0', '#7C86B8'],
  draw: (c) => {
    const center: Vec3 = [0, BLOOM_Y, 0]
    stem(c, [0, BLOOM_Y - 0.14, 0])
    shell(c, center, 0.16, 1.1, c.ink, 260) // domed pincushion head
    const spikes = 120
    for (let i = 0; i < spikes; i++) {
      const u = c.rnd() * 2 - 1
      const t = c.rnd() * TWO_PI
      const rr = Math.sqrt(1 - u * u)
      const dir: Vec3 = [rr * Math.cos(t), u * 1.1, rr * Math.sin(t)]
      const surf = add(center, scale(norm(dir), 0.16))
      spike(c, surf, dir, c.range(0.12, 0.22), c.ink, 7)
    }
    for (let i = 0; i < 10; i++) {
      const theta = (i / 10) * TWO_PI
      petal(c, [0, BLOOM_Y - 0.08, 0], theta, -0.15, 0.22, 0.05, 0, STEM_INK, 16)
    }
  },
}

const babysbreath: Archetype = {
  id: 'babysbreath',
  type: 'filler',
  label: "Baby's Breath",
  inks: ['#79746A'],
  draw: (c) => {
    stem(c, [0, -0.35, 0])
    const branch = (at: Vec3, dir: Vec3, len: number, depth: number) => {
      if (depth === 0 || len < 0.06) {
        // a little bloom cluster: tiny domed shell so it catches light
        shell(c, at, 0.05, 1, c.ink, 14)
        return
      }
      const end = add(at, scale(norm(dir), len))
      const steps = 6
      for (let s = 1; s <= steps; s++) {
        const f = s / steps
        c.emit(
          [at[0] + (end[0] - at[0]) * f, at[1] + (end[1] - at[1]) * f, at[2] + (end[2] - at[2]) * f],
          [dir[0], 0.3, dir[2]],
          STEM_INK,
          0.9,
        )
      }
      const forks = 2 + (c.chance(0.5) ? 1 : 0)
      for (let i = 0; i < forks; i++) {
        branch(end, [dir[0] + c.range(-0.6, 0.6), dir[1] + c.range(-0.15, 0.4), dir[2] + c.range(-0.6, 0.6)], len * c.range(0.6, 0.75), depth - 1)
      }
    }
    for (let i = 0; i < 3; i++) {
      const th = (i / 3) * TWO_PI + c.range(-0.3, 0.3)
      branch([0, -0.35, 0], [Math.cos(th) * 0.35, 1, Math.sin(th) * 0.35], 0.5, 4)
    }
  },
}

const eucalyptus: Archetype = {
  id: 'eucalyptus',
  type: 'greens-foliage',
  label: 'Eucalyptus',
  inks: [STEM_INK, '#63704C'],
  draw: (c) => {
    const base: Vec3 = [0, -1.0, 0]
    const top: Vec3 = [c.range(-0.1, 0.1), 0.9, c.range(-0.1, 0.1)]
    stem(c, top)
    const pairs = 8
    for (let i = 0; i < pairs; i++) {
      const t = i / (pairs - 1)
      const at: Vec3 = [base[0] + (top[0] - base[0]) * t, base[1] + (top[1] - base[1]) * t, base[2] + (top[2] - base[2]) * t]
      const baseTheta = i * 1.4
      const size = 0.24 - t * 0.09
      for (const off of [0, Math.PI]) {
        const theta = baseTheta + off
        const d: Vec3 = norm([Math.cos(theta), 0.28, Math.sin(theta)])
        const side = norm(cross(d, [0, 1, 0]))
        const face = norm(cross(d, side))
        for (let k = 0; k < 40; k++) {
          const u = c.rnd()
          const halfW = size * 0.5 * Math.sin(Math.PI * u)
          const v = (c.rnd() * 2 - 1) * halfW
          const pos = add(add(at, scale(d, u * size)), scale(side, v))
          const nrm = norm(add(face, scale(side, -(v / (halfW || 1e-3)) * 0.3)))
          c.emit(pos, nrm, c.ink, 0.8 + 0.3 * u)
        }
      }
    }
  },
}

const lily: Archetype = {
  id: 'lily',
  type: 'lily',
  label: 'Lily',
  inks: ['#D9739A', '#C98BA8', '#B65C86'],
  draw: (c) => {
    const center: Vec3 = [0, BLOOM_Y, 0]
    stem(c, [0, BLOOM_Y - 0.16, 0])
    const tepals = 6
    for (let i = 0; i < tepals; i++) {
      const theta = (i / tepals) * TWO_PI + c.range(-0.05, 0.05)
      petal(c, center, theta, 0.4, 0.5, 0.14, -0.26, c.ink, 46) // recurved trumpet
    }
    shell(c, center, 0.08, 1, '#F0D9E2', 40) // pale throat
    for (let i = 0; i < 24; i++) shell(c, center, c.range(0.05, 0.18), 1, '#8A3358', 1) // speckles
  },
}

const hydrangea: Archetype = {
  id: 'hydrangea',
  type: 'hydrangea',
  label: 'Hydrangea',
  inks: ['#8E7BB0', '#9A93B8', '#7FA07A'],
  draw: (c) => {
    const center: Vec3 = [0, BLOOM_Y, 0]
    stem(c, [0, BLOOM_Y - 0.2, 0])
    const florets = 40
    for (let f = 0; f < florets; f++) {
      const u = c.rnd()
      const t = c.rnd() * TWO_PI
      const rr = Math.sqrt(1 - u * u)
      const dir: Vec3 = norm([rr * Math.cos(t), u * 0.9 + 0.25, rr * Math.sin(t)])
      const fc = add(center, scale(dir, 0.3))
      for (let pl = 0; pl < 4; pl++) {
        const theta = (pl / 4) * TWO_PI + t
        petal(c, fc, theta, 0.25, 0.1, 0.05, 0.02, c.ink, 9)
      }
      c.emit(fc, dir, '#EFE6C9', 1.05)
    }
  },
}

export interface Archetype {
  id: string
  type: FlowerType
  label: string
  inks: string[]
  draw: (c: DrawCtx) => void
}

export const ARCHETYPES: Archetype[] = [
  carnation,
  gerbera,
  rose,
  thistle,
  babysbreath,
  eucalyptus,
  lily,
  hydrangea,
]

export { hexToRgb }
