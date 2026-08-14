import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { getPlaces } from "./place.js";
import { getCategories } from "./category.js";
import {
    getCities,
    getDistricts
} from "./location.js";
import { findOrCreateGoogleUser } from "./user.js";
import {
    getFavoritesByUser,
    toggleFavorite,
    getFavoritePlaceIds,
    getFavoritesByUserWithDetails,
} from "./favorite.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/* Middleware */

app.use(cors());

app.use(express.json());


/* Test */

app.get("/api/test", (req, res) => {

    res.json({
        message: "Node.js Backend hoạt động!"
    });

});


/* Lấy danh sách địa điểm */

app.get("/api/places", async (req, res) => {

    try {

        const places = await getPlaces();

        res.json(places);

    } catch (error) {

        console.error("Lỗi lấy địa điểm:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách địa điểm"
        });

    }

});

/* Lấy danh sách danh mục */
app.get("/api/categories", async (req, res) => {

    try {

        const categories = await getCategories();

        res.json(categories);

    } catch (error) {

        console.error("Lỗi lấy danh mục:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách danh mục"
        });

    }

});

/* ==========================Lấy danh sách tỉnh thành========================= */

app.get("/api/locations/cities", async (req, res) => {

    try {

        const cities = await getCities();

        res.json(cities);

    } catch (error) {

        console.error("Lỗi lấy tỉnh/thành:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách tỉnh/thành"
        });

    }

});

/* ==========================Lấy danh sách quận huyện========================= */

app.get("/api/locations/districts", async (req, res) => {

    try {

        const { city } = req.query;

        if (!city) {

            return res.status(400).json({
                message: "Thiếu tỉnh/thành"
            });

        }

        const districts = await getDistricts(city);

        res.json(districts);

    } catch (error) {

        console.error("Lỗi lấy quận/huyện:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách quận/huyện"
        });

    }

});


/* ==========================Đăng nhập bằng Google========================= */

/**
 * POST /api/auth/google
 * Body: { credential: "<id_token từ Google OAuth>" }
 *
 * - Nếu tài khoản chưa tồn tại → tự động tạo mới với vaitro = 0
 * - Nếu đã tồn tại → trả về thông tin user hiện có (giữ nguyên vaitro)
 * - Trả về vaitro để frontend điều hướng: 0 = user, 1 = admin
 */
app.post("/api/auth/google", async (req, res) => {

    try {

        const { credential } = req.body;

        if (!credential) {

            return res.status(400).json({
                message: "Thiếu credential từ Google"
            });

        }

        // Giải mã payload của id_token (phần thứ 2 của JWT)
        // Lưu ý: chỉ decode để lấy thông tin cơ bản; production nên verify signature
        const parts = credential.split(".");

        if (parts.length !== 3) {

            return res.status(400).json({
                message: "Credential không hợp lệ"
            });

        }

        // Chuẩn hoá base64url về base64 chuẩn
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);

        let payload;
        try {
            payload = JSON.parse(
                Buffer.from(padded, "base64").toString("utf-8")
            );
        } catch (parseErr) {
            console.error("Không parse được payload Google:", parseErr);
            return res.status(400).json({
                message: "Credential không hợp lệ (payload)"
            });
        }

        const googleId = payload.sub;
        const email = payload.email;
        const hoten = payload.name || email;
        const hinhanh = payload.picture || null;

        if (!googleId || !email) {

            return res.status(400).json({
                message: "Không lấy được thông tin từ Google"
            });

        }

        const { user, isNew } = await findOrCreateGoogleUser({
            googleId,
            email,
            hoten,
            hinhanh,
        });

        res.json({
            user,
            isNewAccount: isNew,
        });

    } catch (error) {

        console.error("Lỗi đăng nhập Google:", error);

        res.status(500).json({
            message: "Đăng nhập Google thất bại",
            detail: error?.message || String(error),
        });

    }

});


/* ==========================Yêu thích========================= */

/**
 * GET /api/favorites?userId=...
 * Trả về danh sách địa điểm user đó đã yêu thích
 */
app.get("/api/favorites", async (req, res) => {

    try {

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "Thiếu userId"
            });
        }

        const data = await getFavoritesByUser(userId);
        res.json(data);

    } catch (error) {

        console.error("Lỗi lấy danh sách yêu thích:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách yêu thích"
        });

    }

});


/**
 * GET /api/favorites/details?userId=...
 * Trả về danh sách địa điểm yêu thích kèm đầy đủ thông tin (rating, categories, image...)
 * để hiển thị PlaceCard giống trang Explore
 */
app.get("/api/favorites/details", async (req, res) => {

    try {

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "Thiếu userId"
            });
        }

        const data = await getFavoritesByUserWithDetails(userId);
        res.json(data);

    } catch (error) {

        console.error("Lỗi lấy danh sách yêu thích (chi tiết):", error);

        res.status(500).json({
            message: "Không thể lấy danh sách yêu thích"
        });

    }

});


/**
 * GET /api/favorites/ids?userId=...
 * Trả về mảng id địa điểm yêu thích của user (để check nhanh trên card)
 */
app.get("/api/favorites/ids", async (req, res) => {

    try {

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "Thiếu userId"
            });
        }

        const ids = await getFavoritePlaceIds(userId);
        res.json({ ids });

    } catch (error) {

        console.error("Lỗi lấy id yêu thích:", error);

        res.status(500).json({
            message: "Không thể lấy id yêu thích"
        });

    }

});


/**
 * POST /api/favorites/toggle
 * Body: { userId, placeId }
 * Nếu đã thích → xóa, chưa thích → thêm. Trả về { favorite: boolean }.
 */
app.post("/api/favorites/toggle", async (req, res) => {

    try {

        const { userId, placeId } = req.body;

        if (!userId || !placeId) {
            return res.status(400).json({
                message: "Thiếu userId hoặc placeId"
            });
        }

        const result = await toggleFavorite(userId, placeId);
        res.json(result);

    } catch (error) {

        console.error("Lỗi toggle yêu thích:", error);

        res.status(500).json({
            message: "Không thể thay đổi trạng thái yêu thích"
        });

    }

});

/* Start server */

app.listen(PORT, () => {

    console.log(
        `Server đang chạy tại http://localhost:${PORT}`
    );

});