export const authHeader = () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    // ✅ If not logged in, return empty headers
    if (!token || !userRaw) return {};

    const user = JSON.parse(userRaw);

    return {
        Authorization: `Bearer ${token}`,
        "x-auth-type": user.provider === "local" ? "jwt" : "firebase",
    };
};

export default authHeader;