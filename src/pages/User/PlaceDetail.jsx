import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Wallet,
    Clock,
    Star,
    Plus,
    Navigation,
    ChevronLeft,
    ChevronRight,
    LocateFixed
} from "lucide-react";
import {
    getMySchedules,
    addPlaceToSchedule,
} from "../../services/scheduleService";
import Layout from "../../components/Layout/Layout";
import MapView from "../../components/Map/MapView";
import { getPlaceDetail } from "../../services/placeService";
import { useAuth } from "../../contexts/AuthContext";
import { getMyReview, saveReview } from "../../services/reviewService";

const UPLOADS_URL = "http://localhost/travel-planner/backend/uploads";

export default function PlaceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentImage, setCurrentImage] = useState(0);

    const [myReview, setMyReview] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState("");
    const [savingReview, setSavingReview] = useState(false);
    const [openSchedule, setOpenSchedule] = useState(false);
const [schedules, setSchedules] = useState([]);
const [loadingSchedules, setLoadingSchedules] = useState(false);
const [addingScheduleId, setAddingScheduleId] = useState(null);

    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");

    // =====================================================
    // XỬ LÝ URL HÌNH ẢNH
    // =====================================================
    const getImageUrl = (url) => {
        if (!url) return "";

        const imageUrl = String(url).trim();

        // Nếu database đã lưu URL đầy đủ
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }

        // Xóa / ở đầu
        let cleanUrl = imageUrl.replace(/^\/+/, "");

        // Nếu database lưu /uploads/tenanh.jpg hoặc uploads/tenanh.jpg
        cleanUrl = cleanUrl.replace(/^uploads\//i, "");

        return `${UPLOADS_URL}/${cleanUrl}`;
    };

    useEffect(() => {
        const loadPlaceDetail = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await getPlaceDetail(id);
                setPlace(res.data);
                setCurrentImage(0);
            } catch (error) {
                console.error("Lỗi lấy chi tiết địa điểm:", error);
                setError("Không thể tải thông tin địa điểm.");
            } finally {
                setLoading(false);
            }
        };

        loadPlaceDetail();
    }, [id]);

    useEffect(() => {
        const loadMyReview = async () => {
            if (!isAuthenticated || !user?.id || !id) {
                setMyReview(null);
                setSelectedRating(0);
                setComment("");
                return;
            }

            try {
                const res = await getMyReview(user.id, id);
                setMyReview(res.data);

                if (res.data?.rating) {
                    setSelectedRating(Number(res.data.rating.sosao));
                } else {
                    setSelectedRating(0);
                }

                if (res.data?.comment) {
                    setComment(res.data.comment.noidung || "");
                } else {
                    setComment("");
                }
            } catch (error) {
                console.error("Lỗi lấy đánh giá của tôi:", error);
            }
        };

        loadMyReview();
    }, [isAuthenticated, user?.id, id]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Trình duyệt không hỗ trợ lấy vị trí.");
            return;
        }

        setGettingLocation(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });

                setGettingLocation(false);
            },
            (error) => {
                console.error("Lỗi lấy vị trí:", error);
                setGettingLocation(false);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Bạn chưa cho phép website truy cập vị trí.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Không thể xác định vị trí hiện tại.");
                        break;
                    case error.TIMEOUT:
                        setLocationError("Lấy vị trí quá lâu. Vui lòng thử lại.");
                        break;
                    default:
                        setLocationError("Không thể lấy vị trí hiện tại.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleOpenSchedule = async () => {
    if (!isAuthenticated) {
        navigate("/login");
        return;
    }

    setOpenSchedule(true);
    setLoadingSchedules(true);

    try {
        const res = await getMySchedules(user.id);
        setSchedules(res.data || []);
    } catch (error) {
        console.error("Lỗi lấy lịch trình:", error);
        setSchedules([]);
    } finally {
        setLoadingSchedules(false);
    }
};
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

        alert(`Đã thêm "${place.tendiadiem}" vào lịch trình`);

        setOpenSchedule(false);

    } catch (error) {
        console.error("Lỗi thêm vào lịch trình:", error);

        alert(
            error?.response?.data?.message ||
            "Không thể thêm địa điểm vào lịch trình"
        );
    } finally {
        setAddingScheduleId(null);
    }
};

    const handleSaveReview = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (selectedRating < 1 || selectedRating > 5) {
            alert("Vui lòng chọn số sao từ 1 đến 5.");
            return;
        }

        if (!comment.trim()) {
            alert("Vui lòng nhập bình luận.");
            return;
        }

        try {
            setSavingReview(true);

            await saveReview({
                userId: user.id,
                placeId: Number(id),
                rating: selectedRating,
                comment: comment.trim()
            });

            alert("Đánh giá thành công!");

            const placeRes = await getPlaceDetail(id);
            setPlace(placeRes.data);

            const reviewRes = await getMyReview(user.id, id);
            setMyReview(reviewRes.data);

            if (reviewRes.data?.rating) {
                setSelectedRating(Number(reviewRes.data.rating.sosao));
            }

            if (reviewRes.data?.comment) {
                setComment(reviewRes.data.comment.noidung || "");
            }
        } catch (error) {
            console.error("Lỗi lưu đánh giá:", error);
            alert(
                error.response?.data?.message ||
                error.message ||
                "Không thể lưu đánh giá."
            );
        } finally {
            setSavingReview(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <p className="text-gray-500">Đang tải thông tin địa điểm...</p>
                </div>
            </Layout>
        );
    }

    if (error || !place) {
        return (
            <Layout>
                <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
                    <p className="text-gray-500">
                        {error || "Không tìm thấy địa điểm."}
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="rounded-lg bg-orange-500 px-5 py-2 text-white transition hover:bg-orange-600"
                    >
                        Về trang chủ
                    </button>
                </div>
            </Layout>
        );
    }

    const images = Array.isArray(place.images) ? place.images : [];

    console.log("PLACE:", place);
    console.log("IMAGES:", images);

    const placeLatitude = Number(place.latitude);
    const placeLongitude = Number(place.longitude);

    const hasLocation =
        Number.isFinite(placeLatitude) &&
        Number.isFinite(placeLongitude) &&
        placeLatitude !== 0 &&
        placeLongitude !== 0;

    const price = Number(place.giadukien || 0);

    const currentImageUrl =
        images.length > 0
            ? getImageUrl(images[currentImage]?.url)
            : "";

    console.log("CURRENT IMAGE URL:", currentImageUrl);

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="px-10 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 transition hover:text-orange-500"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </button>
                </div>

                <div className="mx-auto max-w-7xl px-10 py-6">
                    {/* =====================================================
                        GALLERY
                    ===================================================== */}
                    <div className="grid grid-cols-4 gap-3 overflow-hidden rounded-3xl">
                        {/* ẢNH CHÍNH */}
                        <div className="relative col-span-2 row-span-2 h-[500px] overflow-hidden bg-gray-200">
                            {images.length > 0 && currentImageUrl ? (
                                <img
                                    src={currentImageUrl}
                                    alt={place.tendiadiem}
                                    className="h-full w-full object-cover"
                                    onLoad={() =>
                                        console.log(
                                            "ẢNH LOAD OK:",
                                            currentImageUrl
                                        )
                                    }
                                    onError={(e) =>
                                        console.error(
                                            "ẢNH LOAD LỖI:",
                                            e.currentTarget.src
                                        )
                                    }
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    Chưa có hình ảnh
                                </div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setCurrentImage(
                                                currentImage === 0
                                                    ? images.length - 1
                                                    : currentImage - 1
                                            )
                                        }
                                        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            setCurrentImage(
                                                currentImage === images.length - 1
                                                    ? 0
                                                    : currentImage + 1
                                            )
                                        }
                                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* ẢNH PHỤ */}
                        {[0, 1, 2, 3].map((index) => {
                            const image = images[index];

                            if (!image) {
                                return (
                                    <div
                                        key={index}
                                        className="h-[245px] bg-gray-200"
                                    />
                                );
                            }

                            const imageUrl = getImageUrl(image.url);

                            return (
                                <button
                                    key={image.id || index}
                                    onClick={() => setCurrentImage(index)}
                                    className="h-[245px] overflow-hidden"
                                >
                                    <img
                                        src={imageUrl}
                                        alt={place.tendiadiem}
                                        className={`h-full w-full object-cover transition ${
                                            currentImage === index
                                                ? "opacity-70"
                                                : "hover:scale-105"
                                        }`}
                                        onError={(e) =>
                                            console.error(
                                                "ẢNH PHỤ LOAD LỖI:",
                                                e.currentTarget.src
                                            )
                                        }
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* =====================================================
                        THÔNG TIN
                    ===================================================== */}
                    <div className="mt-8 grid grid-cols-3 gap-8">
                        <div className="col-span-2">
                            <h1 className="text-4xl font-bold text-gray-900">
                                {place.tendiadiem}
                            </h1>

                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star
                                        size={20}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                    <span className="font-semibold">
                                        {Number(place.rating) > 0
                                            ? Number(place.rating).toFixed(1)
                                            : "Chưa có"}
                                    </span>
                                </div>

                                <span className="text-gray-500">
                                    ({place.review_count || 0} đánh giá)
                                </span>
                            </div>

                            <div className="mt-5 flex items-start gap-3 text-gray-600">
                                <MapPin
                                    size={20}
                                    className="mt-1 shrink-0 text-orange-500"
                                />
                                <div>
                                    <p>{place.diachi}</p>
                                    <p className="mt-1">
                                        {place.quanhuyen} • {place.tinhthanh}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3 text-gray-600">
                                <Wallet
                                    size={20}
                                    className="text-blue-600"
                                />
                                <span className="font-semibold">
                                    {price === 0
                                        ? "Miễn phí"
                                        : `${price.toLocaleString("vi-VN")}đ`}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-3 text-gray-600">
                                <Clock
                                    size={20}
                                    className="text-green-600"
                                />
                                <span>
                                    {place.thoigianhoatdong ||
                                        "Chưa cập nhật"}
                                </span>
                            </div>

                            {/* =================================================
                                MÔ TẢ
                            ================================================= */}
                            <div className="mt-10">
                                <h2 className="text-2xl font-bold">
                                    Giới thiệu
                                </h2>

                                <p className="mt-4 leading-7 text-gray-600">
                                    {place.mota ||
                                        "Chưa có mô tả cho địa điểm này."}
                                </p>
                            </div>

                            {/* =================================================
                                BẢN ĐỒ
                            ================================================= */}
                            <div className="mt-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">
                                        Vị trí
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={gettingLocation}
                                        className="flex items-center gap-2 rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <LocateFixed size={17} />

                                        {gettingLocation
                                            ? "Đang lấy vị trí..."
                                            : "Vị trí của tôi"}
                                    </button>
                                </div>

                                {locationError && (
                                    <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {locationError}
                                    </div>
                                )}

                                {hasLocation ? (
                                    <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                                        <MapView
                                            placeLatitude={placeLatitude}
                                            placeLongitude={placeLongitude}
                                            userLocation={userLocation}
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-4 flex h-[450px] flex-col items-center justify-center rounded-2xl border bg-gray-100 text-gray-500">
                                        <MapPin
                                            size={40}
                                            className="mb-3"
                                        />
                                        <p>
                                            Địa điểm chưa có tọa độ bản đồ.
                                        </p>
                                    </div>
                                )}

                                {hasLocation && (
                                    <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Latitude địa điểm
                                                </p>

                                                <p className="mt-1 font-medium text-gray-700">
                                                    {placeLatitude}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Longitude địa điểm
                                                </p>

                                                <p className="mt-1 font-medium text-gray-700">
                                                    {placeLongitude}
                                                </p>
                                            </div>
                                        </div>

                                        {userLocation && (
                                            <div className="mt-4 border-t pt-4">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    📍 Vị trí hiện tại của bạn
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {userLocation.latitude.toFixed(
                                                        6
                                                    )}
                                                    ,{" "}
                                                    {userLocation.longitude.toFixed(
                                                        6
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* =================================================
                                    XEM ĐƯỜNG ĐI
                                ================================================= */}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!hasLocation) {
                                                alert(
                                                    "Địa điểm chưa có tọa độ."
                                                );
                                                return;
                                            }

                                            if (!userLocation) {
                                                alert(
                                                    "Vui lòng bấm 'Vị trí của tôi' trước để xác định vị trí hiện tại."
                                                );
                                                return;
                                            }

                                            navigate(
                                                `/map?lat=${placeLatitude}&lng=${placeLongitude}&userLat=${userLocation.latitude}&userLng=${userLocation.longitude}`
                                            );
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                                    >
                                        <Navigation size={18} />
                                        Xem đường đi
                                    </button>
                                </div>
                            </div>

                            {/* =================================================
                                ĐÁNH GIÁ
                            ================================================= */}
                            <div className="mt-10">
                                <h2 className="text-2xl font-bold">
                                    Đánh giá & bình luận
                                </h2>

                                <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-bold">
                                            {Number(place.rating) > 0
                                                ? Number(
                                                      place.rating
                                                  ).toFixed(1)
                                                : "0.0"}
                                        </span>

                                        <div>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(
                                                    (star) => (
                                                        <Star
                                                            key={star}
                                                            size={20}
                                                            className={
                                                                star <=
                                                                Math.round(
                                                                    Number(
                                                                        place.rating
                                                                    )
                                                                )
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {place.review_count || 0} đánh
                                                giá
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* =================================================
                                    FORM REVIEW
                                ================================================= */}
                                <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-bold">
                                        {myReview?.rating ||
                                        myReview?.comment
                                            ? "Đánh giá của bạn"
                                            : "Viết đánh giá"}
                                    </h3>

                                    {!isAuthenticated ? (
                                        <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center">
                                            <p className="text-gray-600">
                                                Bạn cần đăng nhập để đánh giá
                                                địa điểm này.
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate("/login")
                                                }
                                                className="mt-3 rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white transition hover:bg-orange-600"
                                            >
                                                Đăng nhập
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mt-5">
                                                <p className="mb-2 text-sm font-medium text-gray-700">
                                                    Mức độ đánh giá
                                                </p>

                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedRating(
                                                                        star
                                                                    )
                                                                }
                                                                className="rounded p-1 transition hover:scale-110"
                                                            >
                                                                <Star
                                                                    size={30}
                                                                    className={
                                                                        star <=
                                                                        selectedRating
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-gray-300"
                                                                    }
                                                                />
                                                            </button>
                                                        )
                                                    )}

                                                    {selectedRating > 0 && (
                                                        <span className="ml-3 text-sm text-gray-500">
                                                            {selectedRating}/5
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Bình luận
                                                </label>

                                                <textarea
                                                    value={comment}
                                                    onChange={(e) =>
                                                        setComment(
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
                                                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                                />
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveReview}
                                                    disabled={savingReview}
                                                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Star size={18} />

                                                    {savingReview
                                                        ? "Đang lưu..."
                                                        : myReview?.rating ||
                                                          myReview?.comment
                                                        ? "Cập nhật đánh giá"
                                                        : "Gửi đánh giá"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* =================================================
                                    COMMENT CỘNG ĐỒNG
                                ================================================= */}
                                <div className="mt-8">
                                    <h3 className="mb-4 text-lg font-bold">
                                        Bình luận từ cộng đồng
                                    </h3>

                                    <div className="space-y-4">
                                        {place.comments?.length > 0 ? (
                                            place.comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className="rounded-2xl bg-white p-5 shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold">
                                                            {comment.hoten}
                                                        </span>

                                                        <span className="text-xs text-gray-400">
                                                            {new Date(
                                                                comment.ngaytao
                                                            ).toLocaleDateString(
                                                                "vi-VN"
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="mt-3 text-gray-600">
                                                        {comment.noidung}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl bg-white p-6 text-center text-gray-500">
                                                Chưa có bình luận nào.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =====================================================
                            RIGHT - LẬP KẾ HOẠCH
                        ===================================================== */}
                        <div>
                            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold">
                                    Lập kế hoạch
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Thêm địa điểm này vào lịch trình của bạn để
                                    bắt đầu lên kế hoạch.
                                </p>

                                <button
    type="button"
    onClick={handleOpenSchedule}
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
>
    <Plus size={20} />
    Thêm vào lịch trình
</button>

                                <div className="mt-5 border-t pt-5 text-sm text-gray-500">
                                    <p>
                                        📍 {place.quanhuyen},{" "}
                                        {place.tinhthanh}
                                    </p>

                                    <p className="mt-2">
                                        💰{" "}
                                        {price === 0
                                            ? "Miễn phí"
                                            : `${price.toLocaleString(
                                                  "vi-VN"
                                              )}đ`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    MODAL CHỌN LỊCH TRÌNH
                ================================================= */}
                {openSchedule && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center">
                        
                        {/* Nền */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setOpenSchedule(false)}
                        />

                        {/* Modal */}
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
                                    ✕
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
                                            navigate("/create-schedule")
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
                                                    <span className="shrink-0 text-sm text-orange-500">
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
            </div>
        </Layout>
    );
}