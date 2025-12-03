"use client"

import { PaymentApi } from "@/api/commerce/PaymentApi"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"


export default function VNPayPaymentReturn() {
    const [searchParams] = useSearchParams()

    const txnRef = searchParams.get("vnp_TxnRef")
    const transactionNo = searchParams.get("vnp_TransactionNo")

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        // GIẤU TxnRef và toàn bộ param khác
        if (transactionNo) {
            window.history.replaceState(
                {},
                "",
                `/payment/return?vnp_TransactionNo=${transactionNo}`
            )
        }

        // FE vẫn gọi API bằng TxnRef
        const fetchPayment = async (retryCount = 0) => {
            try {
                const res = await PaymentApi.paymentReturn(txnRef)
                if (res.data && res.data.data) {
                    setData(res.data.data)
                    setLoading(false)
                } else {
                    throw new Error("No data")
                }
            } catch (error) {
                console.error(`Attempt ${retryCount + 1} failed:`, error)

                // Retry if 404 or no data, up to 10 times (10 seconds)
                if (retryCount < 10) {
                    setTimeout(() => {
                        fetchPayment(retryCount + 1)
                    }, 1000)
                } else {
                    setLoading(false)
                }
            }
        }

        if (txnRef) {
            fetchPayment()
        } else {
            setLoading(false)
        }

    }, [txnRef, transactionNo])

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center mt-20 space-y-3">
                <Loader2 className="w-12 h-12 text-gray-500 animate-spin" />
                <p className="text-center text-gray-700 text-lg">Đang xử lý giao dịch...</p>
            </div>
        );

    if (!data)
        return (
            <div className="flex flex-col items-center justify-center mt-20 space-y-3">
                <XCircle className="w-12 h-12 text-red-500 animate-pulse" />
                <p className="text-center text-red-500 text-lg">Không tìm thấy giao dịch</p>
            </div>
        );

    const isSellerPayment = data.isSellerPayment === true
    const isSuccess = data.vnpResponseCode === "00"

    const formatPrice = (price) => {
        return Number(price).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";

        const [datePart, timePart] = isoString.split("T"); // ["2025-11-23", "20:36:51Z"]
        const [year, month, day] = datePart.split("-");
        const time = timePart.replace("Z", "");

        return `${day}/${month}/${year} ${time}`;
    };
    const decodedOrderInfo = data.vnpTxnRef ? decodeURIComponent(data.vnpTxnRef) : ""

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
                    {/* Status Header with Gradient */}
                    <div
                        className={`px-8 py-8 text-center bg-gradient-to-r ${isSuccess ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500"}`}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="w-14 h-14 text-white mx-auto mb-3 animate-bounce" strokeWidth={1.5} />
                        ) : (
                            <XCircle className="w-14 h-14 text-white mx-auto mb-3 animate-pulse" strokeWidth={1.5} />
                        )}

                        <h1 className="text-2xl font-bold text-white text-balance">
                            {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
                        </h1>

                        <p className="text-white/90 mt-1 text-sm">
                            {isSuccess ? "Cảm ơn bạn đã hoàn tất giao dịch" : "Vui lòng thử lại hoặc liên hệ hỗ trợ"}
                        </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="px-8 py-6 space-y-4">
                        {/* Amount - Primary Info */}
                        <div className="text-center pb-3 border-b border-neutral-200">
                            <p className="text-neutral-600 text-xs uppercase tracking-widest font-semibold mb-2">Số tiền</p>
                            <p className={`text-3xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                                {formatPrice(data.amount)}
                            </p>
                        </div>

                        {/* Details Compact */}
                        <div className="space-y-2">
                            {decodedOrderInfo && (
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-neutral-600 font-medium">Đơn hàng:</span>
                                    <span className="text-neutral-900 text-right">{decodedOrderInfo}</span>
                                </div>
                            )}

                            {data.vnpPayDate && (
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-neutral-600 font-medium">Thời gian:</span>
                                    <span className="text-neutral-900 text-right">{formatDate(data.vnpPayDate)}</span>
                                </div>
                            )}

                            {data.vnpTransactionCode && (
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-neutral-600 font-medium">Mã giao dịch:</span>
                                    <span className="text-neutral-900 font-mono text-xs text-right break-all">{data.vnpTransactionCode}</span>
                                </div>
                            )}

                            {data.vnpBankCode && (
                                <div className="flex justify-between items-start text-sm">
                                    <span className="text-neutral-600 font-medium">Ngân hàng:</span>
                                    <span className="text-neutral-900 text-right">{data.vnpBankCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-8 py-6 flex gap-3 border-t border-neutral-200">
                        {isSellerPayment ? (
                            // Seller: chỉ hiển thị nút "Xem gói dịch vụ"
                            <Button
                                className="flex-1 text-white font-medium rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                                onClick={() => (window.location.href = "/seller/service-packages")}
                            >
                                Xem gói dịch vụ
                            </Button>
                        ) : (
                            // Buyer: hiển thị "Trang chủ" và "Xem đơn hàng"
                            <>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium bg-transparent"
                                    onClick={() => (window.location.href = "/home")}
                                >
                                    Trang chủ
                                </Button>

                                <Button
                                    className={`flex-1 text-white font-medium rounded-lg transition-all ${isSuccess ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/50" : "bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-500/50"}`}
                                    onClick={() => (window.location.href = isSuccess ? "/user/orders" : "/cart")}
                                >
                                    {isSuccess ? "Xem đơn hàng" : "Thử lại"}
                                </Button>
                            </>
                        )}
                    </div>

                </div>

                {/* Support Text */}
                <p className="text-center text-neutral-600 text-xs mt-4">
                    {isSuccess ? (
                        <>Kiểm tra email để nhận xác nhận đơn hàng</>
                    ) : (
                        <>
                            Cần hỗ trợ?{" "}
                            <a href="/" className="text-green-600 hover:underline font-medium">
                                Liên hệ với chúng tôi
                            </a>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}
