"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  Trash2,
  Plus,
  X,
  Film,
  LucideComponent as ImageIconComponent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import mediaApi from "@/api/identity/mediaApi";
import { toast } from "react-hot-toast"; // hoặc bất cứ thư viện toast nào bạn dùng
import { ERROR_MESSAGES_VN } from "@/utils/constants";
import productApi from "@/api/identity/productApi";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { color } from "framer-motion";

const SellerProductForm = () => {
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]); // theo dõi media đang xóa
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "",
    weight: "",
    stockQuantity: "",
    media: [], // Array of { id, file, preview, type }
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // hook router

  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const { productId } = useParams();

  useEffect(() => {
    if (!productId) return; // đang tạo mới

    const fetchProduct = async () => {
      const res = await productApi.getById(productId);
      const product = res.data;

      // Set thông tin form
      setFormData((prev) => ({
        ...prev,
        name: product.name,
        categoryId: product.categoryId.toString(),
        description: product.description,
        price: product.price,
        weight: product.weight,
        stockQuantity: product.stockQuantity,
      }));

      // Set media cũ
      setExistingMedia(
        product.media.map((m) => ({
          id: Date.now() + Math.random(),
          url: m.url,
          publicId: m.publicId,
          type: m.mediaType,
          preview: m.url,
          isNew: false,
          position: m.position,
        }))
      );
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      media: [...existingMedia, ...newMedia],
    }));
  }, [existingMedia, newMedia]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formDataUploads = new FormData();
    files.forEach((f) => formDataUploads.append("file", f)); // backend /upload-multiple

    try {
      setUploading(true);
      const res = await mediaApi.uploadMultiple(formDataUploads);
      // res.data = list { url, publicId, mediaType }

      const uploadedMedia = res.data.map((m) => ({
        id: Date.now() + Math.random(),
        url: m.url,
        publicId: m.publicId,
        type: m.mediaType.toUpperCase(),
        preview: m.url, // Set preview cho cả image và video
        name: m.publicId,
        isNew: true,
      }));

      // setFormData(prev => ({
      //     ...prev,
      //     media: [...prev.media, ...uploadedMedia]
      // }));
      setNewMedia((prev) => [...prev, ...uploadedMedia]);
      toast.success(`Đã tải lên ${uploadedMedia.length} media thành công!`);
    } catch (error) {
      console.error("Upload media failed:", error);
      toast.error("Upload ảnh/video thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = async (id) => {
    let mediaToDelete =
      existingMedia.find((m) => m.id === id) ||
      newMedia.find((m) => m.id === id);

    if (!mediaToDelete) return;

    try {
      setDeletingIds((prev) => [...prev, id]);

      // Xóa Cloudinary
      await mediaApi.deleteMedia(
        mediaToDelete.publicId,
        mediaToDelete.type.toLowerCase()
      );

      // Xóa ở state đúng loại
      if (mediaToDelete.isNew === false) {
        setExistingMedia((prev) => prev.filter((m) => m.id !== id));
      } else {
        setNewMedia((prev) => prev.filter((m) => m.id !== id));
      }

      toast.success("Xóa media thành công!");
    } catch (error) {
      console.log("Lỗi", error);
      toast.error("Xóa media thất bại!");
    } finally {
      setDeletingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate cơ bản nếu cần
    if (!formData.name || !formData.categoryId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    const isEdit = Boolean(productId);

    try {
      // có thể hiển thị loading nếu muốn
      toast.loading(
        isEdit ? "Đang cập nhật sản phẩm..." : "Đang thêm sản phẩm...",
        {
          id: "productAction",
        }
      );
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        price: Number(formData.price),
        weight: Number(formData.weight),
        stockQuantity: Number(formData.stockQuantity),
        media: [...existingMedia, ...newMedia].map((m, i) => ({
          url: m.url,
          publicId: m.publicId,
          type: m.type,
          position: i + 1,
        })),
      };

      let res;
      if (isEdit) {
        res = await productApi.updateProduct(payload, productId);
      } else {
        res = await productApi.createProduct(payload);
      }
      // Success
      toast.dismiss("productAction");
      toast.success(
        isEdit ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!"
      );
      console.log("Product response:", res);

      // Reset form khi tạo mới
      if (!isEdit) {
        setFormData({
          name: "",
          categoryId: "",
          description: "",
          price: "",
          weight: "",
          stockQuantity: "",
          media: [],
        });
      }
      navigate("/seller/products");
    } catch (err) {
      toast.dismiss("productAction");
      console.error("Product error:", err);

      const code = err.response?.data?.code;
      const backendMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors; // Object { field: message }

      // Nếu có validation errors từ backend (code 1000), parse và hiển thị ở từng field
      if (
        code === 1000 &&
        validationErrors &&
        typeof validationErrors === "object"
      ) {
        setErrors(validationErrors);
        toast.error("Vui lòng kiểm tra lại thông tin sản phẩm!");
      } else {
        // Hiển thị message chung
        const message =
          ERROR_MESSAGES_VN?.[code] ||
          backendMessage ||
          err.message ||
          (isEdit ? "Cập nhật sản phẩm thất bại!" : "Thêm sản phẩm thất bại!");
        toast.error(message);
      }
    }
  };

  const imageCount = formData.media.filter((m) => m.type === "IMAGE").length;
  const videoCount = formData.media.filter((m) => m.type === "VIDEO").length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            type="button"
            variant="default"
            onClick={() => navigate("/seller/products")}
            className="flex items-center gap-2 bg-white text-black border border-black hover:bg-gray-100"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại quản lý sản phẩm
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1
            style={{ color: "#1677ff" }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-2"
          >
            {productId ? "Sửa sản phẩm" : "Thêm Sản Phẩm Mới"}
          </h1>
          <p className="text-muted-foreground">
            Điền thông tin chi tiết về sản phẩm của bạn
          </p>
        </div>

        {/* Main Layout: Form + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Sản Phẩm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="font-semibold mb-2 block">
                      Tên Sản Phẩm *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                      required
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="categoryId"
                      className="font-semibold mb-2 block"
                    >
                      Danh Mục *
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, categoryId: value }))
                      }
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Điện thoại</SelectItem>
                        <SelectItem value="2">Laptop</SelectItem>
                        <SelectItem value="3">Phụ kiện</SelectItem>
                        <SelectItem value="4">Quần áo</SelectItem>
                        <SelectItem value="5">Giày dép</SelectItem>
                        <SelectItem value="6">Đồng hồ</SelectItem>
                        <SelectItem value="7">Mỹ phẩm</SelectItem>
                        <SelectItem value="8">Đồ gia dụng</SelectItem>
                        <SelectItem value="9">Thể thao</SelectItem>
                        <SelectItem value="10">Sách</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="font-semibold mb-2 block"
                    >
                      Mô Tả Sản Phẩm *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả tối thiểu 10 ký tự về tính năng, chất lượng, bảo hành..."
                      rows={4}
                      required
                      maxLength={2000}
                      minLength={10}
                      className={`resize-none ${
                        errors.description ? "border-red-500" : ""
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Giá & Tồn Kho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="price"
                        className="font-semibold mb-2 block"
                      >
                        Giá Bán (₫) *
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="1000"
                        min="1"
                        max="1000000000"
                        step="1"
                        required
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="weight"
                        className="font-semibold mb-2 block"
                      >
                        Cân Nặng (g) *
                      </Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="1"
                        min="1"
                        max="100000"
                        step="1"
                        required
                        className={errors.weight ? "border-red-500" : ""}
                      />
                      {errors.weight && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.weight}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="stockQuantity"
                        className="font-semibold mb-2 block"
                      >
                        Số Lượng *
                      </Label>
                      <Input
                        id="stockQuantity"
                        name="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        placeholder="1"
                        min="1"
                        max="100000"
                        step="1"
                        required
                        className={errors.stockQuantity ? "border-red-500" : ""}
                      />
                      {errors.stockQuantity && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.stockQuantity}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Hình Ảnh & Video
                  </CardTitle>
                  <CardDescription>
                    Hình ảnh tối đa 5, Video tối đa 1. Vui lòng upload ảnh
                    trước.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Upload Area */}
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        className="hidden"
                        disabled={uploading} // disable khi đang upload
                      />
                      <div className="flex justify-center gap-4 mb-3">
                        <ImageIconComponent className="w-8 h-8 text-primary" />
                        <Film className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground">
                        Kéo thả hoặc nhấp để chọn
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, WebP, MP4, MOV (tối đa 50MB/file)
                      </p>
                      {/* Loading Bar */}
                      {uploading && (
                        <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden mb-2 relative">
                          <div
                            className="absolute h-full bg-green-500 rounded-full"
                            style={{
                              width: "50%",
                              animation: "loading 3s infinite",
                            }}
                          ></div>

                          <style jsx>{`
                            @keyframes loading {
                              0% {
                                left: -50%;
                              }
                              50% {
                                left: 25%;
                              }
                              100% {
                                left: 100%;
                              }
                            }
                          `}</style>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Media List */}
                  {formData.media.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          Đã tải:{" "}
                          <span className="text-primary">{imageCount}</span>{" "}
                          ảnh,{" "}
                          <span className="text-primary">{videoCount}</span>{" "}
                          video
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.media.map((media) => (
                          <div key={media.id} className="relative group">
                            <div className="bg-muted rounded-lg overflow-hidden h-32 flex items-center justify-center border border-border relative">
                              {media.type === "IMAGE" ? (
                                <img
                                  src={
                                    media.preview ||
                                    media.url ||
                                    "/placeholder.svg"
                                  }
                                  alt={media.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={media.preview || media.url}
                                  controls
                                  muted
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMedia(media.id)}
                              disabled={deletingIds.includes(media.id)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center justify-center"
                            >
                              {deletingIds.includes(media.id) ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {productId ? "Cập nhật sản phẩm" : "Thêm Sản Phẩm"}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Xem Trước</CardTitle>
                <CardDescription>Cách khách hàng nhìn thấy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Image/Video */}
                <div className="bg-muted rounded-lg overflow-hidden h-48 flex items-center justify-center border border-border relative">
                  {formData.media.length > 0 ? (
                    formData.media[0].type === "IMAGE" ? (
                      <img
                        src={
                          formData.media[0].preview ||
                          formData.media[0].url ||
                          "/placeholder.svg"
                        }
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={formData.media[0].preview || formData.media[0].url}
                        controls
                        muted
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIconComponent className="w-12 h-12" />
                      <span className="text-sm">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <h3 className="font-bold text-base text-foreground line-clamp-2 h-14 flex items-center">
                    {formData.name || "Tên sản phẩm"}
                  </h3>
                </div>

                {/* Price */}
                <div className="border-t border-border pt-3">
                  {formData.price ? (
                    <p className="text-2xl font-bold text-primary">
                      {parseInt(formData.price || 0).toLocaleString("vi-VN")}₫
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Nhập giá để xem
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <div className="border-t border-border pt-3">
                  {formData.stockQuantity ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Còn hàng:</span>
                      <span
                        className={`font-semibold text-sm ${
                          parseInt(formData.stockQuantity) > 0
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {formData.stockQuantity}
                      </span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Nhập số lượng
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="border-t border-border pt-3">
                  {formData.categoryId && (
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      {formData.categoryId === "1" && "Điện thoại"}
                      {formData.categoryId === "2" && "Laptop"}
                      {formData.categoryId === "3" && "Phụ kiện"}
                      {formData.categoryId === "4" && "Quần áo"}
                      {formData.categoryId === "5" && "Giày dép"}
                      {formData.categoryId === "6" && "Đồng hồ"}
                      {formData.categoryId === "7" && "Mỹ phẩm"}
                      {formData.categoryId === "8" && "Đồ gia dụng"}
                      {formData.categoryId === "9" && "Thể thao"}
                      {formData.categoryId === "10" && "Sách"}
                    </span>
                  )}
                </div>

                {/* Media Count */}
                {formData.media.length > 0 && (
                  <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                    <p>
                      📸 {imageCount} ảnh • 🎬 {videoCount} video
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductForm;
