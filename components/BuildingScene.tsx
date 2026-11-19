"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useLoader, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  BUILDING, BUILDING_FOOTPRINT, SITE_IMAGE, STATUS_INFO, buildingWorld, centroid, unitsOfFloor,
  type FilterStatus, type Unit
} from "@/data/berkley";

const WORLD = buildingWorld();
const H = BUILDING.floorHeight;

type Props = {
  floor: number;
  filter: FilterStatus;
  selectedUnitId: string | null;
  onSelectUnit: (unit: Unit) => void;
  resetKey: number;
};

function Ground() {
  const texture = useLoader(THREE.TextureLoader, SITE_IMAGE.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[SITE_IMAGE.worldWidth, SITE_IMAGE.worldDepth]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#dce4e9" />
      </mesh>
    </group>
  );
}

function UnitMesh({ unit, floor, filter, selected, onSelect }: {
  unit: Unit;
  floor: number;
  filter: FilterStatus;
  selected: boolean;
  onSelect: (unit: Unit) => void;
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    unit.polygon.forEach(([nx, ny], i) => {
      // y trong Shape được đảo lại, để khi quay -90° bản đồ không bị lật.
      const x = (nx - 0.5) * WORLD.width;
      const y = (0.5 - ny) * WORLD.depth;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
    s.closePath();
    return s;
  }, [unit.polygon]);

  const center = centroid(unit.polygon);
  const matches = filter === "all" || unit.status === filter;
  const color = STATUS_INFO[unit.status].color;
  const topY = floor * H;

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const onPointerOut = () => { document.body.style.cursor = "auto"; };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, topY + (selected ? 0.105 : 0.055), 0]}
        onClick={(event) => { event.stopPropagation(); onSelect(unit); }}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <extrudeGeometry args={[shape, { depth: selected ? 0.12 : 0.055, bevelEnabled: false, curveSegments: 1 }]} />
        <meshStandardMaterial
          color={selected ? "#d7e9ff" : color}
          transparent
          opacity={matches ? (selected ? 0.93 : 0.64) : 0.12}
          roughness={0.7}
          metalness={0.03}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {matches && (
        <Html
          position={[(center[0] - 0.5) * WORLD.width, topY + 0.29, (center[1] - 0.5) * WORLD.depth]}
          center
          style={{ pointerEvents: "none" }}
          distanceFactor={19}
        >
          <div className={`mesh-label ${selected ? "mesh-label--selected" : ""}`}>{unit.suffix}</div>
        </Html>
      )}
    </group>
  );
}

