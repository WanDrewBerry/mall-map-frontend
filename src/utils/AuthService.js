import { jwtDecode } from "jwt-decode";
import api from "./api";
const AuthService = {
    login: (token) => {
        localStorage.setItem("accessToken", token);
        try {
            const decoded = jwtDecode(token);
            if (decoded.id) {
                localStorage.setItem("userId", decoded.id);
                localStorage.setItem("username", decoded.username || "Guest");
                localStorage.setItem("role", decoded.role || "user");
                console.log("✅ Stored user:", decoded);
            }
            else {
                console.error("🚨 Error: No user ID found in decoded token!");
            }
        }
        catch (error) {
            console.error("❌ Token decoding failed:", error);
        }
    },
    logout: (navigate) => {
        console.log("🚨 Logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.dispatchEvent(new Event("storage"));
        if (navigate) {
            navigate("/");
        }
    },
    isAuthenticated: () => {
        const token = localStorage.getItem("accessToken");
        if (!token)
            return false;
        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                console.log("🚨 Session expired! Auto logging out...");
                return false;
            }
            return true;
        }
        catch (error) {
            console.error("❌ Token decoding failed:", error);
            return false;
        }
    },
    checkSessionExpiration: (navigate) => {
        const token = localStorage.getItem("accessToken");
        if (!token)
            return;
        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                console.log("🚨 Token expired, logging out...");
                AuthService.logout(navigate);
            }
        }
        catch (error) {
            console.error("❌ Token decoding failed:", error);
        }
    },
    getUser: () => {
        const token = localStorage.getItem("accessToken");
        if (!token)
            return null;
        try {
            const decoded = jwtDecode(token);
            return {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            };
        }
        catch (error) {
            console.error("❌ Token decoding failed:", error);
            return null;
        }
    },
    getIdentifier: () => {
        const user = AuthService.getUser();
        return user?.id || null;
    },
    getToken: () => {
        return localStorage.getItem("accessToken");
    },
    checkStatus: async () => {
        try {
            const response = await api.get("/auth/status");
            // ✅ Explicitly assert the expected shape
            const data = response.data;
            return {
                status: Boolean(data.status),
                user: data.user ?? null
            };
        }
        catch (err) {
            const error = err;
            console.error("❌ AuthService checkStatus error:", error.message);
            return {
                status: false,
                user: null
            };
        }
    }
};
export default AuthService;
