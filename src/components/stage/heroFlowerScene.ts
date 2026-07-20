import * as THREE from 'three'

/**
 * Hero particle specimen: for each species a dense 3D flower is built out of
 * tens of thousands of GPU particles (petals/disc/stem sampled as 3D surfaces),
 * and every particle is coloured by sampling the reference photo — so the form
 * and colour come from the real flowers, but rendered as glowing points, like
 * the reference. The cloud rotates in 3D; particles are soft additive sprites
 * that glow on a dark plate. Species cross-fade one at a time.
 *
 * Reduced-motion shows one static flower. Pure module — no React. Owns full
 * three.js disposal on teardown.
 */

const PLATE = 0x17140f // warm near-black, so the particles glow

interface SpeciesDef {
  image: string
  /** flower centre + radius in the photo (0..1) and the geometric bloom radius. */
  cx: number
  cy: number
  r: number
  geoR: number
  build: (e: Emitter) => void
}

interface Emitter {
  rnd: () => number
  range: (a: number, b: number) => number
  bloom: (x: number, y: number, z: number) => void
  stem: (x: number, y: number, z: number) => void
}

// --- vector helpers ----------------------------------------------------------
type V3 = [number, number, number]
const nrm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
const crs = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const TWO_PI = Math.PI * 2

// --- shared form primitives (emit particle positions) ------------------------
function petal(e: Emitter, cx: number, cy: number, cz: number, theta: number, phi: number, len: number, wid: number, curl: number, n: number, innerR = 0.16) {
  const dir: V3 = [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)]
  const side: V3 = [-Math.sin(theta), 0, Math.cos(theta)]
  const face = nrm(crs(dir, side))
  for (let k = 0; k < n; k++) {
    const u = e.rnd()
    const along = innerR + u * len // start off the centre so petals don't pile into one bright core
    const halfW = wid * Math.pow(Math.sin(Math.PI * (0.08 + 0.92 * u)), 0.7) * (1 - 0.12 * u)
    const v = (e.rnd() * 2 - 1) * halfW
    const bend = curl * Math.sin(u * Math.PI * 0.9)
    e.bloom(
      cx + dir[0] * along + side[0] * v + face[0] * bend,
      cy + dir[1] * along + side[1] * v + face[1] * bend,
      cz + dir[2] * along + side[2] * v + face[2] * bend,
    )
  }
}

function discFill(e: Emitter, cx: number, cy: number, cz: number, radius: number, yScale: number, n: number) {
  for (let k = 0; k < n; k++) {
    const rr = Math.sqrt(e.rnd()) * radius
    const t = e.rnd() * TWO_PI
    e.bloom(cx + rr * Math.cos(t), cy + (e.rnd() * 2 - 1) * radius * yScale, cz + rr * Math.sin(t))
  }
}

function ball(e: Emitter, cx: number, cy: number, cz: number, radius: number, yScale: number, n: number) {
  for (let k = 0; k < n; k++) {
    const u = e.rnd() * 2 - 1
    const t = e.rnd() * TWO_PI
    const rr = Math.sqrt(1 - u * u)
    e.bloom(cx + radius * rr * Math.cos(t), cy + radius * u * yScale, cz + radius * rr * Math.sin(t))
  }
}

function stemAndLeaves(e: Emitter, topY: number) {
  const baseY = -2.3
  const lean = e.range(-0.15, 0.15)
  for (let i = 0; i <= 260; i++) {
    const t = i / 260
    const y = baseY + (topY - baseY) * t
    const x = lean * Math.sin(t * Math.PI) + Math.cos(t * 10) * 0.03
    const z = Math.sin(t * 10) * 0.03
    e.stem(x, y, z)
  }
  const leaves = e.rnd() < 0.6 ? 2 : 1
  for (let i = 0; i < leaves; i++) {
    const at = e.range(0.25, 0.55)
    const ay = baseY + (topY - baseY) * at
    const theta = e.range(0, TWO_PI)
    const dir: V3 = nrm([Math.cos(theta), -0.35, Math.sin(theta)])
    const side: V3 = nrm([-Math.sin(theta), 0, Math.cos(theta)])
    for (let k = 0; k < 700; k++) {
      const u = e.rnd()
      const halfW = 0.4 * 0.16 * Math.sin(Math.PI * (0.1 + 0.9 * u)) * (1 - 0.2 * u) * 3
      const v = (e.rnd() * 2 - 1) * halfW
      e.stem(dir[0] * u * 0.7 + side[0] * v, ay + dir[1] * u * 0.7, dir[2] * u * 0.7 + side[2] * v)
    }
  }
}

