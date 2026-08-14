import api from "./api";

/**
 * Gửi credential (id_token) từ Google lên backend.
 * Backend sẽ tự tạo user nếu chưa tồn tại (mặc định vaitro = 0).
 * Trả về { user, isNewAccount }.
 */
export const loginWithGoogle = (credential) => {
    return api.post("/auth/google", { credential });
};
