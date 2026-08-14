import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
const API_URL = "http://localhost:5000/api";
/* =========================================================
   MAP CONTROLLER
   ========================================================= */
function MapController({ position }) {
    const map = useMap();
    useEffect(() => {
        if (!position) return;
        map.flyTo(position, 16, {
            duration: 1,
        });
    }, [position, map]);
    return null;
}
/* =========================================================
   CLICK MAP
   ========================================================= */
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            console.log("Click map:", {
                latitude: lat,
                longitude: lng,
            });
            onLocationSelect({
                latitude: lat,
                longitude: lng,
            });
        },
    });
    return null;
}
/* =========================================================
   MAP PICKER
   ========================================================= */
function MapPicker({
    onLocationSelect,
    latitude,
    longitude,
}) {
    const defaultPosition = [
        10.0322715,
        105.7882308,
    ];
    const [position, setPosition] = useState(
        latitude && longitude
            ? [Number(latitude), Number(longitude)]
            : defaultPosition
    );
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState("");
    /* =====================================================
       FORM → MAP
       ===================================================== */
    useEffect(() => {
        if (
            latitude !== "" &&
            longitude !== "" &&
            latitude != null &&
            longitude != null
        ) {
            setPosition([
                Number(latitude),
                Number(longitude),
            ]);
        }
    }, [latitude, longitude]);
    /* =====================================================
       CLICK MAP
       ===================================================== */
    const handleLocationSelect = (location) => {
        const newPosition = [
            location.latitude,
            location.longitude,
        ];
        setPosition(newPosition);
        setSelectedAddress("");
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    };
    /* =====================================================
       SEARCH GOGODUK
       ===================================================== */
    const handleSearch = async () => {
        if (search.trim().length < 2) {
            return;
        }
        try {
            setSearching(true);
            const response = await fetch(
                `${API_URL}/gogoduk/search?input=${encodeURIComponent(
                    search
                )}`
            );
            if (!response.ok) {
                throw new Error("Không thể tìm địa điểm");
            }
            const data = await response.json();
            console.log("GoGoDuk Search:", data);
            setResults(data);
        } catch (error) {
            console.error("Search GoGoDuk:", error);
            setResults([]);
        } finally {
            setSearching(false);
        }
    };
    /* =====================================================
       CHỌN KẾT QUẢ SEARCH
       ===================================================== */
    const handleSelectPlace = async (place) => {
        try {
            setSearching(true);
            const response = await fetch(
                `${API_URL}/gogoduk/resolve?placeId=${encodeURIComponent(
                    place.placeId
                )}`
            );
            if (!response.ok) {
                throw new Error("Không thể lấy thông tin địa điểm");
            }
            const data = await response.json();
            console.log("GoGoDuk Resolve:", data);
            const result = data.result;
            if (!result) {
                throw new Error("Không có dữ liệu địa điểm");
            }
            const lat = Number(result.lat);
            const lng = Number(result.lon);
            const newPosition = [
                lat,
                lng,
            ];
            /* MAP */
            setPosition(newPosition);
            /* ĐỊA CHỈ */
            setSelectedAddress(
                result.address || result.name || ""
            );
            /* CLEAR SEARCH */
            setResults([]);
            /* TRẢ DỮ LIỆU VỀ FORM */
            if (onLocationSelect) {
                onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address: result.address || result.name || "",
                    district: result.district || "",
                    province: result.city || "",
                    placeId: result.placeId || place.placeId,
                });
            }
        } catch (error) {
            console.error("Resolve GoGoDuk:", error);
        } finally {
            setSearching(false);
        }
    };
    return (
        <div className="space-y-3">
            {/* =================================================
                SEARCH
               ================================================= */}
            <div className="relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                        placeholder="Nhập tên hoặc địa chỉ địa điểm..."
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={searching}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {searching ? "Đang tìm..." : "Tìm"}
                    </button>
                </div>
                {/* SEARCH RESULTS */}
                {results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-[1000] mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                        {results.map((place) => (
                            <button
                                type="button"
                                key={place.placeId}
                                onClick={() => handleSelectPlace(place)}
                                className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50"
                            >
                                <p className="text-sm font-medium text-slate-800">
                                    {place.mainText || place.text}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {place.secondaryText || ""}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {/* =================================================
                MAP
               ================================================= */}
            <MapContainer
                center={position}
                zoom={15}
                style={{
                    width: "100%",
                    height: "400px",
                    borderRadius: "12px",
                }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController
                    position={position}
                />
                <MapClickHandler
                    onLocationSelect={handleLocationSelect}
                />
                <Marker position={position}>
                    <Popup>
                        <strong>
                            Vị trí đã chọn
                        </strong>
                        <br />
                        Latitude: {position[0]}
                        <br />
                        Longitude: {position[1]}
                    </Popup>
                </Marker>
            </MapContainer>
            {/* =================================================
                INFO
               ================================================= */}
            <div className="rounded-lg bg-slate-50 p-3">
                {selectedAddress && (
                    <div className="mb-2">
                        <p className="text-xs text-slate-400">
                            Địa chỉ tìm được
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                            {selectedAddress}
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-slate-400">
                            Latitude
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                            {position[0]}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">
                            Longitude
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                            {position[1]}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MapPicker;