import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import db from "./database.js";
import { searchPlaces, resolvePlace } from "./services/gogoduk.js";
import imageRoutes from "./image.js";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.js";

import { getCities, getDistricts } from "./location.js";

import {
  getPlaces,
  getPlaceById,
  getPlaceDetail,
  createPlace,
  assignCategoryToPlace,
  deletePlace,
  updatePlace,
} from "./place.js";

import { findOrCreateGoogleUser } from "./user.js";

import {
  getFavoritesByUser,
  toggleFavorite,
  getFavoritePlaceIds,
  getFavoritesByUserWithDetails,
} from "./favorite.js";
import {
  getMyReview,
  saveReview,
} from "./review.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors());
app.use(express.json());

/* Test Server */
app.get("/api/test", (req, res) => {
  res.json({ message: "Node.js Backend hoạt động!" });
});

/* Test kết nối CSDL */
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");
    res.json({
      success: true,
      message: "Kết nối CSDL Travel Planner thành công!",
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi kết nối CSDL:", error);
    res.status(500).json({
      success: false,
      message: "Kết nối CSDL thất bại!",
      error: error.message,
    });
  }
});

/* ========================== ĐÁNH GIÁ & BÌNH LUẬN ========================= */

// Lấy đánh giá/bình luận của user hiện tại cho địa điểm
app.get("/api/reviews/my", async (req, res) => {
  try {
    const { userId, placeId } = req.query;
    if (!userId || !placeId) {
      return res.status(400).json({
        message: "Thiếu userId hoặc placeId",
      });
    }
    const review = await getMyReview(
      userId,
      placeId
    );
    res.json(review);
  } catch (error) {
    console.error(
      "Lỗi lấy đánh giá của user:",
      error
    );
    res.status(500).json({
      message:
        "Không thể lấy đánh giá của người dùng",
    });
  }
});

// Thêm / cập nhật đánh giá + bình luận
app.post("/api/reviews", async (req, res) => {
  try {
    const {
      userId,
      placeId,
      rating,
      comment,
    } = req.body;
    if (!userId || !placeId) {
      return res.status(400).json({
        message:
          "Thiếu userId hoặc placeId",
      });
    }
    if (
      rating === null ||
      rating === undefined
    ) {
      return res.status(400).json({
        message:
          "Vui lòng chọn số sao đánh giá",
      });
    }
    const result = await saveReview({
      userId,
      placeId,
      rating,
      comment,
    });
    res.json(result);
  } catch (error) {
    console.error(
      "Lỗi API đánh giá:",
      error
    );
    res.status(500).json({
      message:
        error.message ||
        "Không thể lưu đánh giá",
    });
  }
});

/* ========================== QUẢN LÝ ĐỊA ĐIỂM ========================= */

// Lấy danh sách địa điểm (có bộ lọc)
app.get("/api/places", async (req, res) => {
  try {
    const { tinhthanh, quanhuyen, danhmucid, search, sort, includeHidden } =
      req.query;

    const places = await getPlaces({
      tinhthanh: tinhthanh || "",
      quanhuyen: quanhuyen || "",
      danhmucid: danhmucid || "",
      search: search || "",
      sort: sort || "popular",
      includeHidden: includeHidden === "true" || includeHidden === "1",
    });

    res.json(places);
  } catch (error) {
    console.error("LỖI API /api/places:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách địa điểm",
      error: error.message,
    });
  }
});

// Chi tiết địa điểm
app.get("/api/places/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const place = await getPlaceDetail(id);

    if (!place) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm" });
    }

    res.json(place);
  } catch (error) {
    console.error("Lỗi lấy chi tiết địa điểm:", error);
    res.status(500).json({ message: "Không thể lấy chi tiết địa điểm" });
  }
});

// Thêm địa điểm
app.post("/api/places", async (req, res) => {
  try {
    const place = req.body;
    const { danhmucId } = place;

    if (!place.tendiadiem || !place.tendiadiem.trim()) {
      return res.status(400).json({
        message: "Tên địa điểm không được để trống.",
      });
    }

    const result = await createPlace(place);
    const placeId = result.insertId;

    if (danhmucId) {
      try {
        await assignCategoryToPlace(placeId, danhmucId);
      } catch (categoryError) {
        console.error("Lỗi gán danh mục:", categoryError);
      }
    }

    res.status(201).json({
      message: "Thêm địa điểm thành công",
      data: { id: placeId },
    });
  } catch (error) {
    console.error("Lỗi thêm địa điểm:", error);
    res.status(500).json({
      message: error.message || "Không thể thêm địa điểm",
      error: error.message,
    });
  }
});

// Chỉnh sửa địa điểm
app.put("/api/places/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const place = req.body;
    const { danhmucId } = place;

    if (!place.tendiadiem || !place.tendiadiem.trim()) {
      return res.status(400).json({
        message: "Tên địa điểm không được để trống.",
      });
    }

    const existingPlace = await getPlaceById(Number(id));
    if (!existingPlace) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm." });
    }

    await updatePlace(Number(id), place);

    if (danhmucId) {
      try {
        await assignCategoryToPlace(Number(id), danhmucId);
      } catch (categoryError) {
        console.error("Lỗi cập nhật danh mục:", categoryError);
      }
    }

    res.json({
      message: "Cập nhật địa điểm thành công",
      data: { id: Number(id) },
    });
  } catch (error) {
    console.error("Lỗi cập nhật địa điểm:", error);
    res.status(500).json({
      message: error.message || "Không thể cập nhật địa điểm",
    });
  }
});

