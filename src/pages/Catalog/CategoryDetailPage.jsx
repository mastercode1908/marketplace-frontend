import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Card, Spin, Input, Select, Button, Rate, Slider, InputNumber, Tag, Space, Divider, Collapse, Dropdown } from "antd";
import {
  StarOutlined,
  HeartOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  StarFilled,
  DeleteOutlined,
  HeartFilled,
  DownOutlined,
  RightOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import productApi from "../../api/identity/productApi";
import { reviewApi } from "../../api/catalog/reviewApi";
import categoryApi from "../../api/catalog/categoryApi";
import wishlistApi from "../../api/commerce/wishlistApi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import "../../styles/CategoryDetailPage.css";

const { Option } = Select;
const { Panel } = Collapse;

// Mock data removed


const PRICE_RANGES = [
  { label: "Dưới 100.000", min: 0, max: 100000 },
  { label: "100.000 -> 240.000", min: 100000, max: 240000 },
  { label: "240.000 -> 500.000", min: 240000, max: 500000 },
  { label: "Trên 500.000", min: 500000, max: null },
];

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Filter states
  const [selectedRating, setSelectedRating] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [tempPriceRange, setTempPriceRange] = useState({ min: null, max: null });
  const [categories, setCategories] = useState([]);

  const FALLBACK_IMAGE = "https://via.placeholder.com/248x242?text=No+Image";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getPublicCategories();
        const categoriesData = Array.isArray(res) ? res : res?.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
    fetchCategoryAndProducts();
  }, [categoryId]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, selectedRating, priceRange]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      // Fetch category details
      let foundCategory = null;

      // Try to get category from location state first (passed from HomePage)
      if (location.state?.category) {
        foundCategory = location.state.category;
        setCategory(foundCategory);
      }

      try {
        const categoriesRes = await categoryApi.getPublicCategories();
        const categories = Array.isArray(categoriesRes)
          ? categoriesRes
          : categoriesRes?.data || [];

        const targetCategoryId = parseInt(categoryId);
        const apiCategory = categories.find(
          (cat) => (cat.id || cat.categoryId) === targetCategoryId
        );

        if (apiCategory) {
          setCategory(apiCategory);
        }
      } catch (err) {
        console.warn("Could not fetch categories from API (likely 403):", err);
      }

      // Fetch all products
      const productsRes = await productApi.getAll();

      let allProducts = [];
      if (productsRes?.success && productsRes?.data && Array.isArray(productsRes.data)) {
        allProducts = productsRes.data;
      } else if (Array.isArray(productsRes)) {
        allProducts = productsRes;
      } else if (productsRes?.data && Array.isArray(productsRes.data)) {
        allProducts = productsRes.data;
      }

      // Filter products by category
      const targetCategoryId = parseInt(categoryId);
      const categoryProducts = allProducts.filter((product) => {
        const productCategoryId = product.categoryId || product.category?.id || product.category?.categoryId;
        return (
          productCategoryId === targetCategoryId &&
          product.productStatus === "Approved" &&
          !product.deletedAt
        );
      });

      // Fetch ratings for each product
      const productsWithRatings = await Promise.all(categoryProducts.map(async (product) => {
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

    } catch (error) {
      console.error("Error fetching category and products:", error);
      if (error.response?.status === 403) {
        toast.error("Vui lòng đăng nhập để xem đầy đủ sản phẩm");
      } else {
        toast.error("Không thể tải dữ liệu danh mục");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Rating
    if (selectedRating) {
      filtered = filtered.filter((product) => (product.rating || 5) >= selectedRating);
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
        filtered.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "vi")
        );
        break;
      case "name-desc":
        filtered.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "", "vi")
        );
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
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
      <div className="category-detail-page">
        <HomeHeader />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="category-detail-page min-h-screen bg-[#F5F5FA]">
      <HomeHeader />

      <div className="container mx-auto max-w-[1440px] px-[50px] py-8">
        {/* Back Button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6"
          style={{ padding: "8px 16px", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Quay lại
        </Button>

        {/* Category Header */}
        {category && (
          <motion.div
            className="category-header mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {category.name || "Danh mục"}
            </h1>
            {category.description && (
              <p className="text-gray-600 text-lg">{category.description}</p>
            )}
            <div className="bg-[#008ECC] mt-4" style={{ width: "200px", height: "3px" }}></div>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-[250px] flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 uppercase text-gray-800">
                <FilterOutlined /> Bộ lọc tìm kiếm
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Danh mục</h4>
                <div className="flex flex-col gap-2">
                  <div
                    className={`cursor-pointer text-sm ${!categoryId ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
                    onClick={() => navigate('/search')}
                  >
                    Tất cả
                  </div>
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className={`cursor-pointer text-sm ${String(categoryId) === String(cat.id) ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
                      onClick={() => navigate(`/category/${cat.id}`)}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              </div>
              <Divider className="my-4" />

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
            {/* Search and Sort Bar */}
            {/* Search and Sort Bar */}
            <div className="filter-bar mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="large"
                  className="flex-1"
                  style={{ maxWidth: "400px" }}
                />
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Sắp xếp theo:</span>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    size="large"
                    style={{ width: "200px" }}
                  >
                    <Option value="default">Mặc định</Option>
                    <Option value="price-asc">Giá: Thấp đến cao</Option>
                    <Option value="price-desc">Giá: Cao đến thấp</Option>
                    <Option value="name-asc">Tên: A-Z</Option>
                    <Option value="name-desc">Tên: Z-A</Option>
                  </Select>
                </div>
              </div>
              <div className="mt-4 text-gray-600">
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || selectedRating || priceRange.min !== null
                    ? "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn"
                    : "Danh mục này hiện chưa có sản phẩm nào"}
                </p>
                {(searchTerm || selectedRating || priceRange.min !== null) && (
                  <Button
                    type="link"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRating(null);
                      handleClearPriceFilter();
                    }}
                    style={{ color: "#008ECC" }}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => {
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
                              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}
                            bodyStyle={{
                              padding: "12px",
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                            }}
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
                          className="absolute top-2 left-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 z-20"
                          style={{
                            border: "none",
                            cursor: "pointer",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          aria-label={wishlistItems.includes(Number(product.productId || product.id)) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                          disabled={wishlistLoadingId === (product.productId || product.id)}
                        >
                          {wishlistItems.includes(Number(product.productId || product.id)) ? (
                            <HeartFilled
                              style={{
                                fontSize: "14px",
                                color: "#FF4D4F",
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
            )}
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}

