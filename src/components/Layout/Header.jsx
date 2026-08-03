import {
  Search,
  MapPin,
  UserCircle2,
  Menu,
} from "lucide-react";

export default function Header({

  collapsed,
  setCollapsed,

}) {
  return (

    <header className="h-20 bg-white border-b shadow-sm">

      <div className="h-full flex items-center justify-between px-8">

        {/* Left */}

        <div className="flex items-center gap-6">

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-gray-100 rounded-lg p-2 transition"
          >
            <Menu size={24} />
          </button>

          {/* Search */}

          <div className="flex items-center w-[450px] bg-gray-100 rounded-full px-4 py-2">

            <Search
              size={18}
              className="text-gray-500"
            />

            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              className="flex-1 ml-3 bg-transparent outline-none"
            />

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4">

          {/* City */}

          <select className="border rounded-full px-4 py-2">

            <option>Cần Thơ</option>

          </select>

          {/* District */}

          <select className="border rounded-full px-4 py-2">

            <option>Tất cả quận</option>

          </select>

          {/* Login */}

          <button className="flex items-center gap-2 hover:text-orange-500 transition">

            <UserCircle2 size={34} />

            <span>Đăng nhập</span>

          </button>

        </div>

      </div>

    </header>

  );
}