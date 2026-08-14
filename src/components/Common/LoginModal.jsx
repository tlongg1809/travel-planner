import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginModal({ open, onClose }) {
    const { login } = useAuth();
    const [errorMsg, setErrorMsg] = useState("");

    // Đóng modal bằng phím Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        // Khóa scroll nền khi modal mở
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleSuccess = async (credentialResponse) => {
        try {
            setErrorMsg("");
            await login(credentialResponse);
            onClose();
        } catch (err) {
            console.error("Đăng nhập thất bại:", err);
            setErrorMsg(
                err?.response?.data?.message ||
                "Đăng nhập thất bại, vui lòng thử lại."
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Lớp nền mờ + blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Hộp modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8 animate-[fadeIn_0.2s_ease-out]">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    aria-label="Đóng"
                >
                    <X size={22} />
                </button>

                {/* Tiêu đề */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                        <span className="text-2xl">🔐</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Đăng nhập
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Sử dụng tài khoản Google để tiếp tục
                    </p>
                </div>

                {/* Nút Google */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => {
                            setErrorMsg("Đăng nhập Google thất bại");
                        }}
                        text="continue_with"
                        shape="pill"
                        width="320"
                    />
                </div>

                {errorMsg && (
                    <p className="text-sm text-red-500 text-center mt-4">
                        {errorMsg}
                    </p>
                )}

                <p className="text-xs text-gray-400 text-center mt-6">
                    Bằng việc tiếp tục, bạn đồng ý với điều khoản sử dụng của
                    chúng tôi.
                </p>
            </div>
        </div>
    );
}
