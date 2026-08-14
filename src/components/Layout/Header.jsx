import { useEffect, useState } from "react";
import LoginModal from "../Common/LoginModal";
import {
    Search,
    UserCircle2,
    Menu,
    LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

import {
    getCities,
    getDistricts
} from "../../services/locationService";


export default function Header({
    collapsed,
    setCollapsed,
}) {

    const { user, logout, isAuthenticated } = useAuth();

    const [cities, setCities] = useState([]);

    const [districts, setDistricts] = useState([]);

    const [selectedCity, setSelectedCity] = useState("");

    const [selectedDistrict, setSelectedDistrict] = useState("");

    const [openLogin, setOpenLogin] = useState(false);


    /* Lấy tỉnh/thành */

    useEffect(() => {

        const loadCities = async () => {

            try {

                const res = await getCities();

                setCities(res.data);

                if (res.data.length > 0) {
                    setSelectedCity(res.data[0].tinhthanh);
                }

            } catch (error) {

                console.error(
                    "Lỗi lấy tỉnh/thành:",
                    error
                );

            }

        };

        loadCities();

    }, []);


    /* Khi chọn tỉnh → lấy quận/huyện */

    useEffect(() => {

        if (!selectedCity) {

            setDistricts([]);

            return;

        }


        const loadDistricts = async () => {

            try {

                const res = await getDistricts(
                    selectedCity
                );

                setDistricts(res.data);

                setSelectedDistrict("");

            } catch (error) {

                console.error(
                    "Lỗi lấy quận/huyện:",
                    error
                );

                setDistricts([]);

            }

        };

        loadDistricts();

    }, [selectedCity]);


    return (

        <header className="h-20 bg-white border-b shadow-sm">

            <div className="h-full flex items-center justify-between px-8">


                {/* Left */}

                <div className="flex items-center gap-6">

                    <button
                        onClick={() =>
                            setCollapsed(!collapsed)
                        }
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


                    {/* Tỉnh / Thành phố */}

                    <select
                        value={selectedCity}
                        onChange={(e) =>
                            setSelectedCity(e.target.value)
                        }
                        className="border border-gray-300 rounded-full px-4 py-2 hover:border-orange-500 transition cursor-pointer"
                    >

                        {cities.map((city) => (

                            <option
                                key={city.tinhthanh}
                                value={city.tinhthanh}
                            >
                                {city.tinhthanh}
                            </option>

                        ))}

                    </select>


                    {/* Quận / Huyện */}

                    <select
                        value={selectedDistrict}
                        onChange={(e) =>
                            setSelectedDistrict(
                                e.target.value
                            )
                        }
                        className="border border-gray-300 rounded-full px-4 py-2 hover:border-orange-500 transition cursor-pointer"
                    >

                        <option value="">
                            Tất cả quận/huyện
                        </option>

                        {districts.map((district) => (

                            <option
                                key={district.quanhuyen}
                                value={district.quanhuyen}
                            >
                                {district.quanhuyen}
                            </option>

                        ))}

                    </select>


                    {/* User area: đăng nhập hoặc tên + đăng xuất */}

                    {!isAuthenticated ? (
                        <button
                            onClick={() => setOpenLogin(true)}
                            className="flex items-center gap-2 hover:text-orange-500 transition"
                        >
                            <UserCircle2 size={34} />
                            <span>Đăng nhập</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            {user?.hinhanh ? (
                                <img
                                    src={user.hinhanh}
                                    alt={user.hoten}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded-full object-cover border border-orange-200"
                                />
                            ) : (
                                <UserCircle2 size={34} className="text-orange-500" />
                            )}
                            <span className="font-medium text-orange-500">
                                Xin Chào, {user?.hoten}
                                {user?.vaitro === 1 && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                        Admin
                                    </span>
                                )}
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition border border-gray-300 rounded-full px-3 py-1 hover:border-red-500"
                                aria-label="Đăng xuất"
                            >
                                <LogOut size={18} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}

                </div>

            </div>

            <LoginModal
                open={openLogin}
                onClose={() => setOpenLogin(false)}
            />

        </header>
    );
}
