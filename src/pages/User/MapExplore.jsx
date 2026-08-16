import { useEffect, useMemo, useState } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Tooltip,
} from "react-leaflet";

import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPlaces } from "../../services/placeService";

const CITY_KEY = "travel_planner_selected_city";
const DISTRICT_KEY = "travel_planner_selected_district";

const UPLOADS_URL =
    "http://localhost/travel-planner/backend/uploads";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function getSelectedCity() {
    return localStorage.getItem(CITY_KEY) || "";
}

function getSelectedDistrict() {
    return localStorage.getItem(DISTRICT_KEY) || "";
}

function getImageUrl(url) {
    if (!url) return "";

    const imageUrl = String(url).trim();

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    let cleanUrl = imageUrl.replace(/^\/+/, "");
    cleanUrl = cleanUrl.replace(/^uploads\//i, "");

    return `${UPLOADS_URL}/${cleanUrl}`;
}

function PlacePopup({ place, onViewDetail }) {
    const imageUrl = getImageUrl(place.hinhanh);
    const rating = Number(place.rating || 0);
    const reviewCount = Number(place.review_count || 0);
    const price = Number(place.giadukien || 0);

    return (
        <div className="w-[280px]">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={place.tendiadiem || "Địa điểm"}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                    onError={(event) => {
                        console.error(
                            "Không thể tải ảnh:",
                            event.currentTarget.src
                        );
                        event.currentTarget.style.display = "none";
                    }}
                />
            )}

            <h3 className="text-base font-bold text-gray-900">
                {place.tendiadiem}
            </h3>

            {place.diachi && (
                <p className="mt-2 text-sm text-gray-600">
                    📍 {place.diachi}
                </p>
            )}

            {place.quanhuyen && (
                <p className="mt-1 text-sm text-gray-500">
                    {place.quanhuyen}
                    {place.tinhthanh ? `, ${place.tinhthanh}` : ""}
                </p>
            )}

            {!place.quanhuyen && place.tinhthanh && (
                <p className="mt-1 text-sm text-gray-500">
                    {place.tinhthanh}
                </p>
            )}

            <div className="mt-3 flex items-center gap-2">
                <span className="font-semibold text-yellow-500">
                    ⭐ {rating > 0 ? rating.toFixed(1) : "Chưa có"}
                </span>

                {reviewCount > 0 && (
                    <span className="text-xs text-gray-500">
                        ({reviewCount} đánh giá)
                    </span>
                )}
            </div>

            {price > 0 ? (
                <p className="mt-2 text-sm font-medium text-gray-700">
                    💰 {price.toLocaleString("vi-VN")} VNĐ
                </p>
            ) : (
                <p className="mt-2 text-sm font-medium text-green-600">
                    💰 Miễn phí
                </p>
            )}

            {place.mota && (
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {place.mota}
                </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
                📌 {Number(place.latitude).toFixed(6)}
                {" , "}
                {Number(place.longitude).toFixed(6)}
            </p>

            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onViewDetail(place.id);
                }}
                className="mt-4 w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
                Xem chi tiết địa điểm
            </button>
        </div>
    );
}

