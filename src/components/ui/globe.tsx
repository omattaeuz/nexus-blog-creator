"use client"
import { useEffect, useMemo, useState, useRef } from "react"
import { Color, Fog } from "three"
import ThreeGlobe from "three-globe"
import { useThree, Canvas, extend } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: any
  }
}
extend({ ThreeGlobe: ThreeGlobe })

const RING_PROPAGATION_SPEED = 1.1
const aspect = 1.0
const cameraZ = 500
const mobileAspect = 0.8
const mobileCameraZ = 450


type Position = {
  order: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  arcAlt: number
  color: string
}

export type GlobeConfig = {
  pointSize?: number
  globeColor?: string
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereAltitude?: number
  emissive?: string
  emissiveIntensity?: number
  shininess?: number
  polygonColor?: string
  ambientLight?: string
  directionalLeftLight?: string
  directionalTopLight?: string
  pointLight?: string
  arcTime?: number
  arcLength?: number
  rings?: number
  maxRings?: number
  initialPosition?: {
    lat: number
    lng: number
  }
  autoRotate?: boolean
  autoRotateSpeed?: number
}

interface WorldProps {
  globeConfig: GlobeConfig
  data: Position[]
}

export function Globe({ globeConfig, data }: WorldProps) {
  const globeInstance = useMemo(() => new ThreeGlobe(), [])
  const [countriesData, setCountriesData] = useState<any>(null)

  const defaultProps = useMemo(() => ({
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 0,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  }), [globeConfig])

  useEffect(() => {
    if (countriesData) return
    
    fetch("/globe.json")
      .then((res) => res.json())
      .then((countries) => {
        console.log("Countries loaded:", countries.features?.length, "features")
        setCountriesData(countries)
      })
      .catch((error) => {
        console.error("Error loading countries:", error)
        setCountriesData({ type: "FeatureCollection", features: [] })
      })
  }, [countriesData])

  useEffect(() => {
    if (!globeInstance) return

    const globeMaterial = globeInstance.globeMaterial() as unknown as {
      color: Color
      emissive: Color
      emissiveIntensity: number
      shininess: number
    }
    globeMaterial.color = new Color(globeConfig.globeColor)
    globeMaterial.emissive = new Color(globeConfig.emissive)
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1
    globeMaterial.shininess = globeConfig.shininess || 0.9
  }, [
    globeInstance,
    globeConfig.globeColor,
    globeConfig.emissive,
    globeConfig.emissiveIntensity,
    globeConfig.shininess,
  ])

  const filteredPoints = useMemo(() => {
    if (!data) return []
    
    const points = []
    for (let i = 0; i < data.length; i++) {
      const arc = data[i]
      const _rgb = hexToRgb(arc.color) as { r: number; g: number; b: number }
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      })
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      })
    }

    return points.filter(
      (v, i, a) => a.findIndex((v2) => ["lat", "lng"].every((k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"])) === i,
    )
  }, [data, defaultProps.pointSize])

  useEffect(() => {
    if (!globeInstance || !data || !countriesData) return

    globeInstance
      .hexPolygonsData(countriesData.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor(() => defaultProps.polygonColor)

    globeInstance
      .arcsData([])
      .arcStartLat((d) => (d as { startLat: number }).startLat)
      .arcStartLng((d) => (d as { startLng: number }).startLng)
      .arcEndLat((d) => (d as { endLat: number }).endLat)
      .arcEndLng((d) => (d as { endLng: number }).endLng)
      .arcColor((e: any) => (e as { color: string }).color || "#3b82f6")
      .arcAltitude((e) => (e as { arcAlt: number }).arcAlt || 0.1)
      .arcStroke(0.3)
      .arcDashLength(0.1)
      .arcDashInitialGap(1)
      .arcDashGap(2)
      .arcDashAnimateTime(3000)

    globeInstance
      .pointsData(filteredPoints)
      .pointColor("#3b82f6") // Fixed blue color
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2)

    globeInstance
      .ringsData([])
      .ringColor((e) => (e as { color: string }).color)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings)
  }, [globeInstance, countriesData, data, filteredPoints])

  const animationRef = useRef<{
    currentWaveIndex: number
    ringTimeout: NodeJS.Timeout | null
    interval: NodeJS.Timeout | null
    wavePoints: any[]
    isInitialized: boolean
  }>({
    currentWaveIndex: 0,
    ringTimeout: null,
    interval: null,
    wavePoints: [],
    isInitialized: false
  })

  useEffect(() => {
    if (!globeInstance || !data || animationRef.current.isInitialized) return

    const wavePoints = data.filter((_, index) => {
      return index % 2 === 0
    })

    const northAmericanPoints = wavePoints.filter(point => 
      (point.startLat > 25 && point.startLat < 70 && point.startLng > -170 && point.startLng < -50) ||
      (point.endLat > 25 && point.endLat < 70 && point.endLng > -170 && point.endLng < -50)
    )
    console.log("Total wave points:", wavePoints.length)
    console.log("North American points found:", northAmericanPoints.length)
    if (northAmericanPoints.length > 0) {
      console.log("Sample North American points:", northAmericanPoints.slice(0, 3))
    }
    console.log("First 5 wave points:", wavePoints.slice(0, 5).map(p => ({
      startLat: p.startLat,
      startLng: p.startLng,
      endLat: p.endLat,
      endLng: p.endLng
    })))

    animationRef.current.wavePoints = wavePoints
    animationRef.current.currentWaveIndex = 0
    animationRef.current.isInitialized = true

    const showNextWaveRing = () => {
      if (!globeInstance || animationRef.current.wavePoints.length === 0) return

      const currentPoint = animationRef.current.wavePoints[animationRef.current.currentWaveIndex]
      const ringsData = [{
        lat: currentPoint.startLat,
        lng: currentPoint.startLng,
        color: currentPoint.color || "#3b82f6",
      }]

      const arcData = [{
        startLat: currentPoint.startLat,
        startLng: currentPoint.startLng,
        endLat: currentPoint.endLat,
        endLng: currentPoint.endLng,
        arcAlt: currentPoint.arcAlt || 0.1,
        color: currentPoint.color || "#3b82f6",
        order: 1
      }]

      globeInstance.ringsData(ringsData)
      globeInstance.arcsData(arcData)

      animationRef.current.currentWaveIndex = (animationRef.current.currentWaveIndex + 1) % animationRef.current.wavePoints.length

      if (animationRef.current.ringTimeout) clearTimeout(animationRef.current.ringTimeout)

      animationRef.current.ringTimeout = setTimeout(() => {
        if (globeInstance) {
          globeInstance.ringsData([])
          globeInstance.arcsData([])
        }
      }, 4000)
    }

    showNextWaveRing()

    animationRef.current.interval = setInterval(showNextWaveRing, 5000)

    return () => {
      if (animationRef.current.ringTimeout) clearTimeout(animationRef.current.ringTimeout)
      if (animationRef.current.interval) clearInterval(animationRef.current.interval)

      animationRef.current.isInitialized = false
    }
  }, [globeInstance, data])

  return <primitive object={globeInstance} />
}

