import type p5 from 'p5'
import { ARCHETYPES, hexToRgb, type DrawCtx } from './flowerArchetypes'

/**
 * p5 instance-mode sketch for the hero's generative "specimen print".
 *
 * Pipeline per specimen:
 *  1. Pick an archetype (shuffled, no immediate repeat) + a species ink, seed a
 *     small PRNG, and draw the flower once into a low-res p5.Graphics buffer.
 *  2. Read the buffer's pixels into a dot list.
 *  3. Every frame, stamp each dot as an ink circle on the light plate — the
 *     dot-matrix / halftone print. Reveal (draw-in), shimmer (hold), and scatter
 *     (dissolve) are computed per dot; then the next specimen is built.
 *
 * No glow/bloom: this reads as ink on the light plate, not a phosphor screen.
 * Reduced-motion renders one fully-formed static print and stops the loop.
 *
 * Pure module — no React. Observer cleanup is tied to p5's `remove()` via
 * `registerMethod('remove', …)`, so the Hero's `instance.remove()` tears
 * everything down.
 */

const BUF_W = 104
const BUF_H = 130
const PLATE: [number, number, number] = [239, 239, 236] // #efefec, the light plate

const DUR = { in: 1500, hold: 4200, out: 1100 }

interface Dot {
  nx: number // normalized position 0..1
  ny: number
  r: number
  g: number
  b: number
  cov: number // coverage / density 0..1
  jx: number // constant per-dot jitter for scatter + print feel
  jy: number
  ph: number // shimmer phase offset
  rev: number // reveal threshold 0..1 (lower = appears earlier)
}

/** Imperative control surface the sketch populates so React can drive it. */
export interface SketchControl {
  /** Pause/resume the animation from a user action (survives visibility changes). */
  setPaused?: (paused: boolean) => void
}

export interface SketchOpts {
  reducedMotion: boolean
  container: HTMLElement
  /** Populated in setup() with the live control handle. */
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
    let buffer: p5.Graphics
    let dots: Dot[] = []
    let lastIdx = -1
    let state: 'in' | 'hold' | 'out' = 'in'
    let stateStart = 0
    let paused = false
    let userPaused = false
    let elapsedAtPause = 0
    let visible = true
    let ro: ResizeObserver | undefined
    let io: IntersectionObserver | undefined

    function buildSpecimen() {
      let idx = Math.floor(Math.random() * ARCHETYPES.length)
      if (ARCHETYPES.length > 1) {
        while (idx === lastIdx) idx = Math.floor(Math.random() * ARCHETYPES.length)
      }
      const arch = ARCHETYPES[idx]
      lastIdx = idx

      const rng = mulberry32(Math.floor(Math.random() * 0xffffffff))
      const range = (a: number, b: number) => a + (b - a) * rng()
      const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
      const ink = pick(arch.inks)

      const ctx: DrawCtx = {
        g: buffer,
        w: BUF_W,
        h: BUF_H,
        rnd: rng,
        range,
        pick,
        chance: (pr: number) => rng() < pr,
        fill: (hex, alpha) => {
          const [r, g, b] = hexToRgb(hex)
          buffer.fill(r, g, b, alpha)
        },
        ink,
      }

      buffer.clear()
      buffer.push()
      buffer.noStroke()
      arch.draw(ctx)
      buffer.pop()

      buffer.loadPixels()
      const px = buffer.pixels
      const next: Dot[] = []
      for (let y = 0; y < BUF_H; y++) {
        for (let x = 0; x < BUF_W; x++) {
          const i = 4 * (y * BUF_W + x)
          const a = px[i + 3]
          if (a < 40) continue
          const ny = (y + 0.5) / BUF_H
          next.push({
            nx: (x + 0.5) / BUF_W,
            ny,
            r: px[i],
            g: px[i + 1],
            b: px[i + 2],
            cov: Math.min(1, a / 255),
            jx: rng() - 0.5,
            jy: rng() - 0.5,
            ph: rng() * 1000,
            // reveal bottom (stem) → up, with a little organic scatter. Scaled
            // to <= 0.72 so even crown dots (ny≈0) finish their 0.28-wide ramp
            // before inProg caps at 1.0 — otherwise they'd snap in at in→hold.
            rev: clamp01((1 - ny) * 0.82 + rng() * 0.18) * 0.72,
          })
        }
      }
      dots = next
      state = 'in'
      stateStart = p.millis()
    }

    p.setup = () => {
      const w = container.clientWidth || 260
      const h = container.clientHeight || Math.round(w * 1.25)
      p.createCanvas(w, h)
      p.frameRate(reducedMotion ? 1 : 30)
      p.noiseSeed(1234)
      buffer = p.createGraphics(BUF_W, BUF_H)
      buffer.pixelDensity(1)
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

      // `registerMethod('remove', …)` runs on `instance.remove()` — tie observer
      // teardown to p5's lifecycle. It's a real runtime API not typed on the
      // @types/p5 instance, hence the cast. p5 frees the graphics buffer itself
      // during remove(), so we don't call buffer.remove() here (double-free).
      ;(p as unknown as { registerMethod: (hook: string, fn: () => void) => void }).registerMethod(
        'remove',
        () => {
          ro?.disconnect()
          io?.disconnect()
          document.removeEventListener('visibilitychange', updateLoop)
        },
      )

      if (reducedMotion) {
        p.noLoop()
        p.redraw()
      }
    }

    function updateLoop() {
      if (reducedMotion) return
      const shouldRun = visible && !document.hidden && !userPaused
      if (shouldRun && paused) {
        paused = false
        // Restore the exact elapsed time captured at pause. millis() is wall-clock
        // and keeps advancing while noLoop()'d, so we must rebuild stateStart from
        // the stored elapsed rather than from the (now stale) old stateStart —
        // otherwise the timeline fast-forwards by the whole paused duration.
        stateStart = p.millis() - elapsedAtPause
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
      p.background(PLATE[0], PLATE[1], PLATE[2])

      const now = p.millis()
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

      const cw = p.width
      const ch = p.height
      const cell = cw / BUF_W
      const maxR = cell * 0.5
      const t = now * 0.001

      p.noStroke()
      for (const d of dots) {
        let rv: number
        if (reducedMotion || state === 'hold') rv = 1
        else if (state === 'in') rv = clamp01((inProg - d.rev) / 0.28)
        else rv = 1
        if (rv <= 0) continue

        const sh = reducedMotion ? 0 : p.noise(d.nx * 4, d.ny * 4, t * 0.6 + d.ph) - 0.5

        let x = d.nx * cw
        let y = d.ny * ch
        let alpha = (0.5 + 0.5 * d.cov) * 255
        let r = maxR * (0.55 + 0.45 * d.cov) * rv * (1 + sh * 0.4)

        if (state === 'out' && !reducedMotion) {
          x += d.jx * cell * 5 * outProg
          y += d.jy * cell * 5 * outProg - outProg * ch * 0.03
          alpha *= 1 - outProg
          r *= 1 - outProg * 0.5
        }

        p.fill(d.r, d.g, d.b, alpha * (0.35 + 0.65 * rv))
        p.circle(x, y, Math.max(0.6, r * 2))
      }
    }
  }
}
