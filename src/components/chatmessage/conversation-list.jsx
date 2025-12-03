"use client"

import { useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

export default function ConversationList({ conversations, selectedId, onSelect, currentUserId }) {
    const [searchQuery, setSearchQuery] = useState("")
    const { user } = useAuth()

    // Xác định dashboard path dựa trên role
    const getDashboardPath = () => {
        if (!user) return "/home"
        
        const rawRole = (user.user?.role || user.role)?.toUpperCase()
        const userRole = rawRole?.replace(/_/g, '')
        
        const redirectMap = {
            SYSTEMADMIN: '/admin/dashboard',
            ADMIN: '/admin/dashboard',
            CONTENTADMIN: '/content-admin/dashboard',
            SELLER: '/seller/dashboard',
            BUYER: '/home'
        }
        
        return redirectMap[userRole] || '/home'
    }

    const filteredConversations = conversations.filter((conv) => {
        const isBuyer = currentUserId === conv.buyerId
        const otherName = isBuyer ? conv.sellerName : conv.buyerName
        return otherName?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    })

    return (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Link to={getDashboardPath()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Quay lại">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">Tin nhắn</h1>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        Không tìm thấy cuộc trò chuyện nào.
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isBuyer = currentUserId === conv.buyerId;
                        const otherName = isBuyer ? conv.sellerName : conv.buyerName;
                        const otherAvatar = isBuyer ? conv.sellerAvatar : conv.buyerAvatar;
                        const unreadCount = isBuyer ? conv.unreadCountBuyer : conv.unreadCountSeller;

                        return (
                            <div
                                key={conv.conversationId}
                                onClick={() => onSelect(conv.conversationId)}
                                className={`px-4 py-3 cursor-pointer transition-colors ${selectedId === conv.conversationId ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-slate-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={otherAvatar || "/placeholder.svg"}
                                            alt={otherName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        {/* Online status indicator could go here */}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`text-sm font-semibold text-slate-900 truncate ${unreadCount > 0 ? "font-bold" : ""}`}>
                                                {otherName}
                                            </h3>
                                            <span className="text-xs text-slate-500 ml-2">
                                                {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-600"}`}>
                                            {conv.lastMessage}
                                        </p>
                                    </div>

                                    {/* Unread Badge */}
                                    {unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}