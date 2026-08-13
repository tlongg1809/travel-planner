import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  MapPinned,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MapPin,
  ImagePlus,
  X,
  Upload,
  Star,
  Tag,
  DollarSign,
  Crosshair,
  Sun,
  Waves,
  Mountain,
  UtensilsCrossed,
  Coffee,
  Camera,
  ShoppingBag,
  CheckCircle2,
  EyeOff,
  Inbox,
  SearchX,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Info,
  TrendingUp,
  Save,
} from "lucide-react";

/* =========================================================
   MOCK DATA
   ========================================================= */

const MOCK_CATEGORIES = [
  { id: 1, ten: "Ăn uống" },
  { id: 2, ten: "Cà phê" },
  { id: 3, ten: "Check-in" },
  { id: 4, ten: "Vui chơi" },
  { id: 5, ten: "Công viên" },
  { id: 6, ten: "Rạp phim" },
  { id: 7, ten: "Khu du lịch" },
  { id: 8, ten: "Mua sắm" },
];

const MOCK_DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Bình Thạnh",
  "Gò Vấp",
  "Thủ Đức",
  "Tân Bình",
];

const ICON_MAP = {
  Sun,
  Waves,
  Mountain,
  UtensilsCrossed,
  Coffee,
  Camera,
  ShoppingBag,
  MapPin,
  Image: ImageIcon,
};

