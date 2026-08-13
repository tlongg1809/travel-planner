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