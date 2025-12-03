import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export function useWebSocket(url, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const socketRef = useRef(null);
  const connectionAttemptsRef = useRef(0);
  const maxAttempts = 1; // Chỉ thử 1 lần

  useEffect(() => {
    if (!url) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No token available, skipping WebSocket connection");
      return;
    }

    if (connectionAttemptsRef.current >= maxAttempts) {
      return;
    }

    // SockJS yêu cầu http/https, không dùng ws/wss
    let httpUrl = url.replace(/^ws:/, "http:").replace(/^wss:/, "https:");
    connectionAttemptsRef.current += 1;

    try {
      const socket = new SockJS(httpUrl, null, {
        transports: ["websocket", "xhr-streaming", "xhr-polling"],
      });
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("SockJS connection opened");
      };

      socket.onerror = () => {
        console.warn(
          "SockJS connection error (401 may indicate backend requires authentication for /info endpoint). Notifications will still work via REST API."
        );
        connectionAttemptsRef.current = maxAttempts;
      };

      socket.onclose = (event) => {
        if (event.code === 1006 || event.code === 1002) {
          console.warn(
            "SockJS connection closed abnormally. Backend may require authentication for WebSocket endpoint. Notifications will still work via REST API."
          );
          connectionAttemptsRef.current = maxAttempts;
        }
      };

      const stompClient = Stomp.over(socket);
      stompClientRef.current = stompClient;
      stompClient.debug = () => {}; // tắt log STOMP

      // Kết nối STOMP với token trong header
      stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("STOMP connected");
          setIsConnected(true);
          connectionAttemptsRef.current = 0; // Reset on success

          // Subscribe vào queue notifications của user
          stompClient.subscribe("/user/queue/notifications", (msg) => {
            try {
              const data = JSON.parse(msg.body);
              if (onMessage) onMessage(data);
            } catch (error) {
              console.error("Error parsing STOMP message:", error);
            }
          });
        },
        (error) => {
          console.warn("STOMP connection error:", error);
          setIsConnected(false);
          const errorStr = error?.toString() || "";
          if (
            errorStr.includes("401") ||
            errorStr.includes("Unauthorized") ||
            errorStr.includes("Lost connection")
          ) {
            connectionAttemptsRef.current = maxAttempts;
            console.warn(
              "WebSocket connection failed. Notifications will still work via REST API."
            );
          }
        }
      );
    } catch (error) {
      console.warn("Error creating SockJS connection:", error);
      connectionAttemptsRef.current = maxAttempts;
    }

    return () => {
      const sc = stompClientRef.current;
      const sock = socketRef.current;

      if (sc && sc.connected) {
        try {
          sc.disconnect(() => {
            console.log("STOMP disconnected");
          });
        } catch (error) {
          console.warn("Error disconnecting STOMP:", error);
        }
      }

      if (sock) {
        try {
          sock.close();
        } catch (error) {
          console.warn("Error closing socket:", error);
        }
      }
    };
  }, [url, onMessage]);

  const sendMessage = (msg) => {
    const sc = stompClientRef.current;

    if (sc && sc.connected) {
      sc.send("/app/send", {}, JSON.stringify(msg));
    } else {
      console.warn("Cannot send message – STOMP not connected");
    }
  };

  return { isConnected, sendMessage };
}
