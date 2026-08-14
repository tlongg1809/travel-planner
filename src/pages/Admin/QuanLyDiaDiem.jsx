import React, { useEffect, useMemo, useState } from "react";
import MapPicker from "../../components/MapPicker";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  MapPin,
  Tag,
  CheckCircle,
  EyeOff,
  Star,
  ArrowLeft,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Navigation,
  DollarSign,
  Map,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
/* =========================================================
   CONFIG
   ========================================================= */
const API_URL = "http://localhost:5000/api";
/* =========================================================
   HELPER
   ========================================================= */
function formatVND(value) {
  const number = Number(value || 0);
  if (number === 0) {
    return "Miễn phí";
  }
  return new Intl.NumberFormat("vi-VN").format(number) + " đ";
}
function normalizePlace(place) {
  if (!place) return null;

  // Xử lý images: nếu là string thì convert thành array
  let images = place.images ?? [];
  if (typeof images === "string") {
    const trimmed = images.trim();
    if (trimmed) {
      images = trimmed
        .split(",")
        .filter((url) => url.trim())
        .map((url, index) => ({
          Url: url.trim(),
          IsPrimary: index === 0 ? 1 : 0,
        }));
    } else {
      images = [];
    }
  } else if (!Array.isArray(images)) {
    images = [];
  }

  // Xử lý categoryName từ categories (GROUP_CONCAT result)
  let categoryName = "";
  const categoriesStr = place.categories ?? place.tendanhmuc ?? "";
  if (typeof categoriesStr === "string") {
    const trimmed = categoriesStr.trim();
    if (trimmed) {
      categoryName = trimmed.split(",")[0].trim(); // Lấy danh mục đầu tiên
    }
  }

  return {
    ...place,
    id: place.id,
    name: place.name ?? place.tendiadiem ?? "",
    description: place.description ?? place.mota ?? "",
    address: place.address ?? place.diachi ?? "",
    district: place.district ?? place.quanhuyen ?? "",
    province: place.province ?? place.tinhthanh ?? "",
    price: place.price ?? place.giadukien ?? 0,
    status:
      place.status ?? (Number(place.trangthai) === 1 ? "active" : "hidden"),
    googlePlaceId: place.googlePlaceId ?? place.google_place_id ?? "",
    lat: place.lat ?? place.latitude ?? 0,
    lng: place.lng ?? place.longitude ?? 0,
    categoryId: place.categoryId ?? place.danhmucid ?? place.danhmucId ?? null,
    categoryName: categoryName || (place.categoryName ?? ""),
    rating: place.rating ?? place.sosao ?? 0,
    images: images,
  };
}

/* =========================================================
   TOAST
   ========================================================= */
