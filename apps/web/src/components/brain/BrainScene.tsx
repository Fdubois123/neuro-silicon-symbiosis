"use client";

import {
  Canvas,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  Line,
  OrbitControls,
  Stars,
  useGLTF,
} from "@react-three/drei";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/* ============================================================
   TYPES
   ============================================================ */

export type BrainSelection = {
  name: string;
  category: string;
} | null;

export type BrainViewMode =
  | "whole"
  | "half";

export type BrainHalfSide =
  | "left"
  | "right";

type BrainSceneProps = {
  resetKey?: number;

  selection: BrainSelection;

  viewMode: BrainViewMode;

  halfSide: BrainHalfSide;

  onSelect?: (
    selection: BrainSelection,
  ) => void;

  onViewChange?: (
    view: string,
  ) => void;
};

type PreparedBrain = {
  scene: THREE.Group;
  center: THREE.Vector3;
  scale: number;
};

type DepthMode =
  | "Surface"
  | "Mid Depth"
  | "Deep";

/* ============================================================
   MATERIAL GROUPS
   ============================================================ */

const ALLOWED_MATERIALS =
  new Set([
    "Brain",
    "Brain-Inner",
    "Temporal lobe",
    "White matter",
    "Nucleus",
    "Cerebellum",
  ]);

const OUTER_MATERIALS =
  new Set([
    "Brain",
    "Temporal lobe",
  ]);

/* ============================================================
   HELPERS
   ============================================================ */

function normalizeName(
  value: string,
) {
  return value
    .replace(/\.\d+$/g, "")
    .replace(/_/g, " ")
    .trim();
}

function getMaterials(
  mesh: THREE.Mesh,
) {
  return Array.isArray(
    mesh.material,
  )
    ? mesh.material
    : [mesh.material];
}

function isAllowedMesh(
  mesh: THREE.Mesh,
) {
  return getMaterials(
    mesh,
  ).some((material) =>
    ALLOWED_MATERIALS.has(
      material.name,
    ),
  );
}

function isOuterMesh(
  mesh: THREE.Mesh,
) {
  return getMaterials(
    mesh,
  ).some((material) =>
    OUTER_MATERIALS.has(
      material.name,
    ),
  );
}

function getCategory(
  materialName: string,
) {
  switch (materialName) {
    case "Cerebellum":
      return "Cerebellum";

    case "White matter":
      return "White Matter";

    case "Nucleus":
      return "Deep Nuclei";

    case "Brain-Inner":
      return "Internal Brain";

    case "Temporal lobe":
      return "Cortical Region";

    default:
      return "Cortex";
  }
}

/* ============================================================
   ANATOMICAL MATERIAL PALETTE
   ============================================================ */

function createMaterial(
  sourceName: string,
  outer: boolean,
) {
  /*
   * CORTEX
   */
  let color = "#25c8f5";

  let emissive = "#036987";

  let opacity =
    outer ? 0.98 : 0.72;

  /*
   * INTERNAL BRAIN
   */
  if (
    sourceName ===
    "Brain-Inner"
  ) {
    color = "#8b5cf6";

    emissive = "#5b21b6";

    opacity = 0.72;
  }

  /*
   * WHITE MATTER
   */
  if (
    sourceName ===
    "White matter"
  ) {
    color = "#d9f7ff";

    emissive = "#0284c7";

    opacity = 0.82;
  }

  /*
   * DEEP NUCLEI
   */
  if (
    sourceName ===
    "Nucleus"
  ) {
    color = "#f59e0b";

    emissive = "#d97706";

    opacity = 0.95;
  }

  /*
   * CEREBELLUM
   */
  if (
    sourceName ===
    "Cerebellum"
  ) {
    color = "#ec4899";

    emissive = "#be185d";

    opacity = 0.94;
  }

  const material =
    new THREE.MeshPhysicalMaterial({
      color,

      emissive,

      emissiveIntensity:
        outer ? 0.16 : 0.4,

      transparent: true,

      opacity,

      roughness: 0.24,

      metalness: 0.015,

      clearcoat: 0.16,

      clearcoatRoughness:
        0.3,

      side:
        THREE.DoubleSide,

      /*
       * At normal distance,
       * outer cortex writes depth,
       * making it visually opaque.
       */
      depthWrite: outer,
    });

  material.userData.baseColor =
    color;

  material.userData.baseEmissive =
    emissive;

  material.userData.baseOpacity =
    opacity;

  material.userData.outer =
    outer;

  return material;
}

