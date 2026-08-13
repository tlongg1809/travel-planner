import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  X,
  AlertTriangle,
  Inbox,
  CheckCircle2,
} from "lucide-react";

const mockCategories = [
  { id: 1, tendanhmuc: "Địa điểm tham quan" },
  { id: 2, tendanhmuc: "Ẩm thực & Nhà hàng" },
  { id: 3, tendanhmuc: "Khách sạn & Nghỉ dưỡng" },
  { id: 4, tendanhmuc: "Vui chơi giải trí" },
  { id: 5, tendanhmuc: "Mua sắm & Chợ đêm" },
  { id: 6, tendanhmuc: "Tour & Trải nghiệm" },
];

/* Modal dùng chung cho Thêm mới & Chỉnh sửa */
function CategoryFormModal({ open, initialValue, onClose, onSubmit }) {
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialValue);

  useEffect(() => {
    if (open) {
      setTenDanhMuc(initialValue?.tendanhmuc || "");
      setError("");
    }
  }, [open, initialValue]);

  // Đóng bằng phím Escape + khóa cuộn nền
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = tenDanhMuc.trim();
    if (!value) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }
    onSubmit(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Tag size={18} />
            </div>
            <h3 className="font-semibold text-slate-800 truncate">
              {isEdit ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 py-5 space-y-2">
            <label
              htmlFor="tenDanhMuc"
              className="block text-sm font-medium text-slate-700"
            >
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="tenDanhMuc"
              type="text"
              value={tenDanhMuc}
              onChange={(e) => {
                setTenDanhMuc(e.target.value);
                if (error) setError("");
              }}
              
              autoFocus
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }
              `}
            />
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 pt-1">
                <AlertTriangle size={14} />
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              {isEdit ? "Lưu thay đổi" : "Lưu danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Modal xác nhận xóa */
function ConfirmDeleteModal({ open, category, onClose, onConfirm }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-full shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-base">
                Xóa danh mục
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Bạn có chắc chắn muốn xóa danh mục{" "}
                <span className="font-semibold text-slate-800">
                  "{category.tendanhmuc}"
                </span>{" "}
                không? Hành động này không thể hoàn tác.
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
            onClick={() => onConfirm(category)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

/* Toast nhỏ góc phải */
function Toast({ open, message }) {
  if (!open) return null;
  return (
    <div className="fixed top-4 right-4 z-[60] animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
        <CheckCircle2 size={18} />
        {message}
      </div>
    </div>
  );
}

export default function QuanLyDanhMuc() {
  const [categories, setCategories] = useState(mockCategories);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [toast, setToast] = useState({ open: false, message: "" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.tendanhmuc.toLowerCase().includes(q));
  }, [categories, search]);

  // Ẩn toast sau 2.5s
  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast({ open: false, message: "" }), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message) => setToast({ open: true, message });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormOpen(true);
  };

  const handleSubmit = (value) => {
    if (editing) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editing.id ? { ...c, tendanhmuc: value } : c,
        ),
      );
      showToast("Cập nhật danh mục thành công");
    } else {
      const nextId =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1;
      setCategories((prev) => [
        ...prev,
        { id: nextId, tendanhmuc: value },
      ]);
      showToast("Thêm danh mục thành công");
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDeleteClick = (cat) => {
    setDeleting(cat);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = (cat) => {
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setDeleteOpen(false);
    setDeleting(null);
    showToast("Đã xóa danh mục");
  };

  return (
    <div className="space-y-5">
      {/* Header & Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý danh mục
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Thêm danh mục mới
          </button>
        </div>
      </div>

      {/* Bảng danh mục */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left">
                <th className="px-4 py-3 font-semibold w-20 text-center">STT</th>
                <th className="px-4 py-3 font-semibold w-24 text-center">ID</th>
                <th className="px-4 py-3 font-semibold">Tên danh mục</th>
                <th className="px-4 py-3 font-semibold w-44 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                        <Inbox size={28} />
                      </div>
                      <p className="mt-3 font-medium text-slate-700">
                        {search
                          ? "Không tìm thấy danh mục phù hợp"
                          : "Chưa có danh mục nào"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 max-w-sm">
                        {search
                          ? "Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả danh mục."
                          : "Bắt đầu bằng cách thêm danh mục du lịch đầu tiên của bạn."}
                      </p>
                      {!search && (
                        <button
                          type="button"
                          onClick={openAdd}
                          className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Plus size={16} />
                          Thêm danh mục
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                      #{cat.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium text-slate-800">
                          {cat.tendanhmuc}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal
        open={formOpen}
        initialValue={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        category={deleting}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <Toast open={toast.open} message={toast.message} />

      {/* Keyframes dùng cho hiệu ứng mở modal */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
