import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaceCard from "../../components/Home/PlaceCard";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../../components/Common/LoginModal";

import PlaceGrid from "../../components/Home/PlaceGrid";
import {
    getMyFavorites,
    toggleFavoritePlace,
} from "../../services/favoriteService";


export default function Favorites() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [openLogin, setOpenLogin] = useState(false);
    
    // Nếu chưa đăng nhập → đẩy về trang chủ (hoặc mở modal đăng nhập)
    useEffect(() => {
        if (!isAuthenticated) {
            setOpenLogin(true);
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;
        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isAuthenticated]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await getMyFavorites(user.id);
            setPlaces(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách yêu thích:", err);
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    };

    // Bỏ thích trực tiếp trên trang này → xóa khỏi list ngay
    const handleToggleOnPage = async (placeId, isFav) => {
        try {
            await toggleFavoritePlace(user.id, placeId);
            if (!isFav) {
                setPlaces((prev) => prev.filter((p) => p.id !== placeId));
            }
        } catch (err) {
            console.error("Lỗi toggle yêu thích:", err);
        }
    };

    // Sắp xếp
    const sortedPlaces = [...places].sort((a, b) => {
        if (sortBy === "rating") {
            return Number(b.rating || 0) - Number(a.rating || 0);
        }
        if (sortBy === "name") {
            return (a.tendiadiem || "").localeCompare(b.tendiadiem || "");
        }
        // newest: mặc định theo ngaytao từ backend đã DESC
        return 0;
    });

    return (
        <Layout>
            <div className="p-6 bg-gray-50 min-h-screen">

                {/* Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <span>❤️</span> Địa điểm yêu thích
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {places.length > 0
                                ? `Bạn đã yêu thích ${places.length} địa điểm`
                                : "Danh sách các địa điểm bạn đã thả tim"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Sắp xếp:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="newest">Mới thêm</option>
                            <option value="rating">Đánh giá cao nhất</option>
                            <option value="name">Theo tên A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Danh sách */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">
                        Đang tải dữ liệu...
                    </div>
                ) : sortedPlaces.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="text-6xl mb-4">💔</div>
                        <p className="text-gray-700 font-medium">
                            Bạn chưa yêu thích địa điểm nào
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Hãy khám phá và thả tim cho những nơi bạn thích nhé!
                        </p>
                        <button
                            onClick={() => navigate("/explore")}
                            className="mt-4 px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition"
                        >
                            Khám phá ngay
                        </button>
                    </div>
                ) : (
                    <PlaceGrid
                        places={sortedPlaces}
                        favoriteIds={sortedPlaces.map((p) => p.id)}
                        onFavoriteChange={(id, isFav) =>
                            handleToggleOnPage(id, isFav)
                        }
                        />
                )}
            </div>
        </Layout>
    );
}
