// utility functions

// formatCurrency(1500000); // "1.500.000 ₫"
export const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);


// display word 50 first character then ... for UI card
export const truncate = (str, len = 50) =>
    str.length > len ? str.substring(0, len) + "..." : str;