// Xóa địa điểm
app.delete("/api/places/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const place = await getPlaceById(Number(id));
    if (!place) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm." });
    }

    await deletePlace(Number(id));

    res.json({ message: "Xóa địa điểm thành công" });
  } catch (error) {
    console.error("Lỗi xóa địa điểm:", error);
    res.status(500).json({
      message: error.message || "Không thể xóa địa điểm",
    });
  }
});

/* ========================== QUẢN LÝ DANH MỤC ========================= */

// Lấy danh sách danh mục
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error("LỖI DATABASE:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách danh mục",
      error: error.message,
    });
  }
});

// Lấy chi tiết danh mục
app.get("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json(category);
  } catch (error) {
    console.error("Lỗi lấy chi tiết danh mục:", error);
    res.status(500).json({ message: "Không thể lấy chi tiết danh mục" });
  }
});

// Thêm danh mục
app.post("/api/categories", async (req, res) => {
  try {
    const { tendanhmuc } = req.body;
    if (!tendanhmuc || !tendanhmuc.trim()) {
      return res.status(400).json({
        message: "Tên danh mục không được để trống",
      });
    }
    const category = await createCategory(tendanhmuc.trim());
    res.status(201).json({
      message: "Thêm danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi thêm danh mục:", error);
    res.status(500).json({ message: "Không thể thêm danh mục" });
  }
});

// Chỉnh sửa danh mục
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tendanhmuc } = req.body;
    if (!tendanhmuc || !tendanhmuc.trim()) {
      return res.status(400).json({
        message: "Tên danh mục không được để trống",
      });
    }
    const category = await updateCategory(id, tendanhmuc.trim());
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json({
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res.status(500).json({ message: "Không thể cập nhật danh mục" });
  }
});

// Xóa danh mục
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({ message: "Không thể xóa danh mục" });
  }
});

/* ========================== TỈNH THÀNH / QUẬN HUYỆN ========================= */

app.get("/api/locations/cities", async (req, res) => {
  try {
    const cities = await getCities();
    res.json(cities);
  } catch (error) {
    console.error("Lỗi lấy tỉnh/thành:", error);
    res.status(500).json({ message: "Không thể lấy danh sách tỉnh/thành" });
  }
});

app.get("/api/locations/districts", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: "Thiếu tỉnh/thành" });
    }
    const districts = await getDistricts(city);
    res.json(districts);
  } catch (error) {
    console.error("Lỗi lấy quận/huyện:", error);
    res.status(500).json({ message: "Không thể lấy danh sách quận/huyện" });
  }
});

/* ========================== GOGODUK API ========================= */

app.get("/api/gogoduk/search", async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ message: "Vui lòng nhập tên địa điểm" });
    }
    const places = await searchPlaces(input);
    res.json(places);
  } catch (error) {
    console.error("Lỗi tìm địa điểm GoGoDuk:", error);
    res.status(500).json({
      message: "Không thể tìm kiếm địa điểm",
      error: error.message,
    });
  }
});

app.get("/api/gogoduk/resolve", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ message: "Thiếu placeId" });
    }
    const place = await resolvePlace(placeId);
    res.json(place);
  } catch (error) {
    console.error("Lỗi lấy chi tiết GoGoDuk:", error);
    res.status(500).json({
      message: "Không thể lấy thông tin địa điểm",
      error: error.message,
    });
  }
});

/* Static Files & Uploads */
app.use("/api", imageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ========================== AUTH GOOGLE ========================= */

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Thiếu credential từ Google" });
    }

    const parts = credential.split(".");
    if (parts.length !== 3) {
      return res.status(400).json({ message: "Credential không hợp lệ" });
    }

    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);

    let payload;
    try {
      payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
    } catch (parseErr) {
      console.error("Không parse được payload Google:", parseErr);
      return res.status(400).json({
        message: "Credential không hợp lệ (payload)",
      });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const hoten = payload.name || email;
    const hinhanh = payload.picture || null;

    if (!googleId || !email) {
      return res.status(400).json({
        message: "Không lấy được thông tin từ Google",
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

/* ========================== QUẢN LÝ YÊU THÍCH ========================= */

app.get("/api/favorites", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    const data = await getFavoritesByUser(userId);
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh sách yêu thích:", error);
    res.status(500).json({ message: "Không thể lấy danh sách yêu thích" });
  }
});

app.get("/api/favorites/details", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    const data = await getFavoritesByUserWithDetails(userId);
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh sách yêu thích (chi tiết):", error);
    res.status(500).json({ message: "Không thể lấy danh sách yêu thích" });
  }
});

app.get("/api/favorites/ids", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    const ids = await getFavoritePlaceIds(userId);
    res.json({ ids });
  } catch (error) {
    console.error("Lỗi lấy id yêu thích:", error);
    res.status(500).json({ message: "Không thể lấy id yêu thích" });
  }
});

app.post("/api/favorites/toggle", async (req, res) => {
  try {
    const { userId, placeId } = req.body;
    if (!userId || !placeId) {
      return res.status(400).json({ message: "Thiếu userId hoặc placeId" });
    }
    const result = await toggleFavorite(userId, placeId);
    res.json(result);
  } catch (error) {
    console.error("Lỗi toggle yêu thích:", error);
    res.status(500).json({
      message: "Không thể thay đổi trạng thái yêu thích",
    });
  }
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
