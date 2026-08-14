import { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { getPlaces } from "../../services/placeService";

export default function SearchBox() {

    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);


    // ==========================================
    // TÌM KIẾM
    // ==========================================

    useEffect(() => {

        if (!keyword.trim()) {

            setResults([]);
            setShowResults(false);

            return;
        }


        const timer = setTimeout(async () => {

            try {

                setLoading(true);

                const res = await getPlaces({

                    search: keyword.trim(),

                    // chỉ lấy một số kết quả để hiện dropdown
                    limit: 5

                });


                setResults(
                    Array.isArray(res.data)
                        ? res.data
                        : []
                );

                setShowResults(true);

            } catch (error) {

                console.error(
                    "Lỗi tìm kiếm:",
                    error
                );

                setResults([]);

            } finally {

                setLoading(false);

            }

        }, 400);


        return () => clearTimeout(timer);

    }, [keyword]);


    // ==========================================
    // CLICK ĐỊA ĐIỂM
    // ==========================================

    const handleSelectPlace = (place) => {

        console.log(
            "Đã chọn địa điểm:",
            place
        );

        // Tạm thời
        // Sau này sẽ:
        // navigate(`/places/${place.id}`);

        setKeyword(place.tendiadiem);

        setShowResults(false);

    };


    return (

        <div className="relative w-[450px]">


            {/* ============================
                SEARCH INPUT
            ============================ */}

            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">

                <Search
                    size={18}
                    className="text-gray-500 shrink-0"
                />


                <input

                    type="text"

                    placeholder="Tìm kiếm địa điểm..."

                    value={keyword}

                    onChange={(e) => {

                        setKeyword(
                            e.target.value
                        );

                    }}

                    onFocus={() => {

                        if (results.length > 0) {
                            setShowResults(true);
                        }

                    }}

                    className="flex-1 ml-3 bg-transparent outline-none"

                />

            </div>


            {/* ============================
                KẾT QUẢ
            ============================ */}

            {showResults && (

                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border overflow-hidden">


                    {loading && (

                        <div className="px-5 py-4 text-sm text-gray-500">

                            Đang tìm kiếm...

                        </div>

                    )}


                    {!loading &&
                        results.length === 0 && (

                            <div className="px-5 py-4 text-sm text-gray-500">

                                Không tìm thấy địa điểm.

                            </div>

                        )
                    }


                    {!loading &&
                        results.length > 0 &&
                        results.map((place) => (

                            <button

                                key={place.id}

                                type="button"

                                onClick={() =>
                                    handleSelectPlace(
                                        place
                                    )
                                }

                                className="w-full text-left px-5 py-4 hover:bg-gray-50 transition border-b last:border-b-0"

                            >

                                <div className="flex items-start gap-3">

                                    <MapPin
                                        size={20}
                                        className="text-orange-500 mt-1 shrink-0"
                                    />

                                    <div className="min-w-0">

    {/* Tên địa điểm */}
    <p className="font-semibold text-gray-800 truncate">
        {place.tendiadiem}
    </p>


    {/* Địa chỉ */}
    {place.diachi && (
        <p className="text-sm text-gray-600 mt-1 truncate">
            📌 {place.diachi}
        </p>
    )}


    {/* Quận / huyện - tỉnh / thành */}
    <p className="text-xs text-gray-400 mt-1">
        {place.quanhuyen}
        {" • "}
        {place.tinhthanh}
    </p>

</div>

                                </div>

                            </button>

                        ))
                    }

                </div>

            )}

        </div>

    );

}