function TowerBodyFloor({ floor }: { floor: number }) {
  const footprintShape = useMemo(() => {
    const shape = new THREE.Shape();
    BUILDING_FOOTPRINT.forEach(([nx, ny], index) => {
      const x = (nx - 0.5) * WORLD.width;
      const y = (0.5 - ny) * WORLD.depth;
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return shape;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, (floor - 1) * H, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[footprintShape, { depth: H - 0.018, bevelEnabled: false }]} />
      <meshStandardMaterial color="#889dac" side={THREE.DoubleSide} roughness={0.78} metalness={0.12} />
    </mesh>
  );
}

function Facade({ floor, filter }: { floor: number; filter: FilterStatus }) {
  const units = unitsOfFloor(floor);
  const facadeUnit = (index: number, count: number, side: number) => {
    const frac = index / count;
    const idx = side < 2
      ? Math.min(4, Math.floor(frac * 5))
      : Math.min(4, Math.floor(frac * 5 + side) % 5);
    return units[idx];
  };
  const y = (floor - 1) * H + H / 2;
  const frontWindows = Array.from({ length: 25 }, (_, i) => i);
  const sideWindows = Array.from({ length: 20 }, (_, i) => i);

  return (
    <group>
      <TowerBodyFloor floor={floor} />
      {[1, -1].map((sign, side) => (
        <group key={`front-${sign}`}>
          {frontWindows.map((index) => {
            const unit = facadeUnit(index, frontWindows.length, side);
            const match = filter === "all" || unit.status === filter;
            return (
              <mesh
                key={index}
                position={[
                  // Phía trước (z âm) chỉ có cánh phải của tòa chữ L.
                  sign === -1
                    ? WORLD.width * (0.53 + (index + 0.5) / frontWindows.length * 0.47 - 0.5)
                    : -WORLD.width / 2 + (index + 0.5) * (WORLD.width / frontWindows.length),
                  y + 0.045,
                  sign * (WORLD.depth / 2 + 0.019)
                ]}
              >
                <boxGeometry args={[(WORLD.width / frontWindows.length) * (sign === -1 ? 0.47 : 1) * 0.8, H * 0.68, 0.014]} />
                <meshStandardMaterial
                  color={unit.status === "sold" ? "#b6454e" : unit.status === "available" ? "#4b7d80" : STATUS_INFO[unit.status].color}
                  transparent opacity={match ? 0.85 : 0.12} metalness={0.25} roughness={0.28}
                />
              </mesh>
            );
          })}
        </group>
      ))}
      {[1, -1].map((sign, side) => (
        <group key={`side-${sign}`}>
          {sideWindows.map((index) => {
            const unit = facadeUnit(index, sideWindows.length, side + 2);
            const match = filter === "all" || unit.status === filter;
            return (
              <mesh
                key={index}
                position={[
                  sign * (WORLD.width / 2 + 0.02),
                  y + 0.045,
                  // Cánh trái chỉ trải từ khoảng 40% chiều sâu trở xuống.
                  -WORLD.depth / 2 + (sign === -1
                    ? (0.40 + (index + 0.5) / sideWindows.length * 0.60) * WORLD.depth
                    : (index + 0.5) * (WORLD.depth / sideWindows.length))
                ]}
              >
                <boxGeometry args={[0.014, H * 0.68, WORLD.depth / sideWindows.length * (sign === -1 ? 0.60 : 1) * 0.78]} />
                <meshStandardMaterial
                  color={unit.status === "sold" ? "#b6454e" : unit.status === "available" ? "#4b7d80" : STATUS_INFO[unit.status].color}
                  transparent opacity={match ? 0.85 : 0.12} metalness={0.25} roughness={0.28}
                />
              </mesh>
            );
          })}
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floor * H - 0.035, 0]}>
        <planeGeometry args={[WORLD.width, WORLD.depth]} />
        <meshStandardMaterial color="#c6d6df" transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

function TopFloor({ floor, filter, selectedUnitId, onSelectUnit }: Omit<Props, "resetKey">) {
  const texture = useLoader(THREE.TextureLoader, BUILDING.floorPlanSrc);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <>
      <mesh position={[0, floor * H + 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD.width, WORLD.depth]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {unitsOfFloor(floor).map((unit) => (
        <UnitMesh key={unit.id} unit={unit} floor={floor} filter={filter}
          selected={unit.id === selectedUnitId} onSelect={onSelectUnit} />
      ))}
    </>
  );
}

function Tower(props: Omit<Props, "resetKey">) {
  const { floor, filter } = props;
  return (
    <group position={[WORLD.x, 0, WORLD.z]}>
      {Array.from({ length: floor }, (_, index) => (
        <Facade key={index + 1} floor={index + 1} filter={filter} />
      ))}
      <TopFloor {...props} />
      <Html
        position={[0, floor * H + 1.1, 0]}
        center
        style={{ pointerEvents: "none" }}
        distanceFactor={20}
      >
        <div className="building-label">THE BERKLEY <span>TẦNG {String(floor).padStart(2, "0")}</span></div>
      </Html>
    </group>
  );
}

function SceneContent(props: Omit<Props, "resetKey">) {
  const { floor } = props;
  const target = useMemo(() => new THREE.Vector3(WORLD.x, floor * H * 0.46, WORLD.z), [floor]);
  return (
    <>
      <color attach="background" args={["#e3e8ec"]} />
      <fog attach="fog" args={["#e3e8ec", 42, 100]} />
      <ambientLight intensity={1.65} />
      <hemisphereLight args={["#ffffff", "#8297a8", 1.1]} />
      <directionalLight position={[18, 32, 12]} intensity={2.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <Suspense fallback={<Html center><div className="loading-scene">Đang tải ảnh mặt bằng…</div></Html>}>
        <Ground />
        <Tower {...props} />
      </Suspense>
      <OrbitControls
        makeDefault
        target={target}
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={55}
        maxPolarAngle={Math.PI / 2.03}
        minPolarAngle={0.12}
      />
    </>
  );
}

export default function BuildingScene(props: Props) {
  return (
    <Canvas
      key={props.resetKey}
      shadows
      dpr={[1, 1.7]}
      camera={{ position: [WORLD.x + 18, 15, WORLD.z + 19], fov: 43, near: 0.1, far: 180 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onPointerMissed={() => { document.body.style.cursor = "auto"; }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
