import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/User/Home";
import Explore from "./pages/User/Explore";
import PlaceDetail from "./pages/User/PlaceDetail";

function App() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