/* ============================================================
   PREPARE GLB MODEL
   ============================================================ */

function prepareBrain(
  source: THREE.Group,
): PreparedBrain {
  const scene =
    source.clone(true);

  scene.updateMatrixWorld(
    true,
  );

  const bounds =
    new THREE.Box3();

  let initialized = false;

  scene.traverse(
    (object) => {
      if (
        !(
          object instanceof
          THREE.Mesh
        )
      ) {
        return;
      }

      /*
       * Hide nerves, arteries,
       * bone, cartilage, etc.
       */
      if (
        !isAllowedMesh(
          object,
        )
      ) {
        object.visible =
          false;

        return;
      }

      object.visible = true;

      object.castShadow =
        false;

      object.receiveShadow =
        false;

      const
        originalMaterials =
          getMaterials(
            object,
          );

      const outer =
        isOuterMesh(
          object,
        );

      object.userData
        .anatomicalName =
        normalizeName(
          object.name ||
            "Brain Structure",
        );

      object.userData
        .category =
        getCategory(
          originalMaterials[0]
            ?.name ??
            "Brain",
        );

      object.userData.outer =
        outer;

      const
        replacementMaterials =
          originalMaterials.map(
            (material) =>
              createMaterial(
                material.name,
                outer,
              ),
          );

      object.material =
        Array.isArray(
          object.material,
        )
          ? replacementMaterials
          : replacementMaterials[
              0
            ];

      const geometry =
        object.geometry;

      if (
        !geometry.boundingBox
      ) {
        geometry.computeBoundingBox();
      }

      if (
        !geometry.boundingBox
      ) {
        return;
      }

      const objectBounds =
        geometry.boundingBox
          .clone()
          .applyMatrix4(
            object.matrixWorld,
          );

      if (!initialized) {
        bounds.copy(
          objectBounds,
        );

        initialized = true;
      } else {
        bounds.union(
          objectBounds,
        );
      }
    },
  );

  const size =
    new THREE.Vector3();

  const center =
    new THREE.Vector3();

  bounds.getSize(size);

  bounds.getCenter(
    center,
  );

  const largestDimension =
    Math.max(
      size.x,
      size.y,
      size.z,
    );

  /*
   * Larger brain.
   */
  const targetSize =
    5.65;

  const scale =
    largestDimension > 0
      ? targetSize /
        largestDimension
      : 1;

  return {
    scene,
    center,
    scale,
  };
}

/* ============================================================
   CLIPPING PLANE
   ============================================================ */

function getClippingPlane(
  viewMode: BrainViewMode,
  halfSide: BrainHalfSide,
) {
  if (
    viewMode === "whole"
  ) {
    return null;
  }

  /*
   * Mid-sagittal clipping.
   *
   * Left:
   * retain x <= 0
   *
   * Right:
   * retain x >= 0
   */

  if (
    halfSide === "left"
  ) {
    return new THREE.Plane(
      new THREE.Vector3(
        -1,
        0,
        0,
      ),
      0,
    );
  }

  return new THREE.Plane(
    new THREE.Vector3(
      1,
      0,
      0,
    ),
    0,
  );
}

/* ============================================================
   DEPTH / OPACITY ENGINE
   ============================================================ */

