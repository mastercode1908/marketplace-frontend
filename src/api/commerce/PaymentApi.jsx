import axiosInstance from "../axiosInstance";

/**
 * API service cho checkout
 */
export const PaymentApi = {
    // Thanh toán
    paymentReturn: (txnRef) => axiosInstance.get(`/payment/vnpay/return?vnp_TxnRef=${txnRef}`)
};
