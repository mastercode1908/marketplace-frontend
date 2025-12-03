import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, Spin, Input, Select, Button, Rate, InputNumber, Divider, Breadcrumb, Pagination } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  StarFilled,
  DeleteOutlined,
  HeartOutlined,
  HeartFilled,
  RightOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import productApi from "../../api/identity/productApi";
import { reviewApi } from "../../api/catalog/reviewApi";
import wishlistApi from "../../api/commerce/wishlistApi";

import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import "../../styles/CategoryDetailPage.css";

const { Option } = Select;

// Mock data for testing
const MOCK_PRODUCTS = [
  {
    productId: 1,
    name: "iPhone 15 Pro Max 256GB",
    price: 28990000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 5,
    media: [{ url: "https://via.placeholder.com/248x242?text=iPhone+15", position: 0 }],
  },
  {
    productId: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: 24990000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 4.5,
    media: [{ url: "https://via.placeholder.com/248x242?text=Galaxy+S24", position: 0 }],
  },
  {
    productId: 3,
    name: "Xiaomi 14 Pro",
    price: 19990000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 4,
    media: [{ url: "https://via.placeholder.com/248x242?text=Xiaomi+14", position: 0 }],
  },
  {
    productId: 4,
    name: "MacBook Pro M3 14 inch",
    price: 45990000,
    categoryId: 2,
    productStatus: "Approved",
    rating: 5,
    media: [{ url: "https://via.placeholder.com/248x242?text=MacBook+Pro", position: 0 }],
  },
  {
    productId: 5,
    name: "Dell XPS 15",
    price: 38990000,
    categoryId: 2,
    productStatus: "Approved",
    rating: 4.8,
    media: [{ url: "https://via.placeholder.com/248x242?text=Dell+XPS", position: 0 }],
  },
  {
    productId: 6,
    name: "Apple Watch Series 9",
    price: 10990000,
    categoryId: 3,
    productStatus: "Approved",
    rating: 4.7,
    media: [{ url: "https://via.placeholder.com/248x242?text=Apple+Watch", position: 0 }],
  },
  {
    productId: 7,
    name: "Giày Nike Air Max 270",
    price: 2990000,
    categoryId: 4,
    productStatus: "Approved",
    rating: 4.5,
    media: [{ url: "https://via.placeholder.com/248x242?text=Nike+Air+Max", position: 0 }],
  },
  {
    productId: 8,
    name: "Sách 'Đắc Nhân Tâm'",
    price: 89000,
    categoryId: 5,
    productStatus: "Approved",
    rating: 5,
    media: [{ url: "https://via.placeholder.com/248x242?text=Sach", position: 0 }],
  },
  {
    productId: 9,
    name: "Sony WH-1000XM5",
    price: 8490000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 4.8,
    media: [{ url: "https://via.placeholder.com/248x242?text=Sony+Headphone", position: 0 }],
  },
  {
    productId: 10,
    name: "iPad Pro M2 11 inch",
    price: 21990000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 4.9,
    media: [{ url: "https://via.placeholder.com/248x242?text=iPad+Pro", position: 0 }],
  },
  {
    productId: 11,
    name: "Asus ROG Zephyrus G14",
    price: 42990000,
    categoryId: 2,
    productStatus: "Approved",
    rating: 4.7,
    media: [{ url: "https://via.placeholder.com/248x242?text=Asus+ROG", position: 0 }],
  },
  {
    productId: 12,
    name: "Logitech MX Master 3S",
    price: 2490000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 4.8,
    media: [{ url: "https://via.placeholder.com/248x242?text=Logitech+Mouse", position: 0 }],
  },
  {
    productId: 13,
    name: "Kindle Paperwhite 5",
    price: 3490000,
    categoryId: 1,
    productStatus: "Approved",
    rating: 4.6,
    media: [{ url: "https://via.placeholder.com/248x242?text=Kindle", position: 0 }],
  },
  {
    productId: 14,
    name: "HP Spectre x360",
    price: 35990000,
    categoryId: 2,
    productStatus: "Approved",
    rating: 4.9,
    media: [{ url: "https://via.placeholder.com/248x242?text=HP+Spectre", position: 0 }],
  },
  {
    productId: 15,
    name: "Samsung Galaxy Watch 6",
    price: 7990000,
    categoryId: 3,
    productStatus: "Approved",
    rating: 4.6,
    media: [{ url: "https://via.placeholder.com/248x242?text=Galaxy+Watch", position: 0 }],
  },
];