function updateMaterials(
  scene: THREE.Group,

  cameraDistance: number,

  hovered:
    | string
    | null,

  selected:
    | string
    | null,

  clippingPlane:
    | THREE.Plane
    | null,
) {
  /*
   * Begin revealing internals
   * around distance 5.8.
   *
   * Fully deep at ~2.35.
   */
  const depthFactor =
    THREE.MathUtils.clamp(
      (5.8 -
        cameraDistance) /
        (5.8 - 2.35),
      0,
      1,
    );

  scene.traverse(
    (object) => {
      if (
        !(
          object instanceof
          THREE.Mesh
        )
      ) {
        return;
      }

      if (
        !object.visible
      ) {
        return;
      }

      const name =
        object.userData
          .anatomicalName as
          string;

      const outer =
        Boolean(
          object.userData
            .outer,
        );

      const materials =
        getMaterials(
          object,
        );

      for (
        const material
        of materials
      ) {
        if (
          !(
            material instanceof
            THREE.MeshPhysicalMaterial
          )
        ) {
          continue;
        }

        /*
         * Half-brain clipping.
         */
        material.clippingPlanes =
          clippingPlane
            ? [clippingPlane]
            : [];

        material.clipIntersection =
          false;

        const baseColor =
          new THREE.Color(
            material.userData
              .baseColor,
          );

        const baseEmissive =
          new THREE.Color(
            material.userData
              .baseEmissive,
          );

        const baseOpacity =
          Number(
            material.userData
              .baseOpacity,
          ) || 0.7;

        let opacity =
          baseOpacity;

        let
          emissiveIntensity =
            outer
              ? 0.16
              : 0.4;

        /*
         * =================================
         * OUTER CORTEX
         *
         * FAR:
         * opaque
         *
         * DEEP:
         * translucent
         * =================================
         */

        if (outer) {
          opacity =
            THREE.MathUtils.lerp(
              0.98,
              0.08,
              depthFactor,
            );

          emissiveIntensity =
            THREE.MathUtils.lerp(
              0.16,
              0.05,
              depthFactor,
            );

          /*
           * Far away:
           * cortex behaves opaque.
           *
           * When diving in:
           * stop writing depth so
           * internal structures show.
           */
          const shouldWriteDepth =
            depthFactor < 0.12;

          if (
            material.depthWrite !==
            shouldWriteDepth
          ) {
            material.depthWrite =
              shouldWriteDepth;

            material.needsUpdate =
              true;
          }
        } else {
          /*
           * =================================
           * INTERNAL STRUCTURES
           *
           * FAR:
           * lower visibility
           *
           * DEEP:
           * fully opaque / bright
           * =================================
           */

          opacity =
            THREE.MathUtils.lerp(
              Math.min(
                baseOpacity,
                0.48,
              ),
              Math.max(
                baseOpacity,
                0.94,
              ),
              depthFactor,
            );

          emissiveIntensity =
            THREE.MathUtils.lerp(
              0.3,
              0.72,
              depthFactor,
            );

          material.depthWrite =
            false;
        }

        /*
         * Selection isolation.
         */
        if (
          selected &&
          name !== selected
        ) {
          opacity *=
            depthFactor >
            0.45
              ? 0.32
              : 0.48;

          emissiveIntensity *=
            0.38;
        }

        /*
         * HOVER = GREEN
         */
        if (
          hovered === name &&
          selected !== name
        ) {
          material.color.set(
            "#22c55e",
          );

          material.emissive.set(
            "#16a34a",
          );

          material.emissiveIntensity =
            1.45;

          material.opacity =
            1;

          material.needsUpdate =
            true;

          continue;
        }

        /*
         * SELECTED = YELLOW
         */
        if (
          selected === name
        ) {
          material.color.set(
            "#facc15",
          );

          material.emissive.set(
            "#eab308",
          );

          material.emissiveIntensity =
            1.6;

          material.opacity =
            1;

          material.depthWrite =
            false;

          material.needsUpdate =
            true;

          continue;
        }

        /*
         * Default anatomical state.
         */
        material.color.copy(
          baseColor,
        );

        material.emissive.copy(
          baseEmissive,
        );

        material.opacity =
          opacity;

        material.emissiveIntensity =
          emissiveIntensity;

        material.needsUpdate =
          true;
      }
    },
  );
}

/* ============================================================
   BRAIN MODEL
   ============================================================ */

