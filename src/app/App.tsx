import { FC, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PortfolioPage } from "@/portfolio";

// The showcase pulls in three.js, the URDF loader, and the simulation
// runtimes, so it only loads when someone actually opens it.
const WorkcellShowcase = lazy(() => import("./pages/WorkcellShowcase"));

const ShowcaseFallback: FC = () => (
  <div className="flex h-svh w-svw items-center justify-center bg-background font-mono text-xs text-muted-foreground">
    <span className="hud-live">loading workcell…</span>
  </div>
);

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route
        path="/showcase/workcell"
        element={
          <Suspense fallback={<ShowcaseFallback />}>
            <WorkcellShowcase />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
