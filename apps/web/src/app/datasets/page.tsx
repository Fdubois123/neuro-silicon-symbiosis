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
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Database,
  Dna,
  ExternalLink,
  FlaskConical,
  FolderSearch,
  Layers3,
  Orbit,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Waves,
  X,
} from "lucide-react";

import {
  getDatasetAnalytics,
  getDatasetDetail,
  getDatasetRegistry,
  type DatasetDetailResponse,
  type DatasetRecord,
  type DatasetRegistryResponse,
  type DatasetStatus,
  type ModalityName,
  type PlatformAnalyticsResponse,
} from "@/services/datasets";

import SubjectRegistry from "./components/SubjectRegistry";


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


const modalityIcons: Record<
  ModalityName,
  typeof Brain
> = {
  MRI: Brain,
  EEG: Waves,
  Genomics: Dna,
  Proteomics: Layers3,
  Behavior: Activity,
};


const modalityOptions: Array<
  ModalityName | "All"
> = [
  "All",
  "MRI",
  "EEG",
  "Genomics",
  "Proteomics",
  "Behavior",
];


const statusOptions: Array<
  DatasetStatus | "All"
> = [
  "All",
  "ready",
  "processing",
  "pending",
  "unavailable",
];


/* ============================================================
   HELPERS
   ============================================================ */

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
}


function formatCompact(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 2,
    },
  ).format(value);
}


function formatStorage(
  gb: number,
) {
  if (gb >= 1000) {
    return `${(
      gb / 1000
    ).toFixed(2)} TB`;
  }

  return `${gb.toFixed(1)} GB`;
}


function qualityLabel(
  value: number,
) {
  if (value >= 0.9) {
    return "Excellent";
  }

  if (value >= 0.8) {
    return "Good";
  }

  if (value >= 0.7) {
    return "Moderate";
  }

  return "Review";
}


/* ============================================================
   PAGE
   ============================================================ */

