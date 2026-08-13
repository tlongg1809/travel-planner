import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./SidebarAdmin";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const dummyAdmin = {
    tenDangNhap: "Thanh Long",
    tenVaiTro: "Quản trị viên",
  };

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        currentUser={dummyAdmin}
        onLogout={handleLogout}
        isAdmin={true}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">

        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0">
              <Menu size={16} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 text-sm leading-tight truncate">
                TRAVEL PLANNER
              </h1>
              <span className="text-[11px] text-slate-400 truncate block">
                Trang Quản Trị Viên
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
