import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PlaceGrid from "../../components/Home/PlaceGrid";
import Layout from "../../components/Layout/Layout";
import LoginModal from "../../components/Common/LoginModal";

import { useAuth } from "../../contexts/AuthContext";
import { getMyFavorites } from "../../services/favoriteService";


export default function Favorites() {

    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [openLogin, setOpenLogin] = useState(false);


    // =====================================================
    // CHƯA ĐĂNG NHẬP
    // =====================================================

    useEffect(() => {

        if (!isAuthenticated) {
            setOpenLogin(true);
        }

    }, [isAuthenticated]);


    // =====================================================
    // LẤY DANH SÁCH YÊU THÍCH
    // =====================================================

    useEffect(() => {

        if (!isAuthenticated || !user?.id) {
            setPlaces([]);
            return;
        }

        fetchFavorites();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAuthenticated]);


    const fetchFavorites = async () => {

        if (!user?.id) return;

        setLoading(true);

        try {

            const res = await getMyFavorites(user.id);

            const favoritePlaces = Array.isArray(res.data)
                ? res.data
                : [];

            setPlaces(favoritePlaces);

        } catch (err) {

            console.error(
                "Lỗi lấy danh sách yêu thích:",
                err
            );

            setPlaces([]);

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // THAY ĐỔI YÊU THÍCH TỪ PLACECARD
    //
    // LƯU Ý:
    // PlaceCard ĐÃ gọi API toggle rồi.
    // Hàm này CHỈ cập nhật state của Favorites.
    // KHÔNG gọi toggleFavoritePlace lần nữa.
    // =====================================================

    const handleFavoriteChange = (placeId, isFavorite) => {

        const id = Number(placeId);

        // Nếu đã bỏ yêu thích
        if (!isFavorite) {

            setPlaces((prev) =>
                prev.filter(
                    (place) =>
                        Number(place.id) !== id
                )
            );

            return;
        }

        // Trường hợp thêm lại yêu thích
        // Trang Favorites hiện tại không cần tự thêm
        // vì danh sách chi tiết chưa có object mới.
        //
        // Fetch lại từ backend để đảm bảo dữ liệu chính xác.

        fetchFavorites();
    };


    // =====================================================
    // SẮP XẾP
    // =====================================================

    const sortedPlaces = [...places].sort((a, b) => {

        if (sortBy === "rating") {

            return (
                Number(b.rating || 0) -
                Number(a.rating || 0)
            );

        }

        if (sortBy === "name") {

            return (
                (a.tendiadiem || "").localeCompare(
                    b.tendiadiem || ""
                )
            );

        }

        // newest
        return 0;
    });


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <Layout>

            <div className="min-h-screen bg-gray-50 p-6">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-6
                    shadow-sm
                    md:flex-row
                    md:items-center
                    md:justify-between
                ">

                    <div>

                        <h2 className="
                            flex
                            items-center
                            gap-2
                            text-2xl
                            font-bold
                            text-gray-900
                        ">
                            <span>❤️</span>

                            Địa điểm yêu thích
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-gray-500
                        ">
                            {places.length > 0
                                ? `Bạn đã yêu thích ${places.length} địa điểm`
                                : "Danh sách các địa điểm bạn đã thả tim"
                            }
                        </p>

                    </div>


                    {/* =================================================
                        SORT
                    ================================================= */}

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <span className="
                            text-sm
                            text-gray-500
                        ">
                            Sắp xếp:
                        </span>

                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value)
                            }
                            className="
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                p-2
                                text-sm
                                focus:outline-none
                                focus:ring-2
                                focus:ring-orange-500
                            "
                        >

                            <option value="newest">
                                Mới thêm
                            </option>

                            <option value="rating">
                                Đánh giá cao nhất
                            </option>

                            <option value="name">
                                Theo tên A-Z
                            </option>

                        </select>

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="
                        py-10
                        text-center
                        text-gray-500
                    ">
                        Đang tải dữ liệu...
                    </div>


                ) : sortedPlaces.length === 0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */

                    <div className="
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        py-16
                        text-center
                    ">

                        <div className="mb-4 text-6xl">
                            💔
                        </div>

                        <p className="
                            font-medium
                            text-gray-700
                        ">
                            Bạn chưa yêu thích địa điểm nào
                        </p>

                        <p className="
                            mt-2
                            text-sm
                            text-gray-500
                        ">
                            Hãy khám phá và thả tim cho những nơi
                            bạn thích nhé!
                        </p>

                        <button
                            onClick={() =>
                                navigate("/explore")
                            }
                            className="
                                mt-4
                                rounded-full
                                bg-orange-500
                                px-5
                                py-2
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-orange-600
                            "
                        >
                            Khám phá ngay
                        </button>

                    </div>


                ) : (

                    /* =================================================
                       FAVORITE LIST
                    ================================================= */

                    <PlaceGrid
                        places={sortedPlaces}

                        favoriteIds={sortedPlaces.map(
                            (place) => Number(place.id)
                        )}

                        onFavoriteChange={
                            handleFavoriteChange
                        }

                        onRequireLogin={() =>
                            setOpenLogin(true)
                        }
                    />

                )}

            </div>


            {/* =================================================
                LOGIN MODAL
            ================================================= */}

            {openLogin && (

                <LoginModal
                    onClose={() =>
                        setOpenLogin(false)
                    }
                />

            )}

        </Layout>
    );
}