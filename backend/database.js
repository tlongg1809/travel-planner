import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "travelplanner",
    port: 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(connection => {
        console.log("✅ Kết nối MySQL thành công!");
        connection.release();
    })
    .catch(error => {
        console.error("❌ Kết nối MySQL thất bại:", error.message);
    });

export default db;