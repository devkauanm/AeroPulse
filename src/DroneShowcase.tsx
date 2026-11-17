import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import droneModelUrl from '../source/DJI-Mavic_3.glb?url'

type ModelStatus = 'loading' | 'ready' | 'error'

function disposeModel(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}

export default function DroneShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<ModelStatus>('loading')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let active = true
    let animationFrame = 0
    let model: THREE.Group | null = null
    let isDragging = false
    let lastPointerX = 0
    let lastPointerY = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(2.6, 1.9, 3.5)
    camera.lookAt(0, 0, 0)
    scene.add(new THREE.HemisphereLight(0xd8eaff, 0x18202a, 3))

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5)
    keyLight.position.set(-4, 7, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x76ffc0, 2.5)
    fillLight.position.set(4, 2, -5)
    scene.add(fillLight)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch (error) {
      console.error('Não foi possível iniciar a vitrine 3D do drone.', error)
      queueMicrotask(() => {
        if (active) setStatus('error')
      })
      return () => {
        active = false
      }
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const onPointerDown = (event: PointerEvent) => {
      isDragging = true
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      renderer.domElement.setPointerCapture(event.pointerId)
      renderer.domElement.style.cursor = 'grabbing'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging || !model) return
      model.rotation.y += (event.clientX - lastPointerX) * 0.008
      model.rotation.x = THREE.MathUtils.clamp(
        model.rotation.x + (event.clientY - lastPointerY) * 0.004,
        -0.45,
        0.45,
      )
      lastPointerX = event.clientX
      lastPointerY = event.clientY
    }

    const onPointerUp = () => {
      isDragging = false
      renderer.domElement.style.cursor = 'grab'
    }

    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)
    renderer.domElement.addEventListener('lostpointercapture', onPointerUp)

    const loader = new GLTFLoader()
    loader.load(
      droneModelUrl,
      (gltf) => {
        if (!active) {
          disposeModel(gltf.scene)
          return
        }

        const bounds = new THREE.Box3().setFromObject(gltf.scene)
        const center = bounds.getCenter(new THREE.Vector3())
        const size = bounds.getSize(new THREE.Vector3())
        const maxDimension = Math.max(size.x, size.y, size.z)
        if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
          console.error('O modelo 3D do drone não possui dimensões válidas.')
          setStatus('error')
          disposeModel(gltf.scene)
          return
        }

        const scale = 2.8 / maxDimension
        gltf.scene.scale.setScalar(scale)
        gltf.scene.position.copy(center).multiplyScalar(-scale)
        model = new THREE.Group()
        model.add(gltf.scene)
        model.rotation.x = 0.12
        scene.add(model)
        setStatus('ready')
      },
      undefined,
      (error) => {
        if (!active) return
        console.error('Não foi possível carregar o modelo 3D do drone.', error)
        setStatus('error')
      },
    )

    const timer = new THREE.Timer()
    timer.connect(document)
    const render = (timestamp: number) => {
      animationFrame = window.requestAnimationFrame(render)
      timer.update(timestamp)
      if (document.visibilityState === 'visible') {
        const delta = Math.min(timer.getDelta(), 0.05)
        if (model && !isDragging && !reducedMotion.matches) model.rotation.y += delta * 0.2
        renderer.render(scene, camera)
      }
    }
    render(performance.now())

    return () => {
      active = false
      window.cancelAnimationFrame(animationFrame)
      timer.dispose()
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      renderer.domElement.removeEventListener('lostpointercapture', onPointerUp)
      if (model) disposeModel(model)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="drone-canvas"
      role="img"
      aria-label="Modelo 3D do DJI Mavic 3. Arraste para girar."
    >
      {status !== 'ready' && (
        <span className={`drone-model-status ${status}`} role="status">
          {status === 'loading' ? 'CARREGANDO MODELO 3D' : 'MODELO 3D INDISPONÍVEL'}
        </span>
      )}
    </div>
  )
}
