import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../services/userService";

const AuthContext = createContext(null);

const STORAGE_KEY = "tp_user";

/**
 * Lưu user vào localStorage. Nếu parse lỗi thì trả về null.
 */
const readStoredUser = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => readStoredUser());
    const navigate = useNavigate();

    // Đồng bộ user xuống localStorage mỗi khi thay đổi
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    /**
     * Gọi khi Google login thành công.
     * - Gửi credential lên backend
     * - Lưu user vào state
     * - Điều hướng theo vaitro: 0 → / , 1 → /admin
     */
    const login = useCallback(
        async (credentialResponse) => {
            const credential = credentialResponse?.credential;

            if (!credential) {
                throw new Error("Không nhận được credential từ Google");
            }

            const res = await loginWithGoogle(credential);
            const { user: userFromApi, isNewAccount } = res.data;

            setUser(userFromApi);

            // Phân quyền: 0 = user, 1 = admin
            if (userFromApi.vaitro === 1) {
                navigate("/admin");
            } else {
                navigate("/");
            }

            return { user: userFromApi, isNewAccount };
        },
        [navigate]
    );

    const logout = useCallback(() => {
        setUser(null);
        navigate("/");
    }, [navigate]);

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.vaitro === 1,
        }),
        [user, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth phải được dùng bên trong AuthProvider");
    }
    return ctx;
}
