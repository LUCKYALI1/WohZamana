import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Lazy loading Admin component (Loaded only when route is accessed)
const AdminUpload = lazy(() => import("./pages/Admin"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs text-white/50">
    Loading component...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminUpload />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;