import {
    Heart,
    MapPin,
    Wallet,
    Star,
    Plus
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toggleFavoritePlace } from "../../services/favoriteService";


function PlaceCard({
    place,
    isFavorite = false,
    onFavoriteChange,
    onRequireLogin
}) {

    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [liked, setLiked] = useState(isFavorite);
    const [loading, setLoading] = useState(false);

    const imageUrl = place.hinhanh
        ? `http://localhost/travel-planner/backend/uploads/${place.hinhanh}`
        : "/placeholder.jpg";

    const price = Number(place.giadukien || 0);

    const rating = Number(place.rating || 0);

    const reviewCount = Number(place.review_count || 0);

    const categories = place.categories
        ? place.categories.split(",")
        : [];


    // =====================================================
    // CLICK CARD → CHI TIẾT
    // =====================================================

    const handleCardClick = () => {
        navigate(`/places/${place.id}`);
    };


    // =====================================================
    // YÊU THÍCH
    // =====================================================

    const handleToggleFavorite = async (e) => {

        // Không cho click tim làm click Card
        e.stopPropagation();

        if (!isAuthenticated) {
            onRequireLogin?.();
            return;
        }

        if (loading) return;

        try {

            setLoading(true);

            const res = await toggleFavoritePlace(
                user.id,
                place.id
            );

            const newState = res.data.favorite;

            setLiked(newState);

            onFavoriteChange?.(
                place.id,
                newState
            );

        } catch (err) {

            console.error(
                "Lỗi toggle yêu thích:",
                err
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // THÊM VÀO LỊCH TRÌNH
    // =====================================================

    const handleAddToSchedule = (e) => {

        // Không cho click nút này làm mở trang chi tiết
        e.stopPropagation();

        if (!isAuthenticated) {
            onRequireLogin?.();
            return;
        }

        navigate(
            `/create-schedule?placeId=${place.id}`
        );
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
    onClick={handleCardClick}
    className="
    group
    cursor-pointer
    overflow-hidden
    rounded-2xl
    bg-white
    border
    border-gray-100
    shadow-sm

    transition-all
    duration-300
    ease-out

    hover:-translate-y-2
    hover:border-orange-300
    hover:shadow-2xl
"
>

            {/* =================================================
                HÌNH ẢNH
            ================================================= */}

            <div className="relative h-52 overflow-hidden">

                <img
                    src={imageUrl}
                    alt={place.tendiadiem}
                    className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                    "
                />


                {/* ================= TIM ================= */}

                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={loading}
                    title={
                        !isAuthenticated
                            ? "Đăng nhập để yêu thích"
                            : liked
                                ? "Bỏ yêu thích"
                                : "Yêu thích"
                    }
                    className="
                        absolute
                        right-3
                        top-3
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        shadow-md
                        transition
                        hover:bg-white
                        cursor-pointer
                    "
                >

                    <Heart
                        size={20}
                        className={
                            !isAuthenticated
                                ? "text-gray-400"
                                : liked
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-700"
                        }
                    />

                </button>


                {/* ================= DANH MỤC ================= */}

                {categories.length > 0 && (

                    <div
                        className="
                            absolute
                            bottom-3
                            left-3
                            flex
                            gap-2
                        "
                    >

                        {categories
                            .slice(0, 2)
                            .map((category) => (

                                <span
                                    key={category}
                                    className="
                                        rounded-full
                                        bg-white/90
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-gray-700
                                        shadow-sm
                                    "
                                >
                                    {category}
                                </span>

                            ))}

                    </div>

                )}

            </div>


            {/* =================================================
                NỘI DUNG
            ================================================= */}

            <div className="p-4">

                {/* TÊN */}

                <h3 className="
                    line-clamp-1
                    text-lg
                    font-bold
                    text-gray-800
                ">
                    {place.tendiadiem}
                </h3>


                {/* RATING */}

                <div className="mt-2 flex items-center gap-2">

                    <div className="flex items-center gap-1">

                        <Star
                            size={17}
                            className="
                                fill-yellow-400
                                text-yellow-400
                            "
                        />

                        <span className="font-semibold text-gray-800">

                            {rating > 0
                                ? rating.toFixed(1)
                                : "Chưa có"
                            }

                        </span>

                    </div>

                    {reviewCount > 0 && (

                        <span className="text-sm text-gray-500">

                            ({reviewCount} đánh giá)

                        </span>

                    )}

                </div>


                {/* ĐỊA CHỈ */}

                <div className="mt-3 flex gap-2 text-sm text-gray-500">

                    <MapPin
                        size={17}
                        className="mt-0.5 shrink-0"
                    />

                    <span className="line-clamp-2">
                        {place.diachi}
                    </span>

                </div>


                {/* QUẬN / THÀNH PHỐ */}

                <div className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-gray-500
                ">

                    <span>
                        {place.quanhuyen}
                    </span>

                    <span>•</span>

                    <span>
                        {place.tinhthanh}
                    </span>

                </div>


                {/* GIÁ */}

                <div className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    border-t
                    pt-3
                ">

                    <Wallet
                        size={17}
                        className="text-blue-600"
                    />

                    <span className="font-semibold text-gray-700">

                        {price === 0
                            ? "Miễn phí"
                            : `${price.toLocaleString("vi-VN")}đ`
                        }

                    </span>

                </div>


                {/* =================================================
                    THÊM VÀO LỊCH TRÌNH
                ================================================= */}

                <button
                    type="button"
                    onClick={handleAddToSchedule}
                    className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-orange-500
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-orange-600
                    "
                >

                    <Plus size={18} />

                    Thêm vào lịch trình

                </button>

            </div>

        </div>
    );
}


export default PlaceCard;