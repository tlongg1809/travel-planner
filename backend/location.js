import db from "./database.js";

export async function getCities() {

    const [rows] = await db.execute(`
        SELECT DISTINCT tinhthanh
        FROM diadiem
        WHERE tinhthanh IS NOT NULL
          AND tinhthanh != ''
        ORDER BY tinhthanh ASC
    `);

    return rows;
}


export async function getDistricts(city) {

    const [rows] = await db.execute(`
        SELECT DISTINCT quanhuyen
        FROM diadiem
        WHERE tinhthanh = ?
          AND quanhuyen IS NOT NULL
          AND quanhuyen != ''
        ORDER BY quanhuyen ASC
    `, [city]);

    return rows;
}