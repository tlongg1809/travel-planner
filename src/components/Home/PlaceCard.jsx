import { MapPin, Ticket } from "lucide-react";

export default function PlaceCard({ place }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl duration-300 overflow-hidden">

      <img
        src={`http://localhost/travel-planner/backend/uploads/${place.hinhanh}`}
        alt={place.tendiadiem}
        className="w-full h-52 object-cover"
      />

      <div className="p-4">

        <h3 className="font-bold text-lg">
          {place.tendiadiem}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <MapPin size={16} />
          <span>{place.quanhuyen}</span>
        </div>

        <div className="flex items-center gap-2 mt-2 text-orange-500">
          <Ticket size={16} />
          <span>
            {Number(place.giadukien).toLocaleString()} đ
          </span>
        </div>

      </div>

    </div>
  );
}