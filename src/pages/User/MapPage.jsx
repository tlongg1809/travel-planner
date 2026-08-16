import { useSearchParams } from "react-router-dom";

import MapView from "../../components/Map/MapView";


export default function MapPage() {

    const [searchParams] = useSearchParams();


    const lat =
        Number(searchParams.get("lat"));

    const lng =
        Number(searchParams.get("lng"));

    const userLat =
        Number(searchParams.get("userLat"));

    const userLng =
        Number(searchParams.get("userLng"));


    const hasPlace =
        Number.isFinite(lat) &&
        Number.isFinite(lng);


    const hasUser =
        Number.isFinite(userLat) &&
        Number.isFinite(userLng);


    if (!hasPlace) {

        return (

            <div className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-gray-50
            ">

                <div className="
                    rounded-xl
                    bg-white
                    p-8
                    text-center
                    shadow
                ">

                    <p className="text-lg font-semibold text-red-500">

                        Không có tọa độ địa điểm.

                    </p>

                    <p className="mt-2 text-sm text-gray-500">

                        Vui lòng quay lại trang địa điểm.

                    </p>

                </div>

            </div>

        );

    }


    const userLocation = hasUser
        ? {
            latitude: userLat,
            longitude: userLng
        }
        : null;


    return (

        <div className="min-h-screen bg-gray-100">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                flex
                items-center
                justify-between
                bg-white
                px-6
                py-4
                shadow
            ">

                <div>

                    <h1 className="
                        text-xl
                        font-bold
                        text-gray-900
                    ">

                        🗺️ Chỉ đường

                    </h1>

                    <p className="
                        mt-1
                        text-sm
                        text-gray-500
                    ">

                        Tuyến đường từ vị trí của bạn đến địa điểm

                    </p>

                </div>


                <button

                    onClick={() => window.close()}

                    className="
                        rounded-lg
                        border
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-gray-600
                        hover:bg-gray-50
                    "

                >

                    Đóng

                </button>

            </div>


            {/* =================================================
                MAP
            ================================================= */}

            <div className="p-6">

                <div className="
                    mx-auto
                    max-w-7xl
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow
                ">

                    <MapView

                        placeLatitude={lat}

                        placeLongitude={lng}

                        userLocation={
                            userLocation
                        }

                        showRoute={true}

                    />

                </div>

            </div>

        </div>

    );

}