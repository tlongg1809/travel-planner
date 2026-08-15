import db from "./database.js";

/**
 * Tính lại tổng tiền của lịch trình
 */
async function recalculateScheduleTotal(scheduleId) {
    await db.execute(
        `UPDATE lichtrinh
         SET tongtien = (
             SELECT COALESCE(SUM(chiphidukien), 0)
             FROM chitietlichtrinh
             WHERE lichtrinhid = ?
         )
         WHERE id = ?`,
        [scheduleId, scheduleId]
    );
}


/**
 * Lấy tất cả lịch trình của user
 */
export async function getSchedulesByUser(userId) {
    const [rows] = await db.execute(
        `SELECT
            lt.id,
            lt.tieude,
            lt.mota,
            lt.ngaybatdau,
            lt.ngayketthuc,
            lt.tongtien,
            lt.ngaytao,
            COUNT(ct.id) AS so_diadiem
        FROM lichtrinh lt
        LEFT JOIN chitietlichtrinh ct
            ON ct.lichtrinhid = lt.id
        WHERE lt.nguoidungid = ?
        GROUP BY
            lt.id,
            lt.tieude,
            lt.mota,
            lt.ngaybatdau,
            lt.ngayketthuc,
            lt.tongtien,
            lt.ngaytao
        ORDER BY lt.ngaytao DESC`,
        [userId]
    );

    return rows;
}


/**
 * Lấy chi tiết 1 lịch trình
 */
export async function getScheduleById(scheduleId, userId) {
    const [rows] = await db.execute(
        `SELECT
            lt.id,
            lt.nguoidungid,
            lt.tieude,
            lt.mota,
            lt.ngaybatdau,
            lt.ngayketthuc,
            lt.tongtien,
            lt.ngaytao
        FROM lichtrinh lt
        WHERE lt.id = ?
          AND lt.nguoidungid = ?
        LIMIT 1`,
        [scheduleId, userId]
    );

    if (!rows[0]) {
        return null;
    }

    const schedule = rows[0];

    const [details] = await db.execute(
        `SELECT
            ct.id,
            ct.lichtrinhid,
            ct.diadiemid,
            ct.thoigian,
            ct.thutu,
            ct.chiphidukien,
            ct.ghichu,
            dd.tendiadiem,
            dd.mota,
            dd.diachi,
            dd.quanhuyen,
            dd.tinhthanh,
            dd.giadukien
        FROM chitietlichtrinh ct
        INNER JOIN diadiem dd
            ON dd.id = ct.diadiemid
        WHERE ct.lichtrinhid = ?
        ORDER BY
            ct.thutu ASC,
            ct.thoigian ASC,
            ct.id ASC`,
        [scheduleId]
    );

    schedule.details = details;

    return schedule;
}


/**
 * Tạo lịch trình
 */
export async function createSchedule({
    userId,
    tieude,
    mota,
    ngaybatdau,
    ngayketthuc,
}) {
    const [result] = await db.execute(
        `INSERT INTO lichtrinh
            (
                nguoidungid,
                tieude,
                mota,
                ngaybatdau,
                ngayketthuc,
                tongtien
            )
         VALUES (?, ?, ?, ?, ?, 0)`,
        [
            userId,
            tieude,
            mota || null,
            ngaybatdau || null,
            ngayketthuc || null,
        ]
    );

    return getScheduleById(result.insertId, userId);
}


/**
 * Cập nhật lịch trình
 */
