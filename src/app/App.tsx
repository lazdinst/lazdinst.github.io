import { FC, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PortfolioPage } from "@/portfolio";

// The showcases pull in three.js, the URDF loader, Leaflet, and the simulation
// runtimes, so each only loads when someone actually opens it.
const WorkcellShowcase = lazy(() => import("./pages/WorkcellShowcase"));
const FleetShowcase = lazy(() => import("./fleet/FleetShowcase"));

const ShowcaseFallback: FC<{ label: string }> = ({ label }) => (
  <div className="flex h-svh w-svw items-center justify-center bg-background font-mono text-xs text-muted-foreground">
    <span className="hud-live">loading {label}…</span>
  </div>
);

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route
        path="/showcase/workcell"
        element={
          <Suspense fallback={<ShowcaseFallback label="workcell" />}>
            <WorkcellShowcase />
          </Suspense>
        }
      />
      <Route
        path="/showcase/fleet"
        element={
          <Suspense fallback={<ShowcaseFallback label="fleet" />}>
            <FleetShowcase />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
