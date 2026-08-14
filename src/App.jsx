import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/User/Home";
import Explore from "./pages/User/Explore";
import Favorites from "./pages/User/Favorites";


function App() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
