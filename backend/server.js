import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./database.js";
import { searchPlaces, resolvePlace } from "./services/gogoduk.js";
import imageRoutes from "./image.js";
import path from "path";
import { fileURLToPath } from "url";
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
  createPlace,
  assignCategoryToPlace,
  deletePlace,
  updatePlace,
} from "./place.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
/* Middleware */
app.use(cors());
app.use(express.json());
/* Test */
app.get("/api/test", (req, res) => {
  res.json({
    message: "Node.js Backend hoạt động!",
  });
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

/* Lấy danh sách danh mục */
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
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }
    res.json(category);
  } catch (error) {
    console.error("Lỗi lấy chi tiết danh mục:", error);
    res.status(500).json({
      message: "Không thể lấy chi tiết danh mục",
    });
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
    res.status(500).json({
      message: "Không thể thêm danh mục",
    });
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
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }
    res.json({
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res.status(500).json({
      message: "Không thể cập nhật danh mục",
    });
  }
});

// Xóa danh mục
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }
    res.json({
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({
      message: "Không thể xóa danh mục",
    });
  }
});

/* Lấy danh sách địa điểm */
app.get("/api/places", async (req, res) => {
  try {
    const places = await getPlaces();
    res.json(places);
  } catch (error) {
    console.error("Lỗi lấy địa điểm:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách địa điểm",
    });
  }
});

/* Lấy chi tiết địa điểm */
app.get("/api/places/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const place = await getPlaceById(Number(id));

    if (!place) {
      return res.status(404).json({
        message: "Không tìm thấy địa điểm.",
      });
    }

    res.json({
      data: place,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết địa điểm:", error);
    res.status(500).json({
      message: "Không thể lấy chi tiết địa điểm",
    });
  }
});

/* Xóa địa điểm */
app.delete("/api/places/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const place = await getPlaceById(Number(id));
    if (!place) {
      return res.status(404).json({
        message: "Không tìm thấy địa điểm.",
      });
    }

    await deletePlace(Number(id));

    res.json({
      message: "Xóa địa điểm thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa địa điểm:", error);
    res.status(500).json({
      message: error.message || "Không thể xóa địa điểm",
    });
  }
});

/* Chỉnh sửa địa điểm */
app.put("/api/places/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const place = req.body;
    const { danhmucId } = place;

    // Validate required fields
    if (!place.tendiadiem || !place.tendiadiem.trim()) {
      return res.status(400).json({
        message: "Tên địa điểm không được để trống.",
      });
    }

    // Kiểm tra địa điểm có tồn tại không
    const existingPlace = await getPlaceById(Number(id));
    if (!existingPlace) {
      return res.status(404).json({
        message: "Không tìm thấy địa điểm.",
      });
    }

    await updatePlace(Number(id), place);

    // Cập nhật danh mục nếu có
    if (danhmucId) {
      try {
        await assignCategoryToPlace(Number(id), danhmucId);
      } catch (categoryError) {
        console.error("Lỗi cập nhật danh mục:", categoryError);
        // Không throw error, chỉ log
      }
    }

    res.json({
      message: "Cập nhật địa điểm thành công",
      data: {
        id: Number(id),
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật địa điểm:", error);
    res.status(500).json({
      message: error.message || "Không thể cập nhật địa điểm",
    });
  }
});

//Thêm địa điểm
app.post("/api/places", async (req, res) => {
  try {
    const place = req.body;
    const { danhmucId } = place;

    // Validate required fields
    if (!place.tendiadiem || !place.tendiadiem.trim()) {
      return res.status(400).json({
        message: "Tên địa điểm không được để trống.",
      });
    }

    const result = await createPlace(place);
    const placeId = result.insertId;

    // Gán danh mục nếu có
    if (danhmucId) {
      try {
        await assignCategoryToPlace(placeId, danhmucId);
      } catch (categoryError) {
        console.error("Lỗi gán danh mục:", categoryError);
        // Không throw error, chỉ log - địa điểm vẫn được tạo
      }
    }

    res.status(201).json({
      message: "Thêm địa điểm thành công",
      data: {
        id: placeId,
      },
    });
  } catch (error) {
    console.error("Lỗi thêm địa điểm:", error);
    res.status(500).json({
      message: error.message || "Không thể thêm địa điểm",
      error: error.message,
    });
  }
});

/* Lấy danh sách tỉnh thành */
app.get("/api/locations/cities", async (req, res) => {
  try {
    const cities = await getCities();
    res.json(cities);
  } catch (error) {
    console.error("Lỗi lấy tỉnh/thành:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách tỉnh/thành",
    });
  }
});

/* Lấy danh sách quận huyện */
app.get("/api/locations/districts", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({
        message: "Thiếu tỉnh/thành",
      });
    }
    const districts = await getDistricts(city);
    res.json(districts);
  } catch (error) {
    console.error("Lỗi lấy quận/huyện:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách quận/huyện",
    });
  }
});

// GoGoDuk - Tìm kiếm địa điểm
app.get("/api/gogoduk/search", async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({
        message: "Vui lòng nhập tên địa điểm",
      });
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

// GoGoDuk - Lấy thông tin chi tiết địa điểm
app.get("/api/gogoduk/resolve", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({
        message: "Thiếu placeId",
      });
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

// Upload hình ảnh
app.use("/api", imageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Start server */
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
