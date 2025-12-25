const BASE_URL = "http://localhost:5000/api/settings";

/* ================= AUTH HEADER ================= */
const authHeader = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
};

/* ================= GET SETTINGS ================= */
export const getSettings = async () => {
    const res = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: {
            ...authHeader(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch settings");
    }

    return res.json();
};

/* ================= UPDATE SETTINGS ================= */
export const updateSettings = async (payload) => {
    const res = await fetch(`${BASE_URL}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to update settings");
    }

    return res.json();
};

/* ================= SETUP 2FA ================= */
export const setup2FA = async () => {
    const res = await fetch(`${BASE_URL}/2fa/setup`, {
        method: "POST",
        headers: {
            ...authHeader(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to setup 2FA");
    }

    return res.json();
    // expected response:
    // { qrCode: "data:image/png;base64,..." }
};

/* ================= VERIFY 2FA ================= */
export const verify2FA = async (otp) => {
    const res = await fetch(`${BASE_URL}/2fa/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify({ otp }),
    });

    if (!res.ok) {
        throw new Error("Invalid OTP");
    }

    return res.json();
};
