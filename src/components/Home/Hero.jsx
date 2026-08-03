import { useEffect, useState } from "react";

import { getCategories } from "../../services/categoryService";

import {
    Coffee,
    Utensils,
    House,
    Hotel,
    Camera,
    Trees,
    Mountain,
} from "lucide-react";

const iconMap = {
    1: Coffee,
    2: Utensils,
    3: House,
    4: Hotel,
    5: Camera,
    6: Trees,
    7: Mountain,
};

export default function Hero({ onSelectCategory }) {

    const [categories, setCategories] = useState([]);

    useEffect(() => {

        getCategories().then((res) => {

            setCategories(res.data);

        });

    }, []);

    return (

        <section className="px-10 py-10">

            <h2 className="text-4xl font-bold">
                Khám phá theo nhu cầu
            </h2>

            <p className="text-gray-500 mt-2">
                Lựa chọn địa điểm phù hợp cho chuyến đi của bạn.
            </p>

            <div className="grid grid-cols-7 gap-6 mt-10">

                {categories.map((item) => {

                    const Icon = iconMap[item.id];

                    return (

                        <button
                            key={item.id}
                            onClick={() => onSelectCategory(item.id)}
                            className="group flex flex-col items-center"
                        >

                            <div
                                className="
                                    w-20
                                    h-20
                                    rounded-full
                                    bg-orange-100
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                    group-hover:bg-orange-500
                                "
                            >

                                {Icon && (

                                    <Icon
                                        size={34}
                                        className="
                                            text-orange-500
                                            group-hover:text-white
                                        "
                                    />

                                )}

                            </div>

                            <p className="mt-3 font-medium">
                                {item.tendanhmuc}
                            </p>

                        </button>

                    );

                })}

            </div>

        </section>

    );

}