// Dùng chung validate form (vd khi login, register)

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isEmpty = (value) => !value || value.trim() === "";
