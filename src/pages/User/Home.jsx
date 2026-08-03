import { useEffect, useState } from "react";

import { getPlaces } from "../../services/placeService";
import Layout from "../../components/Layout/Layout";

import PlaceCard from "../../components/Home/PlaceCard";
import Hero from "../../components/Home/Hero";
export default function Home() {

    const [places, setPlaces] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(0);

    useEffect(() => {
      getPlaces(selectedCategory).then((res) => {
        setPlaces(res.data);
      });
    }, [selectedCategory]);

    return (
      <Layout >
        <Hero onSelectCategory={setSelectedCategory} />

        <div className="flex">



            <div className="flex-1">

                

                

                <div className="px-10 py-8">

                    <h2 className="text-3xl font-bold mb-8">

                        Địa điểm nổi bật

                    </h2>

                    <div className="grid grid-cols-4 gap-8">

                        {places.map((place) => (

                            <PlaceCard
                                key={place.id}
                                place={place}
                            />

                        ))}

                    </div>

                </div>
             

            </div>

        </div>
         </Layout>

    );
}