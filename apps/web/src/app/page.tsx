"use client";

import {
  Activity,
  Brain,
  CircleGauge,
  Database,
  FlaskConical,
  Focus,
  Layers3,
  Orbit,
  RotateCcw,
  ShieldCheck,
  SplitSquareHorizontal,
} from "lucide-react";

import { useState } from "react";

import BrainScene, {
  type BrainHalfSide,
  type BrainSelection,
  type BrainViewMode,
} from "@/components/brain/BrainScene";

const modules = [
  {
    name: "Command Center",
    icon: CircleGauge,
  },
  {
    name: "Digital Twin",
    icon: Brain,
  },
  {
    name: "Brain Explorer",
    icon: Orbit,
  },
  {
    name: "Fusion Lab",
    icon: FlaskConical,
  },
  {
    name: "Datasets",
    icon: Database,
  },
];

const modalities = [
  "MRI",
  "EEG",
  "Genomics",
  "Proteomics",
  "Behavior",
];

export default function Home() {
  const [resetKey, setResetKey] = useState(0);

  const [selection, setSelection] =
    useState<BrainSelection>(null);

  const [viewMode, setViewMode] =
    useState<BrainViewMode>("whole");

  const [halfSide, setHalfSide] =
    useState<BrainHalfSide>("left");

  const [depthMode, setDepthMode] =
    useState("Surface");

  function resetView() {
    setResetKey((value) => value + 1);
    setSelection(null);
    setDepthMode("Surface");
  }

  function switchToWholeBrain() {
    setViewMode("whole");
    setSelection(null);
    setDepthMode("Surface");
    setResetKey((value) => value + 1);
  }

  function switchToHalfBrain() {
    setViewMode("half");
    setSelection(null);
    setDepthMode("Surface");
    setResetKey((value) => value + 1);
  }

  function switchHalfSide(side: BrainHalfSide) {
    setHalfSide(side);
    setSelection(null);
    setDepthMode("Surface");
    setResetKey((value) => value + 1);
  }

  return (
    <main className="h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="flex h-full">
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="flex w-60 shrink-0 flex-col border-r border-white/10 bg-[#070a0f] px-4 py-5">
          <div className="mb-8 px-1">
            <p className="text-[11px] font-medium tracking-[0.32em] text-cyan-300">
              NEURO-SILICON
            </p>

            <h1 className="mt-2 text-lg font-semibold">
              Symbiosis Console
            </h1>
          </div>

          <nav className="space-y-2">
            {modules.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    index === 0
                      ? "bg-cyan-400/10 text-cyan-200"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />

                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Workspace
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

              <span className="text-sm text-white/60">
                Research Mode
              </span>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN APPLICATION
        ===================================================== */}

        <section className="min-w-0 flex-1">
          {/* HEADER */}

          <header className="flex h-[72px] items-center justify-between border-b border-white/10 px-7">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Cognitive Resilience Research Platform
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Neuro Command Center
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
              <ShieldCheck size={16} />

              System Operational
            </div>
          </header>

          {/* =====================================================
              DASHBOARD
          ===================================================== */}

          <div className="h-[calc(100vh-72px)] overflow-hidden p-5">
            <div className="grid h-full grid-cols-[minmax(0,1fr)_300px] gap-5">
              {/* =================================================
                  MAIN LEFT COLUMN
              ================================================= */}

              <div className="flex min-w-0 flex-col gap-4">
                {/* ===============================================
                    BRAIN WORKSPACE
                =============================================== */}

                <section className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[#060b11]">
                  {/* GRID */}

                  <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(103,232,249,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.22) 1px, transparent 1px)",
                      backgroundSize: "44px 44px",
                    }}
                  />

                  {/* GLOW */}

                  <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.11),transparent_60%)]" />

                  {/* TOP LEFT */}

                  <div className="pointer-events-none absolute left-6 top-5 z-30">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/75">
                      Neural Visualization Core
                    </p>

                    <p className="mt-1.5 text-xs text-white/40">
                      NS-3D Anatomical Explorer
                    </p>
                  </div>

                  {/* TOP RIGHT */}

                  <div className="pointer-events-none absolute right-6 top-5 z-30 text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Render Engine
                    </p>

                    <div className="mt-1.5 flex items-center justify-end gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />

                      <span className="text-xs text-cyan-200/65">
                        WebGL Active
                      </span>
                    </div>
                  </div>

                  {/* =============================================
                      VIEW CONTROL PANEL
                  ============================================= */}

                  <div className="absolute left-5 top-24 z-40 w-[185px] rounded-2xl border border-white/10 bg-[#05070b]/90 p-4 backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                      View Mode
                    </p>

                    <div className="mt-3 space-y-2">
                      <ViewButton
                        label="Whole Brain"
                        active={viewMode === "whole"}
                        icon={<Brain size={16} />}
                        onClick={switchToWholeBrain}
                      />

                      <ViewButton
                        label="Half Brain"
                        active={viewMode === "half"}
                        icon={
                          <SplitSquareHorizontal
                            size={16}
                          />
                        }
                        onClick={switchToHalfBrain}
                      />
                    </div>

                    {viewMode === "half" && (
                      <>
                        <div className="my-4 h-px bg-white/[0.07]" />

                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                          Hemisphere
                        </p>

                        <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-lg border border-white/10">
                          <SideButton
                            label="Left"
                            active={halfSide === "left"}
                            onClick={() =>
                              switchHalfSide("left")
                            }
                          />

                          <SideButton
                            label="Right"
                            active={halfSide === "right"}
                            onClick={() =>
                              switchHalfSide("right")
                            }
                          />
                        </div>
                      </>
                    )}

                    <div className="my-4 h-px bg-white/[0.07]" />

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                        Depth
                      </p>

                      <span className="text-xs font-medium text-cyan-300">
                        {depthMode}
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500 ${
                          depthMode === "Surface"
                            ? "w-1/3"
                            : depthMode ===
                                "Mid Depth"
                              ? "w-2/3"
                              : "w-full"
                        }`}
                      />
                    </div>

                    <div className="my-4 h-px bg-white/[0.07]" />

                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                      Anatomy Contrast
                    </p>

                    <div className="mt-3 space-y-2">
                      <Legend
                        color="#25c8f5"
                        label="Cortex"
                      />

                      <Legend
                        color="#8b5cf6"
                        label="Internal Brain"
                      />

                      <Legend
                        color="#d9f7ff"
                        label="White Matter"
                      />

                      <Legend
                        color="#f59e0b"
                        label="Deep Nuclei"
                      />

                      <Legend
                        color="#ec4899"
                        label="Cerebellum"
                      />

                      <Legend
                        color="#22c55e"
                        label="Hovered"
                      />

                      <Legend
                        color="#facc15"
                        label="Selected"
                      />
                    </div>
                  </div>

                  {/* 3D ENGINE */}

                  <div className="absolute inset-0 z-10">
                    <BrainScene
                      resetKey={resetKey}
                      selection={selection}
                      viewMode={viewMode}
                      halfSide={halfSide}
                      onSelect={setSelection}
                      onViewChange={setDepthMode}
                    />
                  </div>

                  {/* INTERACTION BAR */}

                  <div className="pointer-events-none absolute bottom-5 left-1/2 z-40 -translate-x-1/2">
                    <div className="flex items-center gap-4 rounded-full border border-white/10 bg-[#05070b]/90 px-5 py-3 backdrop-blur-xl">
                      <ControlHint
                        action="DRAG"
                        result="ROTATE"
                      />

                      <Divider />

                      <ControlHint
                        action="SCROLL"
                        result="DIVE"
                      />

                      <Divider />

                      <ControlHint
                        action="CLICK"
                        result="SELECT"
                      />

                      <Divider />

                      <ControlHint
                        action="R-DRAG"
                        result="PAN"
                      />
                    </div>
                  </div>
                </section>

                {/* ===============================================
                    BOTTOM INFO BAR
                =============================================== */}

                <div className="grid h-[150px] shrink-0 grid-cols-[1.15fr_0.85fr] gap-4">
                  {/* SELECTED ANATOMY */}

                  <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Focus
                          size={16}
                          className={
                            selection
                              ? "text-yellow-300"
                              : "text-white/30"
                          }
                        />

                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                          Selected Anatomy
                        </p>
                      </div>

                      {selection && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelection(null)
                          }
                          className="text-[10px] uppercase tracking-[0.14em] text-white/30 transition hover:text-yellow-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {selection ? (
                      <div className="mt-4 flex items-end justify-between gap-6">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-yellow-100">
                            {selection.name}
                          </p>

                          <p className="mt-1 text-sm text-white/40">
                            {selection.category}
                          </p>
                        </div>

                        <div className="grid shrink-0 grid-cols-3 gap-2">
                          <MiniMetric
                            title="MRI"
                            value="Ready"
                          />

                          <MiniMetric
                            title="XAI"
                            value="Pending"
                          />

                          <MiniMetric
                            title="State"
                            value="Selected"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-sm text-white/45">
                          No anatomical region selected.
                        </p>

                        <p className="mt-2 text-xs text-white/25">
                          Hover = green · Click = yellow
                        </p>
                      </div>
                    )}
                  </section>

                  {/* VIEW STATUS */}

                  <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers3
                          size={16}
                          className="text-cyan-300/65"
                        />

                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                          View Status
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={resetView}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/30 transition hover:text-cyan-300"
                      >
                        <RotateCcw size={13} />
                        Reset
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                      <StatusRow
                        label="View"
                        value={
                          viewMode === "whole"
                            ? "Whole Brain"
                            : `${
                                halfSide === "left"
                                  ? "Left"
                                  : "Right"
                              } Half`
                        }
                      />

                      <StatusRow
                        label="Depth"
                        value={depthMode}
                      />

                      <StatusRow
                        label="Engine"
                        value="WebGL"
                        active
                      />

                      <StatusRow
                        label="Interaction"
                        value="Live 3D"
                        active
                      />
                    </div>
                  </section>
                </div>
              </div>

              {/* =================================================
                  RIGHT INTELLIGENCE RAIL
              ================================================= */}

              <aside className="flex min-h-0 flex-col gap-4">
                <MetricCard
                  title="Resilience Coefficient"
                  value="ρ —"
                  subtitle="Awaiting subject data"
                  icon={<Activity size={18} />}
                />

                <MetricCard
                  title="Neural Complexity"
                  value="—"
                  subtitle="No active digital twin"
                  icon={<Brain size={18} />}
                />

                <MetricCard
                  title="Model Confidence"
                  value="—"
                  subtitle="Inference not started"
                  icon={<CircleGauge size={18} />}
                />

                <section className="min-h-0 flex-1 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    Active Modalities
                  </p>

                  <div className="mt-5 space-y-4">
                    {modalities.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-white/65">
                            {item}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/25">
                            Not loaded
                          </p>
                        </div>

                        <span className="h-2 w-2 rounded-full bg-white/15" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-white/[0.07] pt-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                      Multimodal Fusion
                    </p>

                    <p className="mt-2 text-sm leading-5 text-white/40">
                      Waiting for subject data.
                    </p>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function ViewButton({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition ${
        active
          ? "bg-cyan-400/12 text-cyan-200"
          : "text-white/45 hover:bg-white/5 hover:text-white/75"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SideButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2.5 text-xs transition ${
        active
          ? "bg-cyan-400/15 text-cyan-200"
          : "text-white/40 hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 7px ${color}66`,
        }}
      />

      <span className="text-[11px] text-white/45">
        {label}
      </span>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-cyan-300/75">
        {icon}

        <p className="text-[11px] uppercase tracking-[0.16em]">
          {title}
        </p>
      </div>

      <p className="mt-4 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/35">
        {subtitle}
      </p>
    </div>
  );
}

function MiniMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="min-w-[78px] rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-[0.12em] text-white/25">
        {title}
      </p>

      <p className="mt-1 text-xs text-white/60">
        {value}
      </p>
    </div>
  );
}

function ControlHint({
  action,
  result,
}: {
  action: string;
  result: string;
}) {
  return (
    <span className="text-[10px] tracking-[0.12em]">
      <span className="text-white/25">
        {action}
      </span>

      <span className="ml-2 text-cyan-300/75">
        {result}
      </span>
    </span>
  );
}

function Divider() {
  return (
    <span className="h-3 w-px bg-white/10" />
  );
}

function StatusRow({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <div className="flex items-center gap-2">
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}

        <span
          className={`text-xs ${
            active
              ? "text-emerald-300/75"
              : "text-white/60"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}