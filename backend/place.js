import db from "./database.js";

// =====================================================
// 1. LẤY DANH SÁCH ĐỊA ĐIỂM (CÓ LỌC, TÌM KIẾM, SẮP XẾP)
// =====================================================
export async function getPlaces(filters = {}) {
  const {
    tinhthanh = "",
    quanhuyen = "",
    danhmucid = "",
    search = "",
    sort = "popular",
    includeHidden = false,
  } = filters;

  const conditions = [];
  if (!includeHidden) {
    conditions.push("dd.trangthai = 1");
  }
  const values = [];

  // Lọc tỉnh thành
  if (tinhthanh) {
    conditions.push("dd.tinhthanh = ?");
    values.push(tinhthanh);
  }

  // Lọc quận huyện
  if (quanhuyen) {
    conditions.push("dd.quanhuyen = ?");
    values.push(quanhuyen);
  }

  // Lọc danh mục
  if (danhmucid) {
    conditions.push(`
            EXISTS (
                SELECT 1
                FROM danhmuc_diadiem dmdd2
                WHERE dmdd2.diadiemid = dd.id
                AND dmdd2.danhmucid = ?
            )
        `);
    values.push(danhmucid);
  }

  // Tìm kiếm
  if (search) {
    conditions.push(`
            (
                dd.tendiadiem LIKE ?
                OR dd.diachi LIKE ?
                OR dd.mota LIKE ?
                OR dd.quanhuyen LIKE ?
                OR dd.tinhthanh LIKE ?
            )
        `);
    const keyword = `%${search}%`;
    values.push(keyword, keyword, keyword, keyword, keyword);
  }

  const whereClause = conditions.length ? conditions.join(" AND ") : "";

  // Sắp xếp
  let orderBy;
  switch (sort) {
    case "rating":
      orderBy = "rating DESC, review_count DESC, dd.id DESC";
      break;
    case "price_asc":
      orderBy = "dd.giadukien ASC, dd.id DESC";
      break;
    case "price_desc":
      orderBy = "dd.giadukien DESC, dd.id DESC";
      break;
    case "popular":
    default:
      orderBy = "review_count DESC, rating DESC, dd.id DESC";
      break;
  }

  const sql = `
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
            /* Hình ảnh chính */
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
        LEFT JOIN danhgia dg ON dd.id = dg.diadiemid
        LEFT JOIN danhmuc_diadiem dmdd ON dd.id = dmdd.diadiemid
        LEFT JOIN danhmuc dm ON dmdd.danhmucid = dm.id
        LEFT JOIN hinhanh_diadiem ha ON dd.id = ha.DiaDiemId
        ${whereClause ? `WHERE ${whereClause}` : ""}
        GROUP BY dd.id
        ORDER BY ${orderBy}
    `;

  const [rows] = await db.execute(sql, values);
  return rows;
}

// =====================================================
// 2. GÁN DANH MỤC CHO ĐỊA ĐIỂM
// =====================================================
export async function assignCategoryToPlace(placeId, categoryId) {
  if (!categoryId) return null;

  try {
    await db.execute(`DELETE FROM danhmuc_diadiem WHERE diadiemid = ?`, [
      placeId,
    ]);

    const [result] = await db.execute(
      `INSERT INTO danhmuc_diadiem (diadiemid, danhmucid) VALUES (?, ?)`,
      [placeId, categoryId],
    );

    return result;
  } catch (error) {
    console.error("Lỗi gán danh mục cho địa điểm:", error);
    throw error;
  }
}

// =====================================================
// 3. LẤY BẢN GHI ĐỊA ĐIỂM THEO ID
// =====================================================
export async function getPlaceById(placeId) {
  const [rows] = await db.execute(
    `
        SELECT 
            dd.*,
            COALESCE(ROUND(AVG(dg.sosao), 1), 0) AS rating,
            COUNT(DISTINCT dg.id) AS review_count,
            GROUP_CONCAT(DISTINCT dm.tendanhmuc SEPARATOR ',') AS categories,
            COALESCE(MAX(CASE WHEN ha.IsPrimary = 1 THEN ha.Url END), MIN(ha.Url)) AS image,
            GROUP_CONCAT(DISTINCT ha.Url SEPARATOR ',') AS images
        FROM diadiem dd
        LEFT JOIN danhgia dg ON dd.id = dg.diadiemid
        LEFT JOIN danhmuc_diadiem dmdd ON dd.id = dmdd.diadiemid
        LEFT JOIN danhmuc dm ON dmdd.danhmucid = dm.id
        LEFT JOIN hinhanh_diadiem ha ON dd.id = ha.DiaDiemId
        WHERE dd.id = ?
        GROUP BY dd.id
    `,
    [placeId],
  );
  return rows[0] || null;
}

