import { useEffect, useState } from "react";

import { getPlaces } from "../../services/placeService";
import { getMyFavoriteIds } from "../../services/favoriteService";
import { useAuth } from "../../contexts/AuthContext";
import Layout from "../../components/Layout/Layout";

import PlaceCard from "../../components/Home/PlaceCard";
import Hero from "../../components/Home/Hero";

import LoginModal from "../../components/Common/LoginModal";

export default function Home() {

    const { user, isAuthenticated } = useAuth();

    const [places, setPlaces] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [openLogin, setOpenLogin] = useState(false);

    useEffect(() => {
      getPlaces(selectedCategory).then((res) => {
        setPlaces(res.data);
      });
    }, [selectedCategory]);

    // Lấy tập id yêu thích của user (nếu đã đăng nhập)
    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setFavoriteIds([]);
            return;
        }

        getMyFavoriteIds(user.id)
            .then((res) => setFavoriteIds(res.data.ids || []))
            .catch((err) => console.error("Lỗi lấy favorite ids:", err));
    }, [isAuthenticated, user]);

    // Cập nhật favoriteIds khi 1 card toggle (để các card khác nếu có cùng id đồng bộ)
    const handleFavoriteChange = (placeId, isFav) => {
        setFavoriteIds((prev) => {
            if (isFav) {
                if (prev.includes(placeId)) return prev;
                return [...prev, placeId];
            }
            return prev.filter((id) => id !== placeId);
        });
    };

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
                                isFavorite={favoriteIds.includes(place.id)}
                                onFavoriteChange={handleFavoriteChange}
                                onRequireLogin={() => setOpenLogin(true)}
                            />

                        ))}

                    </div>

                </div>


            </div>

        </div>
        <LoginModal
            open={openLogin}
            onClose={() => setOpenLogin(false)}
        />
         </Layout>

    );
}