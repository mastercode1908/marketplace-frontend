"use client"

import { useState, useEffect, useRef } from "react"
import ConversationList from "@/components/chatmessage/conversation-list"
import ChatDetail from "@/components/chatmessage/chat-detail"
import chatApi from "@/api/communication/chatApi"
import chatWebSocketService from "@/services/chatWebSocketService"

export default function ChatApp() {
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const selectedConversationRef = useRef(null)

    useEffect(() => {
        selectedConversationRef.current = selectedConversation
    }, [selectedConversation])

    useEffect(() => {
        // Lấy user từ localStorage
        const userStr = localStorage.getItem("user")
        if (userStr) {
            try {
                const authData = JSON.parse(userStr)
                // Handle nested user object (authData.user.id) or flat structure (authData.id)
                const userId = authData.user?.id || authData.id || authData.userId || authData.user?.userId
                console.log("ChatApp: Extracted currentUserId:", userId)
                setCurrentUserId(userId)
            } catch (e) {
                console.error("Error parsing user from localStorage", e)
            }
        }

        const fetchConversations = async () => {
            try {
                const response = await chatApi.getConversations()
                const data = response.data.data || []

                setConversations(data)

                // Auto chọn cuộc trò chuyện đầu tiên
                if (data.length > 0) {
                    setSelectedConversation(data[0].conversationId)
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [])

    // WebSocket Connection for Real-time Updates
    useEffect(() => {
        if (!currentUserId) return;

        chatWebSocketService.connect(() => {
            console.log("ChatApp: Connected to WebSocket")
            chatWebSocketService.subscribe('/user/queue/messages', (message) => {
                console.log("ChatApp: Received message", message)

                setConversations(prev => {
                    const existingConvIndex = prev.findIndex(c => c.conversationId === message.conversationId)

                    if (existingConvIndex !== -1) {
                        const updatedConv = { ...prev[existingConvIndex] }
                        updatedConv.lastMessage = message.messageType === "IMAGE" ? "Sent an image" :
                            message.messageType === "VIDEO" ? "Sent a video" :
                                message.messageType === "FILE" ? "Sent a file" :
                                    message.messageType === "RECALL" ? "Tin nhắn đã bị thu hồi" :
                                        message.content
                        updatedConv.lastMessageTime = message.sentAt

                        // Increment unread count if not currently selected
                        if (selectedConversationRef.current !== message.conversationId) {
                            if (currentUserId === updatedConv.buyerId) {
                                updatedConv.unreadCountBuyer = (updatedConv.unreadCountBuyer || 0) + 1
                            } else {
                                updatedConv.unreadCountSeller = (updatedConv.unreadCountSeller || 0) + 1
                            }
                        }

                        const newConvs = [...prev]
                        newConvs.splice(existingConvIndex, 1)
                        return [updatedConv, ...newConvs]
                    }
                    return prev
                })
            })
        })

        return () => {
            chatWebSocketService.disconnect()
        }
    }, [currentUserId])

    const handleConversationSelect = async (conversationId) => {
        setSelectedConversation(conversationId)

        // Mark as read API
        try {
            await chatApi.markAsRead(conversationId)

            // Update local state to reset unread count
            setConversations(prev => prev.map(conv => {
                if (conv.conversationId === conversationId) {
                    if (currentUserId === conv.buyerId) {
                        return { ...conv, unreadCountBuyer: 0 }
                    } else {
                        return { ...conv, unreadCountSeller: 0 }
                    }
                }
                return conv
            }))

            // Dispatch event to update unread count in header
            window.dispatchEvent(new CustomEvent('message-read'))
        } catch (error) {
            console.error("Failed to mark as read:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                Đang tải tin nhắn...
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50">
            {/* Danh sách conversation */}
            <ConversationList
                conversations={conversations}
                selectedId={selectedConversation}
                onSelect={handleConversationSelect}
                currentUserId={currentUserId}
            />

            {/* Chi tiết chat */}
            {selectedConversation ? (
                <ChatDetail
                    conversationId={selectedConversation}
                    conversations={conversations}
                    currentUserId={currentUserId}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                    Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                </div>
            )}
        </div>
    )
}
