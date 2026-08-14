import db from "./database.js";

export async function getCategories() {
    const [rows] = await db.execute(`
        SELECT
            id,
            tendanhmuc
        FROM danhmuc
        ORDER BY id ASC
    `);

    return rows;
}
// Lấy danh mục theo ID
export async function getCategoryById(id) {
    const [rows] = await db.query("SELECT * FROM danhmuc WHERE id = ?", [id]);
    return rows[0];
} 
// Thêm danh mục mới
export async function createCategory(tendanhmuc) {
    const [result] = await db.query(
        `
        INSERT INTO danhmuc (tendanhmuc)
        VALUES (?)
        `,
        [tendanhmuc]
    );
    return {
        id: result.insertId,
        tendanhmuc
    };
}
// Cập nhật danh mục theo ID
export async function updateCategory(id, tendanhmuc) {
    const [result] = await db.query(
        `
        UPDATE danhmuc
        SET tendanhmuc = ?
        WHERE id = ?
        `,
        [tendanhmuc, id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return {
        id: Number(id),
        tendanhmuc
    };
}
// Xóa danh mục theo ID
export async function deleteCategory(id) {
    const [result] = await db.query(
        `
        DELETE FROM danhmuc
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows > 0;
}