function AnatomicalBrain({
  selection,

  viewMode,

  halfSide,

  onSelect,
}: {
  selection:
    BrainSelection;

  viewMode:
    BrainViewMode;

  halfSide:
    BrainHalfSide;

  onSelect?: (
    selection:
      BrainSelection,
  ) => void;
}) {
  const gltf =
    useGLTF(
      "/models/brain/brain.glb",
    );

  const camera =
    useThree(
      (state) =>
        state.camera,
    );

  const prepared =
    useMemo(
      () =>
        prepareBrain(
          gltf.scene,
        ),
      [gltf.scene],
    );

  const clippingPlane =
    useMemo(
      () =>
        getClippingPlane(
          viewMode,
          halfSide,
        ),
      [
        viewMode,
        halfSide,
      ],
    );

  const rootRef =
    useRef<THREE.Group>(
      null,
    );

  const hoveredRef =
    useRef<
      string | null
    >(null);

  const [
    hovered,
    setHovered,
  ] =
    useState<
      string | null
    >(null);

  useFrame(
    (state) => {
      if (
        rootRef.current
      ) {
        rootRef.current.position.y =
          Math.sin(
            state.clock
              .elapsedTime *
              0.36,
          ) *
          0.008;
      }

      updateMaterials(
        prepared.scene,

        camera.position.distanceTo(
          new THREE.Vector3(
            0,
            0,
            0,
          ),
        ),

        hoveredRef.current,

        selection?.name ??
          null,

        clippingPlane,
      );
    },
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor =
        "default";
    };
  }, []);

  function handlePointerOver(
    event:
      ThreeEvent<PointerEvent>,
  ) {
    event.stopPropagation();

    const mesh =
      event.object as
        THREE.Mesh;

    const name =
      mesh.userData
        .anatomicalName ||
      normalizeName(
        mesh.name,
      ) ||
      "Brain Structure";

    hoveredRef.current =
      name;

    setHovered(name);

    document.body.style.cursor =
      "pointer";
  }

  function handlePointerOut(
    event:
      ThreeEvent<PointerEvent>,
  ) {
    event.stopPropagation();

    hoveredRef.current =
      null;

    setHovered(null);

    document.body.style.cursor =
      "default";
  }

  function handleClick(
    event:
      ThreeEvent<MouseEvent>,
  ) {
    event.stopPropagation();

    const mesh =
      event.object as
        THREE.Mesh;

    const name =
      mesh.userData
        .anatomicalName ||
      normalizeName(
        mesh.name,
      ) ||
      "Brain Structure";

    const category =
      mesh.userData
        .category ||
      "Brain Anatomy";

    if (
      selection?.name ===
      name
    ) {
      onSelect?.(
        null,
      );

      return;
    }

    onSelect?.({
      name,
      category,
    });
  }

  /*
   * The GLB is geometrically centered,
   * then placed into a stable
   * neurological orientation.
   */
  return (
    <group
      ref={rootRef}
      rotation={[
        0,
        -Math.PI / 2,
        0,
      ]}
    >
      <group
        scale={
          prepared.scale
        }
      >
        <group
          position={[
            -prepared
              .center.x,

            -prepared
              .center.y,

            -prepared
              .center.z,
          ]}
          onPointerOver={
            handlePointerOver
          }
          onPointerOut={
            handlePointerOut
          }
          onClick={
            handleClick
          }
        >
          <primitive
            object={
              prepared.scene
            }
          />
        </group>
      </group>
    </group>
  );
}

/* ============================================================
   DEPTH OBSERVER
   ============================================================ */

function DepthObserver({
  onViewChange,
}: {
  onViewChange?: (
    view: string,
  ) => void;
}) {
  const camera =
    useThree(
      (state) =>
        state.camera,
    );

  const previous =
    useRef<
      DepthMode
    >("Surface");

  useFrame(() => {
    const distance =
      camera.position.length();

    let mode:
      DepthMode =
      "Surface";

    if (
      distance <
      3.75
    ) {
      mode =
        "Deep";
    } else if (
      distance <
      5.35
    ) {
      mode =
        "Mid Depth";
    }

    if (
      mode !==
      previous.current
    ) {
      previous.current =
        mode;

      onViewChange?.(
        mode,
      );
    }
  });

  return null;
}

/* ============================================================
   CAMERA PRESETS
   ============================================================ */

function CameraController({
  resetKey,

  viewMode,

  halfSide,

  controlsRef,
}: {
  resetKey: number;

  viewMode:
    BrainViewMode;

  halfSide:
    BrainHalfSide;

  controlsRef:
    React.RefObject<
      OrbitControlsImpl | null
    >;
}) {
  const camera =
    useThree(
      (state) =>
        state.camera,
    );

  useEffect(() => {
    /*
     * WHOLE BRAIN
     *
     * Slightly oblique
     * anatomical presentation.
     */
    if (
      viewMode === "whole"
    ) {
      camera.position.set(
        5.7,
        0.55,
        4.2,
      );
    }

    /*
     * LEFT HALF
     *
     * Right hemisphere removed.
     * Camera looks into the
     * medial surface.
     */
    if (
      viewMode ===
        "half" &&
      halfSide === "left"
    ) {
      camera.position.set(
        7.0,
        0.2,
        0.15,
      );
    }

    /*
     * RIGHT HALF
     */
    if (
      viewMode ===
        "half" &&
      halfSide === "right"
    ) {
      camera.position.set(
        -7.0,
        0.2,
        0.15,
      );
    }

    camera.lookAt(
      0,
      0,
      0,
    );

    controlsRef.current
      ?.target.set(
        0,
        0,
        0,
      );

    controlsRef.current
      ?.update();
  }, [
    resetKey,
    viewMode,
    halfSide,
    camera,
    controlsRef,
  ]);

  return null;
}

