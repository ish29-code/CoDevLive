import authHeader from "@/services/authHeader";

const BASE_URL = "http://localhost:5000/api/auth";



export const deleteAccount = async () => {
    const res = await fetch(`${BASE_URL}/delete`, {
        method: "DELETE",
        headers: {
            ...authHeader(),
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Delete failed");
    }

    return data;
};


export const forgotPasswordLocal = async (email) => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader()
        },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};



// src/api/userApi.js
export const resetPasswordLocal = async ({ token, newPassword }) => {
    const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
