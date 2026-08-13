import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Tag,
  MapPinned,
  MessagesSquare,
  User,
  LogOut,
  Compass,
  X,
} from "lucide-react";

const MenuItems = [
  { id: "MN01", label: "Tổng quan", icon: LayoutDashboard, url: "/admin" },
  { id: "MN02", label: "Quản lý danh mục", icon: Tag, url: "/admin/danh-muc" },
  { id: "MN03", label: "Quản lý địa điểm", icon: MapPinned, url: "/admin/dia-diem" },
  { id: "MN04", label: "Quản lý bình luận", icon: MessagesSquare, url: "/admin/binh-luan" },
  { id: "MN05", label: "Quản lý người dùng", icon: User, url: "/admin/nguoi-dung" },
];

export default function Sidebar({
  currentUser,
  onLogout,
  isAdmin = true,
  isOpen = false,
  onClose,
}) {
  const visibleMenuItems = MenuItems.filter((item) => !item.adminOnly || isAdmin);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />


      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col h-screen bg-white border-r border-slate-200 shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto
        `}
      >
        {/* Header của sidebar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm shrink-0">
              <Compass size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 text-sm leading-tight truncate">
                TRAVEL PLANNER
              </h2>
              <span className="font-medium text-slate-400 text-xs truncate block">
                Trang Quản Trị Viên
              </span>
            </div>
          </div>

          {/* Nút đóng - chỉ hiện trên mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Danh sách menu */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {visibleMenuItems.map((item) => (
            <NavLink
              to={item.url}
              end={item.url === "/admin"}
              key={item.id}
              onClick={() => {
                // Trên mobile: chọn menu xong thì đóng drawer
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  onClose?.();
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={isActive ? "text-blue-600" : "text-slate-500"}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Thông tin Admin & Đăng xuất */}
        <div className="flex items-center gap-3 border-t border-slate-200 p-3 bg-slate-50">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.tenDangNhap?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-800 text-sm truncate">
              {currentUser?.tenDangNhap || "Admin"}
            </h4>
            <p className="text-slate-500 text-xs truncate">
              {currentUser?.tenVaiTro || "Quản trị viên"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
