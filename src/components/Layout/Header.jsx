import { Search, MapPin, UserCircle2 } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full h-20 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10"
          />

          <h1 className="text-2xl font-bold text-orange-500">
            Travel Planner
          </h1>
        </div>

        {/* Search */}
        <div className="flex items-center w-[450px] bg-gray-100 rounded-full px-4 py-2">

          <Search size={18} className="text-gray-500" />

          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
            className="flex-1 ml-3 bg-transparent outline-none"
          />

        </div>

        {/* Right */}
        <div className="flex items-center gap-5">

          <button className="flex items-center gap-2 border rounded-full px-4 py-2 hover:bg-gray-100 transition">

            <MapPin size={18} />

            <span>Cần Thơ</span>

          </button>

          <button className="hover:text-orange-500 transition">
            <UserCircle2 size={34} />
          </button>

        </div>

      </div>
    </header>
  );
}