// =====================================================
// 4. TẠO ĐỊA ĐIỂM MỚI
// =====================================================
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
        (tendiadiem, mota, diachi, quanhuyen, tinhthanh, giadukien, trangthai, latitude, longitude, thoigianhoatdong)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    ],
  );
  return result;
}

// =====================================================
// 5. XÓA ĐỊA ĐIỂM
// =====================================================
export async function deletePlace(placeId) {
  try {
    await db.execute(`DELETE FROM hinhanh_diadiem WHERE DiaDiemId = ?`, [
      placeId,
    ]);
    await db.execute(`DELETE FROM danhmuc_diadiem WHERE diadiemid = ?`, [
      placeId,
    ]);
    await db.execute(`DELETE FROM danhgia WHERE diadiemid = ?`, [placeId]);

    const [result] = await db.execute(`DELETE FROM diadiem WHERE id = ?`, [
      placeId,
    ]);
    return result;
  } catch (error) {
    console.error("Lỗi xóa địa điểm:", error);
    throw error;
  }
}

// =====================================================
// 6. CẬP NHẬT ĐỊA ĐIỂM
// =====================================================
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

// =====================================================
// 7. LẤY CHI TIẾT ĐỊA ĐIỂM (KÈM GALLERY, ĐÁNH GIÁ, BÌNH LUẬN)
// =====================================================
export async function getPlaceDetail(id) {
  // Thông tin địa điểm
  const [placeRows] = await db.execute(
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
            COALESCE(ROUND(AVG(dg.sosao), 1), 0) AS rating,
            COUNT(DISTINCT dg.id) AS review_count,
            COALESCE(MIN(dm.id), NULL) AS danhmucid,
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT dm.tendanhmuc
                    ORDER BY dm.id
                    SEPARATOR ','
                ),
                ''
            ) AS categories,
            COALESCE(
                MAX(CASE WHEN ha.IsPrimary = 1 THEN ha.Url END),
                MIN(CASE WHEN ha.Url IS NOT NULL THEN ha.Url END),
                ''
            ) AS image,
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT ha.Url
                    ORDER BY ha.IsPrimary DESC, ha.Id ASC
                    SEPARATOR ','
                ),
                ''
            ) AS images
        FROM diadiem dd
        LEFT JOIN danhgia dg ON dd.id = dg.diadiemid
        LEFT JOIN danhmuc_diadiem dmdd ON dd.id = dmdd.diadiemid
        LEFT JOIN danhmuc dm ON dmdd.danhmucid = dm.id
        LEFT JOIN hinhanh_diadiem ha ON dd.id = ha.DiaDiemId
        WHERE dd.id = ?
        GROUP BY dd.id
    `,
    [id],
  );

  if (placeRows.length === 0) {
    return null;
  }

  const place = placeRows[0];

  // Gallery ảnh
  const [imageRows] = await db.execute(
    `
        SELECT
            Id AS id,
            Url AS url,
            IsPrimary AS isPrimary
        FROM hinhanh_diadiem
        WHERE DiaDiemId = ?
        ORDER BY IsPrimary DESC, Id ASC
    `,
    [id],
  );

  // Đánh giá + bình luận
  const [reviewRows] = await db.execute(
    `
        SELECT
            dg.id,
            dg.sosao,
            dg.ngaytao,
            nd.id AS nguoidungid,
            nd.hoten,
            bl.id AS binhluanid,
            bl.noidung,
            bl.trangthai AS binhluan_trangthai
        FROM danhgia dg
        INNER JOIN nguoidung nd ON dg.nguoidungid = nd.id
        LEFT JOIN binhluan bl ON bl.diadiemid = dg.diadiemid AND bl.nguoidungid = dg.nguoidungid
        WHERE dg.diadiemid = ?
        ORDER BY dg.ngaytao DESC
    `,
    [id],
  );

  // Bình luận không có đánh giá
  const [commentRows] = await db.execute(
    `
        SELECT
            bl.id,
            bl.noidung,
            bl.ngaytao,
            nd.id AS nguoidungid,
            nd.hoten
        FROM binhluan bl
        INNER JOIN nguoidung nd ON bl.nguoidungid = nd.id
        WHERE bl.diadiemid = ? AND bl.trangthai = 1
        ORDER BY bl.ngaytao DESC
    `,
    [id],
  );

  return {
    ...place,
    images: imageRows,
    reviews: reviewRows,
    comments: commentRows,
  };
}
