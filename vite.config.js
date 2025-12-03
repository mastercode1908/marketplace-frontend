import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      process: "process/browser",
      buffer: "buffer",
    },
  },
  define: {
    global: "window",           // <--- QUAN TRỌNG: SockJS fix
    "process.env": {},          // <--- Cần cho stompjs / sockjs
  },
  server: {
    host: "0.0.0.0",            // Cho phép truy cập từ tunnel / LAN
    port: 5173,
    allowedHosts: [
      "separate-ringtone-missed-using.trycloudflare.com", // Cloudflare Tunnel URL
      // nếu muốn cho phép tất cả host, dùng: 'all'
    ],
  },
});
