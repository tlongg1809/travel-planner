import Sidebar from "../components/Layout/Sidebar";
import Header from "../components/Layout/Header";
import { Fullscreen } from "lucide-react";
import Hero from "../components/Home/Hero"
import PlaceCard from "../components/Home/PlaceCard";

const places = [
  {
    id: 1,
    name: "Bến Ninh Kiều",
    image: "https://picsum.photos/400/300?random=1",
    address: "Ninh Kiều, Cần Thơ",
    rating: 4.9,
    price: "Miễn phí",
  },
  {
    id: 2,
    name: "Chợ nổi Cái Răng",
    image: "https://picsum.photos/400/300?random=2",
    address: "Cái Răng, Cần Thơ",
    rating: 4.8,
    price: "50.000đ",
  },
  {
    id: 3,
    name: "Làng du lịch Mỹ Khánh",
    image: "https://picsum.photos/400/300?random=3",
    address: "Phong Điền, Cần Thơ",
    rating: 4.7,
    price: "120.000đ",
  },
  {
    id: 4,
    name: "Highlands Coffee",
    image: "https://picsum.photos/400/300?random=4",
    address: "Vincom Xuân Khánh",
    rating: 4.6,
    price: "45.000đ",
  },
];

export default function Home() {
  return (

    <div className="flex">
        <Sidebar />
        <div className= "flex-1 flex flex-col">
            <Header/>
            <main className="flex-1 p-10 bg-gray-100 min-h-screen">
                <Hero/>
                 {/* Địa điểm nổi bật */}
          <section className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                Địa điểm nổi bật
              </h2>

              <button className="text-orange-500 hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
            </main>

        </div>
      

    
    </div>
  )
    
}