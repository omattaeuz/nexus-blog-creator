"use client"
import { useEffect, useMemo, useState } from "react"
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

const RING_PROPAGATION_SPEED = 3
const aspect = 1.2
const cameraZ = 400


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
    arcTime: 3000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  }), [])

  // Load countries data
  useEffect(() => {
    if (countriesData) return // Avoid reloading if already loaded
    
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

  // Build material when globe is initialized or when relevant props change
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

  // Memoize filtered points to avoid recalculation
  const filteredPoints = useMemo(() => {
    if (!data) return []
    
    const points = []
    for (let i = 0; i < data.length; i++) {
      const arc = data[i]
      const rgb = hexToRgb(arc.color) as { r: number; g: number; b: number }
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

    // remove duplicates for same lat and lng
    return points.filter(
      (v, i, a) =>
        a.findIndex((v2) => ["lat", "lng"].every((k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"])) === i,
    )
  }, [data])

  // Build data when globe is initialized or when data changes
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

    globeInstance
      .pointsData(filteredPoints)
      .pointColor((e) => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2)

    globeInstance
      .ringsData([])
      .ringColor(() => defaultProps.polygonColor)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings)
  }, [globeInstance, countriesData])


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
  return (
    <Canvas
      camera={{
        fov: 35,
        aspect: aspect,
        near: 180,
        far: 1800,
        position: [0, 100, cameraZ],
      }}
    >
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight color={globeConfig.directionalLeftLight} position={[-400, 100, 400]} />
      <directionalLight color={globeConfig.directionalTopLight} position={[-200, 500, 200]} />
      <pointLight color={globeConfig.pointLight} position={[-200, 500, 200]} intensity={0.8} />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={0.5}
        autoRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
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
