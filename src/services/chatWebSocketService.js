import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class ChatWebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map(); // Map để lưu các subscription nếu cần
    }

    connect(onConnected, onError) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error("No token found for Chat WebSocket connection");
            return;
        }

        // Tạo client WebSocket riêng cho chat (endpoint /ws/chat)
        // SockJS không hỗ trợ header Authorization trong handshake, nên phải truyền qua query param
        this.client = new Client({
            webSocketFactory: () =>
                new SockJS(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}ws/chat?token=${token}`),
            connectHeaders: {
                // Vẫn giữ header này cho STOMP connect frame (nếu backend cần check lại ở level STOMP)
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Chat WebSocket connected:', frame);
            this.connected = true;
            if (onConnected) onConnected();
        };

        this.client.onStompError = (frame) => {
            console.error('Chat broker error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
            if (onError) onError(frame);
        };

        this.client.onWebSocketClose = () => {
            console.log("Chat WebSocket connection closed");
            this.connected = false;
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
            console.log("Chat WebSocket disconnected");
            // Hủy tất cả subscription khi disconnect
            this.subscriptions.forEach((sub) => sub.unsubscribe());
            this.subscriptions.clear();
        }
    }

    subscribe(topic, callback) {
        if (!this.client || !this.connected) {
            console.warn("Chat WebSocket not connected. Cannot subscribe to " + topic);
            return null;
        }

        // Nếu không truyền topic, mặc định subscribe tới /user/queue/messages
        const subscribeTopic = topic || '/user/queue/messages';

        const subscription = this.client.subscribe(subscribeTopic, (message) => {
            callback(JSON.parse(message.body));
        });

        // Lưu subscription vào Map để hủy sau này nếu muốn
        this.subscriptions.set(subscribeTopic, subscription);

        return subscription;
    }

    unsubscribe(topic) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
        }
    }

    sendMessage(payload) {
        if (!this.client || !this.connected) {
            console.warn("Chat WebSocket not connected. Cannot send message.");
            return;
        }

        // Gửi tới /app/chat.send (matching @MessageMapping trên backend)
        this.client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(payload)
        });
    }
}
const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;