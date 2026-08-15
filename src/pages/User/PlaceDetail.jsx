import {
    useEffect,
    useState
} from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Wallet,
    Clock,
    Star,
    Plus,
    Navigation,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import {
    getPlaceDetail
} from "../../services/placeService";


export default function PlaceDetail() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] =
        useState(null);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");
    const [currentImage, setCurrentImage] =
        useState(0);

    // =====================================================
    // LẤY CHI TIẾT
    // =====================================================

    useEffect(() => {
        const loadPlaceDetail = async () => {
            try {
                setLoading(true);
                const res =
                    await getPlaceDetail(id);
                setPlace(res.data);
            } catch (error) {
                console.error(
                    "Lỗi lấy chi tiết địa điểm:",
                    error
                );
                setError(
                    "Không thể tải thông tin địa điểm."
                );
            } finally {
                setLoading(false);
            }
        };
        loadPlaceDetail();
    }, [id]);

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <Layout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <p className="text-gray-500">
                        Đang tải thông tin địa điểm...
                    </p>
                </div>
            </Layout>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error || !place) {
        return (
            <Layout>
                <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
                    <p className="text-gray-500">
                        {error ||
                            "Không tìm thấy địa điểm."}
                    </p>
                    <button
                        onClick={() =>
                            navigate("/")
                        }
                        className="rounded-lg bg-orange-500 px-5 py-2 text-white"
                    >
                        Về trang chủ
                    </button>
                </div>
            </Layout>
        );
    }

    // =====================================================
    // XỬ LÝ ẢNH
    // =====================================================

    const images =
        place.images || [];

    // =====================================================
    // ĐƯỜNG DẪN GOOGLE MAPS
    // =====================================================

    const hasLocation =
        Number(place.latitude) !== 0 &&
        Number(place.longitude) !== 0;

    const googleMapsUrl = hasLocation
        ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${place.tendiadiem}, ${place.diachi}, ${place.quanhuyen}, ${place.tinhthanh}`
        )}`;


    // =====================================================
    // GIÁ
    // =====================================================

    const price =
        Number(place.giadukien || 0);
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">

                {/* =================================================
                    BACK
                ================================================= */}
                <div className="px-10 pt-6">
                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex items-center gap-2 text-gray-600 transition hover:text-orange-500"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </button>
                </div>
                {/* =================================================
                    CONTENT
                ================================================= */}
                <div className="mx-auto max-w-7xl px-10 py-6">

                    {/* =================================================
                        GALLERY
                    ================================================= */}

                    <div className="grid grid-cols-4 gap-3 overflow-hidden rounded-3xl">
                        {/* ẢNH CHÍNH */}
                        <div className="relative col-span-2 row-span-2 h-[500px] overflow-hidden bg-gray-200">
                            {images.length > 0 ? (
                                <img
                                    src={`http://localhost/travel-planner/backend/uploads/${images[currentImage].url}`}
                                    alt={place.tendiadiem}
                                    className="h-full w-full object-cover"
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
                                        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
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
                                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* ẢNH PHỤ */}
                        {[0, 1, 2, 3].map(
                            (index) => {
                                const image =
                                    images[index];
                                if (!image) {
                                    return (
                                        <div
                                            key={index}
                                            className="h-[245px] bg-gray-200"
                                        />
                                    );
                                }
                                return (
                                    <button
                                        key={image.id}
                                        onClick={() =>
                                            setCurrentImage(
                                                index
                                            )
                                        }
                                        className="h-[245px] overflow-hidden"
                                    >
                                        <img
                                            src={`http://localhost/travel-planner/backend/uploads/${image.url}`}
                                            alt=""
                                            className={`h-full w-full object-cover transition ${
                                                currentImage === index
                                                    ? "opacity-70"
                                                    : "hover:scale-105"
                                            }`}
                                        />
                                    </button>
                                );
                            }
                        )}
                    </div>

                    {/* =================================================
                        THÔNG TIN
                    ================================================= */}
                    <div className="mt-8 grid grid-cols-3 gap-8">
                        {/* LEFT */}
                        <div className="col-span-2">
                            <h1 className="text-4xl font-bold text-gray-900">
                                {place.tendiadiem}
                            </h1>
                            {/* Rating */}
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star
                                        size={20}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                    <span className="font-semibold">
                                        {Number(place.rating) > 0
                                            ? Number(place.rating).toFixed(1)
                                            : "Chưa có"
                                        }
                                    </span>
                                </div>
                                <span className="text-gray-500">

                                    ({place.review_count || 0} đánh giá)
                                </span>
                            </div>
                            {/* Địa chỉ */}
                            <div className="mt-5 flex items-start gap-3 text-gray-600">
                                <MapPin
                                    size={20}
                                    className="mt-1 shrink-0 text-orange-500"
                                />
                                <div>
                                    <p>
                                        {place.diachi}
                                    </p>
                                    <p className="mt-1">
                                        {place.quanhuyen}
                                        {" • "}
                                        {place.tinhthanh}
                                    </p>
                                </div>
                            </div>
                            {/* Giá */}
                            <div className="mt-4 flex items-center gap-3 text-gray-600">
                                <Wallet
                                    size={20}
                                    className="text-blue-600"
                                />
                                <span className="font-semibold">
                                    {price === 0
                                        ? "Miễn phí"
                                        : `${price.toLocaleString("vi-VN")}đ`
                                    }
                                </span>
                            </div>
                            {/* Thời gian */}
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
                            {/* MÔ TẢ */}
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
                                GOOGLE MAPS
                            ================================================= */}

                            <div className="mt-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">
                                        Vị trí
                                    </h2>
                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                                    >
                                        <Navigation size={17} />
                                        Xem đường đi
                                    </a>
                                </div>
                                <div className="mt-4 overflow-hidden rounded-2xl border bg-gray-200">
                                    {hasLocation ? (
                                        <iframe
                                            title="Google Maps"
                                            src={`https://www.google.com/maps?q=${place.latitude},${place.longitude}&output=embed`}
                                            className="h-[400px] w-full border-0"
                                            loading="lazy"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="flex h-[400px] flex-col items-center justify-center text-gray-500">
                                            <MapPin
                                                size={40}
                                                className="mb-3"
                                            />
                                            <p>
                                                Địa điểm chưa có tọa độ bản đồ.
                                            </p>
                                            <a
                                                href={googleMapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 text-orange-500 hover:underline"
                                            >
                                                Tìm địa điểm trên Google Maps
                                            </a>
                                        </div>
                                    )}
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
                                                ? Number(place.rating).toFixed(1)
                                                : "0.0"
                                            }
                                        </span>
                                        <div>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(
                                                    (star) => (
                                                        <Star
                                                            key={star}
                                                            size={20}
                                                            className={
                                                                star <= Math.round(
                                                                    Number(place.rating)
                                                                )
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {place.review_count || 0}
                                                {" "}
                                                đánh giá
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* COMMENTS */}
                                <div className="mt-5 space-y-4">
                                    {place.comments?.length > 0 ? (
                                        place.comments.map(
                                            (comment) => (
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
                                            )
                                        )
                                    ) : (
                                        <div className="rounded-2xl bg-white p-6 text-center text-gray-500">
                                            Chưa có bình luận nào.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            RIGHT - ACTION
                        ================================================= */}
                        <div>
                            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold">
                                    Lập kế hoạch
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Thêm địa điểm này vào lịch trình
                                    của bạn để bắt đầu lên kế hoạch.
                                </p>
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/create-schedule?placeId=${place.id}`
                                        )
                                    }
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
                                            : `${price.toLocaleString("vi-VN")}đ`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}