// --- species -----------------------------------------------------------------
const SPECIES: SpeciesDef[] = [
  {
    image: '/images/flowers/rose.jpg',
    cx: 0.5, cy: 0.42, r: 0.28, geoR: 1.05,
    build: (e) => {
      stemAndLeaves(e, -0.3)
      const golden = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < 66; i++) {
        const t = i / 66
        petal(e, 0, 0, 0, i * golden, 1.4 - t * 1.2, 0.4 + t * 0.65, 0.36, 0.45 - t * 0.75, 720)
      }
    },
  },
  {
    image: '/images/flowers/peony.jpg',
    cx: 0.5, cy: 0.5, r: 0.3, geoR: 1.1,
    build: (e) => {
      stemAndLeaves(e, -0.35)
      const rings = 6
      for (let r = 0; r < rings; r++) {
        const t = r / (rings - 1)
        const count = 6 + r * 4
        for (let i = 0; i < count; i++) {
          const theta = (i / count) * TWO_PI + e.range(-0.22, 0.22) + r * 1.3
          petal(e, 0, 0, 0, theta, (1.3 - t * 1.15) + e.range(-0.12, 0.12), 0.7 + t * 0.55, 0.44, 0.3 - t * 0.55, 620)
        }
      }
    },
  },
  {
    image: '/images/flowers/sunflower.jpg',
    cx: 0.42, cy: 0.45, r: 0.34, geoR: 1.2,
    build: (e) => {
      stemAndLeaves(e, -0.2)
      discFill(e, 0, 0, 0, 0.52, 0.18, 9000) // dark seed head
      for (let ring = 0; ring < 2; ring++) {
        const count = 36
        for (let i = 0; i < count; i++) {
          const theta = (i / count) * TWO_PI + ring * (Math.PI / count)
          petal(e, 0, 0, 0, theta, 0.16 - ring * 0.05, 1.15 - ring * 0.16, 0.16, 0.12, 440, 0.44)
        }
      }
    },
  },
  {
    image: '/images/flowers/lily.jpg',
    cx: 0.36, cy: 0.42, r: 0.3, geoR: 1.25,
    build: (e) => {
      stemAndLeaves(e, -0.4)
      for (let i = 0; i < 6; i++) {
        petal(e, 0, 0, 0, (i / 6) * TWO_PI + e.range(-0.05, 0.05), 0.4, 1.35, 0.34, -0.65, 3200)
      }
      ball(e, 0, 0, 0, 0.22, 1, 1100)
    },
  },
  {
    image: '/images/flowers/orchid.jpg',
    cx: 0.44, cy: 0.42, r: 0.34, geoR: 1.05,
    build: (e) => {
      stemAndLeaves(e, -0.45)
      const angles = [Math.PI * 0.5, Math.PI * 0.15, Math.PI * 0.85, -Math.PI * 0.1, -Math.PI * 1.1]
      for (const theta of angles) petal(e, 0, 0, 0, theta, 0.12, 1.1, 0.6, 0.12, 3400)
      ball(e, 0, 0, 0, 0.22, 0.7, 1600)
    },
  },
]

const STEM_COL: V3 = [0.31, 0.42, 0.24]
const DUR = { in: 1500, hold: 5200, out: 1100 }

export interface HeroSceneControl {
  setPaused?: (paused: boolean) => void
}
export interface HeroSceneOpts {
  container: HTMLElement
  reducedMotion: boolean
  control?: HeroSceneControl
}

