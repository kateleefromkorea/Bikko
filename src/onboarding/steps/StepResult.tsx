import type { Baseline } from "../../lib/metabolics";
import { goalByKey } from "../../lib/metabolics";
import { TriangleAlert } from "lucide-react";

interface Props {
  baseline: Baseline;
  goalKey: string | null;
  name: string;
  onDone: () => void;
  saving: boolean;
}

export default function StepResult({ baseline, goalKey, name, onDone, saving }: Props) {
  const goal = goalByKey(goalKey);
  const { bmr, tdee, calorieTarget, adjustment, clampedToFloor } = baseline;

  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
        {name ? `${name.split(/\s+/)[0]}, your plan is ready.` : "Your plan is ready."}
      </h2>
      <p className="text-sm text-muted-foreground mt-1.5">
        Worked out from your own body and goal — not a generic default.
      </p>

      {/* The headline number */}
      <div className="mt-6 rounded-2xl p-6" style={{ background: "var(--primary)" }}>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.75)" }}>
          Your daily target
        </p>
        <p className="metric-display text-5xl font-extrabold mt-1" style={{ color: "#fff" }}>
          {calorieTarget.toLocaleString()}
        </p>
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>kcal per day</p>
        {adjustment !== 0 && (
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.8)" }}>
            {adjustment < 0
              ? `A ${Math.abs(adjustment).toLocaleString()} kcal daily deficit`
              : `A ${adjustment.toLocaleString()} kcal daily surplus`}
            {goal ? ` for ${goal.label.toLowerCase()}` : ""}
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="metric text-2xl font-extrabold text-foreground">{bmr.toLocaleString()}</p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">BMR</p>
          <p className="text-xs text-muted-foreground mt-1">What you burn at complete rest</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="metric text-2xl font-extrabold text-foreground">{tdee.toLocaleString()}</p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">TDEE</p>
          <p className="text-xs text-muted-foreground mt-1">With your activity level on top</p>
        </div>
      </div>

      {clampedToFloor && (
        <p className="text-xs rounded-lg p-3 mt-3 text-left flex gap-2" style={{ background: "rgba(245,166,35,0.1)", color: "#8a5a00" }}>
          <TriangleAlert size={14} strokeWidth={2.25} className="flex-shrink-0 mt-0.5" />
          <span>Your chosen pace worked out below a safe daily minimum, so we raised your target to{" "}
          {calorieTarget.toLocaleString()} kcal. Pick a gentler rate in your profile if you would like the
          maths to match your original pace.</span>
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        These are estimates from the Mifflin-St Jeor equation, not medical advice. Check with a
        clinician before making big changes.
      </p>

      <button
        type="button"
        onClick={onDone}
        disabled={saving}
        className="w-full mt-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
      >
        {saving ? "Saving…" : "Go to my dashboard →"}
      </button>
    </div>
  );
}
