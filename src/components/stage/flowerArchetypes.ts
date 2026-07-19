import type p5 from 'p5'
import type { FlowerType } from '../../types/catalog'

/**
 * Botanical archetypes for the hero's generative "specimen print".
 *
 * Each archetype pairs a catalog `FlowerType` with a species-legible ink palette
 * and a `draw` routine that renders the specimen into a low-resolution p5.Graphics
 * buffer (`flowerSketch.ts` then upscales that buffer into the dot-matrix print).
 *
 * Colours echo the catalog filter swatches (`src/lib/blossomSwatches.ts`) but are
 * tuned to stay legible as ink on the light plate (`#efefec`): pale species
 * (baby's-breath) use a warm-grey ink rather than white-on-light, and a few hues
 * are deepened slightly so they read at dot scale.
 */

/** Stem + foliage green, dark enough to read as ink on the light plate. */
export const STEM_INK = '#5E6B47'

/** Drawing context handed to each archetype. Coordinates are buffer pixels. */
export interface DrawCtx {
  g: p5.Graphics
  /** Buffer width / height in pixels. */
  w: number
  h: number
  /** Seeded RNG in [0, 1). */
  rnd: () => number
  /** Seeded float in [a, b). */
  range: (a: number, b: number) => number
  /** Seeded pick from a list. */
  pick: <T>(arr: T[]) => T
  /** Seeded coin flip, true with probability p. */
  chance: (p: number) => boolean
  /** Fill with a hex colour at alpha 0–255. */
  fill: (hex: string, alpha: number) => void
  /** The petal ink chosen for this specimen (one of the archetype's `inks`). */
  ink: string
}

export interface Archetype {
  id: string
  type: FlowerType
  /** Human label (English) — for the optional future specimen caption. */
  label: string
  /** Candidate petal ink hexes; one is chosen per specimen. */
  inks: string[]
  draw: (c: DrawCtx) => void
}

const TWO_PI = Math.PI * 2

// --- shared primitives -------------------------------------------------------

/** A curved stem from the base up to `topY`, with a couple of tapered leaves. */
function stem(c: DrawCtx, topY: number, lean: number) {
  const { g, w, h } = c
  const baseX = w * 0.5
  const baseY = h * 0.98
  const topX = w * 0.5 + lean
  const midX = w * 0.5 + lean * 0.4 + c.range(-2, 2)
  const midY = (baseY + topY) * 0.5

  g.noFill()
  g.stroke(94, 107, 71)
  g.strokeWeight(Math.max(1.4, w * 0.02))
  g.beginShape()
  g.vertex(baseX, baseY)
  g.quadraticVertex(midX, midY, topX, topY)
  g.endShape()
  g.noStroke()

  // 1–2 leaves along the lower stem
  const leaves = c.chance(0.5) ? 2 : 1
  for (let i = 0; i < leaves; i++) {
    const t = c.range(0.35, 0.7)
    const lx = baseX + (midX - baseX) * t + (topX - midX) * Math.max(0, t - 0.5)
    const ly = baseY + (topY - baseY) * t
    const dir = i % 2 === 0 ? -1 : 1
    const len = c.range(w * 0.16, w * 0.26)
    const wid = len * 0.32
    g.push()
    g.translate(lx, ly)
    g.rotate(dir * c.range(0.5, 0.9))
    c.fill(STEM_INK, 210)
    g.ellipse(dir * len * 0.5, 0, len, wid)
    g.pop()
  }
}

/** One tapered petal centred at the local origin, pointing along +x. */
function petal(c: DrawCtx, cx: number, cy: number, angle: number, len: number, wid: number, hex: string, a: number) {
  const { g } = c
  g.push()
  g.translate(cx, cy)
  g.rotate(angle)
  c.fill(hex, a)
  g.ellipse(len * 0.5, 0, len, wid)
  g.pop()
}

// --- archetypes --------------------------------------------------------------

const carnation: Archetype = {
  id: 'carnation',
  type: 'carnation',
  label: 'Carnation',
  inks: ['#A23B3B', '#C24A4A', '#D9739A', '#B23A54'],
  draw: (c) => {
    const { w, h } = c
    const cx = w * 0.5
    const cy = h * 0.34
    stem(c, cy + h * 0.06, c.range(-3, 3))
    // layered ruffle: several rings of short jagged petals, denser toward the core
    const rings = 5
    for (let r = rings; r >= 1; r--) {
      const rad = (r / rings) * w * 0.3
      const count = 8 + r * 3
      const a = 150 + (rings - r) * 20
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * TWO_PI + c.range(-0.2, 0.2) + r
        const px = cx + Math.cos(ang) * rad * 0.5
        const py = cy + Math.sin(ang) * rad * 0.5
        petal(c, px, py, ang, w * 0.14, w * 0.07, c.ink, a)
      }
    }
    // ruffled core
    c.fill(c.ink, 230)
    c.g.ellipse(cx, cy, w * 0.14, w * 0.14)
  },
}

