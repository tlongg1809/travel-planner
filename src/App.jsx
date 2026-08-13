import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/User/Home";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyDanhMuc from "./pages/Admin/QuanLyDanhMuc";
import {
  LocationList,
  LocationFormPage,
  LocationDetailPage,
} from "./pages/Admin/QuanLyDiaDiem";

function App() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="danh-muc" element={<QuanLyDanhMuc />} />
            <Route path="dia-diem">
              <Route index element={<LocationList />} />
              <Route path="them" element={<LocationFormPage mode="add" />} />
              <Route path=":id" element={<LocationDetailPage />} />
              <Route
                path=":id/chinh-sua"
                element={<LocationFormPage mode="edit" />}
              />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
