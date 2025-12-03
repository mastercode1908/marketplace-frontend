import { useState, useEffect, useRef } from "react";
import { Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  StarOutlined,
  MobileOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  BookOutlined,
  SkinOutlined,
  HomeOutlined,
  TrophyOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
  AppstoreOutlined,
  SmileOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import HomeHeader from "../../components/layout/HomeHeader";
import HomeFooter from "../../components/layout/HomeFooter";
import { toast } from "react-hot-toast";
import wishlistApi from "../../api/commerce/wishlistApi";
import productApi from "../../api/identity/productApi";
import categoryApi from "../../api/catalog/categoryApi";
import { reviewApi } from "../../api/catalog/reviewApi";
import bannerApi from "../../api/catalog/bannerApi";
import ProductCard from "../../components/ui/ProductCard";
import { useAuth } from "../../hooks/useAuth";
import FashionSaleBanner from "../../components/banner/FashionSaleBanner";
import TetHolidayBanner from "../../components/banner/TetHolidayBanner";
import "../../styles/HomePage.css";

/**
 * HomePage Component
 * Main landing page with hero banner, categories, offers, top searches, and products
 * Includes Framer Motion animations and Tailwind CSS styling matching Figma design 1:1
 */
export default function HomePage() {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const { user } = useAuth();
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [banners, setBanners] = useState([]);
  const [promotedProducts, setPromotedProducts] = useState([]);

  // Fetch wishlist to check status
  useEffect(() => {
    if (user) {
      const fetchWishlist = async () => {
        try {
          const res = await wishlistApi.getAll(0, 100);
          // Normalize data similar to UserProfilePage
          let items = [];
          if (res?.content && Array.isArray(res.content)) {
            items = res.content;
          } else if (res?.data && Array.isArray(res.data)) {
            items = res.data;
          } else if (Array.isArray(res)) {
            items = res;
          }

          const ids = items
            .map((item) => {
              const id =
                item.productId ||
                item.product_id ||
                item.product?.productId ||
                item.product?.id;
              return Number(id);
            })
            .filter((id) => !isNaN(id));

          setWishlistItems(ids);
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      };
      fetchWishlist();
    }
  }, [user]);

  // Carousel state for Hero Banner
  const [heroCurrentSlide, setHeroCurrentSlide] = useState(0); // Bắt đầu từ slide đầu tiên
  const [rightHeroCurrentSlide, setRightHeroCurrentSlide] = useState(0); // Sẽ được set thành slide cuối

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerApi.getHomepageBanners();
        console.log("Banner API Response:", response);
        const bannersData = response.banners || [];
        console.log("Banners Data:", bannersData);

        // Transform banner data to match heroSlides format
        const transformedBanners = bannersData.map((banner) => ({
          id: banner.bannerId,
          subtitle: banner.title || "Ưu đãi đặc biệt",
          title: banner.description || "Khuyến mãi hấp dẫn",
          discount: "GIẢM GIÁ ĐẶC BIỆT",
          imageUrl: banner.imageUrl,
          productId: banner.productId,
          sellerId: banner.sellerId,
        }));

        console.log("Transformed Banners:", transformedBanners);

        if (transformedBanners.length > 0) {
          // Randomize banners
          const shuffledBanners = [...transformedBanners].sort(
            () => 0.5 - Math.random()
          );
          setBanners(shuffledBanners);
          // Set left banner to start from first slide (0)
          setHeroCurrentSlide(0);
          // Set right banner to start from last slide (chạy ngược từ cuối về)
          if (shuffledBanners.length > 1) {
            setRightHeroCurrentSlide(shuffledBanners.length - 1);
          } else {
            setRightHeroCurrentSlide(0);
          }
          console.log("Banners set successfully!");
        } else {
          console.log("No banners from API, using default banners");
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Keep default banners if API fails
      }
    };

    fetchBanners();
  }, []);

  // Auto-scroll for Categories
  const categoriesScrollRef = useRef(null);
  const categoriesAutoScrollRef = useRef(null);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);

  // Use banners from API only (no fallback)
  const heroSlides = banners;

  // Icon mapping for categories
  // const categoryIconMap = {
  //   "Điện thoại": MobileOutlined,
  //   Laptop: LaptopOutlined,
  //   "Đồng hồ": ClockCircleOutlined,
  //   "Giày dép": ShoppingOutlined,
  //   "Sách vở": BookOutlined,
  //   "Thời trang": SkinOutlined,
  //   "Đồ gia dụng": HomeOutlined,
  //   "Thể thao": TrophyOutlined,
  //   default: ShoppingOutlined,
  // };

  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return categoryIconMap.default;
    const icon = categoryIconMap[categoryName] || categoryIconMap.default;
    return icon;
  };

  // Mock categories for testing
  const MOCK_CATEGORIES = [
    { id: 1, name: "Điện thoại", icon: MobileOutlined },
    { id: 2, name: "Laptop", icon: LaptopOutlined },
    { id: 3, name: "Phụ kiện", icon: AppstoreOutlined },
    { id: 4, name: "Quần áo", icon: SkinOutlined },
    { id: 5, name: "Giày dép", icon: ShoppingOutlined },
    { id: 6, name: "Đồng hồ", icon: ClockCircleOutlined },
    { id: 7, name: "Mý phẩm", icon: SmileOutlined },
    { id: 8, name: "Đồ gia dụng", icon: HomeOutlined },
    { id: 9, name: "Thể thao", icon: TrophyOutlined },
    { id: 10, name: "Sách vở", icon: BookOutlined },
  ];

  // Set to true to use mock data instead of API
  const USE_MOCK_DATA = false;

  // Offers data
  const offerDeals = [
    {
      id: 1,
      image: "https://via.placeholder.com/105x113",
      label: "Giảm đến 50%",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/131x126",
      label: "Siêu sale",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/100x107",
      label: "Mua 1 tặng 1",
    },
    {
      id: 4,
      image: "https://via.placeholder.com/105x123",
      label: "Mua là có quà",
    },
    {
      id: 5,
      image: "https://via.placeholder.com/105x123",
      label: "Ưu đãi đến 50%",
    },
    {
      id: 6,
      image: "https://via.placeholder.com/105x123",
      label: "Freeship 0Đ",
    },
    {
      id: 7,
      image: "https://via.placeholder.com/120x123",
      label: "Mua 1 được 2",
    },
    {
      id: 8,
      image: "https://via.placeholder.com/105x123",
      label: "Giảm đến 50%",
    },
  ];

  const FALLBACK_IMAGE = "https://via.placeholder.com/248x242?text=No+Image";

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Fetch promoted products
  useEffect(() => {
    const fetchPromotedProducts = async () => {
      try {
        const response = await productApi.getPromotedProducts();
        console.log("Promoted Products API Response:", response);
        if (response && response.data) {
          setPromotedProducts(response.data);
          console.log("Set promoted products:", response.data);
        } else {
          console.log("No data in response");
        }
      } catch (error) {
        console.error("Failed to fetch promoted products:", error);
      }
    };

    fetchPromotedProducts();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Handler functions for banner slide changes
  const handleLeftBannerSlideChange = (newSlide) => {
    setHeroCurrentSlide(newSlide);
  };

  const handleRightBannerSlideChange = (newSlide) => {
    setRightHeroCurrentSlide(newSlide);
  };

  // Ensure Left and Right banners are never the same
  // If Left moves to the same index as Right, move Right to the next one
  useEffect(() => {
    if (heroSlides.length > 1 && heroCurrentSlide === rightHeroCurrentSlide) {
      setRightHeroCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
  }, [heroCurrentSlide, rightHeroCurrentSlide, heroSlides.length]);

  // Categories auto-scroll effect
  useEffect(() => {
    const scrollContainer = categoriesScrollRef.current;
    if (!scrollContainer) return;

    // Don't auto-scroll if user is hovering
    if (isCategoriesHovered) {
      if (categoriesAutoScrollRef.current) {
        clearInterval(categoriesAutoScrollRef.current);
        categoriesAutoScrollRef.current = null;
      }
      return;
    }

    let scrollAmount = scrollContainer.scrollLeft || 0;
    const scrollSpeed = 0.5; // pixels per frame
    const scrollInterval = 16; // ~60fps

    const autoScroll = () => {
      if (scrollContainer && !isCategoriesHovered) {
        const maxScroll =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;

        if (scrollAmount >= maxScroll) {
          // Reset to start when reaching the end
          scrollAmount = 0;
          scrollContainer.scrollLeft = 0;
        } else {
          scrollAmount += scrollSpeed;
          scrollContainer.scrollLeft = scrollAmount;
        }
      }
    };

    categoriesAutoScrollRef.current = setInterval(autoScroll, scrollInterval);

    return () => {
      if (categoriesAutoScrollRef.current) {
        clearInterval(categoriesAutoScrollRef.current);
      }
    };
  }, [isCategoriesHovered]);

  // Fetch categories from API
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
          if (isMounted) {
            setCategories(MOCK_CATEGORIES);
            setCategoriesLoading(false);
          }
          return;
        }

        const response = await categoryApi.getPublicCategories();
        if (!isMounted) return;

        const categoriesData = Array.isArray(response)
          ? response
          : response?.data || [];

        // Map categories with icons
        // Map categories with icons
        const mappedCategories = categoriesData
          .filter((cat) => !cat.deletedAt)
          .map((cat) => ({
            id: cat.id || cat.categoryId,
            name: cat.name || "Danh mục",
            icon: getCategoryIcon(cat.name),
          }));

        // Merge with MOCK_CATEGORIES to ensure UI looks full (User Request)
        // Only add mock categories that don't exist in real data (by name)
        const existingNames = new Set(mappedCategories.map((c) => c.name));
        const additionalMockCategories = MOCK_CATEGORIES.filter(
          (mockCat) => !existingNames.has(mockCat.name)
        ).map((mockCat, index) => ({
          ...mockCat,
          id: 10000 + index, // Use high ID to avoid collision with real IDs
          isMock: true,
        }));

        const finalCategories = [
          ...mappedCategories,
          ...additionalMockCategories,
        ];

        if (isMounted) {
          setCategories(
            finalCategories.length > 0 ? finalCategories : MOCK_CATEGORIES
          );
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to mock categories if API fails
        if (isMounted) {
          setCategories(MOCK_CATEGORIES);
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products from API
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await productApi.getAll();
        if (!isMounted) return;

        console.log("Products API response:", response); // Debug logging

        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          // Transform API data to match component structure
          const rawProducts = response.data.filter(
            (product) =>
              product.productStatus === "Approved" && !product.deletedAt
          );

          // Fetch ratings for each product
          const productsWithRatings = await Promise.all(
            rawProducts.map(async (product) => {
              // Get first image from media array
              const firstMedia =
                product.media?.length > 0
                  ? product.media.sort(
                    (a, b) => (a.position ?? 0) - (b.position ?? 0)
                  )[0]
                  : null;

              const imageUrl = firstMedia?.url || FALLBACK_IMAGE;

              // Calculate discount percentage (mock for now, can be from promotion API later)
              const originalPrice = product.price
                ? Math.round(product.price * 1.25)
                : null;
              const discount =
                originalPrice && product.price
                  ? Math.round(
                    ((originalPrice - product.price) / originalPrice) * 100
                  )
                  : 0;

              let rating = 0;
              try {
                const reviewsRes = await reviewApi.getProductReviews(
                  product.productId || product.id
                );
                const reviews = reviewsRes.content || reviewsRes.data || [];
                if (reviews.length > 0) {
                  const totalRating = reviews.reduce(
                    (sum, review) => sum + (review.rating || 0),
                    0
                  );
                  rating = totalRating / reviews.length;
                }
              } catch (err) {
                console.error(
                  `Error fetching reviews for product ${product.id}`,
                  err
                );
              }

              return {
                id: product.productId || product.id || Math.random(), // Ensure ID exists
                name: product.name || "Sản phẩm",
                price: product.price || 0,
                oldPrice: originalPrice,
                discount: discount || 0,
                image: imageUrl,
                rating: rating || 0, // Use real rating or 0
              };
            })
          );

          const validProducts = productsWithRatings.filter(
            (product) => product.id && product.name && product.image
          );

          console.log("Transformed products:", validProducts.length); // Debug logging

          if (isMounted && validProducts.length > 0) {
            setAllProducts(validProducts);
          } else if (isMounted && validProducts.length === 0) {
            console.warn("No valid products after transformation");
            toast.info("Không có sản phẩm hợp lệ để hiển thị");
          }
        } else {
          console.warn("Invalid API response format:", response);
          // Don't clear existing products if API response is invalid
          if (isMounted && allProducts.length === 0) {
            toast.info("Không thể tải sản phẩm, vui lòng thử lại");
          }
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        // Only show toast for non-500 errors to avoid spam
        if (error.response?.status !== 500) {
          toast.error("Không thể tải danh sách sản phẩm");
        }
        // Don't clear products on error - keep existing products if any
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Load More button click
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

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
        setWishlistItems((prev) => prev.filter((id) => id !== numProductId));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await wishlistApi.addProduct(numProductId);
        setWishlistItems((prev) => [...prev, numProductId]);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật wishlist";
      toast.error(message);
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
        justifyContent: "center",
      }}
      aria-label={
        wishlistItems.includes(Number(productId))
          ? "Xóa khỏi yêu thích"
          : "Thêm vào yêu thích"
      }
      disabled={wishlistLoadingId === productId}
    >
      {wishlistItems.includes(Number(productId)) ? (
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
            color: wishlistLoadingId === productId ? "#999999" : "#FF4D4F",
          }}
        />
      )}
    </button>
  );

  return (
    <motion.div
      className="home-page min-h-screen bg-[#F5F5FA]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <HomeHeader />

      {/* Hero Banner Section with Carousel */}
      <motion.section
        className="hero-section relative"
        style={{
          paddingTop: "40px",
          paddingBottom: "20px",
          overflow: "visible",
          background: "transparent",
        }}
      >
        <div className="container mx-auto max-w-[1440px] px-4 md:px-[53px] relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[1424px] mx-auto">
            {/* Left Banner - Fashion Sale */}
            <FashionSaleBanner
              banners={heroSlides}
              currentSlide={heroCurrentSlide}
              onSlideChange={handleLeftBannerSlideChange}
              otherBannerSlide={rightHeroCurrentSlide}
            />

            {/* Right Banner - Tet Holiday */}
            <TetHolidayBanner
              banners={heroSlides}
              currentSlide={rightHeroCurrentSlide}
              onSlideChange={handleRightBannerSlideChange}
              otherBannerSlide={heroCurrentSlide}
            />
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        className="categories-section bg-[#F5F5FA]"
        style={{ paddingTop: "40px", paddingBottom: "50px" }}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto max-w-[1440px] px-[49px]">
          <motion.div
            className="mb-6"
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex flex-col">
              <h2
                className="text-2xl font-bold text-[#666666] m-0 mb-2"
                style={{
                  fontSize: "24px",
                  lineHeight: "1.25em",
                  fontWeight: 700,
                }}
              >
                Danh Mục
              </h2>
              <div
                className="bg-[#008ECC]"
                style={{ width: "281px", height: "3px" }}
              ></div>
            </div>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div
            ref={categoriesScrollRef}
            className="categories-scroll-container overflow-x-auto pb-4"
            onMouseEnter={() => setIsCategoriesHovered(true)}
            onMouseLeave={() => setIsCategoriesHovered(false)}
          >
            <div
              className="flex gap-4 px-4 md:px-0"
              style={{ width: "max-content" }}
            >
              {categoriesLoading ? (
                <div className="flex gap-4">
                  {[...Array(8)].map((_, index) => (
                    <Card
                      key={index}
                      loading
                      style={{
                        borderRadius: "20px",
                        width: "140px",
                        minHeight: "150px",
                      }}
                      className="md:w-[174px] md:min-h-[183px]"
                    />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500 w-full">
                  Không có danh mục nào
                </div>
              ) : (
                categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      custom={index}
                      style={{ flexShrink: 0 }}
                      className="min-w-[140px] md:min-w-[174px]"
                    >
                      <Link
                        to={`/category/${category.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <motion.div
                          variants={cardHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          className="category-card"
                        >
                          <Card
                            hoverable
                            bodyStyle={{
                              padding: "16px",
                              textAlign: "center",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            style={{
                              borderRadius: "20px",
                              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                              border: "none",
                              background: "white",
                              width: "100%",
                              height: "150px", // Set fixed height for mobile
                            }}
                            className="transition-all duration-300 md:h-[183px]" // Set fixed height for desktop
                          >
                            <motion.div
                              className="text-4xl md:text-5xl mb-3 flex items-center justify-center" // Added flex centering
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <IconComponent className="text-[36px] md:text-[48px] text-[#008ECC]" />
                            </motion.div>
                            <div className="text-xs md:text-sm font-medium text-[#333333] w-full text-center">{category.name}</div>
                          </Card>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Offers Section */}
      <motion.section
        className="offers-section relative"
        style={{ padding: "20px 0", background: "#F5F5FA" }}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto max-w-[1440px] px-4 md:px-[50px]">
          <motion.div
            className="flex flex-col mb-6"
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              className="text-xl md:text-2xl font-bold text-[#666666] mb-2"
              style={{ lineHeight: "1.25em", fontWeight: 700 }}
            >
              Ưu Đãi
            </h2>
            <div
              className="bg-[#008ECC]"
              style={{ width: "245px", height: "3px" }}
            ></div>
          </motion.div>

          {/* Offers Layout: Banner Left + Deals Right */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Back to School Banner (Left) */}
            <motion.div
              className="relative rounded-2xl overflow-hidden flex-shrink-0 w-full lg:w-[503px]"
              style={{
                background: "#F3F9FB",
                minHeight: "300px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="h-full p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div
                    className="font-bold text-[#008ECC] mb-3"
                    style={{ fontSize: "14px", lineHeight: "1.2em" }}
                  >
                    MEGAMART
                  </div>
                  <h3
                    className="font-bold text-[#008ECC] mb-4 text-3xl md:text-[36px]"
                    style={{ lineHeight: "1.2em", fontWeight: 700 }}
                  >
                    BACK TO SCHOOL
                  </h3>
                  <div
                    className="inline-block bg-[#FF6B35] text-white px-5 py-2 rounded-lg font-semibold"
                    style={{ fontSize: "14px", lineHeight: "1.2em" }}
                  >
                    Ưu đãi ngập tràn
                  </div>
                </div>

                {/* Voucher Cards */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="bg-[#3B82F6] text-white px-4 py-3 rounded-lg text-center flex-1 min-w-[120px]">
                    <div className="text-xl md:text-2xl font-bold mb-1">
                      -15%
                    </div>
                    <div
                      className="text-xs"
                      style={{ fontSize: "11px", lineHeight: "1.3em" }}
                    >
                      HOÁ ĐƠN TRÊN 500K
                    </div>
                  </div>
                  <div className="bg-[#1E40AF] text-white px-4 py-3 rounded-lg text-center flex-1 min-w-[120px]">
                    <div className="text-xl md:text-2xl font-bold mb-1">
                      -30%
                    </div>
                    <div
                      className="text-xs"
                      style={{ fontSize: "11px", lineHeight: "1.3em" }}
                    >
                      HOÁ ĐƠN TRÊN 3 TRIỆU
                    </div>
                  </div>
                  <div className="bg-[#60A5FA] text-white px-4 py-3 rounded-lg text-center flex-1 min-w-[120px]">
                    <div className="text-xl md:text-2xl font-bold mb-1">
                      -25%
                    </div>
                    <div
                      className="text-xs"
                      style={{ fontSize: "11px", lineHeight: "1.3em" }}
                    >
                      HOÁ ĐƠN TRÊN 1 TRIỆU
                    </div>
                  </div>
                </div>

                <div
                  className="text-xs text-[#666666]"
                  style={{ fontSize: "12px" }}
                >
                  HOTLINE: 123-456-7890
                </div>
              </div>
            </motion.div>

            {/* Deal Cards Grid (Right) - Responsive Grid */}
            <div
              className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              style={{ alignContent: "start" }}
            >
              {offerDeals.map((deal, index) => {
                const product = promotedProducts[index];
                const hasProduct =
                  product && product.media && product.media.length > 0;
                const imageUrl = hasProduct ? product.media[0].url : deal.image;
                const linkTo = product ? `/product/${product.productId}` : "#";

                return (
                  <motion.div
                    key={deal.id}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={index}
                    style={{ height: "100%" }}
                  >
                    <motion.div
                      variants={cardHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      className="h-full"
                    >
                      <Link
                        to={linkTo}
                        style={{
                          textDecoration: "none",
                          display: "block",
                          height: "100%",
                          pointerEvents: product ? "auto" : "none",
                        }}
                      >
                        <Card
                          hoverable
                          cover={
                            <div
                              className="relative overflow-hidden"
                              style={{ borderRadius: "20px 20px 0 0" }}
                            >
                              <img
                                alt={deal.label}
                                src={imageUrl}
                                className="w-full object-cover h-[120px] md:h-[183px]"
                                onError={(e) => {
                                  e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                              />
                            </div>
                          }
                          style={{
                            borderRadius: "20px",
                            border: "none",
                            background: "white",
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          bodyStyle={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "12px",
                          }}
                          className="transition-all duration-300"
                        >
                          <div className="text-center w-full">
                            <div
                              className="font-normal text-black text-sm md:text-base line-clamp-2"
                              style={{ lineHeight: "1.5em", fontWeight: 400 }}
                            >
                              {deal.label}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Top Searches Section */}
      <motion.section
        className="top-searches-section bg-[#F5F5FA]"
        style={{ padding: "40px 0" }}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto max-w-[1440px] px-4 md:px-[50px]">
          <motion.div
            className="flex flex-col items-center mb-6"
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              className="text-xl md:text-2xl font-bold text-[#666666] mb-2"
              style={{ lineHeight: "1.25em", fontWeight: 700 }}
            >
              Tìm kiếm hàng đầu
            </h2>
            <div
              className="bg-[#008ECC]"
              style={{ width: "245px", height: "3px" }}
            ></div>
          </motion.div>

          {/* Products Grid: Responsive Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, index) => (
                <Card
                  key={index}
                  loading
                  style={{
                    borderRadius: "15px",
                    border: "none",
                    background: "white",
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    aspectRatio: "1/1",
                    height: "auto",
                  }}
                  className="w-full"
                />
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">
                Không có sản phẩm nào để hiển thị
              </p>
              <p className="text-gray-400 text-sm">Vui lòng thử lại sau</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allProducts.slice(0, displayCount).map((product, index) => (
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
                    <Link
                      to={`/product/${product.id}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
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
                              style={{
                                aspectRatio: "1/1",
                                width: "100%",
                                height: "auto",
                              }}
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />
                            {product.discount > 0 && (
                              <motion.div
                                className="absolute top-2 right-2 bg-[#05ABF3] text-white text-xs font-semibold px-2 py-1 rounded z-10"
                                style={{
                                  fontSize: "11px",
                                  lineHeight: "1.636em",
                                }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  delay: index * 0.1,
                                  type: "spring",
                                  stiffness: 200,
                                }}
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
                        <div
                          className="product-info"
                          style={{
                            background: "white",
                            borderRadius: "0 0 15px 15px",
                            padding: "6px",
                          }}
                        >
                          <h3
                            className="text-base font-normal text-[#222222] mb-0 line-clamp-2"
                            style={{
                              fontSize: "15px",
                              lineHeight: "1.1em",
                              fontWeight: 400,
                            }}
                          >
                            {product.name || "Sản phẩm"}
                          </h3>
                          <div className="h-px bg-[#EDEDED] my-[1px]"></div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div
                                className="text-base font-semibold text-[#008ECC]"
                                style={{ fontSize: "16px", lineHeight: "1em" }}
                              >
                                {formatPrice(product.price || 0)}
                              </div>
                              {product.oldPrice &&
                                product.oldPrice > product.price && (
                                  <div
                                    className="text-base text-[#9E9EB7] line-through"
                                    style={{
                                      fontSize: "14px",
                                      lineHeight: "1em",
                                    }}
                                  >
                                    {formatPrice(product.oldPrice)}
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
                                {product.rating
                                  ? Number(product.rating).toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>

                    {/* Wishlist heart button outside Link to prevent navigation */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        zIndex: 20,
                      }}
                    >
                      {renderWishlistHeart(product.id)}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View More Button */}
          {displayCount < allProducts.length && (
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleLoadMore}
                className="bg-[#008ECC] text-white px-12 py-3 rounded-lg font-semibold text-lg hover:bg-[#0077B3] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem thêm
              </motion.button>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        className="py-12 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 md:px-[54px]" style={{ maxWidth: "1440px" }}>
          <h2 className="text-2xl font-bold text-[#222222] mb-8 text-center">
            Hỗ Trợ & Thông Tin
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link to="/about">
              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <TeamOutlined className="text-3xl text-[#008ECC] mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Về Chúng Tôi</h3>
                <p className="text-xs text-gray-500">Tìm hiểu về MegaMart</p>
              </motion.div>
            </Link>
            <Link to="/privacy">
              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <SafetyCertificateOutlined className="text-3xl text-[#008ECC] mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Bảo Mật</h3>
                <p className="text-xs text-gray-500">Chính sách bảo vệ dữ liệu</p>
              </motion.div>
            </Link>
            <Link to="/terms">
              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <FileTextOutlined className="text-3xl text-[#008ECC] mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Điều Khoản</h3>
                <p className="text-xs text-gray-500">Quy định sử dụng</p>
              </motion.div>
            </Link>
            <Link to="/contact">
              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <PhoneOutlined className="text-3xl text-[#008ECC] mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Liên Hệ</h3>
                <p className="text-xs text-gray-500">Hỗ trợ khách hàng</p>
              </motion.div>
            </Link>
            <Link to="/faq">
              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <QuestionCircleOutlined className="text-3xl text-[#008ECC] mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">FAQ</h3>
                <p className="text-xs text-gray-500">Câu hỏi thường gặp</p>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.section>

      <HomeFooter />
    </motion.div>
  );
}
