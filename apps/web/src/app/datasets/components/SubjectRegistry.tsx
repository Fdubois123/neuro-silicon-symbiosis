"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSubjectRegistry,
  type ModalityName,
  type SubjectRecord,
  type SubjectStatus,
} from "@/services/datasets";

import SubjectInspector from "./SubjectInspector";
import SubjectRow from "./SubjectRow";


const PAGE_SIZE_OPTIONS = [
  25,
  50,
  100,
];


const MODALITY_OPTIONS: Array<
  ModalityName | ""
> = [
  "",
  "MRI",
  "EEG",
  "Genomics",
  "Proteomics",
  "Behavior",
];


const STATUS_OPTIONS: Array<
  SubjectStatus | ""
> = [
  "",
  "active",
  "review",
  "incomplete",
];


export default function SubjectRegistry() {
  const [
    subjects,
    setSubjects,
  ] = useState<
    SubjectRecord[]
  >([]);

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState<
    SubjectRecord | null
  >(null);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    activeSearch,
    setActiveSearch,
  ] = useState("");

  const [
    modality,
    setModality,
  ] = useState<
    ModalityName | ""
  >("");

  const [
    status,
    setStatus,
  ] = useState<
    SubjectStatus | ""
  >("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(50);

  const [
    totalSubjects,
    setTotalSubjects,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    sortDirection,
    setSortDirection,
  ] = useState<
    "asc" | "desc"
  >("asc");


  async function loadSubjects() {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getSubjectRegistry({
          page,
          page_size:
            pageSize,

          search:
            activeSearch,

          modality,
          status,

          sort_direction:
            sortDirection,
        });

      setSubjects(
        result.subjects,
      );

      setTotalSubjects(
        result.total_subjects,
      );

      setTotalPages(
        result.total_pages,
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subject registry.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void loadSubjects();
  }, [
    page,
    pageSize,
    activeSearch,
    modality,
    status,
    sortDirection,
  ]);


  function handleSearch() {
    setPage(1);

    setActiveSearch(
      searchInput.trim(),
    );
  }


  function handleReset() {
    setSearchInput("");
    setActiveSearch("");

    setModality("");
    setStatus("");

    setSortDirection(
      "asc",
    );

    setPage(1);

    setSelectedSubject(
      null,
    );
  }


  function handlePageSize(
    value: number,
  ) {
    setPageSize(
      value,
    );

    setPage(1);
  }


  const showingLabel =
    useMemo(() => {
      if (
        subjects.length ===
        0
      ) {
        return "0";
      }

      const start =
        (
          page - 1
        ) *
          pageSize +
        1;

      const end =
        Math.min(
          start +
            subjects.length -
            1,
          totalSubjects,
        );

      return `${start.toLocaleString()}–${end.toLocaleString()}`;
    }, [
      page,
      pageSize,
      subjects.length,
      totalSubjects,
    ]);


  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#080b10]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-white/[0.07] p-5">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Users
                size={17}
                className="text-cyan-300"
              />

              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                Subject Registry
              </p>
            </div>


            <h3 className="mt-2 text-lg font-semibold">
              Research Cohort Explorer
            </h3>

            <p className="mt-1 text-xs text-white/35">
              Search and inspect the full research-scale
              subject population exposed by FastAPI.
            </p>
          </div>


          <div className="grid grid-cols-2 gap-2 sm:flex">

            <HeaderMetric
              label="Subjects"
              value={
                totalSubjects.toLocaleString()
              }
            />

            <HeaderMetric
              label="Loaded"
              value={
                subjects.length.toString()
              }
            />

            <HeaderMetric
              label="Page"
              value={`${page}/${totalPages.toLocaleString()}`}
            />
          </div>
        </div>


        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(240px,1.4fr)_1fr_1fr_0.65fr_auto]">

          {/* SEARCH */}

          <div className="flex gap-2">

            <div className="relative min-w-0 flex-1">

              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={
                  searchInput
                }
                onChange={(
                  event,
                ) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleSearch();
                  }
                }}
                placeholder="Search Subject ID, e.g. NS-000125"
                className="w-full rounded-xl border border-white/[0.07] bg-black/20 py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/20"
              />
            </div>


            <button
              type="button"
              onClick={
                handleSearch
              }
              className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] px-4 text-sm text-cyan-200 transition hover:bg-cyan-300/[0.08]"
            >
              Search
            </button>
          </div>


          {/* MODALITY */}

          <select
            value={
              modality
            }
            onChange={(
              event,
            ) => {
              setModality(
                event.target
                  .value as
                  | ModalityName
                  | "",
              );

              setPage(1);
            }}
            className="rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 text-sm text-white outline-none"
          >

            {MODALITY_OPTIONS.map(
              (
                item,
              ) => (
                <option
                  key={
                    item ||
                    "all"
                  }
                  value={
                    item
                  }
                >
                  {item
                    ? item
                    : "All Modalities"}
                </option>
              ),
            )}
          </select>


          {/* STATUS */}

          <select
            value={
              status
            }
            onChange={(
              event,
            ) => {
              setStatus(
                event.target
                  .value as
                  | SubjectStatus
                  | "",
              );

              setPage(1);
            }}
            className="rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 text-sm capitalize text-white outline-none"
          >

            {STATUS_OPTIONS.map(
              (
                item,
              ) => (
                <option
                  key={
                    item ||
                    "all"
                  }
                  value={
                    item
                  }
                >
                  {item
                    ? item
                    : "All Statuses"}
                </option>
              ),
            )}
          </select>


          {/* PAGE SIZE */}

          <div className="relative">

            <select
              value={
                pageSize
              }
              onChange={(
                event,
              ) =>
                handlePageSize(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              className="w-full appearance-none rounded-xl border border-white/[0.07] bg-[#080c12] px-3 py-3 pr-8 text-sm text-white outline-none"
            >

              {PAGE_SIZE_OPTIONS.map(
                (
                  size,
                ) => (
                  <option
                    key={
                      size
                    }
                    value={
                      size
                    }
                  >
                    {size} rows
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/25"
            />
          </div>


          {/* RESET */}

          <button
            type="button"
            onClick={
              handleReset
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-white/45 transition hover:text-cyan-300"
          >
            <Filter
              size={14}
            />

            Reset
          </button>
        </div>
      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="p-5">

        <div className="overflow-hidden rounded-2xl border border-white/[0.07]">

          {/* TABLE HEADER */}

          <div className="grid grid-cols-[1.15fr_0.6fr_0.65fr_0.65fr_1.7fr_1fr_0.85fr_auto] items-center gap-3 border-b border-white/[0.07] bg-white/[0.025] px-4 py-3">

            <ColumnHeader>
              Subject
            </ColumnHeader>

            <ColumnHeader>
              Age
            </ColumnHeader>

            <ColumnHeader>
              Sex
            </ColumnHeader>

            <ColumnHeader>
              Visits
            </ColumnHeader>

            <ColumnHeader>
              Modalities
            </ColumnHeader>

            <button
              type="button"
              onClick={() =>
                setSortDirection(
                  (
                    current,
                  ) =>
                    current ===
                    "asc"
                      ? "desc"
                      : "asc",
                )
              }
              className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-white/30 transition hover:text-cyan-300"
            >
              Resilience

              <ChevronDown
                size={11}
                className={
                  sortDirection ===
                  "desc"
                    ? "rotate-180 transition"
                    : "transition"
                }
              />
            </button>

            <ColumnHeader>
              Status
            </ColumnHeader>

            <ColumnHeader>
              Open
            </ColumnHeader>
          </div>


          {/* LOADING */}

          {loading && (
            <div className="flex min-h-[320px] items-center justify-center">

              <div className="text-center">

                <Loader2
                  size={22}
                  className="mx-auto animate-spin text-cyan-300"
                />

                <p className="mt-3 text-xs text-white/35">
                  Loading subject cohort...
                </p>
              </div>
            </div>
          )}


          {/* ERROR */}

          {!loading &&
            error && (
              <div className="flex min-h-[280px] items-center justify-center p-5">

                <div className="max-w-lg rounded-2xl border border-rose-400/15 bg-rose-400/[0.03] p-5 text-center">

                  <p className="text-sm text-rose-200">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void loadSubjects()
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-300/15 px-3 py-2 text-xs text-rose-200"
                  >
                    <RefreshCcw
                      size={12}
                    />

                    Retry
                  </button>
                </div>
              </div>
            )}


          {/* ROWS */}

          {!loading &&
            !error &&
            subjects.length >
              0 && (
              <div className="max-h-[650px] overflow-y-auto">

                {subjects.map(
                  (
                    subject,
                  ) => (
                    <SubjectRow
                      key={
                        subject.subject_id
                      }
                      subject={
                        subject
                      }
                      onOpen={() =>
                        setSelectedSubject(
                          subject,
                        )
                      }
                    />
                  ),
                )}
              </div>
            )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            subjects.length ===
              0 && (
              <div className="flex min-h-[280px] items-center justify-center">

                <div className="text-center">

                  <Users
                    size={24}
                    className="mx-auto text-white/15"
                  />

                  <p className="mt-3 text-sm text-white/35">
                    No subjects match the current query.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleReset
                    }
                    className="mt-3 text-xs text-cyan-300"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            )}
        </div>


        {/* ====================================================
            PAGINATION
        ==================================================== */}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs text-white/35">
              Showing{" "}
              <span className="text-white/65">
                {showingLabel}
              </span>{" "}
              of{" "}
              <span className="text-cyan-300">
                {totalSubjects.toLocaleString()}
              </span>{" "}
              subjects
            </p>

            <p className="mt-1 text-[9px] text-white/20">
              Only the active page is loaded into the browser.
            </p>
          </div>


          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.max(
                      1,
                      current -
                        1,
                    ),
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-white/40 transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft
                size={15}
              />
            </button>


            <div className="rounded-lg border border-white/[0.07] bg-black/20 px-4 py-2">

              <span className="text-xs text-white/35">
                Page{" "}
              </span>

              <span className="text-xs font-medium text-white/75">
                {page.toLocaleString()}
              </span>

              <span className="text-xs text-white/25">
                {" "}
                /{" "}
                {totalPages.toLocaleString()}
              </span>
            </div>


            <button
              type="button"
              disabled={
                page >=
                  totalPages ||
                loading
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.min(
                      totalPages,
                      current +
                        1,
                    ),
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-white/40 transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight
                size={15}
              />
            </button>
          </div>
        </div>


        {/* ====================================================
            SUBJECT INSPECTOR
        ==================================================== */}

        {selectedSubject && (
          <div className="mt-5">

            <SubjectInspector
              subject={
                selectedSubject
              }
              onClose={() =>
                setSelectedSubject(
                  null,
                )
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}


function HeaderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">

      <p className="text-[8px] uppercase tracking-[0.14em] text-white/20">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}


function ColumnHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
      {children}
    </p>
  );
}