import api from "./api";

// =====================================================
// LẤY ĐÁNH GIÁ + BÌNH LUẬN CỦA USER HIỆN TẠI
// =====================================================

export const getMyReview = (userId, placeId) => {
    return api.get("/reviews/my", {
        params: {
            userId,
            placeId,
        },
    });
};


// =====================================================
// THÊM / CẬP NHẬT ĐÁNH GIÁ + BÌNH LUẬN
// =====================================================

export const saveReview = ({
    userId,
    placeId,
    rating,
    comment,
}) => {
    return api.post("/reviews", {
        userId,
        placeId,
        rating,
        comment,
    });
};