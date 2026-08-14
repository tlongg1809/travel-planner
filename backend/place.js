import db from "./database.js";

export async function getPlaces(filters = {}) {

    const {
        tinhthanh = "",
        quanhuyen = "",
        danhmucid = "",
        search = "",
        sort = "popular"
    } = filters;


    // =====================================================
    // WHERE
    // =====================================================

    const conditions = [
        "dd.trangthai = 1"
    ];

    const values = [];


    // =====================================================
    // LỌC TỈNH / THÀNH
    // =====================================================

    if (tinhthanh) {

        conditions.push(
            "dd.tinhthanh = ?"
        );

        values.push(tinhthanh);

    }


    // =====================================================
    // LỌC QUẬN / HUYỆN
    // =====================================================

    if (quanhuyen) {

        conditions.push(
            "dd.quanhuyen = ?"
        );

        values.push(quanhuyen);

    }


    // =====================================================
    // LỌC DANH MỤC
    // =====================================================

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


    // =====================================================
    // TÌM KIẾM
    // =====================================================

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

        values.push(
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        );

    }


    const whereClause = conditions.join(" AND ");


    // =====================================================
    // SẮP XẾP
    // =====================================================

    let orderBy;


    switch (sort) {

        case "rating":

            orderBy = `
                rating DESC,
                review_count DESC,
                dd.id DESC
            `;

            break;


        case "price_asc":

            orderBy = `
                dd.giadukien ASC,
                dd.id DESC
            `;

            break;


        case "price_desc":

            orderBy = `
                dd.giadukien DESC,
                dd.id DESC
            `;

            break;


        case "popular":

        default:

            orderBy = `
                review_count DESC,
                rating DESC,
                dd.id DESC
            `;

            break;

    }


    // =====================================================
    // SQL
    // =====================================================

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


            /* ================================
               ĐÁNH GIÁ
            ================================= */

            COALESCE(
                ROUND(AVG(dg.sosao), 1),
                0
            ) AS rating,


            COUNT(
                DISTINCT dg.id
            ) AS review_count,


            /* ================================
               DANH MỤC
            ================================= */

            GROUP_CONCAT(
                DISTINCT dm.tendanhmuc
                ORDER BY dm.id
                SEPARATOR ','
            ) AS categories,


            /* ================================
               HÌNH ẢNH
            ================================= */

            COALESCE(
                MAX(
                    CASE
                        WHEN ha.IsPrimary = 1
                        THEN ha.Url
                    END
                ),
                MIN(ha.Url)
            ) AS hinhanh,


            /* ================================
               TẤT CẢ HÌNH ẢNH
            ================================= */

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


        WHERE ${whereClause}


        GROUP BY dd.id


        ORDER BY ${orderBy}
    `;


    console.log("=================================");
    console.log("FILTER:", filters);
    console.log("SQL:", sql);
    console.log("VALUES:", values);
    console.log("=================================");


    const [rows] = await db.execute(
        sql,
        values
    );


    return rows;

}




// =====================================================
// LẤY CHI TIẾT ĐỊA ĐIỂM
// =====================================================

export async function getPlaceDetail(id) {

    // ==============================
    // THÔNG TIN ĐỊA ĐIỂM
    // ==============================

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

            COALESCE(
                ROUND(
                    (
                        SELECT AVG(dg.sosao)
                        FROM danhgia dg
                        WHERE dg.diadiemid = dd.id
                    ),
                    1
                ),
                0
            ) AS rating,

            (
                SELECT COUNT(*)
                FROM danhgia dg
                WHERE dg.diadiemid = dd.id
            ) AS review_count

        FROM diadiem dd

        WHERE dd.id = ?
        AND dd.trangthai = 1

        LIMIT 1
        `,
        [id]
    );


    if (placeRows.length === 0) {
        return null;
    }


    const place = placeRows[0];


    // ==============================
    // GALLERY ẢNH
    // ==============================

    const [imageRows] = await db.execute(
        `
        SELECT
            Id AS id,
            Url AS url,
            IsPrimary AS isPrimary

        FROM hinhanh_diadiem

        WHERE DiaDiemId = ?

        ORDER BY
            IsPrimary DESC,
            Id ASC
        `,
        [id]
    );


    // ==============================
    // ĐÁNH GIÁ + BÌNH LUẬN
    // ==============================

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

        INNER JOIN nguoidung nd
            ON dg.nguoidungid = nd.id

        LEFT JOIN binhluan bl
            ON bl.diadiemid = dg.diadiemid
            AND bl.nguoidungid = dg.nguoidungid

        WHERE dg.diadiemid = ?

        ORDER BY dg.ngaytao DESC
        `,
        [id]
    );


    // ==============================
    // BÌNH LUẬN KHÔNG CÓ ĐÁNH GIÁ
    // ==============================

    const [commentRows] = await db.execute(
        `
        SELECT

            bl.id,
            bl.noidung,
            bl.ngaytao,

            nd.id AS nguoidungid,
            nd.hoten

        FROM binhluan bl

        INNER JOIN nguoidung nd
            ON bl.nguoidungid = nd.id

        WHERE bl.diadiemid = ?
        AND bl.trangthai = 1

        ORDER BY bl.ngaytao DESC
        `,
        [id]
    );


    return {
        ...place,

        images: imageRows,

        reviews: reviewRows,

        comments: commentRows
    };
}