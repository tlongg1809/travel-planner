import {
    Heart,
    MapPin,
    Wallet,
    Star,
    Plus
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toggleFavoritePlace } from "../../services/favoriteService";
import AddToScheduleButton from "../common/AddToScheduleButton";

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

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    useEffect(() => {
    setLiked(Boolean(isFavorite));
}, [isFavorite]);

    // =====================================================
    // XỬ LÝ URL HÌNH ẢNH
    // =====================================================
    const getImageUrl = (url) => {
        if (!url) {
            return "/placeholder.jpg";
        }

        let imageUrl = String(url).trim();

        // Nếu API đã trả URL đầy đủ
        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        // Chuẩn hóa dấu /
        imageUrl = imageUrl.replace(/\\/g, "/");

        // Trường hợp DB trả:
        // /uploads/abc.jpg
        if (imageUrl.startsWith("/uploads/")) {
            return `http://localhost/travel-planner/backend${imageUrl}`;
        }

        // Trường hợp DB trả:
        // uploads/abc.jpg
        if (imageUrl.startsWith("uploads/")) {
            return `http://localhost/travel-planner/backend/${imageUrl}`;
        }

        // Trường hợp DB chỉ trả:
        // abc.jpg
        return `http://localhost/travel-planner/backend/uploads/${imageUrl.replace(
            /^\/+/,
            ""
        )}`;
    };


    // =====================================================
    // HÌNH ẢNH
    // =====================================================
    const imageUrl = getImageUrl(
        place.hinhanh || place.image
    );


    // =====================================================
    // DỮ LIỆU
    // =====================================================
    const price = Number(place.giadukien || 0);

    const rating = Number(place.rating || 0);

    const reviewCount = Number(
        place.review_count || 0
    );

    const categories = place.categories
        ? String(place.categories)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
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


    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div
            onClick={handleCardClick}
    className={`
        group
        flex
        h-[520px]
        ${scheduleModalOpen ? "" : "cursor-pointer"}
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm

        ${scheduleModalOpen
            ? ""
            : `
                transition-all
                duration-300
                ease-out
                hover:-translate-y-2
                hover:border-orange-300
                hover:shadow-2xl
            `
        }
    `}
        >

            {/* =================================================
                HÌNH ẢNH
            ================================================= */}
            <div className="relative h-[210px] shrink-0 overflow-hidden bg-gray-100">

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
                    onError={(e) => {
                        console.error(
                            "ẢNH CARD LOAD LỖI:",
                            e.currentTarget.src
                        );

                        // Tránh vòng lặp nếu placeholder cũng lỗi
                        if (
                            e.currentTarget.src.endsWith(
                                "/placeholder.jpg"
                            )
                        ) {
                            return;
                        }

                        e.currentTarget.src =
                            "/placeholder.jpg";
                    }}
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
                        hover:scale-105
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
                            max-w-[90%]
                            gap-2
                            overflow-hidden
                        "
                    >
                        {categories
                            .slice(0, 2)
                            .map((category) => (
                                <span
                                    key={category}
                                    className="
                                        shrink-0
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
            <div
                className="
                    flex
                    min-h-0
                    flex-1
                    flex-col
                    p-4
                "
            >

                {/* =================================================
                    TÊN
                ================================================= */}
                <div className="h-[28px] shrink-0 overflow-hidden">
                    <h3
                        className="
                            line-clamp-1
                            text-lg
                            font-bold
                            leading-7
                            text-gray-800
                        "
                    >
                        {place.tendiadiem}
                    </h3>
                </div>


                {/* =================================================
                    RATING
                ================================================= */}
                <div className="mt-2 flex h-[24px] shrink-0 items-center gap-2">

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
                                : "Chưa có"}
                        </span>

                    </div>

                    {reviewCount > 0 && (
                        <span className="text-sm text-gray-500">
                            ({reviewCount} đánh giá)
                        </span>
                    )}

                </div>


                {/* =================================================
                    ĐỊA CHỈ
                ================================================= */}
                <div
                    className="
                        mt-3
                        flex
                        h-[48px]
                        shrink-0
                        gap-2
                        overflow-hidden
                        text-sm
                        text-gray-500
                    "
                >

                    <MapPin
                        size={17}
                        className="mt-0.5 shrink-0"
                    />

                    <span className="line-clamp-2 leading-5">
                        {place.diachi ||
                            "Chưa cập nhật địa chỉ"}
                    </span>

                </div>


                {/* =================================================
                    QUẬN / THÀNH PHỐ
                ================================================= */}
                <div
                    className="
                        mt-2
                        flex
                        h-[24px]
                        shrink-0
                        items-center
                        gap-2
                        overflow-hidden
                        text-sm
                        text-gray-500
                    "
                >

                    <span className="truncate">
                        {place.quanhuyen || ""}
                    </span>

                    {place.quanhuyen &&
                        place.tinhthanh && (
                            <span className="shrink-0">
                                •
                            </span>
                        )}

                    <span className="truncate">
                        {place.tinhthanh || ""}
                    </span>

                </div>


                {/* =================================================
                    GIÁ
                ================================================= */}
                <div
                    className="
                        mt-3
                        flex
                        h-[44px]
                        shrink-0
                        items-center
                        gap-2
                        border-t
                        border-gray-200
                        pt-3
                    "
                >

                    <Wallet
                        size={17}
                        className="shrink-0 text-blue-600"
                    />

                    <span className="font-semibold text-gray-700">
                        {price === 0
                            ? "Miễn phí"
                            : `${price.toLocaleString(
                                  "vi-VN"
                              )}đ`}
                    </span>

                </div>


                {/* =================================================
                    NÚT THÊM VÀO LỊCH TRÌNH
                    mt-auto = đẩy nút xuống đáy card
                ================================================= */}
               <AddToScheduleButton
    place={place}
    onRequireLogin={onRequireLogin}
    onModalChange={setScheduleModalOpen}
/>

            </div>

        </div>
    );
}


export default PlaceCard;