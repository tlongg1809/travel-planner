import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, Route } from "lucide-react";

import MapView from "../../components/Map/MapView";

export default function MapPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    const userLat = Number(searchParams.get("userLat"));
    const userLng = Number(searchParams.get("userLng"));

    const hasPlace =
        Number.isFinite(lat) &&
        Number.isFinite(lng);

    const hasUser =
        Number.isFinite(userLat) &&
        Number.isFinite(userLng);

    if (!hasPlace) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                        <MapPin
                            size={28}
                            className="text-red-500"
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-800">
                        Không có tọa độ địa điểm
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Vui lòng quay lại trang địa điểm và thử lại.
                    </p>

                    <button
                        onClick={() => navigate("/explore")}
                        className="mt-6 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                        Quay lại khám phá
                    </button>
                </div>
            </div>
        );
    }

    const userLocation = hasUser
        ? {
            latitude: userLat,
            longitude: userLng,
        }
        : null;

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/explore");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">

            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
                <div className="flex h-20 items-center justify-between px-6">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={handleBack}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-orange-500"
                            title="Quay lại"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <Navigation
                                    size={21}
                                    className="text-orange-500"
                                />

                                <h1 className="text-xl font-bold text-slate-800">
                                    Chỉ đường
                                </h1>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Tìm đường từ vị trí của bạn đến địa điểm
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <ArrowLeft size={17} />
                        Quay lại
                    </button>

                </div>
            </header>


            {/* ================= CONTENT ================= */}
            <main className="mx-auto max-w-7xl px-6 py-6">

                {/* ================= ROUTE INFO ================= */}
                <div className="mb-5 grid gap-4 md:grid-cols-3">

                    {/* Điểm xuất phát */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                                <Navigation
                                    size={21}
                                    className="text-blue-600"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-400">
                                    Điểm xuất phát
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    Vị trí của bạn
                                </p>
                            </div>

                        </div>

                        {hasUser && (
                            <p className="mt-3 text-xs text-slate-400">
                                {userLat.toFixed(6)}, {userLng.toFixed(6)}
                            </p>
                        )}

                    </div>


                    {/* Đường đi */}
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                                <Route
                                    size={21}
                                    className="text-orange-500"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-orange-400">
                                    Tuyến đường
                                </p>

                                <p className="mt-1 font-semibold text-orange-700">
                                    Đường đi tối ưu
                                </p>
                            </div>

                        </div>

                        <p className="mt-3 text-xs text-orange-600">
                            Tuyến đường được hiển thị trực tiếp trên bản đồ.
                        </p>

                    </div>


                    {/* Điểm đến */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                                <MapPin
                                    size={21}
                                    className="text-red-500"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-400">
                                    Điểm đến
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                    Địa điểm cần đến
                                </p>
                            </div>

                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                            {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>

                    </div>

                </div>


                {/* ================= MAP ================= */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">

                    {/* Map header */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

                        <div>
                            <h2 className="font-semibold text-slate-800">
                                Bản đồ chỉ đường
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Tuyến đường từ vị trí hiện tại đến điểm đến
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Đang chỉ đường
                        </div>

                    </div>


                    {/* Map */}
                    <div className="h-[600px] w-full">

                        <MapView
                            placeLatitude={lat}
                            placeLongitude={lng}
                            userLocation={userLocation}
                            showRoute={true}
                        />

                    </div>

                </div>

            </main>

        </div>
    );
}