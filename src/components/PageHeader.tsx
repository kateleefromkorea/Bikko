import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

// Frosted panel so headings stay legible over the patterned page background.
export default function PageHeader({ title, subtitle, badge, action }: Props) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 backdrop-blur-xl shadow-sm px-5 py-5 sm:px-8 sm:py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && <p className="text-muted-foreground text-sm mt-1.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
