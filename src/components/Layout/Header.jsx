import { useEffect, useState } from "react";
import SearchBox from "../Search/SearchBox";
import { useAuth } from "../../contexts/AuthContext";
import { UserCircle2, Menu, LogOut } from "lucide-react";
import {
    getCities,
    getDistricts
} from "../../services/locationService";
import LoginModal from "../Common/LoginModal";


export default function Header({

    collapsed,
    setCollapsed,

    selectedCity,
    setSelectedCity,

    selectedDistrict,
    setSelectedDistrict

}) {

    const [cities, setCities] = useState([]);

    const [districts, setDistricts] = useState([]);
    const { user, logout, isAuthenticated } = useAuth();
    const [openLogin, setOpenLogin] = useState(false);


    // =====================================================
    // 1. LẤY DANH SÁCH TỈNH / THÀNH PHỐ
    // =====================================================

    useEffect(() => {

        const loadCities = async () => {

            try {

                const res = await getCities();

                const cityList = res.data || [];

                setCities(cityList);


                // Chọn tỉnh đầu tiên khi vừa vào trang
                if (
                    cityList.length > 0 &&
                    !selectedCity
                ) {

                    setSelectedCity(
                        cityList[0].tinhthanh
                    );

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


    // =====================================================
    // 2. KHI ĐỔI TỈNH → LẤY LẠI QUẬN/HUYỆN
    // =====================================================

    useEffect(() => {

        if (!selectedCity) {

            setDistricts([]);

            setSelectedDistrict("");

            return;

        }


        const loadDistricts = async () => {

            try {

                const res = await getDistricts(
                    selectedCity
                );

                setDistricts(
                    res.data || []
                );


                // Đổi tỉnh → reset huyện
                setSelectedDistrict("");

            } catch (error) {

                console.error(
                    "Lỗi lấy quận/huyện:",
                    error
                );

                setDistricts([]);

                setSelectedDistrict("");

            }

        };


        loadDistricts();

    }, [selectedCity]);


    // =====================================================
    // 3. GIAO DIỆN
    // =====================================================

    return (

        <header className="h-20 bg-white border-b shadow-sm">

            <div className="h-full flex items-center justify-between px-8">


                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="flex items-center gap-6">


                    {/* Menu */}

                    <button

                        onClick={() =>
                            setCollapsed(!collapsed)
                        }

                        className="hover:bg-gray-100 rounded-lg p-2 transition"

                    >

                        <Menu size={24} />

                    </button>


                    <SearchBox />

                </div>


                {/* =================================================
                    RIGHT
                ================================================= */}

                <div className="flex items-center gap-4">


                    {/* =================================================
                        TỈNH / THÀNH PHỐ
                    ================================================= */}

                    <select

                        value={selectedCity}

                        onChange={(e) => {

                            setSelectedCity(
                                e.target.value
                            );

                        }}

                        className="border rounded-full px-4 py-2"

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


                    {/* =================================================
                        QUẬN / HUYỆN
                    ================================================= */}

                    <select

                        value={selectedDistrict}

                        onChange={(e) => {

                            setSelectedDistrict(
                                e.target.value
                            );

                        }}

                        disabled={!selectedCity}

                        className="border rounded-full px-4 py-2 disabled:bg-gray-100 disabled:text-gray-400"

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


                    {/* =================================================
                        LOGIN
                    ================================================= */}

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
