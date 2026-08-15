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
  reviewRoutes,
} from "./review.js";
import commentRoutes from "./comment.js";
import adminUserRouter from "./adminUserRoute.js";
import dashboardRoute from "./dashboardRoute.js";

import {
    getSchedulesByUser,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    addPlaceToSchedule,
    updateSchedulePlace,
    removePlaceFromSchedule,
    reorderSchedulePlaces,
} from "./schedule.js";
import {
    createGroup,
    getGroupByRoomCode,
    joinGroup,
    requestJoinGroup,
    getGroupsByUser,
    getGroupDetails,
    getPendingMembers,
    approveMember,
    rejectMember,
    kickMember,
    leaveGroup,
    votePlace,
    getVotes,
    addComment,
    getComments,
} from "./group.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors());
app.use(express.json());

app.use("/api/comments", commentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/users", adminUserRouter);
app.use(
    "/api/admin/dashboard",
    dashboardRoute
);

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


/* ========================== LỊCH TRÌNH ========================== */


/**
 * Lấy lịch trình của user
 */
app.get("/api/schedules", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "Thiếu userId",
            });
        }

        const schedules =
            await getSchedulesByUser(
                Number(userId)
            );

        res.json(schedules);

    } catch (error) {
        console.error(
            "Lỗi lấy lịch trình:",
            error
        );

        res.status(500).json({
            message: "Không thể lấy lịch trình",
            error: error.message,
        });
    }
});


/**
 * Lấy chi tiết lịch trình
 */
app.get(
    "/api/schedules/:id",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.id);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const schedule =
                await getScheduleById(
                    scheduleId,
                    Number(userId)
                );

            if (!schedule) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy lịch trình",
                });
            }

            res.json(schedule);

        } catch (error) {
            console.error(
                "Lỗi lấy chi tiết lịch trình:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể lấy chi tiết lịch trình",
                error: error.message,
            });
        }
    }
);


/**
 * Tạo lịch trình
 */
app.post(
    "/api/schedules",
    async (req, res) => {
        try {
            const {
                userId,
                tieude,
                mota,
                ngaybatdau,
                ngayketthuc,
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            if (
                !tieude ||
                !tieude.trim()
            ) {
                return res.status(400).json({
                    message:
                        "Tên lịch trình không được để trống",
                });
            }

            const schedule =
                await createSchedule({
                    userId: Number(userId),
                    tieude:
                        tieude.trim(),
                    mota,
                    ngaybatdau,
                    ngayketthuc,
                });

            res.status(201).json(schedule);

        } catch (error) {
            console.error(
                "Lỗi tạo lịch trình:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể tạo lịch trình",
                error: error.message,
            });
        }
    }
);


/**
 * Cập nhật lịch trình
 */
app.put(
    "/api/schedules/:id",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.id);

            const {
                userId,
                tieude,
                mota,
                ngaybatdau,
                ngayketthuc,
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const schedule =
                await updateSchedule({
                    scheduleId,
                    userId: Number(userId),
                    tieude,
                    mota,
                    ngaybatdau,
                    ngayketthuc,
                });

            if (!schedule) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy lịch trình hoặc bạn không có quyền",
                });
            }

            res.json(schedule);

        } catch (error) {
            console.error(
                "Lỗi cập nhật lịch trình:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể cập nhật lịch trình",
                error: error.message,
            });
        }
    }
);


/**
 * Xóa lịch trình
 */
app.delete(
    "/api/schedules/:id",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.id);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const deleted =
                await deleteSchedule(
                    scheduleId,
                    Number(userId)
                );

            if (!deleted) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy lịch trình hoặc bạn không có quyền",
                });
            }

            res.json({
                message:
                    "Xóa lịch trình thành công",
            });

        } catch (error) {
            console.error(
                "Lỗi xóa lịch trình:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể xóa lịch trình",
                error: error.message,
            });
        }
    }
);


/**
 * Thêm địa điểm
 */
app.post(
    "/api/schedules/:id/places",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.id);

            const {
                userId,
                placeId,
                thoigian,
                chiphidukien,
                ghichu,
            } = req.body;

            if (
                !userId ||
                !placeId
            ) {
                return res.status(400).json({
                    message:
                        "Thiếu userId hoặc placeId",
                });
            }

            const detail =
                await addPlaceToSchedule({
                    scheduleId,
                    userId: Number(userId),
                    placeId: Number(placeId),
                    thoigian,
                    chiphidukien,
                    ghichu,
                });

            res.status(201).json(detail);

        } catch (error) {
            console.error(
                "Lỗi thêm địa điểm vào lịch trình:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể thêm địa điểm",
            });
        }
    }
);


/**
 * Cập nhật địa điểm trong lịch trình
 */
