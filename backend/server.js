import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
    getPlaces,
    getPlaceDetail
} from "./place.js";
import { getCategories } from "./category.js";
import {
    getCities,
    getDistricts
} from "./location.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/* Middleware */

app.use(cors());

app.use(express.json());


/* Test */

app.get("/api/test", (req, res) => {

    res.json({
        message: "Node.js Backend hoạt động!"
    });

});


/* Lấy danh sách địa điểm */

app.get("/api/places", async (req, res) => {

    try {

        const {
            tinhthanh,
            quanhuyen,
            danhmucid,
            search,
            sort
        } = req.query;


        console.log("REQUEST /places:", req.query);


        const places = await getPlaces({

            tinhthanh: tinhthanh || "",
            quanhuyen: quanhuyen || "",
            danhmucid: danhmucid || "",
            search: search || "",
            sort: sort || "popular"

        });


        res.json(places);

    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "LỖI API /api/places:"
        );

        console.error(error);

        console.error(
            "================================="
        );


        res.status(500).json({

            message:
                "Không thể lấy danh sách địa điểm",

            error:
                error.message

        });

    }

});

// =====================================================
// CHI TIẾT ĐỊA ĐIỂM
// =====================================================

app.get("/api/places/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const place =
            await getPlaceDetail(id);


        if (!place) {

            return res.status(404).json({
                message: "Không tìm thấy địa điểm"
            });

        }


        res.json(place);

    } catch (error) {

        console.error(
            "Lỗi lấy chi tiết địa điểm:",
            error
        );

        res.status(500).json({
            message:
                "Không thể lấy chi tiết địa điểm"
        });

    }

});


/* Lấy danh sách danh mục */
app.get("/api/categories", async (req, res) => {

    try {

        const categories = await getCategories();

        res.json(categories);

    } catch (error) {

        console.error("Lỗi lấy danh mục:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách danh mục"
        });

    }

});

/* ==========================Lấy danh sách tỉnh thành========================= */

app.get("/api/locations/cities", async (req, res) => {

    try {

        const cities = await getCities();

        res.json(cities);

    } catch (error) {

        console.error("Lỗi lấy tỉnh/thành:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách tỉnh/thành"
        });

    }

});

/* ==========================Lấy danh sách quận huyện========================= */

app.get("/api/locations/districts", async (req, res) => {

    try {

        const { city } = req.query;

        if (!city) {

            return res.status(400).json({
                message: "Thiếu tỉnh/thành"
            });

        }

        const districts = await getDistricts(city);

        res.json(districts);

    } catch (error) {

        console.error("Lỗi lấy quận/huyện:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách quận/huyện"
        });

    }

});

/* Start server */

app.listen(PORT, () => {

    console.log(
        `Server đang chạy tại http://localhost:${PORT}`
    );

});