// src/pages/ProductTestPage.jsx
import { useState } from "react";
import axiosInstance from "../axiosInstance";

export default function ProductTestPage() {
    const [productId, setProductId] = useState("");
    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [error, setError] = useState("");

    // Get product by ID
    const handleGetProduct = async () => {
        try {
            setError("");
            const res = await axiosInstance.get(`buyer/product/${productId}`);
            setProduct(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching product");
            setProduct(null);
        }
    };

    // Get all products
    const handleGetAllProducts = async () => {
        try {
            setError("");
            const res = await axiosInstance.get(`/api/buyer/product`);
            setAllProducts(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching products");
            setAllProducts([]);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Test Product APIs</h1>

            {/* Get by ID */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Product ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button onClick={handleGetProduct} className="bg-blue-500 text-white px-4 py-2">
                    Get Product
                </button>
                {product && (
                    <pre className="mt-2 bg-gray-100 p-2">{JSON.stringify(product, null, 2)}</pre>
                )}
            </div>

            {/* Get all products */}
            <div className="mb-6">
                <button onClick={handleGetAllProducts} className="bg-green-500 text-white px-4 py-2">
                    Get All Products
                </button>
                {allProducts.length > 0 && (
                    <pre className="mt-2 bg-gray-100 p-2">{JSON.stringify(allProducts, null, 2)}</pre>
                )}
            </div>

            {/* Error */}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
