import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import Layout from "./Layout/Layout";

const AdminUpload = lazy(() => import("./pages/Admin"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs text-white/50">
    Loading component...
  </div>
);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true, // Enables smooth touch scrolling on mobile
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/admin" element={<AdminUpload />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;