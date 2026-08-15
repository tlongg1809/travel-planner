import db from "./database.js";

/*
    =====================================================
    THỐNG KÊ TỔNG QUAN DASHBOARD
    =====================================================
*/
export async function getDashboardOverview() {
    // Tổng địa điểm
    const [placeRows] = await db.execute(`
        SELECT COUNT(*) AS total
        FROM diadiem
    `);

    // Tổng người dùng
    const [userRows] = await db.execute(`
        SELECT COUNT(*) AS total
        FROM nguoidung
    `);

    // Tổng bình luận
    const [commentRows] = await db.execute(`
        SELECT COUNT(*) AS total
        FROM binhluan
    `);

    // Tổng đánh giá
    const [reviewRows] = await db.execute(`
        SELECT COUNT(*) AS total
        FROM danhgia
    `);

    return {
        totalPlaces: placeRows[0].total,
        totalUsers: userRows[0].total,
        totalComments: commentRows[0].total,
        totalReviews: reviewRows[0].total,
        totalInteractions:
            Number(commentRows[0].total) +
            Number(reviewRows[0].total),
    };
}


/*
    =====================================================
    ĐỊA ĐIỂM PHỔ BIẾN
    =====================================================
*/
export async function getPopularPlaces() {
    const [rows] = await db.execute(`
        SELECT
            dd.id,
            dd.tendiadiem,

            COUNT(DISTINCT dg.id) AS so_danh_gia,

            COALESCE(
                ROUND(AVG(dg.sosao), 1),
                0
            ) AS diem_trung_binh,

            COUNT(
                DISTINCT CASE
                    WHEN bl.trangthai = 1
                    THEN bl.id
                END
            ) AS so_binh_luan

        FROM diadiem dd

        LEFT JOIN danhgia dg
            ON dg.diadiemid = dd.id

        LEFT JOIN binhluan bl
            ON bl.diadiemid = dd.id

        GROUP BY
            dd.id,
            dd.tendiadiem

        ORDER BY
            so_danh_gia DESC,
            so_binh_luan DESC

        LIMIT 10
    `);

    return rows;
}


/*
    =====================================================
    THỐNG KÊ NGƯỜI DÙNG
    =====================================================
*/
export async function getUserStatistics() {
    const [rows] = await db.execute(`
        SELECT
            COUNT(*) AS tong_nguoi_dung,

            SUM(
                CASE
                    WHEN trangthai = 1
                    THEN 1
                    ELSE 0
                END
            ) AS dang_hoat_dong,

            SUM(
                CASE
                    WHEN trangthai = 0
                    THEN 1
                    ELSE 0
                END
            ) AS bi_khoa,

            SUM(
                CASE
                    WHEN vaitro = 0
                    THEN 1
                    ELSE 0
                END
            ) AS nguoi_dung,

            SUM(
                CASE
                    WHEN vaitro = 1
                    THEN 1
                    ELSE 0
                END
            ) AS quan_tri_vien

        FROM nguoidung
    `);

    return rows[0];
}