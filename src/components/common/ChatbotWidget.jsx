import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Tag, Avatar, Badge, Tooltip } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, ShoppingOutlined, UserOutlined, ClearOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '@/api/axiosInstance';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Xin chào! Tôi là trợ lý AI thông minh. Tôi có thể giúp bạn tìm sản phẩm, tư vấn giá cả và kiểm tra tình trạng hàng hóa.', sender: 'bot', products: [] }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { id: Date.now(), text: inputValue, sender: 'user', products: [] };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post(`${import.meta.env.VITE_API_BASE_URL}rag/chat`, {
                message: userMessage.text
            });

            if (response.data) {
                const botResponse = {
                    id: Date.now() + 1,
                    text: response.data.message,
                    sender: 'bot',
                    products: response.data.products || []
                };
                setMessages(prev => [...prev, botResponse]);
            }
        } catch (error) {
            console.error("RAG Chatbot error:", error);
            const errorResponse = {
                id: Date.now() + 1,
                text: "Xin lỗi, tôi đang gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.",
                sender: 'bot',
                products: []
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            { id: 1, text: 'Xin chào! Tôi là trợ lý AI thông minh. Tôi có thể giúp bạn tìm sản phẩm, tư vấn giá cả và kiểm tra tình trạng hàng hóa.', sender: 'bot', products: [] }
        ]);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[380px] sm:w-[420px] shadow-2xl rounded-2xl overflow-hidden border border-white/20 backdrop-blur-xl bg-white/95 flex flex-col"
                        style={{ maxHeight: 'calc(100vh - 120px)', height: '600px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#008ECC] via-[#00A8E8] to-[#00C2FF] p-4 text-white flex items-center justify-between shadow-md shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm opacity-20"></div>
                            <div className="flex items-center gap-3 z-10">
                                <motion.div
                                    className="bg-white/20 p-1.5 rounded-full backdrop-blur-md border border-white/30"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <img src="/assets/robot_avatar.png" alt="AI" className="w-10 h-10 object-cover rounded-full" />
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight m-0 text-white">Trợ lý AI</h3>
                                    <span className="text-xs text-blue-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 z-10">
                                <Tooltip title="Xóa đoạn chat">
                                    <button onClick={handleClearChat} className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/90">
                                        <ClearOutlined />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Đóng">
                                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/90">
                                        <CloseOutlined />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth custom-scrollbar">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className="shrink-0">
                                        {msg.sender === 'bot' ? (
                                            <motion.div
                                                className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm border-2 border-white"
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                            >
                                                <img src="/assets/robot_avatar.png" alt="Bot" className="w-full h-full object-cover" />
                                            </motion.div>
                                        ) : (
                                            <Avatar icon={<UserOutlined />} className="bg-gray-300" size={36} />
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-gradient-to-br from-[#008ECC] to-[#0077AA] text-white rounded-tr-none'
                                                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>

                                        {/* Product Cards Carousel */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="mt-3 w-full space-y-2">
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1 mb-1">
                                                    Sản phẩm gợi ý
                                                </div>
                                                <div className="grid gap-2">
                                                    {msg.products.map((product, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-3 group"
                                                            onClick={() => window.location.href = `/product/${product.productId}`}
                                                        >
                                                            {/* Product Image */}
                                                            <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 transition-colors overflow-hidden">
                                                                {product.imageUrl ? (
                                                                    <img
                                                                        src={product.imageUrl}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <ShoppingOutlined className="text-xl fallback-icon" style={{ display: product.imageUrl ? 'none' : 'flex' }} />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-gray-800 text-sm truncate group-hover:text-[#008ECC] transition-colors">
                                                                    {product.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 mb-1">
                                                                    {product.description}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[#008ECC] font-bold text-sm">
                                                                        {formatPrice(product.price)}
                                                                    </span>
                                                                    {product.stockQuantity > 0 ? (
                                                                        <Tag color="success" className="m-0 text-[10px] px-1.5 border-0 bg-green-100 text-green-700">
                                                                            Còn hàng
                                                                        </Tag>
                                                                    ) : (
                                                                        <Tag color="error" className="m-0 text-[10px] px-1.5 border-0 bg-red-100 text-red-700">
                                                                            Hết hàng
                                                                        </Tag>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm border-2 border-white shrink-0">
                                        <img src="/assets/robot_avatar.png" alt="Bot" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-[#008ECC] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#008ECC] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-[#008ECC] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-[#008ECC] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <Input
                                    placeholder="Nhập tin nhắn..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                    className="border-none bg-transparent shadow-none focus:shadow-none px-4 text-sm"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<SendOutlined />}
                                    onClick={handleSendMessage}
                                    loading={isLoading}
                                    className="bg-gradient-to-r from-[#008ECC] to-[#00A8E8] border-none shadow-md hover:shadow-lg hover:scale-105 transition-all shrink-0"
                                    size="large"
                                />
                            </div>
                            <div className="text-[10px] text-center text-gray-400 mt-2">
                                AI có thể đưa ra thông tin không chính xác.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Chat Button */}
            <div className="flex flex-col items-end gap-2">
                <motion.button
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 3, -3, 0]
                    }}
                    transition={{
                        y: {
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        rotate: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-20 h-20 bg-gradient-to-br from-[#008ECC] via-[#00A8E8] to-[#00C2FF] rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-[#008ECC]/50 transition-all border-4 border-white z-[9999] overflow-hidden relative group"
                >
                    {isOpen ? (
                        <CloseOutlined className="text-2xl z-10" />
                    ) : (
                        <>
                            <motion.img
                                src="/assets/robot_avatar.png"
                                alt="AI Chat"
                                className="w-full h-full object-cover scale-110"
                                whileHover={{ scale: 1.2 }}
                            />
                            <motion.span
                                className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            ></motion.span>
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </>
                    )}
                </motion.button>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-[#008ECC] text-[#008ECC] font-semibold text-sm whitespace-nowrap"
                    >
                        💬 Hỏi đáp AI
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ChatbotWidget;