export default function DatasetsPage() {
  const [
    registry,
    setRegistry,
  ] =
    useState<
      DatasetRegistryResponse | null
    >(null);

  const [
    analytics,
    setAnalytics,
  ] =
    useState<
      PlatformAnalyticsResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    modalityFilter,
    setModalityFilter,
  ] =
    useState<
      ModalityName | "All"
    >("All");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      DatasetStatus | "All"
    >("All");

  const [
    selectedDataset,
    setSelectedDataset,
  ] =
    useState<
      DatasetDetailResponse | null
    >(null);

  const [
    inspectorLoading,
    setInspectorLoading,
  ] = useState(false);

  const [
    inspectorError,
    setInspectorError,
  ] =
    useState<
      string | null
    >(null);

  const [
    expandedRegistry,
    setExpandedRegistry,
  ] = useState(true);


  /* ==========================================================
     LOAD DASHBOARD
     ========================================================== */

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [
        registryData,
        analyticsData,
      ] = await Promise.all([
        getDatasetRegistry(),
        getDatasetAnalytics(),
      ]);

      setRegistry(
        registryData,
      );

      setAnalytics(
        analyticsData,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dataset intelligence.",
      );
    } finally {
      setLoading(false);
    }
  }


  /* ==========================================================
     OPEN DATASET
     ========================================================== */

  async function openDataset(
    datasetId: string,
  ) {
    try {
      setInspectorLoading(
        true,
      );

      setInspectorError(
        null,
      );

      const detail =
        await getDatasetDetail(
          datasetId,
        );

      setSelectedDataset(
        detail,
      );
    } catch (err) {
      setInspectorError(
        err instanceof Error
          ? err.message
          : "Unable to load dataset details.",
      );
    } finally {
      setInspectorLoading(
        false,
      );
    }
  }


  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    void loadDashboard();
  }, []);


  /* ==========================================================
     DATASET FILTERING
     ========================================================== */

  const filteredDatasets =
    useMemo(() => {
      if (!registry) {
        return [];
      }

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return registry.datasets.filter(
        (dataset) => {
          const searchMatch =
            normalizedSearch.length ===
              0 ||
            dataset.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            dataset.dataset_id
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            dataset.source
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const modalityMatch =
            modalityFilter ===
              "All" ||
            dataset.modality ===
              modalityFilter;

          const statusMatch =
            statusFilter ===
              "All" ||
            dataset.status ===
              statusFilter;

          return (
            searchMatch &&
            modalityMatch &&
            statusMatch
          );
        },
      );
    }, [
      registry,
      search,
      modalityFilter,
      statusFilter,
    ]);


  function resetFilters() {
    setSearch("");

    setModalityFilter(
      "All",
    );

    setStatusFilter(
      "All",
    );
  }


  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <LoadingState />
    );
  }


  /* ==========================================================
     ERROR
     ========================================================== */

  if (
    error ||
    !registry ||
    !analytics
  ) {
    return (
      <ErrorState
        message={
          error ??
          "Dataset intelligence unavailable."
        }
        onRetry={() =>
          void loadDashboard()
        }
      />
    );
  }


  const summary =
    registry.summary;


  /* ==========================================================
     UI
     ========================================================== */

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
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  item.href ===
                  "/datasets";

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
              Dataset Status
            </p>


            <div className="mt-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-sm text-white/60">
                Registry Ready
              </span>
            </div>
          </div>
        </aside>


        {/* =====================================================
            MAIN CONTENT
            ===================================================== */}

        <section className="min-w-0 flex-1">

          {/* ===================================================
              HEADER
              =================================================== */}

          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#05070b]/95 px-6 backdrop-blur-xl">

            <div>

              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Cognitive Resilience Research Platform
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Dataset Intelligence
              </h2>
            </div>


            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2 text-sm text-emerald-300">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                Dataset Engine Online
              </div>


              <button
                type="button"
                onClick={() =>
                  void loadDashboard()
                }
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-white/45 transition hover:border-cyan-300/20 hover:text-cyan-300"
              >
                <RefreshCcw
                  size={14}
                />

                Refresh
              </button>
            </div>
          </header>


          {/* ===================================================
              PAGE CONTENT
              =================================================== */}

          <div className="p-5">

            <div className="mx-auto max-w-[1720px] space-y-5">

              {/* ===============================================
                  PLATFORM SCALE
                  =============================================== */}

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                  label="Datasets"
                  value={
                    formatNumber(
                      summary.total_datasets,
                    )
                  }
                  detail={`${summary.ready_datasets} ready`}
                  accent="cyan"
                />


                <MetricCard
                  label="Research Subjects"
                  value={
                    formatNumber(
                      summary.unique_subjects,
                    )
                  }
                  detail={`${formatCompact(
                    summary.unique_subjects,
                  )} indexed`}
                  accent="violet"
                />


                <MetricCard
                  label="Research Records"
                  value={
                    formatNumber(
                      summary.total_records,
                    )
                  }
                  detail={`${formatCompact(
                    summary.total_records,
                  )} multimodal`}
                  accent="cyan"
                />


                <MetricCard
                  label="Storage Footprint"
                  value={
                    formatStorage(
                      summary.total_storage_gb,
                    )
                  }
                  detail={`${formatNumber(
                    Math.round(
                      summary.total_storage_gb,
                    ),
                  )} GB represented`}
                  accent="violet"
                />
              </section>


              {/* ===============================================
                  MODALITY ANALYTICS
                  =============================================== */}

              <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">

                {/* LEFT */}

                <div className="rounded-3xl border border-white/[0.08] bg-[#080b10] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
                        Modality Intelligence
                      </p>

                      <h3 className="mt-2 text-lg font-semibold">
                        Multimodal Research Distribution
                      </h3>

                      <p className="mt-1 text-xs text-white/35">
                        Dataset scale and quality across the five research modalities.
                      </p>
                    </div>


                    <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-2 text-right">

                      <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                        Modalities
                      </p>

                      <p className="mt-1 text-lg font-semibold text-cyan-300">
                        {
                          analytics.modalities.length
                        }
                      </p>
                    </div>
                  </div>


                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07]">

                    {/* HEADER */}

                    <div className="grid grid-cols-[1.1fr_0.7fr_1fr_1fr_0.8fr] gap-3 border-b border-white/[0.07] bg-white/[0.025] px-4 py-3">

                      <TableHeader>
                        Modality
                      </TableHeader>

                      <TableHeader>
                        Datasets
                      </TableHeader>

                      <TableHeader>
                        Subjects
                      </TableHeader>

                      <TableHeader>
                        Records
                      </TableHeader>

                      <TableHeader>
                        Quality
                      </TableHeader>
                    </div>


                    {/* ROWS */}

                    {analytics.modalities.map(
                      (
                        item,
                      ) => {
                        const Icon =
                          modalityIcons[
                            item.modality
                          ];

                        return (
                          <button
                            key={
                              item.modality
                            }
                            type="button"
                            onClick={() =>
                              setModalityFilter(
                                item.modality,
                              )
                            }
                            className="grid w-full grid-cols-[1.1fr_0.7fr_1fr_1fr_0.8fr] gap-3 border-b border-white/[0.05] px-4 py-4 text-left transition last:border-b-0 hover:bg-cyan-300/[0.025]"
                          >

                            <div className="flex items-center gap-3">

                              <Icon
                                size={17}
                                className="text-cyan-300"
                              />


                              <div>

                                <p className="text-sm font-medium">
                                  {
                                    item.modality
                                  }
                                </p>

                                <p className="mt-1 text-[10px] text-white/25">
                                  Click to filter
                                </p>
                              </div>
                            </div>


                            <TableValue>
                              {
                                item.dataset_count
                              }
                            </TableValue>


                            <TableValue>
                              {formatCompact(
                                item.total_subjects,
                              )}
                            </TableValue>


                            <TableValue>
                              {formatCompact(
                                item.total_records,
                              )}
                            </TableValue>


                            <div className="flex items-center">

                              <div>

                                <p className="text-xs font-medium text-cyan-300">
                                  {(
                                    item.average_quality *
                                    100
                                  ).toFixed(
                                    1,
                                  )}
                                  %
                                </p>

                                <p className="mt-1 text-[9px] text-white/25">
                                  {qualityLabel(
                                    item.average_quality,
                                  )}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>


                {/* =============================================
                    REGISTRY HEALTH
                    ============================================= */}

                <div className="rounded-3xl border border-white/[0.08] bg-[#080b10] p-5">

                  <p className="text-[10px] uppercase tracking-[0.24em] text-violet-400">
                    Registry Health
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    Dataset Availability
                  </h3>

                  <p className="mt-1 text-xs text-white/35">
                    Operational state of the current research registry.
                  </p>


                  <div className="mt-5 grid grid-cols-3 gap-3">

                    <StatusMetric
                      label="Ready"
                      value={
                        summary.ready_datasets
                      }
                    />

                    <StatusMetric
                      label="Processing"
                      value={
                        summary.processing_datasets
                      }
                    />

                    <StatusMetric
                      label="Pending"
                      value={
                        summary.pending_datasets
                      }
                    />
                  </div>


                  <div className="mt-5 space-y-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                    <CoverageRow
                      label="MRI"
                      value={
                        summary.mri_records
                      }
                      total={
                        summary.total_records
                      }
                    />

                    <CoverageRow
                      label="EEG"
                      value={
                        summary.eeg_records
                      }
                      total={
                        summary.total_records
                      }
                    />

                    <CoverageRow
                      label="Genomics"
                      value={
                        summary.genomics_records
                      }
                      total={
                        summary.total_records
                      }
                    />

                    <CoverageRow
                      label="Proteomics"
                      value={
                        summary.proteomics_records
                      }
                      total={
                        summary.total_records
                      }
                    />

                    <CoverageRow
                      label="Behavior"
                      value={
                        summary.behavior_records
                      }
                      total={
                        summary.total_records
                      }
                    />
                  </div>


                  <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-4">

                    <p className="text-[9px] uppercase tracking-[0.18em] text-cyan-300">
                      Research Registry
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCompact(
                        summary.unique_subjects,
                      )}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/30">
                      unique research subjects indexed by the dataset engine.
                    </p>
                  </div>
                </div>
              </section>


              {/* ===============================================
                  DATASET EXPLORER
                  =============================================== */}

              <section className="rounded-3xl border border-white/[0.08] bg-[#080b10]">

                {/* HEADER */}

                <div className="border-b border-white/[0.07] p-5">

                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <FolderSearch
                          size={17}
                          className="text-cyan-300"
                        />

                        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
                          Dataset Explorer
                        </p>
                      </div>


                      <h3 className="mt-2 text-lg font-semibold">
                        Research Dataset Registry
                      </h3>

                      <p className="mt-1 text-xs text-white/35">
                        Search, filter and inspect all registered research datasets.
                      </p>
                    </div>


                    <div className="flex items-center gap-2">

                      <span className="rounded-xl border border-white/[0.07] px-3 py-2 text-xs text-white/35">
                        {
                          filteredDatasets.length
                        }
                        {" / "}
                        {
                          registry.datasets.length
                        }
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          setExpandedRegistry(
                            (
                              current,
                            ) =>
                              !current,
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-xs text-white/45 hover:text-cyan-300"
                      >

                        {expandedRegistry ? (
                          <ChevronDown
                            size={14}
                          />
                        ) : (
                          <ChevronRight
                            size={14}
                          />
                        )}

                        {expandedRegistry
                          ? "Collapse"
                          : "Expand"}
                      </button>
                    </div>
                  </div>


                  {/* FILTER CONTROLS */}

                  <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_1fr_1fr_auto]">

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
                        placeholder="Search dataset name, ID or source..."
                        className="w-full rounded-xl border border-white/[0.07] bg-black/20 py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/20"
                      />
                    </div>


                    {/* MODALITY */}

                    <select
                      value={
                        modalityFilter
                      }
                      onChange={(
                        event,
                      ) =>
                        setModalityFilter(
                          event.target
                            .value as
                            | ModalityName
                            | "All",
                        )
                      }
                      className="rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 text-sm text-white outline-none"
                    >

                      {modalityOptions.map(
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
                            "All"
                              ? "All Modalities"
                              : item}
                          </option>
                        ),
                      )}
                    </select>


                    {/* STATUS */}

                    <select
                      value={
                        statusFilter
                      }
                      onChange={(
                        event,
                      ) =>
                        setStatusFilter(
                          event.target
                            .value as
                            | DatasetStatus
                            | "All",
                        )
                      }
                      className="rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 text-sm capitalize text-white outline-none"
                    >

                      {statusOptions.map(
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
                            "All"
                              ? "All Statuses"
                              : item}
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
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-white/45 hover:text-cyan-300"
                    >

                      <SlidersHorizontal
                        size={15}
                      />

                      Reset
                    </button>
                  </div>
                </div>


                {/* DATASET CARDS */}

                {expandedRegistry && (
                  <div className="p-5">

                    {filteredDatasets.length >
                    0 ? (
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                        {filteredDatasets.map(
                          (
                            dataset,
                          ) => (
                            <DatasetCard
                              key={
                                dataset.dataset_id
                              }
                              dataset={
                                dataset
                              }
                              active={
                                selectedDataset
                                  ?.dataset
                                  .dataset_id ===
                                dataset.dataset_id
                              }
                              onOpen={() =>
                                void openDataset(
                                  dataset.dataset_id,
                                )
                              }
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/[0.06] bg-black/10 py-16 text-center">

                        <FolderSearch
                          size={26}
                          className="mx-auto text-white/15"
                        />

                        <p className="mt-4 text-sm text-white/35">
                          No datasets match the current filters.
                        </p>

                        <button
                          type="button"
                          onClick={
                            resetFilters
                          }
                          className="mt-4 text-xs text-cyan-300"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>


              {/* ===============================================
                  DATASET INSPECTOR
                  =============================================== */}

              {(selectedDataset ||
                inspectorLoading ||
                inspectorError) && (
                <DatasetInspector
                  detail={
                    selectedDataset
                  }
                  loading={
                    inspectorLoading
                  }
                  error={
                    inspectorError
                  }
                  onClose={() => {
                    setSelectedDataset(
                      null,
                    );

                    setInspectorError(
                      null,
                    );
                  }}
                />
              )}


              {/* ===============================================
                  SUBJECT REGISTRY
                  =============================================== */}

              <section>
                <SubjectRegistry />
              </section>


              {/* ===============================================
                  PLATFORM STATUS
                  =============================================== */}

              <section className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <div>

                    <p className="text-xs font-medium text-white/70">
                      Dataset Intelligence Operational
                    </p>

                    <p className="mt-1 text-[10px] text-white/25">
                      Dataset registry, subject registry and research analytics connected.
                    </p>
                  </div>
                </div>


                <p className="text-[9px] uppercase tracking-[0.16em] text-white/20">
                  Neuro-Silicon Research Infrastructure
                </p>
              </section>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


/* ============================================================
   DATASET CARD
   ============================================================ */

function DatasetCard({
  dataset,
  active,
  onOpen,
}: {
  dataset: DatasetRecord;
  active: boolean;
  onOpen: () => void;
}) {
  const Icon =
    modalityIcons[
      dataset.modality
    ];


  return (
    <button
      type="button"
      onClick={
        onOpen
      }
      className={`group rounded-2xl border p-4 text-left transition ${
        active
          ? "border-cyan-300/25 bg-cyan-300/[0.045]"
          : "border-white/[0.07] bg-black/20 hover:border-cyan-300/20 hover:bg-cyan-300/[0.02]"
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04]">

            <Icon
              size={17}
              className="text-cyan-300"
            />
          </div>


          <div>

            <p className="text-[9px] uppercase tracking-[0.18em] text-cyan-400">
              {
                dataset.modality
              }
            </p>

            <p className="mt-1 text-[9px] text-white/20">
              {
                dataset.dataset_id
              }
            </p>
          </div>
        </div>


        <StatusBadge
          status={
            dataset.status
          }
        />
      </div>


      <h4 className="mt-4 text-sm font-medium leading-5">
        {
          dataset.name
        }
      </h4>


      <p className="mt-2 min-h-[40px] text-[11px] leading-5 text-white/30">
        {
          dataset.description
        }
      </p>


      <div className="mt-4 grid grid-cols-2 gap-2">

        <MiniMetric
          label="Subjects"
          value={
            formatCompact(
              dataset.subjects,
            )
          }
        />

        <MiniMetric
          label="Records"
          value={
            formatCompact(
              dataset.records,
            )
          }
        />

        <MiniMetric
          label="Storage"
          value={
            formatStorage(
              dataset.size_gb,
            )
          }
        />

        <MiniMetric
          label="Quality"
          value={`${(
            dataset.quality_score *
            100
          ).toFixed(
            1,
          )}%`}
        />
      </div>


      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">

        <span className="text-[10px] text-white/25">
          Inspect dataset
        </span>

        <ChevronRight
          size={15}
          className="text-cyan-300/50 transition group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}


/* ============================================================
   DATASET INSPECTOR
   ============================================================ */

function DatasetInspector({
  detail,
  loading,
  error,
  onClose,
}: {
  detail:
    | DatasetDetailResponse
    | null;

  loading: boolean;

  error:
    | string
    | null;

  onClose: () => void;
}) {
  return (
    <section className="rounded-3xl border border-cyan-300/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_60%)]">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-white/[0.07] p-5">

        <div>

          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400">
            Dataset Inspector
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            Dataset Detail Workspace
          </h3>
        </div>


        <button
          type="button"
          onClick={
            onClose
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/35 transition hover:text-white"
        >
          <X
            size={16}
          />
        </button>
      </div>


      {/* LOADING */}

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">

          <div className="text-center">

            <RefreshCcw
              className="mx-auto animate-spin text-cyan-300"
            />

            <p className="mt-3 text-sm text-white/35">
              Loading dataset...
            </p>
          </div>
        </div>
      )}


      {/* ERROR */}

      {!loading &&
        error && (
          <div className="p-6">

            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.03] p-5 text-sm text-rose-200">
              {error}
            </div>
          </div>
        )}


      {/* DETAIL */}

      {!loading &&
        !error &&
        detail && (
          <div className="grid gap-5 p-5 xl:grid-cols-[1.3fr_0.7fr]">

            {/* LEFT */}

            <div className="space-y-5">

              {/* MAIN DATASET INFO */}

              <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                      {
                        detail.dataset.modality
                      }
                      {" · "}
                      {
                        detail.dataset.dataset_id
                      }
                    </p>

                    <h4 className="mt-2 text-xl font-semibold">
                      {
                        detail.dataset.name
                      }
                    </h4>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/35">
                      {
                        detail.dataset.description
                      }
                    </p>
                  </div>


                  <StatusBadge
                    status={
                      detail.dataset.status
                    }
                  />
                </div>


                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <InspectorMetric
                    label="Subjects"
                    value={
                      formatNumber(
                        detail.dataset.subjects,
                      )
                    }
                  />

                  <InspectorMetric
                    label="Records"
                    value={
                      formatNumber(
                        detail.dataset.records,
                      )
                    }
                  />

                  <InspectorMetric
                    label="Storage"
                    value={
                      formatStorage(
                        detail.dataset.size_gb,
                      )
                    }
                  />

                  <InspectorMetric
                    label="Version"
                    value={
                      detail.dataset.version
                    }
                  />
                </div>
              </div>


              {/* QUALITY + PROVENANCE */}

              <div className="grid gap-5 lg:grid-cols-2">

                {/* QUALITY */}

                <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">

                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                    Data Quality
                  </p>


                  <div className="mt-5">

                    <QualityBar
                      label="Quality Score"
                      value={
                        detail.dataset.quality_score *
                        100
                      }
                    />

                    <QualityBar
                      label="Completeness"
                      value={
                        100 -
                        detail.dataset
                          .missingness_percent
                      }
                    />
                  </div>


                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <InspectorMetric
                      label="Quality"
                      value={`${(
                        detail.dataset
                          .quality_score *
                        100
                      ).toFixed(
                        1,
                      )}%`}
                    />

                    <InspectorMetric
                      label="Missingness"
                      value={`${detail.dataset.missingness_percent.toFixed(
                        1,
                      )}%`}
                    />
                  </div>
                </div>


                {/* PROVENANCE */}

                <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">

                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300">
                    Provenance
                  </p>


                  <div className="mt-4 space-y-4">

                    <InfoRow
                      label="Source"
                      value={
                        detail.dataset.source
                      }
                    />

                    <InfoRow
                      label="Version"
                      value={
                        detail.dataset.version
                      }
                    />

                    <InfoRow
                      label="Updated"
                      value={
                        detail.dataset.last_updated
                      }
                    />

                    <InfoRow
                      label="Status"
                      value={
                        detail.dataset.status
                      }
                    />
                  </div>
                </div>
              </div>


              {/* SCHEMA */}

              <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                  Dataset Schema
                </p>


                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

                  {detail.fields.map(
                    (
                      field,
                      index,
                    ) => (
                      <div
                        key={
                          field
                        }
                        className="rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-3"
                      >

                        <p className="text-[9px] text-white/20">
                          FIELD{" "}
                          {
                            index +
                            1
                          }
                        </p>

                        <p className="mt-1 break-all text-xs text-white/65">
                          {
                            field
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>


            {/* RIGHT */}

            <aside className="space-y-5">

              {/* STATISTICS */}

              <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  Dataset Statistics
                </p>


                <div className="mt-4 space-y-3">

                  {Object.entries(
                    detail.sample_statistics,
                  ).map(
                    ([
                      key,
                      value,
                    ]) => (
                      <InfoRow
                        key={
                          key
                        }
                        label={
                          key
                            .replaceAll(
                              "_",
                              " ",
                            )
                            .replace(
                              /\b\w/g,
                              (
                                char,
                              ) =>
                                char.toUpperCase(),
                            )
                        }
                        value={
                          typeof value ===
                          "number"
                            ? formatNumber(
                                value,
                              )
                            : String(
                                value,
                              )
                        }
                      />
                    ),
                  )}
                </div>
              </div>


              {/* RESEARCH INTEGRATION */}

              <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                  Research Integration
                </p>

                <p className="mt-2 text-xs leading-5 text-white/30">
                  Open this research context in connected Neuro-Silicon modules.
                </p>


                <Link
                  href="/digital-twin"
                  className="mt-4 flex items-center justify-between rounded-xl border border-cyan-300/15 px-4 py-3 text-sm text-cyan-200 transition hover:bg-cyan-300/[0.05]"
                >

                  Open Digital Twin

                  <ExternalLink
                    size={14}
                  />
                </Link>


                <Link
                  href="/fusion-lab"
                  className="mt-2 flex items-center justify-between rounded-xl border border-violet-300/15 px-4 py-3 text-sm text-violet-200 transition hover:bg-violet-300/[0.05]"
                >

                  Send to Fusion Lab

                  <ExternalLink
                    size={14}
                  />
                </Link>


                <Link
                  href="/"
                  className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-white/50 transition hover:text-white"
                >

                  Brain Workspace

                  <ExternalLink
                    size={14}
                  />
                </Link>
              </div>


              {/* LINKED MODULES */}

              <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                  Linked Modules
                </p>


                <div className="mt-4 space-y-2">

                  {detail.linked_modules.map(
                    (
                      module,
                    ) => (
                      <div
                        key={
                          module
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-2.5"
                      >

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        <span className="text-xs text-white/50">
                          {
                            module
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
    </section>
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
  label: string;
  value: string;
  detail: string;
  accent:
    | "cyan"
    | "violet";
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#080b10] p-5">

      <div
        className={`h-[2px] w-10 rounded-full ${
          accent === "cyan"
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
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">

      <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}


function CoverageRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.min(
          (
            value /
            total
          ) * 100,
          100,
        )
      : 0;


  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-xs text-white/50">
          {label}
        </span>

        <span className="text-[10px] text-cyan-300">
          {formatCompact(
            value,
          )}
        </span>
      </div>


      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}


function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.018] px-3 py-2">

      <p className="text-[8px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-white/75">
        {value}
      </p>
    </div>
  );
}


function InspectorMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">

      <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
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
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">

      <span className="text-xs text-white/30">
        {label}
      </span>

      <span className="max-w-[58%] text-right text-xs text-white/65">
        {value}
      </span>
    </div>
  );
}


function QualityBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const normalized =
    Math.max(
      0,
      Math.min(
        100,
        value,
      ),
    );


  return (
    <div className="mb-4 last:mb-0">

      <div className="flex items-center justify-between">

        <span className="text-xs text-white/40">
          {label}
        </span>

        <span className="text-xs text-cyan-300">
          {normalized.toFixed(
            1,
          )}
          %
        </span>
      </div>


      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
          style={{
            width: `${normalized}%`,
          }}
        />
      </div>
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: DatasetStatus;
}) {
  const classes = {
    ready:
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300",

    processing:
      "border-violet-400/20 bg-violet-400/[0.05] text-violet-300",

    pending:
      "border-amber-400/20 bg-amber-400/[0.05] text-amber-300",

    unavailable:
      "border-rose-400/20 bg-rose-400/[0.05] text-rose-300",
  };


  return (
    <span
      className={`rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.13em] ${classes[status]}`}
    >
      {status}
    </span>
  );
}


function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="text-[9px] uppercase tracking-[0.17em] text-white/30">
      {children}
    </p>
  );
}


function TableValue({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex items-center">

      <p className="text-xs text-white/65">
        {children}
      </p>
    </div>
  );
}


/* ============================================================
   LOADING
   ============================================================ */

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] text-white">

      <div className="text-center">

        <RefreshCcw className="mx-auto animate-spin text-cyan-300" />

        <p className="mt-4 text-sm text-white/40">
          Loading Dataset Intelligence...
        </p>
      </div>
    </main>
  );
}


/* ============================================================
   ERROR
   ============================================================ */

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] px-6 text-white">

      <div className="w-full max-w-lg rounded-3xl border border-rose-400/15 bg-rose-400/[0.035] p-7">

        <p className="text-lg font-medium text-rose-200">
          Dataset Intelligence unavailable
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