function Toast({ open, message, variant = "success", onClose }) {
  if (!open) return null;
  const success = variant === "success";
  return (
    <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
          success ? "border-emerald-200" : "border-red-200"
        }`}
      >
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            success
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              success ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {success ? "Thành công" : "Có lỗi xảy ra"}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
/* =========================================================
   DELETE MODAL
   ========================================================= */
function ConfirmDeleteModal({
  open,
  location,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">
            Xóa địa điểm
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={19} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="font-medium text-slate-800">
                Bạn có chắc muốn xóa địa điểm này?
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Địa điểm{" "}
                <strong className="text-slate-700">{location?.name}</strong> sẽ
                bị xóa khỏi hệ thống.
              </p>
              <p className="mt-2 text-xs text-red-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Xóa địa điểm
          </button>
        </div>
      </div>
    </div>
  );
}
/* =========================================================
   STAT CARD
   ========================================================= */
function StatCard({ icon: Icon, label, value, description, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
/* =========================================================
   CATEGORY BADGE
   ========================================================= */
function CategoryBadge({ categoryName }) {
  const styles = {
    "Ăn uống": "bg-orange-50 text-orange-700 border-orange-200",
    "Quán cà phê": "bg-amber-50 text-amber-700 border-amber-200",
    "Cà phê": "bg-amber-50 text-amber-700 border-amber-200",
    Homestay: "bg-violet-50 text-violet-700 border-violet-200",
    "Khách sạn": "bg-blue-50 text-blue-700 border-blue-200",
    "Check-in": "bg-pink-50 text-pink-700 border-pink-200",
    "Vui chơi": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "View đẹp": "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  const style =
    styles[categoryName] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {categoryName || "Chưa phân loại"}
    </span>
  );
}
/* =========================================================
   STATUS BADGE
   ========================================================= */
function StatusBadge({ status }) {
  const active =
    status === "active" || status === 1 || status === "1" || status === true;
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Tạm ẩn
    </span>
  );
}
/* =========================================================
   RATING
   ========================================================= */
function RatingStars({ value = 0 }) {
  const rating = Number(value) || 0;
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex text-amber-400">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <Star
            key={index}
            size={14}
            fill={index < Math.round(rating) ? "currentColor" : "none"}
          />
        ))}
      </div>
      <span className="text-xs text-slate-500">
        {rating > 0 ? rating.toFixed(1) : "Chưa có"}
      </span>
    </div>
  );
}
/* =========================================================
   LOCATION THUMBNAIL
   ========================================================= */
function LocationThumbnail({ location, large = false }) {
  // Ưu tiên: images array -> image field -> không có
  let imageUrl = null;

  // Cố gắng lấy từ images array trước tiên
  if (
    location?.images &&
    Array.isArray(location.images) &&
    location.images.length > 0
  ) {
    const primaryImage = location.images.find(
      (item) => item.IsPrimary === 1 || item.isPrimary === true,
    );
    imageUrl =
      primaryImage?.Url ||
      primaryImage?.url ||
      location.images[0]?.Url ||
      location.images[0]?.url;
  }

  // Fallback tới image field nếu có
  if (
    !imageUrl &&
    location?.image &&
    typeof location.image === "string" &&
    location.image.trim()
  ) {
    imageUrl = location.image.trim();
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={location.name}
        className={`shrink-0 rounded-xl object-cover ${
          large ? "h-48 w-full" : "h-12 w-12"
        }`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white ${
        large ? "h-48 w-full" : "h-12 w-12"
      }`}
    >
      <MapPin size={large ? 48 : 22} />
    </div>
  );
}
/* =========================================================
   EMPTY STATE
   ========================================================= */
function EmptyState({
  title = "Không có dữ liệu",
  description = "Chưa có địa điểm nào.",
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <MapPin size={27} />
      </div>
      <p className="mt-4 font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
/* =========================================================
   FILTER BAR
   ========================================================= */
function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  district,
  setDistrict,
  status,
  setStatus,
  categories,
  districts,
  onReset,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên địa điểm..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.tendanhmuc}
            </option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Tất cả quận/huyện</option>
          {districts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="hidden">Tạm ẩn</option>
        </select>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={15} />
          Đặt lại
        </button>
      </div>
    </div>
  );
}
/* =========================================================
   LOCATION TABLE
   ========================================================= */
