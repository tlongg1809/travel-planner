import db from "./database.js";
import crypto from "crypto";


/**
 * Sinh mã phòng
 */
function generateRoomCode() {
    return crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase();
}


/**
 * Kiểm tra host của nhóm
 */
export async function isGroupHost(
    groupId,
    userId
) {
    const [rows] = await db.execute(
        `SELECT id
         FROM nhom
         WHERE id = ?
           AND chuphongid = ?
         LIMIT 1`,
        [groupId, userId]
    );

    return rows.length > 0;
}


/**
 * Kiểm tra thành viên nhóm
 */
export async function isGroupMember(
    groupId,
    userId
) {
    const [rows] = await db.execute(
        `SELECT id, vaitro
         FROM thanhviennhom
         WHERE nhomid = ?
           AND nguoidungid = ?
         LIMIT 1`,
        [groupId, userId]
    );

    return rows[0] || null;
}


/**
 * Tạo nhóm từ 1 lịch trình
 */
export async function createGroup({
    scheduleId,
    userId,
    tennhom,
}) {
    const [scheduleRows] =
        await db.execute(
            `SELECT id, tieude
             FROM lichtrinh
             WHERE id = ?
               AND nguoidungid = ?
             LIMIT 1`,
            [scheduleId, userId]
        );

    if (!scheduleRows[0]) {
        throw new Error(
            "Bạn không phải chủ lịch trình này"
        );
    }

    // Kiểm tra lịch trình đã có nhóm chưa
    const [existingRows] =
        await db.execute(
            `SELECT id, roomcode
             FROM nhom
             WHERE lichtrinhid = ?
             LIMIT 1`,
            [scheduleId]
        );

    if (existingRows[0]) {
        return existingRows[0];
    }

    let roomCode;
    let exists = true;

    while (exists) {
        roomCode = generateRoomCode();

        const [codeRows] =
            await db.execute(
                `SELECT id
                 FROM nhom
                 WHERE roomcode = ?
                 LIMIT 1`,
                [roomCode]
            );

        exists = codeRows.length > 0;
    }

    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        // Tạo nhóm
        const [groupResult] =
            await connection.execute(
                `INSERT INTO nhom
                    (
                        lichtrinhid,
                        tennhom,
                        chuphongid,
                        roomcode
                    )
                 VALUES (?, ?, ?, ?)`,
                [
                    scheduleId,
                    tennhom ||
                        scheduleRows[0].tieude ||
                        "Nhóm du lịch",
                    userId,
                    roomCode,
                ]
            );

        const groupId =
            groupResult.insertId;

        // Người tạo = host
        await connection.execute(
            `INSERT INTO thanhviennhom
                (
                    nhomid,
                    nguoidungid,
                    vaitro
                )
             VALUES (?, ?, 1)`,
            [groupId, userId]
        );

        await connection.commit();

       return {
            id: groupId,
            lichtrinhid: scheduleId,
            tennhom:
                tennhom ||
                scheduleRows[0].tieude ||
                "Nhóm du lịch",
            chuphongid: userId,
            roomcode: roomCode,
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}


/**
 * Lấy nhóm theo room code
 */
export async function getGroupByRoomCode(
    roomCode
) {
    const [rows] = await db.execute(
        `SELECT
            n.id,
            n.lichtrinhid,
            n.tennhom,
            n.chuphongid,
            n.roomcode,
            n.ngaytao,
            u.hoten AS tenchu
         FROM nhom n
         INNER JOIN nguoidung u
            ON u.id = n.chuphongid
         WHERE n.roomcode = ?
         LIMIT 1`,
        [roomCode]
    );

    return rows[0];
}


/**
 * User tham gia nhóm bằng room code
 */
export async function joinGroup(
    roomCode,
    userId
) {
    return await requestJoinGroup(
        roomCode,
        userId
    );
}


/**
 * Lấy danh sách nhóm của user
 */
export async function getGroupsByUser(
    userId
) {
    const [rows] = await db.execute(
        `SELECT DISTINCT
            n.id,
            n.lichtrinhid,
            n.tennhom,
            n.chuphongid,
            n.roomcode,
            n.ngaytao,
            u.hoten AS tenchu,
            lt.tieude,
            lt.ngaybatdau,
            lt.ngayketthuc,
            lt.tongtien
         FROM thanhviennhom tv
         INNER JOIN nhom n
            ON n.id = tv.nhomid
         INNER JOIN lichtrinh lt
            ON lt.id = n.lichtrinhid
         INNER JOIN nguoidung u
            ON u.id = n.chuphongid
         WHERE tv.nguoidungid = ?
         ORDER BY n.ngaytao DESC`,
        [userId]
    );

    return rows;
}


/**
 * Chi tiết nhóm
 */
export async function getGroupDetails(
    groupId,
    userId
) {
    const member =
        await isGroupMember(
            groupId,
            userId
        );

    if (!member) {
        throw new Error(
            "Bạn không phải thành viên nhóm"
        );
    }

    const [groups] =
        await db.execute(
            `SELECT
                n.id,
                n.lichtrinhid,
                n.tennhom,
                n.chuphongid,
                n.roomcode,
                n.ngaytao,
                u.hoten AS tenchu,
                lt.tieude,
                lt.mota,
                lt.ngaybatdau,
                lt.ngayketthuc,
                lt.tongtien
             FROM nhom n
             INNER JOIN nguoidung u
                ON u.id = n.chuphongid
             INNER JOIN lichtrinh lt
                ON lt.id = n.lichtrinhid
             WHERE n.id = ?
             LIMIT 1`,
            [groupId]
        );

    if (!groups[0]) {
        return null;
    }

    const group = groups[0];

    const [members] =
        await db.execute(
            `SELECT
                tv.id,
                tv.nguoidungid,
                tv.vaitro,
                tv.ngaythamgia,
                u.hoten,
                u.email,
                u.hinhanh
             FROM thanhviennhom tv
             INNER JOIN nguoidung u
                ON u.id = tv.nguoidungid
             WHERE tv.nhomid = ?
             ORDER BY
                tv.vaitro DESC,
                tv.ngaythamgia ASC`,
            [groupId]
        );

    const [places] =
        await db.execute(
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
            [group.lichtrinhid]
        );

    group.members = members;
    group.places = places;
    group.currentUserRole =
        member.vaitro;

    return group;
}


/**
 * Kick thành viên
 * Chỉ host được kick
 */
export async function kickMember({
    groupId,
    hostId,
    memberId,
}) {
    const isHost =
        await isGroupHost(
            groupId,
            hostId
        );

    if (!isHost) {
        throw new Error(
            "Chỉ chủ phòng mới có quyền kick thành viên"
        );
    }

    if (
        Number(hostId) ===
        Number(memberId)
    ) {
        throw new Error(
            "Không thể kick chủ phòng"
        );
    }

    const [result] =
        await db.execute(
            `DELETE FROM thanhviennhom
             WHERE nhomid = ?
               AND nguoidungid = ?`,
            [groupId, memberId]
        );

    return result.affectedRows > 0;
}


/**
 * Thành viên rời nhóm
 */
export async function leaveGroup({
    groupId,
    userId,
}) {
    const [groupRows] =
        await db.execute(
            `SELECT chuphongid
             FROM nhom
             WHERE id = ?
             LIMIT 1`,
            [groupId]
        );

    if (!groupRows[0]) {
        throw new Error(
            "Không tìm thấy nhóm"
        );
    }

    if (
        Number(groupRows[0].chuphongid) ===
        Number(userId)
    ) {
        throw new Error(
            "Chủ phòng không thể rời nhóm"
        );
    }

    const [result] =
        await db.execute(
            `DELETE FROM thanhviennhom
             WHERE nhomid = ?
               AND nguoidungid = ?`,
            [groupId, userId]
        );

    return result.affectedRows > 0;
}


/**
 * Bình chọn địa điểm
 */
export async function votePlace({
    groupId,
    userId,
    placeId,
    value,
}) {
    const member =
        await isGroupMember(
            groupId,
            userId
        );

    if (!member) {
        throw new Error(
            "Bạn không phải thành viên nhóm"
        );
    }

    const [placeRows] =
        await db.execute(
            `SELECT ct.diadiemid
             FROM nhom n
             INNER JOIN chitietlichtrinh ct
                ON ct.lichtrinhid = n.lichtrinhid
             WHERE n.id = ?
               AND ct.diadiemid = ?
             LIMIT 1`,
            [groupId, placeId]
        );

    if (!placeRows[0]) {
        throw new Error(
            "Địa điểm không thuộc lịch trình nhóm"
        );
    }

    const voteValue =
        Number(value) === 1 ? 1 : 0;

    await db.execute(
        `INSERT INTO binhchon
            (
                nhomid,
                diadiemid,
                nguoidungid,
                giatri
            )
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            giatri = VALUES(giatri),
            ngaytao = CURRENT_TIMESTAMP`,
        [
            groupId,
            placeId,
            userId,
            voteValue,
        ]
    );

    return {
        giatri: voteValue,
    };
}


/**
 * Lấy vote của nhóm
 */
export async function getVotes(groupId) {
    const [rows] = await db.execute(
        `SELECT
            bc.diadiemid,
            SUM(
                CASE
                    WHEN bc.giatri = 1
                    THEN 1
                    ELSE 0
                END
            ) AS dongy,
            SUM(
                CASE
                    WHEN bc.giatri = 0
                    THEN 1
                    ELSE 0
                END
            ) AS khongdongy
         FROM binhchon bc
         WHERE bc.nhomid = ?
         GROUP BY bc.diadiemid`,
        [groupId]
    );

    return rows;
}


/**
 * Thêm comment vào lịch trình nhóm
 */
export async function addComment({
    groupId,
    userId,
    noidung,
}) {
    const member =
        await isGroupMember(
            groupId,
            userId
        );

    if (!member) {
        throw new Error(
            "Bạn không phải thành viên nhóm"
        );
    }

    if (
        !noidung ||
        !noidung.trim()
    ) {
        throw new Error(
            "Nội dung bình luận không được để trống"
        );
    }

    const [result] =
        await db.execute(
            `INSERT INTO binhluanlichtrinh
                (
                    nhomid,
                    nguoidungid,
                    noidung
                )
             VALUES (?, ?, ?)`,
            [
                groupId,
                userId,
                noidung.trim(),
            ]
        );

    return {
        id: result.insertId,
        nhomid: groupId,
        nguoidungid: userId,
        noidung: noidung.trim(),
    };
}


/**
 * Lấy comment của nhóm
 */
export async function getComments(
    groupId,
    userId
) {
    const member =
        await isGroupMember(
            groupId,
            userId
        );

    if (!member) {
        throw new Error(
            "Bạn không phải thành viên nhóm"
        );
    }

    const [rows] =
        await db.execute(
            `SELECT
                bl.id,
                bl.noidung,
                bl.ngaytao,
                bl.nguoidungid,
                u.hoten,
                u.email,
                u.hinhanh
             FROM binhluanlichtrinh bl
             INNER JOIN nguoidung u
                ON u.id = bl.nguoidungid
             WHERE bl.nhomid = ?
             ORDER BY bl.ngaytao ASC`,
            [groupId]
        );

    return rows;
}

/**
 * Duyệt yêu cầu tham gia nhóm
 */
export async function approveMember({
    groupId,
    hostId,
    memberId,
}) {
    const isHost = await isGroupHost(
        groupId,
        hostId
    );

    if (!isHost) {
        throw new Error(
            "Bạn không phải chủ phòng"
        );
    }

    // Kiểm tra yêu cầu
    const [requests] = await db.execute(
        `SELECT id
         FROM yeucau_thanhvien
         WHERE nhomid = ?
           AND nguoidungid = ?
           AND trangthai = 'pending'
         LIMIT 1`,
        [groupId, memberId]
    );

    if (requests.length === 0) {
        throw new Error(
            "Không tìm thấy yêu cầu tham gia"
        );
    }

    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        // Đổi trạng thái yêu cầu
        await connection.execute(
            `UPDATE yeucau_thanhvien
             SET trangthai = 'approved'
             WHERE nhomid = ?
               AND nguoidungid = ?`,
            [groupId, memberId]
        );

        // Thêm vào thành viên nhóm
        await connection.execute(
            `INSERT INTO thanhviennhom
                (
                    nhomid,
                    nguoidungid,
                    vaitro
                )
             VALUES (?, ?, 0)
             ON DUPLICATE KEY UPDATE
                nguoidungid = VALUES(nguoidungid)`,
            [groupId, memberId]
        );

        await connection.commit();

        return {
            success: true,
            message: "Duyệt thành viên thành công",
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Từ chối yêu cầu tham gia nhóm
 */
/**
 * Từ chối yêu cầu tham gia nhóm
 */
export async function rejectMember({
    groupId,
    hostId,
    memberId,
}) {
    const isHost = await isGroupHost(
        groupId,
        hostId
    );

    if (!isHost) {
        throw new Error(
            "Bạn không phải chủ phòng"
        );
    }

    const [result] =
        await db.execute(
            `UPDATE yeucau_thanhvien
             SET trangthai = 'rejected'
             WHERE nhomid = ?
               AND nguoidungid = ?
               AND trangthai = 'pending'`,
            [groupId, memberId]
        );

    if (result.affectedRows === 0) {
        throw new Error(
            "Không tìm thấy yêu cầu tham gia"
        );
    }

    return {
        success: true,
        message: "Đã từ chối yêu cầu",
    };
}

/**
 * Lấy danh sách yêu cầu tham gia đang chờ
 * Chỉ host được xem
 */
export async function getPendingMembers(
    groupId,
    hostId
) {
    const isHost = await isGroupHost(
        groupId,
        hostId
    );

    if (!isHost) {
        throw new Error(
            "Chỉ chủ phòng mới được xem yêu cầu"
        );
    }

    const [rows] = await db.execute(
        `SELECT
            yc.id,
            yc.nhomid,
            yc.nguoidungid,
            yc.trangthai,
            yc.ngaytao,
            u.hoten,
            u.email,
            u.hinhanh
         FROM yeucau_thanhvien yc
         INNER JOIN nguoidung u
            ON u.id = yc.nguoidungid
         WHERE yc.nhomid = ?
           AND yc.trangthai = 'pending'
         ORDER BY yc.ngaytao ASC`,
        [groupId]
    );

    return rows;
}

/**
 * Gửi yêu cầu tham gia nhóm
 */
export async function requestJoinGroup(
    roomCode,
    userId
) {
    const group =
        await getGroupByRoomCode(
            roomCode
        );

    if (!group) {
        throw new Error(
            "Mã phòng không tồn tại"
        );
    }

    // Host thì không cần xin duyệt
    if (
        Number(group.chuphongid) ===
        Number(userId)
    ) {
        return {
            success: true,
            message: "Bạn là chủ phòng",
            alreadyMember: true,
        };
    }

    // Đã là thành viên chưa?
    const existed =
        await isGroupMember(
            group.id,
            userId
        );

    if (existed) {
        return {
            success: true,
            message: "Bạn đã là thành viên nhóm",
            alreadyMember: true,
        };
    }

    // Đã có request chưa?
    const [requests] =
        await db.execute(
            `SELECT
                id,
                trangthai
             FROM yeucau_thanhvien
             WHERE nhomid = ?
               AND nguoidungid = ?
             LIMIT 1`,
            [group.id, userId]
        );

    if (requests[0]) {
        if (
            requests[0].trangthai ===
            "pending"
        ) {
            return {
                success: true,
                message:
                    "Yêu cầu tham gia đang chờ duyệt",
                pending: true,
            };
        }

        if (
            requests[0].trangthai ===
            "approved"
        ) {
            return {
                success: true,
                message:
                    "Bạn đã được duyệt vào nhóm",
            };
        }

        // rejected → cho gửi lại
        await db.execute(
            `UPDATE yeucau_thanhvien
             SET trangthai = 'pending',
                 ngaytao = CURRENT_TIMESTAMP
             WHERE nhomid = ?
               AND nguoidungid = ?`,
            [group.id, userId]
        );

        return {
            success: true,
            message:
                "Đã gửi lại yêu cầu tham gia",
            pending: true,
        };
    }

    await db.execute(
        `INSERT INTO yeucau_thanhvien
            (
                nhomid,
                nguoidungid,
                trangthai
            )
         VALUES (?, ?, 'pending')`,
        [group.id, userId]
    );

    return {
        success: true,
        message:
            "Đã gửi yêu cầu tham gia, chờ chủ phòng duyệt",
        pending: true,
    };
}