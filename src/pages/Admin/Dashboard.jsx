import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  MessageSquare,
  Star,
  UserCheck,
  UserX,
} from "lucide-react";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [overviewResponse, placesResponse, usersResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/admin/dashboard/overview"),
            fetch("http://localhost:5000/api/admin/dashboard/popular-places"),
            fetch("http://localhost:5000/api/admin/dashboard/users"),
          ]);

        if (!overviewResponse.ok || !placesResponse.ok || !usersResponse.ok) {
          throw new Error("Không thể lấy dữ liệu dashboard.");
        }

        const overviewData = await overviewResponse.json();

        const placesData = await placesResponse.json();

        const usersData = await usersResponse.json();

        setOverview(overviewData);
        setPopularPlaces(placesData);
        setUserStats(usersData);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);

        setError("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Tổng quan hệ thống
      </h1>

      {/* =========================
                TỔNG QUAN
            ========================== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tổng địa điểm */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Tổng địa điểm</span>

            <MapPin size={20} className="text-blue-600" />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {overview?.totalPlaces ?? 0}
          </p>
        </div>

        {/* Người dùng */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Người dùng đăng ký</span>

            <Users size={20} className="text-green-600" />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {overview?.totalUsers ?? 0}
          </p>
        </div>

        {/* Bình luận + đánh giá */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Bình luận & Đánh giá</span>

            <MessageSquare size={20} className="text-purple-600" />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {overview?.totalInteractions ?? 0}
          </p>
        </div>
      </div>

      {/* =========================
                PHẦN DƯỚI
            ========================== */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* =====================
                    ĐỊA ĐIỂM PHỔ BIẾN
                ====================== */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Star size={19} className="text-yellow-500" />

              <div>
                <h2 className="font-semibold text-slate-800">
                  Địa điểm phổ biến
                </h2>

                <p className="text-xs text-slate-500">
                  Các địa điểm có nhiều lượt đánh giá
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {popularPlaces.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">Chưa có dữ liệu.</div>
            ) : (
              popularPlaces.map((place, index) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {place.tendiadiem}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {place.so_danh_gia} đánh giá
                        {" · "}
                        {place.so_binh_luan} bình luận
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 flex shrink-0 items-center gap-1">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold text-slate-700">
                      {place.diem_trung_binh}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =====================
                    THỐNG KÊ NGƯỜI DÙNG
                ====================== */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users size={19} className="text-blue-600" />

              <div>
                <h2 className="font-semibold text-slate-800">
                  Thống kê người dùng
                </h2>

                <p className="text-xs text-slate-500">
                  Tình trạng tài khoản trong hệ thống
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5">
            {/* Đang hoạt động */}
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-green-600" />

                <span className="text-sm text-slate-500">Đang hoạt động</span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {userStats?.dang_hoat_dong ?? 0}
              </p>
            </div>

            {/* Bị khóa */}
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <UserX size={18} className="text-red-600" />

                <span className="text-sm text-slate-500">Bị khóa</span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {userStats?.bi_khoa ?? 0}
              </p>
            </div>

            {/* User */}
            <div className="rounded-lg border border-slate-200 p-4">
              <span className="text-sm text-slate-500">Người dùng</span>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {userStats?.nguoi_dung ?? 0}
              </p>
            </div>

            {/* Admin */}
            <div className="rounded-lg border border-slate-200 p-4">
              <span className="text-sm text-slate-500">Quản trị viên</span>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {userStats?.quan_tri_vien ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
