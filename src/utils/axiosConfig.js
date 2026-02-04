export function axiosConfig() {
    if (typeof window !== "undefined") {
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            withCredentials: true
        };
    }
    return {
        headers: {}
    };
}
