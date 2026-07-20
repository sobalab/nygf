import type p5 from 'p5'
import { ARCHETYPES, hexToRgb, type DrawCtx, type Point3 } from './flowerArchetypes'

/**
 * p5 instance-mode sketch for the hero's generative specimen — a rotating 3D
 * point cloud rendered as a halftone print on the light plate.
 *
 * Per specimen: pick an archetype (shuffled, no repeat) + a species ink, seed a
 * PRNG, and build its 3D point cloud (points carry surface normals). Every frame
 * the cloud is rotated around the vertical axis (+ a fixed downward tilt),
 * perspective-projected, depth-sorted (painter's, far→near), and lit: each
 * point's normal is rotated too and shaded by lambert against a fixed light, so
 * lit faces lighten toward the plate and shadowed faces stay deep ink — giving
 * the bloom real volume and highlights that sweep across it as it turns, like
 * the reference. Draw-in / hold-shimmer / dissolve cycle one specimen at a time;
 * reduced-motion shows one static angled frame.
 *
 * Pure module — no React. Rendering is 2D canvas + hand-rolled 3D projection
 * (no WebGL, no extra deps). Observer teardown ties to p5's remove().
 */

const PLATE: [number, number, number] = [239, 239, 236] // #efefec, the light plate
const FOCAL = 3.2
const TILT = 0.42 // radians; positive tilts the tops back so we look DOWN into the blooms
const ROT_SPEED = 0.34 // radians / second
const FIXED_ANGLE = 0.6 // reduced-motion 3/4 view
const Y_TOP = 0.9
const Y_BOTTOM = -1.05

// fixed light in view space (upper-front-left); the flower rotates under it
const AMBIENT = 0.5
const DIFFUSE = 0.62
const LIGHT_LEN = Math.hypot(-0.35, 0.72, 0.6)
const LX = -0.35 / LIGHT_LEN
const LY = 0.72 / LIGHT_LEN
const LZ = 0.6 / LIGHT_LEN

const DUR = { in: 1600, hold: 4600, out: 1200 }

interface SPoint {
  x: number
  y: number
  z: number
  nx: number // surface normal
  ny: number
  nz: number
  r: number
  g: number
  b: number
  rev: number // reveal threshold 0..1 (lower = appears earlier)
  ph: number // shimmer phase
  sdx: number // dissolve scatter dir
  sdy: number
  sdz: number
  // per-frame scratch:
  sx: number
  sy: number
  persp: number
  depth: number
  light: number
}

export interface SketchControl {
  setPaused?: (paused: boolean) => void
}

