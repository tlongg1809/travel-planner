import {
    Heart,
    MapPin,
    Wallet,
    Star,
    X,
    Plus
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toggleFavoritePlace } from "../../services/favoriteService";

import { useEffect, useState } from "react";

import {
    getMySchedules,
    addPlaceToSchedule,
} from "../../services/scheduleService";


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
    // form thêm lịch trình
    const [openSchedule, setOpenSchedule] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [addingScheduleId, setAddingScheduleId] = useState(null);
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


    // Hàm mở danh sách lịch trình
    const handleOpenSchedule = async (e) => {

        e.stopPropagation();

        if (!isAuthenticated) {
            onRequireLogin?.();
            return;
        }

        setOpenSchedule(true);
        setLoadingSchedules(true);

        try {
            const res = await getMySchedules(user.id);
            setSchedules(res.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy lịch trình:",
                error
            );
            setSchedules([]);
        } finally {
            setLoadingSchedules(false);
        }
    };

    //=================================
    // Hàm thêm địa điểm liichj trình
    //===================================
    const handleAddToSchedule = async (scheduleId) => {
        if (addingScheduleId) return;

        try {
            setAddingScheduleId(scheduleId);

            await addPlaceToSchedule(
                scheduleId,
                {
                    userId: user.id,
                    placeId: place.id,
                }
            );

            alert(
                `Đã thêm "${place.tendiadiem}" vào lịch trình`
            );

            setOpenSchedule(false);

        } catch (error) {
            console.error(
                "Lỗi thêm vào lịch trình:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Không thể thêm địa điểm vào lịch trình"
            );
        } finally {
            setAddingScheduleId(null);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
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
                        onClick={handleOpenSchedule}
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

            {openSchedule && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    {/* nền */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpenSchedule(false)}
                    />

                    {/* modal */}
                    <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Thêm vào lịch trình
                                </h2>

                                <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                                    {place.tendiadiem}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setOpenSchedule(false)
                                }
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {loadingSchedules ? (
                            <div className="py-10 text-center text-gray-500">
                                Đang tải lịch trình...
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="py-8 text-center">

                                <div className="mb-3 text-4xl">
                                    🗓️
                                </div>

                                <p className="font-medium text-gray-800">
                                    Bạn chưa có lịch trình
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Hãy tạo lịch trình trước khi thêm địa điểm.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        window.location.href =
                                        "/create-schedule"
                                    }
                                    className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                                >
                                    + Tạo lịch trình
                                </button>
                            </div>
                        ) : (
                            <div className="max-h-[400px] space-y-3 overflow-y-auto">

                                {schedules.map((schedule) => (
                                    <button
                                        key={schedule.id}
                                        type="button"
                                        onClick={() =>
                                            handleAddToSchedule(
                                                schedule.id
                                            )
                                        }
                                        disabled={
                                            addingScheduleId ===
                                            schedule.id
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-between gap-3">

                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {schedule.tieude}
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {String(
                                                        schedule.ngaybatdau
                                                    ).slice(0, 10)}
                                                    {" → "}
                                                    {String(
                                                        schedule.ngayketthuc
                                                    ).slice(0, 10)}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {schedule.so_diadiem || 0}
                                                    {" địa điểm"}
                                                </p>
                                            </div>

                                            {addingScheduleId ===
                                                schedule.id ? (
                                                <span className="text-sm text-orange-500">
                                                    Đang thêm...
                                                </span>
                                            ) : (
                                                <Plus
                                                    size={20}
                                                    className="shrink-0 text-orange-500"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>
                </div>
            )}
        </>
    );
}


export default PlaceCard;