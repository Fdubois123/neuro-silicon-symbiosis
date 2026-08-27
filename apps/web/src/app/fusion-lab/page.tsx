"use client";

import {
  Activity,
  Brain,
  CircleGauge,
  Database,
  Dna,
  FlaskConical,
  Gauge,
  Orbit,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getFusionState,
  runAblation,
  runFusion,
  type AblationResponse,
  type ContributionResult,
  type FusionRunResponse,
  type FusionStateResponse,
  type ModalityName,
} from "@/services/fusion";


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
    href: "/",
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
  MRI: Brain,
  EEG: Waves,
  Genomics: Dna,
  Proteomics: Sparkles,
  Behavior: Activity,
};


export default function FusionLabPage() {
  const [
    state,
    setState,
  ] = useState<
    FusionStateResponse | null
  >(null);

  const [
    activeModalities,
    setActiveModalities,
  ] = useState<
    ModalityName[]
  >([]);

  const [
    fusionResult,
    setFusionResult,
  ] = useState<
    FusionRunResponse | null
  >(null);

  const [
    ablation,
    setAblation,
  ] = useState<
    AblationResponse | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    fusionRunning,
    setFusionRunning,
  ] = useState(false);

  const [
    ablationRunning,
    setAblationRunning,
  ] = useState<
    ModalityName | null
  >(null);

  const [
    configurationDirty,
    setConfigurationDirty,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  useEffect(() => {
    async function loadState() {
      try {
        setLoading(true);

        const result =
          await getFusionState();

        setState(result);

        setActiveModalities(
          result.modalities.map(
            (item) => item.name,
          ),
        );

        setConfigurationDirty(
          false,
        );

        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to the Fusion Lab API.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadState();
  }, []);


  function toggleModality(
    modality: ModalityName,
  ) {
    setActiveModalities(
      (current) =>
        current.includes(
          modality,
        )
          ? current.filter(
              (item) =>
                item !== modality,
            )
          : [
              ...current,
              modality,
            ],
    );

    setConfigurationDirty(true);
    setAblation(null);
  }


  function resetFusion() {
    if (!state) {
      return;
    }

    setActiveModalities(
      state.modalities.map(
        (item) => item.name,
      ),
    );

    setFusionResult(null);
    setAblation(null);

    setConfigurationDirty(false);
    setError(null);
  }


  async function handleRunFusion() {
    if (
      activeModalities.length ===
      0
    ) {
      return;
    }

    try {
      setFusionRunning(true);

      const result =
        await runFusion(
          activeModalities,
        );

      setFusionResult(result);

      setConfigurationDirty(false);
      setAblation(null);
      setError(null);
    } catch (err) {
      console.error(err);

      setError(
        "Fusion inference failed.",
      );
    } finally {
      setFusionRunning(false);
    }
  }


  async function handleAblation(
    modality: ModalityName,
  ) {
    try {
      setAblationRunning(
        modality,
      );

      const result =
        await runAblation(
          modality,
        );

      setAblation(result);
      setError(null);
    } catch (err) {
      console.error(err);

      setError(
        "Ablation analysis failed.",
      );
    } finally {
      setAblationRunning(null);
    }
  }


  const latentVector =
    fusionResult?.latent_vector ??
    state?.baseline_latent_vector ??
    [];

  const latentMetrics =
    fusionResult?.latent_metrics ??
    state?.baseline_latent_metrics ??
    null;


  const contributions =
    useMemo(() => {
      if (
        fusionResult &&
        !configurationDirty
      ) {
        return (
          fusionResult.contributions
        );
      }

      if (!state) {
        return [];
      }

      const selected =
        state.modalities.filter(
          (item) =>
            activeModalities.includes(
              item.name,
            ),
        );

      const total =
        selected.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            item.baseline_contribution_percent,
          0,
        );

      if (total <= 0) {
        return [];
      }

      return selected.map(
        (item) => ({
          name: item.name,

          contribution_percent:
            (
              item.baseline_contribution_percent /
              total
            ) * 100,
        }),
      ) as ContributionResult[];
    }, [
      activeModalities,
      configurationDirty,
      fusionResult,
      state,
    ]);


  const currentRho =
    fusionResult?.predicted_rho ??
    state?.baseline_rho ??
    0;

  const currentConfidence =
    fusionResult?.confidence ??
    state?.baseline_confidence ??
    0;

  const currentRisk =
    fusionResult?.risk_state ??
    (
      currentRho >= 0.70
        ? "Low"
        : currentRho >= 0.50
          ? "Moderate"
          : "High"
    );


  if (loading) {
    return (
      <LoadingState />
    );
  }


  if (
    error &&
    !state
  ) {
    return (
      <ErrorState
        message={error}
      />
    );
  }


  if (!state) {
    return null;
  }


  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

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
            {modules.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  item.href ===
                  "/fusion-lab";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-cyan-400/10 text-cyan-200"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                    />

                    {item.name}
                  </Link>
                );
              },
            )}
          </nav>


          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Fusion Status
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  error
                    ? "bg-rose-400"
                    : fusionRunning
                      ? "bg-violet-400"
                      : "bg-emerald-400"
                }`}
              />

              <span className="text-sm text-white/60">
                {error
                  ? "API Offline"
                  : fusionRunning
                    ? "Fusion Running"
                    : "Fusion Ready"}
              </span>
            </div>
          </div>
        </aside>


        {/* MAIN */}

        <section className="min-w-0 flex-1">

          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#05070b]/95 px-6 backdrop-blur-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Cognitive Resilience Research Platform
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Fusion Lab
              </h2>
            </div>


            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2 text-sm text-emerald-300">
              <ShieldCheck
                size={16}
              />

              Fusion Engine Ready
            </div>
          </header>


          <div className="p-5">

            <div className="mx-auto grid max-w-[1720px] gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">

              {/* LEFT */}

              <div className="space-y-5">

                {/* PIPELINE */}

                <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-start justify-between gap-5">

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/70">
                        Multimodal Fusion Pipeline
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        Resilience Representation Engine
                      </h3>

                      <p className="mt-2 text-sm text-white/35">
                        Selected modalities are encoded and transformed into a shared latent representation.
                      </p>
                    </div>


                    <div className="rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3 text-right">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Active Inputs
                      </p>

                      <p className="mt-1 text-xl font-semibold text-cyan-300">
                        {activeModalities.length}/5
                      </p>
                    </div>
                  </div>


                  <div className="mt-6 grid gap-3 lg:grid-cols-3">
                    <PipelineCard
                      title="Modality Encoders"
                      value={`${activeModalities.length} ACTIVE`}
                    />

                    <PipelineCard
                      title="Latent Fusion"
                      value={`${state.latent_dimensions}D`}
                      emphasized
                    />

                    <PipelineCard
                      title="Resilience Head"
                      value={
                        fusionResult?.fusion_state ??
                        "READY"
                      }
                    />
                  </div>
                </section>


                {/* MODALITIES */}

                <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/70">
                        Modality Controls
                      </p>

                      <p className="mt-1 text-sm text-white/35">
                        Select inputs included in the next fusion run.
                      </p>
                    </div>


                    <button
                      type="button"
                      onClick={resetFusion}
                      className="rounded-xl border border-white/[0.07] px-3 py-2 text-xs text-white/40 hover:text-cyan-300"
                    >
                      Reset
                    </button>
                  </div>


                  {configurationDirty && (
                    <div className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[0.03] px-4 py-3 text-xs text-amber-200/70">
                      Configuration changed. Run Fusion to update the latent representation and prediction.
                    </div>
                  )}


                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                    {state.modalities.map(
                      (modality) => {
                        const Icon =
                          modalityIcons[
                            modality.name
                          ];

                        const enabled =
                          activeModalities.includes(
                            modality.name,
                          );

                        return (
                          <button
                            key={modality.name}
                            type="button"
                            onClick={() =>
                              toggleModality(
                                modality.name,
                              )
                            }
                            className={`rounded-2xl border p-4 text-left transition ${
                              enabled
                                ? "border-cyan-300/15 bg-cyan-300/[0.035]"
                                : "border-white/[0.06] bg-black/10 opacity-40"
                            }`}
                          >
                            <div className="flex items-center justify-between">

                              <Icon
                                size={19}
                                className={
                                  enabled
                                    ? "text-cyan-300"
                                    : "text-white/20"
                                }
                              />

                              <span
                                className={`h-2 w-2 rounded-full ${
                                  modality.status ===
                                  "ready"
                                    ? "bg-emerald-400"
                                    : "bg-violet-400/50"
                                }`}
                              />
                            </div>


                            <p className="mt-3 text-sm font-medium">
                              {modality.name}
                            </p>

                            <p className="mt-1 min-h-[36px] text-xs leading-5 text-white/30">
                              {modality.description}
                            </p>

                            <div className="mt-3 flex justify-between text-xs">

                              <span className="text-cyan-300/65">
                                {enabled
                                  ? "Included"
                                  : "Excluded"}
                              </span>

                              <span className="capitalize text-white/25">
                                {modality.status}
                              </span>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </section>


                {/* CONTRIBUTION + LATENT */}

                <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">

                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">

                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/70">
                      Contribution Analysis
                    </p>


                    <div className="mt-5 space-y-4">

                      {contributions.map(
                        (item) => (
                          <ContributionRow
                            key={item.name}
                            label={item.name}
                            value={
                              item.contribution_percent
                            }
                          />
                        ),
                      )}


                      {contributions.length ===
                        0 && (
                        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4 text-sm text-white/30">
                          No modalities selected.
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="rounded-3xl border border-violet-300/10 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_60%)] p-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2 text-violet-300/75">
                        <Sparkles
                          size={18}
                        />

                        <p className="text-[11px] uppercase tracking-[0.18em]">
                          Latent Fusion State
                        </p>
                      </div>


                      <span className="text-xs text-white/25">
                        Z₃₂ preview / Z₂₅₆ model
                      </span>
                    </div>


                    <LatentMap
                      vector={latentVector}
                    />


                    <div className="mt-5 grid grid-cols-3 gap-3">

                      <MetricCard
                        label="Energy"
                        value={
                          latentMetrics
                            ? latentMetrics.energy.toFixed(
                                3,
                              )
                            : "—"
                        }
                      />

                      <MetricCard
                        label="Coherence"
                        value={
                          latentMetrics
                            ? latentMetrics.coherence.toFixed(
                                3,
                              )
                            : "—"
                        }
                      />

                      <MetricCard
                        label="Entropy"
                        value={
                          latentMetrics
                            ? latentMetrics.entropy.toFixed(
                                3,
                              )
                            : "—"
                        }
                      />
                    </div>
                  </div>
                </section>


                {/* ABLATION RESULT */}

                {ablation && (
                  <section className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.025] p-5">

                    <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300/75">
                      Ablation Result
                    </p>


                    <div className="mt-4 grid gap-3 sm:grid-cols-5">

                      <MetricCard
                        label="Removed"
                        value={
                          ablation.excluded_modality
                        }
                      />

                      <MetricCard
                        label="Baseline ρ"
                        value={
                          ablation.baseline_rho.toFixed(
                            3,
                          )
                        }
                      />

                      <MetricCard
                        label="Ablated ρ"
                        value={
                          ablation.ablated_rho.toFixed(
                            3,
                          )
                        }
                      />

                      <MetricCard
                        label="Change"
                        value={`${ablation.rho_change_percent}%`}
                      />

                      <MetricCard
                        label="Latent Shift"
                        value={
                          ablation.latent_shift.toFixed(
                            3,
                          )
                        }
                      />
                    </div>


                    <p className="mt-4 text-sm leading-6 text-white/40">
                      {ablation.interpretation}
                    </p>
                  </section>
                )}
              </div>


              {/* RIGHT RAIL */}

              <aside className="space-y-5">

                <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

                  <div className="flex items-center gap-2 text-cyan-300/75">
                    <Gauge
                      size={18}
                    />

                    <p className="text-[11px] uppercase tracking-[0.18em]">
                      Fusion Output
                    </p>
                  </div>


                  <p className="mt-5 text-4xl font-semibold">
                    ρ {currentRho.toFixed(3)}
                  </p>


                  <div className="mt-6 space-y-4">

                    <OutputRow
                      label="Confidence"
                      value={`${Math.round(
                        currentConfidence *
                          100,
                      )}%`}
                    />

                    <OutputRow
                      label="Risk"
                      value={currentRisk}
                    />

                    <OutputRow
                      label="Inputs"
                      value={`${activeModalities.length}/5`}
                    />

                    <OutputRow
                      label="Source"
                      value={
                        fusionResult
                          ? "Fusion Run"
                          : "Baseline"
                      }
                    />
                  </div>
                </section>


                <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">

                  <div className="flex items-center gap-2 text-violet-300/75">
                    <FlaskConical
                      size={18}
                    />

                    <p className="text-[11px] uppercase tracking-[0.18em]">
                      Fusion Control
                    </p>
                  </div>


                  <button
                    type="button"
                    onClick={
                      handleRunFusion
                    }
                    disabled={
                      fusionRunning ||
                      activeModalities.length ===
                        0
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.05] px-4 py-3 text-sm text-violet-200 hover:bg-violet-300/10 disabled:opacity-40"
                  >

                    {fusionRunning ? (
                      <>
                        <RefreshCcw
                          size={16}
                          className="animate-spin"
                        />

                        Running Fusion...
                      </>
                    ) : (
                      <>
                        <Play
                          size={16}
                        />

                        Run Fusion
                      </>
                    )}
                  </button>
                </section>


                <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">

                  <div className="flex items-center gap-2 text-amber-300/75">
                    <Activity
                      size={18}
                    />

                    <p className="text-[11px] uppercase tracking-[0.18em]">
                      Ablation Analysis
                    </p>
                  </div>


                  <div className="mt-4 space-y-2">

                    {state.modalities.map(
                      (modality) => (
                        <button
                          key={modality.name}
                          type="button"
                          disabled={
                            ablationRunning !==
                            null
                          }
                          onClick={() =>
                            handleAblation(
                              modality.name,
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-white/45 hover:text-amber-200 disabled:opacity-40"
                        >

                          <span>
                            Remove {modality.name}
                          </span>

                          {ablationRunning ===
                          modality.name ? (
                            <RefreshCcw
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <span className="text-xs text-white/20">
                              Test
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </section>


                <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/75">
                    Research Links
                  </p>


                  <Link
                    href="/digital-twin"
                    className="mt-4 flex justify-center rounded-xl border border-cyan-300/15 px-4 py-3 text-sm text-cyan-200"
                  >
                    Open Digital Twin
                  </Link>


                  <Link
                    href="/"
                    className="mt-2 flex justify-center rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-white/55"
                  >
                    Open Brain Workspace
                  </Link>
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
   LATENT VISUALIZATION
   ============================================================ */


function LatentMap({
  vector,
}: {
  vector: number[];
}) {
  return (
    <div className="mt-5">

      <div className="grid grid-cols-8 gap-2">

        {vector.map(
          (
            value,
            index,
          ) => {
            const magnitude =
              Math.min(
                1,
                Math.abs(
                  value,
                ),
              );

            const positive =
              value >= 0;

            const background =
              positive
                ? `rgba(34, 211, 238, ${
                    0.12 +
                    magnitude *
                      0.75
                  })`
                : `rgba(168, 85, 247, ${
                    0.12 +
                    magnitude *
                      0.75
                  })`;

            return (
              <div
                key={index}
                title={`Z${index + 1}: ${value.toFixed(
                  4,
                )}`}
                className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.06]"
                style={{
                  background,
                }}
              >
                <div
                  className="absolute inset-x-0 bottom-0 bg-white/15"
                  style={{
                    height: `${magnitude * 100}%`,
                  }}
                />

                <span className="absolute bottom-1 right-1 text-[8px] text-white/35">
                  {index + 1}
                </span>
              </div>
            );
          },
        )}
      </div>


      <div className="mt-4 flex items-center justify-between text-xs text-white/30">

        <span>
          Cyan = positive activation
        </span>

        <span>
          Violet = negative activation
        </span>
      </div>
    </div>
  );
}


/* ============================================================
   UI HELPERS
   ============================================================ */


function PipelineCard({
  title,
  value,
  emphasized = false,
}: {
  title: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        emphasized
          ? "border-violet-300/15 bg-violet-300/[0.04]"
          : "border-white/[0.07] bg-black/10"
      }`}
    >

      <p className="text-sm text-white/70">
        {title}
      </p>

      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-cyan-300/70">
        {value}
      </p>
    </div>
  );
}


function ContributionRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="flex justify-between text-sm">

        <span className="text-white/55">
          {label}
        </span>

        <span className="text-cyan-300">
          {value.toFixed(2)}%
        </span>
      </div>


      <div className="mt-2 h-2 rounded-full bg-white/[0.07]">

        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
          style={{
            width: `${Math.min(
              100,
              value,
            )}%`,
          }}
        />
      </div>
    </div>
  );
}


function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/10 p-3">

      <p className="text-[9px] uppercase tracking-[0.13em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm text-white/70">
        {value}
      </p>
    </div>
  );
}


function OutputRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b border-white/[0.05] pb-3 last:border-0">

      <span className="text-sm text-white/40">
        {label}
      </span>

      <span className="text-sm text-white/70">
        {value}
      </span>
    </div>
  );
}


function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] text-white">

      <div className="text-center">
        <RefreshCcw className="mx-auto animate-spin text-cyan-300" />

        <p className="mt-4 text-sm text-white/40">
          Loading Fusion Lab...
        </p>
      </div>
    </main>
  );
}


function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] text-white">

      <div className="rounded-3xl border border-rose-400/15 bg-rose-400/[0.035] p-7">

        <p className="text-rose-200">
          Fusion Lab unavailable
        </p>

        <p className="mt-3 text-sm text-white/40">
          {message}
        </p>
      </div>
    </main>
  );
}