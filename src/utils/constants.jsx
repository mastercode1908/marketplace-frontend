// manage api
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",

  // Register
  REGISTER_USER: "/auth/register/user",
  REGISTER_GOOGLE: "/auth/google",

  // Email verify
  VERIFY_MAIL: "/auth/email/verify",

  // Password
  FORGOT_PASSWORD: "/auth/password/forgot",
  RESET_PASSWORD: "/auth/password/reset",

  // Refresh token
  REFRESH_TOKEN: "/auth/refresh",

  // Prioducts
  PRODUCTS: "/product",
  PRODUCTS_SELLER: "/product/me",

  //Images & Videos
  UPLOAD_IMAGES_VIDEOS: "/media/upload",
  DELETE_IMAGES_VIDEOS: "/media/delete",
  UPLOAD_IMAGES_SINGLE: "/media/upload/single",

  CATEGORIES: "/category",

  SELLER_SHOP_INFO_ADD: "/seller/shop-info",
};

// manage role
export const APP_ROLES = {
  SYSTEMADMIN: "ADMIN",
  CONTENTADMIN: "CONTENTADMIN",
  SELLER: "SELLER",
  BUYER: "BUYER",
};

// map code backend -> message tiếng Việt
export const ERROR_MESSAGES_VN = {
  // Global exception
  9999: "Lỗi không xác định",
  1000: "Dữ liệu không hợp lệ, vui lòng chỉnh sửa và thử lại",
  1001: "Tên đăng nhập hoặc mật khẩu sai",
  1002: "Bạn không có quyền thực hiện thao tác này",
  1003: "Vi phạm ràng buộc cơ sở dữ liệu",
  1004: "Yêu cầu không hợp lệ",

  // Existed
  2000: "Email đã tồn tại",
  2001: "Người dùng đã tồn tại",
  2002: "Mã số thuế đã tồn tại",
  2003: "Mã khuyến mãi đã tồn tại",

  // Not found
  3000: "Không tìm thấy khuyến mãi",
  3001: "Không tìm thấy người mua",
  3002: "Không tìm thấy người bán",
  3003: "Không tìm thấy sản phẩm",
  3004: "Không tìm thấy đơn hàng",
  3005: "Không tìm thấy đánh giá",
  3006: "Không tìm thấy danh sách yêu thích",
  3007: "Không tìm thấy gói dịch vụ",
  3008: "Người dùng không tồn tại vui lòng đăng ký",
  3009: "Không tìm thấy gói Flash Sale",
  3010: "Không tìm thấy thông báo",
  3011: "Không tìm thấy danh mục",
  3018: "Không tìm thấy cửa hàng có ID cửa hàng này trong GHN. Vui lòng kiểm tra lại Mã thông báo và ID cửa hàng của bạn.",
  3019: "Mã thông báo GHN không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại Mã thông báo.",

  // Invalid
  4000: "Tên đăng nhập phải có ít nhất 10 ký tự",
  4001: "Mật khẩu phải có ít nhất 8 ký tự và tối đa 20 kí tự",
  4002: "Khóa không hợp lệ",
  4003: "Email này đã được đăng ký với vai trò khác",
  4004: "Ngày kết thúc phải sau ngày bắt đầu",
  4005: "Ngày bắt đầu phải sau hôm nay",
  4006: "Ngày kết thúc phải sau hôm nay",
  4007: "Phần trăm chiết khấu không được vượt quá 100%",
  4028: "Giới hạn sử dụng chỉ được tối đa là 10",

  // Password
  5000: "Mật khẩu phải có ít nhất 1 chữ hoa",
  5001: "Mật khẩu phải có ít nhất 1 chữ thường",
  5002: "Mật khẩu phải có ít nhất 1 số",
  5003: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)",
  5004: "Mật khẩu quá yếu hoặc phổ biến",

  // Login
  6000: "Email chưa được xác thực",
  6001: "Tài khoản đã bị cấm",
  6002: "Tài khoản chưa được kích hoạt",
  6003: "Tài khoản đang chờ kích hoạt",
  6004: "Tài khoản đã bị xóa",

  //Promotion
  7000: "Mã khuyến mãi không tồn tại",
  7001: "Mã khuyến mãi chưa được kích hoạt",
  7002: "Mã khuyến mãi chưa đến thời gian bắt đầu",
  7003: "Mã khuyến mãi đã hết hạn",
  7004: "Mã khuyến mãi không áp dụng cho cửa hàng này",
  7005: "Mã khuyến mãi đã đạt giới hạn sử dụng",
  7006: "Bạn đã sử dụng mã khuyến mãi này trước đó",
  7007: "Tổng đơn hàng không đáp ứng giá trị tối thiểu của mã khuyến mãi",
  7008: "Người sở hữu mã khuyến mãi không hợp lệ",
  7009: "Không thể áp dụng mã khuyến mãi cùng với mã khác",
  7010: "Mã khuyến mãi đã bị xóa hoặc không còn khả dụng",

  8000: "Gói dịch vụ vẫn còn hạn, không thể đăng ký gói mới",
  //Package errors
  8003: "Bạn chưa mua gói dịch vụ tạo mã giảm giá",
  8001: "Gói dịch vụ của bạn đã hết hạn",
  8002: "Bạn đã sử dụng hết số lần tạo mã giảm giá",
};

// format in system
export const DATE_FORMAT = "DD/MM/YYYY";