export interface SketchOpts {
  reducedMotion: boolean
  container: HTMLElement
  control?: SketchControl
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export function createFlowerSketch({ reducedMotion, container, control }: SketchOpts) {
  return (p: p5) => {
    let points: SPoint[] = []
    let order: number[] = []
    let lastIdx = -1
    let state: 'in' | 'hold' | 'out' = 'in'
    let stateStart = 0
    let angle = FIXED_ANGLE
    let lastMs = 0
    let paused = false
    let userPaused = false
    let elapsedAtPause = 0
    let visible = true
    let ro: ResizeObserver | undefined
    let io: IntersectionObserver | undefined

    function buildSpecimen() {
      let idx = Math.floor(Math.random() * ARCHETYPES.length)
      if (ARCHETYPES.length > 1) while (idx === lastIdx) idx = Math.floor(Math.random() * ARCHETYPES.length)
      const arch = ARCHETYPES[idx]
      lastIdx = idx

      const rng = mulberry32(Math.floor(Math.random() * 0xffffffff))
      const range = (a: number, b: number) => a + (b - a) * rng()
      const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
      const ink = pick(arch.inks)

      const raw: Point3[] = []
      const ctx: DrawCtx = {
        rnd: rng,
        range,
        pick,
        chance: (pr: number) => rng() < pr,
        ink,
        emit: (pos, normal, hex, shade = 1) => {
          const [r, g, b] = hexToRgb(hex)
          const j = (0.9 + rng() * 0.2) * shade // per-point value jitter + gradient
          const nl = Math.hypot(normal[0], normal[1], normal[2]) || 1
          raw.push({
            x: pos[0],
            y: pos[1],
            z: pos[2],
            nx: normal[0] / nl,
            ny: normal[1] / nl,
            nz: normal[2] / nl,
            r: Math.min(255, r * j),
            g: Math.min(255, g * j),
            b: Math.min(255, b * j),
          })
        },
      }
      if (!reducedMotion) angle = 0
      arch.draw(ctx)

      points = raw.map((pt) => {
        // scatter outward from the vertical axis, drifting up (for dissolve)
        const m = Math.hypot(pt.x, pt.z) || 1
        return {
          ...pt,
          rev: clamp01((pt.y - Y_BOTTOM) / (Y_TOP - Y_BOTTOM)) * 0.72,
          ph: rng() * 1000,
          sdx: (pt.x / m) * (0.6 + rng() * 0.6),
          sdy: 0.3 + rng() * 0.6,
          sdz: (pt.z / m) * (0.6 + rng() * 0.6),
          sx: 0,
          sy: 0,
          persp: 1,
          depth: 0,
          light: 1,
        }
      })
      order = points.map((_, i) => i)
      state = 'in'
      stateStart = p.millis()
    }

    p.setup = () => {
      const w = container.clientWidth || 260
      const h = container.clientHeight || Math.round(w * 1.25)
      p.createCanvas(w, h)
      p.frameRate(reducedMotion ? 1 : 30)
      p.noiseSeed(7)
      lastMs = p.millis()
      buildSpecimen()

      if (control) control.setPaused = setUserPaused

      ro = new ResizeObserver(() => {
        const nw = container.clientWidth
        const nh = container.clientHeight
        if (nw > 0 && nh > 0) p.resizeCanvas(nw, nh)
      })
      ro.observe(container)

      if (!reducedMotion) {
        io = new IntersectionObserver(
          (entries) => {
            visible = entries[0]?.isIntersecting ?? true
            updateLoop()
          },
          { threshold: 0.01 },
        )
        io.observe(container)
        document.addEventListener('visibilitychange', updateLoop)
      }

      // Observer teardown on instance.remove(). registerMethod is a real runtime
      // API not on the @types/p5 instance, hence the cast. p5 frees its own
      // canvas; we only disconnect our observers/listeners.
      ;(p as unknown as { registerMethod: (hook: string, fn: () => void) => void }).registerMethod('remove', () => {
        ro?.disconnect()
        io?.disconnect()
        document.removeEventListener('visibilitychange', updateLoop)
      })

      if (reducedMotion) {
        angle = FIXED_ANGLE
        p.noLoop()
        p.redraw()
      }
    }

    function updateLoop() {
      if (reducedMotion) return
      const shouldRun = visible && !document.hidden && !userPaused
      if (shouldRun && paused) {
        paused = false
        stateStart = p.millis() - elapsedAtPause
        lastMs = p.millis()
        p.loop()
      } else if (!shouldRun && !paused) {
        paused = true
        elapsedAtPause = Math.min(p.millis() - stateStart, DUR[state])
        p.noLoop()
      }
    }

    function setUserPaused(v: boolean) {
      userPaused = v
      updateLoop()
    }

    p.draw = () => {
      const now = p.millis()
      const dt = Math.min(now - lastMs, 100) / 1000
      lastMs = now
      if (!reducedMotion) angle += ROT_SPEED * dt

      const phase = now - stateStart
      let inProg = 1
      let outProg = 0
      if (!reducedMotion) {
        if (state === 'in') {
          inProg = clamp01(phase / DUR.in)
          if (phase >= DUR.in) {
            state = 'hold'
            stateStart = now
          }
        } else if (state === 'hold') {
          if (phase >= DUR.hold) {
            state = 'out'
            stateStart = now
          }
        } else {
          outProg = clamp01(phase / DUR.out)
          if (phase >= DUR.out) {
            buildSpecimen()
            return
          }
        }
      }

      p.background(PLATE[0], PLATE[1], PLATE[2])

      const cw = p.width
      const ch = p.height
      const cx = cw / 2
      const cy = ch * 0.5
      const R = ch * 0.4
      const DOT = R * 0.026
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const cosT = Math.cos(TILT)
      const sinT = Math.sin(TILT)
      const t = now * 0.001

      // project every point
      for (const pt of points) {
        let bx = pt.x
        let by = pt.y
        let bz = pt.z
        if (state === 'out' && !reducedMotion) {
          bx += pt.sdx * outProg * 0.7
          by += pt.sdy * outProg * 0.5
          bz += pt.sdz * outProg * 0.7
        }
        const rx = bx * cosA + bz * sinA
        const rz = -bx * sinA + bz * cosA
        const ry = by * cosT - rz * sinT
        const rz2 = by * sinT + rz * cosT
        const persp = FOCAL / (FOCAL + rz2)
        pt.sx = cx + rx * persp * R
        pt.sy = cy - ry * persp * R
        pt.persp = persp
        pt.depth = rz2
        // rotate the surface normal the same way, then light it (lambert)
        const nrx = pt.nx * cosA + pt.nz * sinA
        const nrz = -pt.nx * sinA + pt.nz * cosA
        const nry = pt.ny * cosT - nrz * sinT
        const nrz2 = pt.ny * sinT + nrz * cosT
        pt.light = AMBIENT + DIFFUSE * Math.max(0, nrx * LX + nry * LY + nrz2 * LZ)
      }

      // painter's sort: far (large depth) first
      order.sort((a, b) => points[b].depth - points[a].depth)

      p.noStroke()
      for (const i of order) {
        const pt = points[i]
        let rv: number
        if (reducedMotion || state === 'hold') rv = 1
        else if (state === 'in') rv = clamp01((inProg - pt.rev) / 0.3)
        else rv = 1
        if (rv <= 0) continue

        // depth 0..1 (near = 1) from the perspective factor
        const m = clamp01((pt.persp - 0.78) / (1.32 - 0.78))
        const sh = reducedMotion ? 0 : p.noise(pt.x * 3 + 10, pt.y * 3, t * 0.6 + pt.ph) - 0.5

        // form shading: lit faces fade toward the plate, shadowed faces stay deep
        // ink; far points recede a little. Together this reads as a lit, volumetric
        // ink specimen rather than a flat colour fill.
        const formMix = clamp01((pt.light - AMBIENT) / DIFFUSE) * 0.42
        const depthMix = (1 - m) * 0.26
        const mix = Math.min(0.74, formMix + depthMix)

        let alpha = (0.55 + 0.4 * m) * 255
        let radius = DOT * pt.persp * (0.62 + 0.38 * m) * rv * (1 + sh * 0.3)
        if (state === 'out' && !reducedMotion) {
          alpha *= 1 - outProg
          radius *= 1 - outProg * 0.4
        }
        const cr = pt.r + (PLATE[0] - pt.r) * mix
        const cg = pt.g + (PLATE[1] - pt.g) * mix
        const cb = pt.b + (PLATE[2] - pt.b) * mix

        p.fill(cr, cg, cb, alpha * (0.35 + 0.65 * rv))
        p.circle(pt.sx, pt.sy, Math.max(0.6, radius * 2))
      }
    }
  }
}
