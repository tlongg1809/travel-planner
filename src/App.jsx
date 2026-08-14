import { Routes, Route } from "react-router-dom";

import Home from "./pages/User/Home";
import Explore from "./pages/User/Explore";

import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyDanhMuc from "./pages/Admin/QuanLyDanhMuc";

import QuanLyDiaDiem, {
  LocationFormPage,
  LocationDetailPage,
} from "./pages/Admin/QuanLyDiaDiem";

function App() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* USER */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="danh-muc" element={<QuanLyDanhMuc />} />
            {/* Quản lý địa điểm */}
            <Route path="dia-diem" element={<QuanLyDiaDiem />} />
            {/* Thêm địa điểm (phải trước :id) */}
            <Route
              path="dia-diem/them"
              element={<LocationFormPage mode="add" />}
            />
            {/* Xem chi tiết địa điểm */}
            <Route path="dia-diem/:id" element={<LocationDetailPage />} />
            {/* Chỉnh sửa địa điểm */}
            <Route
              path="dia-diem/:id/chinh-sua"
              element={<LocationFormPage mode="edit" />}
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