const VERT = `
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  varying vec3 vColor;
  varying float vShim;
  void main() {
    vColor = aColor;
    float sh = sin(uTime * 1.6 + aSeed * 6.2831) * 0.5 + 0.5;
    vShim = 0.55 + 0.45 * sh;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * vShim * uDpr * (10.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const FRAG = `
  precision mediump float;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vShim;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.06, length(d));
    // linearise the (sRGB) sampled colour so additive accumulation is
    // photometric; the post pass tone-maps + re-encodes
    vec3 lin = pow(vColor, vec3(2.2)) * (0.85 + 0.25 * vShim);
    gl_FragColor = vec4(lin, a * uOpacity * vShim * 0.4);
  }
`

const POST_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`
const POST_FRAG = `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform vec3 uPlate;
  uniform float uExposure;
  varying vec2 vUv;
  vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }
  void main() {
    vec3 hdr = texture2D(tDiffuse, vUv).rgb + uPlate;
    vec3 mapped = aces(hdr * uExposure);
    gl_FragColor = vec4(pow(mapped, vec3(1.0 / 2.2)), 1.0);
  }
`

export function createHeroFlowerScene({ container, reducedMotion, control }: HeroSceneOpts) {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(dpr)
  const w0 = container.clientWidth || 260
  const h0 = container.clientHeight || Math.round(w0 * 1.25)
  renderer.setSize(w0, h0)
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace // tone-map + encode manually in the post pass
  container.appendChild(renderer.domElement)

  // HDR pipeline: particles accumulate additively into a float buffer (no
  // clamping), then a post pass ACES-tone-maps it — so dense cores glow as
  // bright *colour* instead of clipping to white.
  const rt = new THREE.WebGLRenderTarget(Math.floor(w0 * dpr), Math.floor(h0 * dpr), { type: THREE.HalfFloatType })

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, w0 / h0, 0.1, 100)
  // look DOWN into the blooms (which face up) so their faces show as they turn
  camera.position.set(0, 2.5, 5.2)
  camera.lookAt(0, -0.35, 0)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 3.3 },
      uDpr: { value: dpr },
      uOpacity: { value: reducedMotion ? 1 : 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const group = new THREE.Group()
  scene.add(group)
  const points = new THREE.Points(new THREE.BufferGeometry(), material)
  group.add(points)

  // fullscreen post pass: ACES tone-map the HDR buffer to the screen
  const plateLin = new THREE.Color(PLATE).convertSRGBToLinear()
  const postScene = new THREE.Scene()
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const postGeo = new THREE.PlaneGeometry(2, 2)
  const postMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: rt.texture },
      uPlate: { value: new THREE.Vector3(plateLin.r, plateLin.g, plateLin.b) },
      uExposure: { value: 0.95 },
    },
    vertexShader: POST_VERT,
    fragmentShader: POST_FRAG,
    depthTest: false,
    depthWrite: false,
  })
  postScene.add(new THREE.Mesh(postGeo, postMat))

  const geometries: (THREE.BufferGeometry | null)[] = SPECIES.map(() => null)
  let idx = -1
  let phase: 'in' | 'hold' | 'out' = 'in'
  let phaseStart = 0
  let rafId = 0
  let running = false
  let userPaused = false
  let visible = true
  let disposed = false
  let ro: ResizeObserver | undefined
  let io: IntersectionObserver | undefined

  function mulberry(seed: number) {
    let a = seed >>> 0
    return () => {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  function buildGeometry(i: number, img: ImageData): THREE.BufferGeometry {
    const s = SPECIES[i]
    const pos: number[] = []
    const col: number[] = []
    const seed: number[] = []
    const rng = mulberry(1234 + i * 99)
    const pushCol = (r: number, g: number, b: number) => {
      col.push(r, g, b)
      seed.push(rng())
    }
    const e: Emitter = {
      rnd: rng,
      range: (a, b) => a + (b - a) * rng(),
      bloom: (x, y, z) => {
        pos.push(x, y, z)
        const u = Math.min(0.999, Math.max(0, s.cx + (x / s.geoR) * s.r))
        const v = Math.min(0.999, Math.max(0, s.cy - (y / s.geoR) * s.r))
        const px = (Math.floor(v * img.height) * img.width + Math.floor(u * img.width)) * 4
        pushCol(img.data[px] / 255, img.data[px + 1] / 255, img.data[px + 2] / 255)
      },
      stem: (x, y, z) => {
        pos.push(x, y, z)
        pushCol(STEM_COL[0], STEM_COL[1], STEM_COL[2])
      },
    }
    s.build(e)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3))
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1))
    return g
  }

  function show(i: number) {
    idx = i
    if (geometries[i]) points.geometry = geometries[i]!
    phase = 'in'
    phaseStart = performance.now()
  }

  function next() {
    let n = Math.floor(Math.random() * SPECIES.length)
    if (SPECIES.length > 1) while (n === idx) n = Math.floor(Math.random() * SPECIES.length)
    show(n)
  }

  function render(now: number) {
    const t = now * 0.001
    material.uniforms.uTime.value = reducedMotion ? 0 : t
    if (!reducedMotion) {
      group.rotation.y = t * 0.32
      const el = now - phaseStart
      if (phase === 'in') {
        material.uniforms.uOpacity.value = Math.min(1, el / DUR.in)
        if (el >= DUR.in) { phase = 'hold'; phaseStart = now }
      } else if (phase === 'hold') {
        material.uniforms.uOpacity.value = 1
        if (el >= DUR.hold) { phase = 'out'; phaseStart = now }
      } else {
        material.uniforms.uOpacity.value = Math.max(0, 1 - el / DUR.out)
        if (el >= DUR.out) next()
      }
    }
    // pass 1: accumulate particles into the HDR buffer; pass 2: tone-map to screen
    renderer.setRenderTarget(rt)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(postScene, postCamera)
  }

  function loop() {
    if (!running) return
    rafId = requestAnimationFrame(loop)
    render(performance.now())
  }
  function start() {
    if (running || reducedMotion) return
    running = true
    rafId = requestAnimationFrame(loop)
  }
  function stop() {
    running = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
  }
  function updateRun() {
    if (reducedMotion) return
    if (visible && !document.hidden && !userPaused) start()
    else stop()
  }
  function setUserPaused(v: boolean) {
    userPaused = v
    updateRun()
  }
  if (control) control.setPaused = setUserPaused

  ro = new ResizeObserver(() => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w > 0 && h > 0) {
      renderer.setSize(w, h)
      rt.setSize(Math.floor(w * dpr), Math.floor(h * dpr))
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (reducedMotion || !running) render(performance.now())
    }
  })
  ro.observe(container)
  if (!reducedMotion) {
    io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true
        updateRun()
      },
      { threshold: 0.01 },
    )
    io.observe(container)
    document.addEventListener('visibilitychange', updateRun)
  }

  // preload photos → pixels → build all geometries, then begin
  const sampler = document.createElement('canvas')
  const sctx = sampler.getContext('2d', { willReadFrequently: true })!
  let built = 0
  SPECIES.forEach((s, i) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => {
      if (disposed) return
      sampler.width = im.naturalWidth
      sampler.height = im.naturalHeight
      sctx.drawImage(im, 0, 0)
      const data = sctx.getImageData(0, 0, sampler.width, sampler.height)
      geometries[i] = buildGeometry(i, data)
      built++
      if (idx < 0) {
        show(i)
        if (reducedMotion) render(performance.now())
        else start()
      }
    }
    im.src = s.image
  })

  return () => {
    disposed = true
    stop()
    ro?.disconnect()
    io?.disconnect()
    document.removeEventListener('visibilitychange', updateRun)
    geometries.forEach((g) => g?.dispose())
    points.geometry.dispose()
    material.dispose()
    postGeo.dispose()
    postMat.dispose()
    rt.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
}
