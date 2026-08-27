"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Brain,
  ChevronRight,
  CircleGauge,
  Database,
  ExternalLink,
  FlaskConical,
  Layers3,
  Orbit,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Target,
  Waves,
  X,
} from "lucide-react";

import {
  getBrainOverlay,
  getBrainRegionDetail,
  getBrainRegions,
  getBrainSummary,
  type BrainOverlayResponse,
  type BrainRegion,
  type BrainRegionDetailResponse,
  type BrainRegionListResponse,
  type BrainSummary,
  type Hemisphere,
  type OverlayMode,
  type RegionCategory,
  type RegionStatus,
} from "@/services/brainExplorer";


/* ============================================================
   NAVIGATION
   ============================================================ */

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


const overlayOptions: Array<{
  value: OverlayMode;
  label: string;
}> = [
  {
    value: "anatomy",
    label: "Anatomy",
  },
  {
    value: "resilience",
    label: "Resilience",
  },
  {
    value: "complexity",
    label: "Complexity",
  },
  {
    value: "atrophy",
    label: "Atrophy",
  },
  {
    value: "confidence",
    label: "Confidence",
  },
];


const hemisphereOptions: Array<
  Hemisphere | "all"
> = [
  "all",
  "left",
  "right",
  "bilateral",
];


const categoryOptions: Array<
  RegionCategory | "all"
> = [
  "all",
  "cortical",
  "subcortical",
  "limbic",
  "cerebellar",
];


/* ============================================================
   PAGE
   ============================================================ */

