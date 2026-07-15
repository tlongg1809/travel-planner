import { Heart, MapPin, Star } from "lucide-react";

export default function PlaceCard({ place }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group cursor-pointer">

      {/* Ảnh */}
      <div className="relative h-52 overflow-hidden">

        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* Rating */}
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star size={14} fill="white" />
          {place.rating}
        </div>

        {/* Favorite */}
        <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow">
          <Heart size={18} />
        </button>

      </div>

      {/* Nội dung */}
      <div className="p-4">

        <h3 className="font-bold text-lg">
          {place.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <MapPin size={16} />
          <span>{place.address}</span>
        </div>

        <p className="mt-3 text-orange-600 font-semibold">
          {place.price}
        </p>

      </div>

    </div>
  );
}