app.put(
    "/api/schedules/:scheduleId/places/:detailId",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.scheduleId);

            const detailId =
                Number(req.params.detailId);

            const {
                userId,
                thoigian,
                chiphidukien,
                ghichu,
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const updated =
                await updateSchedulePlace({
                    detailId,
                    scheduleId,
                    userId: Number(userId),
                    thoigian,
                    chiphidukien,
                    ghichu,
                });

            if (!updated) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy địa điểm trong lịch trình",
                });
            }

            res.json({
                message:
                    "Cập nhật thành công",
            });

        } catch (error) {
            console.error(
                "Lỗi cập nhật địa điểm:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể cập nhật",
            });
        }
    }
);


/**
 * Xóa địa điểm
 */
app.delete(
    "/api/schedules/:scheduleId/places/:detailId",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.scheduleId);

            const detailId =
                Number(req.params.detailId);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const deleted =
                await removePlaceFromSchedule({
                    detailId,
                    scheduleId,
                    userId: Number(userId),
                });

            if (!deleted) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy địa điểm",
                });
            }

            res.json({
                message:
                    "Xóa địa điểm thành công",
            });

        } catch (error) {
            console.error(
                "Lỗi xóa địa điểm:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể xóa địa điểm",
            });
        }
    }
);


/**
 * Sắp xếp timeline
 */
app.put(
    "/api/schedules/:id/order",
    async (req, res) => {
        try {
            const scheduleId =
                Number(req.params.id);

            const {
                userId,
                items,
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            await reorderSchedulePlaces({
                scheduleId,
                userId: Number(userId),
                items,
            });

            res.json({
                message:
                    "Sắp xếp lịch trình thành công",
            });

        } catch (error) {
            console.error(
                "Lỗi sắp xếp lịch trình:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể sắp xếp lịch trình",
            });
        }
    }
);

/* ========================== NHÓM ========================== */


/**
 * Tạo nhóm / Chia sẻ nhóm
 */
app.post(
    "/api/groups",
    async (req, res) => {
        try {
            const {
                scheduleId,
                userId,
                tennhom,
            } = req.body;

            if (
                !scheduleId ||
                !userId
            ) {
                return res.status(400).json({
                    message:
                        "Thiếu scheduleId hoặc userId",
                });
            }

            const group =
                await createGroup({
                    scheduleId:
                        Number(scheduleId),
                    userId:
                        Number(userId),
                    tennhom,
                });

            res.status(201).json(group);

        } catch (error) {
            console.error(
                "Lỗi tạo nhóm:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể tạo nhóm",
            });
        }
    }
);


/**
 * Tìm nhóm bằng room code
 */
app.get(
    "/api/groups/room/:roomCode",
    async (req, res) => {
        try {
            const group =
                await getGroupByRoomCode(
                    req.params.roomCode
                );

            if (!group) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy mã phòng",
                });
            }

            res.json(group);

        } catch (error) {
            console.error(
                "Lỗi tìm nhóm:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể tìm nhóm",
            });
        }
    }
);


/**
 * Tham gia nhóm
 */
app.post(
    "/api/groups/join",
    async (req, res) => {
        try {
            const {
                roomCode,
                userId,
            } = req.body;

            if (
                !roomCode ||
                !userId
            ) {
                return res.status(400).json({
                    message:
                        "Thiếu roomCode hoặc userId",
                });
            }

            const result =
                await joinGroup(
                    roomCode.trim().toUpperCase(),
                    Number(userId)
                );

            res.json(result);

        } catch (error) {
            console.error(
                "Lỗi tham gia nhóm:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể tham gia nhóm",
            });
        }
    }
);


/**
 * Lấy nhóm mà user tham gia
 */
app.get(
    "/api/groups",
    async (req, res) => {
        try {
            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const groups =
                await getGroupsByUser(
                    Number(userId)
                );

            res.json(groups);

        } catch (error) {
            console.error(
                "Lỗi lấy nhóm:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể lấy danh sách nhóm",
            });
        }
    }
);


/**
 * Chi tiết nhóm
 */
app.get(
    "/api/groups/:id",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.id);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const group =
                await getGroupDetails(
                    groupId,
                    Number(userId)
                );

            if (!group) {
                return res.status(404).json({
                    message:
                        "Không tìm thấy nhóm",
                });
            }

            res.json(group);

        } catch (error) {
            console.error(
                "Lỗi chi tiết nhóm:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể lấy chi tiết nhóm",
            });
        }
    }
);


/**
 * Kick member
 */
app.delete(
    "/api/groups/:groupId/members/:memberId",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const memberId =
                Number(req.params.memberId);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            await kickMember({
                groupId,
                hostId: Number(userId),
                memberId,
            });

            res.json({
                message:
                    "Đã xóa thành viên",
            });

        } catch (error) {
            console.error(
                "Lỗi kick thành viên:",
                error
            );

            res.status(403).json({
                message:
                    error.message ||
                    "Không thể kick thành viên",
            });
        }
    }
);


/**
 * Rời nhóm
 */
app.post(
    "/api/groups/:groupId/leave",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const {
                userId,
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            await leaveGroup({
                groupId,
                userId: Number(userId),
            });

            res.json({
                message:
                    "Đã rời nhóm",
            });

        } catch (error) {
            console.error(
                "Lỗi rời nhóm:",
                error
            );

            res.status(400).json({
                message:
                    error.message ||
                    "Không thể rời nhóm",
            });
        }
    }
);


