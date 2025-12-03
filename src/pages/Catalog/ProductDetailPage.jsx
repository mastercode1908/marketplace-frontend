/* eslint-disable no-unused-vars */
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  StarFilled,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  HeartOutlined,
  HeartFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

import { Select, Modal } from "antd";
import { toast } from "react-hot-toast";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import productApi from "../../api/identity/productApi";
import wishlistApi from "../../api/commerce/wishlistApi";
import { CartApi } from "../../api/commerce/CartApi";
import { useAuth } from "../../hooks/useAuth";
import { reviewApi } from "../../api/catalog/reviewApi";
import chatApi from "../../api/communication/chatApi";
import userApi from "../../api/identity/UserProfileApi";
import categoryApi from "../../api/catalog/categoryApi";
import QuantitySelector from "../../components/ui/QuantitySelector";
import { ShippingApi } from "../../api/shipping/shippingApi";
import AddressSelectionModal from "../../components/common/AddressSelectionModal";
import EditReviewModal from "../../components/common/EditReviewModal";
import "../../styles/ProductDetailPage.css";

const FALLBACK_IMAGE =
  "https://via.placeholder.com/640x640.png?text=Product+Image";

const formatCurrency = (value) => {
  if (value === undefined || value === null) return "Đang cập nhật";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function ProductDetailPage() {
  const [modal, contextHolder] = Modal.useModal();
  const { productId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantityInCart, setQuantityInCart] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  const [shopInfo, setShopInfo] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
  });
  const [shippingFee, setShippingFee] = useState(0);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [selectedStarFilter, setSelectedStarFilter] = useState(null); // null = All
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  // Lấy số lượng trong giỏ hàng
  useEffect(() => {
    const fetchCartQuantity = async () => {
      if (!user || !productId) {
        setQuantityInCart(0);
        return;
      }

      try {
        const res = await CartApi.getCart();
        if (res.data && res.data.items) {
          const cartItem = res.data.items.find(
            (item) => item.productId === Number(productId)
          );
          setQuantityInCart(cartItem ? cartItem.quantity : 0);
        } else {
          setQuantityInCart(0);
        }
      } catch (error) {
        // Nếu lỗi (ví dụ: chưa có giỏ hàng), set về 0
        setQuantityInCart(0);
      }
    };

    fetchCartQuantity();
  }, [user, productId]);

  // Calculate shipping fee
  useEffect(() => {
    const calculateShipping = async () => {
      if (!product || !userAddress || !userAddress.districtId || !userAddress.wardCode) return;

      try {
        const res = await ShippingApi.calculateFee({
          sellerId: product.sellerId || product.seller?.id,
          toDistrictId: userAddress.districtId,
          toWardCode: userAddress.wardCode,
          productId: product.productId || product.id,
          quantity: quantity
        });
        setShippingFee(res.data);
      } catch (error) {
        console.error("Failed to calculate shipping fee:", error);
      }
    };

    calculateShipping();
  }, [product, userAddress, quantity]);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!productId || productId === 'undefined') return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const response = await productApi.getById(productId);
        if (!isMounted) return;
        const payload = response?.data;
        setProduct(payload);
        setError("");
        setActiveImageIndex(0);
        setQuantity(1);
      } catch (err) {
        console.error("Failed to load product detail", err);
        if (!isMounted) return;
        let errorMessage = "Không thể tải thông tin sản phẩm";

        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;

          if (status === 500) {
            errorMessage =
              "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
          } else if (status === 403) {
            errorMessage = "Bạn không có quyền truy cập sản phẩm này.";
          } else if (status === 404) {
            errorMessage = "Không tìm thấy sản phẩm.";
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } else if (err.message === "Network Error") {
          errorMessage =
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
        }

        setError(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Fetch Shop Info, Category, User Address
  useEffect(() => {
    const fetchShopInfo = async () => {
      if (!product?.sellerId) return;
      try {
        const res = await productApi.getShopInfo(product.sellerId);
        const data = res.result || res.data || res;
        setShopInfo(data);
      } catch (error) {
        console.error("Failed to fetch shop info", error);
      }
    };


    const fetchCategoryName = async () => {
      if (product?.categoryName) {
        setCategoryName(product.categoryName);
        return;
      }
      if (!product?.categoryId) {
        console.log("No categoryId in product:", product);
        return;
      }

      try {
        // Fetch with large size to ensure we get all categories
        const res = await categoryApi.getPublicCategories({ page: 0, size: 1000 });
        console.log("Fetched categories response:", res);

        let categories = [];
        if (Array.isArray(res)) {
          categories = res;
        } else if (res?.content && Array.isArray(res.content)) {
          categories = res.content;
        } else if (res?.data && Array.isArray(res.data)) {
          categories = res.data;
        }

        console.log("Parsed categories array:", categories);
        console.log("Product Category ID:", product.categoryId);

        const category = categories.find(c => String(c.id) === String(product.categoryId));
        if (category) {
          console.log("Found category:", category);
          setCategoryName(category.name);
        } else {
          console.log("Category not found for ID:", product.categoryId);
        }
      } catch (error) {
        console.error("Failed to fetch category name", error);
      }
    };

    const fetchUserAddress = async () => {
      if (!user) return;
      try {
        const addresses = await userApi.getAddresses();
        if (addresses && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          setUserAddress(defaultAddr);
        } else {
          const res = await userApi.getCurrentProfile();
          const addressStr = res.data?.buyer?.address || res.buyer?.address || res.address;
          if (addressStr) setUserAddress(addressStr);
        }
      } catch (error) {
        console.error("Failed to fetch user address", error);
      }
    };

    if (product?.sellerId) {
      fetchShopInfo();
    }
    if (product?.categoryId) {
      fetchCategoryName();
    }
    if (user) {
      fetchUserAddress();
    }
  }, [product?.sellerId, product?.categoryId, user]);

  const images = useMemo(() => {
    if (product?.media?.length) {
      return [...product.media]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((asset) => asset.url || FALLBACK_IMAGE);
    }
    return [FALLBACK_IMAGE];
  }, [product]);

  const stockQuantity = product?.stockQuantity ?? 0;
  const maxQuantityCanAdd = Math.max(0, stockQuantity - quantityInCart);

  const originalPrice = useMemo(() => {
    if (!product?.price) return null;
    return Math.round(product.price * 1.25);
  }, [product]);

  const fetchReviews = async () => {
    if (!productId) return;
    try {
      const response = await reviewApi.getProductReviews(productId);
      const data = response?.data || response?.reviews || response || [];
      const normalized = Array.isArray(data) ? data : [];
      setReviews(normalized);

      // Calculate stats
      if (normalized.length > 0) {
        const total = normalized.length;
        const sum = normalized.reduce((acc, r) => acc + (r.rating || 0), 0);
        const avg = (sum / total).toFixed(1);

        const dist = [5, 4, 3, 2, 1].map(star => ({
          star,
          count: normalized.filter(r => Math.round(r.rating) === star).length
        }));

        setReviewStats({ average: avg, total, distribution: dist });
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by star
    if (selectedStarFilter !== null) {
      result = result.filter(r => Math.round(r.rating) === selectedStarFilter);
    }

    // Sort: User's review first, then newest
    result.sort((a, b) => {
      const currentUserId = user?.id || user?.user?.id || user?.userId || user?.user?.userId;
      const isUserA = currentUserId && (a.buyerId === currentUserId || a.userId === currentUserId);
      const isUserB = currentUserId && (b.buyerId === currentUserId || b.userId === currentUserId);

      if (isUserA && !isUserB) return -1;
      if (!isUserA && isUserB) return 1;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [reviews, selectedStarFilter, user]);

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsEditReviewModalOpen(true);
  };

  const handleDeleteReview = (reviewId) => {
    if (!reviewId) {
      toast.error("Lỗi: Không tìm thấy ID đánh giá");
      return;
    }

    modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Pass empty object or minimal payload if needed by backend
          await reviewApi.deleteReview(reviewId, {});
          toast.success("Đã xóa đánh giá");
          fetchReviews();
        } catch (error) {
          console.error("Failed to delete review", error);
          toast.error("Không thể xóa đánh giá");
        }
      },
    });
  };




  const handleQuantityChange = (value) => {
    if (value === "") {
      setQuantity("");
      return;
    }
    const numValue = Number(value);
    if (isNaN(numValue)) return;

    if (!stockQuantity) return;
    const sanitized = Math.max(1, Math.min(maxQuantityCanAdd, numValue));
    setQuantity(sanitized);
  };

  const handleQuantityBlur = () => {
    if (quantity === "" || quantity < 1) {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    if (!productId) {
      toast.error("Không tìm thấy sản phẩm");
      return;
    }

    const totalQuantity = quantityInCart + quantity;
    if (totalQuantity > stockQuantity) {
      toast.error("Tổng số lượng trong giỏ hàng và bạn đang thêm vượt quá số lượng trong kho");
      return;
    }

    if (quantity > maxQuantityCanAdd) {
      toast.error(`Bạn chỉ có thể thêm tối đa ${maxQuantityCanAdd} sản phẩm (trong kho còn ${stockQuantity}, giỏ hàng đã có ${quantityInCart})`);
      return;
    }

    setCartLoading(true);
    try {
      await CartApi.addItem({
        productId: Number(productId),
        quantity: Number(quantity) || 1,
      });

      setQuantityInCart(prev => prev + quantity);

      toast.success("Đã thêm sản phẩm vào giỏ hàng");
      setQuantity(1);

      // Dispatch event to update header cart count
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng";
      toast.error(errorMessage);
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    toast.info("Tính năng mua ngay đang được phát triển");
  };

  useEffect(() => {
    const checkWishlist = async () => {
      if (!productId || !user) {
        setIsWishlisted(false);
        return;
      }

      try {
        const wishlist = await wishlistApi.getAll(0, 100);

        let items = [];
        if (wishlist?.content && Array.isArray(wishlist.content)) {
          items = wishlist.content;
        } else if (wishlist?.data && Array.isArray(wishlist.data)) {
          items = wishlist.data;
        } else if (Array.isArray(wishlist)) {
          items = wishlist;
        }

        const productIds = items.map(item => {
          return Number(item.productId || item.product_id || item.product?.productId || item.product?.id);
        }).filter(id => !isNaN(id));

        setIsWishlisted(productIds.includes(Number(productId)));
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlist();
  }, [productId, user]);

  const handleAddressChange = (address) => {
    setUserAddress(address);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích");
      return;
    }

    if (!productId) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.removeProduct(productId);
        setIsWishlisted(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await wishlistApi.addProduct(productId);
        setIsWishlisted(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error(
        error.response?.data?.message ||
        "Không thể cập nhật danh sách yêu thích"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleChatWithSeller = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để chat với người bán");
      return;
    }

    // Assuming product has sellerId or seller object
    const sellerId = product?.sellerId || product?.seller?.id;
    if (!sellerId) {
      toast.error("Không tìm thấy thông tin người bán");
      return;
    }

    try {
      await chatApi.startConversation(sellerId);
      navigate("/user/chat"); // Adjust route based on routes.jsx
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  return (
    <div className="product-detail-page bg-[#F5F5FA] min-h-screen">
      {contextHolder}
      <HomeHeader />
      <main className="container mx-auto max-w-[1440px] px-[50px] py-8 pb-24 flex flex-col gap-6">
        <div className="product-breadcrumb">
          <Link to="/home" style={{ textDecoration: "none" }}>
            <span
              style={{
                color: "#666666",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#008ECC")}
              onMouseLeave={(e) => (e.target.style.color = "#666666")}
            >
              Trang chủ
            </span>
          </Link>
          {categoryName && (
            <>
              <span style={{ color: "#666666" }}>/</span>
              <Link to={product?.categoryId ? `/category/${product.categoryId}` : "/home"} style={{ textDecoration: "none" }}>
                <span
                  style={{
                    color: "#666666",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#008ECC")}
                  onMouseLeave={(e) => (e.target.style.color = "#666666")}
                >
                  {categoryName}
                </span>
              </Link>
            </>
          )}
          <span style={{ color: "#666666" }}>/</span>
          <span style={{ color: "#008ECC", fontWeight: 600 }}>
            {product?.name || "Sản phẩm"}
          </span>
        </div>
        {loading ? (
          <div className="product-detail-loading">
            <div className="skeleton hero" />
            <div className="skeleton section" />
            <div className="skeleton section" />
          </div>
        ) : error ? (
          <div className="product-detail-error">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <section className="product-card">
              <button
                type="button"
                className="product-wishlist"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                style={{
                  cursor: wishlistLoading ? 'wait' : 'pointer',
                  opacity: wishlistLoading ? 0.6 : 1
                }}
              >
                {isWishlisted ? (
                  <HeartFilled style={{ color: "#FF4D4F" }} />
                ) : (
                  <HeartOutlined style={{ color: "#FF4D4F" }} />
                )}
              </button>
              <div className="product-gallery">
                <img
                  src={images[activeImageIndex]}
                  alt={product?.name || "Product"}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                {images.length > 1 && (
                  <div className="product-gallery__thumbs">
                    {images.map((imageUrl, index) => (
                      <button
                        key={imageUrl + index}
                        type="button"
                        aria-label={`Ảnh sản phẩm ${index + 1}`}
                        className={index === activeImageIndex ? "active" : ""}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Thumb ${index + 1}`}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-nav prev"
                      onClick={handlePrevImage}
                    >
                      <LeftOutlined />
                    </button>
                    <button
                      type="button"
                      className="gallery-nav next"
                      onClick={handleNextImage}
                    >
                      <RightOutlined />
                    </button>
                  </>
                )}
              </div>

              <div className="product-info">
                <h1>{product?.name}</h1>
                <div className="product-rating-line">
                  <span className="rating-value">
                    {reviewStats.average} <StarFilled />
                  </span>
                  <span className="rating-count">
                    {reviewStats.total} đánh giá
                  </span>
                  <span className="rating-divider" />
                  <span className="sold-count">
                    {product?.soldCount || product?.soldQuantity || 0} đã bán
                  </span>
                </div>

                <div className="product-price-line">
                  <span className="price-current">
                    {formatCurrency(product?.price)}
                  </span>
                  <span className="price-tag">25%</span>
                  {originalPrice && (
                    <span className="price-old">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                </div>

                <div className="product-shipping">
                  <div className="shipping-row">
                    <div className="shipping-label">Thông tin vận chuyển</div>
                    <button type="button" onClick={() => setIsAddressModalOpen(true)}>Đổi</button>
                  </div>
                  <div className="shipping-destination">
                    <EnvironmentOutlined />
                    <div>
                      <div>Giao từ: <strong>{shopInfo?.seller?.shop_address || shopInfo?.address || shopInfo?.city || "Kho hàng"}</strong></div>
                      <div>Đến: <strong>{(() => {
                        if (!userAddress) return "Địa chỉ của bạn";
                        if (typeof userAddress === 'string') return userAddress;
                        return [
                          userAddress.addressDetail,
                          userAddress.wardName,
                          userAddress.districtName,
                          userAddress.provinceName
                        ].filter(Boolean).join(", ");
                      })()}</strong></div>
                    </div>
                  </div>
                  <div className="shipping-badge">
                    <span>Giao Tiêu Chuẩn</span>
                    <span className="free">
                      {shippingFee > 0 ? formatCurrency(shippingFee) : "Miễn phí"}
                    </span>
                  </div>
                  <p>Thời gian giao hàng dự kiến: 2-4 ngày</p>
                </div>

                <div className="product-quantity-line" style={{ alignItems: "flex-start" }}>
                  <span style={{ marginTop: "8px" }}>Số lượng</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <QuantitySelector
                      value={quantity}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      max={maxQuantityCanAdd}
                      disabled={maxQuantityCanAdd === 0}
                    />
                    {user && quantityInCart > 0 && (
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        Đã có {quantityInCart} sản phẩm trong giỏ hàng
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "12px",
                        color: stockQuantity > 0 ? "#666" : "#FF4D4F",
                      }}
                    >
                      {stockQuantity > 0
                        ? `Còn ${stockQuantity} sản phẩm trong kho`
                        : "Hết hàng"}
                    </span>
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={handleAddToCart}
                    disabled={stockQuantity === 0 || maxQuantityCanAdd === 0 || cartLoading}
                  >
                    <ShoppingCartOutlined />
                    {cartLoading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                  </button>
                </div>
              </div>
            </section>

            <section className="store-info-card">
              <div className="store-info-left">
                <div className="store-avatar">
                  {shopInfo?.user?.avatar ? (
                    <img
                      src={shopInfo.user.avatar}
                      alt={shopInfo.seller?.shop_name || "Shop Avatar"}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <ShopOutlined />
                  )}
                </div>
                <div>
                  <h3>{shopInfo?.seller?.shop_name || shopInfo?.user?.full_name || shopInfo?.shop_name || shopInfo?.shopName || product?.shopName || `Cửa hàng #${product?.sellerId || "..."}`}</h3>
                  <div className="store-tags">
                    <span>{shopInfo?.seller?.rating_count || shopInfo?.rating_count || product?.shopRating || 5.0} ★</span>
                    <span>Đánh giá tích cực {product?.shopPositiveRating || 98}%</span>
                    <span>{product?.shopYears || 1} năm hoạt động</span>
                    <span>Shop yêu thích</span>
                  </div>
                </div>
              </div>
              <div className="store-info-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={handleChatWithSeller}
                >
                  Chat ngay
                </button>
                <Link to={`/shop/${product?.sellerId}`}>
                  <button type="button" className="primary">
                    Xem cửa hàng
                  </button>
                </Link>
              </div>
            </section>

            <section className="product-detail-content">
              <div className="detail-main">
                <h2>Chi tiết sản phẩm</h2>
                <div className="detail-image">
                  <img src={images[0]} alt="Product detail" />
                </div>
                <div className="detail-description">
                  <h3>Mô tả sản phẩm</h3>
                  <p>{product?.description}</p>
                </div>
              </div>
            </section>

            <section className="product-review-section">
              <div className="review-top">
                <div className="review-heading">
                  <div>
                    <h2>Đánh giá sản phẩm</h2>
                    <p>
                      {reviewStats.average} trên 5 · {reviewStats.total} đánh
                      giá
                    </p>
                  </div>
                  <div className="review-score-card">
                    <span className="review-score-value">
                      {reviewStats.average}
                    </span>
                    <div className="review-score-stars">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <StarFilled
                          key={idx}
                          style={{
                            color:
                              idx < Math.round(reviewStats.average)
                                ? "#FFB347"
                                : "#E0E0E6",
                          }}
                        />
                      ))}
                    </div>
                    <span className="review-score-note">
                      {reviewStats.total} lượt đánh giá
                    </span>
                  </div>
                </div>
                <div className="review-filters flex items-center">
                  <span className="mr-2 font-medium">Lọc theo:</span>
                  <Select
                    defaultValue="all"
                    style={{ width: 120 }}
                    onChange={(value) => setSelectedStarFilter(value === "all" ? null : Number(value))}
                    options={[
                      { value: "all", label: "Tất cả" },
                      { value: "5", label: "5 Sao" },
                      { value: "4", label: "4 Sao" },
                      { value: "3", label: "3 Sao" },
                      { value: "2", label: "2 Sao" },
                      { value: "1", label: "1 Sao" },
                    ]}
                  />
                </div>
              </div>

              <div className="review-summary">
                {reviewStats.distribution.map((item) => {
                  const percent = reviewStats.total
                    ? Math.round((item.count / reviewStats.total) * 100)
                    : 0;
                  return (
                    <div className="review-summary-row" key={item.star}>
                      <span>{item.star} ★</span>
                      <div className="rating-bar">
                        <div
                          className="rating-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="review-summary-count">{item.count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="review-list">
                {filteredReviews.length === 0 ? (
                  <p className="no-review-text">
                    Chưa có đánh giá nào phù hợp.
                  </p>
                ) : (
                  filteredReviews.map((review) => {
                    const currentUserId = user?.id || user?.user?.id || user?.userId || user?.user?.userId;
                    const isCurrentUser = currentUserId && (review.buyerId === currentUserId || review.userId === currentUserId);
                    return (
                      <article
                        key={review.reviewId || review.id}
                        className={`review-item ${isCurrentUser ? "highlight-review" : ""}`}
                        style={isCurrentUser ? { backgroundColor: "#F0F9FF", border: "1px solid #008ECC" } : {}}
                      >
                        <div className="review-meta">
                          <div className="review-avatar-placeholder">
                            {isCurrentUser && user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '1px solid #008ECC' }}
                              />
                            ) : review.avatarUrl ? (
                              <img
                                src={review.avatarUrl}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '1px solid #008ECC' }}
                              />
                            ) : (
                              (isCurrentUser ? "Tôi" : (review.buyerName || review.userName || "Người dùng"))
                                .substring(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="review-name">
                                  {isCurrentUser ? "Tôi" : (review.buyerName || review.userName || "Người dùng")}
                                </div>
                                {review.createdAt && (
                                  <div className="review-date">
                                    {new Date(review.createdAt).toLocaleString("vi-VN")}
                                  </div>
                                )}
                              </div>
                              {isCurrentUser && (
                                <div className="review-actions flex gap-2">
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="text-sm text-[#008ECC] hover:underline"
                                  >
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review.id || review.reviewId)}
                                    className="text-sm text-red-500 hover:underline"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="review-content">
                          <div className="stars">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <StarFilled
                                key={idx}
                                style={{
                                  color:
                                    idx < Math.round(review.rating || 0)
                                      ? "#FFB347"
                                      : "#E0E0E6",
                                }}
                              />
                            ))}
                          </div>
                          <p className="review-body">{review.comment}</p>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section >
          </>
        )
        }
      </main >
      <HomeFooter />

      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={handleAddressChange}
        currentAddressId={userAddress?.id}
      />

      <EditReviewModal
        isOpen={isEditReviewModalOpen}
        onClose={() => setIsEditReviewModalOpen(false)}
        review={editingReview}
        onReviewUpdated={fetchReviews}
      />
    </div >
  );
}
