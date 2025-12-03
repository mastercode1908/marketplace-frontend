import axiosInstance from "../axiosInstance";

const chatApi = {
    // Get all conversations for the current user
    getConversations: () => {
        return axiosInstance.get("/chat/conversations");
    },

    // Get messages for a specific conversation
    getMessages: (conversationId) => {
        return axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
    },

    // Send a new message
    sendMessage: (payload) => {
        return axiosInstance.post(`/chat/messages/send`, payload);
    },

    // Create or get conversation with a specific user (e.g. from Product Page)
    startConversation: (receiverId) => {
        return axiosInstance.post(`/chat/conversations/start`, { receiverId });
    },

    // Mark messages as read
    markAsRead: (conversationId) => {
        return axiosInstance.put(`/chat/conversations/${conversationId}/read`);
    },



};

export default chatApi;
