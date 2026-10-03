import { useRef, useState } from "react";

import { SectionCard } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import { ReceptionChecklistStep } from "@/components/reception/reception-checklist-step";
import { ReceptionInspectionStep } from "@/components/reception/reception-inspection-step";
import { ReceptionPartyStep } from "@/components/reception/reception-party-step";
import { ReceptionReviewStep } from "@/components/reception/reception-review-step";
import { Button } from "@/components/ui/button";
import type { Reception } from "@/domain/reception";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "party",
    label: "Cliente y vehículo",
    slot: "Búsqueda y alta de cliente/vehículo.",
  },
  {
    id: "inspection",
    label: "Inspección",
    slot: "Mapa de daños e inspección visual.",
  },
  {
    id: "checklist",
    label: "Checklist",
    slot: "Kilometraje, combustible, pertenencias y notas.",
  },
  {
    id: "review",
    label: "Revisión",
    slot: "Resumen y creación de la orden de trabajo.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function ReceptionWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [reception, setReception] = useState<Reception | undefined>();
  const [partyReady, setPartyReady] = useState(false);
  const [checklistReady, setChecklistReady] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);
  const [handoffDone, setHandoffDone] = useState(false);
  const partySubmitRef = useRef<(() => void) | null>(null);
  const checklistSubmitRef = useRef<(() => void) | null>(null);
  const reviewSubmitRef = useRef<(() => void) | null>(null);
  const step = STEPS[stepIndex] ?? STEPS[0];
  const isFirst = stepIndex === 0;
  const isParty = step.id === "party";
  const isChecklist = step.id === "checklist";
  const isReview = step.id === "review";

  function goTo(id: StepId) {
    const next = STEPS.findIndex((item) => item.id === id);
    if (next >= 0) {
      setStepIndex(next);
    }
  }

  function handleNext() {
    if (isParty) {
      partySubmitRef.current?.();
      return;
    }
    if (isChecklist) {
      checklistSubmitRef.current?.();
      return;
    }
    if (isReview) {
      reviewSubmitRef.current?.();
      return;
    }

    setStepIndex((value) => Math.min(STEPS.length - 1, value + 1));
  }

  return (
    <ModulePage
      title="Recepción de vehículo"
      breadcrumb="Inicio / Taller / Recepción de vehículo"
    >
      <ol className="grid gap-2 sm:grid-cols-4">
        {STEPS.map((item, index) => {
          const active = index === stepIndex;
          const done = index < stepIndex;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goTo(item.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left",
                  active && "border-primary bg-primary/10",
                  done && !active && "border-border bg-card",
                  !active && !done && "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-md text-[11px] font-bold",
                    active && "bg-primary text-primary-foreground",
                    done && !active && "bg-success/15 text-success",
                    !active && !done && "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 truncate text-xs font-semibold">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <SectionCard
        title={step.label}
        subtitle={
          reception
            ? `${reception.code} · Paso ${stepIndex + 1} de ${STEPS.length}`
            : `Paso ${stepIndex + 1} de ${STEPS.length}`
        }
        className="mt-4"
      >
        {isParty ? (
          <ReceptionPartyStep
            {...(reception?.id !== undefined
              ? { receptionId: reception.id }
              : {})}
            submitRef={partySubmitRef}
            onReadyChange={setPartyReady}
            onSaved={setReception}
            onContinue={() => setStepIndex(1)}
          />
        ) : step.id === "inspection" ? (
          <ReceptionInspectionStep
            {...(reception?.id !== undefined
              ? { receptionId: reception.id }
              : {})}
          />
        ) : isChecklist ? (
          <ReceptionChecklistStep
            {...(reception?.id !== undefined
              ? { receptionId: reception.id }
              : {})}
            submitRef={checklistSubmitRef}
            onReadyChange={setChecklistReady}
            onSaved={setReception}
            onContinue={() => setStepIndex(3)}
          />
        ) : (
          <ReceptionReviewStep
            {...(reception?.id !== undefined
              ? { receptionId: reception.id }
              : {})}
            submitRef={reviewSubmitRef}
            onReadyChange={setReviewReady}
            onSaved={(saved) => {
              setReception(saved);
              setHandoffDone(true);
            }}
          />
        )}
      </SectionCard>

      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isFirst}
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
        >
          Atrás
        </Button>
        <Button
          type="button"
          disabled={
            (isParty && !partyReady) ||
            (isChecklist && !checklistReady) ||
            (isReview && (!reviewReady || handoffDone))
          }
          onClick={handleNext}
        >
          {isReview ? "Confirmar recepción" : "Siguiente"}
        </Button>
      </div>
    </ModulePage>
  );
}
