import {
  House,
  Compass,
  Heart,
  CalendarDays,
  Map,
  Users,
  Info,
} from "lucide-react";

const menuItems = [
  {
    icon: <House size={20} />,
    title: "Trang chủ",
    active: true,
  },
  {
    icon: <Compass size={20} />,
    title: "Khám phá",
  },
  {
    icon: <Heart size={20} />,
    title: "Yêu thích",
  },
  {
    icon: <CalendarDays size={20} />,
    title: "Tạo lịch trình",
  },
  {
    icon: <Map size={20} />,
    title: "Bản đồ",
  },
  {
    icon: <Users size={20} />,
    title: "Lịch trình nhóm",
  },
  {
    icon: <Info size={20} />,
    title: "Giới thiệu",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col">

      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b">
        <h1 className="text-2xl font-bold text-orange-500">
          Travel Planner
        </h1>
      </div>

      {/* Menu */}
      <div className="flex-1 py-4">

        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-6 py-3 transition
            ${
              item.active
                ? "bg-orange-100 text-orange-500 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}

      </div>

      {/* Footer */}
      <div className="p-5 border-t text-sm text-gray-400 text-center">
        Travel Planner © 2026
      </div>
    </aside>
  );
}