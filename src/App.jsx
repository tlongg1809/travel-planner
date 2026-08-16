import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext";

// USER
import Home from "./pages/User/Home";
import Explore from "./pages/User/Explore";
import PlaceDetail from "./pages/User/PlaceDetail";
import Favorites from "./pages/User/Favorites";
import MapPage from "./pages/User/MapPage";
import CreateSchedule from "./pages/User/CreateSchedule";
import MapExplore from "./pages/User/MapExplore";
import GroupSchedules from "./pages/User/GroupSchedules";
import ScheduleDetail from "./pages/User/ScheduleDetail";
import GroupDetail from "./pages/User/GroupDetail";
// ADMIN
import QuanLyNguoiDung from "./pages/Admin/QuanLyNguoiDung";
import QuanLyBinhLuan from "./pages/Admin/QuanLyBinhLuan";
import AdminLayout from "./components/Layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyDanhMuc from "./pages/Admin/QuanLyDanhMuc";
import QuanLyDiaDiem, {
  LocationFormPage,
  LocationDetailPage,
} from "./pages/Admin/QuanLyDiaDiem";

// ===============================
// BẢO VỆ KHU VỰC ADMIN
// ===============================
function ProtectedAdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  // Chưa đăng nhập hoặc không phải admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Đã là admin -> hiển thị Layout + nội dung trang
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

// ===============================
// APP
// ===============================
function App() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* ================= USER ================= */}

          {/* Trang chủ */}
          <Route path="/" element={<Home />} />

          {/* Khám phá */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/map" element={<MapPage />} />
          {/* Chi tiết địa điểm */}
          <Route
            path="/places/:id"
            element={<PlaceDetail />}
          />
          {/* Yêu thích */}
          <Route
            path="/favorites"
            element={<Favorites />}
          />

          {/* Địa điểm yêu thích */}
          
          
          <Route path="/create-schedule" element={<CreateSchedule />} />
          <Route path="/map-explore" element={<MapExplore />} />
          <Route path="/group-schedule" element={<GroupSchedules />} />
          <Route path="/create-schedule/:id" element={<ScheduleDetail />} />
          <Route path="/group-schedules/:id" element={<GroupDetail />} />


          {/* ================= ADMIN ================= */}

          <Route path="/admin" element={<ProtectedAdminRoute />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Quản lý danh mục */}
            <Route
              path="danh-muc"
              element={<QuanLyDanhMuc />}
            />

            {/* Quản lý địa điểm */}
            <Route
              path="dia-diem"
              element={<QuanLyDiaDiem />}
            />

            {/* Thêm địa điểm */}
            <Route
              path="dia-diem/them"
              element={<LocationFormPage mode="add" />}
            />

            {/* Chi tiết địa điểm */}
            <Route
              path="dia-diem/:id"
              element={<LocationDetailPage />}
            />

            {/* Chỉnh sửa địa điểm */}
            <Route
              path="dia-diem/:id/chinh-sua"
              element={<LocationFormPage mode="edit" />}
            />
            {/* Quản lý bình luận */}
            <Route
              path="binh-luan"
              element={<QuanLyBinhLuan />}
            />

            {/* Quản lý người dùng */}
            <Route
              path="nguoi-dung"
              element={<QuanLyNguoiDung />}
            />

          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;