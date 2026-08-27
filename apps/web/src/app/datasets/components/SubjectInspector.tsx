"use client";

import {
  Activity,
  Brain,
  Dna,
  ExternalLink,
  Layers3,
  UserRound,
  Waves,
  X,
} from "lucide-react";

import type {
  ModalityName,
  SubjectRecord,
} from "@/services/datasets";


const modalityIcons: Record<ModalityName, typeof Brain> = {
  MRI: Brain,
  EEG: Waves,
  Genomics: Dna,
  Proteomics: Layers3,
  Behavior: Activity,
};


type SubjectInspectorProps = {
  subject: SubjectRecord | null;
  onClose: () => void;
};


export default function SubjectInspector({
  subject,
  onClose,
}: SubjectInspectorProps) {
  if (!subject) {
    return null;
  }

  const resiliencePercent = Math.round(
    subject.resilience_coefficient * 100,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#070b10]">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-300">
            Subject Inspector
          </p>

          <h3 className="mt-1 text-sm font-semibold text-white">
            Research Subject Workspace
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 transition hover:border-cyan-300/20 hover:text-cyan-300"
        >
          <X size={14} />
        </button>
      </div>


      <div className="grid gap-4 p-5 xl:grid-cols-[1.45fr_0.75fr]">

        {/* LEFT */}

        <div className="space-y-4">

          {/* SUBJECT IDENTITY */}

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04]">
                  <UserRound
                    size={18}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-cyan-300/70">
                    {subject.subject_id}
                  </p>

                  <h4 className="mt-1 text-base font-semibold text-white">
                    Research Subject
                  </h4>
                </div>

              </div>

              <SubjectStatus status={subject.status} />

            </div>


            {/* CORE METRICS */}

            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">

              <Metric
                label="Age"
                value={`${subject.age}`}
              />

              <Metric
                label="Sex"
                value={subject.sex}
              />

              <Metric
                label="Visits"
                value={`${subject.visits}`}
              />

              <Metric
                label="Modalities"
                value={`${subject.available_modalities.length}/5`}
              />

            </div>

          </div>


          {/* RESILIENCE */}

          <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.015] p-4">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[9px] uppercase tracking-[0.17em] text-cyan-300">
                  Cognitive Resilience
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  ρ{" "}
                  {subject.resilience_coefficient.toFixed(
                    3,
                  )}
                </p>
              </div>

              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-1 text-[10px] font-medium text-cyan-300">
                {resiliencePercent}%
              </span>

            </div>


            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.05]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 transition-all duration-500"
                style={{
                  width: `${resiliencePercent}%`,
                }}
              />

            </div>


            <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.12em] text-white/20">

              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>

            </div>

          </div>


          {/* MODALITIES */}

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">

            <p className="text-[9px] uppercase tracking-[0.18em] text-violet-300">
              Available Modalities
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

              {(
                [
                  "MRI",
                  "EEG",
                  "Genomics",
                  "Proteomics",
                  "Behavior",
                ] as ModalityName[]
              ).map((modality) => {

                const Icon =
                  modalityIcons[modality];

                const active =
                  subject.available_modalities.includes(
                    modality,
                  );

                return (
                  <div
                    key={modality}
                    className={`rounded-xl border p-3 ${
                      active
                        ? "border-cyan-300/15 bg-cyan-300/[0.025]"
                        : "border-white/[0.04] bg-white/[0.01] opacity-35"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <Icon
                        size={15}
                        className={
                          active
                            ? "text-cyan-300"
                            : "text-white/30"
                        }
                      />

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          active
                            ? "bg-emerald-400"
                            : "bg-white/20"
                        }`}
                      />

                    </div>

                    <p className="mt-3 text-xs font-medium text-white/80">
                      {modality}
                    </p>

                    <p className="mt-1 text-[9px] text-white/25">
                      {active
                        ? "Available"
                        : "Unavailable"}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}

        <div className="space-y-4">

          {/* PROFILE SUMMARY */}

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">

            <p className="text-[9px] uppercase tracking-[0.18em] text-violet-300">
              Subject Profile
            </p>

            <div className="mt-4 space-y-3">

              <InfoRow
                label="Subject ID"
                value={subject.subject_id}
              />

              <InfoRow
                label="Age"
                value={`${subject.age} years`}
              />

              <InfoRow
                label="Sex"
                value={subject.sex}
              />

              <InfoRow
                label="Recorded Visits"
                value={`${subject.visits}`}
              />

              <InfoRow
                label="Registry State"
                value={subject.status}
              />

            </div>

          </div>


          {/* RESEARCH INTEGRATION */}

          <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.015] p-4">

            <p className="text-[9px] uppercase tracking-[0.18em] text-cyan-300">
              Research Integration
            </p>

            <p className="mt-2 text-xs leading-5 text-white/35">
              Continue analysis of this subject in connected
              Neuro-Silicon research modules.
            </p>


            <div className="mt-4 space-y-2">

              <a
                href="/digital-twin"
                className="flex w-full items-center justify-between rounded-lg border border-cyan-300/15 bg-cyan-300/[0.025] px-3 py-2.5 text-xs text-cyan-200 transition hover:bg-cyan-300/[0.06]"
              >
                <span>Open Digital Twin</span>
                <ExternalLink size={12} />
              </a>


              <a
                href="/fusion-lab"
                className="flex w-full items-center justify-between rounded-lg border border-violet-300/15 bg-violet-300/[0.025] px-3 py-2.5 text-xs text-violet-200 transition hover:bg-violet-300/[0.06]"
              >
                <span>Open Fusion Lab</span>
                <ExternalLink size={12} />
              </a>

            </div>

          </div>


          {/* RESEARCH NOTE */}

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">

            <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
              Registry Context
            </p>

            <p className="mt-2 text-[11px] leading-5 text-white/35">
              Subject data is generated from the current
              research-scale registry and represents the
              multimodal cohort state exposed by the
              Neuro-Silicon dataset API.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">

      <p className="text-[8px] uppercase tracking-[0.13em] text-white/20">
        {label}
      </p>

      <p className="mt-1.5 text-xs font-medium text-white/75">
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
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] pb-2.5 last:border-0 last:pb-0">

      <span className="text-[10px] text-white/30">
        {label}
      </span>

      <span className="text-right text-[10px] font-medium text-white/65">
        {value}
      </span>

    </div>
  );
}


function SubjectStatus({
  status,
}: {
  status: SubjectRecord["status"];
}) {
  const classes = {
    active:
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300",

    review:
      "border-amber-400/20 bg-amber-400/[0.05] text-amber-300",

    incomplete:
      "border-rose-400/20 bg-rose-400/[0.05] text-rose-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[8px] uppercase tracking-[0.13em] ${classes[status]}`}
    >
      {status}
    </span>
  );
}