import db from "./database.js";

//Lấy danh sach địa điểm
export async function getPlaces() {
  const [rows] = await db.execute(`
        SELECT 
            dd.id,
            dd.tendiadiem,
            dd.mota,
            dd.diachi,
            dd.quanhuyen,
            dd.tinhthanh,
            dd.giadukien,
            dd.trangthai,
            dd.latitude,
            dd.longitude,
            dd.thoigianhoatdong,
            /* Đánh giá */
            COALESCE(ROUND(AVG(dg.sosao), 1), 0) AS rating,
            COUNT(DISTINCT dg.id) AS review_count,
            /* Danh mục */
            COALESCE(MIN(dm.id), NULL) AS danhmucid,
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT dm.tendanhmuc
                    ORDER BY dm.id
                    SEPARATOR ','
                ),
                ''
            ) AS categories,
            /* Hình ảnh - lấy ảnh chính, nếu không có lấy ảnh đầu tiên */
            COALESCE(
                MAX(CASE WHEN ha.IsPrimary = 1 THEN ha.Url END),
                MIN(CASE WHEN ha.Url IS NOT NULL THEN ha.Url END),
                ''
            ) AS image,
            /* Danh sách tất cả ảnh */
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT ha.Url
                    ORDER BY ha.IsPrimary DESC, ha.Id ASC
                    SEPARATOR ','
                ),
                ''
            ) AS images
        FROM diadiem dd
        LEFT JOIN danhgia dg
            ON dd.id = dg.diadiemid
        LEFT JOIN danhmuc_diadiem dmdd
            ON dd.id = dmdd.diadiemid
        LEFT JOIN danhmuc dm
            ON dmdd.danhmucid = dm.id
        LEFT JOIN hinhanh_diadiem ha
            ON dd.id = ha.DiaDiemId
        GROUP BY dd.id
        ORDER BY dd.id DESC
    `);
  return rows;
}

// Gán danh mục cho địa điểm
export async function assignCategoryToPlace(placeId, categoryId) {
  if (!categoryId) {
    return null;
  }

  try {
    // Xóa danh mục cũ nếu có
    await db.execute(
      `
            DELETE FROM danhmuc_diadiem 
            WHERE diadiemid = ?
        `,
      [placeId],
    );

    // Thêm danh mục mới
    const [result] = await db.execute(
      `
            INSERT INTO danhmuc_diadiem (diadiemid, danhmucid)
            VALUES (?, ?)
        `,
      [placeId, categoryId],
    );

    return result;
  } catch (error) {
    console.error("Lỗi gán danh mục cho địa điểm:", error);
    throw error;
  }
}

// Lấy chi tiết địa điểm
export async function getPlaceById(placeId) {
  const [rows] = await db.execute(
    `
        SELECT 
            dd.id,
            dd.tendiadiem,
            dd.mota,
            dd.diachi,
            dd.quanhuyen,
            dd.tinhthanh,
            dd.giadukien,
            dd.trangthai,
            dd.latitude,
            dd.longitude,
            dd.thoigianhoatdong,
            /* Đánh giá */
            COALESCE(ROUND(AVG(dg.sosao), 1), 0) AS rating,
            COUNT(DISTINCT dg.id) AS review_count,
            /* Danh mục */
            COALESCE(MIN(dm.id), NULL) AS danhmucid,
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT dm.tendanhmuc
                    ORDER BY dm.id
                    SEPARATOR ','
                ),
                ''
            ) AS categories,
            /* Hình ảnh - lấy ảnh chính, nếu không có lấy ảnh đầu tiên */
            COALESCE(
                MAX(CASE WHEN ha.IsPrimary = 1 THEN ha.Url END),
                MIN(CASE WHEN ha.Url IS NOT NULL THEN ha.Url END),
                ''
            ) AS image,
            /* Danh sách tất cả ảnh */
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT ha.Url
                    ORDER BY ha.IsPrimary DESC, ha.Id ASC
                    SEPARATOR ','
                ),
                ''
            ) AS images
        FROM diadiem dd
        LEFT JOIN danhgia dg
            ON dd.id = dg.diadiemid
        LEFT JOIN danhmuc_diadiem dmdd
            ON dd.id = dmdd.diadiemid
        LEFT JOIN danhmuc dm
            ON dmdd.danhmucid = dm.id
        LEFT JOIN hinhanh_diadiem ha
            ON dd.id = ha.DiaDiemId
        WHERE dd.id = ?
        GROUP BY dd.id
    `,
    [placeId],
  );
  return rows[0] || null;
}

// Lấy địa điểm
export async function createPlace(place) {
  const {
    tendiadiem,
    mota,
    diachi,
    quanhuyen,
    tinhthanh,
    giadukien,
    trangthai,
    latitude,
    longitude,
    thoigianhoatdong,
  } = place;
  const [result] = await db.execute(
    `
        INSERT INTO diadiem
        (
            tendiadiem,
            mota,
            diachi,
            quanhuyen,
            tinhthanh,
            giadukien,
            trangthai,
            latitude,
            longitude,
            thoigianhoatdong
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
    [
      tendiadiem,
      mota,
      diachi,
      quanhuyen,
      tinhthanh,
      giadukien,
      trangthai,
      latitude,
      longitude,
      thoigianhoatdong,
    ],
  );
  return result;
}

// Xóa địa điểm
export async function deletePlace(placeId) {
  try {
    // Xóa hình ảnh liên quan
    await db.execute(`DELETE FROM hinhanh_diadiem WHERE DiaDiemId = ?`, [
      placeId,
    ]);

    // Xóa danh mục liên quan
    await db.execute(`DELETE FROM danhmuc_diadiem WHERE diadiemid = ?`, [
      placeId,
    ]);

    // Xóa đánh giá liên quan
    await db.execute(`DELETE FROM danhgia WHERE diadiemid = ?`, [placeId]);

    // Xóa địa điểm
    const [result] = await db.execute(`DELETE FROM diadiem WHERE id = ?`, [
      placeId,
    ]);

    return result;
  } catch (error) {
    console.error("Lỗi xóa địa điểm:", error);
    throw error;
  }
}

// Cập nhật địa điểm
export async function updatePlace(placeId, place) {
  const {
    tendiadiem,
    mota,
    diachi,
    quanhuyen,
    tinhthanh,
    giadukien,
    trangthai,
    latitude,
    longitude,
    thoigianhoatdong,
  } = place;

  const [result] = await db.execute(
    `
        UPDATE diadiem SET
            tendiadiem = ?,
            mota = ?,
            diachi = ?,
            quanhuyen = ?,
            tinhthanh = ?,
            giadukien = ?,
            trangthai = ?,
            latitude = ?,
            longitude = ?,
            thoigianhoatdong = ?
        WHERE id = ?
    `,
    [
      tendiadiem,
      mota,
      diachi,
      quanhuyen,
      tinhthanh,
      giadukien,
      trangthai,
      latitude,
      longitude,
      thoigianhoatdong,
      placeId,
    ],
  );

  return result;
}
