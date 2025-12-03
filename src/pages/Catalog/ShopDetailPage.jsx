import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    StarFilled,
    EnvironmentOutlined,
    ShopOutlined,
    CalendarOutlined,
    DownOutlined,
    LeftOutlined,
    RightOutlined,
    HeartOutlined,
    MessageOutlined,
} from "@ant-design/icons";
import { Card, Spin, Rate, Pagination, Button, Select } from "antd";
import { motion } from "framer-motion";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import productApi from "../../api/identity/productApi";
import { reviewApi } from "../../api/catalog/reviewApi";
import chatApi from "../../api/communication/chatApi";
import wishlistApi from "../../api/commerce/wishlistApi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import ProductCard from "../../components/ui/ProductCard";
import "../../styles/ShopDetailPage.css";

const formatCurrency = (value) => {
    if (value === undefined || value === null) return "Đang cập nhật";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

const formatJoinedDate = (dateString) => {
    if (!dateString) return "Mới tham gia";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} ngày trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
};

export default function ShopDetailPage() {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shopInfo, setShopInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular'); // popular, newest, sales, price-asc, price-desc
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        if (user) {
            const fetchWishlist = async () => {
                try {
                    const res = await wishlistApi.getAll(0, 100);
                    let items = [];
                    if (res?.content && Array.isArray(res.content)) {
                        items = res.content;
                    } else if (res?.data && Array.isArray(res.data)) {
                        items = res.data;
                    } else if (Array.isArray(res)) {
                        items = res;
                    }
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

    const handleWishlistToggle = async (productId) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
            return;
        }
        try {
            const isWishlisted = wishlistItems.includes(productId);
            if (isWishlisted) {
                await wishlistApi.removeProduct(productId);
                setWishlistItems(prev => prev.filter(id => id !== productId));
                toast.success("Đã xóa khỏi yêu thích");
            } else {
                await wishlistApi.addProduct(productId);
                setWishlistItems(prev => [...prev, productId]);
                toast.success("Đã thêm vào yêu thích");
            }
        } catch (error) {
            console.error("Wishlist toggle error:", error);
            toast.error("Có lỗi xảy ra");
        }
    };

    useEffect(() => {
        if (!products.length) return;

        let sortedProducts = [...products];
        switch (sortBy) {
            case 'popular':
                // Sort by rating (desc)
                sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                // Sort by id (desc) as proxy for date if createdAt not available
                sortedProducts.sort((a, b) => (b.productId || b.id) - (a.productId || a.id));
                break;
            case 'sales':
                // Sort by sold count (desc)
                sortedProducts.sort((a, b) => (b.sold || 0) - (a.sold || 0));
                break;
            case 'price-asc':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }
        setProducts(sortedProducts);
    }, [sortBy]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch shop info
                const shopRes = await productApi.getShopInfo(shopId);
                console.log("Shop Res:", shopRes);
                const shopData = shopRes.result || shopRes.data || shopRes;
                console.log("Shop Data:", shopData);
                setShopInfo(shopData);

                // Fetch products using new endpoint
                const productsRes = await productApi.getShopProducts(shopId);
                const shopProducts = Array.isArray(productsRes) ? productsRes : (productsRes.result || productsRes.data || productsRes || []);

                // Enrich products with ratings and mock price data
                const enrichedProducts = await Promise.all(shopProducts.map(async (product) => {
                    let rating = 0;
                    try {
                        const reviewsRes = await reviewApi.getProductReviews(product.productId || product.id);
                        const reviews = reviewsRes.content || reviewsRes.data || [];
                        if (reviews.length > 0) {
                            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                            rating = totalRating / reviews.length;
                        }
                    } catch (err) {
                        console.error(`Error fetching reviews for product ${product.id}`, err);
                    }

                    // Mock oldPrice and discount logic similar to HomePage
                    const originalPrice = product.price ? Math.round(product.price * 1.25) : null;
                    const discount = 20; // Fixed 20% discount as requested/mocked

                    return {
                        ...product,
                        rating: rating,
                        oldPrice: originalPrice,
                        discount: discount
                    };
                }));

                setProducts(enrichedProducts);
            } catch (error) {
                console.error("Failed to fetch shop data", error);
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchData();
        }
    }, [shopId]);

    const handleChatWithSeller = async () => {
        if (!user) {
            // toast.error("Vui lòng đăng nhập để chat với người bán");
            return;
        }

        if (!shopId) return;

        try {
            await chatApi.startConversation(shopId);
            navigate("/user/chat");
        } catch (error) {
            console.error("Failed to start conversation:", error);
            // toast.error("Không thể bắt đầu cuộc trò chuyện");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!shopInfo) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Không tìm thấy thông tin cửa hàng</p>
            </div>
        );
    }

    // Calculate shop stats
    const productCount = products.length;
    const rating = 4.9; // Mock rating
    const joinedDate = formatJoinedDate(shopInfo.user?.createdAt);

    return (
        <div className="shop-detail-container bg-[#F5F5FA] min-h-screen flex flex-col font-sans">
            <HomeHeader />

            <main className="container mx-auto max-w-[1440px] px-[50px] py-6 flex-1 flex flex-col gap-3">
                {/* Shop Info Section */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex gap-8">
                        {/* Shop Info Card */}
                        <div className="shop-info-card shrink-0 rounded-lg flex items-center justify-between pr-6" style={{ background: 'linear-gradient(90deg, #202020 0%, #404040 100%)', width: '550px' }}>
                            <div className="flex items-center gap-5">
                                <div className="shop-avatar-wrapper border-4 border-white/20">
                                    <img
                                        src={shopInfo.user?.avatar || "https://via.placeholder.com/150"}
                                        alt={shopInfo.seller?.shop_name || "Shop Avatar"}
                                        className="shop-avatar"
                                    />
                                </div>
                                <div className="shop-basic-info text-white">
                                    <h1 className="shop-name text-xl font-semibold">{shopInfo.seller?.shop_name || shopInfo.user?.full_name || "Tên Shop"}</h1>
                                    <div className="shop-status text-xs text-white/80 flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
                                        <span>Online 4 phút trước</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                icon={<MessageOutlined />}
                                onClick={handleChatWithSeller}
                                className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white hover:border-white font-medium"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                Chat Ngay
                            </Button>
                        </div>

                        {/* Shop Stats */}
                        <div className="shop-stats-grid flex-1 grid grid-cols-3 gap-y-3 gap-x-8 content-center border-l border-gray-100 pl-8">
                            <div className="shop-stat-item flex items-center gap-2 text-base">
                                <ShopOutlined className="text-lg text-gray-500" />
                                <span className="text-gray-500">Sản Phẩm:</span>
                                <span className="text-[#008ecc] font-medium">{productCount}</span>
                            </div>
                            <div className="shop-stat-item flex items-center gap-2 text-base">
                                <StarFilled className="text-lg text-[#ffce3d]" />
                                <span className="text-gray-500">Đánh Giá:</span>
                                <span className="text-[#008ecc] font-medium">{rating}</span>
                            </div>
                            <div className="shop-stat-item flex items-center gap-2 text-base whitespace-nowrap">
                                <MessageOutlined className="text-lg text-gray-500" />
                                <span className="text-gray-500">Tỉ Lệ Phản Hồi Chat:</span>
                                <span className="text-[#008ecc] font-medium">95%</span>
                            </div>
                            <div className="shop-stat-item flex items-center gap-2 text-base">
                                <CalendarOutlined className="text-lg text-gray-500" />
                                <span className="text-gray-500">Tham Gia:</span>
                                <span className="text-[#008ecc] font-medium">{joinedDate}</span>
                            </div>
                        </div >
                    </div >
                </div >

                {/* Product List Section */}
                < div className="shop-body" >
                    <div className="filter-bar mb-4 bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 text-sm">Sắp xếp theo</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    type={sortBy === 'popular' ? 'primary' : 'default'}
                                    className={sortBy === 'popular' ? 'bg-[#008ECC] border-[#008ECC]' : 'hover:text-[#008ECC] hover:border-[#008ECC]'}
                                    onClick={() => setSortBy('popular')}
                                >
                                    Phổ Biến
                                </Button>
                                <Button
                                    type={sortBy === 'newest' ? 'primary' : 'default'}
                                    className={sortBy === 'newest' ? 'bg-[#008ECC] border-[#008ECC]' : 'hover:text-[#008ECC] hover:border-[#008ECC]'}
                                    onClick={() => setSortBy('newest')}
                                >
                                    Mới Nhất
                                </Button>
                                <Button
                                    type={sortBy === 'sales' ? 'primary' : 'default'}
                                    className={sortBy === 'sales' ? 'bg-[#008ECC] border-[#008ECC]' : 'hover:text-[#008ECC] hover:border-[#008ECC]'}
                                    onClick={() => setSortBy('sales')}
                                >
                                    Bán Chạy
                                </Button>
                                <Select
                                    value={sortBy.startsWith('price') ? sortBy : null}
                                    placeholder="Giá"
                                    style={{ width: 200 }}
                                    onChange={(val) => setSortBy(val)}
                                    bordered={true}
                                    size="middle"
                                    options={[
                                        { value: 'price-asc', label: 'Giá: Thấp đến Cao' },
                                        { value: 'price-desc', label: 'Giá: Cao đến Thấp' },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-[#333]"><span className="text-[#008ecc]">1</span>/1</span>
                            <div className="flex items-center">
                                <Button
                                    icon={<LeftOutlined className="text-xs" />}
                                    disabled
                                    className="rounded-r-none border-r-0"
                                />
                                <Button
                                    icon={<RightOutlined className="text-xs" />}
                                    disabled
                                    className="rounded-l-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <motion.div
                                    key={product.productId || product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                >
                                    <ProductCard
                                        product={product}
                                        isWishlisted={wishlistItems.includes(product.productId || product.id)}
                                        onToggleWishlist={handleWishlistToggle}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-5 text-center py-10 text-gray-400">
                                Shop chưa có sản phẩm nào.
                            </div>
                        )}
                    </div>
                </div >
            </main >

            <HomeFooter />
        </div >
    );
}
