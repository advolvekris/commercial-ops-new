import { useEffect, useState } from "react";

interface ThinkingBlockProps {
  title: string;
  steps: string[];
  stepDelayMs?: number;
  doneDelayMs?: number;
  /** Called whenever the visible step list grows or marks a step as done, so a parent can re-scroll. */
  onLayoutChange?: () => void;
}

export function ThinkingBlock({
  title,
  steps,
  stepDelayMs = 900,
  doneDelayMs = 600,
  onLayoutChange,
}: ThinkingBlockProps) {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleSteps((p) => [...p, i]);
          timers.push(
            setTimeout(() => {
              setDoneSteps((p) => [...p, i]);
            }, doneDelayMs),
          );
        }, i * stepDelayMs),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [steps, stepDelayMs, doneDelayMs]);

  useEffect(() => {
    onLayoutChange?.();
  }, [visibleSteps, doneSteps, onLayoutChange]);

  return (
    <div className="TH-wrap">
      <div className="TH-header">
        <div className="TH-spinner" />
        {title}
      </div>
      <div className="TH-steps">
        {steps.map(
          (txt, i) =>
            visibleSteps.includes(i) && (
              <div key={i} className={`TH-step${doneSteps.includes(i) ? " done" : ""}`}>
                <span
                  className="TH-step-dot"
                  style={doneSteps.includes(i) ? { background: "var(--color-highlight)" } : undefined}
                />
                {txt}
              </div>
            ),
        )}
      </div>
    </div>
  );
}

export function runThinkingSteps(
  steps: string[],
  onStep: (index: number, text: string) => void,
  onComplete: () => void,
  totalDelayMs = 5200,
  stepDelayMs = 900,
) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  steps.forEach((txt, i) => {
    timers.push(
      setTimeout(() => {
        onStep(i, txt);
      }, i * stepDelayMs),
    );
  });
  timers.push(setTimeout(onComplete, totalDelayMs));
  return () => timers.forEach(clearTimeout);
}
