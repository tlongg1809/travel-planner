import db from "./database.js";

/**
 * Tìm người dùng theo google_id
 * Trả về row nếu tồn tại, ngược lại trả về undefined
 */
export async function findUserByGoogleId(googleId) {
    const [rows] = await db.execute(
        `SELECT
            id,
            google_id,
            hoten,
            email,
            vaitro,
            trangthai
        FROM nguoidung
        WHERE google_id = ?
        LIMIT 1`,
        [googleId]
    );

    return rows[0];
}


/**
 * Tạo mới người dùng (đăng ký tự động khi đăng nhập lần đầu)
 * Mặc định vaitro = 0 (người dùng thường), trangthai = 1 (đang hoạt động)
 */
export async function createUser({
    googleId,
    email,
    hoten,
    vaitro = 0,
    trangthai = 1,
}) {
    const [result] = await db.execute(
        `INSERT INTO nguoidung
            (google_id, hoten, email, vaitro, trangthai)
        VALUES (?, ?, ?, ?, ?)`,
        [googleId, hoten, email, vaitro, trangthai]
    );

    return getUserById(result.insertId);
}


/**
 * Lấy người dùng theo id
 */
export async function getUserById(id) {
    const [rows] = await db.execute(
        `SELECT
            id,
            google_id,
            hoten,
            email,
            vaitro,
            trangthai
        FROM nguoidung
        WHERE id = ?
        LIMIT 1`,
        [id]
    );

    return rows[0];
}


/**
 * Tìm hoặc tạo người dùng từ thông tin Google
 * - Nếu đã tồn tại theo google_id → trả về user
 * - Nếu chưa tồn tại → tạo mới với vaitro = 0
 */
export async function findOrCreateGoogleUser({
    googleId,
    email,
    hoten,
}) {
    const existing = await findUserByGoogleId(googleId);

    if (existing) {
        return { user: existing, isNew: false };
    }

    const created = await createUser({
        googleId,
        email,
        hoten,
        vaitro: 0,
        trangthai: 1,
    });

    return { user: created, isNew: true };
}
