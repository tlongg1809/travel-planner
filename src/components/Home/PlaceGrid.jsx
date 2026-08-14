import { useMemo, useRef, useState } from "react";
import PlaceCard from "./PlaceCard";
const ITEMS_PER_PAGE = 16; // 4 x 4

export default function PlaceGrid({
  places = [],
  favoriteIds = [],
  onFavoriteChange,
  onRequireLogin,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef(null); //nhảy lên đầu trnag

  const totalPages = Math.ceil(places.length / ITEMS_PER_PAGE);

  const currentPlaces = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return places.slice(start, start + ITEMS_PER_PAGE);
  }, [places, currentPage]);

  // lên đầu khii đổi trang
  const changePage = (page) => {
    setCurrentPage(page);

    setTimeout(() => {
        gridRef.current?.scrollIntoView({
        behavior: "smooth",
        top 
        });
    }, 0);
};

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isFavorite={favoriteIds.includes(place.id)}
            onFavoriteChange={onFavoriteChange}
            onRequireLogin={onRequireLogin}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => changePage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            ← Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => changePage(i + 1)}
              className={`cursor-pointer px-4 py-2 rounded-lg border ${
                currentPage === i + 1
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            Sau →
          </button>
        </div>
      )}
    </>
  );
}