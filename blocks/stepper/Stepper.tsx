"use client";

/**
 * Stepper: where a person is in a sequence of steps.
 *
 * A block of the MD3 kit: it is copied into your project to be edited. It is
 * yours from then on: an update of the kit does not touch it. It is built
 * from the kit's `Button`, `CheckIcon` and type primitives, on the kit's
 * role utilities.
 *
 *   <Stepper aria-label="Checkout" current={1} onStepPress={setStep}
 *     steps={[
 *       { id: "address", label: "Address" },
 *       { id: "delivery", label: "Delivery" },
 *       { id: "payment", label: "Payment" },
 *     ]} />
 *
 * A step before the current one is done: it shows a check, and with
 * `onStepPress` it is a button that goes back to it. The current step is
 * marked `aria-current="step"`. Steps after it are not reached yet and are
 * not pressed. Where the stepper is narrower than 32rem (by its own width,
 * a container query) only the current step's label is drawn, with "2 of 4"
 * before it.
 *
 * Neither Material 3 nor React Aria describes a stepper. It borrows
 * Material's colour roles (https://m3.material.io/styles/color/roles:
 * `primary` for what is done and current, `outline` for what is ahead), its
 * label-large type, and its text button
 * (https://m3.material.io/components/buttons/specs) for a step gone back to.
 */
import { Button, CheckIcon, Label } from "@/registry/ds/ui/ds";

export type Step = { id: string; label: string };

export type StepperProps = {
  steps: Step[];
  /** The index of the current step, from 0. */
  current: number;
  /** Called with a done step's index when it is pressed. Left out, done
   *  steps are not buttons. */
  onStepPress?: (index: number) => void;
  /** The landmark's name: what these are the steps of. */
  "aria-label": string;
  className?: string;
};

export function Stepper({
  steps,
  current,
  onStepPress,
  "aria-label": label,
  className = "",
}: StepperProps) {
  return (
    <nav aria-label={label} className={`@container ${className}`}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const isCurrent = index === current;
          const marker = (
            <span
              aria-hidden
              className={`rounded-shape-full flex size-6 shrink-0 items-center justify-center ${
                done || isCurrent
                  ? "bg-primary text-on-primary"
                  : "border-outline text-on-surface-variant border"
              }`}
            >
              {done ? (
                <CheckIcon size={16} />
              ) : (
                <Label size="medium" component="span">
                  {index + 1}
                </Label>
              )}
            </span>
          );
          const name = (
            <Label
              size="large"
              component="span"
              className={`${isCurrent ? "text-on-surface" : "text-on-surface-variant"} ${
                // Unseen where there is no room, and still the step's name.
                isCurrent ? "" : "sr-only @lg:not-sr-only"
              }`}
            >
              {/* On a phone the one label drawn says where it stands. */}
              {isCurrent && (
                <span className="text-on-surface-variant @lg:hidden">
                  {index + 1} of {steps.length}:{" "}
                </span>
              )}
              {step.label}
            </Label>
          );
          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className="flex min-w-0 items-center gap-2"
            >
              {done && onStepPress ? (
                <Button
                  variant="text"
                  onPress={() => onStepPress(index)}
                  aria-label={`${step.label}, done. Go back to this step`}
                >
                  <span className="inline-flex items-center gap-2">
                    {marker}
                    {name}
                  </span>
                </Button>
              ) : (
                <span className="inline-flex min-h-10 items-center gap-2 px-3">
                  {marker}
                  {name}
                  {done && <span className="sr-only">, done</span>}
                </span>
              )}
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`h-px w-6 shrink-0 @lg:w-10 ${done ? "bg-primary" : "bg-outline-variant"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
