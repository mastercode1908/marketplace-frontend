import { useState, useEffect } from "react";
import { Card, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { StarFilled, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import productApi from "../../api/identity/productApi";
import { reviewApi } from "../../api/catalog/reviewApi";
import wishlistApi from "../../api/commerce/wishlistApi";
import { useAuth } from "../../hooks/useAuth";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import "../../styles/HomePage.css";

export default function PromotionDetailPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

    const FALLBACK_IMAGE = "https://via.placeholder.com/248x242?text=No+Image";

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Animation variants (copied from HomePage)
    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    const cardHoverVariants = {
        rest: { scale: 1, y: 0 },
        hover: {
            scale: 1.02,
            y: -8,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productApi.getAll();
                let productList = [];

                if (Array.isArray(res)) {
                    productList = res;
                } else if (res?.data && Array.isArray(res.data)) {
                    productList = res.data;
                } else if (res?.result && Array.isArray(res.result)) {
                    productList = res.result;
                }

                // Filter valid products
                const validProducts = productList.filter(p => p.productStatus === "Approved" && !p.deletedAt);

                // Fetch reviews for ratings
                const productsWithRatings = await Promise.all(validProducts.map(async (product) => {
                    // Get first image
                    const firstMedia = product.media?.length > 0
                        ? product.media.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]
                        : null;
                    const imageUrl = firstMedia?.url || FALLBACK_IMAGE;

                    // Calculate discount (mock)
                    const originalPrice = product.price ? Math.round(product.price * 1.25) : null;
                    const discount = originalPrice && product.price
                        ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
                        : 0;

                    try {
                        const reviewsRes = await reviewApi.getProductReviews(product.productId || product.id);
                        const reviews = reviewsRes.content || reviewsRes.data || [];
                        let rating = 0;
                        if (reviews.length > 0) {
                            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                            rating = totalRating / reviews.length;
                        }
                        return {
                            ...product,
                            id: product.productId || product.id,
                            image: imageUrl,
                            rating: rating,
                            oldPrice: originalPrice,
                            discount: discount
                        };
                    } catch (err) {
                        return {
                            ...product,
                            id: product.productId || product.id,
                            image: imageUrl,
                            rating: 0,
                            oldPrice: originalPrice,
                            discount: discount
                        };
                    }
                }));

                setProducts(productsWithRatings);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch wishlist
    useEffect(() => {
        if (user) {
            const fetchWishlist = async () => {
                try {
                    const res = await wishlistApi.getAll(0, 100);
                    let items = [];
                    if (res?.content && Array.isArray(res.content)) items = res.content;
                    else if (res?.data && Array.isArray(res.data)) items = res.data;
                    else if (Array.isArray(res)) items = res;

                    const ids = items.map(item => {
                        const id = item.productId || item.product_id || item.product?.productId || item.product?.id;
                        return Number(id);
                    }).filter(id => !isNaN(id));

                    setWishlistItems(ids);
                } catch (error) {
                    console.error("Error fetching wishlist:", error);
                }
            };
            fetchWishlist();
        }
    }, [user]);

    const handleToggleWishlist = async (productId) => {
        if (!productId) {
            toast.error("Không tìm thấy sản phẩm");
            return;
        }
        if (!user) {
            toast.error("Vui lòng đăng nhập để sử dụng wishlist");
            return;
        }

        setWishlistLoadingId(productId);
        const numProductId = Number(productId);
        const isWishlisted = wishlistItems.includes(numProductId);

        try {
            if (isWishlisted) {
                await wishlistApi.removeProduct(numProductId);
                setWishlistItems(prev => prev.filter(id => id !== numProductId));
                toast.success("Đã xóa khỏi danh sách yêu thích");
            } else {
                await wishlistApi.addProduct(numProductId);
                setWishlistItems(prev => [...prev, numProductId]);
                toast.success("Đã thêm vào danh sách yêu thích");
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            toast.error("Không thể cập nhật wishlist");
        } finally {
            setWishlistLoadingId(null);
        }
    };

    const renderWishlistHeart = (productId) => (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                handleToggleWishlist(productId);
            }}
            className="absolute top-2 left-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200"
            style={{
                border: "none",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            disabled={wishlistLoadingId === productId}
        >
            {wishlistItems.includes(Number(productId)) ? (
                <HeartFilled style={{ fontSize: "14px", color: "#FF4D4F" }} />
            ) : (
                <HeartOutlined style={{ fontSize: "14px", color: wishlistLoadingId === productId ? "#999999" : "#FF4D4F" }} />
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F5F5FA] flex flex-col">
            <HomeHeader />

            <main className="flex-grow">
                <div className="container mx-auto max-w-[1440px] px-[53px] relative py-8">
                    {/* Banner Section */}
                    <div className="mb-12">
                        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg group">
                            <img
                                src="https://via.placeholder.com/1200x400?text=Banner+Quang+Cao+(Hinh+anh+se+them+sau)"
                                alt="Promotion Banner"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                                <h1 className="text-white text-3xl md:text-5xl font-bold mb-2">
                                    Siêu Sale Mùa Hè
                                </h1>
                                <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                                    Khám phá những ưu đãi tốt nhất dành cho bạn. Giảm giá lên đến 50% cho các sản phẩm công nghệ.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product List Section */}
                    <div className="mb-8">
                        <div className="flex flex-col mb-6">
                            <h2 className="text-2xl font-bold text-[#666666] mb-2" style={{ fontSize: "24px", lineHeight: "1.25em", fontWeight: 700 }}>
                                Danh Sách Sản Phẩm
                            </h2>
                            <div className="bg-[#008ECC]" style={{ width: "245px", height: "3px" }}></div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        custom={index}
                                    >
                                        <motion.div
                                            variants={cardHoverVariants}
                                            initial="rest"
                                            whileHover="hover"
                                            style={{ position: "relative" }}
                                        >
                                            <Link to={`/product/${product.id}`} style={{ textDecoration: "none", display: "block" }}>
                                                <Card
                                                    hoverable
                                                    cover={
                                                        <motion.div
                                                            className="relative overflow-hidden"
                                                            style={{ borderRadius: "15px 15px 0 0" }}
                                                            whileHover={{ scale: 1.05 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <img
                                                                alt={product.name || "Sản phẩm"}
                                                                src={product.image || FALLBACK_IMAGE}
                                                                className="w-full object-cover"
                                                                style={{ height: "250px", width: "100%" }}
                                                                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                                            />
                                                            {product.discount > 0 && (
                                                                <motion.div
                                                                    className="absolute top-2 right-2 bg-[#05ABF3] text-white text-xs font-semibold px-2 py-1 rounded z-10"
                                                                    style={{ fontSize: "11px", lineHeight: "1.636em" }}
                                                                    initial={{ scale: 0, rotate: -180 }}
                                                                    animate={{ scale: 1, rotate: 0 }}
                                                                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                                >
                                                                    {product.discount}%
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                    }
                                                    style={{
                                                        borderRadius: "15px",
                                                        border: "none",
                                                        background: "white",
                                                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                                                    }}
                                                    className="transition-all duration-300 hover:shadow-[0px_10px_23px_rgba(0,0,0,0.1),0px_41px_41px_rgba(0,0,0,0.09),0px_93px_56px_rgba(0,0,0,0.05)]"
                                                >
                                                    <div className="product-info" style={{ background: "white", borderRadius: "0 0 15px 15px", padding: "6px" }}>
                                                        <h3 className="text-base font-normal text-[#222222] mb-0 line-clamp-2" style={{ fontSize: "15px", lineHeight: "1.1em", fontWeight: 400 }}>
                                                            {product.name || "Sản phẩm"}
                                                        </h3>
                                                        <div className="h-px bg-[#EDEDED] my-[1px]"></div>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-base font-semibold text-[#008ECC]" style={{ fontSize: "16px", lineHeight: "1em" }}>
                                                                    {formatPrice(product.price || 0)}
                                                                </div>
                                                                {product.oldPrice && product.oldPrice > product.price && (
                                                                    <div className="text-base text-[#9E9EB7] line-through" style={{ fontSize: "14px", lineHeight: "1em" }}>
                                                                        {formatPrice(product.oldPrice)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <StarFilled className="text-yellow-400" style={{ fontSize: "14px" }} />
                                                                <span className="text-sm text-[#757575]" style={{ fontSize: "14px", fontWeight: 600 }}>
                                                                    {product.rating ? Number(product.rating).toFixed(1) : "0.0"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                            <div style={{ position: "absolute", top: "8px", left: "8px", zIndex: 20 }}>
                                                {renderWishlistHeart(product.id)}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}

                                {products.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        Chưa có sản phẩm nào.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}