function ExploreMap({ places, selectedCity, onViewDetail }) {
    // Tạm cố định trung tâm ở Cần Thơ để kiểm tra marker.
    const initialCenter = [10.0452, 105.7469];

    return (
        <div className="relative h-[650px] w-full overflow-hidden">
            <MapContainer
                key={selectedCity}
                center={initialCenter}
                zoom={12}
                minZoom={10}
                maxZoom={18}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
                whenReady={(event) => {
                    setTimeout(() => {
                        event.target.invalidateSize();
                    }, 100);
                }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {places.map((place) => {
                    const latitude = Number(place.latitude);
                    const longitude = Number(place.longitude);

                    return (
                        <Marker
                            key={place.id}
                            position={[latitude, longitude]}
                        >
                            <Tooltip
                                permanent
                                direction="top"
                                offset={[0, -35]}
                                opacity={0.95}
                            >
                                <span className="font-semibold text-gray-800">
                                    {place.tendiadiem}
                                </span>
                            </Tooltip>

                            <Popup>
                                <PlacePopup
                                    place={place}
                                    onViewDetail={onViewDetail}
                                />
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default function MapExplore() {
    const navigate = useNavigate();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedCity, setSelectedCity] = useState(
        getSelectedCity()
    );

    const [selectedDistrict, setSelectedDistrict] = useState(
        getSelectedDistrict()
    );

    useEffect(() => {
        const handleLocationChanged = (event) => {
            const city = event.detail?.city;
            const district = event.detail?.district;

            console.log("MapExplore nhận thay đổi:", {
                city,
                district,
            });

            if (city !== undefined) {
                setSelectedCity(city);
            }

            if (district !== undefined) {
                setSelectedDistrict(district);
            }
        };

        window.addEventListener(
            "locationChanged",
            handleLocationChanged
        );

        const handleFocus = () => {
            const city = getSelectedCity();
            const district = getSelectedDistrict();

            if (city !== selectedCity) {
                setSelectedCity(city);
            }

            if (district !== selectedDistrict) {
                setSelectedDistrict(district);
            }
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener(
                "locationChanged",
                handleLocationChanged
            );
            window.removeEventListener("focus", handleFocus);
        };
    }, [selectedCity, selectedDistrict]);

    useEffect(() => {
        let cancelled = false;

        const loadPlaces = async () => {
            try {
                setLoading(true);
                setError("");

                console.log("================================");
                console.log("MAP - ĐANG LẤY ĐỊA ĐIỂM");
                console.log("Tỉnh:", selectedCity);
                console.log("Quận/Huyện:", selectedDistrict);

                if (!selectedCity) {
                    setPlaces([]);
                    setLoading(false);
                    return;
                }

                // Tạm thời chỉ lọc theo tỉnh, không gửi quận/huyện.
                const response = await getPlaces({
                    tinhthanh: selectedCity,
                    includeHidden: false,
                });

                if (cancelled) return;

                console.log("===== MAP DEBUG =====");
                console.log("Tỉnh đang chọn:", selectedCity);
                console.log("Response:", response);

                const data = response?.data;

                console.log("Data:", data);
                console.log(
                    "Số địa điểm:",
                    Array.isArray(data) ? data.length : 0
                );

                if (Array.isArray(data)) {
                    setPlaces(data);
                } else {
                    setPlaces([]);
                }
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "MAP - LỖI LẤY ĐỊA ĐIỂM:",
                    err
                );

                setError("Không thể tải danh sách địa điểm.");
                setPlaces([]);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadPlaces();

        return () => {
            cancelled = true;
        };
    }, [selectedCity, selectedDistrict]);

    const validPlaces = useMemo(() => {
        return places.filter((place) => {
            const latitude = Number(place.latitude);
            const longitude = Number(place.longitude);

            const valid =
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180;

            if (!valid) {
                console.warn(
                    "MAP - Địa điểm không có tọa độ hợp lệ:",
                    place
                );
            }

            return valid;
        });
    }, [places]);

    const handleViewDetail = (placeId) => {
        if (!placeId) {
            console.error(
                "Không có ID địa điểm:",
                placeId
            );
            return;
        }

        navigate(`/places/${placeId}`);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="border-b bg-white px-6 py-5 shadow-sm">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    🗺️ Bản đồ khám phá
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Khám phá các địa điểm trên bản đồ
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 px-4 py-3">
                                <p className="text-xs text-gray-500">
                                    Khu vực
                                </p>

                                <p className="mt-1 font-semibold text-blue-700">
                                    📍 {selectedCity || "Chưa chọn"}

                                    {selectedDistrict && (
                                        <span>
                                            {" - "}
                                            {selectedDistrict}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-6 py-6">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="relative h-[650px] w-full">
                            {loading && (
                                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white">
                                    <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
                                        <p className="text-sm font-medium text-gray-700">
                                            Đang tải địa điểm...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!loading && validPlaces.length > 0 && (
                                <ExploreMap
                                    places={validPlaces}
                                    selectedCity={selectedCity}
                                    onViewDetail={handleViewDetail}
                                />
                            )}

                            {!loading &&
                                !error &&
                                validPlaces.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <div className="rounded-xl bg-white px-6 py-5 text-center shadow">
                                            <p className="text-sm font-medium text-gray-700">
                                                Không có địa điểm có tọa độ trong khu vực này.
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Tỉnh:{" "}
                                                {selectedCity || "Chưa chọn"}

                                                {selectedDistrict && (
                                                    <>
                                                        {" | Huyện: "}
                                                        {selectedDistrict}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                        </div>

                        <div className="flex items-center justify-between border-t bg-white px-5 py-3">
                            <p className="text-sm text-gray-500">
                                📍 Nhấn vào marker để xem thông tin địa điểm
                            </p>

                            <p className="text-xs text-gray-400">
                                {validPlaces.length} địa điểm
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}