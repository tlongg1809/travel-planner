import api from "./api";


// =====================================================
// LẤY DANH SÁCH ĐỊA ĐIỂM
// =====================================================

export const getPlaces = (params) => {

    return api.get("/places", {
        params
    });

};


// =====================================================
// LẤY CHI TIẾT ĐỊA ĐIỂM
// =====================================================

export const getPlaceDetail = (id) => {

    return api.get(`/places/${id}`);

};