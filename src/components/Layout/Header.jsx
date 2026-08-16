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
    // KEY LƯU BỘ LỌC
    // =====================================================

    const CITY_KEY = "travel_planner_selected_city";
    const DISTRICT_KEY = "travel_planner_selected_district";

    // =====================================================
    // 1. LẤY DANH SÁCH TỈNH / THÀNH PHỐ
    // =====================================================

    useEffect(() => {
        const loadCities = async () => {
            try {
                const res = await getCities();
                const cityList = res.data || [];

                setCities(cityList);

                if (cityList.length === 0) {
                    return;
                }

                // Lấy tỉnh đã lưu
                const savedCity = localStorage.getItem(CITY_KEY);

                // Kiểm tra tỉnh đã lưu còn tồn tại trong DB không
                const savedCityExists = cityList.some(
                    (city) => city.tinhthanh === savedCity
                );

                if (savedCity && savedCityExists) {
                    // Có tỉnh đã lưu → giữ nguyên
                    if (selectedCity !== savedCity) {
                        setSelectedCity(savedCity);
                    }
                } else {
                    // Chưa có tỉnh đã lưu → chọn tỉnh đầu tiên
                    const defaultCity = cityList[0].tinhthanh;

                    localStorage.setItem(
                        CITY_KEY,
                        defaultCity
                    );

                    if (selectedCity !== defaultCity) {
                        setSelectedCity(defaultCity);
                    }
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
    // 2. KHI ĐỔI TỈNH
    // =====================================================

    useEffect(() => {
        if (!selectedCity) {
            setDistricts([]);
            return;
        }

        // Lưu tỉnh đang chọn
        localStorage.setItem(
            CITY_KEY,
            selectedCity
        );

        const loadDistricts = async () => {
            try {
                const res = await getDistricts(
                    selectedCity
                );

                const districtList = res.data || [];

                setDistricts(districtList);

                // Lấy huyện đã lưu
                const savedDistrict =
                    localStorage.getItem(DISTRICT_KEY);

                // Kiểm tra huyện đã lưu có thuộc tỉnh hiện tại không
                const districtExists = districtList.some(
                    (district) =>
                        district.quanhuyen === savedDistrict
                );

                if (
                    savedDistrict &&
                    districtExists
                ) {
                    setSelectedDistrict(
                        savedDistrict
                    );
                } else {
                    // Không có huyện hợp lệ
                    localStorage.removeItem(
                        DISTRICT_KEY
                    );

                    setSelectedDistrict("");
                }

            } catch (error) {
                console.error(
                    "Lỗi lấy quận/huyện:",
                    error
                );

                setDistricts([]);
                setSelectedDistrict("");

                localStorage.removeItem(
                    DISTRICT_KEY
                );
            }
        };

        loadDistricts();

    }, [selectedCity]);

    // =====================================================
    // 3. KHI ĐỔI QUẬN / HUYỆN
    // =====================================================

    useEffect(() => {
        if (selectedDistrict) {
            localStorage.setItem(
                DISTRICT_KEY,
                selectedDistrict
            );
        } else {
            localStorage.removeItem(
                DISTRICT_KEY
            );
        }
    }, [selectedDistrict]);

    // =====================================================
    // 4. ĐỔI TỈNH THỦ CÔNG
    // =====================================================

    const handleCityChange = (e) => {
        const newCity = e.target.value;

        // Lưu tỉnh mới
        localStorage.setItem(
            CITY_KEY,
            newCity
        );

        // Reset huyện
        localStorage.removeItem(
            DISTRICT_KEY
        );

        setSelectedCity(newCity);
        setSelectedDistrict("");
    };

    // =====================================================
    // 5. ĐỔI QUẬN / HUYỆN
    // =====================================================

    const handleDistrictChange = (e) => {
        const newDistrict = e.target.value;

        if (newDistrict) {
            localStorage.setItem(
                DISTRICT_KEY,
                newDistrict
            );
        } else {
            localStorage.removeItem(
                DISTRICT_KEY
            );
        }

        setSelectedDistrict(newDistrict);
    };

    // =====================================================
    // 6. GIAO DIỆN
    // =====================================================

    return (
        <header className="h-20 bg-white border-b shadow-sm">

            <div className="h-full flex items-center justify-between px-8">

                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="flex items-center gap-6">

                    {/* MENU */}

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
                        value={selectedCity || ""}
                        onChange={handleCityChange}
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
                        value={selectedDistrict || ""}
                        onChange={handleDistrictChange}
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
                        USER
                    ================================================= */}

                    {!isAuthenticated ? (

                        <button
                            onClick={() =>
                                setOpenLogin(true)
                            }
                            className="flex items-center gap-2 hover:text-orange-500 transition"
                        >

                            <UserCircle2 size={34} />

                            <span>
                                Đăng nhập
                            </span>

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

                                <UserCircle2
                                    size={34}
                                    className="text-orange-500"
                                />

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

                                <span>
                                    Đăng xuất
                                </span>

                            </button>

                        </div>

                    )}

                </div>

            </div>

            {/* LOGIN MODAL */}

            <LoginModal
                open={openLogin}
                onClose={() =>
                    setOpenLogin(false)
                }
            />

        </header>
    );
}