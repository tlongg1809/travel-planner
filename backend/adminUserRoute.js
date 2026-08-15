import express from "express";
import {
    getAllUsers,
    getAdminUserById,
    updateUserStatus,
} from "./adminUser.js";

const router = express.Router();


/**
 * =====================================================
 * GET /api/admin/users
 * Lấy toàn bộ người dùng
 * =====================================================
 */
router.get("/", async (req, res) => {
    try {
        const users = await getAllUsers();

        res.json(users);
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách người dùng:",
            error
        );

        res.status(500).json({
            message: "Không thể lấy danh sách người dùng.",
            error: error.message,
        });
    }
});


/**
 * =====================================================
 * GET /api/admin/users/:id
 * Lấy một người dùng
 * =====================================================
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await getAdminUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng.",
            });
        }

        res.json(user);
    } catch (error) {
        console.error(
            "Lỗi lấy người dùng:",
            error
        );

        res.status(500).json({
            message: "Không thể lấy thông tin người dùng.",
            error: error.message,
        });
    }
});


/**
 * =====================================================
 * PATCH /api/admin/users/:id/status
 * Khóa / mở khóa người dùng
 * =====================================================
 */
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { trangthai } = req.body;

        const user = await getAdminUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng.",
            });
        }

        const updatedUser = await updateUserStatus(
            id,
            trangthai
        );

        res.json({
            success: true,
            message:
                Number(trangthai) === 1
                    ? "Đã mở khóa người dùng."
                    : "Đã khóa người dùng.",
            user: updatedUser,
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật trạng thái người dùng:",
            error
        );

        res.status(400).json({
            message: error.message,
        });
    }
});


export default router;