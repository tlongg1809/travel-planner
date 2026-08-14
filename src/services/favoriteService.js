import api from "./api";

/**
 * Chuẩn hoá field từ backend về đúng tên PlaceCard đang dùng
 * (getPlaces trả `hinhanh`, query detail trả `image` → map về `hinhanh`)
 */
const normalize = (p) => ({
    ...p,
    hinhanh: p.hinhanh || p.image || null,
});

/**
 * Lấy danh sách địa điểm yêu thích của user (kèm đầy đủ thông tin hiển thị)
 */
export const getMyFavorites = async (userId) => {
    const res = await api.get("/favorites/details", { params: { userId } });
    return {
        ...res,
        data: Array.isArray(res.data) ? res.data.map(normalize) : [],
    };
};

/**
 * Lấy tập id địa điểm yêu thích (dùng để check trạng thái nhiều card 1 lúc)
 */
export const getMyFavoriteIds = (userId) => {
    return api.get("/favorites/ids", { params: { userId } });
};

/**
 * Toggle yêu thích: nếu đã thích → xóa, chưa thích → thêm
 * Trả về { favorite: boolean }
 */
export const toggleFavoritePlace = (userId, placeId) => {
    return api.post("/favorites/toggle", { userId, placeId });
};
