import db from "./database.js";
import express from "express";
const router = express.Router();
export const reviewRoutes = router;
/*
    GET /api/reviews
    Lấy danh sách đánh giá địa điểm
*/
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT
                dg.id,
                dg.diadiemid,
                dg.nguoidungid,
                dg.sosao,
                dg.ngaytao,
                nd.hoten,
                nd.email,
                dd.tendiadiem
            FROM danhgia dg
            INNER JOIN nguoidung nd
                ON dg.nguoidungid = nd.id
            INNER JOIN diadiem dd
                ON dg.diadiemid = dd.id
            ORDER BY dg.ngaytao DESC
        `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    res.status(500).json({
      message: "Không thể lấy danh sách đánh giá",
      error: error.message,
    });
  }
});

/**
 * =====================================================
 * LẤY ĐÁNH GIÁ / BÌNH LUẬN CỦA USER CHO 1 ĐỊA ĐIỂM
 * =====================================================
 */
export async function getMyReview(userId, placeId) {
  const [ratingRows] = await db.execute(
    `
        SELECT
            id,
            sosao,
            ngaytao
        FROM danhgia
        WHERE nguoidungid = ?
          AND diadiemid = ?
        LIMIT 1
        `,
    [userId, placeId],
  );

  const [commentRows] = await db.execute(
    `
        SELECT
            id,
            noidung,
            ngaytao,
            trangthai
        FROM binhluan
        WHERE nguoidungid = ?
          AND diadiemid = ?
        ORDER BY id DESC
        LIMIT 1
        `,
    [userId, placeId],
  );

  return {
    rating: ratingRows[0] || null,
    comment: commentRows[0] || null,
  };
}

/**
 * =====================================================
 * TẠO / CẬP NHẬT ĐÁNH GIÁ + BÌNH LUẬN
 * =====================================================
 */
export async function saveReview({ userId, placeId, rating, comment }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // =================================================
    // KIỂM TRA ĐỊA ĐIỂM
    // =================================================
    const [placeRows] = await connection.execute(
      `
            SELECT id
            FROM diadiem
            WHERE id = ?
            LIMIT 1
            `,
      [placeId],
    );

    if (placeRows.length === 0) {
      throw new Error("Không tìm thấy địa điểm.");
    }

    // =================================================
    // ĐÁNH GIÁ
    // =================================================
    if (rating !== null && rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        throw new Error("Số sao phải nằm trong khoảng từ 1 đến 5.");
      }

      const [existingRating] = await connection.execute(
        `
                    SELECT id
                    FROM danhgia
                    WHERE nguoidungid = ?
                      AND diadiemid = ?
                    LIMIT 1
                    `,
        [userId, placeId],
      );

      if (existingRating.length > 0) {
        // Đã đánh giá → cập nhật
        await connection.execute(
          `
                    UPDATE danhgia
                    SET sosao = ?,
                        ngaytao = NOW()
                    WHERE id = ?
                    `,
          [numericRating, existingRating[0].id],
        );
      } else {
        // Chưa đánh giá → thêm mới
        await connection.execute(
          `
                    INSERT INTO danhgia
                    (
                        diadiemid,
                        nguoidungid,
                        sosao,
                        ngaytao
                    )
                    VALUES (?, ?, ?, NOW())
                    `,
          [placeId, userId, numericRating],
        );
      }
    }

    // =================================================
    // BÌNH LUẬN
    // =================================================
    if (comment !== null && comment !== undefined && comment.trim() !== "") {
      const cleanComment = comment.trim();

      const [existingComment] = await connection.execute(
        `
                    SELECT id
                    FROM binhluan
                    WHERE nguoidungid = ?
                      AND diadiemid = ?
                    ORDER BY id DESC
                    LIMIT 1
                    `,
        [userId, placeId],
      );

      if (existingComment.length > 0) {
        // Đã có bình luận → cập nhật
        await connection.execute(
          `
                    UPDATE binhluan
                    SET noidung = ?,
                        ngaytao = NOW(),
                        trangthai = 1
                    WHERE id = ?
                    `,
          [cleanComment, existingComment[0].id],
        );
      } else {
        // Chưa có → thêm mới
        await connection.execute(
          `
                    INSERT INTO binhluan
                    (
                        diadiemid,
                        nguoidungid,
                        noidung,
                        ngaytao,
                        trangthai
                    )
                    VALUES (?, ?, ?, NOW(), 1)
                    `,
          [placeId, userId, cleanComment],
        );
      }
    }

    await connection.commit();

    return {
      success: true,
      message: "Đánh giá thành công.",
    };
  } catch (error) {
    await connection.rollback();

    console.error("Lỗi lưu đánh giá:", error);

    throw error;
  } finally {
    connection.release();
  }
}
export default router;
