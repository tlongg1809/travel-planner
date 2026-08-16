import { NavLink } from "react-router-dom";
import {
  House,
  Compass,
  Heart,
  CalendarDays,
  Map,
  Users,
  Info,
} from "lucide-react";
const logoUrl = "http://localhost:5000/uploads/logo.png";
const fallbackLogoUrl = "http://localhost:5000/uploads/logo.jpg";
const menuItems = [
  {
    icon: House,
    title: "Trang chủ",
    path: "/",
  },
  {
    icon: Compass,
    title: "Khám phá",
    path: "/explore",
  },
  {
    icon: Heart,
    title: "Yêu thích",
    path: "/favorites",
  },
  {
    icon: CalendarDays,
    title: "Tạo lịch trình",
    path: "/create-schedule",
  },
  {
    icon: Map,
    title: "Bản đồ",
    path: "/map-explore",
  },
  {
    icon: Users,
    title: "Lịch trình nhóm",
    path: "/group-schedule",
  },
  {
    icon: Info,
    title: "Giới thiệu",
    path: "/about",
  },
];

export default function Sidebar({ collapsed }) {
  return (
    <aside
      className={`
        bg-white
        border-r
        shadow-sm
        flex
        flex-col
        transition-all
        duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b">
        {collapsed ? (
          <img
            src={logoUrl}
            alt="logo"
            className="w-24 h-24 object-contain"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackLogoUrl) {
                e.currentTarget.src = fallbackLogoUrl;
              }
            }}
          />
        ) : (
          <div className="flex items-center gap-0">
            <img
              src={logoUrl}
              alt="logo"
              className="w-18 h-18 object-contain"
              onError={(e) => {
                if (e.currentTarget.src !== fallbackLogoUrl) {
                  e.currentTarget.src = fallbackLogoUrl;
                }
              }}
            />
            <h1 className="text-2xl font-bold text-orange-500">
              Travel Duck
            </h1>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `
                w-full
                flex
                items-center
                ${collapsed ? "justify-center" : "gap-3 px-6"}
                py-3
                transition
                ${
                  isActive
                    ? "bg-orange-100 text-orange-500 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }
              `}
            >
              <Icon size={22} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-5 border-t text-center text-sm text-gray-400">
          Travel Planner © 2026
        </div>
      )}
    </aside>
  );
}