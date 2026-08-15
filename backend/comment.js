import db from "./database.js";
import express from "express";
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT
                bl.id,
                bl.diadiemid,
                bl.nguoidungid,
                bl.noidung,
                bl.ngaytao,
                bl.trangthai,
                nd.hoten,
                nd.email,
                dd.tendiadiem
            FROM binhluan bl
            INNER JOIN nguoidung nd
                ON bl.nguoidungid = nd.id
            INNER JOIN diadiem dd
                ON bl.diadiemid = dd.id
            ORDER BY bl.ngaytao DESC
        `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách bình luận:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách bình luận",
      error: error.message,
    });
  }
});
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { trangthai } = req.body;
    if (trangthai !== 0 && trangthai !== 1) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ",
      });
    }
    const [result] = await db.query(
      `
            UPDATE binhluan
            SET trangthai = ?
            WHERE id = ?
            `,
      [trangthai, id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy bình luận",
      });
    }
    res.json({
      message: trangthai === 1 ? "Đã duyệt bình luận" : "Đã ẩn bình luận",
      id: Number(id),
      trangthai,
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái bình luận:", error);
    res.status(500).json({
      message: "Không thể cập nhật trạng thái bình luận",
      error: error.message,
    });
  }
});
export default router;
