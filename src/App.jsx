import { Routes, Route } from "react-router-dom";

import Home from "./pages/User/Home";
import Explore from "./pages/User/Explore";
import PlaceDetail from "./pages/User/PlaceDetail";
import Favorites from "./pages/User/Favorites";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyDanhMuc from "./pages/Admin/QuanLyDanhMuc";
import QuanLyDiaDiem, {
  LocationFormPage,
  LocationDetailPage,
} from "./pages/Admin/QuanLyDiaDiem";
import QuanLyBinhLuan from "./pages/Admin/QuanLyBinhLuan";
import QuanLyNguoiDung from "./pages/Admin/QuanLyNguoiDung";

import CreateSchedule from "./pages/User/CreateSchedule";
import ScheduleDetail from "./pages/User/ScheduleDetail";
import GroupSchedules from "./pages/User/GroupSchedules";
import GroupDetail from "./pages/User/GroupDetail";

function App() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* USER */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/favorites" element={<Favorites />} />
            <Route path="/create-schedule" element={<CreateSchedule />} />
            <Route path="/create-schedule/:id" element={<ScheduleDetail />} />

            <Route path="/group-schedule" element={<GroupSchedules />} />
            <Route path="/group-schedules/:id" element={<GroupDetail />} />

            
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
            <Route path="/admin/binh-luan" element={<QuanLyBinhLuan />} />
            <Route path="/admin/nguoi-dung" element={<QuanLyNguoiDung />} />

          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
