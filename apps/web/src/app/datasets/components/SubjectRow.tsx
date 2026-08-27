"use client";

import {
  Brain,
  Dna,
  Eye,
  Layers3,
  Waves,
  Activity,
} from "lucide-react";

import type {
  ModalityName,
  SubjectRecord,
} from "@/services/datasets";


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


export default function SubjectRow({
  subject,
  onOpen,
}: {
  subject: SubjectRecord;
  onOpen: () => void;
}) {
  const rhoPercent =
    Math.round(
      subject.resilience_coefficient *
        100,
    );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-[1.15fr_0.6fr_0.65fr_0.65fr_1.7fr_1fr_0.85fr_auto] items-center gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-cyan-300/[0.02]"
    >

      {/* SUBJECT ID */}

      <div>
        <p className="text-sm font-medium text-white/80">
          {subject.subject_id}
        </p>

        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/20">
          Research Subject
        </p>
      </div>


      {/* AGE */}

      <p className="text-xs text-white/55">
        {subject.age}
      </p>


      {/* SEX */}

      <p className="text-xs text-white/55">
        {subject.sex}
      </p>


      {/* VISITS */}

      <p className="text-xs text-white/55">
        {subject.visits}
      </p>


      {/* MODALITIES */}

      <div className="flex flex-wrap items-center gap-1.5">

        {subject.available_modalities.map(
          (modality) => {
            const Icon =
              modalityIcons[
                modality
              ];

            return (
              <span
                key={modality}
                title={modality}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02]"
              >
                <Icon
                  size={13}
                  className="text-cyan-300/70"
                />
              </span>
            );
          },
        )}
      </div>


      {/* RESILIENCE */}

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-cyan-300">
            ρ{" "}
            {subject.resilience_coefficient.toFixed(
              2,
            )}
          </span>

          <span className="text-[9px] text-white/25">
            {rhoPercent}%
          </span>
        </div>

        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
            style={{
              width: `${rhoPercent}%`,
            }}
          />
        </div>
      </div>


      {/* STATUS */}

      <StatusBadge
        status={
          subject.status
        }
      />


      {/* OPEN */}

      <div className="flex justify-end">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/25 transition hover:text-cyan-300">
          <Eye
            size={14}
          />
        </span>
      </div>
    </button>
  );
}


function StatusBadge({
  status,
}: {
  status:
    SubjectRecord["status"];
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
      className={`inline-flex w-fit rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.13em] ${classes[status]}`}
    >
      {status}
    </span>
  );
}