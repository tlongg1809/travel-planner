import { useEffect, useState } from "react";

import { getPlaces } from "../../services/placeService";

import Layout from "../../components/Layout/Layout";
import PlaceCard from "../../components/Home/PlaceCard";
import Hero from "../../components/Home/Hero";
import LoginModal from "../../components/Common/LoginModal";
import { getMyFavoriteIds } from "../../services/favoriteService";
import { useAuth } from "../../contexts/AuthContext";
import PlaceGrid from "../../components/Home/PlaceGrid";
export default function Home() {

    const [openLogin, setOpenLogin] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const { user, isAuthenticated } = useAuth();
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

                console.log("Dữ liệu API /places:", res.data);
console.log("Số địa điểm API trả về:", res.data.length);

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
                    <PlaceGrid
                  places={places}
                  favoriteIds={favoriteIds}
                  onFavoriteChange={handleFavoriteChange}
                  onRequireLogin={() => setOpenLogin(true)}
                />       
                    

                )}
                
                

            </div>
            <LoginModal
            open={openLogin}
            onClose={() => setOpenLogin(false)}
        />

        </Layout>

    );
}