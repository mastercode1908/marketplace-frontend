/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Form,
  Input,
  Button,
  Card,
  Spin,
  Alert,
  Descriptions,
  Space,
  Select,
  Divider,
} from "antd";
import { toast } from "react-hot-toast";
import {
  ShopOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { ShippingApi } from "../../api/shipping/ShippingApi";
import { ERROR_MESSAGES_VN } from "../../utils/constants";
import SellerHeader from "../../components/layout/SellerHeader";

const { Option } = Select;

const { Content } = Layout;

export default function GHNShopInfoPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem có đang trong SellerLayout không (path bắt đầu với /seller)
  const isInSellerLayout = location.pathname.startsWith("/seller");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchShopInfo();
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const res = await ShippingApi.getProvinces();
      if (res.data && Array.isArray(res.data)) {
        setProvinces(res.data);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
    }
  };

  const loadDistrictsByProvince = async (provinceId, shouldReset = true) => {
    try {
      const res = await ShippingApi.getDistricts(provinceId);
      if (res.data && Array.isArray(res.data)) {
        setDistricts(res.data);
      }
      setWards([]); // Reset wards khi đổi province
      // Chỉ reset form values nếu shouldReset = true (khi user chọn province mới)
      // Không reset khi đang load từ API response (shouldReset = false)
      if (shouldReset) {
        form.setFieldsValue({
          pickupDistrictId: undefined,
          pickupWardCode: undefined,
        });
      }
    } catch (error) {
      console.error("Error loading districts:", error);
    }
  };

  const loadWards = async (districtId) => {
    try {
      const res = await ShippingApi.getWards(districtId);
      if (res.data && Array.isArray(res.data)) {
        setWards(res.data);
      }
    } catch (error) {
      console.error("Error loading wards:", error);
    }
  };

  const fetchShopInfo = async () => {
    setFetching(true);
    try {
      const res = await ShippingApi.getGHNShopInfo();
      setShopInfo(res.data);

      // Chỉ set shopCode và address, KHÔNG set token (bảo mật)
      form.setFieldsValue({
        ghnShopCode: res.data.ghnShopCode,
        pickupAddress: res.data.pickupAddress,
        pickupProvinceId: res.data.pickupProvinceId, // Tự động chọn province
      });

      // Load districts và wards trước, sau đó mới set giá trị
      if (res.data.pickupProvinceId) {
        // Load districts từ province_id (không reset form values)
        await loadDistrictsByProvince(res.data.pickupProvinceId, false);
      }

      // Sau khi districts đã load xong, set district_id
      if (res.data.pickupDistrictId) {
        form.setFieldsValue({
          pickupDistrictId: res.data.pickupDistrictId,
        });

        // Load wards từ district_id
        await loadWards(res.data.pickupDistrictId);

        // Sau khi wards đã load xong, set ward_code
        if (res.data.pickupWardCode) {
          form.setFieldsValue({
            pickupWardCode: res.data.pickupWardCode,
          });
        }
      }
    } catch (error) {
      // Nếu chưa có thông tin, không hiển thị lỗi
      if (error.response?.status !== 400) {
        console.error("Error fetching GHN shop info:", error);
      }
    } finally {
      setFetching(false);
    }
  };

  // Bỏ hàm handleFetchShopInfo và handleAutoFetch - không còn tự động lấy thông tin

  const getErrorMessage = (error, defaultMessage) => {
    const errorCode = error.response?.data?.code;

    // Ưu tiên lấy lỗi từ map ERROR_MESSAGES_VN nếu có code
    if (errorCode && ERROR_MESSAGES_VN[errorCode]) {
      return ERROR_MESSAGES_VN[errorCode];
    }

    // Fallback về message trong response nếu không có code trong map
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      defaultMessage
    );
  };

  const handlePreviewShopInfo = async () => {
    const token = form.getFieldValue("ghnToken");
    const shopCode = form.getFieldValue("ghnShopCode");

    if (!token || !shopCode) {
      if (!isAuto) {
        toast.error("Vui lòng nhập Token và Shop Code trước");
      }
      return;
    }

    setLoadingPreview(true);
    setErrorMessage(null);

    try {
      const res = await ShippingApi.previewGHNShopInfo({
        ghnToken: token,
        ghnShopCode: shopCode,
      });

      const shopData = res.data;

      // Tự động điền địa chỉ vào form
      if (shopData.address) {
        form.setFieldsValue({
          pickupAddress: shopData.address,
        });
      }

      // Nếu có provinceId, load districts và set province
      if (shopData.provinceId) {
        form.setFieldsValue({
          pickupProvinceId: shopData.provinceId,
        });
        // Load districts từ province_id
        await loadDistrictsByProvince(shopData.provinceId, false);
      }

      // Nếu có districtId, load wards và set district
      if (shopData.districtId) {
        form.setFieldsValue({
          pickupDistrictId: shopData.districtId,
        });
        // Load wards từ district_id
        await loadWards(shopData.districtId);
      }

      // Nếu có wardCode, set ward
      if (shopData.wardCode) {
        form.setFieldsValue({
          pickupWardCode: shopData.wardCode,
        });
      }

      toast.success("Đã lấy thông tin shop từ GHN thành công!");
    } catch (error) {
      console.error("Error previewing GHN shop info:", error);
      const errorMsg = getErrorMessage(
        error,
        "Không thể lấy thông tin shop từ GHN. Vui lòng kiểm tra lại token và shop ID."
      );

      setErrorMessage(errorMsg);
      toast.error({
        content: errorMsg,
        duration: 5,
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrorMessage(null); // Xóa lỗi cũ khi submit lại

    try {
      // Verify token và shopCode trước khi lưu
      if (!values.ghnToken || !values.ghnToken.trim()) {
        const msg = "Vui lòng nhập GHN Token";
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      if (!values.ghnShopCode) {
        const msg = "Vui lòng nhập GHN Shop Code";
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      // Gọi API để verify và lưu - API sẽ verify shopId với GHN trước khi lưu
      const res = await ShippingApi.saveOrUpdateGHNShopInfo({
        ghnToken: values.ghnToken,
        ghnShopCode: values.ghnShopCode,
        pickupAddress: values.pickupAddress,
        pickupDistrictId: values.pickupDistrictId,
        pickupWardCode: values.pickupWardCode,
      });

      setShopInfo(res.data);
      setErrorMessage(null); // Xóa lỗi khi thành công
      toast.success("Lưu thông tin GHN shop thành công!");

      // Xóa token khỏi form sau khi lưu thành công (bảo mật)
      form.setFieldsValue({
        ghnToken: "",
      });
    } catch (error) {
      console.error("Error saving GHN shop info:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);

      // Lấy message từ error response
      const errorMsg = getErrorMessage(
        error,
        "Không thể lưu thông tin GHN shop. Vui lòng kiểm tra lại token và shop ID."
      );

      // Hiển thị lỗi trên màn hình (Alert) và notification
      setErrorMessage(errorMsg);
      toast.error({
        content: errorMsg,
        duration: 5, // Hiển thị 5 giây
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isInSellerLayout && <SellerHeader />}
      <Layout>
        <Content className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/seller/dashboard")}
            className="mb-4"
            style={{ marginBottom: "20px", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Quay lại
          </Button>
          <Card
            title={
              <Space>
                <ShopOutlined />
                <span>Cấu hình GHN Shop</span>
              </Space>
            }
            className="shadow-lg"
          >
            <Alert
              message="Hướng dẫn"
              description={
                <div className="mt-2">
                  <p>Để lấy Token và Shop ID từ GHN:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Đăng nhập vào tài khoản GHN tại{" "}
                      <a
                        href="https://khachhang.ghn.vn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        https://khachhang.ghn.vn/
                      </a>
                    </li>
                    <li>Vào mục "Chủ cửa hàng" hoặc "Cài đặt"</li>
                    <li>Sao chép Token API và Shop ID</li>
                    <li>Nhập vào form bên dưới và nhấn "Lưu"</li>
                  </ol>
                  <p className="mt-2 text-sm text-gray-600">
                    Nhập Token và Shop Code mới, sau đó nhấn nút "Cập nhật" để
                    lưu. Hệ thống sẽ <strong>tự động verify</strong> Shop Code
                    với GHN API trước khi lưu. Nếu Shop Code không tồn tại trong
                    GHN, hệ thống sẽ không cho phép lưu.
                  </p>
                </div>
              }
              type="info"
              icon={<InfoCircleOutlined />}
              className="mb-6"
            />

            {/* Hiển thị lỗi trên màn hình */}
            {errorMessage && (
              <Alert
                message="Lỗi"
                description={errorMessage}
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage(null)}
                className="mb-6"
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="mt-4"
            >
              <Form.Item
                label="GHN Token"
                name="ghnToken"
                rules={[{ required: true, message: "Vui lòng nhập GHN Token" }]}
              >
                <Input.Password
                  placeholder="Nhập GHN Token mới (token cũ không được hiển thị để bảo mật)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="GHN Shop Code (Shop ID)"
                name="ghnShopCode"
                rules={[
                  { required: true, message: "Vui lòng nhập GHN Shop Code" },
                  {
                    type: "number",
                    transform: (value) => Number(value),
                    message: "Shop Code phải là số",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập GHN Shop Code"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  onClick={handlePreviewShopInfo}
                  loading={loadingPreview}
                  size="large"
                  block
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Lấy thông tin địa chỉ từ GHN
                </Button>
              </Form.Item>

              <Divider orientation="left">
                Địa chỉ lấy hàng (Pickup Address)
              </Divider>
              <Alert
                message="Lưu ý"
                description="Nhập địa chỉ lấy hàng thủ công. Token cũ không được hiển thị để bảo mật, bạn cần nhập lại token mới khi cập nhật."
                type="info"
                className="mb-4"
              />

              <Form.Item
                label="Địa chỉ chi tiết"
                name="pickupAddress"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ lấy hàng" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Tỉnh/Thành phố"
                name="pickupProvinceId"
                rules={[
                  { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
                ]}
              >
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  size="large"
                  onChange={(provinceId) => {
                    // Reset form values và load districts (shouldReset = true mặc định)
                    form.setFieldsValue({
                      pickupDistrictId: undefined,
                      pickupWardCode: undefined,
                    });
                    setDistricts([]);
                    setWards([]);
                    if (provinceId) {
                      loadDistrictsByProvince(provinceId, true); // Reset khi user chọn province mới
                    }
                  }}
                >
                  {provinces.map((province) => (
                    <Option
                      key={province.ProvinceID || province.provinceId}
                      value={province.ProvinceID || province.provinceId}
                    >
                      {province.ProvinceName || province.provinceName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Quận/Huyện"
                name="pickupDistrictId"
                rules={[
                  { required: true, message: "Vui lòng chọn quận/huyện" },
                ]}
              >
                <Select
                  placeholder="Chọn quận/huyện"
                  size="large"
                  disabled={districts.length === 0}
                  onChange={(districtId) => {
                    form.setFieldsValue({ pickupWardCode: undefined });
                    setWards([]);
                    if (districtId) {
                      loadWards(districtId);
                    }
                  }}
                >
                  {districts.map((district) => (
                    <Option
                      key={district.DistrictID || district.districtId}
                      value={district.DistrictID || district.districtId}
                    >
                      {district.DistrictName || district.districtName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Phường/Xã"
                name="pickupWardCode"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                <Select
                  placeholder="Chọn phường/xã"
                  size="large"
                  disabled={wards.length === 0}
                >
                  {wards.map((ward) => (
                    <Option
                      key={ward.WardCode || ward.wardCode}
                      value={ward.WardCode || ward.wardCode}
                    >
                      {ward.WardName || ward.wardName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {shopInfo ? "Cập nhật" : "Lưu"} Thông tin
                </Button>
              </Form.Item>
            </Form>

            {shopInfo && (
              <Card
                title="Thông tin GHN Shop hiện tại"
                className="mt-6"
                type="inner"
              >
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Shop Name">
                    {shopInfo.ghnShopName || "Chưa có"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pickup Address">
                    {shopInfo.pickupAddress || "Chưa có"}
                  </Descriptions.Item>
                  <Descriptions.Item label="District ID">
                    {shopInfo.pickupDistrictId || "Chưa có"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ward Code">
                    {shopInfo.pickupWardCode || "Chưa có"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Card>
        </Content>
      </Layout>
    </div>
  );
}
