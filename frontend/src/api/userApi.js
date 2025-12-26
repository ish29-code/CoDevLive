const BASE_URL = "http://localhost:5000/api/auth";


export const deleteAccount = async () => {
    const res = await fetch(`${BASE_URL}/delete`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Delete failed");
    }

    return data;
};