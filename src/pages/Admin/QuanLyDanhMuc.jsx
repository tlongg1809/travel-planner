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
  Loader2,
  Eye,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/categories";

/* =========================================================
   MODAL THÊM / CHỈNH SỬA DANH MỤC
========================================================= */

function CategoryFormModal({
  open,
  initialValue,
  onClose,
  onSubmit,
  loading,
}) {
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialValue);

  useEffect(() => {
    if (open) {
      setTenDanhMuc(initialValue?.tendanhmuc || "");
      setError("");
    }
  }, [open, initialValue]);

  /* Đóng bằng ESC + khóa scroll nền */
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose, loading]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = tenDanhMuc.trim();

    if (!value) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }

    if (value.length > 100) {
      setError("Tên danh mục không được vượt quá 100 ký tự");
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
        onClick={() => {
          if (!loading) onClose();
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">

            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Tag size={18} />
            </div>

            <h3 className="font-semibold text-slate-800 truncate">
              {isEdit
                ? "Chỉnh sửa danh mục"
                : "Thêm danh mục mới"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
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

                if (error) {
                  setError("");
                }
              }}
              autoFocus
              disabled={loading}
              placeholder="Ví dụ: Quán cà phê"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white outline-none transition-colors
                ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }
                disabled:bg-slate-100 disabled:cursor-not-allowed
              `}
            />

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 pt-1">
                <AlertTriangle size={14} />
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )}

              {isEdit
                ? "Lưu thay đổi"
                : "Lưu danh mục"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL XÁC NHẬN XÓA
========================================================= */

function ConfirmDeleteModal({
  open,
  category,
  onClose,
  onConfirm,
  loading,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose, loading]);

  if (!open || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => {
          if (!loading) onClose();
        }}
        aria-hidden="true"
      />

      {/* Panel */}
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
                </span>

                {" "}không?

              </p>

              <p className="text-xs text-red-500 mt-2">
                Lưu ý: Nếu danh mục đang được sử dụng bởi
                địa điểm, thao tác xóa có thể bị từ chối bởi
                cơ sở dữ liệu.
              </p>

            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={() => onConfirm(category)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {loading && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Xóa
          </button>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TOAST
========================================================= */

function Toast({
  open,
  message,
  type = "success",
}) {
  if (!open) return null;

  const isError = type === "error";

  return (
    <div className="fixed top-4 right-4 z-[60] animate-[fadeIn_0.2s_ease-out]">

      <div
        className={`flex items-center gap-2 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium ${
          isError
            ? "bg-red-600"
            : "bg-emerald-600"
        }`}
      >

        {isError ? (
          <AlertTriangle size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}

        {message}

      </div>

    </div>
  );
}

/* =========================================================
   COMPONENT CHÍNH
========================================================= */

export default function QuanLyDanhMuc() {

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleting, setDeleting] = useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingData, setLoadingData] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });


  /* =====================================================
     HIỂN THỊ TOAST
  ===================================================== */

  const showToast = (
    message,
    type = "success"
  ) => {

    setToast({
      open: true,
      message,
      type,
    });

  };


  /* =====================================================
     TỰ ĐỘNG ẨN TOAST
  ===================================================== */

  useEffect(() => {

    if (!toast.open) return;

    const timer = setTimeout(() => {

      setToast({
        open: false,
        message: "",
        type: "success",
      });

    }, 3000);

    return () => clearTimeout(timer);

  }, [toast]);


  /* =====================================================
     LẤY DANH SÁCH DANH MỤC TỪ MYSQL
  ===================================================== */

  const fetchCategories = async () => {

    try {

      setLoadingData(true);

      const response = await fetch(API_URL);

      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }

      const data = await response.json();

      setCategories(data);

    } catch (error) {

      console.error(
        "Lỗi lấy danh mục:",
        error
      );

      showToast(
        "Không thể tải danh sách danh mục",
        "error"
      );

    } finally {

      setLoadingData(false);

    }

  };


  /* =====================================================
     LOAD DATA KHI MỞ TRANG
  ===================================================== */

  useEffect(() => {

    fetchCategories();

  }, []);


  /* =====================================================
     SEARCH
  ===================================================== */

  const filtered = useMemo(() => {

    const q = search
      .trim()
      .toLowerCase();

    if (!q) {
      return categories;
    }

    return categories.filter((category) =>
      String(category.tendanhmuc || "")
        .toLowerCase()
        .includes(q)
    );

  }, [categories, search]);


  /* =====================================================
     MỞ FORM THÊM
  ===================================================== */

  const openAdd = () => {

    setEditing(null);

    setFormOpen(true);

  };


  /* =====================================================
     MỞ FORM SỬA
  ===================================================== */

  const openEdit = (category) => {

    setEditing(category);

    setFormOpen(true);

  };


  /* =====================================================
     ĐÓNG FORM
  ===================================================== */

  const closeForm = () => {

    if (loading) return;

    setFormOpen(false);

    setEditing(null);

  };


  /* =====================================================
     THÊM / CẬP NHẬT DANH MỤC
  ===================================================== */

  const handleSubmit = async (value) => {

    try {

      setLoading(true);

      /* ============================
         CHỈNH SỬA
      ============================ */

      if (editing) {

        const response = await fetch(
          `${API_URL}/${editing.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              tendanhmuc: value,
            }),
          }
        );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
              "Không thể cập nhật danh mục"
          );

        }


        showToast(
          "Cập nhật danh mục thành công"
        );

      }

      /* ============================
         THÊM MỚI
      ============================ */

      else {

        const response = await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              tendanhmuc: value,
            }),
          }
        );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
              "Không thể thêm danh mục"
          );

        }


        showToast(
          "Thêm danh mục thành công"
        );

      }


      /* Reload lại data từ MySQL */

      await fetchCategories();


      setFormOpen(false);

      setEditing(null);

    } catch (error) {

      console.error(
        "Lỗi lưu danh mục:",
        error
      );

      showToast(
        error.message ||
          "Có lỗi xảy ra khi lưu danh mục",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     MỞ MODAL XÓA
  ===================================================== */

  const handleDeleteClick = (category) => {

    setDeleting(category);

    setDeleteOpen(true);

  };


  /* =====================================================
     ĐÓNG MODAL XÓA
  ===================================================== */

  const closeDelete = () => {

    if (loading) return;

    setDeleteOpen(false);

    setDeleting(null);

  };


  /* =====================================================
     XÓA DANH MỤC
  ===================================================== */

  const handleConfirmDelete = async (
    category
  ) => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/${category.id}`,
        {
          method: "DELETE",
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Không thể xóa danh mục"
        );

      }


      showToast(
        "Đã xóa danh mục thành công"
      );


      await fetchCategories();


      setDeleteOpen(false);

      setDeleting(null);

    } catch (error) {

      console.error(
        "Lỗi xóa danh mục:",
        error
      );

      showToast(
        error.message ||
          "Không thể xóa danh mục",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="space-y-5">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý danh mục
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Quản lý các danh mục địa điểm trong hệ thống
          </p>

        </div>


        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">

          {/* SEARCH */}

          <div className="relative w-full sm:w-72">

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
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />

          </div>


          {/* ADD */}

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
          >

            <Plus size={16} />

            Thêm danh mục

          </button>

        </div>

      </div>


      {/* ================================================
          THỐNG KÊ NHỎ
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Tag size={20} />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Tổng danh mục
              </p>

              <p className="text-xl font-bold text-slate-800">
                {categories.length}
              </p>

            </div>

          </div>

        </div>


        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Eye size={20} />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Kết quả hiển thị
              </p>

              <p className="text-xl font-bold text-slate-800">
                {filtered.length}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ================================================
          TABLE
      ================================================= */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="bg-slate-50 text-slate-600 text-left">

                <th className="px-4 py-3 font-semibold w-20 text-center">
                  STT
                </th>

                <th className="px-4 py-3 font-semibold w-24 text-center">
                  ID
                </th>

                <th className="px-4 py-3 font-semibold">
                  Tên danh mục
                </th>

                <th className="px-4 py-3 font-semibold w-44 text-center">
                  Hành động
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {/* LOADING */}

              {loadingData ? (

                <tr>

                  <td
                    colSpan={4}
                    className="px-4 py-14"
                  >

                    <div className="flex flex-col items-center justify-center text-center">

                      <Loader2
                        size={30}
                        className="text-blue-600 animate-spin"
                      />

                      <p className="mt-3 font-medium text-slate-700">
                        Đang tải danh mục...
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Đang lấy dữ liệu từ cơ sở dữ liệu
                      </p>

                    </div>

                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                /* EMPTY */

                <tr>

                  <td
                    colSpan={4}
                    className="px-4 py-14"
                  >

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
                          ? "Thử từ khóa khác hoặc xóa ô tìm kiếm để xem tất cả danh mục."
                          : "Bắt đầu bằng cách thêm danh mục đầu tiên."}

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

                /* DATA */

                filtered.map(
                  (category, index) => (

                    <tr
                      key={category.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >

                      {/* STT */}

                      <td className="px-4 py-3 text-center text-slate-500">
                        {index + 1}
                      </td>


                      {/* ID */}

                      <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                        #{category.id}
                      </td>


                      {/* NAME */}

                      <td className="px-4 py-3">

                        <div className="flex items-center gap-2.5">

                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">

                            <Tag size={16} />

                          </div>

                          <span className="font-medium text-slate-800">

                            {category.tendanhmuc}

                          </span>

                        </div>

                      </td>


                      {/* ACTION */}

                      <td className="px-4 py-3">

                        <div className="flex items-center justify-center gap-2">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(category)
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >

                            <Edit3 size={14} />

                            Sửa

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteClick(
                                category
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa"
                          >

                            <Trash2 size={14} />

                            Xóa

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================================
          FORM THÊM / SỬA
      ================================================= */}

      <CategoryFormModal
        open={formOpen}
        initialValue={editing}
        onClose={closeForm}
        onSubmit={handleSubmit}
        loading={loading}
      />


      {/* ================================================
          MODAL XÓA
      ================================================= */}

      <ConfirmDeleteModal
        open={deleteOpen}
        category={deleting}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />


      {/* ================================================
          TOAST
      ================================================= */}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
      />


      {/* ================================================
          ANIMATION
      ================================================= */}

      <style>{`

        @keyframes fadeIn {

          from {
            opacity: 0;
            transform: scale(0.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }

        }

      `}</style>

    </div>

  );
}