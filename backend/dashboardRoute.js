import express from "express";

import {
    getDashboardOverview,
    getPopularPlaces,
    getUserStatistics,
} from "./dashboard.js";

const router = express.Router();


/*
    GET /api/admin/dashboard/overview
*/
router.get("/overview", async (req, res) => {
    try {
        const data = await getDashboardOverview();

        res.json(data);
    } catch (error) {
        console.error(
            "Lỗi lấy thống kê tổng quan:",
            error
        );

        res.status(500).json({
            message: "Không thể lấy thống kê tổng quan",
            error: error.message,
        });
    }
});


/*
    GET /api/admin/dashboard/popular-places
*/
router.get("/popular-places", async (req, res) => {
    try {
        const data = await getPopularPlaces();

        res.json(data);
    } catch (error) {
        console.error(
            "Lỗi lấy địa điểm phổ biến:",
            error
        );

        res.status(500).json({
            message: "Không thể lấy địa điểm phổ biến",
            error: error.message,
        });
    }
});


/*
    GET /api/admin/dashboard/users
*/
router.get("/users", async (req, res) => {
    try {
        const data = await getUserStatistics();

        res.json(data);
    } catch (error) {
        console.error(
            "Lỗi lấy thống kê người dùng:",
            error
        );

        res.status(500).json({
            message: "Không thể lấy thống kê người dùng",
            error: error.message,
        });
    }
});


export default router;