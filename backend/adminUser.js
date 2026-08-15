import db from "./database.js";

export async function getAllUsers() {
    const [rows] = await db.execute(`
        SELECT
            id,
            google_id,
            hoten,
            hinhanh,
            email,
            vaitro,
            trangthai,
            ngaytao
        FROM nguoidung
        ORDER BY ngaytao DESC
    `);

    return rows;
}
export async function getAdminUserById(id) {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            google_id,
            hoten,
            hinhanh,
            email,
            vaitro,
            trangthai,
            ngaytao
        FROM nguoidung
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];
}
export async function updateUserStatus(id, trangthai) {
    const status = Number(trangthai);

    if (status !== 0 && status !== 1) {
        throw new Error("Trạng thái không hợp lệ.");
    }

    const user = await getAdminUserById(id);

    if (!user) {
        throw new Error("Không tìm thấy người dùng.");
    }

    await db.execute(
        `
        UPDATE nguoidung
        SET trangthai = ?
        WHERE id = ?
        `,
        [status, id]
    );

    return getAdminUserById(id);
}