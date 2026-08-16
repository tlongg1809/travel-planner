import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from "react-leaflet";

import { useEffect, useState } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";


// =====================================================
// FIX ICON LEAFLET
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// =====================================================
// ICON USER
// =====================================================

const userIcon = new L.Icon({
    iconUrl:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",

    iconSize: [38, 38],

    iconAnchor: [19, 38],

    popupAnchor: [0, -38],
});


// =====================================================
// TỰ ĐỘNG FIT MAP
// =====================================================

function MapController({
    placeLatitude,
    placeLongitude,
    userLocation,
    route
}) {
    const map = useMap();

    useEffect(() => {

        if (route && route.length > 0) {

            const bounds = L.latLngBounds(route);

            map.fitBounds(bounds, {
                padding: [60, 60]
            });

            return;
        }

        if (userLocation) {

            const bounds = L.latLngBounds([
                [
                    placeLatitude,
                    placeLongitude
                ],
                [
                    userLocation.latitude,
                    userLocation.longitude
                ]
            ]);

            map.fitBounds(bounds, {
                padding: [60, 60]
            });

        } else {

            map.setView(
                [
                    placeLatitude,
                    placeLongitude
                ],
                15
            );
        }

    }, [
        map,
        placeLatitude,
        placeLongitude,
        userLocation,
        route
    ]);

    return null;
}


// =====================================================
// LẤY ĐƯỜNG ĐI OSRM
// =====================================================

function RouteController({
    placeLatitude,
    placeLongitude,
    userLocation,
    setRoute,
    setRouteInfo
}) {

    useEffect(() => {

        if (!userLocation) {

            setRoute([]);
            setRouteInfo(null);

            return;
        }

        const getRoute = async () => {

            try {

                /*
                 * OSRM dùng:
                 * longitude,latitude
                 *
                 * Vị trí user -> địa điểm
                 */

                const start =
                    `${userLocation.longitude},${userLocation.latitude}`;

                const end =
                    `${placeLongitude},${placeLatitude}`;

                const url =
                    `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

                console.log("ĐANG LẤY ĐƯỜNG ĐI:", url);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        `OSRM HTTP ${response.status}`
                    );
                }

                const data = await response.json();

                console.log("OSRM RESPONSE:", data);

                if (
                    data.code !== "Ok" ||
                    !data.routes ||
                    data.routes.length === 0
                ) {

                    console.error(
                        "Không tìm thấy tuyến đường."
                    );

                    setRoute([]);
                    setRouteInfo(null);

                    return;
                }

                const routeData = data.routes[0];

                /*
                 * OSRM trả:
                 * [longitude, latitude]
                 *
                 * Leaflet cần:
                 * [latitude, longitude]
                 */

                const coordinates =
                    routeData.geometry.coordinates.map(
                        ([longitude, latitude]) => [
                            latitude,
                            longitude
                        ]
                    );

                setRoute(coordinates);

                setRouteInfo({
                    distance:
                        routeData.distance,

                    duration:
                        routeData.duration
                });

            } catch (error) {

                console.error(
                    "LỖI LẤY ĐƯỜNG ĐI:",
                    error
                );

                setRoute([]);
                setRouteInfo(null);
            }

        };

        getRoute();

    }, [
        placeLatitude,
        placeLongitude,
        userLocation,
        setRoute,
        setRouteInfo
    ]);

    return null;
}


// =====================================================
// MAP
// =====================================================

export default function MapView({

    placeLatitude,

    placeLongitude,

    userLocation,

    showRoute = true

}) {

    const [route, setRoute] = useState([]);

    const [routeInfo, setRouteInfo] = useState(null);


    return (

        <div className="relative h-[450px] w-full">

            <MapContainer

                center={[
                    placeLatitude,
                    placeLongitude
                ]}

                zoom={15}

                scrollWheelZoom={true}

                className="h-full w-full"

            >

                {/* =================================================
                    OPEN STREET MAP
                ================================================= */}

                <TileLayer

                    attribution='&copy; OpenStreetMap contributors'

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* =================================================
                    ĐỊA ĐIỂM
                ================================================= */}

                <Marker

                    position={[

                        placeLatitude,

                        placeLongitude

                    ]}

                >

                    <Popup>

                        <strong>
                            📍 Địa điểm cần đến
                        </strong>

                        <br />

                        Vị trí đích.

                    </Popup>

                </Marker>


                {/* =================================================
                    USER
                ================================================= */}

                {userLocation && (

                    <Marker

                        position={[

                            userLocation.latitude,

                            userLocation.longitude

                        ]}

                        icon={userIcon}

                    >

                        <Popup>

                            <strong>
                                👤 Vị trí của bạn
                            </strong>

                            <br />

                            Điểm xuất phát.

                        </Popup>

                    </Marker>

                )}


                {/* =================================================
                    LẤY ROUTE
                ================================================= */}

                {showRoute && userLocation && (

                    <RouteController

                        placeLatitude={
                            placeLatitude
                        }

                        placeLongitude={
                            placeLongitude
                        }

                        userLocation={
                            userLocation
                        }

                        setRoute={
                            setRoute
                        }

                        setRouteInfo={
                            setRouteInfo
                        }

                    />

                )}


                {/* =================================================
                    VẼ ĐƯỜNG ĐI
                ================================================= */}

                {route.length > 0 && (

                    <Polyline

                        positions={route}

                        pathOptions={{
                            color: "#2563eb",
                            weight: 6,
                            opacity: 0.8
                        }}

                    />

                )}


                {/* =================================================
                    FIT MAP
                ================================================= */}

                <MapController

                    placeLatitude={
                        placeLatitude
                    }

                    placeLongitude={
                        placeLongitude
                    }

                    userLocation={
                        userLocation
                    }

                    route={
                        route
                    }

                />

            </MapContainer>


            {/* =====================================================
                THÔNG TIN ĐƯỜNG ĐI
            ===================================================== */}

            {routeInfo && (

                <div className="
                    absolute
                    left-4
                    top-4
                    z-[1000]
                    rounded-xl
                    bg-white
                    px-4
                    py-3
                    shadow-lg
                ">

                    <p className="text-sm font-semibold text-gray-800">

                        🚗 Đường đi

                    </p>

                    <p className="mt-1 text-sm text-gray-600">

                        Khoảng cách:{" "}

                        {(
                            routeInfo.distance / 1000
                        ).toFixed(1)}

                        {" "}km

                    </p>

                    <p className="text-sm text-gray-600">

                        Thời gian:{" "}

                        {Math.round(
                            routeInfo.duration / 60
                        )}

                        {" "}phút

                    </p>

                </div>

            )}

        </div>

    );

}