import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/User/Home";
im
return (
    <div className="flex h-screen w-full">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