function LocationsTable({ locations, loading, onView, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }
  if (locations.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy địa điểm"
        description="Không có địa điểm nào phù hợp với bộ lọc hiện tại."
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Địa điểm
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Danh mục
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Khu vực
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Giá dự kiến
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Đánh giá
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {locations.map((location) => (
            <tr key={location.id} className="transition hover:bg-blue-50/40">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="max-w-[260px] truncate font-semibold text-slate-800">
                      {location.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      <span className="max-w-[250px] truncate">
                        {location.address}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <CategoryBadge categoryName={location.categoryName} />
              </td>
              <td className="px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {location.district || "Chưa cập nhật"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {location.province || ""}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-slate-700">
                  {formatVND(location.price)}
                </span>
              </td>
              <td className="px-4 py-4">
                <RatingStars value={location.rating} />
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={location.status} />
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    title="Xem chi tiết"
                    onClick={() => onView(location.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    type="button"
                    title="Chỉnh sửa"
                    onClick={() => onEdit(location.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    title="Xóa"
                    onClick={() => onDelete(location)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
/* =========================================================
   PAGINATION
   ========================================================= */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <p className="text-sm text-slate-500">
        Trang <strong className="text-slate-700">{page}</strong> / {totalPages}
      </p>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>
        {Array.from({
          length: totalPages,
        }).map((_, index) => {
          const number = index + 1;
          return (
            <button
              key={number}
              type="button"
              onClick={() => onChange(number)}
              className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm ${
                number === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {number}
            </button>
          );
        })}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
/* =========================================================
   LOCATION LIST PAGE
   ========================================================= */
export function LocationList() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    variant: "success",
  });
  const pageSize = 8;
  /* =========================
       LOAD PLACES
       ========================= */
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/places`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách địa điểm");
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setLocations(list.map(normalizePlace));
    } catch (error) {
      console.error("Lỗi lấy địa điểm:", error);
      setToast({
        open: true,
        message:
          "Không thể kết nối đến API địa điểm. Hãy kiểm tra backend Node.js.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  /* =========================
       LOAD CATEGORIES
       ========================= */
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error("Không thể tải danh mục");
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setCategories(list);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };
  useEffect(() => {
    fetchPlaces();
    fetchCategories();
  }, []);
  /* =========================
       AUTO CLOSE TOAST
       ========================= */
  useEffect(() => {
    if (!toast.open) {
      return;
    }
    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.open]);
  /* =========================
       DISTRICTS
       ========================= */
  const districts = useMemo(() => {
    return [
      ...new Set(locations.map((item) => item.district).filter(Boolean)),
    ].sort();
  }, [locations]);

  /* =========================
       FILTER
       ========================= */
  const filteredLocations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return locations.filter((location) => {
      const locationStatus = String(location.status ?? "");
      const matchSearch =
        !keyword ||
        location.name.toLowerCase().includes(keyword) ||
        location.address.toLowerCase().includes(keyword);
      const matchCategory =
        !category || String(location.categoryId) === String(category);
      const matchDistrict = !district || location.district === district;
      const matchStatus =
        !status ||
        locationStatus === status ||
        String(location.trangthai ?? "") === String(status);
      return matchSearch && matchCategory && matchDistrict && matchStatus;
    });
  }, [locations, search, category, district, status]);
  /* =========================
       PAGINATION
       ========================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLocations.length / pageSize),
  );
  const currentLocations = filteredLocations.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  useEffect(() => {
    setPage(1);
  }, [search, category, district, status]);
  /* =========================
       STATS
       ========================= */
  const total = locations.length;
  const active = locations.filter((item) => item.status === "active").length;
  const hidden = locations.filter((item) => item.status === "hidden").length;
  const categoryCount = new Set(
    locations.map((item) => item.categoryId).filter(Boolean),
  ).size;
  /* =========================
       DELETE
       ========================= */
  const handleDelete = async () => {
    if (!selectedLocation) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await fetch(`${API_URL}/places/${selectedLocation.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || "Không thể xóa địa điểm");
      }

      setLocations((prev) =>
        prev.filter((item) => String(item.id) !== String(selectedLocation.id)),
      );

      setDeleteOpen(false);

      setSelectedLocation(null);

      setToast({
        open: true,
        message: "Đã xóa địa điểm thành công.",
        variant: "success",
      });
    } catch (error) {
      console.error("Lỗi xóa địa điểm:", error);

      setToast({
        open: true,
        message: error.message || "Không thể xóa địa điểm.",
        variant: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =========================
       RESET
       ========================= */

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setDistrict("");
    setStatus("");
    setPage(1);
  };

  return (
    <>
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        location={selectedLocation}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteOpen(false);
            setSelectedLocation(null);
          }
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <div className="space-y-5">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Quản lý địa điểm
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý các địa điểm du lịch trong hệ thống.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchPlaces}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/dia-diem/them")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Thêm địa điểm
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={MapPin}
            label="Tổng địa điểm"
            value={total}
            description="Tất cả địa điểm"
          />

          <StatCard
            icon={CheckCircle}
            label="Đang hoạt động"
            value={active}
            description="Có thể hiển thị"
          />

          <StatCard
            icon={EyeOff}
            label="Đang tạm ẩn"
            value={hidden}
            description="Không hiển thị"
          />

          <StatCard
            icon={Tag}
            label="Danh mục"
            value={categoryCount}
            description="Danh mục đang sử dụng"
          />
        </div>

        {/* FILTER */}

        <FilterBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          district={district}
          setDistrict={setDistrict}
          status={status}
          setStatus={setStatus}
          categories={categories}
          districts={districts}
          onReset={handleReset}
        />

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h2 className="font-semibold text-slate-800">
                Danh sách địa điểm
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Hiển thị {filteredLocations.length} địa điểm
              </p>
            </div>

            {loading && (
              <Loader2 size={19} className="animate-spin text-blue-600" />
            )}
          </div>

          <LocationsTable
            locations={currentLocations}
            loading={loading}
            onView={(id) => navigate(`/admin/dia-diem/${id}`)}
            onEdit={(id) => navigate(`/admin/dia-diem/${id}/chinh-sua`)}
            onDelete={(location) => {
              setSelectedLocation(location);
              setDeleteOpen(true);
            }}
          />

          {!loading && filteredLocations.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   FORM INPUT
   ========================================================= */

function FormField({ label, required = false, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   LOCATION FORM
   ========================================================= */

function LocationForm({
  initialData,
  mode,
  categories,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    tendiadiem: "",
    mota: "",
    diachi: "",
    quanhuyen: "",
    tinhthanh: "Cần Thơ",
    giadukien: "",
    danhmucId: "",
    trangthai: 1,
    thoigianhoatdong: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});

  // File ảnh thật
  const [images, setImages] = useState([]);

  // Ảnh dùng để preview
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!initialData) {
      setImages([]);
      setImagePreviews([]);
      return;
    }

    setForm({
      tendiadiem: initialData.name || initialData.tendiadiem || "",

      mota: initialData.description || initialData.mota || "",

      diachi: initialData.address || initialData.diachi || "",

      quanhuyen: initialData.district || initialData.quanhuyen || "",

      tinhthanh: initialData.province || initialData.tinhthanh || "Cần Thơ",

      giadukien: initialData.price ?? initialData.giadukien ?? "",

      danhmucId: initialData.categoryId ?? initialData.danhmucId ?? "",

      trangthai:
        initialData.status === "hidden" || Number(initialData.trangthai) === 0
          ? 0
          : 1,

      latitude: initialData.lat ?? initialData.latitude ?? "",

      longitude: initialData.lng ?? initialData.longitude ?? "",

      thoigianhoatdong: initialData.thoigianhoatdong || "",
    });

    const existingImages = Array.isArray(initialData.images)
      ? initialData.images
          .map((img) => img?.Url || img?.url || "")
          .filter(Boolean)
      : typeof initialData.image === "string" && initialData.image.trim()
        ? [initialData.image.trim()]
        : [];

    setImages([]);
    setImagePreviews(
      existingImages.map((url) => ({
        file: null,
        preview: url.startsWith("http") ? url : `http://localhost:5000${url}`,
      })),
    );
  }, [initialData]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // ================================
  // CHỌN ẢNH
  // ================================

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    setImages((prev) => [...prev, ...validFiles]);

    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);

    event.target.value = "";
  };

  // ================================
  // XÓA ẢNH ĐANG CHỌN
  // ================================

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    setImagePreviews((prev) => {
      const removed = prev[index];

      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.tendiadiem.trim()) {
      nextErrors.tendiadiem = "Vui lòng nhập tên địa điểm.";
    }

    if (!form.diachi.trim()) {
      nextErrors.diachi = "Vui lòng nhập địa chỉ.";
    }

    if (!form.quanhuyen.trim()) {
      nextErrors.quanhuyen = "Vui lòng nhập quận/huyện.";
    }

    if (!form.tinhthanh.trim()) {
      nextErrors.tinhthanh = "Vui lòng nhập tỉnh/thành phố.";
    }

    if (form.giadukien !== "" && Number(form.giadukien) < 0) {
      nextErrors.giadukien = "Giá không được nhỏ hơn 0.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      tendiadiem: form.tendiadiem.trim(),

      mota: form.mota.trim(),

      diachi: form.diachi.trim(),

      quanhuyen: form.quanhuyen.trim(),

      tinhthanh: form.tinhthanh.trim(),

      giadukien: form.giadukien === "" ? 0 : Number(form.giadukien),

      danhmucId: form.danhmucId === "" ? null : Number(form.danhmucId),

      trangthai: Number(form.trangthai),

      thoigianhoatdong: form.thoigianhoatdong.trim(),

      latitude: form.latitude === "" ? 0 : Number(form.latitude),

      longitude: form.longitude === "" ? 0 : Number(form.longitude),
    };

    onSubmit(payload, images);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* THÔNG TIN CƠ BẢN */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            <div>
              <h2 className="font-semibold text-slate-800">Thông tin cơ bản</h2>
              <p className="text-xs text-slate-500">
                Thông tin chính của địa điểm.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <FormField label="Tên địa điểm" required className="md:col-span-2">
            <input
              value={form.tendiadiem}
              onChange={handleChange("tendiadiem")}
              placeholder="Nhập tên địa điểm"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.tendiadiem
                  ? "border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.tendiadiem && (
              <p className="mt-1 text-xs text-red-500">{errors.tendiadiem}</p>
            )}
          </FormField>
          <FormField label="Mô tả" className="md:col-span-2">
            <textarea
              value={form.mota}
              onChange={handleChange("mota")}
              rows={4}
              placeholder="Nhập mô tả địa điểm..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FormField>
          <FormField label="Giá dự kiến">
            <div className="relative">
              <DollarSign
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                min="0"
                value={form.giadukien}
                onChange={handleChange("giadukien")}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {errors.giadukien && (
              <p className="mt-1 text-xs text-red-500">{errors.giadukien}</p>
            )}
          </FormField>
          <FormField label="Danh mục">
            <select
              value={form.danhmucId}
              onChange={handleChange("danhmucId")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.tendanhmuc}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Trạng thái">
            <select
              value={form.trangthai}
              onChange={handleChange("trangthai")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Tạm ẩn</option>
            </select>
          </FormField>
        </div>
      </section>

      {/* HÌNH ẢNH ĐỊA ĐIỂM */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-slate-800">
                Hình ảnh địa điểm
              </h2>

              <p className="text-xs text-slate-500">
                Thêm hình ảnh để giới thiệu địa điểm.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
            <ImageIcon size={40} className="mb-3 text-slate-400" />

            <p className="text-sm font-medium text-slate-700">Chọn hình ảnh</p>

            <p className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, WEBP</p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {/* PREVIEW ẢNH */}
          {imagePreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {imagePreviews.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <img
                    src={image.preview}
                    alt={`Ảnh địa điểm ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover:opacity-100"
                  >
                    Xóa
                  </button>

                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center text-xs text-white">
                      Ảnh chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ĐỊA CHỈ */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-slate-800">Địa chỉ & vị trí</h2>

              <p className="text-xs text-slate-500">
                Thông tin vị trí của địa điểm.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Vị trí địa điểm</h3>
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationSelect={(location) => {
                setForm((prev) => ({
                  ...prev,
                  latitude: location.latitude ?? prev.latitude,
                  longitude: location.longitude ?? prev.longitude,
                  diachi: location.address ?? prev.diachi,
                  quanhuyen: location.district ?? prev.quanhuyen,
                  tinhthanh: location.province ?? prev.tinhthanh,
                }));
                setErrors((prev) => ({
                  ...prev,
                  diachi: "",
                  quanhuyen: "",
                  tinhthanh: "",
                }));
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <FormField label="Địa chỉ" required className="md:col-span-2">
            <input
              value={form.diachi}
              onChange={handleChange("diachi")}
              placeholder="Ví dụ: Đường Hai Bà Trưng"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.diachi
                  ? "border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.diachi && (
              <p className="mt-1 text-xs text-red-500">{errors.diachi}</p>
            )}
          </FormField>

          <FormField label="Quận / Huyện" required>
            <input
              value={form.quanhuyen}
              onChange={handleChange("quanhuyen")}
              placeholder="Ví dụ: Ninh Kiều"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.quanhuyen
                  ? "border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.quanhuyen && (
              <p className="mt-1 text-xs text-red-500">{errors.quanhuyen}</p>
            )}
          </FormField>

          <FormField label="Tỉnh / Thành phố" required>
            <input
              value={form.tinhthanh}
              onChange={handleChange("tinhthanh")}
              placeholder="Ví dụ: Cần Thơ"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.tinhthanh
                  ? "border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.tinhthanh && (
              <p className="mt-1 text-xs text-red-500">{errors.tinhthanh}</p>
            )}
          </FormField>

          <FormField label="Vĩ độ (Latitude)">
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={handleChange("latitude")}
              placeholder="Ví dụ: 10.034185"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FormField>

          <FormField label="Kinh độ (Longitude)">
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={handleChange("longitude")}
              placeholder="Ví dụ: 105.722382"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FormField>
          <FormField label="Thời gian hoạt động" className="md:col-span-2">
            <input
              type="text"
              value={form.thoigianhoatdong}
              onChange={(e) =>
                setForm({
                  ...form,
                  thoigianhoatdong: e.target.value,
                })
              }
              placeholder="Ví dụ: 07:00 - 22:00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FormField>
        </div>
      </section>

      {/* ACTION */}

      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={16} />
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {mode === "edit" ? "Lưu thay đổi" : "Lưu địa điểm"}
        </button>
      </div>
    </form>
  );
}
/* =========================================================
   FORM PAGE
   ========================================================= */

export function LocationFormPage({ mode = "add" }) {
  const navigate = useNavigate();

  const { id } = useParams();

  const [location, setLocation] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(mode === "edit");

  const [submitLoading, setSubmitLoading] = useState(false);

  const [error, setError] = useState("");

  /* =========================
       LOAD CATEGORIES
       ========================= */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setCategories(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    loadCategories();
  }, []);

  /* =========================
       LOAD DETAIL
       ========================= */

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    const loadLocation = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/places/${id}`);

        if (!response.ok) {
          throw new Error("Không tìm thấy địa điểm.");
        }

        const data = await response.json();

        const item = data.data || data;

        setLocation(normalizePlace(item));
      } catch (error) {
        console.error("Lỗi lấy chi tiết địa điểm:", error);

        setError(error.message || "Không thể tải địa điểm.");
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [mode, id]);

  /* =========================
       SUBMIT
       ========================= */

  const handleSubmit = async (payload, images) => {
    try {
      setSubmitLoading(true);

      const isEdit = mode === "edit";

      const url = isEdit ? `${API_URL}/places/${id}` : `${API_URL}/places`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Không thể ${isEdit ? "cập nhật" : "thêm"} địa điểm.`,
        );
      }

      const placeId = data.data?.id || data.id;

      if (!placeId) {
        throw new Error("Không lấy được ID địa điểm từ server.");
      }

      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((file) => {
          formData.append("images", file);
        });

        const imageResponse = await fetch(
          `${API_URL}/places/${placeId}/images`,
          {
            method: "POST",
            body: formData,
          },
        );

        const imageData = await imageResponse.json().catch(() => ({}));
        if (!imageResponse.ok) {
          throw new Error(
            imageData.message ||
              "Lưu địa điểm thành công nhưng upload hình ảnh thất bại.",
          );
        }
      }

      navigate("/admin/dia-diem");
    } catch (error) {
      console.error("Lỗi lưu địa điểm:", error);
      const errorMessage = error.message || "Không thể lưu địa điểm.";
      setError(errorMessage);
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={34} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (mode === "edit" && !location && error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/dia-diem")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <AlertTriangle size={32} className="mx-auto text-red-500" />

          <p className="mt-3 font-medium text-slate-700">
            Không thể tải địa điểm
          </p>

          <p className="mt-1 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/dia-diem")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </button>

        <h1 className="text-2xl font-bold text-slate-800">
          {mode === "edit" ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {mode === "edit"
            ? "Cập nhật thông tin địa điểm trong hệ thống."
            : "Nhập thông tin để thêm địa điểm mới."}
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-semibold">Không thể thực hiện</p>

            <p className="mt-0.5 text-sm">{error}</p>
          </div>
        </div>
      )}

      <LocationForm
        mode={mode}
        initialData={location}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/dia-diem")}
        loading={submitLoading}
      />
    </div>
  );
}

/* =========================================================
   DETAIL PAGE
   ========================================================= */

export function LocationDetailPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageList =
    location?.images && Array.isArray(location.images)
      ? location.images.map((img) => img?.Url || img?.url || "").filter(Boolean)
      : location?.image
        ? [location.image]
        : [];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1,
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === imageList.length - 1 ? 0 : prev + 1,
    );
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `http://localhost:5000${url}`;
  };

  /* =========================
       LOAD DETAIL
       ========================= */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/places/${id}`);

        if (!response.ok) {
          throw new Error("Không tìm thấy địa điểm.");
        }

        const data = await response.json();

        setLocation(normalizePlace(data.data || data));
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* =========================
       DELETE
       ========================= */

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      const response = await fetch(`${API_URL}/places/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Không thể xóa địa điểm.");
      }

      navigate("/admin/dia-diem");
    } catch (error) {
      console.error("Lỗi xóa:", error);

      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={34} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/dia-diem")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <MapPin size={27} />
          </div>

          <p className="mt-4 font-medium text-slate-700">
            Không tìm thấy địa điểm
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {error || "Địa điểm không tồn tại hoặc đã bị xóa."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmDeleteModal
        open={deleteOpen}
        location={location}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <div className="space-y-5">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/dia-diem")}
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>

            <h1 className="text-2xl font-bold text-slate-800">
              Chi tiết địa điểm
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/dia-diem/${location.id}/chinh-sua`)
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Chỉnh sửa
            </button>

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 size={16} />
              Xóa
            </button>
          </div>
        </div>

        {/* MAIN */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          {/* LEFT */}

          <div className="space-y-5 xl:col-span-3">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {imageList.length > 0 ? (
                <>
                  {/* Ảnh đang chọn */}
                  <img
                    src={getImageUrl(imageList[currentImageIndex])}
                    alt={location.tendiadiem || "Hình ảnh địa điểm"}
                    className="h-56 w-full rounded-xl object-cover shadow-sm transition-all duration-300"
                  />
                  {/* Nút điều hướng (Chỉ hiển thị khi có từ 2 ảnh trở lên) */}
                  {imageList.length > 1 && (
                    <>
                      {/* Nút Lùi (<) */}
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white shadow backdrop-blur-sm transition hover:bg-black/80"
                        title="Ảnh trước"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      {/* Nút Tới (>) */}
                      <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white shadow backdrop-blur-sm transition hover:bg-black/80"
                        title="Ảnh sau"
                      >
                        <ChevronRight size={20} />
                      </button>
                      {/* Hiển thị vị trí ảnh (Ví dụ: 1/3) */}
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        {currentImageIndex + 1} / {imageList.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Giao diện khi chưa có ảnh */
                <div className="flex h-56 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <span className="text-sm">Chưa có hình ảnh</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge categoryName={location.categoryName} />

                  <StatusBadge status={location.status} />
                </div>

                <h2 className="mt-3 text-xl font-bold text-slate-800">
                  {location.name}
                </h2>

                <div className="mt-2">
                  <RatingStars value={location.rating} />
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {location.description || "Chưa có mô tả cho địa điểm này."}
                </p>
              </div>
            </div>

            {/* LOCATION */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                <MapPin size={18} className="text-blue-600" />
                Thông tin vị trí
              </h3>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Địa chỉ</p>

                  <p className="mt-1 text-sm text-slate-700">
                    {location.address || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">Quận / Huyện</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {location.district || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Tỉnh / Thành phố</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {location.province || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">Latitude</p>

                    <p className="mt-1 text-sm text-slate-700">
                      {location.lat}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Longitude</p>

                    <p className="mt-1 text-sm text-slate-700">
                      {location.lng}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-5 xl:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800">
                Thông tin tổng quan
              </h3>

              <div className="mt-4 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Giá dự kiến</span>

                  <span className="font-semibold text-slate-800">
                    {formatVND(location.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Danh mục</span>

                  <CategoryBadge categoryName={location.categoryName} />
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Trạng thái</span>

                  <StatusBadge status={location.status} />
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Mã địa điểm</span>

                  <span className="font-mono text-sm text-slate-700">
                    #{location.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function QuanLyDiaDiem() {
  return <LocationList />;
}