const gerbera: Archetype = {
  id: 'gerbera',
  type: 'seasonal',
  label: 'Gerbera',
  inks: ['#D8A21F', '#C97A3D', '#D98A2B'],
  draw: (c) => {
    const { w, h, g } = c
    const cx = w * 0.5
    const cy = h * 0.33
    stem(c, cy + h * 0.05, c.range(-2, 2))
    // two offset rings of ray petals
    const count = 22 + Math.floor(c.range(0, 8))
    for (let ring = 0; ring < 2; ring++) {
      const rlen = w * (0.34 - ring * 0.06)
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * TWO_PI + ring * (Math.PI / count) + c.range(-0.05, 0.05)
        petal(c, cx, cy, ang, rlen, w * 0.045, c.ink, 200 - ring * 30)
      }
    }
    // dotted disc centre (darker)
    for (let i = 0; i < 60; i++) {
      const ang = c.range(0, TWO_PI)
      const rr = c.range(0, w * 0.1)
      c.fill('#6B4A1E', 220)
      g.ellipse(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, w * 0.02, w * 0.02)
    }
  },
}

const rose: Archetype = {
  id: 'rose',
  type: 'rose',
  label: 'Rose',
  inks: ['#A23B3B', '#C05A6E', '#B23A54'],
  draw: (c) => {
    const { w, h, g } = c
    const cx = w * 0.5
    const cy = h * 0.35
    stem(c, cy + h * 0.05, c.range(-3, 3))
    // phyllotaxis-packed curved petals spiralling out from the core
    const petals = 34
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = petals; i >= 0; i--) {
      const ang = i * golden
      const rad = Math.sqrt(i / petals) * w * 0.3
      const px = cx + Math.cos(ang) * rad
      const py = cy + Math.sin(ang) * rad
      const len = w * (0.1 + (1 - i / petals) * 0.08)
      const a = 150 + (1 - rad / (w * 0.3)) * 90
      petal(c, px, py, ang + Math.PI * 0.5, len, len * 0.7, c.ink, a)
    }
    c.fill(c.ink, 235)
    g.ellipse(cx, cy, w * 0.1, w * 0.1)
  },
}

const thistle: Archetype = {
  id: 'thistle',
  type: 'tropical',
  label: 'Eryngium',
  inks: ['#6E6FB0', '#8A7FC0', '#7C86B8'],
  draw: (c) => {
    const { w, h, g } = c
    const cx = w * 0.5
    const cy = h * 0.34
    stem(c, cy + h * 0.08, c.range(-2, 2))
    // domed pincushion head
    c.fill(c.ink, 180)
    g.ellipse(cx, cy, w * 0.26, w * 0.24)
    // fine radiating needles
    const spikes = 46
    g.strokeWeight(Math.max(1, w * 0.012))
    for (let i = 0; i < spikes; i++) {
      const ang = (i / spikes) * TWO_PI + c.range(-0.06, 0.06)
      const inner = w * 0.1
      const outer = w * 0.1 + c.range(w * 0.12, w * 0.22)
      const [r, gg, b] = hexToRgb(c.ink)
      g.stroke(r, gg, b, 210)
      g.line(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner, cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer)
    }
    g.noStroke()
    // spiky collar of bracts just below the head
    for (let i = 0; i < 9; i++) {
      const ang = Math.PI * 0.15 + (i / 8) * Math.PI * 0.7
      petal(c, cx, cy + w * 0.06, ang, w * 0.2, w * 0.05, STEM_INK, 200)
    }
  },
}