export function WebGLRendererConfig() {
  const { gl, size, scene } = useThree()

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio)
    gl.setSize(size.width, size.height)
    gl.setClearColor(0x000000, 0)
    scene.fog = new Fog(0x000000, 400, 2000)
  }, [gl, size, scene])

  return null
}

export function World(props: WorldProps) {
  const { globeConfig } = props
  
  const getCameraConfig = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width >= 300 && width <= 768) {
        return {
          fov: 50,
          aspect: mobileAspect,
          near: 200,
          far: 2000,
          position: [0, 50, mobileCameraZ] as [number, number, number],
        }
      }
    }
    return {
      fov: 40,
      aspect: aspect,
      near: 180,
      far: 1800,
      position: [0, 100, cameraZ] as [number, number, number],
    }
  }

  const getOrbitControlsConfig = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width >= 300 && width <= 768) {
        return {
          enablePan: false,
          enableZoom: false,
          minDistance: mobileCameraZ,
          maxDistance: mobileCameraZ,
          autoRotateSpeed: 1.0,
          autoRotate: true,
          minPolarAngle: Math.PI / 3,
          maxPolarAngle: Math.PI / 2.2,
        }
      }
    }
    return {
      enablePan: false,
      enableZoom: false,
      minDistance: cameraZ,
      maxDistance: cameraZ,
      autoRotateSpeed: 1.5,
      autoRotate: true,
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 2.5,
    }
  }

  return (
    <Canvas
      camera={getCameraConfig()}
    >
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight color={globeConfig.directionalLeftLight} position={[-400, 100, 400]} />
      <directionalLight color={globeConfig.directionalTopLight} position={[-200, 500, 200]} />
      <pointLight color={globeConfig.pointLight} position={[-200, 500, 200]} intensity={0.8} />
      <Globe {...props} />
      <OrbitControls {...getOrbitControlsConfig()} />
    </Canvas>
  )
}

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr = []
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min
    if (arr.indexOf(r) === -1) arr.push(r)
  }

  return arr
}