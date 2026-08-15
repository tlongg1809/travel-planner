import { useEffect, useState } from "react";

import PlaceCard from "../../components/Home/PlaceCard";

import {
    getCategories
} from "../../services/categoryService";

import {
    getPlaces
} from "../../services/placeService";

import {
    getCities,
    getDistricts
} from "../../services/locationService";

import Layout from "../../components/Layout/Layout";

import PlaceGrid from "../../components/Home/PlaceGrid";
import { useAuth } from "../../contexts/AuthContext";

import {
    getMyFavoriteIds
} from "../../services/favoriteService";
import LoginModal from "../../components/Common/LoginModal";

export default function Explore() {


    const { user, isAuthenticated } = useAuth();
    const [favoriteIds, setFavoriteIds] =
    useState([]);
    const [openLogin, setOpenLogin] = useState(false);
    // ==========================================
// LẤY DANH SÁCH ID ĐỊA ĐIỂM ĐÃ YÊU THÍCH
// ==========================================

useEffect(() => {
    if (!isAuthenticated || !user?.id) {
        setFavoriteIds([]);
        return;
    }

    getMyFavoriteIds(user.id)
        .then((res) => {
            setFavoriteIds(res.data?.ids || []);
        })
        .catch((error) => {
            console.error(
                "Lỗi lấy danh sách yêu thích:",
                error
            );
            setFavoriteIds([]);
        });
}, [isAuthenticated, user]);


// ==========================================
// ĐỒNG BỘ KHI BẤM TIM
// ==========================================

const handleFavoriteChange = (placeId, isFav) => {
    setFavoriteIds((prev) => {
        if (isFav) {
            if (
                prev.some(
                    (id) =>
                        String(id) === String(placeId)
                )
            ) {
                return prev;
            }

            return [...prev, placeId];
        }

        return prev.filter(
            (id) =>
                String(id) !== String(placeId)
        );
    });
};
    // ==========================================
    // DATA
    // ==========================================

    const [categories, setCategories] =
        useState([]);

    const [cities, setCities] =
        useState([]);

    const [districts, setDistricts] =
        useState([]);

    const [places, setPlaces] =
        useState([]);


    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // FILTER
    // ==========================================

    const [selectedCity, setSelectedCity] =
        useState("");

    const [selectedDistrict, setSelectedDistrict] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("");

    const [searchQuery, setSearchQuery] =
        useState("");

    const [sortBy, setSortBy] =
        useState("popular");


    // ==========================================
    // LẤY DANH MỤC
    // ==========================================

    useEffect(() => {

        const loadCategories = async () => {

            try {

                const res =
                    await getCategories();


                if (Array.isArray(res.data)) {

                    setCategories(
                        res.data
                    );

                } else {

                    setCategories([]);

                }

            } catch (error) {

                console.error(
                    "Lỗi lấy danh mục:",
                    error
                );

                setCategories([]);

            }

        };


        loadCategories();

    }, []);


    // ==========================================
    // LẤY TỈNH / THÀNH
    // ==========================================

    useEffect(() => {

        const loadCities = async () => {

            try {

                const res =
                    await getCities();


                const cityList =
                    res.data || [];


                setCities(cityList);


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


    // ==========================================
    // LẤY HUYỆN KHI ĐỔI TỈNH
    // ==========================================

    useEffect(() => {

        if (!selectedCity) {

            setDistricts([]);

            setSelectedDistrict("");

            return;

        }


        const loadDistricts = async () => {

            try {

                const res =
                    await getDistricts(
                        selectedCity
                    );


                setDistricts(
                    res.data || []
                );


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


    // ==========================================
    // LẤY ĐỊA ĐIỂM
    // ==========================================

    useEffect(() => {

        fetchPlaces();

    }, [

        selectedCity,

        selectedDistrict,

        selectedCategory,

        sortBy

    ]);


    // ==========================================
    // FETCH PLACES
    // ==========================================

    const fetchPlaces = async () => {

        setLoading(true);


        try {

            const res =
                await getPlaces({

                    tinhthanh:
                        selectedCity,

                    quanhuyen:
                        selectedDistrict,

                    danhmucid:
                        selectedCategory,

                    search:
                        searchQuery,

                    sort:
                        sortBy

                });


            if (
                Array.isArray(res.data)
            ) {

                setPlaces(
                    res.data
                );

            } else {

                setPlaces([]);

            }

        } catch (error) {

            console.error(
                "Lỗi kết nối API:",
                error
            );

            setPlaces([]);

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearchSubmit = (e) => {

        e.preventDefault();

        fetchPlaces();

    };


    return (

        <Layout

            selectedCity={selectedCity}

            setSelectedCity={setSelectedCity}

            selectedDistrict={selectedDistrict}

            setSelectedDistrict={setSelectedDistrict}

        >


            <div className="p-6 bg-gray-50 min-h-screen">


                {/* =====================================
                    BỘ LỌC
                ===================================== */}

                <form

                    onSubmit={
                        handleSearchSubmit
                    }

                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6"

                >


                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">

                        <span>🔍</span>

                        Bộ lọc tìm kiếm

                    </h2>


                    {/* =================================
                        HÀNG 1
                    ================================= */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">


                        {/* TỈNH */}

                        <select

                            value={
                                selectedCity
                            }

                            onChange={(e) =>
                                setSelectedCity(
                                    e.target.value
                                )
                            }

                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"

                        >

                            <option value="">

                                Tất cả tỉnh/thành

                            </option>


                            {cities.map(
                                (city) => (

                                    <option

                                        key={
                                            city.tinhthanh
                                        }

                                        value={
                                            city.tinhthanh
                                        }

                                    >

                                        {
                                            city.tinhthanh
                                        }

                                    </option>

                                )
                            )}

                        </select>


                        {/* HUYỆN */}

                        <select

                            value={
                                selectedDistrict
                            }

                            onChange={(e) =>
                                setSelectedDistrict(
                                    e.target.value
                                )
                            }

                            disabled={
                                !selectedCity
                            }

                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400"

                        >

                            <option value="">

                                Tất cả quận/huyện

                            </option>


                            {districts.map(
                                (district) => (

                                    <option

                                        key={
                                            district.quanhuyen
                                        }

                                        value={
                                            district.quanhuyen
                                        }

                                    >

                                        {
                                            district.quanhuyen
                                        }

                                    </option>

                                )
                            )}

                        </select>


                        {/* SORT */}

                        <select

                            value={sortBy}

                            onChange={(e) =>
                                setSortBy(
                                    e.target.value
                                )
                            }

                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"

                        >

                            <option value="popular">

                                Phổ biến nhất

                            </option>

                            <option value="rating">

                                Đánh giá cao nhất

                            </option>

                            <option value="price_asc">

                                Giá tăng dần

                            </option>

                            <option value="price_desc">

                                Giá giảm dần

                            </option>

                        </select>

                    </div>


                    {/* =================================
                        HÀNG 2
                    ================================= */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                        {/* SEARCH */}

                        <div className="md:col-span-2 relative">

                            <input

                                type="text"

                                placeholder="Tìm theo tên địa điểm, địa chỉ..."

                                value={
                                    searchQuery
                                }

                                onChange={(e) =>
                                    setSearchQuery(
                                        e.target.value
                                    )
                                }

                                className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"

                            />


                            <button

                                type="submit"

                                className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"

                            >

                                Tìm kiếm

                            </button>

                        </div>


                        {/* CATEGORY */}

                        <select

                            value={
                                selectedCategory
                            }

                            onChange={(e) =>
                                setSelectedCategory(
                                    e.target.value
                                )
                            }

                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"

                        >

                            <option value="">

                                Tất cả danh mục

                            </option>


                            {categories.map(
                                (cat) => (

                                    <option

                                        key={cat.id}

                                        value={cat.id}

                                    >

                                        {
                                            cat.tendanhmuc
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>

                </form>


                {/* =====================================
                    TAG DANH MỤC
                ===================================== */}

                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">


                    <button

                        onClick={() =>
                            setSelectedCategory("")
                        }

                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === ""
                                ? "bg-slate-900 text-white"
                                : "bg-white text-gray-700 border border-gray-200"
                        }`}

                    >

                        Tất cả

                    </button>


                    {categories.map(
                        (cat) => (

                            <button

                                key={cat.id}

                                onClick={() =>
                                    setSelectedCategory(
                                        cat.id
                                    )
                                }

                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                    String(
                                        selectedCategory
                                    ) ===
                                    String(cat.id)
                                        ? "bg-slate-900 text-white"
                                        : "bg-white text-gray-700 border border-gray-200"
                                }`}

                            >

                                {
                                    cat.tendanhmuc
                                }

                            </button>

                        )
                    )}

                </div>


                {/* =====================================
                    DANH SÁCH
                ===================================== */}

                {loading ? (

                    <div className="text-center py-10 text-gray-500">

                        Đang tải dữ liệu...

                    </div>

                ) : places.length === 0 ? (

                    <div className="text-center py-10 text-gray-500">

                        Không tìm thấy địa điểm phù hợp.

                    </div>

                ) : (

                    <PlaceGrid
  places={places}
  favoriteIds={favoriteIds}
  onFavoriteChange={handleFavoriteChange}
  onRequireLogin={() => setOpenLogin(true)}
/>

                )}

            </div>

<LoginModal
    open={openLogin}
    onClose={() => setOpenLogin(false)}
/>
        </Layout>

    );

}