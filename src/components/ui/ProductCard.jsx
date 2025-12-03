import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import { StarFilled, StarOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const formatCurrency = (value) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

const ProductCard = ({ product, isWishlisted, onToggleWishlist, className = "" }) => {
    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleWishlist(product.productId || product.id);
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className={`relative h-full ${className}`}
        >
            <Link to={`/product/${product.productId || product.id}`} className="block h-full">
                <Card
                    hoverable
                    className="h-full flex flex-col transition-all duration-300 hover:shadow-[0px_10px_23px_rgba(0,0,0,0.1),0px_41px_41px_rgba(0,0,0,0.09),0px_93px_56px_rgba(0,0,0,0.05)]"
                    style={{
                        borderRadius: "15px",
                        border: "none",
                        background: "white",
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                        overflow: "hidden",
                    }}
                    cover={
                        <div className="relative pt-[92%] overflow-hidden">
                            <img
                                alt={product.name}
                                src={product.media?.[0]?.url || product.image || "https://via.placeholder.com/300"}
                                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/300";
                                }}
                            />
                            {product.discount > 0 && (
                                <div className="absolute top-2 right-2 bg-[#05ABF3] text-white text-xs font-semibold px-2 py-1 rounded z-10">
                                    -{product.discount}%
                                </div>
                            )}
                        </div>
                    }
                    bodyStyle={{
                        padding: "16px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <h3
                            className="text-base font-normal text-[#222222] mb-1 line-clamp-2"
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.125em",
                                fontWeight: 400,
                                minHeight: "54px",
                            }}
                        >
                            {product.name}
                        </h3>
                        <div className="h-px bg-[#EDEDED] my-2"></div>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                        <div>
                            <div
                                className="text-[#008ECC] font-semibold"
                                style={{ fontSize: "16px", lineHeight: "1.125em" }}
                            >
                                {formatCurrency(product.price)}
                            </div>
                            {product.oldPrice && product.oldPrice > product.price && (
                                <div
                                    className="text-[#9E9EB7] line-through"
                                    style={{ fontSize: "14px", lineHeight: "1.125em" }}
                                >
                                    {formatCurrency(product.oldPrice)}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <StarFilled style={{ fontSize: "14px", color: "#fadb14" }} />
                            <span
                                className="text-[#757575]"
                                style={{ fontSize: "14px", fontWeight: 600 }}
                            >
                                {product.rating !== undefined ? Number(product.rating).toFixed(1) : "0.0"}
                            </span>
                        </div>
                    </div>
                </Card>
            </Link>

            {/* Wishlist Button */}
            <div
                className="absolute top-2 left-2 z-20 cursor-pointer"
                onClick={handleWishlistClick}
            >
                <div className="bg-white/90 rounded-full p-1.5 shadow-md hover:bg-white transition-all duration-200 flex items-center justify-center w-8 h-8">
                    {isWishlisted ? (
                        <HeartFilled style={{ fontSize: "16px", color: "#FF4D4F" }} />
                    ) : (
                        <HeartOutlined style={{ fontSize: "16px", color: "#FF4D4F" }} />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
