"use client";

import {
  Activity,
  Brain,
  CircleGauge,
  Database,
  Dna,
  FlaskConical,
  HeartPulse,
  Orbit,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Waves,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getDigitalTwinSubject,
  runDigitalTwinSimulation,
  type DigitalTwinSubject,
  type ModalityState,
  type SimulationHorizon,
  type SimulationResponse,
  type SimulationScenario,
} from "@/services/digitalTwin";


const modules = [
  {
    name: "Command Center",
    icon: CircleGauge,
    href: "/",
  },
  {
    name: "Digital Twin",
    icon: Brain,
    href: "/digital-twin",
  },
  {
    name: "Brain Explorer",
    icon: Orbit,
    href: "/brain-explorer",
  },
  {
    name: "Fusion Lab",
    icon: FlaskConical,
    href: "/fusion-lab",
  },
  {
    name: "Datasets",
    icon: Database,
    href: "/datasets",
  },
];


const modalityIcons = {
  mri: Brain,
  eeg: Waves,
  genomics: Dna,
  proteomics: Sparkles,
  behavior: Activity,
};


export default function DigitalTwinPage() {
  const [
    twin,
    setTwin,
  ] = useState<DigitalTwinSubject | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    scenario,
    setScenario,
  ] = useState<SimulationScenario>(
    "baseline",
  );

  const [
    horizon,
    setHorizon,
  ] = useState<SimulationHorizon>(
    12,
  );

  const [
    simulation,
    setSimulation,
  ] = useState<SimulationResponse | null>(
    null,
  );

  const [
    simulationRunning,
    setSimulationRunning,
  ] = useState(false);


  useEffect(() => {
    async function loadTwin() {
      try {
        setLoading(true);

        const result =
          await getDigitalTwinSubject();

        setTwin(result);

        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to the Digital Twin API.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTwin();
  }, []);


  async function handleSimulation() {
    try {
      setSimulationRunning(true);

      const result =
        await runDigitalTwinSimulation({
          scenario,
          horizon_months: horizon,
        });

      setSimulation(result);

      setError(null);
    } catch (err) {
      console.error(err);

      setError(
        "Digital Twin simulation failed.",
      );
    } finally {
      setSimulationRunning(false);
    }
  }


  const activePrediction =
    useMemo(() => {
      if (simulation) {
        return {
          coefficient:
            simulation.predicted_coefficient,

          trajectory:
            simulation.change_percent,

          risk:
            simulation.risk_state,

          confidence:
            simulation.confidence,
        };
      }

      if (!twin) {
        return null;
      }

      return {
        coefficient:
          twin.prediction
            .predicted_coefficient,

        trajectory:
          twin.prediction
            .trajectory_percent,

        risk:
          twin.prediction
            .risk_state,

        confidence:
          twin.prediction
            .confidence,
      };
    }, [
      simulation,
      twin,
    ]);


  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-[#070a0f] px-4 py-5">
          <div className="mb-8 px-1">
            <p className="text-[11px] font-medium tracking-[0.32em] text-cyan-300">
              NEURO-SILICON
            </p>

            <h1 className="mt-2 text-lg font-semibold">
              Symbiosis Console
            </h1>
          </div>


          <nav className="space-y-2">
            {modules.map((item) => {
              const Icon = item.icon;

              const active =
                item.href ===
                "/digital-twin";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-cyan-400/10 text-cyan-200"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  {item.name}
                </Link>
              );
            })}
          </nav>


          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Twin Status
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  error
                    ? "bg-rose-400"
                    : twin
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                      : "bg-white/20"
                }`}
              />

              <span className="text-sm text-white/60">
                {error
                  ? "API Offline"
                  : loading
                    ? "Loading Twin"
                    : "Twin Ready"}
              </span>
            </div>
          </div>
        </aside>


        {/* =====================================================
            MAIN APP
        ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* HEADER */}

          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#05070b]/95 px-7 backdrop-blur-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Cognitive Resilience Research Platform
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Digital Twin
              </h2>
            </div>


            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                error
                  ? "border-rose-400/20 bg-rose-400/5 text-rose-300"
                  : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
              }`}
            >
              <ShieldCheck
                size={16}
              />

              {error
                ? "Backend Offline"
                : "Twin Engine Ready"}
            </div>
          </header>


          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="p-5">
            {loading && (
              <LoadingState />
            )}


            {!loading &&
              error &&
              !twin && (
                <ErrorState
                  message={error}
                />
              )}


            {!loading &&
              twin && (
                <div className="mx-auto grid max-w-[1700px] gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">

                  {/* =============================================
                      LEFT
                  ============================================= */}

                  <div className="space-y-5">

                    {/* SUBJECT + RESILIENCE */}

                    <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">

                      {/* SUBJECT PROFILE */}

                      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                        <div className="flex items-start justify-between gap-6">

                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                              <UserRound
                                size={26}
                                className="text-cyan-300"
                              />
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/65">
                                Active Subject
                              </p>

                              <h3 className="mt-1 text-xl font-semibold">
                                {twin.subject.display_name}
                              </h3>

                              <p className="mt-1 text-sm text-white/35">
                                {twin.subject.subject_id}
                                {" · "}
                                Longitudinal cognitive resilience twin
                              </p>
                            </div>
                          </div>


                          <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs text-emerald-300">
                            {twin.subject.cognitive_state}
                          </span>
                        </div>


                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                          <ProfileMetric
                            label="Age"
                            value={String(
                              twin.subject.age,
                            )}
                          />

                          <ProfileMetric
                            label="Sex"
                            value={twin.subject.sex}
                          />

                          <ProfileMetric
                            label="Visits"
                            value={String(
                              twin.subject.visits,
                            )}
                          />

                          <ProfileMetric
                            label="Window"
                            value={`${twin.subject.observation_window_months} mo`}
                          />
                        </div>


                        <div className="mt-6 border-t border-white/[0.07] pt-5">
                          <div className="grid gap-4 md:grid-cols-3">

                            <SubjectInfo
                              label="Cognitive State"
                              value={
                                twin.subject
                                  .cognitive_state
                              }
                              active
                            />

                            <SubjectInfo
                              label="Diagnosis"
                              value={
                                twin.subject
                                  .diagnosis
                              }
                            />

                            <SubjectInfo
                              label="Last Updated"
                              value={
                                twin.subject
                                  .last_updated
                              }
                            />
                          </div>
                        </div>
                      </div>


                      {/* RESILIENCE STATE */}

                      <div className="rounded-3xl border border-cyan-300/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_55%)] p-6">

                        <div className="flex items-center gap-2 text-cyan-300/75">
                          <HeartPulse
                            size={18}
                          />

                          <p className="text-[11px] uppercase tracking-[0.18em]">
                            Resilience State
                          </p>
                        </div>


                        <div className="mt-6 flex items-end justify-between gap-4">

                          <div>
                            <p className="text-5xl font-semibold tracking-tight">
                              ρ{" "}
                              {twin.resilience.coefficient.toFixed(
                                2,
                              )}
                            </p>

                            <p className="mt-2 text-sm text-white/40">
                              {
                                twin.resilience
                                  .classification
                              }
                            </p>
                          </div>


                          <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs text-emerald-300">
                            {twin.resilience.risk} Risk
                          </span>
                        </div>


                        <div className="mt-7">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/30">
                              Resilience Index
                            </span>

                            <span className="text-cyan-300">
                              {
                                twin.resilience
                                  .index_percent
                              }
                              %
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                              style={{
                                width: `${twin.resilience.index_percent}%`,
                              }}
                            />
                          </div>
                        </div>


                        <div className="mt-6 grid grid-cols-3 gap-3">
                          <StateMetric
                            label="Complexity"
                            value={twin.resilience.complexity.toFixed(
                              2,
                            )}
                          />

                          <StateMetric
                            label="Confidence"
                            value={`${Math.round(
                              twin.resilience
                                .confidence * 100,
                            )}%`}
                          />

                          <StateMetric
                            label="Risk"
                            value={
                              twin.resilience.risk
                            }
                          />
                        </div>
                      </div>
                    </section>


                    {/* =============================================
                        LONGITUDINAL TRAJECTORY
                    ============================================= */}

                    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">

                      <div className="flex items-start justify-between gap-6">

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/65">
                            Longitudinal Cognitive Trajectory
                          </p>

                          <p className="mt-1 text-sm text-white/35">
                            Resilience trend across recorded visits
                          </p>
                        </div>


                        <span className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/40">
                          {
                            twin.subject
                              .observation_window_months
                          }{" "}
                          Month Window
                        </span>
                      </div>


                      <div className="mt-7 grid grid-cols-5 gap-3">
                        {twin.trajectory.map(
                          (point) => (
                            <TrajectoryBar
                              key={point.label}
                              label={point.label}
                              value={
                                point.resilience_index
                              }
                            />
                          ),
                        )}
                      </div>
                    </section>


                    {/* =============================================
                        MODALITIES
                    ============================================= */}

                    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">

                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/65">
                          Multimodal Twin Inputs
                        </p>

                        <p className="mt-1 text-sm text-white/35">
                          Data availability reported directly by the backend
                        </p>
                      </div>


                      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {twin.modalities.map(
                          (modality) => (
                            <ModalityCard
                              key={
                                modality.key
                              }
                              modality={
                                modality
                              }
                            />
                          ),
                        )}
                      </div>
                    </section>
                  </div>


                  {/* =============================================
                      RIGHT RAIL
                  ============================================= */}

                  <aside className="space-y-5">

                    {/* SIMULATION CONTROL */}

                    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">

                      <div className="flex items-center gap-2 text-violet-300/75">
                        <Sparkles
                          size={18}
                        />

                        <p className="text-[11px] uppercase tracking-[0.18em]">
                          Twin Simulation
                        </p>
                      </div>


                      <div className="mt-5">
                        <label className="text-xs text-white/35">
                          Scenario
                        </label>

                        <select
                          value={scenario}
                          onChange={(
                            event,
                          ) =>
                            setScenario(
                              event.target
                                .value as SimulationScenario,
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-[#080c12] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/25"
                        >
                          <option value="baseline">
                            Baseline
                          </option>

                          <option value="accelerated_decline">
                            Accelerated Decline
                          </option>

                          <option value="resilience_intervention">
                            Resilience Intervention
                          </option>

                          <option value="high_stress">
                            High Stress
                          </option>
                        </select>
                      </div>


                      <div className="mt-4">
                        <label className="text-xs text-white/35">
                          Time Horizon
                        </label>

                        <select
                          value={horizon}
                          onChange={(
                            event,
                          ) =>
                            setHorizon(
                              Number(
                                event.target
                                  .value,
                              ) as SimulationHorizon,
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-[#080c12] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/25"
                        >
                          <option value={6}>
                            6 Months
                          </option>

                          <option value={12}>
                            12 Months
                          </option>

                          <option value={24}>
                            24 Months
                          </option>

                          <option value={36}>
                            36 Months
                          </option>
                        </select>
                      </div>


                      <button
                        type="button"
                        onClick={
                          handleSimulation
                        }
                        disabled={
                          simulationRunning
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.05] px-4 py-3 text-sm text-violet-200 transition hover:bg-violet-300/10 disabled:cursor-wait disabled:opacity-50"
                      >
                        {simulationRunning ? (
                          <>
                            <RefreshCcw
                              size={16}
                              className="animate-spin"
                            />

                            Simulating...
                          </>
                        ) : (
                          <>
                            <Play
                              size={16}
                            />

                            Run Simulation
                          </>
                        )}
                      </button>
                    </section>


                    {/* PREDICTION */}

                    <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

                      <div className="flex items-center gap-2 text-cyan-300/75">
                        <CircleGauge
                          size={18}
                        />

                        <p className="text-[11px] uppercase tracking-[0.18em]">
                          Twin Prediction
                        </p>
                      </div>


                      {activePrediction && (
                        <>
                          <div className="mt-5">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                              Predicted Resilience
                            </p>

                            <p className="mt-2 text-4xl font-semibold">
                              ρ{" "}
                              {activePrediction.coefficient.toFixed(
                                2,
                              )}
                            </p>
                          </div>


                          <div className="mt-6 space-y-4">

                            <PredictionRow
                              label="Trajectory"
                              value={`${activePrediction.trajectory > 0 ? "+" : ""}${activePrediction.trajectory.toFixed(
                                1,
                              )}%`}
                            />

                            <PredictionRow
                              label="Risk State"
                              value={
                                activePrediction.risk
                              }
                            />

                            <PredictionRow
                              label="Confidence"
                              value={`${Math.round(
                                activePrediction.confidence *
                                  100,
                              )}%`}
                            />

                            <PredictionRow
                              label="Source"
                              value={
                                simulation
                                  ? "Simulation"
                                  : "Baseline"
                              }
                            />
                          </div>
                        </>
                      )}
                    </section>


                    {/* 3D BRAIN LINK */}

                    <section className="rounded-3xl border border-cyan-300/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_60%)] p-5">

                      <div className="flex items-center gap-2 text-cyan-300/75">
                        <Brain
                          size={18}
                        />

                        <p className="text-[11px] uppercase tracking-[0.18em]">
                          3D Brain Link
                        </p>
                      </div>


                      <p className="mt-4 text-sm leading-6 text-white/40">
                        Return to the anatomical brain workspace and inspect the active subject in 3D.
                      </p>


                      <Link
                        href="/"
                        className="mt-5 flex w-full items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-sm text-cyan-200 transition hover:bg-cyan-300/10"
                      >
                        Open Brain Workspace
                      </Link>
                    </section>
                  </aside>
                </div>
              )}
          </div>
        </section>
      </div>
    </main>
  );
}


/* ============================================================
   UI HELPERS
   ============================================================ */


function LoadingState() {
  return (
    <div className="flex min-h-[620px] items-center justify-center">

      <div className="text-center">
        <RefreshCcw
          className="mx-auto animate-spin text-cyan-300"
        />

        <p className="mt-4 text-sm text-white/40">
          Loading Digital Twin...
        </p>
      </div>
    </div>
  );
}


function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[620px] items-center justify-center">

      <div className="max-w-md rounded-3xl border border-rose-400/15 bg-rose-400/[0.035] p-7 text-center">

        <p className="text-lg font-medium text-rose-200">
          Digital Twin unavailable
        </p>

        <p className="mt-3 text-sm leading-6 text-white/40">
          {message}
        </p>

        <p className="mt-3 text-xs text-white/25">
          Confirm FastAPI is running on port 8000.
        </p>
      </div>
    </div>
  );
}


function ProfileMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3">

      <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}


function SubjectInfo({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}

        <p
          className={`text-sm ${
            active
              ? "text-emerald-300/70"
              : "text-white/55"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}


function StateMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/10 p-3">

      <p className="text-[10px] uppercase tracking-[0.13em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}


function TrajectoryBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="flex h-[170px] items-end rounded-2xl border border-white/[0.06] bg-black/10 p-3">

        <div
          className="w-full rounded-xl bg-gradient-to-t from-cyan-500/50 to-violet-400/70 transition-all duration-500"
          style={{
            height: `${value}%`,
          }}
        />
      </div>


      <div className="mt-3 flex items-center justify-between gap-2">

        <span className="text-xs text-white/35">
          {label}
        </span>

        <span className="text-xs font-medium text-cyan-300">
          {value}
        </span>
      </div>
    </div>
  );
}


function ModalityCard({
  modality,
}: {
  modality: ModalityState;
}) {
  const Icon =
    modalityIcons[
      modality.key as keyof typeof modalityIcons
    ] ?? Activity;

  const ready =
    modality.status === "ready";

  const pending =
    modality.status === "pending";


  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">

      <div className="flex items-center justify-between">

        <Icon
          size={19}
          className={
            ready
              ? "text-cyan-300"
              : pending
                ? "text-violet-300/40"
                : "text-white/20"
          }
        />

        <span
          className={`h-2 w-2 rounded-full ${
            ready
              ? "bg-emerald-400"
              : pending
                ? "bg-violet-400/40"
                : "bg-white/15"
          }`}
        />
      </div>


      <p className="mt-4 text-sm font-medium">
        {modality.name}
      </p>

      <p className="mt-1 min-h-[38px] text-xs leading-5 text-white/30">
        {modality.description}
      </p>

      <p
        className={`mt-4 text-xs capitalize ${
          ready
            ? "text-emerald-300/70"
            : pending
              ? "text-violet-300/45"
              : "text-white/25"
        }`}
      >
        {modality.status}
      </p>
    </div>
  );
}


function PredictionRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-white/40">
        {label}
      </span>

      <span className="text-sm font-medium text-white/75">
        {value}
      </span>
    </div>
  );
}