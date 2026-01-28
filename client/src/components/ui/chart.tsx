import React, { Suspense } from "react";
import { cn } from "@/lib/utils";

// Lightweight chart implementation - components load charts on demand
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

// Lazy-loaded chart container that only imports recharts when needed
const LazyChartContainer = React.lazy(async () => {
  const recharts = await import("recharts");
  
  const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
    ({ id, className, children, config, ...props }, ref) => {
      const uniqueId = React.useId();
      const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

      return (
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            className
          )}
          {...props}
        >
          <recharts.ResponsiveContainer>{children}</recharts.ResponsiveContainer>
        </div>
      );
    }
  );
  ChartContainer.displayName = "ChartContainer";

  return { default: ChartContainer };
});

// Fallback loading component
const ChartFallback = ({ className, children, ...props }: any) => (
  <div 
    className={cn("flex aspect-video justify-center items-center text-muted-foreground border rounded-md", className)} 
    {...props}
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
      <div className="text-sm">Loading chart...</div>
    </div>
  </div>
);

// Main chart container with suspense
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>((props, ref) => (
  <Suspense fallback={<ChartFallback {...props} />}>
    <LazyChartContainer ref={ref} {...props} />
  </Suspense>
));
ChartContainer.displayName = "ChartContainer";

// Simplified tooltip components
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(
  ({ active, payload, className, ...props }, ref) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {payload.map((item: any, index: number) => (
          <div key={item.dataKey} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// Lazy-loaded chart components
export const ChartTooltip = React.lazy(async () => {
  const recharts = await import("recharts");
  return { default: recharts.Tooltip };
});

export const ChartLegend = React.lazy(async () => {
  const recharts = await import("recharts");
  return { default: recharts.Legend };
});

export const ChartLegendContent = React.lazy(async () => {
  const recharts = await import("recharts");
  return { default: recharts.Legend };
});