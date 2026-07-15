import {
    Coffee,
    Utensils,
    House,
    Hotel,
    Camera,
    Trees,
    Mountain
} from "lucide-react";

const categories = [
    {
        icon: Coffee,
        title: "Quán cà phê"
    },
    {
        icon: Utensils,
        title: "Ăn uống"
    },
    {
        icon: House,
        title: "Homestay"
    },
    {
        icon: Hotel,
        title: "Khách sạn"
    },
    {
        icon: Camera,
        title: "Check-in"
    },
    {
        icon: Trees,
        title: "Vui chơi"
    },
    {
        icon: Mountain,
        title: "View đẹp"
    }
];

export default function Hero() {
    return (
        <section className="px-8 py-10">

            <h2 className="text-3xl font-bold mb-2">
                Khám phá theo nhu cầu
            </h2>

            <p className="text-gray-500 mb-8">
                Lựa chọn địa điểm phù hợp cho chuyến đi của bạn.
            </p>

            <div className="grid grid-cols-7 gap-6">

                {categories.map((item, index) => {

                    const Icon = item.icon;

                    return (

                        <div
                            key={index}
                            className="flex flex-col items-center cursor-pointer group"
                        >

                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition">

                                <Icon
                                    size={30}
                                    className="text-orange-500 group-hover:text-white"
                                />

                            </div>

                            <p className="mt-3 text-sm font-medium">
                                {item.title}
                            </p>

                        </div>

                    );

                })}

            </div>

        </section>
    );
}