export default function BrainExplorerPage() {
  const [
    summary,
    setSummary,
  ] =
    useState<
      BrainSummary | null
    >(null);

  const [
    regions,
    setRegions,
  ] =
    useState<
      BrainRegionListResponse | null
    >(null);

  const [
    overlay,
    setOverlay,
  ] =
    useState<
      BrainOverlayResponse | null
    >(null);

  const [
    selectedDetail,
    setSelectedDetail,
  ] =
    useState<
      BrainRegionDetailResponse | null
    >(null);

  const [
    selectedRegionId,
    setSelectedRegionId,
  ] =
    useState<
      string | null
    >(null);

  const [
    subjectId,
    setSubjectId,
  ] =
    useState(
      "NS-001",
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    hemisphere,
    setHemisphere,
  ] =
    useState<
      Hemisphere | "all"
    >("all");

  const [
    category,
    setCategory,
  ] =
    useState<
      RegionCategory | "all"
    >("all");

  const [
    overlayMode,
    setOverlayMode,
  ] =
    useState<OverlayMode>(
      "resilience",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    regionLoading,
    setRegionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  async function loadWorkspace() {
    try {
      setLoading(true);
      setError(null);

      const [
        summaryData,
        regionData,
        overlayData,
      ] =
        await Promise.all([
          getBrainSummary(
            subjectId,
          ),

          getBrainRegions({
            subject_id:
              subjectId,

            hemisphere:
              hemisphere ===
              "all"
                ? ""
                : hemisphere,

            category:
              category ===
              "all"
                ? ""
                : category,

            overlay:
              overlayMode,
          }),

          getBrainOverlay(
            overlayMode,
            subjectId,
          ),
        ]);

      setSummary(
        summaryData,
      );

      setRegions(
        regionData,
      );

      setOverlay(
        overlayData,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Brain Explorer.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function selectRegion(
    regionId: string,
  ) {
    try {
      setRegionLoading(
        true,
      );

      const detail =
        await getBrainRegionDetail(
          regionId,
          subjectId,
        );

      setSelectedRegionId(
        regionId,
      );

      setSelectedDetail(
        detail,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load brain region.",
      );
    } finally {
      setRegionLoading(
        false,
      );
    }
  }


  useEffect(() => {
    void loadWorkspace();
  }, [
    subjectId,
    hemisphere,
    category,
    overlayMode,
  ]);


  const filteredRegions =
    useMemo(() => {
      if (!regions) {
        return [];
      }

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return regions.regions;
      }

      return regions.regions.filter(
        (
          region,
        ) =>
          region.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          region.region_id
            .toLowerCase()
            .includes(
              query,
            ) ||
          region.category
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      regions,
      search,
    ]);


  function resetFilters() {
    setSearch("");
    setHemisphere(
      "all",
    );
    setCategory(
      "all",
    );
    setOverlayMode(
      "resilience",
    );
  }


  if (loading) {
    return (
      <LoadingState />
    );
  }


  if (
    error ||
    !summary ||
    !regions ||
    !overlay
  ) {
    return (
      <ErrorState
        message={
          error ??
          "Brain Explorer unavailable."
        }
        onRetry={() =>
          void loadWorkspace()
        }
      />
    );
  }


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

            {modules.map(
              (
                item,
              ) => {
                const Icon =
                  item.icon;

                const active =
                  item.href ===
                  "/brain-explorer";

                return (
                  <Link
                    key={
                      item.name
                    }
                    href={
                      item.href
                    }
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-cyan-400/10 text-cyan-200"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                    />

                    {
                      item.name
                    }
                  </Link>
                );
              },
            )}
          </nav>


          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Explorer Status
            </p>

            <div className="mt-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-sm text-white/60">
                Region Engine Ready
              </span>
            </div>
          </div>
        </aside>


        {/* =====================================================
            MAIN
            ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* HEADER */}

          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#05070b]/95 px-6 backdrop-blur-xl">

            <div>

              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Cognitive Resilience Research Platform
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Brain Explorer
              </h2>
            </div>


            <div className="flex items-center gap-3">

              <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-2">

                <p className="text-[8px] uppercase tracking-[0.14em] text-white/25">
                  Active Subject
                </p>

                <p className="mt-1 text-xs font-medium text-cyan-300">
                  {subjectId}
                </p>
              </div>


              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2 text-sm text-emerald-300">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                Explorer Online
              </div>


              <button
                type="button"
                onClick={() =>
                  void loadWorkspace()
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/35 transition hover:text-cyan-300"
              >
                <RefreshCcw
                  size={14}
                />
              </button>
            </div>
          </header>


          {/* PAGE */}

          <div className="p-5">

            <div className="mx-auto max-w-[1720px] space-y-5">

              {/* =================================================
                  SUMMARY
                  ================================================= */}

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                  label="Brain Regions"
                  value={
                    summary.total_regions.toString()
                  }
                  detail={`${summary.stable_regions} stable`}
                  accent="cyan"
                />

                <MetricCard
                  label="Mean Resilience"
                  value={`ρ ${summary.mean_resilience.toFixed(
                    3,
                  )}`}
                  detail="regional resilience state"
                  accent="violet"
                />

                <MetricCard
                  label="Neural Complexity"
                  value={
                    summary.mean_complexity.toFixed(
                      3,
                    )
                  }
                  detail="mean regional complexity"
                  accent="cyan"
                />

                <MetricCard
                  label="Mean Confidence"
                  value={`${(
                    summary.mean_confidence *
                    100
                  ).toFixed(
                    1,
                  )}%`}
                  detail={`atrophy ${summary.mean_atrophy.toFixed(
                    3,
                  )}`}
                  accent="violet"
                />
              </section>


              {/* =================================================
                  CONTROLS
                  ================================================= */}

              <section className="rounded-3xl border border-white/[0.08] bg-[#080b10] p-5">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                      Explorer Controls
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      Anatomical Region Workspace
                    </h3>

                    <p className="mt-1 text-xs text-white/35">
                      Filter the regional atlas and change the active research overlay.
                    </p>
                  </div>


                  <div className="grid grid-cols-3 gap-2">

                    <StatusMetric
                      label="Stable"
                      value={
                        summary.stable_regions
                      }
                    />

                    <StatusMetric
                      label="Watch"
                      value={
                        summary.watch_regions
                      }
                    />

                    <StatusMetric
                      label="Elevated"
                      value={
                        summary.elevated_regions
                      }
                    />
                  </div>
                </div>


                <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_auto]">

                  {/* SEARCH */}

                  <div className="relative">

                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <input
                      value={
                        search
                      }
                      onChange={(
                        event,
                      ) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search region name, ID or category..."
                      className="w-full rounded-xl border border-white/[0.07] bg-black/20 py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/20"
                    />
                  </div>


                  {/* HEMISPHERE */}

                  <select
                    value={
                      hemisphere
                    }
                    onChange={(
                      event,
                    ) =>
                      setHemisphere(
                        event.target
                          .value as
                          | Hemisphere
                          | "all",
                      )
                    }
                    className="rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 text-sm capitalize text-white outline-none"
                  >

                    {hemisphereOptions.map(
                      (
                        item,
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item ===
                          "all"
                            ? "All Hemispheres"
                            : item}
                        </option>
                      ),
                    )}
                  </select>


                  {/* CATEGORY */}

                  <select
                    value={
                      category
                    }
                    onChange={(
                      event,
                    ) =>
                      setCategory(
                        event.target
                          .value as
                          | RegionCategory
                          | "all",
                      )
                    }
                    className="rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 text-sm capitalize text-white outline-none"
                  >

                    {categoryOptions.map(
                      (
                        item,
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item ===
                          "all"
                            ? "All Categories"
                            : item}
                        </option>
                      ),
                    )}
                  </select>


                  {/* OVERLAY */}

                  <select
                    value={
                      overlayMode
                    }
                    onChange={(
                      event,
                    ) =>
                      setOverlayMode(
                        event.target
                          .value as OverlayMode,
                      )
                    }
                    className="rounded-xl border border-violet-300/10 bg-[#080c12] px-3 py-3 text-sm text-violet-200 outline-none"
                  >

                    {overlayOptions.map(
                      (
                        item,
                      ) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                        >
                          {item.label} Overlay
                        </option>
                      ),
                    )}
                  </select>


                  {/* RESET */}

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-white/45 transition hover:text-cyan-300"
                  >

                    <SlidersHorizontal
                      size={14}
                    />

                    Reset
                  </button>
                </div>
              </section>


              {/* =================================================
                  MAIN EXPLORER
                  ================================================= */}

              <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">

                {/* REGION MAP */}

                <div className="rounded-3xl border border-white/[0.08] bg-[#080b10] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                        Regional Atlas
                      </p>

                      <h3 className="mt-2 text-lg font-semibold">
                        Interactive Neuroanatomical Map
                      </h3>

                      <p className="mt-1 text-xs text-white/35">
                        Select a region to inspect detailed structural and resilience metrics.
                      </p>
                    </div>


                    <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-2">

                      <p className="text-[8px] uppercase tracking-[0.14em] text-white/25">
                        Visible
                      </p>

                      <p className="mt-1 text-sm font-medium text-cyan-300">
                        {
                          filteredRegions.length
                        }
                      </p>
                    </div>
                  </div>


                  {/* SIMPLE BRAIN CANVAS */}

                  <div className="relative mt-5 min-h-[420px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.045),transparent_60%)]">

                    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:34px_34px]" />

                    <div className="relative grid min-h-[420px] grid-cols-2 gap-4 p-5">

                      <BrainHemisphere
                        title="Left Hemisphere"
                        side="left"
                        regions={
                          filteredRegions.filter(
                            (
                              region,
                            ) =>
                              region.hemisphere ===
                                "left" ||
                              region.hemisphere ===
                                "bilateral",
                          )
                        }
                        overlay={
                          overlay
                        }
                        selectedRegionId={
                          selectedRegionId
                        }
                        onSelect={
                          selectRegion
                        }
                      />


                      <BrainHemisphere
                        title="Right Hemisphere"
                        side="right"
                        regions={
                          filteredRegions.filter(
                            (
                              region,
                            ) =>
                              region.hemisphere ===
                                "right" ||
                              region.hemisphere ===
                                "bilateral",
                          )
                        }
                        overlay={
                          overlay
                        }
                        selectedRegionId={
                          selectedRegionId
                        }
                        onSelect={
                          selectRegion
                        }
                      />
                    </div>


                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-5 rounded-full border border-white/[0.06] bg-black/50 px-5 py-2 backdrop-blur-md">

                      <LegendItem
                        label="Low"
                        className="bg-cyan-900"
                      />

                      <LegendItem
                        label="Medium"
                        className="bg-cyan-400"
                      />

                      <LegendItem
                        label="High"
                        className="bg-violet-400"
                      />
                    </div>
                  </div>


                  {/* OVERLAY STATS */}

                  <div className="mt-4 grid grid-cols-3 gap-3">

                    <InspectorMetric
                      label="Overlay Minimum"
                      value={
                        overlay.min_value.toFixed(
                          3,
                        )
                      }
                    />

                    <InspectorMetric
                      label="Overlay Mean"
                      value={
                        overlay.mean_value.toFixed(
                          3,
                        )
                      }
                    />

                    <InspectorMetric
                      label="Overlay Maximum"
                      value={
                        overlay.max_value.toFixed(
                          3,
                        )
                      }
                    />
                  </div>
                </div>


                {/* REGION LIST */}

                <aside className="rounded-3xl border border-white/[0.08] bg-[#080b10] p-5">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300">
                      Region Registry
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      Anatomical Regions
                    </h3>

                    <p className="mt-1 text-xs text-white/35">
                      {
                        filteredRegions.length
                      }{" "}
                      regions match the current filters.
                    </p>
                  </div>


                  <div className="mt-5 max-h-[560px] space-y-2 overflow-y-auto pr-1">

                    {filteredRegions.map(
                      (
                        region,
                      ) => (
                        <RegionListItem
                          key={
                            region.region_id
                          }
                          region={
                            region
                          }
                          selected={
                            selectedRegionId ===
                            region.region_id
                          }
                          onClick={() =>
                            void selectRegion(
                              region.region_id,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                </aside>
              </section>


              {/* =================================================
                  REGION INSPECTOR
                  ================================================= */}

              {(selectedDetail ||
                regionLoading) && (
                <RegionInspector
                  detail={
                    selectedDetail
                  }
                  loading={
                    regionLoading
                  }
                  onClose={() => {
                    setSelectedDetail(
                      null,
                    );

                    setSelectedRegionId(
                      null,
                    );
                  }}
                />
              )}


              {/* =================================================
                  MODULE LINKS
                  ================================================= */}

              <section className="grid gap-3 md:grid-cols-3">

                <ResearchLink
                  href="/digital-twin"
                  title="Open Digital Twin"
                  description="Inspect longitudinal subject state."
                  accent="cyan"
                />

                <ResearchLink
                  href="/fusion-lab"
                  title="Open Fusion Lab"
                  description="Run multimodal resilience fusion."
                  accent="violet"
                />

                <ResearchLink
                  href="/datasets"
                  title="Open Dataset Registry"
                  description="Return to cohort and dataset intelligence."
                  accent="cyan"
                />
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


/* ============================================================
   BRAIN HEMISPHERE
   ============================================================ */

function BrainHemisphere({
  title,
  side,
  regions,
  overlay,
  selectedRegionId,
  onSelect,
}: {
  title: string;

  side:
    | "left"
    | "right";

  regions:
    BrainRegion[];

  overlay:
    BrainOverlayResponse;

  selectedRegionId:
    string | null;

  onSelect:
    (
      regionId:
        string,
    ) => Promise<void>;
}) {
  return (
    <div className="relative rounded-3xl border border-white/[0.05] bg-black/10 p-5">

      <div className="flex items-center justify-between">

        <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
          {title}
        </p>

        <Brain
          size={18}
          className="text-cyan-300/50"
        />
      </div>


      <div
        className={`relative mx-auto mt-6 flex min-h-[320px] max-w-[420px] flex-wrap content-center items-center justify-center gap-3 rounded-[45%_55%_50%_50%/55%_45%_55%_45%] border border-cyan-300/10 bg-cyan-300/[0.025] p-8 ${
          side === "left"
            ? "-rotate-2"
            : "rotate-2"
        }`}
      >

        {regions.map(
          (
            region,
          ) => {
            const value =
              overlay.values[
                region.region_id
              ] ?? 0;

            const selected =
              selectedRegionId ===
              region.region_id;

            return (
              <button
                key={
                  region.region_id
                }
                type="button"
                title={
                  region.name
                }
                onClick={() =>
                  void onSelect(
                    region.region_id,
                  )
                }
                className={`group flex h-16 w-20 flex-col items-center justify-center rounded-2xl border text-center transition ${
                  selected
                    ? "border-cyan-300/40 bg-cyan-300/[0.09]"
                    : "border-white/[0.06] bg-black/30 hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]"
                }`}
              >

                <span className="text-[9px] font-medium text-white/70">
                  {
                    region.name
                  }
                </span>

                <span className="mt-1 text-[9px] text-cyan-300">
                  {
                    value.toFixed(
                      2,
                    )
                  }
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}


/* ============================================================
   REGION LIST
   ============================================================ */

function RegionListItem({
  region,
  selected,
  onClick,
}: {
  region: BrainRegion;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-cyan-300/25 bg-cyan-300/[0.04]"
          : "border-white/[0.06] bg-black/10 hover:border-cyan-300/15"
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-medium text-white/75">
            {
              region.name
            }
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/20">
            {
              region.region_id
            }
          </p>
        </div>


        <RegionStatusBadge
          status={
            region.status
          }
        />
      </div>


      <div className="mt-3 grid grid-cols-3 gap-2">

        <MiniMetric
          label="ρ"
          value={
            region.resilience_score.toFixed(
              2,
            )
          }
        />

        <MiniMetric
          label="Complexity"
          value={
            region.complexity_score.toFixed(
              2,
            )
          }
        />

        <MiniMetric
          label="Atrophy"
          value={
            region.atrophy_index.toFixed(
              2,
            )
          }
        />
      </div>
    </button>
  );
}


/* ============================================================
   REGION INSPECTOR
   ============================================================ */

function RegionInspector({
  detail,
  loading,
  onClose,
}: {
  detail:
    BrainRegionDetailResponse | null;

  loading:
    boolean;

  onClose:
    () => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-300/10 bg-[#080b10]">

      <div className="flex items-center justify-between border-b border-white/[0.07] p-5">

        <div>

          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
            Region Inspector
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            Neuroanatomical Detail
          </h3>
        </div>


        <button
          type="button"
          onClick={
            onClose
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/35 hover:text-white"
        >
          <X
            size={15}
          />
        </button>
      </div>


      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">

          <RefreshCcw
            className="animate-spin text-cyan-300"
          />
        </div>
      )}


      {!loading &&
        detail && (
          <div className="grid gap-5 p-5 xl:grid-cols-[1.35fr_0.65fr]">

            {/* LEFT */}

            <div className="space-y-5">

              <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[9px] uppercase tracking-[0.16em] text-cyan-300">
                      {
                        detail.region.region_id
                      }
                    </p>

                    <h4 className="mt-2 text-xl font-semibold">
                      {
                        detail.region.name
                      }
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-white/35">
                      {
                        detail.region.description
                      }
                    </p>
                  </div>


                  <RegionStatusBadge
                    status={
                      detail.region.status
                    }
                  />
                </div>


                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <InspectorMetric
                    label="Resilience"
                    value={
                      detail.region.resilience_score.toFixed(
                        3,
                      )
                    }
                  />

                  <InspectorMetric
                    label="Complexity"
                    value={
                      detail.region.complexity_score.toFixed(
                        3,
                      )
                    }
                  />

                  <InspectorMetric
                    label="Atrophy Index"
                    value={
                      detail.region.atrophy_index.toFixed(
                        3,
                      )
                    }
                  />

                  <InspectorMetric
                    label="Confidence"
                    value={`${(
                      detail.region.confidence *
                      100
                    ).toFixed(
                      1,
                    )}%`}
                  />
                </div>
              </div>


              <div className="grid gap-5 lg:grid-cols-2">

                {/* STRUCTURE */}

                <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-5">

                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300">
                    Structural Metrics
                  </p>


                  <div className="mt-4 space-y-3">

                    <InfoRow
                      label="Hemisphere"
                      value={
                        detail.region.hemisphere
                      }
                    />

                    <InfoRow
                      label="Category"
                      value={
                        detail.region.category
                      }
                    />

                    <InfoRow
                      label="Cortical Thickness"
                      value={
                        detail.region.cortical_thickness_mm !==
                        null
                          ? `${detail.region.cortical_thickness_mm.toFixed(
                              2,
                            )} mm`
                          : "N/A"
                      }
                    />

                    <InfoRow
                      label="Volume"
                      value={
                        detail.region.volume_mm3 !==
                        null
                          ? `${detail.region.volume_mm3.toLocaleString()} mm³`
                          : "N/A"
                      }
                    />
                  </div>
                </div>


                {/* LONGITUDINAL */}

                <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-5">

                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                    Longitudinal State
                  </p>


                  <p className="mt-4 text-3xl font-semibold">
                    {
                      detail.longitudinal_change_percent >
                      0
                        ? "+"
                        : ""
                    }
                    {
                      detail.longitudinal_change_percent.toFixed(
                        2,
                      )
                    }
                    %
                  </p>

                  <p className="mt-3 text-xs leading-5 text-white/35">
                    {
                      detail.interpretation
                    }
                  </p>
                </div>
              </div>
            </div>


            {/* RIGHT */}

            <aside className="space-y-5">

              <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  Linked Modalities
                </p>


                <div className="mt-4 space-y-2">

                  {detail.linked_modalities.map(
                    (
                      modality,
                    ) => (
                      <div
                        key={
                          modality
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-2"
                      >

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        <span className="text-xs text-white/55">
                          {
                            modality
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>


              <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.02] p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                  Research Links
                </p>


                <Link
                  href="/digital-twin"
                  className="mt-4 flex items-center justify-between rounded-xl border border-cyan-300/15 px-4 py-3 text-sm text-cyan-200"
                >
                  Open Digital Twin

                  <ExternalLink
                    size={13}
                  />
                </Link>


                <Link
                  href="/fusion-lab"
                  className="mt-2 flex items-center justify-between rounded-xl border border-violet-300/15 px-4 py-3 text-sm text-violet-200"
                >
                  Open Fusion Lab

                  <ExternalLink
                    size={13}
                  />
                </Link>
              </div>
            </aside>
          </div>
        )}
    </section>
  );
}


/* ============================================================
   RESEARCH LINK
   ============================================================ */

function ResearchLink({
  href,
  title,
  description,
  accent,
}: {
  href:
    string;

  title:
    string;

  description:
    string;

  accent:
    | "cyan"
    | "violet";
}) {
  return (
    <Link
      href={
        href
      }
      className={`rounded-2xl border p-4 transition ${
        accent === "cyan"
          ? "border-cyan-300/10 bg-cyan-300/[0.02] hover:border-cyan-300/20"
          : "border-violet-300/10 bg-violet-300/[0.02] hover:border-violet-300/20"
      }`}
    >

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium">
          {title}
        </p>

        <ExternalLink
          size={13}
          className={
            accent ===
            "cyan"
              ? "text-cyan-300"
              : "text-violet-300"
          }
        />
      </div>


      <p className="mt-2 text-xs leading-5 text-white/30">
        {
          description
        }
      </p>
    </Link>
  );
}


/* ============================================================
   UI COMPONENTS
   ============================================================ */

function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label:
    string;

  value:
    string;

  detail:
    string;

  accent:
    | "cyan"
    | "violet";
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#080b10] p-5">

      <div
        className={`h-[2px] w-10 rounded-full ${
          accent ===
          "cyan"
            ? "bg-cyan-400"
            : "bg-violet-400"
        }`}
      />

      <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-white/30">
        {detail}
      </p>
    </div>
  );
}


function StatusMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">

      <p className="text-[8px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}


function MiniMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2">

      <p className="text-[8px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </p>

      <p className="mt-1 text-[10px] text-white/65">
        {value}
      </p>
    </div>
  );
}


function InspectorMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">

      <p className="text-[8px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}


function InfoRow({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">

      <span className="text-xs text-white/30">
        {label}
      </span>

      <span className="max-w-[60%] text-right text-xs capitalize text-white/65">
        {value}
      </span>
    </div>
  );
}


function RegionStatusBadge({
  status,
}: {
  status:
    RegionStatus;
}) {
  const styles = {
    stable:
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300",

    watch:
      "border-amber-400/20 bg-amber-400/[0.05] text-amber-300",

    elevated:
      "border-rose-400/20 bg-rose-400/[0.05] text-rose-300",
  };


  return (
    <span
      className={`rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.13em] ${styles[status]}`}
    >
      {
        status
      }
    </span>
  );
}


function LegendItem({
  label,
  className,
}: {
  label:
    string;

  className:
    string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-2 w-2 rounded-full ${className}`}
      />

      <span className="text-[9px] uppercase tracking-[0.13em] text-white/30">
        {label}
      </span>
    </div>
  );
}


/* ============================================================
   LOADING / ERROR
   ============================================================ */

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] text-white">

      <div className="text-center">

        <RefreshCcw className="mx-auto animate-spin text-cyan-300" />

        <p className="mt-4 text-sm text-white/40">
          Loading Brain Explorer...
        </p>
      </div>
    </main>
  );
}


function ErrorState({
  message,
  onRetry,
}: {
  message:
    string;

  onRetry:
    () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] px-6 text-white">

      <div className="w-full max-w-lg rounded-3xl border border-rose-400/15 bg-rose-400/[0.035] p-7">

        <p className="text-lg font-medium text-rose-200">
          Brain Explorer unavailable
        </p>

        <p className="mt-3 text-sm leading-6 text-white/40">
          {message}
        </p>

        <button
          type="button"
          onClick={
            onRetry
          }
          className="mt-5 rounded-xl border border-rose-300/15 px-4 py-2.5 text-sm text-rose-200"
        >
          Retry
        </button>
      </div>
    </main>
  );
}