const babysbreath: Archetype = {
  id: 'babysbreath',
  type: 'filler',
  label: "Baby's Breath",
  inks: ['#79746A'],
  draw: (c) => {
    const { w, h, g } = c
    const baseX = w * 0.5
    const baseY = h * 0.96
    stem(c, h * 0.5, c.range(-2, 2))
    // recursive branching pedicels ending in tiny dot clusters
    const branch = (x: number, y: number, ang: number, len: number, depth: number) => {
      if (depth === 0 || len < w * 0.04) {
        // a little cluster of tiny blooms
        for (let i = 0; i < 5; i++) {
          c.fill(c.ink, c.range(140, 220))
          g.ellipse(x + c.range(-w * 0.03, w * 0.03), y + c.range(-w * 0.03, w * 0.03), w * 0.035, w * 0.035)
        }
        return
      }
      const ex = x + Math.cos(ang) * len
      const ey = y + Math.sin(ang) * len
      g.stroke(94, 107, 71, 150)
      g.strokeWeight(Math.max(0.8, w * 0.008))
      g.line(x, y, ex, ey)
      g.noStroke()
      const forks = 2 + (c.chance(0.4) ? 1 : 0)
      for (let i = 0; i < forks; i++) {
        branch(ex, ey, ang + c.range(-0.6, 0.6), len * c.range(0.5, 0.7), depth - 1)
      }
    }
    branch(baseX, baseY - h * 0.02, -Math.PI * 0.5, h * 0.22, 4)
  },
}

const eucalyptus: Archetype = {
  id: 'eucalyptus',
  type: 'greens-foliage',
  label: 'Eucalyptus',
  inks: [STEM_INK, '#63704C'],
  draw: (c) => {
    const { w, h, g } = c
    const baseX = w * 0.5
    const baseY = h * 0.97
    const topY = h * 0.08
    const lean = c.range(-4, 4)
    // gently curved main stem
    g.noFill()
    g.stroke(94, 107, 71)
    g.strokeWeight(Math.max(1.4, w * 0.02))
    g.beginShape()
    g.vertex(baseX, baseY)
    g.quadraticVertex(baseX + lean * 2, (baseY + topY) * 0.5, baseX + lean, topY)
    g.endShape()
    g.noStroke()
    // paired round leaves alternating up the stem
    const pairs = 7
    for (let i = 0; i < pairs; i++) {
      const t = i / (pairs - 1)
      const sx = baseX + lean * t
      const sy = baseY + (topY - baseY) * t
      const size = w * (0.22 - t * 0.09)
      for (const dir of [-1, 1]) {
        g.push()
        g.translate(sx, sy)
        g.rotate(dir * c.range(0.7, 1.0))
        c.fill(c.ink, 205)
        g.ellipse(dir * size * 0.5, 0, size, size * 0.82)
        g.pop()
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
    const { w, h, g } = c
    const cx = w * 0.5
    const cy = h * 0.33
    stem(c, cy + h * 0.08, c.range(-2, 2))
    // 6 recurved tepals
    const tepals = 6
    for (let i = 0; i < tepals; i++) {
      const ang = (i / tepals) * TWO_PI + c.range(-0.08, 0.08)
      petal(c, cx, cy, ang, w * 0.36, w * 0.12, c.ink, 200)
    }
    // pale throat + speckles
    c.fill('#F0D9E2', 210)
    g.ellipse(cx, cy, w * 0.14, w * 0.14)
    for (let i = 0; i < 24; i++) {
      const ang = c.range(0, TWO_PI)
      const rr = c.range(0, w * 0.16)
      c.fill('#8A3358', 220)
      g.ellipse(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, w * 0.02, w * 0.02)
    }
  },
}

const hydrangea: Archetype = {
  id: 'hydrangea',
  type: 'hydrangea',
  label: 'Hydrangea',
  inks: ['#8E7BB0', '#9A93B8', '#7FA07A'],
  draw: (c) => {
    const { w, h, g } = c
    const cx = w * 0.5
    const cy = h * 0.32
    stem(c, cy + h * 0.12, c.range(-2, 2))
    // mounded cluster of small 4-petal florets
    const florets = 26
    for (let i = 0; i < florets; i++) {
      const ang = c.range(0, TWO_PI)
      const rr = Math.sqrt(c.rnd()) * w * 0.28
      const fx = cx + Math.cos(ang) * rr
      const fy = cy + Math.sin(ang) * rr * 0.85
      const fs = w * 0.09
      const rot = c.range(0, TWO_PI)
      for (let p = 0; p < 4; p++) {
        petal(c, fx, fy, rot + (p / 4) * TWO_PI, fs, fs * 0.7, c.ink, 175)
      }
      c.fill('#EFE6C9', 200)
      g.ellipse(fx, fy, fs * 0.35, fs * 0.35)
    }
  },
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

/** Parse `#rrggbb` into [r, g, b]. Exported for the sketch's per-pixel work. */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
