import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const uniqueName = `${name}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên ảnh JPG, JPEG, PNG hoặc WEBP."), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
// Upload nhiều ảnh cho một địa điểm
router.post(
  "/places/:id/images",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const diaDiemId = Number(req.params.id);
      if (!diaDiemId) {
        return res.status(400).json({
          message: "Địa điểm không hợp lệ.",
        });
      }
      /* Kiểm tra địa điểm có tồn tại không */
      const [places] = await db.query("SELECT id FROM diadiem WHERE id = ?", [
        diaDiemId,
      ]);
      if (places.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy địa điểm.",
        });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Vui lòng chọn ít nhất một hình ảnh.",
        });
      }
      /* Kiểm tra địa điểm đã có ảnh chưa */
      const [existingImages] = await db.query(
        `
                SELECT COUNT(*) AS total
                FROM hinhanh_diadiem
                WHERE DiaDiemId = ?
                `,
        [diaDiemId],
      );
      const hasExistingImage = Number(existingImages[0].total) > 0;
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        /*
         * Ảnh đầu tiên sẽ là ảnh chính
         * nếu địa điểm chưa có ảnh.
         */
        const isPrimary = !hasExistingImage && i === 0 ? 1 : 0;
        const url = `/uploads/${file.filename}`;
        const [result] = await db.query(
          `
                    INSERT INTO hinhanh_diadiem
                    (
                        DiaDiemId,
                        Url,
                        IsPrimary
                    )
                    VALUES (?, ?, ?)
                    `,
          [diaDiemId, url, isPrimary],
        );
        images.push({
          id: result.insertId,
          DiaDiemId: diaDiemId,
          Url: url,
          IsPrimary: isPrimary,
        });
      }
      return res.status(201).json({
        message: "Upload hình ảnh thành công.",
        data: images,
      });
    } catch (error) {
      console.error("Lỗi upload hình ảnh:", error);
      return res.status(500).json({
        message: error.message || "Không thể upload hình ảnh.",
      });
    }
  },
);
// Lấy danh sách ảnh của địa điểm
router.get("/places/:id/images", async (req, res) => {
  try {
    const diaDiemId = Number(req.params.id);
    const [rows] = await db.query(
      `
                SELECT
                    Id,
                    DiaDiemId,
                    Url,
                    IsPrimary
                FROM hinhanh_diadiem
                WHERE DiaDiemId = ?
                ORDER BY IsPrimary DESC, Id ASC
                `,
      [diaDiemId],
    );
    return res.json({
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi lấy hình ảnh:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách hình ảnh.",
    });
  }
});
//Xóa một hình ảnh
router.delete("/places/:placeId/images/:imageId", async (req, res) => {
  try {
    const placeId = Number(req.params.placeId);
    const imageId = Number(req.params.imageId);
    const [rows] = await db.query(
      `
                SELECT
                    Id,
                    Url,
                    IsPrimary
                FROM hinhanh_diadiem
                WHERE Id = ?
                  AND DiaDiemId = ?
                `,
      [imageId, placeId],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy hình ảnh.",
      });
    }
    const image = rows[0];
    /* Xóa record trong DB */
    await db.query(
      `
                DELETE FROM hinhanh_diadiem
                WHERE Id = ?
                  AND DiaDiemId = ?
                `,
      [imageId, placeId],
    );
    /* Xóa file vật lý */
    const filePath = path.join(uploadDir, path.basename(image.Url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.json({
      message: "Xóa hình ảnh thành công.",
    });
  } catch (error) {
    console.error("Lỗi xóa hình ảnh:", error);
    return res.status(500).json({
      message: "Không thể xóa hình ảnh.",
    });
  }
});
export default router;
