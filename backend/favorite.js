import db from "./database.js";

/**
 * Lấy danh sách địa điểm yêu thích của 1 người dùng
 */
export async function getFavoritesByUser(userId) {
    const [rows] = await db.execute(
        `SELECT
            y.id,
            y.ngaytao,
            d.id AS diadiemid,
            d.tendiadiem,
            d.mota,
            d.diachi,
            d.hinhanh
        FROM yeuthich y
        INNER JOIN diadiem d ON d.id = y.diadiemid
        WHERE y.nguoidungid = ?
        ORDER BY y.ngaytao DESC`,
        [userId]
    );

    return rows;
}

/**
 * Kiểm tra địa điểm đã được yêu thích chưa
 */
export async function isFavorite(userId, placeId) {
    const [rows] = await db.execute(
        `SELECT id
         FROM yeuthich
         WHERE nguoidungid = ? AND diadiemid = ?
         LIMIT 1`,
        [userId, placeId]
    );

    return rows.length > 0;
}

/**
 * Thêm yêu thích
 */
export async function addFavorite(userId, placeId) {
    const existed = await isFavorite(userId, placeId);

    if (existed) {
        return { success: true, existed: true };
    }

    await db.execute(
        `INSERT INTO yeuthich (nguoidungid, diadiemid)
         VALUES (?, ?)`,
        [userId, placeId]
    );

    return { success: true, existed: false };
}

/**
 * Xóa yêu thích
 */
export async function removeFavorite(userId, placeId) {
    await db.execute(
        `DELETE FROM yeuthich
         WHERE nguoidungid = ? AND diadiemid = ?`,
        [userId, placeId]
    );

    return { success: true };
}

/**
 * Toggle yêu thích
 */
export async function toggleFavorite(userId, placeId) {
    const existed = await isFavorite(userId, placeId);

    if (existed) {
        await removeFavorite(userId, placeId);
        return { favorite: false };
    }

    await addFavorite(userId, placeId);
    return { favorite: true };
}

/**
 * Lấy tập id địa điểm yêu thích của user (dùng để check trạng thái nhiều card 1 lúc)
 */
export async function getFavoritePlaceIds(userId) {
    const [rows] = await db.execute(
        `SELECT diadiemid
         FROM yeuthich
         WHERE nguoidungid = ?`,
        [userId]
    );

    return rows.map((r) => r.diadiemid);
}


/**
 * Lấy danh sách địa điểm yêu thích kèm đầy đủ thông tin để hiển thị PlaceCard
 * (rating, review_count, categories, image giống getPlaces)
 */
export async function getFavoritesByUserWithDetails(userId) {
    const [rows] = await db.execute(
        `SELECT
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
            y.ngaytao,

            /* Đánh giá */
            COALESCE(ROUND(AVG(dg.sosao), 1), 0) AS rating,
            COUNT(DISTINCT dg.id) AS review_count,

            /* Danh mục */
            GROUP_CONCAT(
                DISTINCT dm.tendanhmuc
                ORDER BY dm.id
                SEPARATOR ','
            ) AS categories,

            /* Hình ảnh */
            COALESCE(
                MAX(CASE WHEN ha.IsPrimary = 1 THEN ha.Url END),
                MIN(ha.Url)
            ) AS image,

            GROUP_CONCAT(
                DISTINCT ha.Url
                SEPARATOR ','
            ) AS images
        FROM yeuthich y
        INNER JOIN diadiem dd ON dd.id = y.diadiemid
        LEFT JOIN danhgia dg ON dd.id = dg.diadiemid
        LEFT JOIN danhmuc_diadiem dmdd ON dd.id = dmdd.diadiemid
        LEFT JOIN danhmuc dm ON dmdd.danhmucid = dm.id
        LEFT JOIN hinhanh_diadiem ha ON dd.id = ha.DiaDiemId
        WHERE y.nguoidungid = ?
          AND dd.trangthai = 1
        GROUP BY dd.id, y.ngaytao
        ORDER BY y.ngaytao DESC`,
        [userId]
    );

    return rows;
}
