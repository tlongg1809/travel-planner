import {
    Heart,
    MapPin,
    Wallet,
    Star
} from "lucide-react";


function PlaceCard({ place }) {

    const imageUrl = place.hinhanh
    ? `http://localhost/travel-planner/backend/uploads/${place.hinhanh}`
    : "/placeholder.jpg";


    const price = Number(place.giadukien || 0);

    const rating = Number(place.rating || 0);

    const reviewCount = Number(place.review_count || 0);


    // Chuyển chuỗi danh mục thành mảng
    const categories = place.categories
        ? place.categories.split(",")
        : [];


    return (

        <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

            {/* ================= HÌNH ẢNH ================= */}

            <div className="relative h-52 overflow-hidden">

                <img
                    src={imageUrl}
                    alt={place.tendiadiem}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />


                {/* Nút yêu thích */}

                <button
                    type="button"
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                >

                    <Heart
                        size={20}
                        className="text-gray-700"
                    />

                </button>


                {/* Danh mục */}

                {categories.length > 0 && (

                    <div className="absolute bottom-3 left-3 flex gap-2">

                        {categories.slice(0, 2).map((category) => (

                            <span
                                key={category}
                                className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
                            >
                                {category}
                            </span>

                        ))}

                    </div>

                )}

            </div>


            {/* ================= NỘI DUNG ================= */}

            <div className="p-4">


                {/* Tên */}

                <h3 className="line-clamp-1 text-lg font-bold text-gray-800">

                    {place.tendiadiem}

                </h3>


                {/* Rating */}

                <div className="mt-2 flex items-center gap-2">

                    <div className="flex items-center gap-1">

                        <Star
                            size={17}
                            className="fill-yellow-400 text-yellow-400"
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


                {/* Địa chỉ */}

                <div className="mt-3 flex gap-2 text-sm text-gray-500">

                    <MapPin
                        size={17}
                        className="mt-0.5 shrink-0"
                    />

                    <span className="line-clamp-2">

                        {place.diachi}

                    </span>

                </div>


                {/* Quận / thành phố */}

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">

                    <span>
                        {place.quanhuyen}
                    </span>

                    <span>•</span>

                    <span>
                        {place.tinhthanh}
                    </span>

                </div>


                {/* Giá */}

                <div className="mt-4 flex items-center gap-2 border-t pt-3">

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

            </div>

        </div>
    );
}


export default PlaceCard;