// Set to true to use mock data instead of API
const USE_MOCK_DATA = false;

const PRICE_RANGES = [
  { label: "Dưới 100.000", min: 0, max: 100000 },
  { label: "100.000 -> 240.000", min: 100000, max: 240000 },
  { label: "240.000 -> 500.000", min: 240000, max: 500000 },
  { label: "Trên 500.000", min: 500000, max: null },
];

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Filter states
  const [selectedRating, setSelectedRating] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [tempPriceRange, setTempPriceRange] = useState({ min: null, max: null });

  // Sort state
  const [sortBy, setSortBy] = useState("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const FALLBACK_IMAGE = "https://via.placeholder.com/248x242?text=No+Image";

  // Fetch wishlist to check status
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

  useEffect(() => {
    fetchProducts();
  }, [keyword]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, keyword, sortBy, selectedRating, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
        return;
      }

      // Fetch all products
      const productsRes = await productApi.getAll();
      if (productsRes?.success && productsRes?.data) {
        const rawProducts = productsRes.data.filter((product) =>
          product.productStatus === "Approved" && !product.deletedAt
        );

        // Fetch ratings for each product
        const productsWithRatings = await Promise.all(rawProducts.map(async (product) => {
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

          return {
            ...product,
            rating: rating || 0
          };
        }));

        setProducts(productsWithRatings);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(MOCK_PRODUCTS);
      toast.info("Đang sử dụng dữ liệu mẫu để test");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term (keyword) from URL
    if (keyword) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(keyword.trim().toLowerCase())
      );
    }



    // Filter by Rating
    if (selectedRating) {
      filtered = filtered.filter((product) => (product.rating || 0) >= selectedRating);
    }

    // Filter by Price
    if (priceRange.min !== null) {
      filtered = filtered.filter((product) => (product.price || 0) >= priceRange.min);
    }
    if (priceRange.max !== null) {
      filtered = filtered.filter((product) => (product.price || 0) <= priceRange.max);
    }

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi"));
        break;
      case "newest":
        // Mock sorting by newest (assuming higher ID is newer for mock data)
        filtered.sort((a, b) => (b.productId || b.id) - (a.productId || a.id));
        break;
      case "bestselling":
        // Mock sorting by bestselling (random for now)
        filtered.sort((a, b) => 0.5 - Math.random());
        break;
      case "relevance":
      default:
        // Keep original order (relevance)
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleToggleWishlist = async (productId, e) => {
    e.stopPropagation();
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
      const message = error.response?.data?.message || error.message || "Không thể cập nhật wishlist";
      toast.error(message);
    } finally {
      setWishlistLoadingId(null);
    }
  };

  const getProductImage = (product) => {
    if (product.media && product.media.length > 0) {
      const sortedMedia = product.media.sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
      return sortedMedia[0].url || FALLBACK_IMAGE;
    }
    return FALLBACK_IMAGE;
  };

  const calculateDiscount = (product) => {
    if (!product.price) return 0;
    const originalPrice = Math.round(product.price * 1.25);
    if (originalPrice > product.price) {
      return Math.round(((originalPrice - product.price) / originalPrice) * 100);
    }
    return 0;
  };

  const handleApplyPriceFilter = () => {
    setPriceRange({
      min: tempPriceRange.min,
      max: tempPriceRange.max
    });
  };

  const handleClearPriceFilter = () => {
    setTempPriceRange({ min: null, max: null });
    setPriceRange({ min: null, max: null });
  };

  if (loading) {
    return (
      <div className="search-result-page">
        <HomeHeader />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="search-result-page min-h-screen bg-[#F5F5FA]">
      <HomeHeader />

      <div className="container mx-auto max-w-[1440px] px-[50px] py-10">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb
            separator={<RightOutlined style={{ fontSize: '10px' }} />}
            items={[
              { title: <Link to="/home">Trang chủ</Link> },
              { title: `Kết quả tìm kiếm "${keyword}"` },
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-[250px] flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 uppercase text-gray-800">
                <FilterOutlined /> Bộ lọc tìm kiếm
              </h3>

              {/* Rating Filter */}
              <div className="mb-5">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Đánh giá</h4>
                <div className="flex flex-col gap-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      className={`flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded hover:bg-gray-50 transition-colors ${selectedRating === star ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedRating(selectedRating === star ? null : star)}
                    >
                      <Rate disabled defaultValue={star} className="text-sm" style={{ fontSize: 14 }} />
                      <span className="text-sm text-gray-600">trở lên</span>
                    </div>
                  ))}
                </div>
              </div>

              <Divider className="my-4" />

              {/* Price Filter */}
              <div className="mb-5">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Giá</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRICE_RANGES.map((range, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs border transition-all ${priceRange.min === range.min && priceRange.max === range.max
                        ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                      onClick={() => {
                        setPriceRange({ min: range.min, max: range.max });
                        setTempPriceRange({ min: range.min, max: range.max });
                      }}
                    >
                      {range.label}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Tự nhập khoảng giá</p>
                  <div className="flex items-center gap-2 mb-3">
                    <InputNumber
                      placeholder="Từ"
                      value={tempPriceRange.min}
                      onChange={(val) => setTempPriceRange(prev => ({ ...prev, min: val }))}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      className="w-full text-sm"
                      size="middle"
                    />
                    <span className="text-gray-400">-</span>
                    <InputNumber
                      placeholder="Đến"
                      value={tempPriceRange.max}
                      onChange={(val) => setTempPriceRange(prev => ({ ...prev, max: val }))}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      className="w-full text-sm"
                      size="middle"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      onClick={handleApplyPriceFilter}
                      className="flex-1 bg-[#008ECC] hover:bg-[#007AB3] text-sm"
                    >
                      Áp dụng
                    </Button>
                    <Button
                      onClick={handleClearPriceFilter}
                      className="text-red-500 border-red-200 hover:border-red-400 hover:text-red-600 text-sm px-3"
                      icon={<DeleteOutlined />}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Products Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="filter-bar mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Sắp xếp theo:</span>
                <div className="flex items-center gap-2">

                  <Button
                    type={sortBy === 'newest' ? 'primary' : 'default'}
                    className={sortBy === 'newest' ? 'bg-[#008ECC] border-[#008ECC]' : 'hover:text-[#008ECC] hover:border-[#008ECC]'}
                    onClick={() => setSortBy('newest')}
                  >
                    Mới Nhất
                  </Button>
                  <Button
                    type={sortBy === 'bestselling' ? 'primary' : 'default'}
                    className={sortBy === 'bestselling' ? 'bg-[#008ECC] border-[#008ECC]' : 'hover:text-[#008ECC] hover:border-[#008ECC]'}
                    onClick={() => setSortBy('bestselling')}
                  >
                    Bán Chạy
                  </Button>
                </div>
              </div>

              <Select
                value={sortBy.startsWith('price') ? sortBy : null}
                placeholder="Giá"
                style={{ width: 200 }}
                onChange={(val) => setSortBy(val)}
                bordered={true}
                size="middle"
              >
                <Option value="price-asc">Giá: Thấp đến Cao</Option>
                <Option value="price-desc">Giá: Cao đến Thấp</Option>
              </Select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg mb-2">
                  {/* Logic: 
                        1. If we have products matching keyword but filtered out by price/rating -> Filter Error
                        2. If we have no products matching keyword -> Search Error
                    */}
                  {products.some(p => p.name?.toLowerCase().includes(keyword?.toLowerCase() || ''))
                    ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn"
                    : `Không tìm thấy sản phẩm "${keyword}"`
                  }
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {products.some(p => p.name?.toLowerCase().includes(keyword?.toLowerCase() || ''))
                    ? "Vui lòng bỏ bớt bộ lọc để xem thêm kết quả"
                    : "Vui lòng thử tìm kiếm với từ khóa khác"
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((product, index) => {
                      const discount = calculateDiscount(product);
                      const imageUrl = getProductImage(product);

                      return (
                        <motion.div
                          key={product.productId || product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <motion.div
                            className="product-card-wrapper h-full"
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            style={{ position: "relative" }}
                          >
                            <Link
                              to={`/product/${product.productId || product.id}`}
                              style={{ textDecoration: "none", display: "block", height: "100%" }}
                            >
                              <Card
                                hoverable
                                cover={
                                  <div className="relative overflow-hidden" style={{ borderRadius: "15px 15px 0 0" }}>
                                    <img
                                      alt={product.name}
                                      src={imageUrl}
                                      className="w-full object-cover"
                                      style={{ height: "200px", width: "100%" }}
                                      onError={(e) => {
                                        e.currentTarget.src = FALLBACK_IMAGE;
                                      }}
                                    />
                                    {discount > 0 && (
                                      <div
                                        className="absolute top-2 right-2 bg-[#05ABF3] text-white text-xs font-semibold px-2 py-1 rounded z-10"
                                        style={{ fontSize: "11px" }}
                                      >
                                        -{discount}%
                                      </div>
                                    )}
                                  </div>
                                }
                                style={{
                                  borderRadius: "15px",
                                  border: "none",
                                  background: "white",
                                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column"
                                }}
                                bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
                                className="transition-all duration-300 hover:shadow-lg"
                              >
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <h3
                                      className="text-base font-normal text-[#222222] mb-2 line-clamp-2"
                                      style={{
                                        fontSize: "16px",
                                        lineHeight: "1.125em",
                                        minHeight: "36px",
                                        fontWeight: 400,
                                      }}
                                    >
                                      {product.name || "Sản phẩm"}
                                    </h3>
                                    <div className="h-px bg-[#EDEDED] my-2"></div>
                                  </div>

                                  <div className="flex items-center justify-between mt-auto">
                                    <div>
                                      <div
                                        className="text-base font-semibold text-[#008ECC]"
                                        style={{ fontSize: "16px", lineHeight: "1.125em" }}
                                      >
                                        {formatPrice(product.price || 0)}
                                      </div>
                                      {discount > 0 && (
                                        <div
                                          className="text-sm text-[#9E9EB7] line-through"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {formatPrice(Math.round((product.price || 0) * 1.25))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <StarFilled
                                        className="text-yellow-400"
                                        style={{ fontSize: "14px" }}
                                      />
                                      <span
                                        className="text-sm text-[#757575]"
                                        style={{ fontSize: "14px", fontWeight: 600 }}
                                      >
                                        {product.rating ? Number(product.rating).toFixed(1) : "0.0"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                            {/* Wishlist heart button */}
                            <button
                              type="button"
                              onClick={(e) =>
                                handleToggleWishlist(product.productId || product.id, e)
                              }
                              className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 shadow-md hover:bg-white transition-all duration-200 z-20"
                              style={{ border: "none", cursor: "pointer" }}
                              disabled={wishlistLoadingId === (product.productId || product.id)}
                            >
                              {wishlistItems.includes(Number(product.productId || product.id)) ? (
                                <HeartFilled
                                  style={{
                                    fontSize: "14px",
                                    color:
                                      wishlistLoadingId === (product.productId || product.id)
                                        ? "#999999"
                                        : "#FF4D4F",
                                  }}
                                />
                              ) : (
                                <HeartOutlined
                                  style={{
                                    fontSize: "14px",
                                    color:
                                      wishlistLoadingId === (product.productId || product.id)
                                        ? "#999999"
                                        : "#FF4D4F",
                                  }}
                                />
                              )}
                            </button>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                </div>

                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={currentPage}
                    total={filteredProducts.length}
                    pageSize={pageSize}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger
                    pageSizeOptions={['24', '48', '72']}
                    showTotal={(total) => `Tổng ${total} sản phẩm`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}
