import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/User/Home";
import Explore from "./pages/User/Explore";
import PlaceDetail from "./pages/User/PlaceDetail";
import Favorites from "./pages/User/Favorites";
import AdminLayout from "./components/Layout/AdminLayout";
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

function ProtectedAdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
}

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
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="danh-muc" element={<QuanLyDanhMuc />} />
            <Route path="dia-diem" element={<QuanLyDiaDiem />} />
            <Route path="dia-diem/them" element={<LocationFormPage mode="add" />} />
            <Route path="dia-diem/:id" element={<LocationDetailPage />} />
            <Route path="dia-diem/:id/chinh-sua" element={<LocationFormPage mode="edit" />} />
            <Route path="binh-luan" element={<QuanLyBinhLuan />} />
            <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