/**
 * Vote
 */
app.post(
    "/api/groups/:groupId/votes",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const {
                userId,
                placeId,
                value,
            } = req.body;

            if (
                !userId ||
                !placeId
            ) {
                return res.status(400).json({
                    message:
                        "Thiếu userId hoặc placeId",
                });
            }

            const result =
                await votePlace({
                    groupId,
                    userId:
                        Number(userId),
                    placeId:
                        Number(placeId),
                    value,
                });

            res.json(result);

        } catch (error) {
            console.error(
                "Lỗi bình chọn:",
                error
            );

            res.status(400).json({
                message:
                    error.message ||
                    "Không thể bình chọn",
            });
        }
    }
);


/**
 * Lấy tổng vote
 */
app.get(
    "/api/groups/:groupId/votes",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const votes =
                await getVotes(groupId);

            res.json(votes);

        } catch (error) {
            console.error(
                "Lỗi lấy vote:",
                error
            );

            res.status(500).json({
                message:
                    "Không thể lấy bình chọn",
            });
        }
    }
);


/**
 * Thêm comment
 */
app.post(
    "/api/groups/:groupId/comments",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const {
                userId,
                noidung,
            } = req.body;

            if (
                !userId ||
                !noidung
            ) {
                return res.status(400).json({
                    message:
                        "Thiếu userId hoặc nội dung",
                });
            }

            const comment =
                await addComment({
                    groupId,
                    userId:
                        Number(userId),
                    noidung,
                });

            res.status(201).json(
                comment
            );

        } catch (error) {
            console.error(
                "Lỗi thêm bình luận:",
                error
            );

            res.status(400).json({
                message:
                    error.message ||
                    "Không thể thêm bình luận",
            });
        }
    }
);


/**
 * Lấy comment
 */
app.get(
    "/api/groups/:groupId/comments",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const comments =
                await getComments(
                    groupId,
                    Number(userId)
                );

            res.json(comments);

        } catch (error) {
            console.error(
                "Lỗi lấy bình luận:",
                error
            );

            res.status(500).json({
                message:
                    error.message ||
                    "Không thể lấy bình luận",
            });
        }
    }
);

/**
 * Lấy danh sách yêu cầu tham gia đang chờ
 */
app.get(
    "/api/groups/:id/pending",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.id);

            const { userId } =
                req.query;

            if (!userId) {
                return res.status(400).json({
                    message: "Thiếu userId",
                });
            }

            const members =
                await getPendingMembers(
                    groupId,
                    Number(userId)
                );

            res.json(members);

        } catch (error) {
            console.error(
                "Lỗi lấy yêu cầu tham gia:",
                error
            );

            res.status(403).json({
                message:
                    error.message ||
                    "Không thể lấy yêu cầu tham gia",
            });
        }
    }
);
/**
 * Host duyệt thành viên
 */
app.post(
    "/api/groups/:groupId/approve",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const {
                memberId,
                userId,
            } = req.body;

            if (!memberId || !userId) {
                return res.status(400).json({
                    message:
                        "Thiếu memberId hoặc userId",
                });
            }

            const result =
                await approveMember({
                    groupId,
                    memberId:
                        Number(memberId),
                    hostId:
                        Number(userId),
                });

            res.json(result);

        } catch (error) {
            console.error(
                "Lỗi duyệt thành viên:",
                error
            );

            res.status(403).json({
                message:
                    error.message ||
                    "Không thể duyệt thành viên",
            });
        }
    }
);
/**
 * Host từ chối thành viên
 */
app.post(
    "/api/groups/:groupId/reject",
    async (req, res) => {
        try {
            const groupId =
                Number(req.params.groupId);

            const {
                memberId,
                userId,
            } = req.body;

            if (!memberId || !userId) {
                return res.status(400).json({
                    message:
                        "Thiếu memberId hoặc userId",
                });
            }

            const result =
                await rejectMember({
                    groupId,
                    memberId:
                        Number(memberId),
                    hostId:
                        Number(userId),
                });

            res.json(result);

        } catch (error) {
            console.error(
                "Lỗi từ chối thành viên:",
                error
            );

            res.status(403).json({
                message:
                    error.message ||
                    "Không thể từ chối thành viên",
            });
        }
    }
);

/**
 * Gửi yêu cầu tham gia nhóm
 */
app.post(
    "/api/groups/join-request",
    async (req, res) => {
        try {
            const {
                roomCode,
                userId,
            } = req.body;

            if (!roomCode || !userId) {
                return res.status(400).json({
                    message:
                        "Thiếu roomCode hoặc userId",
                });
            }

            const result =
                await requestJoinGroup(
                    roomCode.trim().toUpperCase(),
                    Number(userId)
                );

            res.json(result);

        } catch (error) {
            console.error(
                "Lỗi gửi yêu cầu tham gia:",
                error
            );

            res.status(400).json({
                message:
                    error.message ||
                    "Không thể gửi yêu cầu tham gia",
            });
        }
    }
);

/* Start server */
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
