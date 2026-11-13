"use client";

import type { ProjectVisual as VisualKind } from "@/data/projects";
import { GeofenceVisual } from "./visuals/GeofenceVisual";
import { OrchestratorVisual } from "./visuals/OrchestratorVisual";
import { PipelineVisual } from "./visuals/PipelineVisual";
import { TradingVisual } from "./visuals/TradingVisual";

/**
 * `fill` lets a visual stretch to a fixed-height parent (the stacked project panels
 * on tall desktop screens); otherwise visuals size themselves by aspect ratio.
 */
export function ProjectVisual({ kind, large = false, fill = false }: { kind: VisualKind; large?: boolean; fill?: boolean }) {
  switch (kind) {
    case "geofence":
      return <GeofenceVisual large={large} fill={fill} />;
    case "orchestrator":
      return <OrchestratorVisual fill={fill} />;
    case "pipeline":
      return <PipelineVisual />;
    case "trading":
      return <TradingVisual large={large} />;
  }
}
