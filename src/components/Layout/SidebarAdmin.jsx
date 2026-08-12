import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardPaste,
  Landmark,
  Wrench,
  ShieldUser,
  LogOut,
} from "lucide-react";
  return (
    <div className="w-66 flex flex-col h-screen bg-white border-r border-slate-200">
      <div className="flex items-center border-b border-slate-200 p-2">
        <img
          src={LogoCTUT}
          alt="LogoCTUT"
          className="w-15 h-15 object-contain"
        />
        <div className="ml-2">
          <h2 className="font-bold text-blue-800">
            HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ
          </h2>
          <h6 className="font-light text-gray-500 text-xs">
            Dormitory Management System
          </h6>
        </div>
      </div>
      {visibleMenuItems.map((item) => (
        <NavLink
          to={item.url}
          key={item.id}
          className={({ isActive }) =>
            `flex items-center hover:bg-blue-50 rounded-lg cursor-pointer group p-4 ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 text-gray-700"}`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                size={30}
                className={`transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-700 group-hover:text-blue-700"
                }`}
              />
              <span
                className={`font-medium ml-3 transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-700 group-hover:text-blue-700"
                }`}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      <div className="flex items-center mt-auto border-t border-slate-200 p-2 bg-gray-100">
        <img src={UserImage} className="w-10 h-10 object-contain rounded-4xl" />
        <div className="items-center ml-3 min-w-0">
          <h2 className="font-bold">{currentUser?.tenDangNhap || "Người dùng"}</h2>
          <h6 className="font-medium text-gray-500 text-xs">
            {currentUser?.tenVaiTro || "Không xác định"}
          </h6>
        </div>
        <div className="ml-auto">
          <LogOut
            size={20}
            className="cursor-pointer hover:text-red-500"
            onClick={onLogout}
            title="Đăng xuất"
          />
        </div>
      </div>
    </div>
  );
