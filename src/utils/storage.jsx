// Dung de thao tác localStorage/sessionStorage an toan

export const storage = {
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
        localStorage.removeItem(key);
    },
    clear: () => {
        localStorage.clear();
    },
};


// 🔹 Tổng kết
// Đây là helper object để thao tác localStorage:
// Tự động parse/stringify JSON
// Gọn, dễ dùng, tránh lỗi parse JSON
// Bạn có thể dùng nó để lưu:
// Token đăng nhập
// Thông tin user
// Giỏ hàng (cart)
// Cài đặt người dùng