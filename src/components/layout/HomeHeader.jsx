import { useState, useEffect } from "react";
import { Input, Avatar, Dropdown, Badge } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  TruckOutlined,
  GiftOutlined,
  MenuOutlined,
  BellOutlined,
  LogoutOutlined,
  SoundOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "../notification/NotificationBell";
import { CartApi } from "../../api/commerce/CartApi";
import categoryApi from "../../api/catalog/categoryApi";
import chatApi from "../../api/communication/chatApi";
import chatWebSocketService from "../../services/chatWebSocketService";
import {
  MobileOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  BookOutlined,
  SkinOutlined,
  HomeOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  SmileOutlined,
} from "@ant-design/icons";

export default function HomeHeader() {
  const [searchValue, setSearchValue] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [categoriesMenuVisible, setCategoriesMenuVisible] = useState(false);
  const [supportMenuVisible, setSupportMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Top search suggestions - moved from HomePage
  const topSearches = ["iphone", "laptop", "đồng hồ", "giày dép", "sách vở"];

  // Icon mapping for categories
  const categoryIconMap = {
    "Điện thoại": MobileOutlined,
    Laptop: LaptopOutlined,
    "Đồng hồ": ClockCircleOutlined,
    "Giày dép": ShoppingOutlined,
    "Sách vở": BookOutlined,
    "Thời trang": SkinOutlined,
    "Đồ gia dụng": HomeOutlined,
    "Thể thao": TrophyOutlined,
    default: ShoppingOutlined,
  };

  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return categoryIconMap.default;
    const icon = categoryIconMap[categoryName] || categoryIconMap.default;
    return icon;
  };

  // Mock categories for testing (same as HomePage)
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
  const USE_MOCK_DATA = true;

  // Fetch categories for menu (same logic as HomePage)
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
          if (isMounted) {
            setCategories(MOCK_CATEGORIES);
          }
          return;
        }

        const response = await categoryApi.getCategories();
        if (!isMounted) return;

        const categoriesData = Array.isArray(response)
          ? response
          : response?.data || [];

        // Map categories with icons
        const mappedCategories = categoriesData
          .filter((cat) => !cat.deletedAt)
          .map((cat) => ({
            id: cat.id || cat.categoryId,
            name: cat.name || "Danh mục",
            icon: getCategoryIcon(cat.name),
          }));

        if (isMounted) {
          setCategories(
            mappedCategories.length > 0 ? mappedCategories : MOCK_CATEGORIES
          );
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to mock categories if API fails
        if (isMounted) {
          setCategories(MOCK_CATEGORIES);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch cart count when user is logged in
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const res = await CartApi.getCart();
        if (res.data && res.data.items) {
          // Đếm số lượng items (số loại sản phẩm khác nhau)
          const itemCount = res.data.items.length || 0;
          setCartCount(itemCount);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        // Nếu lỗi (ví dụ: chưa có giỏ hàng), set về 0
        setCartCount(0);
      }
    };

    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [user]);

  // Fetch unread message count and setup WebSocket for real-time updates
  useEffect(() => {
    if (!user) {
      setUnreadMessageCount(0);
      return;
    }

    const userId = user?.id || user?.user?.id || user?.userId || user?.user?.userId;
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await chatApi.getConversations();
        const conversations = response.data.data || [];

        // Calculate total unread count
        const totalUnread = conversations.reduce((acc, conv) => {
          let count = 0;
          if (conv.buyerId === userId) {
            count = conv.unreadCountBuyer || 0;
          } else if (conv.sellerId === userId) {
            count = conv.unreadCountSeller || 0;
          }
          return acc + count;
        }, 0);

        setUnreadMessageCount(totalUnread);
      } catch (error) {
        console.error("Failed to fetch unread message count:", error);
      }
    };

    fetchUnreadCount();

    // WebSocket for real-time updates
    chatWebSocketService.connect(() => {
      chatWebSocketService.subscribe('/user/queue/messages', (message) => {
        // Only increment if message is from someone else
        if (message.senderId !== userId) {
          setUnreadMessageCount(prev => prev + 1);
        }
      });
    });

    // Listen for message read events (when user opens chat page)
    const handleMessageRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener("message-read", handleMessageRead);

    return () => {
      chatWebSocketService.disconnect();
      window.removeEventListener("message-read", handleMessageRead);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <Link
          to="/user/profile"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "8px",
            padding: "12px 20px",
            fontSize: "16px",
            color: "#333",
            textDecoration: "none",
            minWidth: "200px",
          }}
        >
          <UserOutlined /> Thông tin cá nhân
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <span
          onClick={handleLogout}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "8px",
            padding: "12px 20px",
            fontSize: "16px",
            color: "#333",
            width: "100%",
            minWidth: "200px",
          }}
        >
          <LogoutOutlined /> Đăng xuất
        </span>
      ),
    },
  ];

  const categoryMenuItems = categories.map((category) => {
    const IconComponent = category.icon;
    return {
      key: category.id,
      label: (
        <Link
          to={`/category/${category.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#333",
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            borderRadius: "6px",
          }}
          onClick={() => setCategoriesMenuVisible(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F9FB";
            e.currentTarget.style.color = "#008ECC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#333";
          }}
        >
          <IconComponent
            style={{ fontSize: "18px", color: "#008ECC", minWidth: "18px" }}
          />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            {category.name}
          </span>
        </Link>
      ),
    };
  });

  const supportMenuItems = [
    {
      key: "about",
      label: (
        <Link
          to="/about"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#333",
            padding: "12px 20px",
            fontSize: "16px",
          }}
          onClick={() => setSupportMenuVisible(false)}
        >
          Giới Thiệu
        </Link>
      ),
    },
    {
      key: "privacy",
      label: (
        <Link
          to="/privacy"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#333",
            padding: "12px 20px",
            fontSize: "16px",
          }}
          onClick={() => setSupportMenuVisible(false)}
        >
          Chính Sách Bảo Mật
        </Link>
      ),
    },
    {
      key: "terms",
      label: (
        <Link
          to="/terms"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#333",
            padding: "12px 20px",
            fontSize: "16px",
          }}
          onClick={() => setSupportMenuVisible(false)}
        >
          Điều Khoản Dịch Vụ
        </Link>
      ),
    },
    {
      key: "contact",
      label: (
        <Link
          to="/contact"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#333",
            padding: "12px 20px",
            fontSize: "16px",
          }}
          onClick={() => setSupportMenuVisible(false)}
        >
          Liên Hệ
        </Link>
      ),
    },
    {
      key: "faq",
      label: (
        <Link
          to="/faq"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#333",
            padding: "12px 20px",
            fontSize: "16px",
          }}
          onClick={() => setSupportMenuVisible(false)}
        >
          FAQ
        </Link>
      ),
    },
  ];


  return (
    <header
      className="home-header w-full"
      style={{ height: "auto", position: "relative" }}
    >
      {/* Header Top Section - Hidden on Mobile */}
      <div className="header-top w-full desktop-only" style={{ background: '#F5F5F5', height: '36px', position: 'relative' }}>
        <div className="container mx-auto max-w-[1440px] px-[53px] h-full flex items-center justify-center">
          <div className="flex items-center gap-2" style={{ fontSize: '13px', lineHeight: '1em', color: '#666666' }}>
            <SoundOutlined style={{ fontSize: '16px', color: '#008ECC' }} />
            <span>MegaMart– Mua sắm tiện lợi, giá tốt mỗi ngày, giao nhanh tận cửa!</span>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div
        className="desktop-only"
        style={{ width: "100%", height: "0", borderTop: "1px solid #EDEDED" }}
      ></div>

      {/* Header Main Section */}
      <div className="header-main w-full" style={{ position: 'relative', minHeight: '100px', background: 'white', paddingBottom: '50px' }}>
        <div className="container mx-auto max-w-[1440px] px-[16px] md:px-[53px] h-full relative">
          {/* Flex container: Column on mobile, Row on desktop */}
          <div className="flex flex-col md:flex-row items-center justify-between h-full pt-8 gap-4 md:gap-12">

            {/* Top Row on Mobile: Logo + User/Cart */}
            <div className="w-full flex justify-between items-center md:w-[300px]">
              {/* Logo */}
              <Link
                to="/home"
                style={{
                  textDecoration: "none",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  height: "48px",
                }}
              >
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#008ECC",
                    margin: 0,
                    lineHeight: "48px",
                    transition: "color 0.3s",
                  }}
                  className="hover:text-[#0077B3]"
                >
                  MegaMart
                </h1>
              </Link>

              {/* Mobile User/Cart Icons */}
              <div className="flex items-center gap-4 md:hidden">
                {/* Mobile Cart */}
                <Link
                  to="/cart"
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  <ShoppingCartOutlined
                    style={{ fontSize: "24px", color: "#666666" }}
                  />
                  {cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#008ECC",
                        color: "white",
                        fontSize: "10px",
                        borderRadius: "50%",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: "1",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Message Button */}
                {user && (
                  <Link
                    to="/user/chat"
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <MessageOutlined
                      style={{ fontSize: "24px", color: "#666666" }}
                    />
                    {unreadMessageCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#008ECC",
                          color: "white",
                          fontSize: "10px",
                          borderRadius: "50%",
                          minWidth: "16px",
                          height: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: "1",
                        }}
                      >
                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Mobile User Menu (Simplified) */}
                {user ? (
                  <Link to="/user/profile">
                    <Avatar
                      src={user.avatar || user.avatarUrl}
                      icon={<UserOutlined />}
                    />
                  </Link>
                ) : (
                  <Link to="/login">
                    <UserOutlined
                      style={{ fontSize: "24px", color: "#666666" }}
                    />
                  </Link>
                )}
              </div>
            </div>

            {/* Search Box Container - Full width on mobile, centered on desktop */}
            <div className="w-full md:flex-1 md:max-w-[720px] relative order-last md:order-none mt-2 md:mt-0">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Category List Icon - Outside search bar */}
                <Dropdown
                  open={categoriesMenuVisible}
                  onOpenChange={setCategoriesMenuVisible}
                  placement="bottomLeft"
                  trigger={["click"]}
                  dropdownRender={() => (
                    <div
                      style={{
                        background: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        padding: "12px",
                        width: "460px",
                        maxHeight: "480px",
                        overflowY: "auto",
                        border: "1px solid #E8E8E8",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 12px",
                          marginBottom: "8px",
                          borderBottom: "1px solid #EDEDED",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#333",
                          }}
                        >
                          Danh mục sản phẩm
                        </h3>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px",
                      }}>
                        {categories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                            <Link
                              key={category.id}
                              to={`/category/${category.id}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                textDecoration: "none",
                                color: "#333",
                                padding: "10px 14px",
                                fontSize: "15px",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                                borderRadius: "6px",
                              }}
                              onClick={() => setCategoriesMenuVisible(false)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#F3F9FB";
                                e.currentTarget.style.color = "#008ECC";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#333";
                              }}
                            >
                              <IconComponent
                                style={{ fontSize: "20px", color: "#008ECC", minWidth: "20px" }}
                              />
                              <span style={{ fontSize: "15px", fontWeight: 500 }}>
                                {category.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "48px",
                      height: "48px",
                      background: "#F3F9FB",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#E0F2F9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#F3F9FB";
                    }}
                    onClick={() =>
                      setCategoriesMenuVisible(!categoriesMenuVisible)
                    }
                  >
                    <UnorderedListOutlined
                      style={{
                        fontSize: "20px",
                        color: "#008ECC",
                      }}
                    />
                  </div>
                </Dropdown>

                {/* Search Box */}
                <div
                  style={{
                    background: "#F3F9FB",
                    borderRadius: "10px",
                    height: "48px",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    gap: "12px"
                  }}
                >
                  <SearchOutlined
                    style={{
                      fontSize: "18px",
                      color: "#008ECC",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (searchValue.trim()) {
                        navigate(
                          `/search?keyword=${encodeURIComponent(
                            searchValue.trim()
                          )}`
                        );
                      }
                    }}
                  />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onPressEnter={() => {
                      if (searchValue.trim()) {
                        navigate(
                          `/search?keyword=${encodeURIComponent(
                            searchValue.trim()
                          )}`
                        );
                      }
                    }}
                    bordered={false}
                    style={{
                      background: "transparent",
                      fontSize: "14px",
                      lineHeight: "1.2857142857142858em",
                      color: "#95959C",
                      flex: 1,
                    }}
                  />
                </div>
              </div>
              {/* Search Suggestions - Hidden on Mobile to save space */}
              <div className="flex items-center gap-3 desktop-only" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                marginTop: '6px',
                paddingLeft: '58px',
                zIndex: 10
              }}>
                {topSearches.map((search, index) => (
                  <span
                    key={index}
                    onClick={() =>
                      navigate(`/search?keyword=${encodeURIComponent(search)}`)
                    }
                    className="cursor-pointer hover:text-[#008ECC] transition-colors"
                    style={{
                      fontSize: "12px",
                      lineHeight: "1.3846153846153846em",
                      color: "#95959C",
                      fontWeight: 400,
                    }}
                  >
                    {search}
                  </span>
                ))}
              </div>
            </div>

            {/* Support Dropdown - Desktop Only */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
              <Dropdown
                menu={{ items: supportMenuItems }}
                open={supportMenuVisible}
                onOpenChange={setSupportMenuVisible}
                placement="bottomRight"
                trigger={["click"]}
                dropdownRender={(menu) => (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      padding: "8px 0",
                      minWidth: "220px",
                    }}
                  >
                    {menu}
                  </div>
                )}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F3F9FB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <QuestionCircleOutlined
                    style={{ fontSize: "20px", color: "#008ECC" }}
                  />
                  <span style={{ fontSize: "16px", color: "#666666", fontWeight: 500 }}>
                    Hỗ Trợ
                  </span>
                </div>
              </Dropdown>
            </div>

            {/* Desktop User/Login Section - Hidden on Mobile */}
            <div className="desktop-only md:w-[300px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', flexShrink: 0, height: '48px' }}>
              {user ? (
                // Đã đăng nhập: hiển thị tên, avatar, chuông thông báo
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <NotificationBell />
                  </div>
                  <Link
                    to="/user/chat"
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      transition: "background 0.2s",
                      marginRight: "15px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <MessageOutlined
                      style={{ fontSize: "20px", color: "#666666" }}
                    />
                    {unreadMessageCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          background: "#008ECC",
                          color: "white",
                          fontSize: unreadMessageCount > 99 ? "9px" : "10px",
                          borderRadius: "50%",
                          minWidth: unreadMessageCount > 99 ? "18px" : "16px",
                          height: unreadMessageCount > 99 ? "18px" : "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: unreadMessageCount > 99 ? "0 4px" : "0",
                          lineHeight: "1",
                        }}
                      >
                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: "200px" }}
                    dropdownRender={(menu) => (
                      <div
                        style={{
                          background: "white",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          padding: "8px 0",
                          minWidth: "200px",
                        }}
                      >
                        {menu}
                      </div>
                    )}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <Avatar
                        src={
                          user.avatar ||
                          user.profilePicture ||
                          user.avata ||
                          user.avatarUrl ||
                          user.data?.user?.avatarUrl ||
                          user.data?.user?.avata ||
                          user.user?.avatarUrl ||
                          user.user?.avata
                        }
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#008ECC" }}
                      />
                      <span style={{ fontSize: '16px', lineHeight: '1.125em', color: '#666666', fontWeight: 700, maxWidth: '120px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.fullName || user.data?.user?.fullName || user.user?.fullName || user.username || user.data?.user?.username || user.user?.username || user.email || user.data?.user?.email || user.user?.email || 'Người dùng'}
                      </span>
                    </div>
                  </Dropdown>
                  <div
                    style={{
                      width: "0",
                      height: "24px",
                      borderLeft: "1px solid #D9D9D9",
                    }}
                  ></div>
                </>
              ) : (
                // Chưa đăng nhập: hiển thị link đăng ký/đăng nhập
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Link
                    to="/register"
                    style={{
                      textDecoration: "none",
                      fontSize: "16px",
                      lineHeight: "1.125em",
                      color: "#666666",
                      fontWeight: 700,
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#008ECC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#666666";
                    }}
                    className="auth-link"
                  >
                    Đăng ký
                  </Link>
                  <span style={{ color: "#D9D9D9", fontSize: "16px" }}>/</span>
                  <Link
                    to="/login"
                    style={{
                      textDecoration: "none",
                      fontSize: "16px",
                      lineHeight: "1.125em",
                      color: "#666666",
                      fontWeight: 700,
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#008ECC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#666666";
                    }}
                    className="auth-link"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}

              {/* Shopping Cart */}
              <Link
                to="/cart"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                <ShoppingCartOutlined
                  style={{ fontSize: "24px", color: "#666666" }}
                />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#008ECC",
                      color: "white",
                      fontSize: cartCount > 99 ? "9px" : "10px",
                      borderRadius: "50%",
                      minWidth: cartCount > 99 ? "20px" : "16px",
                      height: cartCount > 99 ? "20px" : "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: cartCount > 99 ? "0 4px" : "0",
                      lineHeight: "1",
                    }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