/* ============================================================
   ORIENTATION GUIDE
   ============================================================ */

function OrientationGuide() {
  return (
    <group
      position={[
        -2.85,
        -2.15,
        0,
      ]}
    >
      <Line
        points={[
          [0, 0, 0],
          [0.5, 0, 0],
        ]}
        color="#fb7185"
        lineWidth={1}
        transparent
        opacity={0.48}
      />

      <Line
        points={[
          [0, 0, 0],
          [0, 0.5, 0],
        ]}
        color="#4ade80"
        lineWidth={1}
        transparent
        opacity={0.48}
      />

      <Line
        points={[
          [0, 0, 0],
          [
            -0.25,
            -0.2,
            0.28,
          ],
        ]}
        color="#818cf8"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
    </group>
  );
}

/* ============================================================
   LIGHTING
   ============================================================ */

function Lighting() {
  return (
    <>
      <ambientLight
        intensity={1.08}
      />

      <directionalLight
        position={[
          5,
          6,
          7,
        ]}
        intensity={2.8}
        color="#67e8f9"
      />

      <directionalLight
        position={[
          -4,
          2,
          -5,
        ]}
        intensity={1.6}
        color="#a78bfa"
      />

      <pointLight
        position={[
          0,
          0,
          5,
        ]}
        intensity={9}
        color="#22d3ee"
      />

      <pointLight
        position={[
          0,
          -3,
          2,
        ]}
        intensity={5}
        color="#ec4899"
      />
    </>
  );
}

/* ============================================================
   LOADER
   ============================================================ */

function LoadingBrain() {
  const ref =
    useRef<THREE.Mesh>(
      null,
    );

  useFrame(
    (state) => {
      if (
        !ref.current
      ) {
        return;
      }

      ref.current.rotation.x =
        state.clock
          .elapsedTime *
        0.45;

      ref.current.rotation.y =
        state.clock
          .elapsedTime *
        0.65;
    },
  );

  return (
    <mesh ref={ref}>
      <icosahedronGeometry
        args={[0.8, 2]}
      />

      <meshStandardMaterial
        color="#67e8f9"
        emissive="#0891b2"
        emissiveIntensity={1}
        wireframe
      />
    </mesh>
  );
}

/* ============================================================
   MAIN
   ============================================================ */

export default function BrainScene({
  resetKey = 0,

  selection,

  viewMode,

  halfSide,

  onSelect,

  onViewChange,
}: BrainSceneProps) {
  const controlsRef =
    useRef<
      OrbitControlsImpl | null
    >(null);

  return (
    <div
      className="
        relative
        h-full
        w-full
      "
    >
      <Canvas
        camera={{
          position: [
            5.7,
            0.55,
            4.2,
          ],

          fov: 39,

          near: 0.01,

          far: 1000,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,

          alpha: true,

          powerPreference:
            "high-performance",
        }}
        onCreated={({
          gl,
        }) => {
          /*
           * Required for
           * half-brain clipping.
           */
          gl.localClippingEnabled =
            true;
        }}
        onPointerMissed={() => {
          onSelect?.(
            null,
          );
        }}
      >
        <Lighting />

        <Stars
          radius={35}
          depth={18}
          count={190}
          factor={0.65}
          saturation={0}
          fade
          speed={0.015}
        />

        <Suspense
          fallback={
            <LoadingBrain />
          }
        >
          <AnatomicalBrain
            selection={
              selection
            }
            viewMode={
              viewMode
            }
            halfSide={
              halfSide
            }
            onSelect={
              onSelect
            }
          />
        </Suspense>

        <OrientationGuide />

        <OrbitControls
          ref={
            controlsRef
          }
          makeDefault
          target={[
            0,
            0,
            0,
          ]}
          enableRotate
          enableZoom
          enablePan
          enableDamping
          dampingFactor={
            0.055
          }
          rotateSpeed={
            0.5
          }
          zoomSpeed={
            0.72
          }
          panSpeed={
            0.4
          }
          minDistance={
            2.15
          }
          maxDistance={
            11
          }
          zoomToCursor
        />

        <DepthObserver
          onViewChange={
            onViewChange
          }
        />

        <CameraController
          resetKey={
            resetKey
          }
          viewMode={
            viewMode
          }
          halfSide={
            halfSide
          }
          controlsRef={
            controlsRef
          }
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(
  "/models/brain/brain.glb",
);