import { useEffect, useState } from "react";

import { getPlaces } from "../../services/placeService";

import Layout from "../../components/Layout/Layout";
import PlaceCard from "../../components/Home/PlaceCard";
import Hero from "../../components/Home/Hero";


export default function Home() {

    // ==============================
    // BỘ LỌC
    // ==============================

    const [selectedCategory, setSelectedCategory] = useState("");

    const [selectedCity, setSelectedCity] = useState("");

    const [selectedDistrict, setSelectedDistrict] = useState("");


    // ==============================
    // DANH SÁCH ĐỊA ĐIỂM
    // ==============================

    const [places, setPlaces] = useState([]);


    // ==============================
    // LẤY ĐỊA ĐIỂM
    // ==============================

    useEffect(() => {

        const loadPlaces = async () => {

            try {

                const res = await getPlaces({

                danhmucid: selectedCategory,

                tinhthanh: selectedCity,

                quanhuyen: selectedDistrict

                });

                setPlaces(res.data);

            } catch (error) {

                console.error(
                    "Lỗi lấy địa điểm:",
                    error
                );

                setPlaces([]);

            }

        };

        loadPlaces();

    }, [
        selectedCategory,
        selectedCity,
        selectedDistrict
    ]);


    return (

        <Layout

            selectedCity={selectedCity}

            setSelectedCity={setSelectedCity}

            selectedDistrict={selectedDistrict}

            setSelectedDistrict={setSelectedDistrict}

        >

            {/* DANH MỤC */}

            <Hero
                onSelectCategory={setSelectedCategory}
            />


            {/* DANH SÁCH ĐỊA ĐIỂM */}

            <div className="px-10 py-8">

                <h2 className="text-3xl font-bold mb-8">

                    Địa điểm nổi bật

                </h2>


                {places.length === 0 ? (

                    <div className="py-10 text-center text-gray-500">

                        Không tìm thấy địa điểm phù hợp.

                    </div>

                ) : (

                    <div className="grid grid-cols-4 gap-8">

                        {places.map((place) => (

                            <PlaceCard
                                key={place.id}
                                place={place}
                            />

                        ))}

                    </div>

                )}

            </div>

        </Layout>

    );
}