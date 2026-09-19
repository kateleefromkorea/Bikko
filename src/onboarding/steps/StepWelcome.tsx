import { StepHeading } from "../ui";
import { VALUE_PROP_ICONS } from "../../lib/icons";

const VALUE_PROPS = [
  {
    title: "Whole-person health",
    body: "Water, sleep, movement, mood and medication — all in one place, not five apps.",
  },
  {
    title: "Smart nutrition tracking",
    body: "Search a real food database, log a meal in seconds, and save the foods you eat often.",
  },
  {
    title: "A plan built from your numbers",
    body: "We work out your daily calorie target from your own body and goals — no generic defaults.",
  },
];

export default function StepWelcome({ name }: { name: string }) {
  return (
    <div>
      <StepHeading
        title={name ? `Welcome, ${name.split(/\s+/)[0]}.` : "Welcome to Fikko."}
        subtitle="Six quick questions and your dashboard is set up around you. It takes about a minute."
      />

      <div className="flex flex-col gap-3">
        {VALUE_PROPS.map((v, i) => {
          const Icon = VALUE_PROP_ICONS[i];
          return (
          <div key={v.title} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3.5">
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--muted)" }}
            >
              <Icon size={18} strokeWidth={2} style={{ color: "var(--primary)" }} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{v.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{v.body}</p>
            </div>
          </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-5">
        Your answers stay in your own account and are only used to work out your targets.
      </p>
    </div>
  );
}
