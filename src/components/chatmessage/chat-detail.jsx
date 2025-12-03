"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, ImageIcon, MoreVertical, Phone, Video } from "lucide-react"
import chatApi from "@/api/communication/chatApi"
import axiosInstance from "@/api/axiosInstance"
import chatWebSocketService from "@/services/chatWebSocketService"

export default function ChatDetail({ conversationId, conversations, currentUserId }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState("")
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const [previewUrl, setPreviewUrl] = useState(null)
    const [previewType, setPreviewType] = useState(null)

    const conversation = conversations.find((c) => c.conversationId === conversationId)

    // Determine other user details
    const isBuyer = currentUserId === conversation?.buyerId
    const otherName = isBuyer ? conversation?.sellerName : conversation?.buyerName
    const otherAvatar = isBuyer ? conversation?.sellerAvatar : conversation?.buyerAvatar
    const otherRole = isBuyer ? "SELLER" : "BUYER"

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (!conversationId) return

        const fetchMessages = async () => {
            try {
                const response = await chatApi.getMessages(conversationId)
                setMessages(response.data) // Assuming response.data is the list of messages
                scrollToBottom()
            } catch (error) {
                console.error("Failed to fetch messages:", error)
            }
        }

        fetchMessages()

        // Connect WebSocket
        chatWebSocketService.connect(() => {
            chatWebSocketService.subscribe('/user/queue/messages', (message) => {
                // Check if message belongs to current conversation
                if (message.conversationId === conversationId) {
                    setMessages((prev) => [...prev, message])
                    scrollToBottom()
                }
            })
        })

        return () => {
            chatWebSocketService.disconnect()
        }
    }, [conversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = () => {
        if (inputValue.trim() === "") return

        const payload = {
            conversationId: conversationId,
            senderId: currentUserId,
            messageType: "TEXT",
            content: inputValue,
            fileUrl: null
        }

        // Optimistic update
        const optimisticMessage = {
            id: Date.now(),
            senderId: currentUserId,
            content: inputValue,
            sentAt: new Date().toISOString(),
            messageType: "TEXT"
        }
        setMessages((prev) => [...prev, optimisticMessage])
        setInputValue("")

        // Send via WebSocket
        chatWebSocketService.sendMessage(payload);
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        try {
            // Upload to backend
            const response = await axiosInstance.post("/media/upload/single", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            const fileUrl = response.data.data.url
            const messageType = file.type.startsWith("image/") ? "IMAGE" : "VIDEO"

            const payload = {
                conversationId: conversationId,
                senderId: currentUserId,
                messageType: messageType,
                content: file.name,
                fileUrl: fileUrl
            }

            // Optimistic update
            const optimisticMessage = {
                id: Date.now(),
                senderId: currentUserId,
                content: file.name,
                sentAt: new Date().toISOString(),
                messageType: messageType,
                fileUrl: URL.createObjectURL(file), // preview tạm
                isLoading: true
            }
            setMessages((prev) => [...prev, optimisticMessage])

            // Send via WebSocket
            chatWebSocketService.sendMessage(payload);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === optimisticMessage.id
                        ? { ...m, fileUrl: fileUrl, isLoading: false }
                        : m
                )
            )

        } catch (error) {
            console.error("File upload failed:", error)
            alert("Failed to upload file")
        } finally {
            // Reset input so same file can be selected again
            event.target.value = null
        }
    }

    return (
        <div className="flex-1 bg-white flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={otherAvatar || "/placeholder.svg"}
                                alt={otherName}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{otherName}</h2>
                            <p className="text-sm text-slate-500">
                                {otherRole === "BUYER" ? "Người mua" : "Người bán"} • Đang hoạt động
                            </p>
                        </div>
                    </div>

                    {/* <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Phone size={20} className="text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Video size={20} className="text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical size={20} className="text-slate-600" />
                        </button>
                    </div> */}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUserId

                    return (
                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`flex gap-3 max-w-md ${isOwn ? "flex-row-reverse" : ""}`}>
                                {!isOwn && (
                                    <img
                                        src={otherAvatar || "/placeholder.svg"}
                                        alt="Sender"
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                )}

                                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                                    {msg.messageType === "TEXT" || msg.type === "text" ? (
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl ${isOwn
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                                                }`}
                                        >
                                            <p className="text-sm break-words">{msg.content}</p>
                                        </div>
                                    ) : msg.messageType === "IMAGE" || msg.type === "image" ? (
                                        <div className="rounded-2xl overflow-hidden shadow-md max-w-sm">
                                            <div
                                                className="relative rounded-2xl overflow-hidden shadow-md max-w-sm cursor-pointer"
                                                onClick={() => { setPreviewUrl(msg.fileUrl); setPreviewType("IMAGE"); }}
                                            >
                                                <img src={msg.fileUrl} className="w-full h-auto" />

                                                {msg.isLoading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    ) : msg.messageType === "FILE" || msg.type === "file" ? (
                                        <div
                                            className={`px-4 py-3 rounded-2xl flex items-center gap-3 ${isOwn ? "bg-blue-500 text-white" : "bg-white text-slate-900 border border-slate-200"
                                                }`}
                                        >
                                            <Paperclip size={18} />
                                            <span className="text-sm font-medium">{msg.content}</span>
                                        </div>
                                    ) : msg.messageType === "VIDEO" || msg.type === "video" ? (
                                        <div className="rounded-2xl overflow-hidden shadow-md max-w-sm">
                                            <div
                                                className="relative rounded-2xl overflow-hidden shadow-md max-w-sm cursor-pointer"
                                                onClick={() => { setPreviewUrl(msg.fileUrl); setPreviewType("VIDEO"); }}
                                            >
                                                <video controls src={msg.fileUrl} className="w-full h-auto" />

                                                {msg.isLoading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}

                                    <span className="text-xs text-slate-500 mt-1 px-2">
                                        {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
                <div className="flex items-end gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,video/*"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Paperclip size={20} className="text-slate-600" />
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ImageIcon size={20} className="text-slate-600" />
                    </button>

                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />

                    <button
                        onClick={handleSendMessage}
                        className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            {previewUrl && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="relative max-w-3xl max-h-[90vh]">

                        <button
                            onClick={() => setPreviewUrl(null)}
                            className="absolute -top-10 right-0 text-white text-3xl font-bold"
                        >
                            ✕
                        </button>

                        {previewType === "IMAGE" ? (
                            <img src={previewUrl} className="max-h-[90vh] rounded-lg" />
                        ) : (
                            <video src={previewUrl} controls className="max-h-[90vh] rounded-lg" />
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}