const MOCK_LOCATIONS = [
  {
    id: 1,
    name: "Landmark 81",
    categoryId: 3,
    categoryName: "Check-in",
    address: "720A Điện Biên Phủ",
    district: "Bình Thạnh",
    province: "TP. Hồ Chí Minh",
    price: 500000,
    rating: 4.8,
    status: "active",
    lat: 10.7951,
    lng: 106.7218,
    images: [
      {
        id: "i1",
        gradient: ["#fbbf24", "#f97316"],
        icon: "Sun",
      },
      {
        id: "i2",
        gradient: ["#60a5fa", "#2563eb"],
        icon: "Waves",
      },
      {
        id: "i3",
        gradient: ["#a78bfa", "#6d28d9"],
        icon: "Camera",
      },
    ],
    primaryImageId: "i1",
    description:
      "Tòa tháp cao nhất Việt Nam với chiều cao 81 tầng, nổi bật với đài quan sát ở tầng trên cùng và khung cảnh thành phố về đêm.",
    views: 12500,
    createdAt: "2024-08-15",
  },
  {
    id: 2,
    name: "Công viên Vinhomes Central Park",
    categoryId: 5,
    categoryName: "Công viên",
    address: "208 Nguyễn Hữu Cảnh",
    district: "Bình Thạnh",
    province: "TP. Hồ Chí Minh",
    price: 0,
    rating: 4.7,
    status: "active",
    lat: 10.7955,
    lng: 106.7201,
    images: [
      {
        id: "i1",
        gradient: ["#10b981", "#065f46"],
        icon: "Mountain",
      },
      {
        id: "i2",
        gradient: ["#34d399", "#059669"],
        icon: "Sun",
      },
    ],
    primaryImageId: "i1",
    description:
      "Công viên lớn với diện tích xanh rộng lớn, là nơi lý tưởng để đi bộ, tập thể dục và nghỉ ngơi cuối tuần.",
    views: 8900,
    createdAt: "2024-08-20",
  },
  {
    id: 3,
    name: "Phố đi bộ Nguyễn Huệ",
    categoryId: 3,
    categoryName: "Check-in",
    address: "Đường Nguyễn Huệ",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    price: 0,
    rating: 4.6,
    status: "active",
    lat: 10.7721,
    lng: 106.7009,
    images: [
      {
        id: "i1",
        gradient: ["#f472b6", "#be185d"],
        icon: "Camera",
      },
      {
        id: "i2",
        gradient: ["#fb923c", "#c2410c"],
        icon: "Sun",
      },
      {
        id: "i3",
        gradient: ["#facc15", "#a16207"],
        icon: "Image",
      },
      {
        id: "i4",
        gradient: ["#22d3ee", "#0e7490"],
        icon: "Waves",
      },
    ],
    primaryImageId: "i1",
    description:
      "Tuyệt phẩm kiến trúc giữa lòng Sài Gòn, nơi tổ chức các sự kiện văn hóa, nghệ thuật và các dịp lễ lớn của thành phố.",
    views: 15200,
    createdAt: "2024-09-01",
  },
  {
    id: 4,
    name: "Cafe Apartment",
    categoryId: 2,
    categoryName: "Cà phê",
    address: "42 Nguyễn Huệ",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    price: 80000,
    rating: 4.5,
    status: "active",
    lat: 10.7718,
    lng: 106.7003,
    images: [
      {
        id: "i1",
        gradient: ["#92400e", "#451a03"],
        icon: "Coffee",
      },
      {
        id: "i2",
        gradient: ["#fbbf24", "#b45309"],
        icon: "Sun",
      },
    ],
    primaryImageId: "i1",
    description:
      "Tòa nhà căn hộ có kiểu thiết kế độc đáo với hàng chục quán cà phê, ăn uống phong cách vintage - điểm check-in hot của giới trẻ.",
    views: 9800,
    createdAt: "2024-09-10",
  },
  {
    id: 5,
    name: "Chợ đêm Bùi Viện",
    categoryId: 1,
    categoryName: "Ăn uống",
    address: "Phạm Ngũ Lão, Bùi Viện",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    price: 100000,
    rating: 4.3,
    status: "active",
    lat: 10.7656,
    lng: 106.6926,
    images: [
      {
        id: "i1",
        gradient: ["#ef4444", "#7f1d1d"],
        icon: "UtensilsCrossed",
      },
      {
        id: "i2",
        gradient: ["#facc15", "#854d0e"],
        icon: "Sun",
      },
    ],
    primaryImageId: "i1",
    description:
      "Khu phố Tây nổi tiếng với hàng trăm quán ăn, giải trí và các hoạt động về đêm sôi động.",
    views: 7200,
    createdAt: "2024-09-15",
  },
  {
    id: 6,
    name: "Đại Nam Văn Hóa Du Lịch",
    categoryId: 7,
    categoryName: "Khu du lịch",
    address: "Khu du lịch Đại Nam",
    district: "Thủ Đức",
    province: "Bình Dương",
    price: 250000,
    rating: 4.2,
    status: "active",
    lat: 11.0132,
    lng: 106.6511,
    images: [
      {
        id: "i1",
        gradient: ["#7c3aed", "#4c1d95"],
        icon: "Mountain",
      },
      {
        id: "i2",
        gradient: ["#06b6d4", "#0e7490"],
        icon: "Waves",
      },
      {
        id: "i3",
        gradient: ["#10b981", "#064e3b"],
        icon: "Sun",
      },
    ],
    primaryImageId: "i1",
    description:
      "Khu du lịch lớn với công viên nước, vườn thú, các công trình kiến trúc tâm linh và nhiều hoạt động giải trí hấp dẫn.",
    views: 6500,
    createdAt: "2024-09-20",
  },
  {
    id: 7,
    name: "Trung tâm thương mại Vincom",
    categoryId: 8,
    categoryName: "Mua sắm",
    address: "191 Bà Triệu",
    district: "Quận 3",
    province: "TP. Hồ Chí Minh",
    price: 0,
    rating: 4.4,
    status: "active",
    lat: 10.7752,
    lng: 106.6901,
    images: [
      {
        id: "i1",
        gradient: ["#ec4899", "#9d174d"],
        icon: "ShoppingBag",
      },
      {
        id: "i2",
        gradient: ["#f59e0b", "#92400e"],
        icon: "Sun",
      },
    ],
    primaryImageId: "i1",
    description:
      "Trung tâm thương mại lớn với hàng trăm cửa hàng thời trang, ăn uống và giải trí, phù hợp cho cả gia đình.",
    views: 5400,
    createdAt: "2024-09-25",
  },
  {
    id: 8,
    name: "Rạp CGV Vincom",
    categoryId: 6,
    categoryName: "Rạp phim",
    address: "191 Bà Triệu",
    district: "Quận 3",
    province: "TP. Hồ Chí Minh",
    price: 120000,
    rating: 4.6,
    status: "hidden",
    lat: 10.7752,
    lng: 106.6901,
    images: [
      {
        id: "i1",
        gradient: ["#1e293b", "#020617"],
        icon: "Camera",
      },
      {
        id: "i2",
        gradient: ["#475569", "#1e293b"],
        icon: "Image",
      },
    ],
    primaryImageId: "i1",
    description:
      "Hệ thống rạp phim hiện đại với nhiều phòng chiếu, âm thanh Dolby và các bộ phim mới nhất hàng tuần.",
    views: 3100,
    createdAt: "2024-09-28",
  },
  {
    id: 9,
    name: "Công viên Tao Đàn Hoàng Văn Thụ",
    categoryId: 5,
    categoryName: "Công viên",
    address: "Đường Hoàng Văn Thụ",
    district: "Tân Bình",
    province: "TP. Hồ Chí Minh",
    price: 0,
    rating: 4.5,
    status: "active",
    lat: 10.7955,
    lng: 106.6601,
    images: [
      {
        id: "i1",
        gradient: ["#10b981", "#047857"],
        icon: "Mountain",
      },
      {
        id: "i2",
        gradient: ["#fbbf24", "#a16207"],
        icon: "Sun",
      },
    ],
    primaryImageId: "i1",
    description:
      "Công viên xanh mát giữa lòng phố, nơi nhiều người dân đến tập thể dục, đi bộ vào buổi sáng và chiều.",
    views: 4200,
    createdAt: "2024-10-01",
  },
  {
    id: 10,
    name: "Khu du lịch Suối Tiên",
    categoryId: 7,
    categoryName: "Khu du lịch",
    address: "Xa Phú Lâm",
    district: "Thủ Đức",
    province: "TP. Hồ Chí Minh",
    price: 180000,
    rating: 4.1,
    status: "hidden",
    lat: 10.9421,
    lng: 106.5812,
    images: [
      {
        id: "i1",
        gradient: ["#06b6d4", "#155e75"],
        icon: "Waves",
      },
      {
        id: "i2",
        gradient: ["#10b981", "#064e3b"],
        icon: "Mountain",
      },
    ],
    primaryImageId: "i1",
    description:
      "Khu du lịch sinh thái với hồ nước, vườn cây xanh và nhiều hoạt động team-building hấp dẫn cuối tuần.",
    views: 2800,
    createdAt: "2024-10-05",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const formatVND = (num) => {
  if (num === 0 || num === undefined || num === null) {
    return "Miễn phí";
  }

  return new Intl.NumberFormat("vi-VN").format(num) + " đ";
};

const formatDate = (date) => {
  if (!date) return "—";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
};

const getImageById = (location, id) =>
  (location?.images || []).find((img) => img.id === id) ||
  location?.images?.[0] ||
  null;

/* =========================================================
   TOAST
   ========================================================= */

function Toast({
  open,
  message,
  variant = "success",
  onClose = () => {},
}) {
  if (!open) return null;

  const color =
    variant === "success"
      ? "bg-emerald-600"
      : variant === "error"
      ? "bg-red-600"
      : "bg-slate-700";

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div
        className={`flex items-center gap-2 ${color} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium`}
      >
        {variant === "error" ? (
          <AlertTriangle size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}

        <span>{message}</span>

        <button
          type="button"
          onClick={onClose}
          className="ml-2 opacity-80 hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CONFIRM DELETE MODAL
   ========================================================= */

function ConfirmDeleteModal({
  open,
  location,
  onClose,
  onConfirm,
}) {
  if (!open || !location) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-full shrink-0">
              <AlertTriangle size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-base">
                Xóa địa điểm?
              </h3>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Bạn có chắc muốn xóa{" "}
                <span className="font-semibold text-slate-800">
                  "{location.name}"
                </span>
                ?
                <br />
                Thao tác này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "blue",
  trend,
}) {
  const accentMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 font-medium">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {value}
          </p>

          {trend && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              {trend}
            </p>
          )}
        </div>

        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            accentMap[accent] || accentMap.blue
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOCATION THUMBNAIL
   ========================================================= */

function LocationThumbnail({
  location,
  size = "sm",
}) {
  const dim =
    size === "sm"
      ? "w-12 h-12"
      : size === "md"
      ? "w-16 h-16"
      : "w-full h-48";

  const iconSize =
    size === "sm"
      ? 18
      : size === "md"
      ? 24
      : 56;

  const radius =
    size === "lg" ? "rounded-xl" : "rounded-lg";

  const img = getImageById(
    location,
    location?.primaryImageId
  );

  const [c1, c2] = img?.gradient || [
    "#cbd5e1",
    "#94a3b8",
  ];

  const Icon =
    ICON_MAP[img?.icon] || ImageIcon;

  return (
    <div
      className={`${dim} ${radius} shrink-0 flex items-center justify-center text-white shadow-sm`}
      style={{
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      <Icon size={iconSize} />
    </div>
  );
}

/* =========================================================
   CATEGORY BADGE
   ========================================================= */

function CategoryBadge({
  categoryName,
}) {
  const map = {
    "Ăn uống":
      "bg-orange-50 text-orange-700 border-orange-200",
    "Cà phê":
      "bg-amber-50 text-amber-700 border-amber-200",
    "Check-in":
      "bg-pink-50 text-pink-700 border-pink-200",
    "Vui chơi":
      "bg-blue-50 text-blue-700 border-blue-200",
    "Công viên":
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rạp phim":
      "bg-slate-100 text-slate-700 border-slate-200",
    "Khu du lịch":
      "bg-violet-50 text-violet-700 border-violet-200",
    "Mua sắm":
      "bg-rose-50 text-rose-700 border-rose-200",
  };

  const cls =
    map[categoryName] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${cls}`}
    >
      {categoryName || "Chưa phân loại"}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Hoạt động
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Tạm ẩn
    </span>
  );
}

/* =========================================================
   RATING
   ========================================================= */

function RatingStars({ value = 0 }) {
  const full = Math.floor(value);

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) {
            return (
              <Star
                key={i}
                size={14}
                fill="currentColor"
              />
            );
          }

          return (
            <Star
              key={i}
              size={14}
              className="text-slate-300"
            />
          );
        })}
      </div>

      <span className="text-sm font-semibold text-slate-700">
        {Number(value || 0).toFixed(1)}
      </span>
    </div>
  );
}

/* =========================================================
   PAGINATION
   ========================================================= */

function Pagination({
  page,
  totalPages,
  onChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-600">
      <span>
        Trang{" "}
        <span className="font-semibold text-slate-800">
          {page}
        </span>{" "}
        / {totalPages}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          title="Trang trước"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }).map(
          (_, i) => {
            const n = i + 1;

            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`min-w-7 h-7 px-2 rounded-md text-xs font-medium border transition-colors ${
                  n === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            );
          }
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          title="Trang sau"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER BAR
   ========================================================= */

function FilterBar({
  search,
  setSearch,
  filters,
  setFilters,
  onApply,
  onReset,
  categories,
  districts,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Tìm kiếm địa điểm theo tên hoặc địa chỉ..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>

        <select
          value={filters.categoryId}
          onChange={(e) =>
            setFilters({
              ...filters,
              categoryId: e.target.value,
            })
          }
          className="px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
        >
          <option value="">
            Tất cả danh mục
          </option>

          {categories.map((c) => (
            <option
              key={c.id}
              value={c.id}
            >
              {c.ten}
            </option>
          ))}
        </select>

        <select
          value={filters.district}
          onChange={(e) =>
            setFilters({
              ...filters,
              district: e.target.value,
            })
          }
          className="px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
        >
          <option value="">
            Tất cả khu vực
          </option>

          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value,
            })
          }
          className="px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
        >
          <option value="">
            Tất cả trạng thái
          </option>
          <option value="active">
            Hoạt động
          </option>
          <option value="hidden">
            Tạm ẩn
          </option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} />
          Đặt lại
        </button>

        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Filter size={14} />
          Lọc
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOCATIONS TABLE
   ========================================================= */

function LocationsTable({
  locations,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) {
  if (locations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
            <Inbox size={28} />
          </div>

          <p className="mt-3 font-medium text-slate-700">
            Không tìm thấy địa điểm
          </p>

          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Không có địa điểm nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-left">
              <th className="px-4 py-3 font-semibold w-14 text-center">
                STT
              </th>

              <th className="px-4 py-3 font-semibold min-w-[260px]">
                Địa điểm
              </th>

              <th className="px-4 py-3 font-semibold">
                Danh mục
              </th>

              <th className="px-4 py-3 font-semibold">
                Khu vực
              </th>

              <th className="px-4 py-3 font-semibold">
                Giá
              </th>

              <th className="px-4 py-3 font-semibold">
                Đánh giá
              </th>

              <th className="px-4 py-3 font-semibold">
                Trạng thái
              </th>

              <th className="px-4 py-3 font-semibold w-44 text-center">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {locations.map((loc, idx) => (
              <tr
                key={loc.id}
                className="hover:bg-blue-50/40 transition-colors"
              >
                <td className="px-4 py-3 text-center text-slate-500">
                  {idx + 1}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <LocationThumbnail
                      location={loc}
                      size="sm"
                    />

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {loc.name}
                      </div>

                      <div className="text-xs text-slate-500 truncate">
                        {loc.address}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <CategoryBadge
                    categoryName={loc.categoryName}
                  />
                </td>

                <td className="px-4 py-3 text-slate-600">
                  <div className="font-medium text-slate-700 text-sm">
                    {loc.district}
                  </div>

                  <div className="text-xs text-slate-500">
                    {loc.province}
                  </div>
                </td>

                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                  {formatVND(loc.price)}
                </td>

                <td className="px-4 py-3">
                  <RatingStars
                    value={loc.rating}
                  />
                </td>

                <td className="px-4 py-3">
                  <StatusBadge
                    status={loc.status}
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView(loc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(loc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(loc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </div>
  );
}

/* =========================================================
   MAP PLACEHOLDER
   ========================================================= */

function MapPlaceholder({
  lat,
  lng,
  label,
}) {
  return (
    <div className="relative w-full h-72 sm:h-80 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 320"
        preserveAspectRatio="none"
      >
        <path
          d="M 0,80 Q 100,60 200,90 T 400,110"
          stroke="#cbd5e1"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M 0,200 Q 120,180 220,210 T 400,180"
          stroke="#cbd5e1"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M 80,0 Q 100,80 130,160 T 180,320"
          stroke="#cbd5e1"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M 280,0 Q 300,100 270,180 T 290,320"
          stroke="#cbd5e1"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M 0,260 L 400,260"
          stroke="#e2e8f0"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-pulse" />

          <div className="relative p-2.5 bg-blue-600 text-white rounded-full shadow-lg ring-4 ring-white">
            <MapPin
              size={20}
              fill="currentColor"
            />
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-3 right-16 max-w-xs">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <Search
            size={14}
            className="text-slate-400 shrink-0"
          />

          <span className="text-xs text-slate-500 truncate">
            {label || "Tìm kiếm khu vực..."}
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3">
        <div className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-600 font-mono shadow-sm">
          {lat?.toFixed(4)}, {lng?.toFixed(4)}
        </div>
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
        <button
          type="button"
          className="w-8 h-8 bg-white border border-slate-200 rounded-md shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          title="Phóng to"
        >
          <Plus size={14} />
        </button>

        <button
          type="button"
          className="w-8 h-8 bg-white border border-slate-200 rounded-md shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          title="Thu nhỏ"
        >
          <span className="text-lg leading-none">
            −
          </span>
        </button>
      </div>

      <div className="absolute right-3 bottom-3">
        <button
          type="button"
          className="w-9 h-9 bg-white border border-slate-200 rounded-md shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          title="Vị trí hiện tại"
        >
          <Crosshair size={16} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   IMAGE GALLERY
   ========================================================= */

function ImageGallery({
  images = [],
  primaryId,
  onSetPrimary = () => {},
  onRemove = () => {},
}) {
  const primary =
    primaryId || images[0]?.id;

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-white border border-slate-200 rounded-full text-slate-500">
            <Upload size={20} />
          </div>

          <p className="font-medium text-slate-700 text-sm">
            Thêm hình ảnh
          </p>

          <p className="text-xs text-slate-500">
            Kéo thả hoặc click để chọn hình ảnh
          </p>

          <p className="text-[11px] text-slate-400">
            PNG, JPG, WEBP tối đa 5MB
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 gap-3">
            <p className="text-sm font-semibold text-slate-700">
              Ảnh đã chọn ({images.length})
            </p>

            <p className="text-xs text-slate-500 hidden sm:block">
              Chọn ảnh để đặt làm ảnh đại diện
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => {
              const [c1, c2] =
                img.gradient || [
                  "#cbd5e1",
                  "#94a3b8",
                ];

              const Icon =
                ICON_MAP[img.icon] ||
                ImageIcon;

              const isPrimary =
                img.id === primary;

              return (
                <div
                  key={img.id}
                  className={`relative rounded-lg overflow-hidden border-2 group ${
                    isPrimary
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <div
                    className="aspect-square flex items-center justify-center text-white"
                    style={{
                      background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    }}
                  >
                    <Icon size={40} />
                  </div>

                  {isPrimary && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-600 text-white rounded">
                      <Star
                        size={10}
                        fill="currentColor"
                      />
                      Ảnh chính
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-1">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() =>
                          onSetPrimary(img.id)
                        }
                        className="px-2 py-1 text-[10px] font-semibold bg-white text-slate-700 rounded hover:bg-slate-100 transition-colors"
                      >
                        Đặt làm ảnh chính
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(img.id)
                      }
                      className="ml-auto p-1 bg-white/90 text-red-600 rounded hover:bg-white transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STATUS TOGGLE
   ========================================================= */

function StatusToggle({
  status,
  onChange = () => {},
}) {
  const isActive =
    status === "active";

  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3"
    >
      {isActive ? (
        <ToggleRight
          size={36}
          className="text-blue-600 shrink-0"
        />
      ) : (
        <ToggleLeft
          size={36}
          className="text-slate-400 shrink-0"
        />
      )}

      <div className="text-left">
        <p className="text-sm font-semibold text-slate-800">
          {isActive
            ? "Hiển thị địa điểm"
            : "Đang tạm ẩn"}
        </p>

        <p className="text-xs text-slate-500">
          {isActive
            ? "Địa điểm đang hiển thị trên hệ thống"
            : "Địa điểm sẽ không hiển thị với người dùng"}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   LOCATION FORM
   ========================================================= */

function LocationForm({
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {},
  categories = MOCK_CATEGORIES,
  districts = MOCK_DISTRICTS,
}) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] =
    useState(() => ({
      name: initialData?.name || "",
      categoryId:
        initialData?.categoryId || "",
      price: initialData?.price ?? 0,
      description:
        initialData?.description || "",
      address:
        initialData?.address || "",
      district:
        initialData?.district || "",
      province:
        initialData?.province ||
        "TP. Hồ Chí Minh",
      lat:
        initialData?.lat ??
        10.762622,
      lng:
        initialData?.lng ??
        106.660172,
      images:
        initialData?.images || [],
      primaryImageId:
        initialData?.primaryImageId ||
        null,
      status:
        initialData?.status || "active",
    }));

  const [errors, setErrors] =
    useState({});

  const update = (patch) =>
    setFormData((prev) => ({
      ...prev,
      ...patch,
    }));

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Vui lòng nhập tên địa điểm.";
    }

    if (!formData.categoryId) {
      newErrors.categoryId =
        "Vui lòng chọn danh mục.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Vui lòng nhập địa chỉ.";
    }

    if (!formData.district) {
      newErrors.district =
        "Vui lòng chọn quận/huyện.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const category =
      categories.find(
        (c) =>
          String(c.id) ===
          String(formData.categoryId)
      );

    onSubmit({
      ...formData,
      categoryName:
        category?.ten || "Chưa phân loại",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* THÔNG TIN CƠ BẢN */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Thông tin cơ bản
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Nhập thông tin chính của địa điểm
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Tên địa điểm{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                update({
                  name: e.target.value,
                })
              }
              placeholder="Nhập tên địa điểm"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors ${
                errors.name
                  ? "border-red-400"
                  : "border-slate-300"
              }`}
            />

            {errors.name && (
              <p className="text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Danh mục{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={formData.categoryId}
              onChange={(e) =>
                update({
                  categoryId:
                    e.target.value
                      ? Number(
                          e.target.value
                        )
                      : "",
                })
              }
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors ${
                errors.categoryId
                  ? "border-red-400"
                  : "border-slate-300"
              }`}
            >
              <option value="">
                Chọn danh mục
              </option>

              {categories.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.ten}
                </option>
              ))}
            </select>

            {errors.categoryId && (
              <p className="text-xs text-red-500">
                {errors.categoryId}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Giá dự kiến
            </label>

            <div className="relative">
              <DollarSign
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  update({
                    price:
                      Number(
                        e.target.value
                      ) || 0,
                  })
                }
                placeholder="0"
                className="w-full pl-9 pr-14 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                VND
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Nhập 0 nếu miễn phí
            </p>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Mô tả
            </label>

            <textarea
              value={formData.description}
              onChange={(e) =>
                update({
                  description:
                    e.target.value,
                })
              }
              rows={4}
              placeholder="Nhập mô tả về địa điểm..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* ĐỊA CHỈ */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Địa chỉ & vị trí
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Thông tin địa chỉ và tọa độ trên bản đồ
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Địa chỉ{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  update({
                    address:
                      e.target.value,
                  })
                }
                placeholder="Số nhà, tên đường"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors ${
                  errors.address
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              />

              {errors.address && (
                <p className="text-xs text-red-500">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Quận/Huyện{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                value={formData.district}
                onChange={(e) =>
                  update({
                    district:
                      e.target.value,
                  })
                }
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors ${
                  errors.district
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              >
                <option value="">
                  Chọn quận/huyện
                </option>

                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {errors.district && (
                <p className="text-xs text-red-500">
                  {errors.district}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Tỉnh/Thành phố
              </label>

              <input
                type="text"
                value={formData.province}
                onChange={(e) =>
                  update({
                    province:
                      e.target.value,
                  })
                }
                placeholder="TP. Hồ Chí Minh"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Latitude
              </label>

              <input
                type="number"
                step="0.000001"
                value={formData.lat}
                onChange={(e) =>
                  update({
                    lat:
                      Number(
                        e.target.value
                      ) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Longitude
              </label>

              <input
                type="number"
                step="0.000001"
                value={formData.lng}
                onChange={(e) =>
                  update({
                    lng:
                      Number(
                        e.target.value
                      ) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors font-mono"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info size={12} />
            Tọa độ có thể được xác định từ vị trí được chọn trên bản đồ.
          </p>

          <MapPlaceholder
            lat={formData.lat}
            lng={formData.lng}
            label={
              formData.address ||
              "Chọn vị trí trên bản đồ"
            }
          />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">
              Vị trí đã chọn
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                  Latitude
                </p>

                <p className="text-sm font-mono text-slate-800 mt-1">
                  {formData.lat?.toFixed(6) ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                  Longitude
                </p>

                <p className="text-sm font-mono text-slate-800 mt-1">
                  {formData.lng?.toFixed(6) ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                  Địa chỉ
                </p>

                <p className="text-sm text-slate-800 mt-1 truncate">
                  {formData.address ||
                    "—"}

                  {formData.district
                    ? `, ${formData.district}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HÌNH ẢNH */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Hình ảnh địa điểm
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Tải lên nhiều hình ảnh để người dùng có thể xem trước
          </p>
        </div>

        <div className="p-5">
          <ImageGallery
            images={formData.images}
            primaryId={
              formData.primaryImageId
            }
            onSetPrimary={(id) =>
              update({
                primaryImageId: id,
              })
            }
            onRemove={(id) => {
              const newImages =
                formData.images.filter(
                  (img) =>
                    img.id !== id
                );

              let newPrimary =
                formData.primaryImageId;

              if (
                newPrimary === id
              ) {
                newPrimary =
                  newImages[0]?.id ||
                  null;
              }

              update({
                images: newImages,
                primaryImageId:
                  newPrimary,
              });
            }}
          />
        </div>
      </div>

      {/* TRẠNG THÁI */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Trạng thái
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Điều chỉnh trạng thái hiển thị của địa điểm
          </p>
        </div>

        <div className="p-5 space-y-3">
          <StatusToggle
            status={formData.status}
            onChange={() =>
              update({
                status:
                  formData.status ===
                  "active"
                    ? "hidden"
                    : "active",
              })
            }
          />

          <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="location-status"
                checked={
                  formData.status ===
                  "active"
                }
                onChange={() =>
                  update({
                    status: "active",
                  })
                }
                className="w-4 h-4 text-blue-600"
              />

              <span className="text-sm text-slate-700">
                Hoạt động
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="location-status"
                checked={
                  formData.status ===
                  "hidden"
                }
                onChange={() =>
                  update({
                    status: "hidden",
                  })
                }
                className="w-4 h-4 text-blue-600"
              />

              <span className="text-sm text-slate-700">
                Tạm ẩn
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <X size={15} />
          Hủy
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Save size={15} />

          {isEdit
            ? "Lưu thay đổi"
            : "Lưu địa điểm"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   LOCATION DETAIL
   ========================================================= */

function LocationDetail({
  location,
  onEdit = () => {},
  onDelete = () => {},
  onBack = () => {},
}) {
  const primary = getImageById(
    location,
    location?.primaryImageId
  );

  const [c1, c2] =
    primary?.gradient || [
      "#cbd5e1",
      "#94a3b8",
    ];

  const PrimaryIcon =
    ICON_MAP[primary?.icon] ||
    ImageIcon;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit3 size={14} />
            Chỉnh sửa
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Xóa
          </button>
        </div>
      </div>

      {/* MAIN INFO */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* GALLERY */}
          <div className="lg:col-span-2 bg-slate-50 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200">
            <div
              className="aspect-[4/3] rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
              }}
            >
              <PrimaryIcon size={88} />
            </div>

            {location?.images &&
              location.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {location.images.map(
                    (img) => {
                      const [g1, g2] =
                        img.gradient || [
                          "#cbd5e1",
                          "#94a3b8",
                        ];

                      const Icon =
                        ICON_MAP[
                          img.icon
                        ] ||
                        ImageIcon;

                      const isPrimary =
                        img.id ===
                        location.primaryImageId;

                      return (
                        <div
                          key={img.id}
                          className={`aspect-square rounded-lg flex items-center justify-center text-white ${
                            isPrimary
                              ? "ring-2 ring-blue-500"
                              : "opacity-80"
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${g1}, ${g2})`,
                          }}
                        >
                          <Icon size={24} />
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </div>

          {/* INFO */}
          <div className="lg:col-span-3 p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {location?.name ||
                      "Chưa có tên"}
                  </h1>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <RatingStars
                      value={
                        location?.rating ||
                        0
                      }
                    />

                    <CategoryBadge
                      categoryName={
                        location?.categoryName
                      }
                    />

                    <StatusBadge
                      status={
                        location?.status
                      }
                    />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    Giá dự kiến
                  </p>

                  <p className="text-xl font-bold text-blue-600 mt-0.5">
                    {formatVND(
                      location?.price
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* ĐỊA CHỈ */}
            <div className="flex items-start gap-2 text-sm text-slate-600 pt-3 border-t border-slate-100">
              <MapPin
                size={16}
                className="text-slate-400 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium text-slate-800">
                  {location?.address ||
                    "Chưa cập nhật địa chỉ"}
                </p>

                <p className="text-slate-500 text-xs mt-0.5">
                  {location?.district}

                  {location?.province
                    ? `, ${location.province}`
                    : ""}
                </p>
              </div>
            </div>

            {/* MÔ TẢ */}
            {location?.description && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-800 mb-2">
                  Mô tả
                </p>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {location.description}
                </p>
              </div>
            )}

            {/* THỐNG KÊ */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  Lượt xem
                </p>

                <p className="text-lg font-bold text-slate-800 mt-1">
                  {new Intl.NumberFormat(
                    "vi-VN"
                  ).format(
                    location?.views || 0
                  )}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  Ngày tạo
                </p>

                <p className="text-lg font-bold text-slate-800 mt-1">
                  {formatDate(
                    location?.createdAt
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VỊ TRÍ */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Vị trí địa điểm
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Thông tin vị trí và tọa độ trên bản đồ
          </p>
        </div>

        <div className="p-5">
          <MapPlaceholder
            lat={location?.lat}
            lng={location?.lng}
            label={location?.address}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">
                Latitude
              </p>

              <p className="font-mono text-sm text-slate-800 mt-1">
                {location?.lat?.toFixed(6) ||
                  "—"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">
                Longitude
              </p>

              <p className="font-mono text-sm text-slate-800 mt-1">
                {location?.lng?.toFixed(6) ||
                  "—"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">
                Khu vực
              </p>

              <p className="text-sm text-slate-800 mt-1">
                {location?.district ||
                  "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HÌNH ẢNH */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            Hình ảnh địa điểm
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {location?.images?.length || 0} hình ảnh
          </p>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(location?.images || []).map(
              (img) => {
                const [g1, g2] =
                  img.gradient || [
                    "#cbd5e1",
                    "#94a3b8",
                  ];

                const Icon =
                  ICON_MAP[img.icon] ||
                  ImageIcon;

                const isPrimary =
                  img.id ===
                  location.primaryImageId;

                return (
                  <div
                    key={img.id}
                    className={`relative aspect-square rounded-xl overflow-hidden ${
                      isPrimary
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${g1}, ${g2})`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Icon size={52} />
                    </div>

                    {isPrimary && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-blue-600 text-white rounded-md">
                        <Star
                          size={10}
                          fill="currentColor"
                        />
                        Ảnh chính
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LIST PAGE
   ========================================================= */

export function LocationList() {
  const navigate = useNavigate();

  const [locations, setLocations] =
    useState(MOCK_LOCATIONS);

  const [search, setSearch] =
    useState("");

  const [filters, setFilters] =
    useState({
      categoryId: "",
      district: "",
      status: "",
    });

  const [appliedFilters, setAppliedFilters] =
    useState({
      search: "",
      categoryId: "",
      district: "",
      status: "",
    });

  const [page, setPage] =
    useState(1);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(null);

  const [toast, setToast] =
    useState({
      open: false,
      message: "",
      variant: "success",
    });

  const PAGE_SIZE = 5;

  const filteredLocations = useMemo(() => {
    const keyword =
      appliedFilters.search
        .trim()
        .toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !keyword ||
        location.name
          .toLowerCase()
          .includes(keyword) ||
        location.address
          .toLowerCase()
          .includes(keyword);

      const matchesCategory =
        !appliedFilters.categoryId ||
        String(location.categoryId) ===
          String(
            appliedFilters.categoryId
          );

      const matchesDistrict =
        !appliedFilters.district ||
        location.district ===
          appliedFilters.district;

      const matchesStatus =
        !appliedFilters.status ||
        location.status ===
          appliedFilters.status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDistrict &&
        matchesStatus
      );
    });
  }, [locations, appliedFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLocations.length /
        PAGE_SIZE
    )
  );

  const paginatedLocations =
    filteredLocations.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  const activeCount =
    locations.filter(
      (item) => item.status === "active"
    ).length;

  const hiddenCount =
    locations.filter(
      (item) => item.status === "hidden"
    ).length;

  const handleApply = () => {
    setAppliedFilters({
      search,
      ...filters,
    });

    setPage(1);
  };

  const handleReset = () => {
    setSearch("");

    setFilters({
      categoryId: "",
      district: "",
      status: "",
    });

    setAppliedFilters({
      search: "",
      categoryId: "",
      district: "",
      status: "",
    });

    setPage(1);
  };

  const handleDelete = () => {
    if (!deleting) return;

    setLocations((prev) =>
      prev.filter(
        (item) =>
          item.id !== deleting.id
      )
    );

    setDeleteOpen(false);

    setToast({
      open: true,
      message: `Đã xóa địa điểm "${deleting.name}".`,
      variant: "success",
    });

    setDeleting(null);

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3000);
  };

  return (
    <div className="space-y-5">
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

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý địa điểm
          </h1>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/dia-diem/them"
            )
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={16} />
          Thêm địa điểm
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={MapPinned}
          label="Tổng địa điểm"
          value={locations.length}
          accent="blue"
        />

        <StatCard
          icon={CheckCircle2}
          label="Đang hoạt động"
          value={activeCount}
          accent="emerald"
        />

        <StatCard
          icon={EyeOff}
          label="Đang tạm ẩn"
          value={hiddenCount}
          accent="amber"
        />

        <StatCard
          icon={Tag}
          label="Danh mục"
          value={MOCK_CATEGORIES.length}
          accent="violet"
        />
      </div>

      {/* FILTER */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApply}
        onReset={handleReset}
        categories={MOCK_CATEGORIES}
        districts={MOCK_DISTRICTS}
      />

      {/* RESULT INFO */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Hiển thị{" "}
          <span className="font-semibold text-slate-800">
            {filteredLocations.length}
          </span>{" "}
          địa điểm
        </p>
      </div>

      {/* TABLE */}
      <LocationsTable
        locations={paginatedLocations}
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          if (
            nextPage >= 1 &&
            nextPage <= totalPages
          ) {
            setPage(nextPage);
          }
        }}
        onView={(location) =>
          navigate(
            `/admin/dia-diem/${location.id}`
          )
        }
        onEdit={(location) =>
          navigate(
            `/admin/dia-diem/${location.id}/chinh-sua`
          )
        }
        onDelete={(location) => {
          setDeleting(location);
          setDeleteOpen(true);
        }}
      />

      {/* DELETE */}
      <ConfirmDeleteModal
        open={deleteOpen}
        location={deleting}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* =========================================================
   ADD / EDIT PAGE
   ========================================================= */

export function LocationFormPage({
  mode = "add",
}) {
  const navigate = useNavigate();
  const { id } = useParams();

  const found = id
    ? MOCK_LOCATIONS.find(
        (location) =>
          String(location.id) ===
          String(id)
      )
    : null;

  const initialData =
    mode === "edit"
      ? found || null
      : null;

  const [toast, setToast] =
    useState({
      open: false,
      message: "",
      variant: "success",
    });

  const handleSubmit = (data) => {
    // Mock only.
    // Khi nối backend, thay phần này bằng POST/PUT API.

    setToast({
      open: true,
      message:
        mode === "edit"
          ? "Đã cập nhật địa điểm thành công."
          : "Đã thêm địa điểm thành công.",
      variant: "success",
    });

    setTimeout(() => {
      navigate("/admin/dia-diem");
    }, 700);
  };

  if (
    mode === "edit" &&
    !initialData
  ) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/dia-diem")
          }
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-16 text-center">
          <div className="inline-flex p-3 bg-slate-100 text-slate-400 rounded-full">
            <SearchX size={28} />
          </div>

          <p className="mt-3 font-medium text-slate-700">
            Không tìm thấy địa điểm
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Địa điểm bạn muốn chỉnh sửa không tồn tại hoặc đã bị xóa.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dia-diem")
            }
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

      {/* HEADER */}
      <div>
        <button
          type="button"
          onClick={() =>
            navigate("/admin/dia-diem")
          }
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mt-3">
          {mode === "edit"
            ? "Chỉnh sửa địa điểm"
            : "Thêm địa điểm"}
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          {mode === "edit"
            ? "Cập nhật thông tin địa điểm trong hệ thống."
            : "Tạo mới một địa điểm để hiển thị trên hệ thống."}
        </p>
      </div>

      <LocationForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate("/admin/dia-diem")
        }
        categories={MOCK_CATEGORIES}
        districts={MOCK_DISTRICTS}
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

  const location =
    MOCK_LOCATIONS.find(
      (item) =>
        String(item.id) ===
        String(id)
    );

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  if (!location) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/dia-diem")
          }
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-16 text-center">
          <div className="inline-flex p-3 bg-slate-100 text-slate-400 rounded-full">
            <SearchX size={28} />
          </div>

          <p className="mt-3 font-medium text-slate-700">
            Không tìm thấy địa điểm
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Địa điểm bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dia-diem")
            }
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LocationDetail
        location={location}
        onEdit={() =>
          navigate(
            `/admin/dia-diem/${location.id}/chinh-sua`
          )
        }
        onDelete={() =>
          setDeleteOpen(true)
        }
        onBack={() =>
          navigate("/admin/dia-diem")
        }
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        location={location}
        onClose={() =>
          setDeleteOpen(false)
        }
        onConfirm={() => {
          setDeleteOpen(false);
          navigate("/admin/dia-diem");
        }}
      />
    </>
  );
}

export default function QuanLyDiaDiem() {
  return <LocationList />;
}