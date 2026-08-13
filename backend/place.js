import db from "./database.js";

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
            dd.google_place_id,
            dd.latitude,
            dd.longitude,
            dd.thoigianhoatdong,

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
            -- 1. Ảnh đại diện cho Card (Ưu tiên IsPrimary = 1, nếu không có sẽ lấy ảnh bất kỳ)
            COALESCE(
                MAX(CASE WHEN ha.IsPrimary = 1 THEN ha.Url END),
                MIN(ha.Url)
            ) AS image,

            -- 2. Danh sách tất cả ảnh (Gộp thành chuỗi phân cách bởi dấu phẩy nếu Card có Slider)
            GROUP_CONCAT(
                DISTINCT ha.Url
                SEPARATOR ','
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

        WHERE dd.trangthai = 1

        GROUP BY dd.id

        ORDER BY dd.id DESC
    `);

    return rows;
}