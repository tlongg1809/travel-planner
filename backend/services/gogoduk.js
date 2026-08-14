import dotenv from "dotenv";
dotenv.config();
const GOGODUK_API_KEY = process.env.GOGODUK_API_KEY;
const GOGODUK_BASE_URL = "https://api.gogoduk.com";
//Lây danh sách địa điểm theo từ khoá
export async function searchPlaces(input) {
    if (!input || input.trim().length < 2) {
        return [];
    }
     const url =
        `${GOGODUK_BASE_URL}/v1/suggest?input=${encodeURIComponent(input)}`;
        const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": GOGODUK_API_KEY
        }
    });
     if (!response.ok) {
        throw new Error(
            `GoGoDuk API lỗi: ${response.status} ${response.statusText}`
        );
    }
    const data = await response.json();
    return data.predictions || [];
}
// Lấy thông tin chi tiết + tọa độ sau khi chọn một địa điểm
export async function resolvePlace(placeId) {
    if (!placeId) {
        throw new Error("Thiếu placeId");
    }
    const url =
        `${GOGODUK_BASE_URL}/v1/place/resolve?id=${encodeURIComponent(placeId)}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": GOGODUK_API_KEY
        }
    });
    if (!response.ok) {
        throw new Error(
            `GoGoDuk Resolve API lỗi: ${response.status} ${response.statusText}`
        );
    }
    const data = await response.json();
    return data;
}