export async function updateSchedule({
    scheduleId,
    userId,
    tieude,
    mota,
    ngaybatdau,
    ngayketthuc,
}) {
    const [result] = await db.execute(
        `UPDATE lichtrinh
         SET
            tieude = ?,
            mota = ?,
            ngaybatdau = ?,
            ngayketthuc = ?
         WHERE id = ?
           AND nguoidungid = ?`,
        [
            tieude,
            mota || null,
            ngaybatdau || null,
            ngayketthuc || null,
            scheduleId,
            userId,
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return getScheduleById(scheduleId, userId);
}


/**
 * Xóa lịch trình
 */
export async function deleteSchedule(scheduleId, userId) {
    const [result] = await db.execute(
        `DELETE FROM lichtrinh
         WHERE id = ?
           AND nguoidungid = ?`,
        [scheduleId, userId]
    );

    return result.affectedRows > 0;
}


/**
 * Kiểm tra user có phải chủ lịch trình không
 */
export async function isScheduleOwner(scheduleId, userId) {
    const [rows] = await db.execute(
        `SELECT id
         FROM lichtrinh
         WHERE id = ?
           AND nguoidungid = ?
         LIMIT 1`,
        [scheduleId, userId]
    );

    return rows.length > 0;
}


/**
 * Thêm địa điểm vào lịch trình
 */
export async function addPlaceToSchedule({
    scheduleId,
    userId,
    placeId,
    thoigian,
    chiphidukien,
    ghichu,
}) {
    const isOwner = await isScheduleOwner(
        scheduleId,
        userId
    );

    if (!isOwner) {
        throw new Error(
            "Bạn không có quyền chỉnh sửa lịch trình này"
        );
    }

    // Kiểm tra địa điểm tồn tại
    const [placeRows] = await db.execute(
        `SELECT
            id,
            giadukien
         FROM diadiem
         WHERE id = ?
         LIMIT 1`,
        [placeId]
    );

    if (!placeRows[0]) {
        throw new Error(
            "Không tìm thấy địa điểm"
        );
    }

    // Lấy thứ tự cuối
    const [orderRows] = await db.execute(
        `SELECT
            COALESCE(MAX(thutu), 0) + 1 AS nextOrder
         FROM chitietlichtrinh
         WHERE lichtrinhid = ?`,
        [scheduleId]
    );

    const nextOrder =
        orderRows[0].nextOrder || 1;

    const cost =
        chiphidukien !== undefined &&
        chiphidukien !== null &&
        chiphidukien !== ""
            ? Number(chiphidukien)
            : Number(placeRows[0].giadukien || 0);

    const [result] = await db.execute(
        `INSERT INTO chitietlichtrinh
            (
                lichtrinhid,
                diadiemid,
                thoigian,
                thutu,
                chiphidukien,
                ghichu
            )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            scheduleId,
            placeId,
            thoigian || null,
            nextOrder,
            cost,
            ghichu || null,
        ]
    );

    await recalculateScheduleTotal(
        scheduleId
    );

    return {
        id: result.insertId,
        lichtrinhid: scheduleId,
        diadiemid: placeId,
        thoigian: thoigian || null,
        thutu: nextOrder,
        chiphidukien: cost,
        ghichu: ghichu || null,
    };
}


/**
 * Cập nhật 1 địa điểm trong lịch trình
 */
export async function updateSchedulePlace({
    detailId,
    scheduleId,
    userId,
    thoigian,
    chiphidukien,
    ghichu,
}) {
    const isOwner = await isScheduleOwner(
        scheduleId,
        userId
    );

    if (!isOwner) {
        throw new Error(
            "Bạn không có quyền chỉnh sửa lịch trình này"
        );
    }

    const [result] = await db.execute(
        `UPDATE chitietlichtrinh
         SET
            thoigian = ?,
            chiphidukien = ?,
            ghichu = ?
         WHERE id = ?
           AND lichtrinhid = ?`,
        [
            thoigian || null,
            Number(chiphidukien || 0),
            ghichu || null,
            detailId,
            scheduleId,
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    await recalculateScheduleTotal(
        scheduleId
    );

    return true;
}


/**
 * Xóa địa điểm khỏi lịch trình
 */
export async function removePlaceFromSchedule({
    detailId,
    scheduleId,
    userId,
}) {
    const isOwner = await isScheduleOwner(
        scheduleId,
        userId
    );

    if (!isOwner) {
        throw new Error(
            "Bạn không có quyền chỉnh sửa lịch trình này"
        );
    }

    const [result] = await db.execute(
        `DELETE FROM chitietlichtrinh
         WHERE id = ?
           AND lichtrinhid = ?`,
        [detailId, scheduleId]
    );

    await recalculateScheduleTotal(
        scheduleId
    );

    return result.affectedRows > 0;
}


/**
 * Sắp xếp lại timeline
 *
 * items:
 * [
 *   { id: 5, thutu: 1, thoigian: "2026-08-20 08:00:00" },
 *   { id: 2, thutu: 2, thoigian: "2026-08-20 10:00:00" }
 * ]
 */
export async function reorderSchedulePlaces({
    scheduleId,
    userId,
    items,
}) {
    const isOwner = await isScheduleOwner(
        scheduleId,
        userId
    );

    if (!isOwner) {
        throw new Error(
            "Bạn không có quyền sắp xếp lịch trình này"
        );
    }

    if (!Array.isArray(items)) {
        throw new Error(
            "Danh sách sắp xếp không hợp lệ"
        );
    }

    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        for (const item of items) {
            await connection.execute(
                `UPDATE chitietlichtrinh
                 SET
                    thutu = ?,
                    thoigian = ?
                 WHERE id = ?
                   AND lichtrinhid = ?`,
                [
                    item.thutu,
                    item.thoigian || null,
                    item.id,
                    scheduleId,
                ]
            );
        }

        await connection.commit();

        return true;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}